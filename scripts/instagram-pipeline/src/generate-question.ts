import Anthropic from "@anthropic-ai/sdk";

export type QuizCategory =
  | "stars"
  | "pop_culture"
  | "musique"
  | "sport"
  | "science"
  | "geo"
  | "food"
  | "tech";

export type QuizQuestion = {
  hook: string;
  question: string;
  choices: { a: string; b: string; c: string };
  answer: "a" | "b" | "c";
  answer_text: string;
  fun_fact: string;
  hashtags: string[];
  caption: string;
  intro_script: string;
  outro_script: string;
  category: QuizCategory;
  // Appearance variations for HeyGen AI
  outfit: string;
  expression: string;
};

const SYSTEM_PROMPT = `Tu es Mia, ambassadrice cool de BigHead, créatrice de quiz culture G viraux pour Instagram Reels et TikTok.
Tu parles comme une vraie personne : naturel, décontracté, fluide. Pas de ton robotique.

CONTRAINTE VIDÉO : Moins de 30 secondes au total.
Chaque script parlé = 1-2 phrases COURTES, naturelles, comme à l'oral.

STYLE ORAL OBLIGATOIRE :
- Utilise des contractions naturelles ("c'est", "y'a", "t'as")
- Phrases simples et directes, comme si tu parlais à un pote
- Varie les intros (pas toujours "Salut c'est Mia") : "Hé !", "Allez !", "Attention quiz !", "Qui sait ça ?"
- Varie les outros avec CTA fort + promo app : "Clique le lien en bio et télécharge BigHead !", "Lien en bio pour BigHead, fonce !", "BigHead c'est en bio, go le télécharger !"
- Évite les formulations scolaires ou trop construites

Règles contenu :
- Thèmes variés "instagrammables" : stars & célébrités, pop culture, cinéma/séries, musique, football, sport, science insolite, géographie surprenante, histoire fun, food & lifestyle, animaux, tech & gaming
- Privilégie les sujets tendance, viraux, qui donnent envie de partager
- Ton : accrocheur, surprenant, fun
- 3 choix COURTS (2-4 mots) dont 1 seule bonne réponse
- Les mauvaises réponses doivent être crédibles
- fun_fact : UNE phrase courte et percutante
- question : max 15 mots, directe
- answer_text : juste le nom/fait (ex: "Taylor Swift")

Réponds UNIQUEMENT en JSON valide, sans markdown ni texte autour.`;

const USER_PROMPT = `Génère UNE question quiz culture générale virale et instagrammable. Court et naturel pour 30s de vidéo.

CHOIX DU THÈME : Pioche au hasard parmi ces catégories (varie à chaque fois !) :
- Stars & célébrités (Beyoncé, Cristiano, MrBeast, etc.)
- Pop culture & cinéma (Marvel, Disney, séries Netflix, etc.)
- Musique (records, anecdotes artistes, clips viraux)
- Football & sport (records, transferts, moments iconiques)
- Science insolite (corps humain, espace, animaux WTF)
- Géographie surprenante (pays, capitales, records géo)
- Food & lifestyle (origines plats, records cuisine)
- Tech & gaming (jeux vidéo, réseaux sociaux, records internet)

IMPORTANT : Les scripts parlés doivent sonner NATUREL à l'oral. Lis-les à voix haute dans ta tête.
Si ça sonne robotique ou scolaire, reformule plus casual.

Pour "outfit" et "expression" : varie à chaque fois ! Sois créatif et cohérent avec le thème de la question.
Exemples d'outfits : "casual t-shirt blanc", "blazer bleu classe", "hoodie streetwear noir", "robe d'été colorée", "veste en jean décontractée", "top sport rouge".
Exemples d'expressions : "souriante et enthousiaste", "regard mystérieux", "air surpris et amusé", "confiante et sérieuse", "clin d'œil complice".

Format JSON strict :
{
  "hook": "accroche courte max 6 mots (ex: Personne sait ça !)",
  "question": "question directe max 15 mots",
  "choices": { "a": "2-4 mots", "b": "2-4 mots", "c": "2-4 mots" },
  "answer": "a",
  "answer_text": "juste le nom/fait max 5 mots",
  "fun_fact": "1 phrase surprenante max 15 mots, ton oral",
  "hashtags": ["#quiz", "#bighead", "#culturegenerale", "...3-5 hashtags thématiques"],
  "caption": "texte Instagram engageant max 200 car",
  "intro_script": "max 10 mots, oral naturel (ex: Hé, quiz du jour, c'est parti !)",
  "outro_script": "max 12 mots, CTA lien en bio + promo app (ex: Clique le lien en bio et télécharge BigHead !)",
  "category": "stars | pop_culture | musique | sport | science | geo | food | tech",
  "outfit": "description courte de la tenue de Mia (5-8 mots)",
  "expression": "description de l'expression faciale (3-5 mots)"
}`;

export async function generateQuestion(
  previousQuestions: string[] = []
): Promise<QuizQuestion> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let prompt = USER_PROMPT;
  if (previousQuestions.length > 0) {
    const avoid = previousQuestions.slice(-30).join("\n- ");
    prompt += `\n\nÉvite ces questions déjà posées :\n- ${avoid}`;
  }

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const raw =
    response.content[0].type === "text" ? response.content[0].text : "";
  // Strip markdown code fences if present
  const text = raw.replace(/^```(?:json)?\s*\n?/m, "").replace(/\n?```\s*$/m, "").trim();
  const json = JSON.parse(text);

  // Validate structure
  if (
    !json.hook ||
    !json.question ||
    !json.choices?.a ||
    !json.answer ||
    !json.fun_fact ||
    !json.intro_script ||
    !json.outro_script ||
    !json.category ||
    !json.outfit ||
    !json.expression
  ) {
    throw new Error(`Invalid question format: ${text}`);
  }

  return json as QuizQuestion;
}
