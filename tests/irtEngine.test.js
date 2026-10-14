import { describe, it, expect } from 'vitest';
import { scoreAssessmentDiagnostics } from '../src/services/psychometrics/irtEngine.js';
import { QUESTION_BANK, FUNCTION_KEYS } from '../src/data/questionBank.js';

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

  it('yielding high positive theta for aligned answers across all 8 functions', () => {
    // Test each function
    FUNCTION_KEYS.forEach(func => {
        // Get all items for this function
        const items = QUESTION_BANK.filter(i => i.functionKey === func);
        const answers = {};
        items.forEach(item => {
            if (item.reverseScored) {
                answers[item.id] = 1;
            } else {
                answers[item.id] = 5;
            }
        });

        const results = scoreAssessmentDiagnostics(QUESTION_BANK, answers, [func]);
        expect(results.thetaScores[func]).toBeGreaterThanOrEqual(2.0);
    });
  });



  it('normalizes continuous tradeoff values to 1-5 scale correctly', () => {
    const mockQuestionBank = [
      { id: '1', type: 'tradeoff', functionKey: 'Ti', parameters: { a: 1.5, b: [-1.5, -0.5, 0.5, 1.5] }, reverseScored: false },
      { id: '2', type: 'tradeoff', functionKey: 'Ti', parameters: { a: 1.5, b: [-1.5, -0.5, 0.5, 1.5] }, reverseScored: false },
      { id: '3', type: 'tradeoff', functionKey: 'Ti', parameters: { a: 1.5, b: [-1.5, -0.5, 0.5, 1.5] }, reverseScored: false }
    ];
    // 0 -> 1, 50 -> 3, 100 -> 5
    const answers = { '1': 0, '2': 50, '3': 100 };

    // We can just verify it doesn't crash and returns expected bounds,
    // but we can also mock computeEAPTheta to capture arguments if we wanted.
    // For now, since 0,50,100 map to 1,3,5 it should yield a specific theta, not 0.
    const results = scoreAssessmentDiagnostics(mockQuestionBank, answers, ['Ti']);

    // As long as it computed something reasonable instead of failing
    expect(results.thetaScores.Ti).not.toBeNaN();

    // We expect theta to be non-zero since it actually used the mapped values,
    // (with 1,3,5 responses to a properly discriminated item, it should yield a predictable theta)
    // Actually, [1, 3, 5] responses will balance out if parameters are symmetric, but it proves it worked.

    // Check that a single response of 50 yields category 3 (neutral)
    // For a neutral response to a single item, the theta should be close to 0.
    const neutralAnswers = { '1': 50 };
    const neutralResults = scoreAssessmentDiagnostics([mockQuestionBank[0]], neutralAnswers, ['Ti']);
    expect(neutralResults.thetaScores.Ti).toBeLessThan(0.5);
    expect(neutralResults.thetaScores.Ti).toBeGreaterThan(-0.5);
  });
});
