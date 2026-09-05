export const ARCHETYPE_REFERENCE_VECTORS = {
  INFP: { Fi: 1, Ne: 0.65, Si: 0.25, Te: -0.4, Fe: 0.1, Ni: 0.1, Se: -0.2, Ti: -0.1 },
  INFJ: { Ni: 1, Fe: 0.65, Ti: 0.25, Se: -0.4, Ne: 0.1, Fi: 0.1, Te: -0.1, Si: -0.2 },
  INTP: { Ti: 1, Ne: 0.65, Si: 0.25, Fe: -0.4, Te: 0.1, Ni: 0.1, Se: -0.2, Fi: -0.1 },
  INTJ: { Ni: 1, Te: 0.65, Fi: 0.25, Se: -0.4, Ne: 0.1, Ti: 0.1, Fe: -0.1, Si: -0.2 },
  ISFP: { Fi: 1, Se: 0.65, Ni: 0.25, Te: -0.4, Fe: 0.1, Si: 0.1, Ne: -0.2, Ti: -0.1 },
  ISFJ: { Si: 1, Fe: 0.65, Ti: 0.25, Ne: -0.4, Se: 0.1, Fi: 0.1, Te: -0.1, Ni: -0.2 },
  ISTP: { Ti: 1, Se: 0.65, Ni: 0.25, Fe: -0.4, Te: 0.1, Si: 0.1, Ne: -0.2, Fi: -0.1 },
  ISTJ: { Si: 1, Te: 0.65, Fi: 0.25, Ne: -0.4, Se: 0.1, Ti: 0.1, Fe: -0.1, Ni: -0.2 },
  ENFP: { Ne: 1, Fi: 0.65, Te: 0.25, Si: -0.4, Ni: 0.1, Fe: 0.1, Ti: -0.1, Se: -0.2 },
  ENFJ: { Fe: 1, Ni: 0.65, Se: 0.25, Ti: -0.4, Fi: 0.1, Ne: 0.1, Si: -0.2, Te: -0.1 },
  ENTP: { Ne: 1, Ti: 0.65, Fe: 0.25, Si: -0.4, Ni: 0.1, Te: 0.1, Fi: -0.1, Se: -0.2 },
  ENTJ: { Te: 1, Ni: 0.65, Se: 0.25, Fi: -0.4, Ti: 0.1, Ne: 0.1, Si: -0.2, Fe: -0.1 },
  ESFP: { Se: 1, Fi: 0.65, Te: 0.25, Ni: -0.4, Si: 0.1, Fe: 0.1, Ti: -0.1, Ne: -0.2 },
  ESFJ: { Fe: 1, Si: 0.65, Ne: 0.25, Ti: -0.4, Fi: 0.1, Se: 0.1, Te: -0.1, Ni: -0.2 },
  ESTP: { Se: 1, Ti: 0.65, Fe: 0.25, Ni: -0.4, Si: 0.1, Te: 0.1, Fi: -0.1, Ne: -0.2 },
  ESTJ: { Te: 1, Si: 0.65, Ne: 0.25, Fi: -0.4, Ti: 0.1, Se: 0.1, Fe: -0.1, Ni: -0.2 }
};

export function projectArchetype(thetaScores) {
  const ranking = Object.entries(ARCHETYPE_REFERENCE_VECTORS).map(
    ([archetype, reference]) => {
      let dotProduct = 0;
      let userNorm = 0;
      let referenceNorm = 0;

      Object.entries(reference).forEach(([key, value]) => {
        const userValue = thetaScores[key] || 0;
        dotProduct += userValue * value;
        userNorm += userValue * userValue;
        referenceNorm += value * value;
      });

      const similarity = userNorm && referenceNorm
        ? dotProduct / (Math.sqrt(userNorm) * Math.sqrt(referenceNorm))
        : 0;

      return { archetype, similarity: Number(similarity.toFixed(4)) };
    }
  );

  ranking.sort((a, b) => b.similarity - a.similarity);

  return {
    archetype: ranking[0].archetype,
    confidence: ranking[0].similarity,
    proximityRanking: ranking.slice(0, 5)
  };
}