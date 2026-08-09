import { describe, it, expect } from "vitest";
import { generateProblem, REGISTERED_TEMPLATE_IDS } from "@/lib/templates";
import { checkAnswer } from "@/lib/checker";
import { diagnoseField } from "@/lib/diagnose";
import { TRAPS, isOpen, rankedTraps, trapPressure } from "@/lib/traps";
import { pickNextTemplate } from "@/lib/mastery";
import type { TrapStats } from "@/lib/types";

const LANGS = ["en", "he"] as const;

describe("trap registry", () => {
  it("has a bilingual label for every declared pitfall id", () => {
    const missing = new Set<string>();
    const used = new Set<string>();
    for (const id of REGISTERED_TEMPLATE_IDS) {
      for (let i = 0; i < 40; i++) {
        const p = generateProblem(id, 6000 + i * 1493);
        for (const f of p.fields) {
          for (const pitfall of f.pitfalls ?? []) {
            used.add(pitfall.id);
            const meta = TRAPS[pitfall.id];
            if (!meta) {
              missing.add(`${pitfall.id} (${id}/${f.id})`);
              continue;
            }
            expect(meta.templateId).toBe(id);
            for (const lang of LANGS)
              expect(meta.short[lang].trim().length).toBeGreaterThan(4);
          }
        }
      }
    }
    expect([...missing].join(", ")).toBe("");
    // And nothing in the registry is dead weight.
    const unused = Object.keys(TRAPS).filter((k) => !used.has(k));
    expect(unused.join(", ")).toBe("");
  });

  it("gives every pitfall a unique id within its field", () => {
    for (const id of REGISTERED_TEMPLATE_IDS) {
      for (let i = 0; i < 20; i++) {
        const p = generateProblem(id, 7000 + i * 811);
        for (const f of p.fields) {
          const ids = (f.pitfalls ?? []).map((x) => x.id);
          expect(new Set(ids).size).toBe(ids.length);
        }
      }
    }
  });
});

describe("trap diagnosis", () => {
  it("reports the trap id when a named pitfall fires", () => {
    let checked = 0;
    for (const id of REGISTERED_TEMPLATE_IDS) {
      const p = generateProblem(id, 1234);
      for (const f of p.fields) {
        for (const pitfall of f.pitfalls ?? []) {
          const result = checkAnswer(pitfall.value, f.expected, f.type, {
            vars: f.vars,
            sampleRange: f.sampleRange,
          });
          const d = diagnoseField(p, f, pitfall.value, result);
          expect(d?.kind).toBe("pitfall");
          expect(d?.trapId).toBe(pitfall.id);
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(10);
  });
});

describe("trap pressure", () => {
  const trap = (over: Partial<TrapStats>): TrapStats => ({
    id: "bisector-midpoint",
    templateId: "triangle-bisector",
    hits: 3,
    lastAt: Date.now(),
    clearedSince: 0,
    ...over,
  });

  it("counts an unresolved trap and ignores a cleared one", () => {
    const open = { a: trap({}) };
    const cleared = { a: trap({ clearedSince: 5 }) };
    expect(trapPressure(open, "triangle-bisector")).toBeGreaterThan(0);
    expect(trapPressure(cleared, "triangle-bisector")).toBe(0);
    expect(trapPressure(open, "limits")).toBe(0);
  });

  it("closes a trap only after enough clean answers", () => {
    expect(isOpen(trap({ clearedSince: 0 }))).toBe(true);
    expect(isOpen(trap({ clearedSince: 2 }))).toBe(true);
    expect(isOpen(trap({ clearedSince: 3 }))).toBe(false);
  });

  it("pulls the offending question type back into the rotation", () => {
    const traps = { a: trap({ hits: 3 }) };
    const now = Date.now();
    // A student who has practised everything: base weights are low, so the
    // trap is what should decide. (With every type unseen the novelty weight
    // dominates by design, which is correct — see everything once first.)
    const stats = Object.fromEntries(
      REGISTERED_TEMPLATE_IDS.map((id) => [
        id,
        {
          templateId: id,
          attempts: 8,
          correct: 8,
          scoreSum: 8,
          totalSeconds: 800,
          lastSeen: now,
          streak: 8,
        },
      ]),
    );

    let n = 0;
    const rand = () => ((n = (n * 9301 + 49297) % 233280) / 233280);
    const count = (pressure: boolean) => {
      let hits = 0;
      for (let i = 0; i < 600; i++) {
        const picked = pickNextTemplate(stats, now, {
          random: rand,
          available: REGISTERED_TEMPLATE_IDS,
          trapPressure: pressure ? (id) => trapPressure(traps, id) : undefined,
        });
        if (picked === "triangle-bisector") hits++;
      }
      return hits;
    };

    const without = count(false);
    const with_ = count(true);
    // Ten templates, so an unweighted split would be ~60.
    expect(without).toBeLessThan(110);
    expect(with_).toBeGreaterThan(2 * without);
  });

  it("ranks open traps above cleared ones", () => {
    const ranked = rankedTraps({
      open: trap({ id: "open", hits: 1, clearedSince: 0 }),
      done: trap({ id: "done", hits: 9, clearedSince: 9 }),
    });
    expect(ranked[0].id).toBe("open");
  });
});
