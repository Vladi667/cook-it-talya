import { describe, it, expect } from "vitest";
import katex from "katex";
import { generateProblem, TEMPLATE_LIST } from "@/lib/templates";
import { PATTERNS } from "@/lib/patterns";
import { splitMath } from "@/lib/mathText";
import type { Text } from "@/lib/types";

const LANGS = ["en", "he"] as const;

/**
 * Every formula the app can ever display, compiled through KaTeX with
 * throwOnError. A malformed macro would otherwise only show up as a red
 * error box in front of a student mid-revision.
 */
function compile(text: string, where: string, errors: string[]) {
  for (const seg of splitMath(text)) {
    if (seg.kind === "text") continue;
    try {
      katex.renderToString(seg.value, {
        displayMode: seg.kind === "block",
        throwOnError: true,
      });
    } catch (err) {
      errors.push(`${where}: "${seg.value}" -> ${(err as Error).message}`);
    }
  }
}

function compileBoth(t: Text, where: string, errors: string[]) {
  for (const lang of LANGS) compile(t[lang], `${where} (${lang})`, errors);
}

describe("KaTeX rendering", () => {
  describe.each(TEMPLATE_LIST.map((t) => t.id))("%s", (templateId) => {
    it("renders every generated formula without error", () => {
      const errors: string[] = [];
      for (let i = 0; i < 40; i++) {
        const p = generateProblem(templateId, 3000 + i * 2311);
        compileBoth(p.statement, `seed ${p.seed} statement`, errors);
        p.steps.forEach((s, k) => {
          compileBoth(s.title, `seed ${p.seed} step ${k} title`, errors);
          compileBoth(s.body, `seed ${p.seed} step ${k} body`, errors);
        });
        p.hints.forEach((h, k) =>
          compileBoth(h, `seed ${p.seed} hint ${k}`, errors),
        );
        p.fields.forEach((f) => {
          compileBoth(f.prompt, `seed ${p.seed} field ${f.id} prompt`, errors);
          (f.pitfalls ?? []).forEach((pf, k) =>
            compileBoth(pf.why, `seed ${p.seed} field ${f.id} pitfall ${k}`, errors),
          );
        });
      }
      expect(errors.slice(0, 5).join("\n")).toBe("");
    });

    it("renders its pattern card without error", () => {
      const errors: string[] = [];
      const pattern = PATTERNS[templateId];
      compileBoth(pattern.method, "method", errors);
      compileBoth(pattern.whyItWorks, "whyItWorks", errors);
      compileBoth(pattern.speedTip, "speedTip", errors);
      pattern.signature.forEach((s, i) => compileBoth(s, `signature ${i}`, errors));
      pattern.watchOut.forEach((w, i) => compileBoth(w, `watchOut ${i}`, errors));
      pattern.recipe.forEach((r, i) => {
        compileBoth(r.move, `recipe ${i} move`, errors);
        compileBoth(r.detail, `recipe ${i} detail`, errors);
      });
      expect(errors.slice(0, 5).join("\n")).toBe("");
    });
  });
});
