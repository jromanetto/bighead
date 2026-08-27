/**
 * Wordle-style shareable text for the Daily Brain. The pasteable emoji grid is
 * what made Wordle spread — a recognizable, image-free result people share into
 * group chats. This is BigHead's free acquisition loop.
 *
 * Example:
 *   BIGHEAD Daily 🧠 4/5
 *   🟩🟩🟥🟩🟩
 *   🔥 3
 *   Tu fais mieux ? 👀
 *   https://apps.apple.com/app/id6758253365
 */
import { INSTALL_URL } from "./storeLinks";

export function buildDailyShareText(
  results: boolean[],
  streak: number,
  lang: "fr" | "en" = "fr",
  appUrl = INSTALL_URL,
): string {
  const correct = results.filter(Boolean).length;
  const total = results.length;
  const grid = results.map((r) => (r ? "🟩" : "🟥")).join("");
  const header = `BIGHEAD Daily 🧠 ${correct}/${total}`;
  const streakLine = streak > 0 ? `\n🔥 ${streak}` : "";
  // Hook « bats mon score » = ce qui transforme le flex Wordle en install.
  const cta = lang === "fr" ? "Tu fais mieux ? 👀" : "Can you beat me? 👀";
  return `${header}\n${grid}${streakLine}\n${cta}\n${appUrl}`;
}
