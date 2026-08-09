import { describe, it, expect } from "vitest";
import katex from "katex";
import { checkAnswer } from "@/lib/checker";
import { MICRO_ATOMS, MICRO_IDS, makeMicroItem } from "@/lib/micro";

const LANGS = ["en", "he"] as const;

describe.each(MICRO_IDS)("micro-drill: %s", (atomId) => {
  const items = Array.from({ length: 80 }, (_, i) =>
    makeMicroItem(atomId, 200 + i * 1013),
  );

  it("is described in both languages", () => {
    const atom = MICRO_ATOMS[atomId];
    for (const lang of LANGS) {
      expect(atom.name[lang].trim().length).toBeGreaterThan(3);
      expect(atom.usedIn[lang].trim().length).toBeGreaterThan(10);
    }
  });

  it("produces answers that validate against themselves", () => {
    const failures: string[] = [];
    for (const item of items) {
      const self = checkAnswer(item.expected, item.expected, item.type);
      if (!self.correct)
        failures.push(`"${item.expected}" does not validate (${item.prompt})`);
    }
    expect(failures.slice(0, 3).join("\n")).toBe("");
  });

  it("renders its prompt through KaTeX", () => {
    const failures: string[] = [];
    for (const item of items) {
      try {
        katex.renderToString(item.prompt, {
          displayMode: true,
          throwOnError: true,
        });
      } catch (err) {
        failures.push(`${item.prompt} -> ${(err as Error).message}`);
      }
    }
    expect(failures.slice(0, 3).join("\n")).toBe("");
  });

  it("rejects a wrong answer", () => {
    for (const item of items.slice(0, 20)) {
      const wrong = checkAnswer(`(${item.expected})+1`, item.expected, item.type);
      expect(wrong.correct, `${atomId} accepted a wrong answer`).toBe(false);
    }
  });

  it("varies across seeds", () => {
    const prompts = new Set(items.map((i) => i.prompt));
    expect(prompts.size).toBeGreaterThan(10);
  });

  it("is deterministic in the seed", () => {
    expect(JSON.stringify(makeMicroItem(atomId, 4242))).toBe(
      JSON.stringify(makeMicroItem(atomId, 4242)),
    );
  });
});
