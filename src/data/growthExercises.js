const EXERCISE_LIBRARY = {
  Ti: {
    focus: 'Analytical precision',
    exercises: [
      {
        title: 'Assumption audit',
        duration: '8 min',
        prompt: 'Choose one belief behind a current decision. Write the assumption, the evidence supporting it, and one observation that could change your mind.',
        action: 'Separate what you know from what you are inferring.'
      },
      {
        title: 'Explain it three ways',
        duration: '10 min',
        prompt: 'Take a concept you understand and explain it to a beginner, a peer, and a skeptical reviewer.',
        action: 'Notice which definitions stay precise across every audience.'
      }
    ]
  },
  Te: {
    focus: 'Objective execution',
    exercises: [
      {
        title: 'Outcome to ownership',
        duration: '7 min',
        prompt: 'Write one desired outcome for this week. Break it into three observable actions and assign a clear completion signal to each.',
        action: 'Turn intention into a visible next step.'
      },
      {
        title: 'Decision scorecard',
        duration: '10 min',
        prompt: 'List two options for a real decision. Score each from 1–5 for impact, effort, reversibility, and evidence.',
        action: 'Use explicit criteria instead of relying on urgency alone.'
      }
    ]
  },
  Fi: {
    focus: 'Inner alignment',
    exercises: [
      {
        title: 'Values in motion',
        duration: '8 min',
        prompt: 'Name one value you want to express today. Describe one small behavior that would make that value visible.',
        action: 'Translate personal meaning into a practical choice.'
      },
      {
        title: 'Authenticity boundary',
        duration: '6 min',
        prompt: 'Identify a situation where you regularly say yes while feeling misaligned. Draft a respectful alternative response.',
        action: 'Practice protecting your values without judging someone else’s.'
      }
    ]
  },
  Fe: {
    focus: 'Social attunement',
    exercises: [
      {
        title: 'Temperature check',
        duration: '5 min',
        prompt: 'During your next conversation, notice the other person’s pace, tone, and energy before deciding what to say next.',
        action: 'Respond to the emotional context, not only the literal words.'
      },
      {
        title: 'Common ground map',
        duration: '10 min',
        prompt: 'Choose a disagreement and write one concern you share with the other person before explaining your own position.',
        action: 'Lead with connection before attempting persuasion.'
      }
    ]
  },
  Ni: {
    focus: 'Convergent insight',
    exercises: [
      {
        title: 'Signal to trajectory',
        duration: '10 min',
        prompt: 'Collect three observations from a project or relationship. Write the single pattern they may point toward and one alternative interpretation.',
        action: 'Balance insight with a deliberate check against overconfidence.'
      },
      {
        title: 'Future-back plan',
        duration: '12 min',
        prompt: 'Imagine a meaningful result six months from now. Work backward and list the three milestones that must happen first.',
        action: 'Give a long-range vision a sequence of near-term moves.'
      }
    ]
  },
  Ne: {
    focus: 'Expansive ideation',
    exercises: [
      {
        title: 'Ten alternate uses',
        duration: '8 min',
        prompt: 'Pick a routine, tool, or constraint in your life and generate ten unexpected ways to use or reinterpret it.',
        action: 'Keep ideas flowing before evaluating them.'
      },
      {
        title: 'Option to experiment',
        duration: '10 min',
        prompt: 'Choose one exciting possibility and design the smallest experiment that could test it within 48 hours.',
        action: 'Convert possibility into evidence without losing curiosity.'
      }
    ]
  },
  Si: {
    focus: 'Experiential recall',
    exercises: [
      {
        title: 'Reliable pattern',
        duration: '8 min',
        prompt: 'Recall a time a similar challenge went well. List the conditions, sequence, and habits that contributed to the outcome.',
        action: 'Reuse proven knowledge without becoming trapped by precedent.'
      },
      {
        title: 'One safe variation',
        duration: '6 min',
        prompt: 'Choose a familiar routine and change one low-risk element while keeping the rest constant.',
        action: 'Build flexibility through controlled novelty.'
      }
    ]
  },
  Se: {
    focus: 'Present awareness',
    exercises: [
      {
        title: 'Sensory reset',
        duration: '5 min',
        prompt: 'Pause and name five things you see, four you feel, three you hear, two you smell, and one you taste.',
        action: 'Return attention from prediction or rumination to immediate experience.'
      },
      {
        title: 'Fast feedback loop',
        duration: '8 min',
        prompt: 'Choose a small task and act for five minutes without over-planning. Review what changed in the environment and adapt once.',
        action: 'Let real-time information improve the next move.'
      }
    ]
  }
};

export function getPersonalizedExercises(thetaScores = {}) {
  const ranked = Object.entries(thetaScores)
    .sort(([, first], [, second]) => second - first)
    .map(([key]) => key);

  const strongest = ranked[0] || 'Ne';
  const developing = ranked[ranked.length - 1] || 'Si';
  const keys = strongest === developing
    ? [strongest]
    : [strongest, developing];

  return keys.flatMap((key, groupIndex) =>
    (EXERCISE_LIBRARY[key]?.exercises || []).map((exercise, index) => ({
      ...exercise,
      id: `${key}-${index + 1}`,
      functionKey: key,
      focus: EXERCISE_LIBRARY[key].focus,
      track: groupIndex === 0 ? 'Natural strength' : 'Growth edge'
    }))
  );
}