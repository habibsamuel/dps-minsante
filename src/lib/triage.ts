/**
 * Moteur de pré-consultation (triage).
 * Règle : d'abord un questionnaire court, puis orientation vers un médecin
 * uniquement si les réponses le justifient. Aucun diagnostic n'est posé ici.
 */

export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue | undefined>;

export type Option = {
  value: string;
  label: string;
  sub?: string;
};

export type Question = {
  id: string;
  title: string;
  hint?: string;
  type: 'single' | 'multi';
  options: Option[];
  optional?: boolean;
};

export const questions: Question[] = [
  {
    id: 'pour_qui',
    title: 'Pour qui est cette évaluation ?',
    type: 'single',
    options: [
      { value: 'moi', label: 'Pour moi' },
      { value: 'enfant', label: 'Pour mon enfant', sub: 'Moins de 12 ans' },
      { value: 'autre', label: 'Pour une autre personne' },
    ],
  },
  {
    id: 'age',
    title: 'Quel âge ?',
    type: 'single',
    options: [
      { value: 'moins5', label: 'Moins de 5 ans' },
      { value: '5_17', label: '5 à 17 ans' },
      { value: '18_39', label: '18 à 39 ans' },
      { value: '40_64', label: '40 à 64 ans' },
      { value: '65plus', label: '65 ans et plus' },
    ],
  },
  {
    id: 'sexe',
    title: 'Sexe',
    hint: 'Utile pour adapter les questions de santé.',
    type: 'single',
    options: [
      { value: 'femme', label: 'Femme' },
      { value: 'homme', label: 'Homme' },
    ],
  },
  {
    id: 'symptome',
    title: 'Quel est le problème principal ?',
    type: 'single',
    options: [
      { value: 'fievre', label: 'Fièvre' },
      { value: 'toux', label: 'Toux, rhume, gorge' },
      { value: 'tete', label: 'Maux de tête' },
      { value: 'ventre', label: 'Douleur au ventre' },
      { value: 'diarrhee', label: 'Diarrhée ou vomissements' },
      { value: 'thorax', label: 'Douleur dans la poitrine' },
      { value: 'peau', label: 'Éruption ou problème de peau' },
      { value: 'fatigue', label: 'Fatigue générale' },
      { value: 'autre', label: 'Autre chose' },
    ],
  },
  {
    id: 'duree',
    title: 'Depuis combien de temps ?',
    type: 'single',
    options: [
      { value: 'moins24', label: "Moins d'un jour" },
      { value: '2_3j', label: '2 à 3 jours' },
      { value: '4_7j', label: '4 à 7 jours' },
      { value: 'plus1sem', label: 'Plus d’une semaine' },
      { value: 'plus1mois', label: 'Plus d’un mois' },
    ],
  },
  {
    id: 'intensite',
    title: "C'est gênant à quel point ?",
    type: 'single',
    options: [
      { value: 'leger', label: 'Léger', sub: 'Je vis normalement' },
      { value: 'modere', label: 'Modéré', sub: 'Ça me ralentit' },
      { value: 'fort', label: 'Fort', sub: 'Je dois rester au lit' },
      { value: 'extreme', label: 'Très fort', sub: 'Je ne tiens plus debout' },
    ],
  },
  {
    id: 'fievre',
    title: 'As-tu de la fièvre mesurée ?',
    type: 'single',
    options: [
      { value: 'non', label: 'Non ou je ne sais pas' },
      { value: '38_39', label: 'Entre 38 et 39 °C' },
      { value: 'plus39', label: 'Plus de 39 °C' },
    ],
  },
  {
    id: 'alertes',
    title: 'Un de ces signes est-il présent ?',
    hint: 'Tu peux en choisir plusieurs, ou aucun.',
    type: 'multi',
    optional: true,
    options: [
      { value: 'respirer', label: 'Difficulté à respirer' },
      { value: 'thorax', label: 'Douleur forte dans la poitrine' },
      { value: 'conscience', label: 'Perte de connaissance ou grande somnolence' },
      { value: 'convulsions', label: 'Convulsions' },
      { value: 'nuque', label: 'Nuque raide, lumière insupportable' },
      { value: 'sang', label: 'Du sang dans les vomissements ou les selles' },
      { value: 'boire', label: 'Impossible de boire ou de garder les liquides' },
      { value: 'grossesse', label: 'Grossesse en cours' },
      { value: 'nourrisson', label: 'Bébé de moins de 3 mois' },
    ],
  },
  {
    id: 'antecedents',
    title: 'Un antécédent connu ?',
    hint: 'Cela aide le médecin à mieux te lire.',
    type: 'multi',
    optional: true,
    options: [
      { value: 'palu', label: 'Paludisme récent' },
      { value: 'diabete', label: 'Diabète' },
      { value: 'hypertension', label: 'Hypertension' },
      { value: 'asthme', label: 'Asthme' },
      { value: 'immuno', label: 'Immunité fragile (VIH, chimiothérapie…)' },
      { value: 'aucun', label: 'Aucun de ces cas' },
    ],
  },
];

