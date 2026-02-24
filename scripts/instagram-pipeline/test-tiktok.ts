import "dotenv/config";
import { postVideoToTikTok } from "./src/tiktok.js";

const videoUrl = "https://dqhhpoxqrtlmhosrsdxp.supabase.co/storage/v1/object/public/instagram-videos/reels/quiz-2026-02-24-a3d275cd.mp4";
const title = "Minecraft a battu tous les records de ventes 🎮 #quiz #bighead #gaming #minecraft";

postVideoToTikTok(videoUrl, title)
  .then(r => console.log("Result:", JSON.stringify(r)))
  .catch(e => { console.error("Error:", e.message); process.exit(1); });
