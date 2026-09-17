import { describe, it, expect, vi } from 'vitest';
import { usePersonalityStore } from '../src/store/usePersonalityStore';

describe('usePersonalityStore Hydration', () => {
  it('safe hydration handles errors properly', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Attempt to invoke the onRehydrateStorage callback with an error
    const onRehydrate = usePersonalityStore.persist.getOptions().onRehydrateStorage();
    let resetCalled = false;
    const stateMock = { resetAssessment: () => { resetCalled = true; } };

    onRehydrate(stateMock, new Error('Test hydration error'));

    expect(errorSpy).toHaveBeenCalled();
    expect(resetCalled).toBe(true);

    errorSpy.mockRestore();
  });
});
