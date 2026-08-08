"use client";

import { useRef } from "react";
import type { AnswerField, Lang } from "@/lib/types";
import { MathText } from "./MathText";

/** Small insert-at-cursor palette. `move` backs the caret up into the parens. */
const TOOLS: { label: string; insert: string; move?: number }[] = [
  { label: "√", insert: "sqrt()", move: -1 },
  { label: "a/b", insert: "/" },
  { label: "x²", insert: "^2" },
  { label: "xⁿ", insert: "^" },
  { label: "ln", insert: "ln()", move: -1 },
  { label: "e", insert: "e" },
  { label: "∫", insert: "∫" },
  { label: "π", insert: "pi" },
  { label: "∞", insert: "infinity" },
  { label: "( )", insert: "()", move: -1 },
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
        : "border-line focus-within:border-accent";

  return (
    <div>
      <label
        htmlFor={`field-${field.id}`}
        className="mb-2 flex items-baseline gap-2 text-[0.9rem] text-muted"
      >
        <MathText text={field.prompt[lang]} className="inline" />
      </label>

      <div
        className={`flex items-stretch overflow-hidden rounded-xl border bg-raised transition-colors ${border}`}
      >
        {field.label && (
          <span
            className="math-ltr flex items-center border-e border-line/70 bg-paper px-3 font-serif text-[0.95rem] text-muted"
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
              onSubmit();
            }
          }}
          className="w-full bg-transparent px-3.5 py-3 font-serif text-[1.05rem] outline-none placeholder:text-faint/70 disabled:text-muted"
        />
      </div>

      {!disabled && (
        <div className="-mx-1 mt-2 flex gap-1 overflow-x-auto pb-1">
          {TOOLS.map((tool) => (
            <button
              key={tool.label}
              type="button"
              tabIndex={-1}
              onClick={() => insert(tool)}
              className="math-ltr shrink-0 rounded-lg border border-line bg-raised px-2.5 py-1.5 font-serif text-[0.85rem] text-muted transition-colors hover:border-accent hover:text-accent active:bg-accent-soft"
            >
              {tool.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
