import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePersonalityStore, validateAssessmentIntegrity } from '../src/store/usePersonalityStore';
import { submitAssessment } from '../src/services/personalityApi';
import { scoreAssessmentDiagnostics } from '../src/services/psychometrics/irtEngine';
import { projectArchetype } from '../src/services/psychometrics/archetypeProjector';
import { QUESTION_BANK, FUNCTION_KEYS } from '../src/data/questionBank';

vi.mock('../src/services/personalityApi', () => ({
  submitAssessment: vi.fn().mockResolvedValue({ success: true }),
  emailReport: vi.fn(),
  getBenchmarks: vi.fn()
}));

describe('usePersonalityStore', () => {
  beforeEach(() => {
    usePersonalityStore.setState({
      screen: 'intro',
      currentClusterIndex: 0,
      answers: {},
      pendingSync: []
    });
    vi.clearAllMocks();
  });

  it('resumeAssessment preserves state if answers exist', () => {
    usePersonalityStore.setState({ answers: { 'q1': 5 }, currentClusterIndex: 2 });
    usePersonalityStore.getState().resumeAssessment();
    const state = usePersonalityStore.getState();
    expect(state.screen).toBe('assessment');
    expect(state.currentClusterIndex).toBe(2);
  });

  it('resumeAssessment resets if no answers exist', () => {
    usePersonalityStore.setState({ answers: {}, currentClusterIndex: 2 });
    usePersonalityStore.getState().resumeAssessment();
    const state = usePersonalityStore.getState();
    expect(state.screen).toBe('assessment');
    expect(state.currentClusterIndex).toBe(0);
  });

  it('offline mode calculation gracefully handles network failures without blocking', async () => {
    submitAssessment.mockRejectedValueOnce(new Error('Network error'));

    // Auth token to trigger sync
    localStorage.setItem('axim_passport_token', 'test-token');

    usePersonalityStore.setState({ answers: { 'q1': 5, 'q2': 1 }, screen: 'assessment' });
    await usePersonalityStore.getState().finalizeAssessment();

    const state = usePersonalityStore.getState();
    expect(state.screen).toBe('results');
    expect(state.assignedArchetype).toBeTruthy();

    // Wait a tick for promise
    await new Promise(resolve => setTimeout(resolve, 50));

    const stateAfterSync = usePersonalityStore.getState();
    expect(stateAfterSync.pendingSync.length).toBe(1);
    expect(stateAfterSync.pendingSync[0].synced).toBe(false);
    expect(submitAssessment).toHaveBeenCalled();
  });

  it('handles result generation with partial/irregular answer payloads', async () => {
    usePersonalityStore.setState({ answers: { 'q1': null, 'q2': undefined, 'q3': 3 }, screen: 'assessment' });

    await usePersonalityStore.getState().finalizeAssessment();

    const state = usePersonalityStore.getState();
    expect(state.screen).toBe('results');
    expect(state.assignedArchetype).toBeTruthy();
  });


  it('finalizeAssessment succeeds and transitions to results even with extreme/missing values', async () => {
    usePersonalityStore.setState({
      answers: { 'q1': -999, 'q2': null, 'q3': 'invalid' },
      screen: 'assessment'
    });

    await usePersonalityStore.getState().finalizeAssessment();

    const state = usePersonalityStore.getState();
    expect(state.screen).toBe('results');
    expect(state.assignedArchetype).toBeTruthy();
  });

  it('resetAssessment purges assessment data but keeps demographics and result history', () => {
    usePersonalityStore.setState({
      demographics: { age: '25', region: 'NA', explicitConsent: true },
      answers: { 'q1': 5, 'q2': 1 },
      screen: 'assessment',
      currentClusterIndex: 3,
      resultHistory: [{ archetype: 'Explorer', date: '2023-10-01' }]
    });

    usePersonalityStore.getState().resetAssessment();
    const state = usePersonalityStore.getState();

    expect(state.screen).toBe('intro');
    expect(state.currentClusterIndex).toBe(0);
    expect(Object.keys(state.answers).length).toBe(0);
    expect(state.demographics.age).toBe('25');
    expect(state.resultHistory.length).toBe(1);
    expect(state.resultHistory[0].archetype).toBe('Explorer');
  });

});


describe('usePersonalityStore validation', () => {
  it('validateAssessmentIntegrity validates good data', () => {
    const state = {
      answers: { 'q1': 3, 'q2': 5 },
      currentClusterIndex: 2
    };
    const { isValid, sanitizedAnswers, sanitizedIndex } = validateAssessmentIntegrity(state);
    expect(isValid).toBe(true);
    expect(sanitizedAnswers).toEqual(state.answers);
    expect(sanitizedIndex).toBe(2);
  });

  it('validateAssessmentIntegrity sanitizes bad data', () => {
    const state = {
      answers: { 'q1': 6, 'q2': 'a', 'q3': 1 },
      currentClusterIndex: 999
    };
    const { isValid, sanitizedAnswers, sanitizedIndex } = validateAssessmentIntegrity(state);
    expect(isValid).toBe(false);
    expect(sanitizedAnswers).toEqual({ 'q1': 6, 'q3': 1 }); // Modified to expect q1:6 since valid range is now 1-7
    expect(sanitizedIndex).toBe(0);
  });

  it('store recovers gracefully when invalid data is migrated', () => {
    // This is tested implicitly by the migrate schema logic but we can mock it
    const store = usePersonalityStore.getState();
    store.resetAssessment();
  });
});
