import { describe, it, expect } from "vitest";
import { generateProblem, TEMPLATE_LIST } from "@/lib/templates";
import { assertWellFormed, runVerification } from "./harness";
import { checkAnswer } from "@/lib/checker";

const SAMPLES = 100;

/**
 * The bar set by the spec: a template is not done until 100 random samples
 * produce valid, non-degenerate, correctly-solved problems.
 */
describe.each(TEMPLATE_LIST.map((t) => t.id))("%s", (templateId) => {
  const problems = Array.from({ length: SAMPLES }, (_, i) =>
    generateProblem(templateId, 1000 + i * 7919),
  );

  it(`generates ${SAMPLES} well-formed problems`, () => {
    const failures: string[] = [];
    for (const p of problems) {
      const errs = assertWellFormed(p);
      if (errs.length) failures.push(`seed ${p.seed}: ${errs.join("; ")}`);
    }
    expect(failures.slice(0, 5).join("\n")).toBe("");
  });

  it(`solves all ${SAMPLES} samples correctly (independent verification)`, () => {
    const failures: string[] = [];
    for (const p of problems) {
      for (const v of p.verification) {
        const out = runVerification(v);
        if (!out.ok) failures.push(`seed ${p.seed}: ${out.detail}`);
      }
    }
    expect(failures.slice(0, 5).join("\n")).toBe("");
  });

  it("is deterministic in the seed", () => {
    const a = generateProblem(templateId, 4242);
    const b = generateProblem(templateId, 4242);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("produces varied problems across seeds", () => {
    const counts = new Map<string, number>();
    for (const p of problems)
      counts.set(p.statement.en, (counts.get(p.statement.en) ?? 0) + 1);
    // Enough distinct problems that a student is not re-seeing the same one,
    // and no single problem dominating the rotation.
    expect(counts.size).toBeGreaterThanOrEqual(12);
    expect(Math.max(...counts.values())).toBeLessThanOrEqual(SAMPLES * 0.25);
  });

  it("verification would fail if the closed form were wrong", () => {
    // Guards against a harness that silently passes everything: perturb each
    // claimed value and require every check to go red.
    const p = problems[3];
    expect(p.verification.length).toBeGreaterThan(0);
    for (const v of p.verification) {
      const corrupted = {
        ...v,
        expected: v.expected === "positive" ? "-1" : `(${v.expected})+1`,
      } as typeof v;
      const out = runVerification(corrupted);
      expect(out.ok, `corrupted check still passed -> ${out.detail}`).toBe(false);
    }
  });

  it("marks a deliberately wrong answer as wrong", () => {
    const p = problems[0];
    for (const f of p.fields) {
      const wrong = checkAnswer(`(${f.expected})+1`, f.expected, f.type, {
        vars: f.vars,
        sampleRange: f.sampleRange,
      });
      expect(wrong.correct, `${templateId}/${f.id} accepted a wrong answer`).toBe(
        false,
      );
    }
  });
});
