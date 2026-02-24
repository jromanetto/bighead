import type { QuizQuestion } from "./generate-question.js";

const HEYGEN_BASE = "https://api.heygen.com";

function headers() {
  return {
    "X-Api-Key": process.env.HEYGEN_API_KEY!,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/**
 * Build the Video Agent prompt using the Level 4 (scene-by-scene) format
 * from HeyGen's prompt-optimizer guidelines.
 *
 * Key changes from previous version:
 * - Structured Global Style block for visual consistency
 * - Scene-by-scene with precise timing and scene types
 * - "Instruction for Video Agent" catch-all block
 * - Avatar enforced via config.avatar_id + prompt reinforcement
 */
function buildVideoAgentPrompt(question: QuizQuestion): string {
  const answerLetter = question.answer.toUpperCase();

  return `# Global Style & Settings
* **Visual Style:** Néon cyberpunk minimaliste — sombre, épuré, contrasté
* **Primary Colors:** Violet néon (#8B5CF6), Bleu néon (#3B82F6), Blanc (#FFFFFF)
* **Background:** Noir profond (#0D0D0D) sur toutes les scènes
* **Font:** Bold sans-serif pour titres et question, medium sans-serif pour les choix
* **Vibe:** Moderne, gaming, viral, TikTok-ready
* **Avatar:** UTILISE EXCLUSIVEMENT l'avatar configuré via config.avatar_id. Cadrage buste, tiers supérieur de l'écran. Ne change JAMAIS d'avatar entre les scènes.
* **Voice:** Mia — ton naturel, décontracté, fluide, comme une vraie personne
* **Text Overlays:** Toujours dans le tiers inférieur, centrés horizontalement, sous l'avatar. Ombre néon violet sur les titres.

---

# Scene-by-Scene Script

### Scene 1: Accroche
* **Scene Type:** A-roll with Motion Graphics Overlay
* **Visual:** Avatar en buste dans le tiers supérieur sur fond noir. Particules néon violet subtiles en arrière-plan. Texte accroche au centre du tiers inférieur.
* **VO:** "${question.intro_script}"
* **Text Overlay:** "${question.hook}" — bold, grande taille, glow néon violet
* **Duration:** 0:00 - 0:04

### Scene 2: Question + Choix
* **Scene Type:** A-roll with Motion Graphics Overlay
* **Visual:** Avatar lit la question. Overlay texte structuré dans le tiers inférieur : question en haut en bold avec glow violet, puis choix A, B, C listés verticalement avec lettre en néon bleu.
* **VO:** "${question.question} A : ${question.choices.a}. B : ${question.choices.b}. C : ${question.choices.c}."
* **Text Overlay:**
  "${question.question}"
  "A : ${question.choices.a}"
  "B : ${question.choices.b}"
  "C : ${question.choices.c}"
* **Duration:** 0:04 - 0:12

### Scene 3: Décompte suspense
* **Scene Type:** A-roll with Motion Graphics Overlay
* **Visual:** Avatar reste visible avec un regard de suspense. Chiffres 3, 2, 1 s'affichent en GRAND au centre de l'écran avec animation néon rapide. L'avatar NE PARLE PAS dans cette scène — suspense silencieux.
* **VO:** (silence — 2 secondes de suspense uniquement)
* **Text Overlay:** "3 … 2 … 1 …" — très grande taille, animation néon, centré
* **Duration:** 0:12 - 0:14

### Scene 4: Révélation de la réponse
* **Scene Type:** A-roll with Motion Graphics Overlay
* **Visual:** Avatar annonce la réponse avec enthousiasme. La bonne réponse s'affiche en grand au centre avec glow néon bleu. Effet de célébration subtil.
* **VO:** "C'est la réponse ${answerLetter}, ${question.answer_text}. ${question.fun_fact}"
* **Text Overlay:** "✅ Réponse ${answerLetter} : ${question.answer_text}" — bold, glow néon bleu (#3B82F6)
* **Duration:** 0:14 - 0:20

### Scene 5: Conclusion + CTA
* **Scene Type:** A-roll with Motion Graphics Overlay
* **Visual:** Avatar parle l'outro. Logo BigHead Quiz centré en grand (utiliser le fichier joint). Texte CTA sous le logo en néon violet. Fond noir avec effet néon final.
* **VO:** "${question.outro_script}"
* **Text Overlay:** "Télécharge BigHead Quiz !" — néon violet (#8B5CF6), centré
* **Duration:** 0:20 - 0:25

---

**Instruction for Video Agent:** Vidéo portrait 9:16 pour Instagram Reels et TikTok. UTILISE UNIQUEMENT l'avatar configuré — ne sélectionne pas un autre avatar. Fond noir (#0D0D0D) sur TOUTES les scènes sans exception. Palette néon violet (#8B5CF6) et bleu (#3B82F6) uniquement — pas d'autre couleur. Les text overlays doivent être cohérents en style, taille et position d'une scène à l'autre. L'avatar reste TOUJOURS dans le tiers supérieur de l'écran en cadrage buste. Les textes sont TOUJOURS dans le tiers inférieur sous l'avatar. Pas de musique de fond. Durée totale : 25 secondes maximum.`;
}

/** Generate video using HeyGen Video Agent (AI prompt-based) */
export async function generateVideoAgent(
  question: QuizQuestion
): Promise<string> {
  const prompt = buildVideoAgentPrompt(question);

  console.log("  Video Agent prompt (structured Level 4):");
  console.log(`    Question: "${question.question}"`);
  console.log(`    Answer: ${question.answer.toUpperCase()} - ${question.answer_text}`);

  const avatarId = process.env.HEYGEN_AVATAR_ID;
  if (!avatarId) {
    throw new Error("Missing HEYGEN_AVATAR_ID in env (talking photo ID)");
  }

  console.log(`    Avatar ID: ${avatarId}`);

  const body: Record<string, any> = {
    prompt,
    config: {
      avatar_id: avatarId,
      orientation: "portrait",
      duration_sec: 25,
    },
    files: [
      { asset_id: "6a60ac20d2ec473e8b61f7f42e9868b1" }, // bighead-app-icon.png
    ],
  };

  if (process.env.HEYGEN_CALLBACK_URL) {
    body.callback_url = process.env.HEYGEN_CALLBACK_URL;
    body.callback_id = "bighead-quiz-pipeline";
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
