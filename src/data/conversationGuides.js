import { FUNCTION_NAMES } from './archetypes';

const GUIDE_MODES = {
  explain: {
    label: 'Explain your profile',
    icon: 'FiMessageCircle',
    prompts: [
      'My closest cognitive archetype is {archetype}. I tend to process information through {strongestName}.',
      'One part of this profile that feels accurate is {archetype} because…',
      'A useful way to understand my profile is to notice how I approach decisions, ideas, and relationships.'
    ]
  },
  discuss: {
    label: 'Start a discussion',
    icon: 'FiUsers',
    prompts: [
      'Which part of this profile feels most familiar to you?',
      'Do you notice me using {strongestKey} — {strongestName} — in everyday situations?',
      'Where do you think my natural strengths help me, and where might they create blind spots?'
    ]
  },
  reflect: {
    label: 'Reflect privately',
    icon: 'FiEdit3',
    prompts: [
      'When does {strongestName} feel most natural to me?',
      'What kind of environment helps this part of my profile work well?',
      'What is one situation where I could practice a less familiar way of responding?'
    ]
  }
};

export function getConversationGuide(archetype, thetaScores = {}) {
  const strongest = Object.entries(thetaScores)
    .filter(([, value]) => Number.isFinite(value))
    .sort(([, first], [, second]) => second - first)[0]?.[0] || 'Ne';

  const strongestName = FUNCTION_NAMES[strongest] || 'cognitive flexibility';

  return Object.fromEntries(
    Object.entries(GUIDE_MODES).map(([mode, guide]) => [
      mode,
      {
        ...guide,
        prompts: guide.prompts.map((prompt) =>
          prompt
            .replaceAll('{archetype}', archetype || 'my profile')
            .replaceAll('{strongestKey}', strongest)
            .replaceAll('{strongestName}', strongestName)
        )
      }
    ])
  );
}