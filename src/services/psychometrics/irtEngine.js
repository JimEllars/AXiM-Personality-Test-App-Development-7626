const QUADRATURE_NODES = 41;
const X_MIN = -4;
const X_MAX = 4;

function getQuadratureGrid() {
  const step = (X_MAX - X_MIN) / (QUADRATURE_NODES - 1);
  const nodes = [];
  const logWeights = [];

  for (let index = 0; index < QUADRATURE_NODES; index += 1) {
    const x = X_MIN + index * step;
    nodes.push(x);
    logWeights.push(
      -0.5 * x * x -
        Math.log(Math.sqrt(2 * Math.PI)) +
        Math.log(step)
    );
  }

  return { nodes, logWeights };
}

function responseProbability(category, theta, { a, b }) {
  const pStar = (threshold) =>
    1 / (1 + Math.exp(-a * (theta - threshold)));

  if (category === 1) return 1 - pStar(b[0]);
  if (category === 2) return pStar(b[0]) - pStar(b[1]);
  if (category === 3) return pStar(b[1]) - pStar(b[2]);
  if (category === 4) return pStar(b[2]) - pStar(b[3]);
  if (category === 5) return pStar(b[3]);
  return 0.2;
}

export function computeEAPTheta(responses) {
  const { nodes, logWeights } = getQuadratureGrid();

  const logPosteriors = nodes.map((theta, index) => {
    const logLikelihood = responses.reduce((sum, { item, value }) => {
      const category = item.reverseScored ? 6 - value : value;
      const probability = Math.max(
        responseProbability(category, theta, item.parameters),
        Number.EPSILON
      );

      return sum + Math.log(probability);
    }, 0);

    return logLikelihood + logWeights[index];
  });

  const maxLog = Math.max(...logPosteriors);
  const posteriors = logPosteriors.map((value) =>
    Math.exp(value - maxLog)
  );
  const denominator = posteriors.reduce((sum, value) => sum + value, 0);

  const theta =
    posteriors.reduce(
      (sum, posterior, index) => sum + nodes[index] * posterior,
      0
    ) / denominator;

  const variance =
    posteriors.reduce(
      (sum, posterior, index) =>
        sum + Math.pow(nodes[index] - theta, 2) * posterior,
      0
    ) / denominator;

  return {
    theta: Number(theta.toFixed(3)),
    sem: Number(Math.sqrt(variance).toFixed(3))
  };
}

export function scoreAssessmentDiagnostics(items, answers, functionKeys) {
  const thetaScores = {};
  const semScores = {};
  let answeredCount = 0;

  functionKeys.forEach((functionKey) => {
    const responses = items
      .filter((item) => item.functionKey === functionKey)
      .map((item) => ({
        item,
        value: answers[item.id]
      }))
      .filter(({ value }) => Number.isInteger(value));

    answeredCount += responses.length;

    const estimate = computeEAPTheta(responses);
    thetaScores[functionKey] = estimate.theta;
    semScores[functionKey] = estimate.sem;
  });

  const semValues = Object.values(semScores).filter(Number.isFinite);
  const averageSem = semValues.length
    ? Number(
        (
          semValues.reduce((sum, value) => sum + value, 0) / semValues.length
        ).toFixed(3)
      )
    : 0;

  return {
    thetaScores,
    semScores,
    answeredCount,
    totalItems: items.length,
    coverage: items.length ? answeredCount / items.length : 0,
    averageSem
  };
}

export function scoreAssessment(items, answers, functionKeys) {
  return scoreAssessmentDiagnostics(items, answers, functionKeys).thetaScores;
}