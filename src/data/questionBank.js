export const thresholds = [-1.82, -0.74, 0.65, 1.78];

const createItem = (functionKey, number, itemData) => ({
  id: `${functionKey.toLowerCase()}_${String(number).padStart(2, '0')}`,
  functionKey,
  type: itemData.type,
  prompt: itemData.prompt,
  context: itemData.context || '',
  options: itemData.options || {},
  reverseScored: itemData.reverseScored,
  parameters: { a: itemData.a, b: thresholds }
});

const definitions = {
  Ti: [
    { type: 'scenario', prompt: 'You encounter a complex puzzle blocking your path.', context: 'You need to get through a locked door.', options: { left: 'Try random combinations quickly', right: 'Analyze the mechanism completely first' }, reverseScored: false, a: 1.45 },
    { type: 'scenario', prompt: 'A friend explains a new conspiracy theory to you.', context: 'They are very passionate about it.', options: { left: 'Nod along to be supportive', right: 'Point out the logical holes immediately' }, reverseScored: false, a: 1.38 },
    { type: 'tradeoff', prompt: 'When learning something new...', options: { left: 'I want the quick summary', right: 'I need the exact definitions' }, reverseScored: false, a: 1.25 },
    { type: 'tradeoff', prompt: 'When listening to an argument...', options: { left: 'I care if it sounds good', right: 'I care if the logic is perfectly sound' }, reverseScored: true, a: 1.30 }, // reverseScored to balance
    { type: 'reaction', prompt: 'Someone says "It just works, do not overthink it!"', context: '', options: { choices: [{ label: 'Accept it', description: 'Move on', value: 1 }, { label: 'Question it', description: 'Figure out WHY it works', value: 5 }] }, reverseScored: true, a: 1.52 },
    { type: 'reaction', prompt: 'You find a contradiction in a textbook.', context: '', options: { choices: [{ label: 'Ignore it', description: 'Probably a typo', value: 1 }, { label: 'Investigate', description: 'Test if the rule is broken', value: 5 }] }, reverseScored: false, a: 1.41 },
    { type: 'likert', prompt: 'I easily change my mind when presented with stronger logic.', context: '', reverseScored: false, a: 1.34 },
    { type: 'likert', prompt: 'Over-analyzing things is usually a waste of time.', context: '', reverseScored: true, a: 1.37 }
  ],
  Te: [
    { type: 'scenario', prompt: 'Your group project is drifting off track.', context: 'Everyone is chatting and not working.', options: { left: 'Let them vent', right: 'Take charge and assign tasks' }, reverseScored: false, a: 1.40 },
    { type: 'scenario', prompt: 'You have a mountain of chores to do.', context: 'The house is a mess.', options: { left: 'Start randomly', right: 'Make a highly efficient checklist' }, reverseScored: false, a: 1.55 },
    { type: 'tradeoff', prompt: 'When making a decision...', options: { left: 'I debate the theory endlessly', right: 'I look at objective data' }, reverseScored: false, a: 1.28 },
    { type: 'tradeoff', prompt: 'When things get chaotic...', options: { left: 'I go with the flow', right: 'I enforce structure and order' }, reverseScored: true, a: 1.34 },
    { type: 'reaction', prompt: 'A deadline is approaching but the group lacks consensus.', context: '', options: { choices: [{ label: 'Delay', description: 'Wait for everyone to agree', value: 1 }, { label: 'Execute', description: 'Make a call and move forward', value: 5 }] }, reverseScored: true, a: 1.48 },
    { type: 'reaction', prompt: 'Someone presents a beautiful but impractical idea.', context: '', options: { choices: [{ label: 'Praise it', description: 'Focus on the creativity', value: 1 }, { label: 'Critique it', description: 'Ask how it will actually work', value: 5 }] }, reverseScored: false, a: 1.43 },
    { type: 'likert', prompt: 'I measure success by concrete, observable results.', context: '', reverseScored: false, a: 1.36 },
    { type: 'likert', prompt: 'I avoid setting firm priorities when I have many things to do.', context: '', reverseScored: true, a: 1.39 }
  ],
  Fi: [
    { type: 'scenario', prompt: 'Everyone in your friend group loves a movie you hate.', context: 'They ask your opinion.', options: { left: 'Agree to fit in', right: 'Stay true to how you really feel' }, reverseScored: false, a: 1.60 },
    { type: 'scenario', prompt: 'You are offered a high-paying job that goes against your morals.', context: 'The money is very tempting.', options: { left: 'Take the money', right: 'Turn it down instantly' }, reverseScored: false, a: 1.42 },
    { type: 'tradeoff', prompt: 'I value things based on...', options: { left: 'Social status and popularity', right: 'Personal meaning and authenticity' }, reverseScored: false, a: 1.35 },
    { type: 'tradeoff', prompt: 'My principles are...', options: { left: 'Flexible based on the situation', right: 'Deeply held and unchanging' }, reverseScored: true, a: 1.58 },
    { type: 'reaction', prompt: 'Someone acts fake to impress others.', context: '', options: { choices: [{ label: 'Understand', description: 'Everyone does it', value: 1 }, { label: 'Cringe', description: 'It feels instantly wrong in my gut', value: 5 }] }, reverseScored: true, a: 1.44 },
    { type: 'reaction', prompt: 'You have to make a major life choice.', context: '', options: { choices: [{ label: 'Ask others', description: 'See what friends think', value: 1 }, { label: 'Look inward', description: 'Consult my core values', value: 5 }] }, reverseScored: false, a: 1.47 },
    { type: 'likert', prompt: 'I will protect my individuality even if it makes me unpopular.', context: '', reverseScored: false, a: 1.39 },
    { type: 'likert', prompt: 'Finding deep personal meaning in my goals is rarely important.', context: '', reverseScored: true, a: 1.41 }
  ],
  Fe: [
    { type: 'scenario', prompt: 'Two of your friends start arguing at a party.', context: 'The vibe is getting ruined.', options: { left: 'Let them fight it out', right: 'Step in to mediate and smooth things over' }, reverseScored: false, a: 1.50 },
    { type: 'scenario', prompt: 'You notice someone looking left out in a group.', context: 'Everyone else is chatting.', options: { left: 'Ignore it, not my problem', right: 'Change the subject to include them' }, reverseScored: false, a: 1.41 },
    { type: 'tradeoff', prompt: 'My focus in a group is...', options: { left: 'Getting my own point across', right: 'Making sure everyone feels comfortable' }, reverseScored: false, a: 1.32 },
    { type: 'tradeoff', prompt: 'When someone is upset...', options: { left: 'I barely notice', right: 'I instantly pick up on the awkward tension' }, reverseScored: true, a: 1.47 },
    { type: 'reaction', prompt: 'You have to deliver bad news.', context: '', options: { choices: [{ label: 'Be blunt', description: 'Just say the facts', value: 1 }, { label: 'Soften it', description: 'Adjust my tone carefully', value: 5 }] }, reverseScored: true, a: 1.62 },
    { type: 'reaction', prompt: 'The group cannot decide where to eat.', context: '', options: { choices: [{ label: 'Demand', description: 'I want pizza', value: 1 }, { label: 'Compromise', description: 'Find common ground for all', value: 5 }] }, reverseScored: false, a: 1.45 },
    { type: 'likert', prompt: 'I always consider how my decisions will affect the group emotionally.', context: '', reverseScored: false, a: 1.38 },
    { type: 'likert', prompt: 'Adapting my communication style for others feels like a waste of time.', context: '', reverseScored: true, a: 1.43 }
  ],
  Ni: [
    { type: 'scenario', prompt: 'You are starting a new complex project.', context: 'The details are murky.', options: { left: 'Focus on immediate tasks', right: 'Obsess over the long-term vision' }, reverseScored: false, a: 1.55 },
    { type: 'scenario', prompt: 'You are analyzing a current event.', context: 'The news is chaotic.', options: { left: 'Look at the surface facts', right: 'Search for the hidden underlying trajectory' }, reverseScored: false, a: 1.48 },
    { type: 'tradeoff', prompt: 'I prefer to...', options: { left: 'Deal with obvious, present circumstances', right: 'Anticipate future outcomes via sudden insights' }, reverseScored: false, a: 1.33 },
    { type: 'tradeoff', prompt: 'My goals are usually...', options: { left: 'Scattered and changing', right: 'A single, unifying vision' }, reverseScored: true, a: 1.39 },
    { type: 'reaction', prompt: 'Someone asks you where you see yourself in 10 years.', context: '', options: { choices: [{ label: 'No idea', description: 'That is too far away', value: 1 }, { label: 'Clear picture', description: 'I have a strong gut feeling', value: 5 }] }, reverseScored: true, a: 1.51 },
    { type: 'reaction', prompt: 'You get a sudden "aha!" moment about a problem.', context: '', options: { choices: [{ label: 'Doubt it', description: 'Need more data', value: 1 }, { label: 'Trust it', description: 'The direction is clear before the details', value: 5 }] }, reverseScored: false, a: 1.46 },
    { type: 'likert', prompt: 'I naturally condense many complex signals into one simple interpretation.', context: '', reverseScored: false, a: 1.37 },
    { type: 'likert', prompt: 'I rarely try to look for deeper patterns behind everyday events.', context: '', reverseScored: true, a: 1.42 }
  ],
  Ne: [
    { type: 'scenario', prompt: 'You are trying to solve a tough problem.', context: 'You are stuck.', options: { left: 'Stick to the proven method', right: 'Brainstorm 10 wild alternative ideas' }, reverseScored: false, a: 1.58 },
    { type: 'scenario', prompt: 'You are given a totally open-ended assignment.', context: 'No rules.', options: { left: 'Feel paralyzed', right: 'Get energized by the possibilities' }, reverseScored: false, a: 1.44 },
    { type: 'tradeoff', prompt: 'I prefer...', options: { left: 'Committing to one reliable path', right: 'Exploring multiple "what-if" options' }, reverseScored: false, a: 1.29 },
    { type: 'tradeoff', prompt: 'My thought process is usually...', options: { left: 'Linear and focused', right: 'Bouncing wildly between unrelated concepts' }, reverseScored: true, a: 1.46 },
    { type: 'reaction', prompt: 'Someone shares a bizarre, totally hypothetical idea.', context: '', options: { choices: [{ label: 'Dismiss it', description: 'It has no use', value: 1 }, { label: 'Engage', description: 'I love playing with concepts', value: 5 }] }, reverseScored: true, a: 1.37 },
    { type: 'reaction', prompt: 'You hear a new concept.', context: '', options: { choices: [{ label: 'File it away', description: 'Just one fact', value: 1 }, { label: 'Connect it', description: 'It sparks 5 more ideas in my mind', value: 5 }] }, reverseScored: false, a: 1.49 },
    { type: 'likert', prompt: 'I love reframing a problem from completely unexpected angles.', context: '', reverseScored: false, a: 1.40 },
    { type: 'likert', prompt: 'Having too many open-ended possibilities makes me want to quit.', context: '', reverseScored: true, a: 1.45 }
  ],
  Si: [
    { type: 'scenario', prompt: 'You are cooking dinner.', context: 'You found a new recipe.', options: { left: 'Improvise totally', right: 'Follow the classic, proven steps exactly' }, reverseScored: false, a: 1.42 },
    { type: 'scenario', prompt: 'You walk into your favorite cafe.', context: 'Something is different.', options: { left: 'Barely notice', right: 'Instantly spot that a table moved 2 feet' }, reverseScored: false, a: 1.36 },
    { type: 'tradeoff', prompt: 'I find comfort in...', options: { left: 'Constant chaotic change', right: 'Familiar routines and stability' }, reverseScored: false, a: 1.51 },
    { type: 'tradeoff', prompt: 'When solving a problem...', options: { left: 'I ignore precedent', right: 'I rely on detailed past experiences' }, reverseScored: true, a: 1.38 },
    { type: 'reaction', prompt: 'Someone asks you about a past event.', context: '', options: { choices: [{ label: 'Vague', description: 'I just remember the vibe', value: 1 }, { label: 'Precise', description: 'I remember exactly what happened', value: 5 }] }, reverseScored: true, a: 1.45 },
    { type: 'reaction', prompt: 'You have to do a repetitive task.', context: '', options: { choices: [{ label: 'Hate it', description: 'Too boring', value: 1 }, { label: 'Love it', description: 'Reliable routines help me maintain quality', value: 5 }] }, reverseScored: false, a: 1.43 },
    { type: 'likert', prompt: 'I frequently compare current situations to highly specific memories from my past.', context: '', reverseScored: false, a: 1.39 },
    { type: 'likert', prompt: 'I rarely remember the details of what worked in similar situations before.', context: '', reverseScored: true, a: 1.41 }
  ],
  Se: [
    { type: 'scenario', prompt: 'A sudden emergency happens right in front of you.', context: 'Someone drops a huge tray of glasses.', options: { left: 'Freeze and think', right: 'React instantly in real-time' }, reverseScored: false, a: 1.54 },
    { type: 'scenario', prompt: 'You are at a loud, intense concert.', context: 'The energy is wild.', options: { left: 'Feel overwhelmed', right: 'Thrive in the high-intensity sensory environment' }, reverseScored: false, a: 1.46 },
    { type: 'tradeoff', prompt: 'I live mostly...', options: { left: 'In my head with my thoughts', right: 'In the present physical reality' }, reverseScored: false, a: 1.31 },
    { type: 'tradeoff', prompt: 'When physical conditions change...', options: { left: 'I hesitate', right: 'I adapt my actions instantly' }, reverseScored: true, a: 1.49 },
    { type: 'reaction', prompt: 'An opportunity physically appears near you.', context: '', options: { choices: [{ label: 'Miss it', description: 'I was lost in thought', value: 1 }, { label: 'Grab it', description: 'I notice things as soon as they appear', value: 5 }] }, reverseScored: true, a: 1.39 },
    { type: 'reaction', prompt: 'Someone invites you to try an extreme sport.', context: '', options: { choices: [{ label: 'No way', description: 'Too risky', value: 1 }, { label: 'Let\'s go', description: 'I crave physical movement and adrenaline', value: 5 }] }, reverseScored: false, a: 1.45 },
    { type: 'likert', prompt: 'I engage fully with my physical surroundings without hesitating.', context: '', reverseScored: false, a: 1.40 },
    { type: 'likert', prompt: 'I often completely miss what is happening directly in front of my face.', context: '', reverseScored: true, a: 1.47 }
  ]
};

export const FUNCTION_KEYS = Object.keys(definitions);

export const QUESTION_BANK = Object.entries(definitions).flatMap(
  ([functionKey, items]) =>
    items.map((itemData, index) =>
      createItem(functionKey, index + 1, itemData)
    )
);

export const ASSESSMENT_CLUSTERS = Array.from(
  { length: Math.ceil(QUESTION_BANK.length / 6) },
  (_, index) => QUESTION_BANK.slice(index * 6, index * 6 + 6)
);

export const LIKERT_ANCHORS = [
  { value: 1, label: 'Definitely Not', short: 'Def Not' },
  { value: 2, label: 'Rarely', short: 'Rarely' },
  { value: 3, label: 'Sometimes', short: 'Sometimes' },
  { value: 4, label: 'Usually', short: 'Usually' },
  { value: 5, label: 'Totally Me', short: 'Totally Me' }
];
