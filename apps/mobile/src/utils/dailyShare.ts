/**
 * Wordle-style shareable text for the Daily Brain. The pasteable emoji grid is
 * what made Wordle spread — a recognizable, image-free result people share into
 * group chats. This is BigHead's free acquisition loop.
 *
 * Example:
 *   BIGHEAD Daily 🧠 4/5
 *   🟩🟩🟥🟩🟩
 *   🔥 3
 *   https://bighead.jrmanagement.org
 */
export function buildDailyShareText(
  results: boolean[],
  streak: number,
  lang: "fr" | "en" = "fr",
  appUrl = "https://bighead.jrmanagement.org",
): string {
  const correct = results.filter(Boolean).length;
  const total = results.length;
  const grid = results.map((r) => (r ? "🟩" : "🟥")).join("");
  const header = `BIGHEAD Daily 🧠 ${correct}/${total}`;
  const streakLine = streak > 0 ? `\n🔥 ${streak}` : "";
  return `${header}\n${grid}${streakLine}\n${appUrl}`;
}
