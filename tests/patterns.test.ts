import { describe, it, expect } from "vitest";
import { generateProblem, TEMPLATE_LIST } from "@/lib/templates";
import { PATTERNS } from "@/lib/patterns";
import { TEMPLATE_IDS } from "@/lib/types";

const LANGS = ["en", "he"] as const;

describe("teaching patterns", () => {
  it("covers every template", () => {
    expect(Object.keys(PATTERNS).sort()).toEqual([...TEMPLATE_IDS].sort());
  });

  describe.each(TEMPLATE_LIST.map((t) => t.id))("%s", (templateId) => {
    const pattern = PATTERNS[templateId];

    it("is complete and bilingual", () => {
      for (const lang of LANGS) {
        expect(pattern.method[lang].trim().length).toBeGreaterThan(8);
        expect(pattern.whyItWorks[lang].trim().length).toBeGreaterThan(80);
        expect(pattern.speedTip[lang].trim().length).toBeGreaterThan(40);
        for (const s of pattern.signature)
          expect(s[lang].trim().length).toBeGreaterThan(10);
        for (const w of pattern.watchOut)
          expect(w[lang].trim().length).toBeGreaterThan(10);
        for (const r of pattern.recipe) {
          expect(r.move[lang].trim().length).toBeGreaterThan(8);
          expect(r.detail[lang].trim().length).toBeGreaterThan(30);
        }
      }
    });

    it("has a usable number of cues and moves", () => {
      expect(pattern.signature.length).toBeGreaterThanOrEqual(2);
      expect(pattern.recipe.length).toBeGreaterThanOrEqual(4);
      expect(pattern.recipe.length).toBeLessThanOrEqual(6);
      expect(pattern.watchOut.length).toBeGreaterThanOrEqual(1);
    });

    it("has every solution step linked to a real recipe move", () => {
      const failures: string[] = [];
      for (let i = 0; i < 40; i++) {
        const problem = generateProblem(templateId, 700 + i * 1301);
        problem.steps.forEach((step, k) => {
          if (step.move === undefined) {
            failures.push(`seed ${problem.seed} step ${k} ("${step.title.en}") is untagged`);
          } else if (step.move < 0 || step.move >= pattern.recipe.length) {
            failures.push(
              `seed ${problem.seed} step ${k} points at move ${step.move}, recipe has ${pattern.recipe.length}`,
            );
          }
        });
      }
      expect(failures.slice(0, 5).join("\n")).toBe("");
    });
  });
});
