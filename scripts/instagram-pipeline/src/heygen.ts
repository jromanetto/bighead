import type { QuizQuestion, QuizCategory } from "./generate-question.js";

const HEYGEN_BASE = "https://api.heygen.com";

function headers() {
  return {
    "X-Api-Key": process.env.HEYGEN_API_KEY!,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

// ============================================================
// v2 API helpers — deterministic avatar via talking_photo_id
// ============================================================

// Category → talking_photo_id mapping (Emma avatar looks)
const CATEGORY_AVATAR: Record<QuizCategory, string> = {
  stars: "65a62fec10cc492c94fa894bb8e067c0",    // Glamorous Nightshade
  sport: "b29c1b21c52343cb9ab1f380807627c1",    // Energetic Athletic Avatar
  pop_culture: "ffcd7866946348109e59a42b4bc1c68e", // Pastel Hoodie Trendsetter
  musique: "bfdfb0c6ee3e456ab8c752018fb4d28c",  // Rockstar in Leather
  tech: "329500f8930a45efb8d2bd5f3477380b",     // Neon-Circuit Hooded Avatar
  science: "58b38887a8524c82b94164b14b0119b8",   // Elegantly Confident Professional
  geo: "58b38887a8524c82b94164b14b0119b8",       // Elegantly Confident Professional
  food: "a12176a6a2b5442cb60fe7dd3020f463",     // Pastel Purple Streetwear Guru
};

// Category → background color
const CATEGORY_BG: Record<QuizCategory, string> = {
  stars: "#1A0A2E",     // deep purple / glam
  sport: "#0A1628",     // dark navy / stadium
  pop_culture: "#1A0F2E", // dark violet
  musique: "#0D0D0D",   // black / concert
  tech: "#0A0F1A",      // dark blue / cyber
  science: "#0D1117",   // dark grey / lab
  geo: "#0F1A0A",       // dark green / nature
  food: "#1A0F0A",      // warm dark brown
};

function buildCharacter(category?: QuizCategory) {
  const fallbackId = process.env.HEYGEN_AVATAR_ID;
  const talkingPhotoId = (category && CATEGORY_AVATAR[category]) || fallbackId;
  if (!talkingPhotoId) {
    throw new Error("Missing HEYGEN_AVATAR_ID (talking_photo_id) in env");
  }
  return {
    type: "talking_photo" as const,
    talking_photo_id: talkingPhotoId,
    scale: 0.7,
    offset: { x: 0, y: -0.25 },
    matting: true,
    talking_photo_style: "circle",
    talking_style: "stable",
    expression: "default",
  };
}

function buildBackground(category?: QuizCategory) {
  const color = (category && CATEGORY_BG[category]) || "#0D0D0D";
  return { type: "color" as const, value: color };
}

function buildVoice(
  inputText: string,
  emotion: "Excited" | "Friendly" = "Friendly"
) {
  const voiceId = process.env.HEYGEN_VOICE_ID;
  if (!voiceId) {
    throw new Error("Missing HEYGEN_VOICE_ID in env");
  }
  return {
    type: "text" as const,
    voice_id: voiceId,
    input_text: inputText,
    emotion,
    speed: 1.0,
  };
}

function buildSilence(durationSec: number) {
  return {
    type: "silence" as const,
    duration: String(durationSec),
  };
}

function buildText(
  content: string,
  options: {
    fontSize?: number;
    fontWeight?: "normal" | "bold";
    color?: string;
    position?: { x: number; y: number };
    width?: number;
    textAlign?: "left" | "center" | "right";
  } = {}
) {
  return {
    type: "text" as const,
    text: content,
    font_size: options.fontSize ?? 24,
    font_weight: options.fontWeight ?? "normal",
    color: options.color ?? "#FFFFFF",
    position: options.position ?? { x: 0.06, y: 0.7 },
    width: options.width ?? 950,
    text_align: options.textAlign ?? "center",
    line_height: 1.4,
  };
}

// ============================================================
// generateVideo — v2 API, 5 scenes, guaranteed avatar
// ============================================================

/**
 * Generate a quiz video using HeyGen v2 API (/v2/video/generate).
 *
 * Uses talking_photo_id for DETERMINISTIC avatar selection (Emma/Mia).
 * The Video Agent API (/v1/video_agent/generate) was deprecated because
 * config.avatar_id is only a hint — the AI can and does ignore it.
 *
 * 5 scenes: Hook → Question+Choices → Countdown → Answer → Outro
 */
export async function generateVideo(
  question: QuizQuestion
): Promise<string> {
  const answerLetter = question.answer.toUpperCase();
  const category = question.category;
  const character = buildCharacter(category);
  const bg = buildBackground(category);

  // Combine question + choices into a single text overlay
  const choicesText = [
    question.question,
    "",
    `A : ${question.choices.a}`,
    `B : ${question.choices.b}`,
    `C : ${question.choices.c}`,
  ].join("\n");

  const videoConfig = {
    title: `BigHead Quiz - ${question.question.slice(0, 50)}`,
    video_inputs: [
      // Scene 1: Hook / Intro (3-4s)
      {
        character,
        voice: buildVoice(question.intro_script, "Excited"),
        background: bg,
        text: buildText(question.hook, {
          fontSize: 48,
          fontWeight: "bold",
          color: "#8B5CF6",
          position: { x: 0.06, y: 0.58 },
        }),
      },
      // Scene 2: Question + Choices (6-8s)
      {
        character,
        voice: buildVoice(
          `${question.question} A : ${question.choices.a}. B : ${question.choices.b}. C : ${question.choices.c}.`,
          "Friendly"
        ),
        background: bg,
        text: buildText(choicesText, {
          fontSize: 32,
          fontWeight: "bold",
          color: "#FFFFFF",
          position: { x: 0.06, y: 0.53 },
        }),
      },
      // Scene 3: Countdown — silent (2s)
      {
        character,
        voice: buildSilence(2),
        background: bg,
        text: buildText("3 … 2 … 1 …", {
          fontSize: 72,
          fontWeight: "bold",
          color: "#8B5CF6",
          position: { x: 0.06, y: 0.58 },
        }),
      },
      // Scene 4: Answer reveal (5-6s)
      {
        character,
        voice: buildVoice(
          `C'est la réponse ${answerLetter}, ${question.answer_text} ! ${question.fun_fact}`,
          "Excited"
        ),
        background: bg,
        text: buildText(`✅ ${answerLetter} : ${question.answer_text}`, {
          fontSize: 44,
          fontWeight: "bold",
          color: "#3B82F6",
          position: { x: 0.06, y: 0.58 },
        }),
      },
      // Scene 5: Outro + CTA (3-4s)
      {
        character,
        voice: buildVoice(question.outro_script, "Friendly"),
        background: bg,
        text: buildText("Télécharge BigHead Quiz !", {
          fontSize: 44,
          fontWeight: "bold",
          color: "#8B5CF6",
          position: { x: 0.06, y: 0.58 },
        }),
      },
    ],
    dimension: { width: 1080, height: 1920 },
    caption: false,
  };

  console.log("  v2 API — 5 scenes, deterministic avatar:");
  console.log(`    Category: ${category}`);
  console.log(`    Question: "${question.question}"`);
  console.log(`    Answer: ${answerLetter} - ${question.answer_text}`);
  console.log(`    Avatar (talking_photo_id): ${character.talking_photo_id}`);
  console.log(`    Background: ${bg.value}`);

  const res = await fetch(`${HEYGEN_BASE}/v2/video/generate`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(videoConfig),
  });

  const data = await res.json();

  if (!data?.data?.video_id) {
    console.error("HeyGen v2 response:", JSON.stringify(data, null, 2));
    throw new Error(
      `HeyGen v2 generation failed: ${JSON.stringify(data?.error || data)}`
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
