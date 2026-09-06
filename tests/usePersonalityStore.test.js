import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePersonalityStore } from '../src/store/usePersonalityStore';
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
    usePersonalityStore.getState().finalizeAssessment();

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

  it('handles result generation with partial/irregular answer payloads', () => {
    usePersonalityStore.setState({ answers: { 'q1': null, 'q2': undefined, 'q3': 3 }, screen: 'assessment' });

    usePersonalityStore.getState().finalizeAssessment();

    const state = usePersonalityStore.getState();
    expect(state.screen).toBe('results');
    expect(state.assignedArchetype).toBeTruthy();
  });
});
