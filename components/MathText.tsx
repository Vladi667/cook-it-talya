"use client";

import { useMemo } from "react";
import { InlineMath, BlockMath } from "react-katex";

type Segment =
  | { kind: "text"; value: string }
  | { kind: "inline"; value: string }
  | { kind: "block"; value: string };

const PATTERN = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g;

export function splitMath(text: string): Segment[] {
  const out: Segment[] = [];
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

/** Renders **bold** runs inside a plain-text segment. */
function emphasise(text: string) {
  if (!text.includes("**")) return text;
  return text
    .split("**")
    .map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="font-medium">
          {part}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
}

/**
 * Renders a bilingual string containing $inline$ and $$display$$ math.
 * Math is always isolated LTR so it stays correct inside Hebrew RTL text.
 */
export function MathText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const segments = useMemo(() => splitMath(text), [text]);

  return (
    <div className={className}>
      {segments.map((seg, i) => {
        if (seg.kind === "text") return <span key={i}>{emphasise(seg.value)}</span>;
        if (seg.kind === "inline")
          return (
            <span key={i} className="math-ltr">
              <InlineMath math={seg.value} />
            </span>
          );
        return (
          <div key={i} className="math-ltr">
            <BlockMath math={seg.value} />
          </div>
        );
      })}
    </div>
  );
}
