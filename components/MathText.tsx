"use client";

import { Fragment, useMemo } from "react";
import { InlineMath, BlockMath } from "react-katex";
import { splitMath } from "@/lib/mathText";

/** Renders **bold** runs and optional highlighted cue phrases in prose. */
function decorate(text: string, highlight?: string[]) {
  const bolded = text.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`b${i}`} className="font-medium">
        {part}
      </strong>
    ) : (
      <Fragment key={`b${i}`}>{mark(part, highlight)}</Fragment>
    ),
  );
  return bolded;
}

/**
 * Wraps the literal trigger phrases so a student sees the exact words that
 * identify the pattern, in the real wording of the question rather than a
 * paraphrase of it.
 */
function mark(text: string, highlight?: string[]) {
  if (!highlight || highlight.length === 0) return text;
  const escaped = highlight
    .filter(Boolean)
    .map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  if (escaped.length === 0) return text;

  // split() with a capturing group puts every match at an odd index; do not
  // use re.test() to decide, since a /g regex carries lastIndex between calls.
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "gi"));
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark
        key={`m${i}`}
        className="rounded-sm bg-pattern-soft px-0.5 text-pattern"
      >
        {part}
      </mark>
    ) : (
      <Fragment key={`m${i}`}>{part}</Fragment>
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
  highlight,
}: {
  text: string;
  className?: string;
  /** Literal phrases to visually mark inside the prose. */
  highlight?: string[];
}) {
  const segments = useMemo(() => splitMath(text), [text]);

  return (
    <div className={className}>
      {segments.map((seg, i) => {
        if (seg.kind === "text")
          return <span key={i}>{decorate(seg.value, highlight)}</span>;
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
