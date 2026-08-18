/**
 * Questions "recall" (format saisie type Sporcle) — le joueur doit CITER tous
 * les éléments d'une liste, pas choisir un QCM. Data statique de départ ; une
 * source serveur pourra s'y substituer plus tard (même forme).
 *
 * `accepted` = variantes acceptées pour chaque bonne réponse (la notation
 * tolère déjà accents/casse/articles/1 faute via `gradeRecall`).
 */

export interface RecallItem {
  /** Libellé canonique affiché une fois trouvé. */
  label: string;
  /** Variantes acceptées à la saisie. */
  accepted: string[];
}

export interface RecallQuestion {
  id: string;
  promptFr: string;
  promptEn: string;
  /** Secondes allouées (recall = plus long qu'un QCM). */
  timeSec: number;
  items: RecallItem[];
}

export const RECALL_QUESTIONS: RecallQuestion[] = [
  {
    id: "regions-fr",
    promptFr: "Cite les 13 régions de France métropolitaine",
    promptEn: "Name the 13 regions of metropolitan France",
    timeSec: 180,
    items: [
      { label: "Île-de-France", accepted: ["ile de france", "idf"] },
      { label: "Auvergne-Rhône-Alpes", accepted: ["auvergne rhone alpes", "aura", "rhone alpes", "auvergne"] },
      { label: "Nouvelle-Aquitaine", accepted: ["nouvelle aquitaine", "aquitaine"] },
      { label: "Occitanie", accepted: ["occitanie"] },
      { label: "Hauts-de-France", accepted: ["hauts de france"] },
      { label: "Grand Est", accepted: ["grand est"] },
      { label: "Provence-Alpes-Côte d'Azur", accepted: ["paca", "provence alpes cote d azur", "provence"] },
      { label: "Pays de la Loire", accepted: ["pays de la loire"] },
      { label: "Normandie", accepted: ["normandie"] },
      { label: "Bretagne", accepted: ["bretagne"] },
      { label: "Bourgogne-Franche-Comté", accepted: ["bourgogne franche comte", "bourgogne"] },
      { label: "Centre-Val de Loire", accepted: ["centre val de loire", "centre"] },
      { label: "Corse", accepted: ["corse"] },
    ],
  },
  {
    id: "planets",
    promptFr: "Cite les 8 planètes du système solaire",
    promptEn: "Name the 8 planets of the solar system",
    timeSec: 120,
    items: [
      { label: "Mercure", accepted: ["mercure", "mercury"] },
      { label: "Vénus", accepted: ["venus"] },
      { label: "Terre", accepted: ["terre", "earth"] },
      { label: "Mars", accepted: ["mars"] },
      { label: "Jupiter", accepted: ["jupiter"] },
      { label: "Saturne", accepted: ["saturne", "saturn"] },
      { label: "Uranus", accepted: ["uranus"] },
      { label: "Neptune", accepted: ["neptune"] },
    ],
  },
  {
    id: "oceans",
    promptFr: "Cite les 5 océans du monde",
    promptEn: "Name the world's 5 oceans",
    timeSec: 90,
    items: [
      { label: "Pacifique", accepted: ["pacifique", "pacific"] },
      { label: "Atlantique", accepted: ["atlantique", "atlantic"] },
      { label: "Indien", accepted: ["indien", "indian"] },
      { label: "Arctique", accepted: ["arctique", "arctic"] },
      { label: "Austral (Antarctique)", accepted: ["austral", "antarctique", "southern", "antarctic"] },
    ],
  },
];

/** Question recall du jour (déterministe selon la date, sans dépendre de l'heure). */
export function recallQuestionForDay(dayIndex: number): RecallQuestion {
  const i = ((dayIndex % RECALL_QUESTIONS.length) + RECALL_QUESTIONS.length) % RECALL_QUESTIONS.length;
  return RECALL_QUESTIONS[i];
}
