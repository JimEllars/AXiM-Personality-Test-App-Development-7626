import { describe, it, expect } from 'vitest';
import { projectArchetype, ARCHETYPE_REFERENCE_VECTORS } from '../src/services/psychometrics/archetypeProjector.js';

describe('archetypeProjector', () => {
  it('archetype projection returns highest similarity for known benchmark profiles', () => {
    // We mock a perfect theta score for INTJ
    const intjVector = ARCHETYPE_REFERENCE_VECTORS['INTJ'];
    const result = projectArchetype(intjVector);

    expect(result.archetype).toBe('INTJ');
    expect(result.confidence).toBeGreaterThan(0.9); // Should be very close to 1
  });
});
