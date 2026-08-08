export type MathSegment =
  | { kind: "text"; value: string }
  | { kind: "inline"; value: string }
  | { kind: "block"; value: string };

const PATTERN = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g;

/**
 * Splits a bilingual string into prose and math. Shared by the renderer and
 * by the test that compiles every generated formula through KaTeX.
 */
export function splitMath(text: string): MathSegment[] {
  const out: MathSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(PATTERN)) {
    const start = m.index ?? 0;
    if (start > last) out.push({ kind: "text", value: text.slice(last, start) });
    if (m[1] !== undefined) out.push({ kind: "block", value: m[1].trim() });
    else if (m[2] !== undefined) out.push({ kind: "inline", value: m[2].trim() });
    last = start + m[0].length;
  }
  if (last < text.length) out.push({ kind: "text", value: text.slice(last) });
  return out;
}
