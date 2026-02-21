import type { QuizQuestion } from "./generate-question.js";

const HEYGEN_BASE = "https://api.heygen.com";

function headers() {
  return {
    "X-Api-Key": process.env.HEYGEN_API_KEY!,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/** Build the HeyGen Video Agent prompt from quiz data */
function buildVideoAgentPrompt(question: QuizQuestion): string {
  const answerLetter = question.answer.toUpperCase();

  return `Génère une vidéo de quiz au format portrait (9:16) pour Instagram Reels.

=== IDENTITÉ VISUELLE (OBLIGATOIRE — identique sur chaque vidéo) ===

Palette : fond noir (#0D0D0D), néons violet (#8B5CF6) et bleu (#3B82F6), texte blanc (#FFFFFF).
Voix : mia.
Logo : utilise le logo BigHead uploadé (fichier joint) — affiché en haut au centre à chaque scène.
Style typographique :
  - Titres / question : police bold sans-serif, taille grande, ombre néon violet.
  - Choix A, B, C : police medium sans-serif, taille moyenne, listés verticalement avec espacement régulier, centrés horizontalement.
  - Réponse correcte : même police bold, highlight néon bleu avec glow.
  - Tous les textes sont centrés horizontalement, positionnés dans le tiers inférieur de l'écran sous l'avatar.

=== CONFIGURATION NARRATEUR ===

Avatar : Emma (Mia).
Tenue : ${question.outfit}.
Expression : ${question.expression}.
Position avatar : centré horizontalement, tiers supérieur de l'écran (cadrage buste).

=== CONTENU DU QUIZ ===

Question : ${question.question}
Choix A : ${question.choices.a}
Choix B : ${question.choices.b}
Choix C : ${question.choices.c}
Réponse correcte : ${answerLetter}

=== SCRIPTS PARLÉS PAR MIA ===

- Intro : "${question.intro_script}"
- Question : "${question.question} A : ${question.choices.a}. B : ${question.choices.b}. C : ${question.choices.c}."
- Réponse : "C'est la réponse ${answerLetter}, ${question.answer_text}. ${question.fun_fact}"
- Outro : "${question.outro_script}"

=== STRUCTURE DES SCÈNES (5 scènes, ordre strict) ===

Scène 1 — Accroche (3-4s) :
  Mia parle l'intro. Logo BigHead en haut au centre. Fond noir avec particules néon.

Scène 2 — Question (6-8s) :
  Mia lit la question et les choix. Overlay texte :
    - Question en haut du tiers inférieur, police bold grande, glow violet.
    - Choix A, B, C listés en dessous, alignés à gauche avec lettre en néon bleu.

Scène 3 — Décompte (2s) :
  Mia reste visible à l'écran mais NE PARLE PAS. Elle garde un regard de suspense en silence. Overlay texte uniquement : chiffres 3, 2, 1 affichés en grand au centre par-dessus l'avatar, animation néon rapide (défilement accéléré en 2 secondes). Aucune voix dans cette scène.

Scène 4 — Réponse (5-6s) :
  Mia révèle la réponse. Overlay texte :
    - Réponse correcte au centre en grand, police bold, glow néon bleu.
    - Le choix correct est mis en surbrillance.

Scène 5 — Conclusion (3-4s) :
  Mia parle l'outro en promouvant l'app BigHead Quiz. Logo BigHead centré en grand. Overlay texte : "Télécharge BigHead Quiz !" en néon bleu sous le logo. Fond noir avec effet néon final.

=== CONSIGNES STRICTES ===

- Format portrait 9:16 uniquement.
- Ne JAMAIS changer la palette de couleurs ni la disposition des overlays.
- Les overlays texte doivent être identiques en style, position et taille d'une vidéo à l'autre.
- L'avatar reste toujours dans le tiers supérieur, les textes dans le tiers inférieur.
- Pas de musique de fond.`;
}

/** Generate video using HeyGen Video Agent (AI prompt-based) */
export async function generateVideoAgent(
  question: QuizQuestion
): Promise<string> {
  const prompt = buildVideoAgentPrompt(question);

  console.log("  Video Agent prompt preview:");
  console.log(`    Outfit: "${question.outfit}"`);
  console.log(`    Expression: "${question.expression}"`);
  console.log(`    Question: "${question.question}"`);
  console.log(`    Answer: ${question.answer.toUpperCase()} - ${question.answer_text}`);

  const avatarId = process.env.HEYGEN_AVATAR_ID;
  if (!avatarId) {
    throw new Error("Missing HEYGEN_AVATAR_ID in env (avatar group or talking photo ID)");
  }

  console.log(`    Avatar ID: ${avatarId}`);

  const body: Record<string, any> = {
    prompt,
    config: {
      avatar_id: avatarId,
    },
    files: [
      { asset_id: "6a60ac20d2ec473e8b61f7f42e9868b1" }, // bighead-app-icon.png
    ],
  };

  // Add callback URL if configured
  if (process.env.HEYGEN_CALLBACK_URL) {
    body.callback_url = process.env.HEYGEN_CALLBACK_URL;
  }

  const res = await fetch(`${HEYGEN_BASE}/v1/video_agent/generate`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!data?.data?.video_id) {
    console.error("Video Agent response:", JSON.stringify(data, null, 2));
    throw new Error(
      `HeyGen Video Agent generation failed: ${JSON.stringify(data?.error || data)}`
    );
  }

  return data.data.video_id;
}

/** Poll video status until complete */
export async function waitForVideo(
  videoId: string,
  maxWaitMs = 1_200_000
): Promise<string> {
  const start = Date.now();
  const pollInterval = 15_000;

  while (Date.now() - start < maxWaitMs) {
    const res = await fetch(
      `${HEYGEN_BASE}/v1/video_status.get?video_id=${videoId}`,
      { headers: headers() }
    );
    const data = await res.json();
    const status = data?.data?.status;

    console.log(`  HeyGen video ${videoId}: ${status}`);

    if (status === "completed") {
      return data.data.video_url;
    }
    if (status === "failed") {
      throw new Error(
        `HeyGen video failed: ${JSON.stringify(data.data?.error)}`
      );
    }

    await new Promise((r) => setTimeout(r, pollInterval));
  }

  throw new Error(`HeyGen video timed out after ${maxWaitMs / 1000}s`);
}
