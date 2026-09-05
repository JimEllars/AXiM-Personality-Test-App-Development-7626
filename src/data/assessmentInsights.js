import {FUNCTION_NAMES} from './archetypes';

const INSIGHT_RULES={
  strongest: {
    title: 'Your natural processing advantage',
    build: (key)=> `Your strongest signal is ${key} — ${FUNCTION_NAMES[key]}. You may access this mode with less conscious effort, especially when the environment gives you room to work naturally.`
  },
  contrast: {
    title: 'A useful tension to watch',
    build: (strongest,developing)=> `Your profile pairs ${strongest} strength with a developing ${developing} signal. Growth may come from using your natural advantage as a bridge into ${FUNCTION_NAMES[developing].toLowerCase()}.`
  },
  balance: {
    title: 'Your profile has room to flex',
    build: ()=> 'No single function dominates this snapshot. That can support adaptability, but it may also help to notice which mode you are choosing in different contexts.'
  }
};

export function getAssessmentInsights(thetaScores={}){
  const ranked=Object.entries(thetaScores)
    .filter(([,value])=> Number.isFinite(value))
    .sort(([,first],[,second])=> second-first);
  const strongest=ranked[0]?.[0];
  const developing=ranked[ranked.length-1]?.[0];

  if (!strongest) return [];
  if (strongest===developing) {
    return [{
      id: 'balanced-profile',
      ...INSIGHT_RULES.balance,
      tag: 'Profile pattern'
    }];
  }

  return [
    {
      id: `strength-${strongest}`,
      ...INSIGHT_RULES.strongest,
      body: INSIGHT_RULES.strongest.build(strongest),
      tag: 'Natural strength',
      functionKey: strongest
    },
    {
      id: `tension-${strongest}-${developing}`,
      ...INSIGHT_RULES.contrast,
      body: INSIGHT_RULES.contrast.build(strongest,developing),
      tag: 'Growth direction',
      functionKey: developing
    }
  ];
}