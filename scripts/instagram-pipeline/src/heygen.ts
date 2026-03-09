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
// v2 API — deterministic avatar, reliable rendering
// ============================================================

// Category → talking_photo_id with outfit matching the theme
const CATEGORY_AVATARS: Record<QuizCategory, string[]> = {
  stars: [
    "65a62fec10cc492c94fa894bb8e067c0",    // Glamorous Nightshade
    "b91eede2c90f4767909ec6e024aee53b",    // Confident Businesswoman Green Suit
    "36418c4572d64c97b105fc962eb61086",    // Professional Dark Blazer
  ],
  sport: [
    "b29c1b21c52343cb9ab1f380807627c1",    // Energetic Athletic
    "9b24cc68d0314c09a82d4220ce5019bd",    // Athlète Urbain
    "2d81ec62e53d45f3a8718b929880c633",    // Torcedora Brasileira
  ],
  pop_culture: [
    "ffcd7866946348109e59a42b4bc1c68e",    // Pastel Hoodie Trendsetter
    "bfdae66c8b0f4843b4ee80f9feb0d653",    // Casual Chic with a Cap
    "51aacceb3573425591dd7f25a34fbb64",    // Casual Comfort Chic
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
    "bfdae66c8b0f4843b4ee80f9feb0d653",    // Casual Chic with a Cap
    "2d81ec62e53d45f3a8718b929880c633",    // Torcedora Brasileira
  ],
  food: [
    "a12176a6a2b5442cb60fe7dd3020f463",    // Pastel Purple Streetwear
    "0ceb0034e0c644f9a34a96f415b7975d",    // Casual Glow Enthusiast
    "51aacceb3573425591dd7f25a34fbb64",    // Casual Comfort Chic
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Category → realistic indoor background images (Pexels free stock photos)
// These look like real rooms/studios so Mia appears to be filming from a real place
const CATEGORY_BG_IMAGES: Record<QuizCategory, string[]> = {
  stars: [
    "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920",  // luxury living room
    "https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=1920",  // modern glam interior
  ],
  sport: [
    "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=1920",  // gym / fitness room
    "https://images.pexels.com/photos/3076516/pexels-photo-3076516.jpeg?auto=compress&cs=tinysrgb&w=1920",  // sports locker room vibes
  ],
  pop_culture: [
    "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1920",  // gaming setup with LED lights
    "https://images.pexels.com/photos/1444416/pexels-photo-1444416.jpeg?auto=compress&cs=tinysrgb&w=1920",  // neon lit room
  ],
  musique: [
    "https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=1920",    // music studio with instruments
    "https://images.pexels.com/photos/6966/abstract-music-rock-bw.jpg?auto=compress&cs=tinysrgb&w=1920",   // music studio dark vibe
  ],
  tech: [
    "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=1920",  // modern desk setup with monitors
    "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=1920",  // clean tech workspace
  ],
  science: [
    "https://images.pexels.com/photos/2041540/pexels-photo-2041540.jpeg?auto=compress&cs=tinysrgb&w=1920",  // library with books
    "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1920", // bookshelf wall
  ],
  geo: [
    "https://images.pexels.com/photos/2079246/pexels-photo-2079246.jpeg?auto=compress&cs=tinysrgb&w=1920",  // cozy room with world map
    "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1920",  // warm living room
  ],
  food: [
    "https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=1920",  // restaurant interior
    "https://images.pexels.com/photos/2544829/pexels-photo-2544829.jpeg?auto=compress&cs=tinysrgb&w=1920",  // modern kitchen
  ],
};

// Fallback solid colors if image download fails on HeyGen side
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


/** Always use the same Mia avatar — consistent identity across all videos */
function getAvatarId(): string {
  const id = process.env.HEYGEN_AVATAR_ID;
  if (!id) throw new Error("Missing HEYGEN_AVATAR_ID in env");
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

function buildBackground(category: QuizCategory) {
  // Use realistic indoor image backgrounds so Mia looks like she's in a real place
  const images = CATEGORY_BG_IMAGES[category];
  if (images && images.length > 0) {
    return { type: "image" as const, url: pickRandom(images), fit: "cover" as const };
  }
  // Fallback to solid color
  const color = CATEGORY_BG_COLORS[category] || "#0D0D0D";
  return { type: "color" as const, value: color };
}

export type VideoLang = "fr" | "en";

function getVoiceId(lang: VideoLang): string {
  if (lang === "en") {
    const id = process.env.HEYGEN_VOICE_ID_EN;
    if (!id) throw new Error("Missing HEYGEN_VOICE_ID_EN in env");
    return id;
  }
  const id = process.env.HEYGEN_VOICE_ID;
  if (!id) throw new Error("Missing HEYGEN_VOICE_ID in env");
  return id;
}

function buildVoice(
  inputText: string,
  lang: VideoLang,
  emotion: "Excited" | "Friendly" = "Friendly"
) {
  return {
    type: "text" as const,
    voice_id: getVoiceId(lang),
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
// generateVideo — v2 API, 5 scenes with cliffhanger format
// ============================================================

/**
 * Generate a quiz video using HeyGen v2 API (/v2/video/generate).
 *
 * Improvements:
 * 1. Category-matched video backgrounds (immersive loops)
 * 2. Avatar dressed per category (different talking_photo_ids)
 * 3. Question & choices split into 2 scenes with pause
 * 4. Silent countdown (no voice, just visual)
 * 5. Larger, bolder text overlays for mobile readability
 *
 * 5 scenes: Hook → Question → Choices → Silent Countdown → CTA Teaser
 */
export async function generateVideo(
  question: QuizQuestion,
  lang: VideoLang = "fr"
): Promise<string> {
  const answerLetter = question.answer.toUpperCase();
  const category = question.category;
  const avatarId = getAvatarId();
  const bg = buildBackground(category);
  const isFr = lang === "fr";

  // Choices formatted for overlay
  const choicesText = [
    `A : ${question.choices.a}`,
    `B : ${question.choices.b}`,
    `C : ${question.choices.c}`,
  ].join("\n");

  // Language-specific spoken text
  const choicesVoice = isFr
    ? `Réponse A : ${question.choices.a}. Réponse B : ${question.choices.b}. Réponse C : ${question.choices.c}.`
    : `Answer A: ${question.choices.a}. Answer B: ${question.choices.b}. Answer C: ${question.choices.c}.`;

  const answerVoice = isFr
    ? `Alors, tu connais la réponse ? Mets-la en commentaire et télécharge BigHead !`
    : `So, do you know the answer? Drop it in the comments and download BigHead!`;

  const ctaText = isFr
    ? "💬 Ta réponse en commentaire !\n👇 Lien en bio"
    : "💬 Your answer in the comments!\n👇 Link in bio";

  const videoConfig = {
    title: `BigHead Quiz [${lang.toUpperCase()}] - ${question.question.slice(0, 50)}`,
    video_inputs: [
      // Scene 1: Hook / Intro (3-4s)
      {
        character: buildCharacter(avatarId, "Energetic presenter leaning forward with excitement, expressive hand gestures, smiling"),
        voice: buildVoice(question.intro_script, lang, "Excited"),
        background: bg,
        text: buildText(question.hook, {
          fontSize: 72,
          fontWeight: "bold",
          color: "#FACC15",
          position: { x: 0.05, y: 0.40 },
          width: 980,
        }),
      },
      // Scene 2: Question ONLY (4-5s) — no choices yet
      {
        character: buildCharacter(avatarId, "Curious presenter tilting head, raising one finger, natural head movements"),
        voice: buildVoice(question.question, lang, "Friendly"),
        background: bg,
        text: buildText(question.question, {
          fontSize: 52,
          fontWeight: "bold",
          color: "#FFFFFF",
          position: { x: 0.05, y: 0.38 },
          width: 980,
        }),
      },
      // Scene 3: Choices appear (4-5s) — after a brief pause
      {
        character: buildCharacter(avatarId, "Pointing and counting choices with fingers, expressive gestures for each option"),
        voice: buildVoice(choicesVoice, lang, "Friendly"),
        background: bg,
        text: buildText(choicesText, {
          fontSize: 48,
          fontWeight: "bold",
          color: "#FFFFFF",
          position: { x: 0.05, y: 0.40 },
          width: 980,
        }),
      },
      // Scene 4: Silent countdown (3s) — NO voice, pure visual
      {
        character: buildCharacter(avatarId, "Building suspense, leaning forward with anticipation, eyes wide"),
        voice: buildSilence(3),
        background: bg,
        text: buildText("3  …  2  …  1", {
          fontSize: 100,
          fontWeight: "bold",
          color: "#FACC15",
          position: { x: 0.05, y: 0.40 },
          width: 980,
        }),
      },
      // Scene 5: CTA — answer is in the app (4-5s)
      {
        character: buildCharacter(avatarId, "Excited pointing down toward the link, big smile, inviting gesture"),
        voice: buildVoice(answerVoice, lang, "Excited"),
        background: bg,
        text: buildText(ctaText, {
          fontSize: 64,
          fontWeight: "bold",
          color: "#FACC15",
          position: { x: 0.05, y: 0.40 },
          width: 980,
        }),
      },
    ],
    dimension: { width: 1080, height: 1920 },
    caption: false,
  };

  console.log(`  v2 API — 5 scenes [${lang.toUpperCase()}]:`);
  console.log(`    Category: ${category}`);
  console.log(`    Question: "${question.question}"`);
  console.log(`    Answer: ${answerLetter} - ${question.answer_text}`);
  console.log(`    Avatar (talking_photo_id): ${avatarId}`);
  console.log(`    Background: ${bg.type} (${category} theme)`);
  console.log(`    Voice: ${lang.toUpperCase()}`);
  console.log(`    Countdown: SILENT (visual only)`);

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
