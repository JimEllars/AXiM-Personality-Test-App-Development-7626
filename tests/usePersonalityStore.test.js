import { describe, it, expect, beforeEach } from 'vitest';
import { usePersonalityStore } from '../src/store/usePersonalityStore';

describe('usePersonalityStore', () => {
  beforeEach(() => {
    usePersonalityStore.setState({
      screen: 'intro',
      currentClusterIndex: 0,
      answers: {},
      pendingSync: []
    });
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
});
