import { describe, it, expect } from 'vitest';
import { scoreAssessmentDiagnostics } from '../src/services/psychometrics/irtEngine.js';

describe('irtEngine', () => {
  it('EAP should yield valid ranges', () => {
    const mockQuestionBank = [
      { id: '1', functionKey: 'Ti', parameters: { a: 1.5, b: [-1.5, -0.5, 0.5, 1.5] }, reverseScored: false }
    ];
    const answers = { '1': 5 }; // Strongly agree
    const functionKeys = ['Ti'];

    const results = scoreAssessmentDiagnostics(mockQuestionBank, answers, functionKeys);

    expect(results.thetaScores.Ti).toBeGreaterThan(0);
    expect(results.thetaScores.Ti).toBeLessThanOrEqual(3.5);
  });

  it('reverse coded items should invert values accurately', () => {
    const mockQuestionBank = [
      { id: '1', functionKey: 'Te', parameters: { a: 1.5, b: [-1.5, -0.5, 0.5, 1.5] }, reverseScored: true }
    ];
    // Giving a 1 on a reverse-coded item is like giving a 5 on a normal item
    const answers = { '1': 1 };
    const functionKeys = ['Te'];

    const results = scoreAssessmentDiagnostics(mockQuestionBank, answers, functionKeys);

    expect(results.thetaScores.Te).toBeGreaterThan(0);
  });
});