export type Level = 'urgence' | 'consultation' | 'surveillance';

export type TriageResult = {
  level: Level;
  score: number;
  redFlags: string[];
  reasons: string[];
  title: string;
  summary: string;
  advice: string[];
};

const SYMPTOM_WEIGHT: Record<string, number> = {
  fievre: 1,
  toux: 0,
  tete: 1,
  ventre: 1,
  diarrhee: 1,
  thorax: 3,
  peau: 0,
  fatigue: 1,
  autre: 0,
};

const DURATION_WEIGHT: Record<string, number> = {
  moins24: 0,
  '2_3j': 0,
  '4_7j': 1,
  plus1sem: 2,
  plus1mois: 2,
};

const INTENSITY_WEIGHT: Record<string, number> = {
  leger: 0,
  modere: 1,
  fort: 2,
  extreme: 3,
};

const FEVER_WEIGHT: Record<string, number> = {
  non: 0,
  '38_39': 1,
  plus39: 2,
};

const HISTORY_WEIGHT = 1;
const MAX_HISTORY_SCORE = 2;

const SYMPTOM_ADVICE: Record<string, string[]> = {
  fievre: [
    'Bois régulièrement de l’eau, même sans soif.',
    'Repose-toi et évite le soleil direct.',
    'Surveille la température matin et soir.',
  ],
  toux: [
    'Bois des boissons tièdes, évite la fumée et la poussière.',
    'Aère la pièce et dors la tête un peu surélevée.',
  ],
  tete: [
    'Repose-toi dans un endroit calme et sombre.',
    'Bois de l’eau : la déshydratation aggrave les maux de tête.',
  ],
  ventre: [
    'Mange léger, évite les plats gras ou très épicés.',
    'Note si la douleur se déplace ou s’accentue.',
  ],
  diarrhee: [
    'Réhydrate-toi : eau et sels de réhydratation (SRO) si disponibles.',
    'Mange riz, banane, bouillie. Évite le lait et le gras.',
  ],
  thorax: ['Évite tout effort physique en attendant un avis médical.'],
  peau: ['Ne gratte pas et ne perce pas les lésions.', 'Garde la zone propre et sèche.'],
  fatigue: [
    'Dors suffisamment et mange à heures régulières.',
    'Note depuis quand la fatigue est apparue.',
  ],
  autre: ['Note précisément ce qui a changé et depuis quand.'],
};

const RED_FLAG_LABELS: Record<string, string> = {
  respirer: 'Difficulté à respirer',
  thorax: 'Douleur forte dans la poitrine',
  conscience: 'Trouble de la conscience',
  convulsions: 'Convulsions',
  nuque: 'Raideur de la nuque',
  sang: 'Saignement digestif',
  boire: 'Impossible de boire',
  grossesse: 'Grossesse en cours',
  nourrisson: 'Nourrisson de moins de 3 mois',
};

