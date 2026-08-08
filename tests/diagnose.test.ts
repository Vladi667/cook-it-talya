import { describe, it, expect } from "vitest";
import { generateProblem, TEMPLATE_LIST } from "@/lib/templates";
import { checkAnswer } from "@/lib/checker";
import { diagnoseField } from "@/lib/diagnose";

const SAMPLES = 60;

describe.each(TEMPLATE_LIST.map((t) => t.id))("%s pitfalls", (templateId) => {
  const problems = Array.from({ length: SAMPLES }, (_, i) =>
    generateProblem(templateId, 5000 + i * 3571),
  );

  it("never declares a pitfall that is actually the correct answer", () => {
    const failures: string[] = [];
    for (const p of problems) {
      for (const field of p.fields) {
        for (const pitfall of field.pitfalls ?? []) {
          const isRight = checkAnswer(
            pitfall.value,
            field.expected,
            field.type,
            { vars: field.vars, sampleRange: field.sampleRange },
          ).correct;
          if (isRight)
            failures.push(
              `seed ${p.seed} field ${field.id}: pitfall "${pitfall.value}" equals the correct answer "${field.expected}"`,
            );
        }
      }
    }
    expect(failures.slice(0, 5).join("\n")).toBe("");
  });

  it("diagnoses each declared pitfall by name", () => {
    const failures: string[] = [];
    for (const p of problems) {
      for (const field of p.fields) {
        for (const pitfall of field.pitfalls ?? []) {
          const result = checkAnswer(
            pitfall.value,
            field.expected,
            field.type,
            { vars: field.vars, sampleRange: field.sampleRange },
          );
          const d = diagnoseField(p, field, pitfall.value, result);
          if (!d || d.kind !== "pitfall")
            failures.push(
              `seed ${p.seed} field ${field.id}: "${pitfall.value}" diagnosed as ${d?.kind ?? "nothing"}, expected a named pitfall`,
            );
        }
      }
    }
    expect(failures.slice(0, 5).join("\n")).toBe("");
  });

  it("always says something useful about a wrong answer", () => {
    for (const p of problems.slice(0, 12)) {
      for (const field of p.fields) {
        const junk = "42.4242";
        const result = checkAnswer(junk, field.expected, field.type, {
          vars: field.vars,
          sampleRange: field.sampleRange,
        });
        if (result.correct) continue;
        const d = diagnoseField(p, field, junk, result);
        expect(d, `${templateId}/${field.id} produced no diagnosis`).not.toBeNull();
        expect(d!.text.en.length).toBeGreaterThan(20);
        expect(d!.text.he.length).toBeGreaterThan(10);
      }
    }
  });

  it("stays silent when the answer is correct", () => {
    for (const p of problems.slice(0, 10)) {
      for (const field of p.fields) {
        const result = checkAnswer(field.expected, field.expected, field.type, {
          vars: field.vars,
          sampleRange: field.sampleRange,
        });
        expect(diagnoseField(p, field, field.expected, result)).toBeNull();
      }
    }
  });
});

describe("generic diagnosis rules", () => {
  const problem = generateProblem("triangle-bisector", 99);
  const field = problem.fields[1]; // AD, an expression

  const run = (input: string) =>
    diagnoseField(
      problem,
      field,
      input,
      checkAnswer(input, field.expected, field.type),
    );

  it("flags a blank answer", () => {
    expect(run("")?.kind).toBe("empty");
  });

  it("flags unreadable input", () => {
    expect(run("???")?.kind).toBe("syntax");
  });

  it("flags a sign slip", () => {
    expect(run(`-(${field.expected})`)?.kind).toBe("sign");
  });

  it("flags a factor of two", () => {
    expect(run(`2*(${field.expected})`)?.kind).toBe("factor2");
  });

  it("notices the answer to another part of the same question", () => {
    const d = diagnoseField(
      problem,
      field,
      problem.fields[0].expected,
      checkAnswer(problem.fields[0].expected, field.expected, field.type),
    );
    expect(d?.kind).toBe("crossfield");
  });

  it("falls back to pointing at the method", () => {
    expect(run("123.456")?.kind).toBe("step");
  });
});
