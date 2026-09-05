const thresholds = [-1.82, -0.74, 0.65, 1.78];

const createItem = (functionKey, number, prompt, reverseScored, a) => ({
  id: `${functionKey.toLowerCase()}_${String(number).padStart(2, '0')}`,
  functionKey,
  prompt,
  reverseScored,
  parameters: { a, b: thresholds }
});

const definitions = {
  Ti: [
    ['I break down complex problems into their core logical parts.', false, 1.45],
    ['I look for inconsistencies in explanations before accepting them.', false, 1.38],
    ['I prefer finding exact definitions rather than approximations.', false, 1.25],
    ['I can easily follow ideas that lack a clear logical framework.', true, 1.30],
    ['I accept popular opinions even if the reasoning seems flawed.', true, 1.52],
    ['I enjoy testing whether an argument remains sound in every case.', false, 1.41],
    ['I revise my mental models when stronger logic becomes available.', false, 1.34],
    ['Careful analysis usually feels like an unnecessary delay.', true, 1.37]
  ],
  Te: [
    ['I focus on practical results and measurable outcomes.', false, 1.40],
    ['I organize schedules, tasks, and resources for efficiency.', false, 1.55],
    ['I make decisions based on objective data rather than debate.', false, 1.28],
    ['I struggle to enforce deadlines when group momentum stalls.', true, 1.34],
    ['Order and structural organization matter little to my work.', true, 1.48],
    ['I quickly turn broad goals into clear steps and ownership.', false, 1.43],
    ['I compare options using observable standards of effectiveness.', false, 1.36],
    ['I avoid setting priorities when several tasks compete.', true, 1.39]
  ],
  Fi: [
    ['I stay true to personal values even under social pressure.', false, 1.60],
    ['I quickly sense whether an action aligns with my integrity.', false, 1.42],
    ['I evaluate experiences based on how authentic they feel.', false, 1.35],
    ['I easily change personal principles to fit group consensus.', true, 1.58],
    ['How I feel internally about a choice is unimportant to me.', true, 1.44],
    ['I can name the values that guide my most important choices.', false, 1.47],
    ['I protect individual differences even when they are unpopular.', false, 1.39],
    ['Personal meaning rarely affects the goals I choose.', true, 1.41]
  ],
  Fe: [
    ['I notice subtle shifts in the emotional climate of a room.', false, 1.50],
    ['I naturally adjust my tone to preserve harmony and rapport.', false, 1.41],
    ['Maintaining group cohesion is a primary goal in teamwork.', false, 1.32],
    ['I rarely notice when someone in a group feels excluded.', true, 1.47],
    ["Others' interpersonal discomfort does not concern me.", true, 1.62],
    ['I help people find common ground during tense conversations.', false, 1.45],
    ['I consider how decisions will affect the wider group emotionally.', false, 1.38],
    ['Adapting my communication to another person feels pointless.', true, 1.43]
  ],
  Ni: [
    ['I often anticipate future outcomes through sudden insights.', false, 1.55],
    ['I look past immediate facts to uncover hidden trajectories.', false, 1.48],
    ['I focus on a single unifying vision for complex scenarios.', false, 1.33],
    ['I prefer dealing only with obvious, current circumstances.', true, 1.39],
    ['Speculating about distant future possibilities tires me.', true, 1.51],
    ['A clear long-term direction often appears before the details do.', false, 1.46],
    ['I condense many signals into one underlying interpretation.', false, 1.37],
    ['I seldom search for a deeper pattern behind events.', true, 1.42]
  ],
  Ne: [
    ['Brainstorming multiple alternative ideas energizes me.', false, 1.58],
    ['I easily connect unrelated concepts to create novel options.', false, 1.44],
    ['Exploring multiple paths is better than committing to one.', false, 1.29],
    ['I prefer sticking to standard, proven routines every day.', true, 1.46],
    ['Novel concepts with no immediate use frustrate me.', true, 1.37],
    ['One idea often sparks several more possibilities in my mind.', false, 1.49],
    ['I enjoy reframing a problem from unexpected angles.', false, 1.40],
    ['Open-ended possibilities make me want to disengage.', true, 1.45]
  ],
  Si: [
    ['I rely on detailed past experiences to guide current choices.', false, 1.42],
    ['I notice small physical changes in familiar environments.', false, 1.36],
    ['Consistency, proven procedures, and stability comfort me.', false, 1.51],
    ['I pay little attention to chronological facts and details.', true, 1.38],
    ['Established precedent has no bearing on how I solve tasks.', true, 1.45],
    ['I compare current situations with precise memories of the past.', false, 1.43],
    ['Reliable routines help me maintain quality over time.', false, 1.39],
    ['I rarely remember what worked in similar situations before.', true, 1.41]
  ],
  Se: [
    ['I thrive in fast-moving, high-intensity sensory environments.', false, 1.54],
    ['I act swiftly on immediate physical feedback in the moment.', false, 1.46],
    ['I engage fully with physical surroundings without hesitating.', false, 1.31],
    ['Fast-paced sensory activities quickly overwhelm me.', true, 1.49],
    ['I live largely in my thoughts rather than physical reality.', true, 1.39],
    ['I notice useful opportunities as soon as they appear around me.', false, 1.45],
    ['I adapt my actions quickly when real-world conditions change.', false, 1.40],
    ['I often miss what is happening directly in front of me.', true, 1.47]
  ]
};

export const FUNCTION_KEYS = Object.keys(definitions);

export const QUESTION_BANK = Object.entries(definitions).flatMap(
  ([functionKey, items]) =>
    items.map(([prompt, reverseScored, a], index) =>
      createItem(functionKey, index + 1, prompt, reverseScored, a)
    )
);

export const ASSESSMENT_CLUSTERS = Array.from(
  { length: Math.ceil(QUESTION_BANK.length / 6) },
  (_, index) => QUESTION_BANK.slice(index * 6, index * 6 + 6)
);

export const LIKERT_ANCHORS = [
  { value: 1, label: 'Strongly disagree', short: 'Strongly disagree' },
  { value: 2, label: 'Disagree', short: 'Disagree' },
  { value: 3, label: 'Neutral', short: 'Neutral' },
  { value: 4, label: 'Agree', short: 'Agree' },
  { value: 5, label: 'Strongly agree', short: 'Strongly agree' }
];