export function evaluate(answers: Answers): TriageResult {
  const symptom = typeof answers.symptome === 'string' ? answers.symptome : 'autre';
  const duration = typeof answers.duree === 'string' ? answers.duree : 'moins24';
  const intensity = typeof answers.intensite === 'string' ? answers.intensite : 'leger';
  const fever = typeof answers.fievre === 'string' ? answers.fievre : 'non';
  const age = typeof answers.age === 'string' ? answers.age : '18_39';
  const alerts = Array.isArray(answers.alertes) ? answers.alertes : [];
  const history = Array.isArray(answers.antecedents)
    ? answers.antecedents.filter((h) => h !== 'aucun')
    : [];

  const redFlags = alerts
    .filter((a) => a in RED_FLAG_LABELS)
    .map((a) => RED_FLAG_LABELS[a]);

  let score = SYMPTOM_WEIGHT[symptom] ?? 0;
  score += DURATION_WEIGHT[duration] ?? 0;
  score += INTENSITY_WEIGHT[intensity] ?? 0;
  score += FEVER_WEIGHT[fever] ?? 0;
  score += Math.min(history.length * HISTORY_WEIGHT, MAX_HISTORY_SCORE);
  if (age === 'moins5' || age === '65plus') score += 1;

  const reasons: string[] = [];
  if (intensity === 'extreme') reasons.push('Une gêne très forte au quotidien');
  else if (intensity === 'fort') reasons.push('Une gêne importante au quotidien');
  if (duration === 'plus1sem' || duration === 'plus1mois') {
    reasons.push('Des symptômes qui durent depuis plus d’une semaine');
  }
  if (fever === 'plus39') reasons.push('Une fièvre élevée (plus de 39 °C)');
  if (history.length > 0) reasons.push('Des antécédents qui demandent un avis médical');
  if (age === 'moins5' || age === '65plus') {
    reasons.push('Un âge qui demande plus de prudence');
  }

  const advice = [...(SYMPTOM_ADVICE[symptom] ?? [])];

  if (redFlags.length > 0) {
    return {
      level: 'urgence',
      score,
      redFlags,
      reasons,
      title: 'Va te faire voir rapidement',
      summary:
        'Les réponses contiennent un ou plusieurs signes qui ne doivent pas attendre.',
      advice: [
        'Rends-toi au centre de santé le plus proche, ou fais-toi accompagner.',
        'Ne reste pas seul(e) pendant les prochaines heures.',
        'Ne prends pas de médicament sans avis si tu n’en as pas l’habitude.',
        ...advice.slice(0, 1),
      ],
    };
  }

  if (score >= 5) {
    return {
      level: 'consultation',
      score,
      redFlags: [],
      reasons,
      title: 'Un médecin devrait te voir',
      summary:
        'Ce n’est pas forcément grave, mais les signes décrits justifient un avis médical plutôt qu’une simple surveillance.',
      advice: [
        'Choisis un médecin et envoie-lui le résumé de ton évaluation.',
        'Note l’heure de chaque symptôme nouveau ou qui s’aggrave.',
        'Si ça se dégrade avant l’avis, repasse par l’évaluation.',
        ...advice.slice(0, 2),
      ],
    };
  }

  return {
    level: 'surveillance',
    score,
    redFlags: [],
    reasons: [],
    title: 'À surveiller à la maison',
    summary:
      'Rien d’inquiétant dans tes réponses pour l’instant. Repose-toi et surveille l’évolution.',
    advice: [
      ...advice,
      'Réévalue dans 48 h si les symptômes persistent.',
      'Reviens sur l’évaluation si un signe d’alerte apparaît.',
    ],
  };
}

export function answerLabel(questionId: string, value: string): string {
  const question = questions.find((q) => q.id === questionId);
  const option = question?.options.find((o) => o.value === value);
  return option?.label ?? value;
}
