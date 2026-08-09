"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { t, tx } from "@/lib/i18n";
import { loadChecker, warmChecker } from "@/lib/lazyChecker";
import {
  MICRO_ATOMS,
  MICRO_IDS,
  MICRO_ROUND,
  makeMicroRound,
  type MicroId,
  type MicroItem,
} from "@/lib/micro";
import { MathText } from "@/components/MathText";
import { ActionBar } from "@/components/ActionBar";

/**
 * Sixty seconds on one sub-skill. No method to choose, no parts to juggle —
 * just the atom, ten times, until it costs nothing.
 */
export default function QuickPage() {
  const ready = useApp((s) => s.ready);
  const lang = useApp((s) => s.lang);

  const [atomId, setAtomId] = useState<MicroId | null>(null);
  const [items, setItems] = useState<MicroItem[]>([]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [verdict, setVerdict] = useState<null | boolean>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const startedAt = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    warmChecker();
  }, []);

  const begin = (id: MicroId) => {
    setAtomId(id);
    setItems(makeMicroRound(id));
    setIndex(0);
    setValue("");
    setVerdict(null);
    setResults([]);
    startedAt.current = Date.now();
  };

  const item = items[index];

  const submit = async () => {
    if (!item || verdict !== null) return;
    const { checkAnswer } = await loadChecker();
    const ok = checkAnswer(value, item.expected, item.type).correct;
    setVerdict(ok);
    setResults((r) => [...r, ok]);
  };

  const next = () => {
    setVerdict(null);
    setValue("");
    setIndex((i) => i + 1);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  if (!ready) return <p className="plate text-faint">{t("loading", lang)}</p>;

  /* ---------------------------------------------------------------- pick */
  if (!atomId) {
    return (
      <div className="stagger space-y-8">
        <header>
          <div className="plate text-accent">{t("quickTitle", lang)}</div>
          <p className="mt-3 max-w-prose font-serif text-[1.1rem] leading-relaxed text-ink/90">
            {t("quickIntro", lang)}
          </p>
        </header>

        <ul className="space-y-2">
          {MICRO_IDS.map((id) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => begin(id)}
                className="tap w-full rounded-xl border border-rule bg-raised px-4 py-3 text-start transition-colors hover:border-accent"
              >
                <span className="font-serif text-[1.02rem]">
                  {tx(MICRO_ATOMS[id].name, lang)}
                </span>
                <span className="plate mt-0.5 block text-faint">
                  {tx(MICRO_ATOMS[id].usedIn, lang)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  /* ------------------------------------------------------------- summary */
  if (!item) {
    const score = results.filter(Boolean).length;
    const seconds = (Date.now() - startedAt.current) / 1000;
    return (
      <div className="stagger space-y-8">
        <header>
          <div className="plate text-faint">{t("roundDone", lang)}</div>
          <div className="mt-2 font-serif text-5xl tabular-nums">
            {score}
            <span className="text-faint">/{results.length}</span>
          </div>
          <p className="plate mt-2 text-faint tabular-nums">
            {(seconds / Math.max(1, results.length)).toFixed(1)}s{" "}
            {t("perItem", lang)} · {tx(MICRO_ATOMS[atomId].name, lang)}
          </p>
        </header>

        <ActionBar>
          <button
            type="button"
            onClick={() => begin(atomId)}
            className="tap flex-1 rounded-lg bg-accent px-6 text-[0.95rem] font-medium text-paper sm:flex-none sm:py-3"
          >
            {t("againRound", lang)}
          </button>
          <button
            type="button"
            onClick={() => setAtomId(null)}
            className="tap px-3 text-[0.85rem] text-muted underline decoration-rule underline-offset-4"
          >
            {t("changeAtom", lang)}
          </button>
        </ActionBar>
      </div>
    );
  }

  /* ---------------------------------------------------------------- item */
  return (
    <div className="space-y-7">
      <div className="flex items-center gap-3">
        <Link href="/quick" onClick={() => setAtomId(null)} className="plate text-faint">
          {tx(MICRO_ATOMS[atomId].name, lang)}
        </Link>
        <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-sunken">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${(index / MICRO_ROUND) * 100}%` }}
          />
        </div>
        <span className="plate tabular-nums text-faint">
          {results.filter(Boolean).length}✓
        </span>
      </div>

      <div key={index} className="rise math-ltr py-2 text-center">
        <MathText text={`$$${item.prompt}$$`} className="font-serif" />
      </div>

      <div
        className={`flex items-stretch overflow-hidden rounded-xl border bg-raised transition-colors ${
          verdict === null
            ? "border-rule focus-within:border-accent"
            : verdict
              ? "border-accent"
              : "border-wrong"
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          enterKeyHint="done"
          dir="ltr"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          autoFocus
          disabled={verdict !== null}
          value={value}
          placeholder={item.placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (verdict === null) void submit();
            else next();
          }}
          className="w-full bg-transparent px-4 py-3.5 font-serif text-[1.1rem] outline-none placeholder:text-faint/70 disabled:text-muted"
        />
      </div>

      {verdict !== null && (
        <p
          className={`stamp font-serif text-[1rem] ${
            verdict ? "text-accent" : "text-wrong"
          }`}
        >
          {verdict ? (
            `✓ ${t("correct", lang)}`
          ) : (
            <>
              ✗ {t("expected", lang)}:{" "}
              <span className="math-ltr">{item.expected}</span>
            </>
          )}
        </p>
      )}

      <ActionBar>
        {verdict === null ? (
          <button
            type="button"
            onClick={submit}
            className="tap w-full rounded-lg bg-accent px-6 text-[0.95rem] font-medium text-paper sm:w-auto sm:py-3"
          >
            {t("check", lang)}
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            autoFocus
            className="tap w-full rounded-lg bg-ink px-6 text-[0.95rem] font-medium text-paper sm:w-auto sm:py-3"
          >
            {index + 1 === items.length ? t("roundDone", lang) : t("next", lang)}{" "}
            →
          </button>
        )}
      </ActionBar>
    </div>
  );
}
