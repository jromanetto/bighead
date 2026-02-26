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

// Category → talking_photo_id pool (multiple outfits per category for variety)
const CATEGORY_AVATARS: Record<QuizCategory, string[]> = {
  stars: [
    "65a62fec10cc492c94fa894bb8e067c0",    // Glamorous Nightshade
    "b91eede2c90f4767909ec6e024aee53b",    // Confident Businesswoman Green Suit
    "36418c4572d64c97b105fc962eb61086",    // Professional Dark Blazer
    "cad887f2de1844e2a20da03e5be05cc6",    // emma (classic)
  ],
  sport: [
    "b29c1b21c52343cb9ab1f380807627c1",    // Energetic Athletic
    "9b24cc68d0314c09a82d4220ce5019bd",    // Athlète Urbain
    "2d81ec62e53d45f3a8718b929880c633",    // Torcedora Brasileira
    "a92eeae1acae4a4dba742153ce3435aa",    // Joyful Enthusiast
  ],
  pop_culture: [
    "ffcd7866946348109e59a42b4bc1c68e",    // Pastel Hoodie Trendsetter
    "bfdae66c8b0f4843b4ee80f9feb0d653",    // Casual Chic with a Cap
    "51aacceb3573425591dd7f25a34fbb64",    // Casual Comfort Chic
    "76f51670a1d84df9b0617640f8d92c7e",    // Casual Chic in Gray
    "a92eeae1acae4a4dba742153ce3435aa",    // Joyful Enthusiast
  ],
  musique: [
    "bfdfb0c6ee3e456ab8c752018fb4d28c",    // Rockstar in Leather
    "fd562dd11f1a49ecb3c2cba4a743f836",    // Brave Hearted Sorceress
    "0ceb0034e0c644f9a34a96f415b7975d",    // Casual Glow Enthusiast
  ],
  tech: [
    "329500f8930a45efb8d2bd5f3477380b",    // Neon-Circuit Hooded
    "0ceb0034e0c644f9a34a96f415b7975d",    // Casual Glow Enthusiast
    "36418c4572d64c97b105fc962eb61086",    // Professional Dark Blazer
  ],
  science: [
    "58b38887a8524c82b94164b14b0119b8",    // Elegantly Confident Professional
    "36418c4572d64c97b105fc962eb61086",    // Professional Dark Blazer
    "b91eede2c90f4767909ec6e024aee53b",    // Confident Businesswoman Green Suit
  ],
  geo: [
    "58b38887a8524c82b94164b14b0119b8",    // Elegantly Confident Professional
    "76f51670a1d84df9b0617640f8d92c7e",    // Casual Chic in Gray
    "bfdae66c8b0f4843b4ee80f9feb0d653",    // Casual Chic with a Cap
    "2d81ec62e53d45f3a8718b929880c633",    // Torcedora Brasileira
  ],
  food: [
    "a12176a6a2b5442cb60fe7dd3020f463",    // Pastel Purple Streetwear
    "0ceb0034e0c644f9a34a96f415b7975d",    // Casual Glow Enthusiast
    "51aacceb3573425591dd7f25a34fbb64",    // Casual Comfort Chic
    "a92eeae1acae4a4dba742153ce3435aa",    // Joyful Enthusiast
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Category → realistic background images (Pexels free stock photos)
const CATEGORY_BG_IMAGES: Record<QuizCategory, string[]> = {
  stars: [
    "https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=1080",   // spotlight stage
    "https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=1080",   // red carpet vibes
  ],
  sport: [
    "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1080",
    "https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=1080",     // stadium night
  ],
  pop_culture: [
    "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1080",   // neon lights
    "https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg?auto=compress&cs=tinysrgb&w=1080",   // cinema
  ],
  musique: [
    "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1080",   // concert lights
    "https://images.pexels.com/photos/1644616/pexels-photo-1644616.jpeg?auto=compress&cs=tinysrgb&w=1080",   // DJ stage
  ],
  tech: [
    "https://images.pexels.com/photos/2007647/pexels-photo-2007647.jpeg?auto=compress&cs=tinysrgb&w=1080",   // neon circuit
    "https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=1080",   // tech lights
  ],
  science: [
    "https://images.pexels.com/photos/956981/milky-way-starry-sky-night-sky-star-956981.jpeg?auto=compress&cs=tinysrgb&w=1080",
    "https://images.pexels.com/photos/1274260/pexels-photo-1274260.jpeg?auto=compress&cs=tinysrgb&w=1080",   // cosmos
  ],
  geo: [
    "https://images.pexels.com/photos/1274260/pexels-photo-1274260.jpeg?auto=compress&cs=tinysrgb&w=1080",   // earth nature
    "https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?auto=compress&cs=tinysrgb&w=1080",     // mountain landscape
  ],
  food: [
    "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=1080",     // dark restaurant
    "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1080",   // kitchen ambiance
  ],
};

// Fallback solid colors if image backgrounds fail
const CATEGORY_BG_COLORS: Record<QuizCategory, string> = {
  stars: "#1A0A2E",
  sport: "#0A1628",
  pop_culture: "#1A0F2E",
  musique: "#0D0D0D",
  tech: "#0A0F1A",
  science: "#0D1117",
  geo: "#0F1A0A",
  food: "#1A0F0A",
};

/** Always use Emma's talking_photo_id from env — single avatar across all videos */
function pickAvatarId(): string {
  const id = process.env.HEYGEN_AVATAR_ID;
  if (!id) throw new Error("Missing HEYGEN_AVATAR_ID (talking_photo_id) in env");
  return id;
}

function buildCharacter(talkingPhotoId: string, motionPrompt?: string) {
  return {
    type: "talking_photo" as const,
    talking_photo_id: talkingPhotoId,
    scale: 1.0,
    offset: { x: 0, y: 0 },
    matting: true,
    talking_style: "expressive",
    expression: "happy",
    use_avatar_iv_model: true,
    ...(motionPrompt ? { prompt: motionPrompt, keep_original_prompt: false } : {}),
  };
}

function buildBackground(category?: QuizCategory) {
  if (category && CATEGORY_BG_IMAGES[category]) {
    const url = pickRandom(CATEGORY_BG_IMAGES[category]);
    return { type: "image" as const, url, fit: "cover" as const };
  }
  const color = (category && CATEGORY_BG_COLORS[category]) || "#0D0D0D";
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
  const avatarId = pickAvatarId();
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
        character: buildCharacter(avatarId, "Energetic presenter leaning forward with excitement, expressive hand gestures, smiling"),
        voice: buildVoice(question.intro_script, "Excited"),
        background: bg,
        text: buildText(question.hook, {
          fontSize: 64,
          fontWeight: "bold",
          color: "#FACC15",
          position: { x: 0.06, y: 0.42 },
        }),
      },
      // Scene 2: Question + Choices (6-8s)
      {
        character: buildCharacter(avatarId, "Curious presenter pointing and counting choices with fingers, natural head movements"),
        voice: buildVoice(
          `${question.question} A : ${question.choices.a}. B : ${question.choices.b}. C : ${question.choices.c}.`,
          "Friendly"
        ),
        background: bg,
        text: buildText(choicesText, {
          fontSize: 42,
          fontWeight: "bold",
          color: "#FACC15",
          position: { x: 0.06, y: 0.38 },
        }),
      },
      // Scene 3: Countdown — silent (2s)
      {
        character: buildCharacter(avatarId, "Building suspense, leaning forward with anticipation, counting down with fingers"),
        voice: buildVoice("Trois… deux… un…", "Excited"),
        background: bg,
        text: buildText("3 … 2 … 1 …", {
          fontSize: 96,
          fontWeight: "bold",
          color: "#FACC15",
          position: { x: 0.06, y: 0.42 },
        }),
      },
      // Scene 4: Answer reveal (5-6s)
      {
        character: buildCharacter(avatarId, "Excited reveal, big smile, celebratory hand gestures, nodding enthusiastically"),
        voice: buildVoice(
          `C'est la réponse ${answerLetter}, ${question.answer_text} ! ${question.fun_fact}`,
          "Excited"
        ),
        background: bg,
        text: buildText(`✅ ${answerLetter} : ${question.answer_text}`, {
          fontSize: 56,
          fontWeight: "bold",
          color: "#4ADE80",
          position: { x: 0.06, y: 0.42 },
        }),
      },
      // Scene 5: Outro + CTA (3-4s)
      {
        character: buildCharacter(avatarId, "Friendly wave, warm smile, inviting gesture pointing down toward the link"),
        voice: buildVoice(question.outro_script, "Friendly"),
        background: bg,
        text: buildText("Télécharge BigHead Quiz !", {
          fontSize: 56,
          fontWeight: "bold",
          color: "#FACC15",
          position: { x: 0.06, y: 0.42 },
        }),
      },
    ],
    dimension: { width: 1080, height: 1920 },
    caption: false,
  };

  // Log with first scene's character for reference
  const firstChar = videoConfig.video_inputs[0].character;
  console.log("  v2 API + Avatar IV — 5 scenes, animated talking_photo:");
  console.log(`    Category: ${category}`);
  console.log(`    Question: "${question.question}"`);
  console.log(`    Answer: ${answerLetter} - ${question.answer_text}`);
  console.log(`    Avatar (talking_photo_id): ${firstChar.talking_photo_id}`);
  console.log(`    Background: ${bg.type === "image" ? "image (realistic)" : bg.value}`);
  console.log(`    Avatar IV: enabled (expressive + motion prompts)`);

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
