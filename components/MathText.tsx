"use client";

import { useMemo } from "react";
import { InlineMath, BlockMath } from "react-katex";
import { splitMath } from "@/lib/mathText";

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
