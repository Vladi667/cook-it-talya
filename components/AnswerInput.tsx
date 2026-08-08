"use client";

import { useRef } from "react";
import type { AnswerField, Lang } from "@/lib/types";
import { MathText } from "./MathText";

/**
 * Insert-at-cursor palette. `move` backs the caret up into the parentheses.
 *
 * Ordered by how often it is actually needed while drilling, because on a
 * phone the first six keys are the ones reachable without thinking.
 */
const TOOLS: { label: string; insert: string; move?: number }[] = [
  { label: "√", insert: "sqrt()", move: -1 },
  { label: "xⁿ", insert: "^" },
  { label: "x²", insert: "^2" },
  { label: "( )", insert: "()", move: -1 },
  { label: "ln", insert: "ln()", move: -1 },
  { label: "e", insert: "e" },
  { label: "π", insert: "pi" },
  { label: "∞", insert: "infinity" },
  { label: "/", insert: "/" },
  { label: "∫", insert: "∫" },
  { label: "≠", insert: "!=" },
  { label: "∪", insert: "U" },
];

export function AnswerInput({
  field,
  value,
  lang,
  disabled,
  status,
  onChange,
  onSubmit,
  autoFocus,
}: {
  field: AnswerField;
  value: string;
  lang: Lang;
  disabled?: boolean;
  status?: "correct" | "incorrect";
  onChange: (value: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const insert = (tool: (typeof TOOLS)[number]) => {
    const el = ref.current;
    if (!el || disabled) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + tool.insert + value.slice(end);
    onChange(next);
    const caret = start + tool.insert.length + (tool.move ?? 0);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  const border =
    status === "correct"
      ? "border-accent"
      : status === "incorrect"
        ? "border-wrong"
        : "border-rule focus-within:border-accent";

  return (
    <div>
      <label
        htmlFor={`field-${field.id}`}
        className="mb-2 flex items-baseline gap-2 text-[0.92rem] text-muted"
      >
        <MathText text={field.prompt[lang]} className="inline" />
      </label>

      <div
        className={`flex items-stretch overflow-hidden rounded-xl border bg-raised transition-colors ${border}`}
      >
        {field.label && (
          <span
            className="math-ltr flex items-center border-e border-rule/70 bg-paper px-3 font-serif text-[0.95rem] text-muted"
            aria-hidden
          >
            {field.label}
          </span>
        )}
        <input
          id={`field-${field.id}`}
          ref={ref}
          type="text"
          inputMode="text"
          enterKeyHint="done"
          dir="ltr"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus={autoFocus}
          disabled={disabled}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSubmit) {
              e.preventDefault();
              (e.currentTarget as HTMLInputElement).blur();
              onSubmit();
            }
          }}
          className="w-full bg-transparent px-3.5 py-3.5 font-serif text-[1.05rem] outline-none placeholder:text-faint/70 disabled:text-muted"
        />
      </div>

      {!disabled && (
        // A grid, not a scrolling strip: every key stays visible and reachable
        // on a 360px screen instead of hiding past the right edge.
        <div className="mt-2 grid grid-cols-6 gap-1.5 sm:flex sm:flex-wrap">
          {TOOLS.map((tool) => (
            <button
              key={tool.label}
              type="button"
              tabIndex={-1}
              onClick={() => insert(tool)}
              aria-label={`insert ${tool.label}`}
              className="math-ltr tap flex items-center justify-center rounded-lg border border-rule bg-raised font-serif text-[1rem] text-muted transition-colors select-none hover:border-accent hover:text-accent active:bg-accent-soft active:scale-95 sm:min-h-0 sm:min-w-0 sm:px-3 sm:py-2 sm:text-[0.9rem]"
            >
              {tool.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
