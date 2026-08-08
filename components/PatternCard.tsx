"use client";

import { useState } from "react";
import type { Lang, Pattern } from "@/lib/types";
import { t } from "@/lib/i18n";
import { MathText } from "./MathText";

/**
 * The teaching centrepiece, styled as an index card from a mathematician's
 * card box. Ochre is used here and nowhere else in the app, so the colour
 * itself comes to mean "this is the transferable part".
 */
export function PatternCard({
  pattern,
  lang,
  title,
  plateNumber,
  defaultOpen = true,
  compact = false,
}: {
  pattern: Pattern;
  lang: Lang;
  title: string;
  plateNumber?: number;
  defaultOpen?: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="graph-ochre overflow-hidden rounded-2xl border border-pattern/25 bg-raised">
      <header className="flex items-baseline gap-3 border-b border-pattern/20 bg-pattern-soft/70 px-5 py-3.5">
        <span className="plate text-pattern">
          {plateNumber !== undefined
            ? `${String(plateNumber).padStart(2, "0")} · `
            : ""}
          {t("thePattern", lang)}
        </span>
        <h2 className="ms-auto text-end font-serif text-[1.02rem] leading-tight font-medium text-ink">
          {title}
        </h2>
      </header>

      <div className="space-y-7 px-5 py-6 sm:px-7">
        <p className="font-serif text-[1.12rem] leading-snug text-pattern">
          <MathText text={pattern.method[lang]} className="inline" />
        </p>

        <Block label={t("howToSpot", lang)}>
          <ul className="space-y-1.5">
            {pattern.signature.map((s, i) => (
              <li key={i} className="flex gap-2.5">
                <span
                  aria-hidden
                  className="mt-[0.62em] h-[3px] w-[3px] shrink-0 bg-pattern"
                />
                <MathText
                  text={s[lang]}
                  className="font-serif text-[1rem] leading-relaxed"
                />
              </li>
            ))}
          </ul>
        </Block>

        <Block label={t("theMethod", lang)}>
          <ol className="space-y-4">
            {pattern.recipe.map((step, i) => (
              <li key={i} className="flex gap-3.5">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-pattern/45 bg-raised font-mono text-[0.7rem] text-pattern"
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <MathText
                    text={step.move[lang]}
                    className="font-serif text-[1.04rem] leading-snug font-medium"
                  />
                  {!compact && (
                    <MathText
                      text={step.detail[lang]}
                      className="mt-1 font-serif text-[0.97rem] leading-relaxed text-muted"
                    />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Block>

        {!compact && (
          <>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="plate flex w-full items-center gap-2 text-faint transition-colors hover:text-pattern"
            >
              <span
                aria-hidden
                className={`inline-block transition-transform ${open ? "rotate-90" : ""}`}
              >
                ›
              </span>
              {t("whyItWorks", lang)}
            </button>

            {open && (
              <div className="rise space-y-7">
                <MathText
                  text={pattern.whyItWorks[lang]}
                  className="border-s-2 border-pattern/30 ps-4 font-serif text-[1rem] leading-relaxed text-ink/85"
                />

                <Block label={t("speedTip", lang)}>
                  <MathText
                    text={pattern.speedTip[lang]}
                    className="font-serif text-[1rem] leading-relaxed"
                  />
                </Block>

                <Block label={t("watchOut", lang)}>
                  <ul className="space-y-1.5">
                    {pattern.watchOut.map((w, i) => (
                      <li key={i} className="flex gap-2.5">
                        <span
                          aria-hidden
                          className="mt-[0.1em] shrink-0 font-mono text-[0.8rem] text-wrong"
                        >
                          ✕
                        </span>
                        <MathText
                          text={w[lang]}
                          className="font-serif text-[1rem] leading-relaxed"
                        />
                      </li>
                    ))}
                  </ul>
                </Block>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Block({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="plate mb-2.5 text-faint">{label}</div>
      {children}
    </div>
  );
}
