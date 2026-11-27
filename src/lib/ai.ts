import type { AiAnalysis, Category, Priority } from './types';

/**
 * On-device civic triage model.
 *
 * This is a transparent keyword-and-weight scoring model rather than a hosted
 * LLM call, so the demo works offline and every prediction can be explained.
 * It reads the title, description and location, scores each civic category and
 * derives a priority from urgency language.
 */

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  'Roads & Potholes': [
    'pothole',
    'potholes',
    'road',
    'roads',
    'asphalt',
    'crack',
    'cracked',
    'pavement',
    'footpath',
    'sidewalk',
    'speed breaker',
    'speedbreaker',
    'sinkhole',
    'tar',
    'curb',
    'uneven'
  ],
  'Street Lighting': [
    'streetlight',
    'street light',
    'streetlights',
    'lamp',
    'lamppost',
    'lamp post',
    'light',
    'lights',
    'bulb',
    'dark',
    'darkness',
    'unlit',
    'illumination',
    'flickering'
  ],
  'Water & Drainage': [
    'water',
    'leak',
    'leaking',
    'leakage',
    'pipe',
    'pipeline',
    'drain',
    'drainage',
    'sewer',
    'sewage',
    'flood',
    'flooding',
    'waterlogging',
    'overflow',
    'overflowing',
    'stagnant',
    'supply',
    'tap',
    'manhole'
  ],
  'Waste Management': [
    'garbage',
    'trash',
    'waste',
    'rubbish',
    'dump',
    'dumping',
    'bin',
    'bins',
    'litter',
    'sanitation',
    'smell',
    'stink',
    'rotting',
    'debris'
  ],
  'Public Safety': [
    'stray',
    'dog',
    'dogs',
    'unsafe',
    'hazard',
    'hazardous',
    'accident',
    'injury',
    'injured',
    'exposed wire',
    'electric wire',
    'danger',
    'dangerous',
    'collapse',
    'collapsed',
    'fire',
    'harassment',
    'theft'
  ],
  'Parks & Trees': [
    'tree',
    'trees',
    'branch',
    'branches',
    'park',
    'garden',
    'greenery',
    'lawn',
    'playground',
    'bench',
    'fallen tree',
    'overgrown'
  ],
  Noise: ['noise', 'loud', 'honking', 'horn', 'speaker', 'music', 'construction noise', 'disturbance'],
  'Traffic & Signage': [
    'traffic',
    'signal',
    'signage',
    'sign',
    'signboard',
    'parking',
    'congestion',
    'zebra',
    'crossing',
    'bus stop',
    'one way',
    'junction'
  ],
  Other: []
};

const URGENT_WORDS = [
  'urgent',
  'immediately',
  'danger',
  'dangerous',
  'unsafe',
  'hazard',
  'accident',
  'injury',
  'injured',
  'children',
  'child',
  'school',
  'hospital',
  'elderly',
  'fire',
  'electrocution',
  'collapse',
  'emergency',
  'severe',
  'deep',
  'flood'
];

const MODERATE_WORDS = [
  'broken',
  'damaged',
  'blocked',
  'overflow',
  'leak',
  'large',
  'weeks',
  'week',
  'days',
  'repeated',
  'again',
  'risk',
  'smell',
  'night'
];

const LOW_WORDS = ['minor', 'small', 'cosmetic', 'slightly', 'suggestion', 'someday', 'eventually', 'would like'];

const CATEGORY_RESPONSE: Record<Category, string> = {
  'Roads & Potholes': 'the roads maintenance crew',
  'Street Lighting': 'the electrical maintenance team',
  'Water & Drainage': 'the water and drainage department',
  'Waste Management': 'the sanitation team',
  'Public Safety': 'the public safety cell',
  'Parks & Trees': 'the parks and horticulture team',
  Noise: 'the environment and noise control desk',
  'Traffic & Signage': 'the traffic engineering cell',
  Other: 'the general grievances desk'
};

const responseWindow = (priority: Priority): string => {
  if (priority === 'High') return '24–48 hours';
  if (priority === 'Medium') return '3–5 working days';
  return '7–10 working days';
};

