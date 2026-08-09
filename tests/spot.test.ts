import { describe, it, expect } from "vitest";
import { generateProblem, REGISTERED_TEMPLATE_IDS, TEMPLATE_LIST } from "@/lib/templates";
import { PATTERNS } from "@/lib/patterns";
import {
  CHOICE_COUNT,
  CONFUSABLE,
  makeSpotItem,
  pickSpotTemplate,
} from "@/lib/spot";
import type { RecognitionStats, TemplateId } from "@/lib/types";

const LANGS = ["en", "he"] as const;

describe("recognition cues", () => {
  describe.each(TEMPLATE_LIST.map((t) => t.id))("%s", (templateId) => {
    const pattern = PATTERNS[templateId];

    it("declares trigger phrases in both languages", () => {
      for (const lang of LANGS) {
        expect(pattern.triggers[lang].length).toBeGreaterThan(0);
        for (const trigger of pattern.triggers[lang])
          expect(trigger.trim().length).toBeGreaterThan(2);
      }
    });

    /**
     * The whole point of the drill is that the highlighted cue is a real
     * phrase from the real question. A trigger that never occurs would teach
     * a student to scan for words that are not there.
     */
    it("every generated statement contains at least one of its triggers", () => {
      const misses: string[] = [];
      for (let i = 0; i < 60; i++) {
        const p = generateProblem(templateId, 9000 + i * 1777);
        for (const lang of LANGS) {
          const statement = p.statement[lang].toLowerCase();
          const hit = pattern.triggers[lang].some((trigger) =>
            statement.includes(trigger.toLowerCase()),
          );
          if (!hit)
            misses.push(
              `seed ${p.seed} (${lang}): none of [${pattern.triggers[lang].join(", ")}] in "${p.statement[lang].slice(0, 90)}…"`,
            );
        }
      }
      expect(misses.slice(0, 3).join("\n")).toBe("");
    });
  });

  it("does not let one template's triggers match every other template", () => {
    // A trigger that fires everywhere is not a cue, it is noise — and worse,
    // it trains the student to misread. Checked in both languages.
    const offenders: string[] = [];
    for (const id of REGISTERED_TEMPLATE_IDS) {
      for (const lang of LANGS) {
        const triggers = PATTERNS[id].triggers[lang].map((s) =>
          s.toLowerCase(),
        );
        for (const other of REGISTERED_TEMPLATE_IDS) {
          if (other === id) continue;
          let hits = 0;
          for (let i = 0; i < 12; i++) {
            const p = generateProblem(other, 4200 + i * 911);
            if (
              triggers.some((tr) =>
                p.statement[lang].toLowerCase().includes(tr),
              )
            )
              hits++;
          }
          if (hits === 12)
            offenders.push(`${id} triggers (${lang}) always fire on ${other}`);
        }
      }
    }
    expect(offenders.join("\n")).toBe("");
  });
});

describe("spot items", () => {
  it("always offers the correct answer among distinct choices", () => {
    for (const id of REGISTERED_TEMPLATE_IDS) {
      for (let i = 0; i < 20; i++) {
        const item = makeSpotItem(id, 500 + i * 331);
        expect(item.choices).toHaveLength(CHOICE_COUNT);
        expect(item.choices).toContain(id);
        expect(new Set(item.choices).size).toBe(CHOICE_COUNT);
        expect(item.problem.templateId).toBe(id);
      }
    }
  });

  it("prefers genuinely confusable distractors", () => {
    for (const id of REGISTERED_TEMPLATE_IDS) {
      const confusable = CONFUSABLE[id] ?? [];
      let withConfusable = 0;
      for (let i = 0; i < 20; i++) {
        const item = makeSpotItem(id, 800 + i * 617);
        if (item.choices.some((c) => c !== id && confusable.includes(c)))
          withConfusable++;
      }
      // Every item should carry at least one near-miss option.
      expect(withConfusable, `${id} rarely offers a confusable option`).toBe(20);
    }
  });

  it("is deterministic in the seed", () => {
    const a = makeSpotItem("limits", 31337);
    const b = makeSpotItem("limits", 31337);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("never lists a template as its own distractor", () => {
    for (const [id, others] of Object.entries(CONFUSABLE))
      expect(others).not.toContain(id as TemplateId);
  });
});

describe("recognition-weighted selection", () => {
  it("favours the types you misread", () => {
    const recognition: Record<string, RecognitionStats> = {};
    for (const id of REGISTERED_TEMPLATE_IDS)
      recognition[id] = { templateId: id, seen: 20, correct: 20, totalMs: 0 };
    recognition["sequences"] = {
      templateId: "sequences",
      seen: 20,
      correct: 2,
      totalMs: 0,
    };

    let weak = 0;
    let n = 0;
    const rand = () => ((n = (n * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 600; i++)
      if (pickSpotTemplate(recognition, rand) === "sequences") weak++;

    // Ten templates, so an even split would be ~60.
    expect(weak).toBeGreaterThan(100);
  });
});
