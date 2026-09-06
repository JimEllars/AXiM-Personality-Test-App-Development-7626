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

  it('handles extreme response patterns safely', () => {
    const mockQuestionBank = [
      { id: '1', functionKey: 'Ti', parameters: { a: 1.5, b: [-1.5, -0.5, 0.5, 1.5] }, reverseScored: false },
      { id: '2', functionKey: 'Ti', parameters: { a: 1.5, b: [-1.5, -0.5, 0.5, 1.5] }, reverseScored: false }
    ];

    // Extreme all 5s
    const answersMax = { '1': 5, '2': 5 };
    const resultsMax = scoreAssessmentDiagnostics(mockQuestionBank, answersMax, ['Ti']);
    expect(resultsMax.thetaScores.Ti).toBeGreaterThan(0);
    expect(resultsMax.thetaScores.Ti).toBeLessThanOrEqual(4.0); // Within reasonable bounds

    // Extreme all 1s
    const answersMin = { '1': 1, '2': 1 };
    const resultsMin = scoreAssessmentDiagnostics(mockQuestionBank, answersMin, ['Ti']);
    expect(resultsMin.thetaScores.Ti).toBeLessThan(0);
    expect(resultsMin.thetaScores.Ti).toBeGreaterThanOrEqual(-4.0); // Within reasonable bounds
  });