const countMatches = (text: string, words: string[]) =>
  words.reduce((total, word) => (text.includes(word) ? total + 1 : total), 0);

const findMatches = (text: string, words: string[]) => words.filter((word) => text.includes(word));

export interface AnalyzeInput {
  title: string;
  description: string;
  location: string;
  category?: Category | '';
}

export function analyzeComplaint({ title, description, location, category }: AnalyzeInput): AiAnalysis {
  const titleText = title.toLowerCase();
  const bodyText = `${description} ${location}`.toLowerCase();
  const fullText = `${titleText} ${bodyText}`;

  const scores = (Object.keys(CATEGORY_KEYWORDS) as Category[]).map((name) => {
    const keywords = CATEGORY_KEYWORDS[name];
    const inTitle = countMatches(titleText, keywords);
    const inBody = countMatches(bodyText, keywords);
    return { name, score: inTitle * 3 + inBody, matches: [...new Set([...findMatches(titleText, keywords), ...findMatches(bodyText, keywords)])] };
  });

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  const runnerUp = scores[1];

  const resolvedCategory: Category = best.score > 0 ? best.name : category ? category : 'Other';
  const matchedSignals = best.score > 0 ? best.matches : [];

  const urgent = findMatches(fullText, URGENT_WORDS);
  const moderate = findMatches(fullText, MODERATE_WORDS);
  const low = findMatches(fullText, LOW_WORDS);

  let priorityScore = urgent.length * 2 + moderate.length - low.length * 1.5;
  if (resolvedCategory === 'Public Safety') priorityScore += 2;
  if (resolvedCategory === 'Water & Drainage' && fullText.includes('flood')) priorityScore += 1;

  const priority: Priority = priorityScore >= 4 ? 'High' : priorityScore >= 1.5 ? 'Medium' : 'Low';

  let confidence = 58;
  if (best.score > 0) confidence += Math.min(28, best.score * 4);
  if (matchedSignals.length >= 3) confidence += 6;
  if (best.score > 0 && best.score - (runnerUp?.score ?? 0) >= 3) confidence += 5;
  if (best.score === 0 && category) confidence = 64;
  confidence = Math.max(52, Math.min(96, confidence));

  const quotedSignals = matchedSignals.slice(0, 3).map((word) => `“${word}”`);
  const signalText =
    quotedSignals.length > 1
      ? `${quotedSignals.slice(0, -1).join(', ')} and ${quotedSignals[quotedSignals.length - 1]}`
      : quotedSignals[0] ?? '';

  const sentences: string[] = [];

  if (matchedSignals.length > 0) {
    sentences.push(
      `The wording points clearly to ${resolvedCategory.toLowerCase()} — ${signalText} ${
        matchedSignals.length > 1 ? 'appear' : 'appears'
      } in the report.`
    );
  } else {
    sentences.push(
      category
        ? `No strong category words were detected, so the analysis falls back to the category you selected (${category}).`
        : `No strong category words were detected, so the report is routed to the general grievances desk until a reviewer tags it.`
    );
  }

  if (urgent.length > 0) {
    sentences.push(
      `Risk language (${urgent.slice(0, 2).map((word) => `“${word}”`).join(', ')}) suggests people could be harmed, which is why ${priority.toLowerCase()} priority is recommended.`
    );
  } else if (moderate.length > 0) {
    sentences.push(
      `The report describes a real service disruption (${moderate.slice(0, 2).map((word) => `“${word}”`).join(', ')}) but no immediate threat to life, so ${priority.toLowerCase()} priority fits.`
    );
  } else {
    sentences.push(
      `The report reads as a routine request without safety or escalation language, so ${priority.toLowerCase()} priority keeps the queue fair for urgent cases.`
    );
  }

  sentences.push(
    `If accepted, it is forwarded to ${CATEGORY_RESPONSE[resolvedCategory]}, where similar reports are usually answered within ${responseWindow(
      priority
    )}.`
  );

  return {
    category: resolvedCategory,
    priority,
    confidence,
    explanation: sentences.join(' '),
    signals: matchedSignals.slice(0, 6),
    responseWindow: responseWindow(priority)
  };
}
