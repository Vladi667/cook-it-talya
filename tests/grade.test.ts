import { describe, it, expect } from "vitest";
import { generateProblem, REGISTERED_TEMPLATE_IDS } from "@/lib/templates";
import { gradeProblem, totalCredit, FOLLOW_THROUGH_CREDIT } from "@/lib/grade";

describe("follow-through marking", () => {
  it("gives full credit for a fully correct answer", () => {
    for (const id of REGISTERED_TEMPLATE_IDS) {
      const p = generateProblem(id, 2024);
      const answers = Object.fromEntries(
        p.fields.map((f) => [f.id, f.expected]),
      );
      const graded = gradeProblem(p, answers);
      expect(totalCredit(graded), `${id} did not fully credit a correct run`).toBe(1);
      for (const f of p.fields) expect(graded[f.id].followThrough).toBeFalsy();
    }
  });

  it("credits a length measured from the student's own wrong point", () => {
    // triangle-bisector: AD follows from D.
    const p = generateProblem("triangle-bisector", 555);
    const A = p.params.A as number[];
    const wrongD: [number, number] = [A[0] + 3, A[1] + 4]; // distance 5 from A

    const graded = gradeProblem(p, {
      D: `(${wrongD[0]},${wrongD[1]})`,
      AD: "5",
    });

    expect(graded.D.correct).toBe(false);
    expect(graded.AD.correct).toBe(false);
    expect(graded.AD.followThrough).toBe(true);
    expect(graded.AD.credit).toBe(FOLLOW_THROUGH_CREDIT);
    expect(totalCredit(graded)).toBeCloseTo(FOLLOW_THROUGH_CREDIT / 2, 6);
  });

  it("does not rescue an answer that is simply wrong", () => {
    const p = generateProblem("triangle-bisector", 555);
    const A = p.params.A as number[];
    const graded = gradeProblem(p, {
      D: `(${A[0] + 3},${A[1] + 4})`,
      AD: "999",
    });
    expect(graded.AD.followThrough).toBeFalsy();
    expect(graded.AD.credit).toBe(0);
  });

  it("does not apply when the prerequisite was right", () => {
    const p = generateProblem("triangle-bisector", 555);
    const graded = gradeProblem(p, {
      D: p.fields[0].expected,
      AD: "12345",
    });
    expect(graded.D.correct).toBe(true);
    expect(graded.AD.followThrough).toBeFalsy();
  });

  it("chains through a sequence: wrong d, consistent a1 and sum", () => {
    const p = generateProblem("sequences", 4242);
    if (p.params.kind !== "arith") return; // geometric variant has no chain
    const m = p.params.m as number;
    const k = p.params.k as number;
    const realD = p.params.d as number;
    const a1Field = p.fields[1];
    const am = (p.params.a1 as number) + (m - 1) * realD;

    const theirD = realD + 1;
    const theirA1 = am - (m - 1) * theirD;
    const theirSum = (k / 2) * (2 * theirA1 + (k - 1) * theirD);

    const graded = gradeProblem(p, {
      d: String(theirD),
      a1: String(theirA1),
      sum: String(theirSum),
    });

    expect(graded.d.correct).toBe(false);
    expect(a1Field.id).toBe("a1");
    expect(graded.a1.followThrough).toBe(true);
    expect(graded.sum.followThrough).toBe(true);
    // One wrong part should not wipe out the other two.
    expect(totalCredit(graded)).toBeGreaterThan(0.4);
  });

  it("never awards more than full credit", () => {
    for (const id of REGISTERED_TEMPLATE_IDS) {
      for (let i = 0; i < 10; i++) {
        const p = generateProblem(id, 900 + i * 137);
        const answers = Object.fromEntries(
          p.fields.map((f) => [f.id, f.expected]),
        );
        expect(totalCredit(gradeProblem(p, answers))).toBeLessThanOrEqual(1);
      }
    }
  });
});
