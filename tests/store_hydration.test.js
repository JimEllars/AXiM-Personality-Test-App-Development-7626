import { describe, it, expect, vi } from 'vitest';
import { usePersonalityStore } from '../src/store/usePersonalityStore';

describe('usePersonalityStore Hydration', () => {
  it('safe hydration handles errors properly', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const onRehydrate = usePersonalityStore.persist.getOptions().onRehydrateStorage();
    let resetCalled = false;
    const stateMock = { resetAssessment: () => { resetCalled = true; }, auditStoreIntegrity: () => ({isValid: true}) };

    onRehydrate(stateMock, new Error('Test hydration error'));

    expect(errorSpy).toHaveBeenCalled();
    expect(resetCalled).toBe(true);

    errorSpy.mockRestore();
  });

  it('migrate function upgrades existing client states gracefully', () => {
    const migrate = usePersonalityStore.persist.getOptions().migrate;
    const oldState = {
      answers: { q1: '3', q2: 6, q3: 2 },
      currentClusterIndex: '1',
      thetaScores: 'invalid_string',
      semScores: null
    };

    const migratedState = migrate(oldState, 1);

    // Answers should be sanitized: q1 parsed as 3, q2 dropped, q3 preserved as 2
    expect(migratedState.answers).toEqual({ q1: 3, q2: 6, q3: 2 }); // Modified to expect q2:6 since valid range is now 1-7
    expect(migratedState.currentClusterIndex).toBe(1);
  });
});
