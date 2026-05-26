/**
 * Mix two hex colors with a given ratio.
 * ratio = 0  → returns color `a`
 * ratio = 1  → returns color `b`
 * Anything in between mixes proportionally.
 *
 * Accepts colors with or without a leading "#".
 */
export function mixHex(a: string, b: string, ratio: number): string {
  const pa = parseInt(a.replace("#", ""), 16);
  const pb = parseInt(b.replace("#", ""), 16);
  const ar = (pa >> 16) & 0xff;
  const ag = (pa >> 8) & 0xff;
  const ab = pa & 0xff;
  const br = (pb >> 16) & 0xff;
  const bg = (pb >> 8) & 0xff;
  const bb = pb & 0xff;
  const r = Math.round(ar * (1 - ratio) + br * ratio);
  const g = Math.round(ag * (1 - ratio) + bg * ratio);
  const bl = Math.round(ab * (1 - ratio) + bb * ratio);
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, "0")}`;
}
