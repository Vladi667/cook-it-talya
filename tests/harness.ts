import nerdamer from "@/lib/nerdamer";
import { checkAnswer } from "@/lib/checker";
import type { Problem, Verification } from "@/lib/types";

/**
 * Independent verification of a template's closed-form solution.
 * Nothing here reuses the template's own algebra: integrals are computed by
 * composite Simpson, limits by numeric approach, derivatives by nerdamer's
 * own differentiator.
 */

export function evalConst(expr: string): number {
  const v = Number(nerdamer(expr).evaluate().text("decimals"));
  if (!Number.isFinite(v)) throw new Error(`not a finite constant: ${expr}`);
  return v;
}

function compile(expr: string, variable: string): (x: number) => number {
  return nerdamer(expr).buildFunction([variable]) as (x: number) => number;
}

function relClose(a: number, b: number, tol: number): boolean {
  return Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
}

/** Composite Simpson. n must be even. */
function simpson(
  f: (x: number) => number,
  a: number,
  b: number,
  n = 40000,
): number {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

export interface VerifyOutcome {
  ok: boolean;
  detail: string;
}

export function runVerification(v: Verification): VerifyOutcome {
  try {
    switch (v.kind) {
      case "numeric": {
        const actual = evalConst(v.expr);
        if (v.expected === "positive")
          return {
            ok: actual > 1e-9,
            detail: `${v.label}: expected > 0, got ${actual}`,
          };
        const expected = evalConst(v.expected);
        const ok = relClose(actual, expected, v.tol ?? 1e-9);
        return { ok, detail: `${v.label}: got ${actual}, expected ${expected}` };
      }

      case "derivative": {
        // Central difference on the original function, NOT nerdamer.diff:
        // nerdamer's differentiator is wrong for sqrt inside a product
        // (it returns sqrt((1/2)x^(-1/2)) where sqrt(x) belongs), so it
        // cannot serve as the independent check here.
        const f = compile(v.expr, v.variable);
        const at = evalConst(v.at);
        const h = 1e-5 * Math.max(1, Math.abs(at));
        const order = v.order ?? 1;
        const actual =
          order === 1
            ? (f(at + h) - f(at - h)) / (2 * h)
            : (f(at + h) - 2 * f(at) + f(at - h)) / (h * h);
        const expected = evalConst(v.expected);
        const ok = relClose(actual, expected, 1e-5);
        return {
          ok,
          detail: `${v.label}: numeric f${"'".repeat(order)}(${at}) = ${actual}, closed form ${expected}`,
        };
      }

      case "integral": {
        let total = 0;
        for (const t of v.terms) {
          const f = compile(t.expr, t.variable);
          total += simpson(f, evalConst(t.from), evalConst(t.to));
        }
        const expected = evalConst(v.expected);
        const ok = relClose(total, expected, 1e-4);
        return {
          ok,
          detail: `${v.label}: numeric integral ${total}, closed form ${expected}`,
        };
      }

      case "limit": {
        const f = compile(v.expr, v.variable);
        const expected = evalConst(v.expected);
        const probes: number[] =
          v.to === "inf"
            ? [1e4, 1e5, 1e6]
            : v.to === "-inf"
              ? [-1e4, -1e5, -1e6]
              : (() => {
                  const t = evalConst(v.to);
                  return [t + 1e-3, t - 1e-3, t + 1e-4, t - 1e-4];
                })();
        const values = probes.map(f).filter((x) => Number.isFinite(x));
        if (values.length < 2)
          return { ok: false, detail: `${v.label}: could not evaluate near the point` };
        const worst = Math.max(...values.map((x) => Math.abs(x - expected)));
        const ok = worst <= 1e-2 * Math.max(1, Math.abs(expected));
        return {
          ok,
          detail: `${v.label}: probes ${values
            .map((x) => x.toFixed(6))
            .join(", ")} vs closed form ${expected}`,
        };
      }
    }
  } catch (err) {
    return { ok: false, detail: `${v.label}: threw ${(err as Error).message}` };
  }
}

const JUNK = /(undefined|NaN|Infinity|\[object)/;

/** Structural sanity that every generated problem must satisfy. */
export function assertWellFormed(p: Problem): string[] {
  const errors: string[] = [];

  for (const lang of ["en", "he"] as const) {
    if (!p.statement[lang]?.trim()) errors.push(`empty statement (${lang})`);
    if (JUNK.test(p.statement[lang])) errors.push(`junk in statement (${lang})`);
    for (const s of p.steps) {
      if (!s.body[lang]?.trim()) errors.push(`empty step body (${lang})`);
      if (JUNK.test(s.body[lang])) errors.push(`junk in step (${lang}): ${s.body[lang]}`);
      if (JUNK.test(s.title[lang])) errors.push(`junk in step title (${lang})`);
    }
    for (const h of p.hints) {
      if (!h[lang]?.trim()) errors.push(`empty hint (${lang})`);
      if (JUNK.test(h[lang])) errors.push(`junk in hint (${lang})`);
    }
  }

  if (p.hints.length !== 3) errors.push(`expected 3 hints, got ${p.hints.length}`);
  if (p.steps.length < 2) errors.push(`expected at least 2 steps`);
  if (p.fields.length === 0) errors.push(`no answer fields`);

  for (const f of p.fields) {
    if (!f.expected?.trim()) {
      errors.push(`field ${f.id} has no expected answer`);
      continue;
    }
    if (JUNK.test(f.expected)) errors.push(`junk in expected answer: ${f.expected}`);
    // The canonical answer must validate against itself through the very same
    // tolerant parser the student's input goes through.
    const self = checkAnswer(f.expected, f.expected, f.type, {
      vars: f.vars,
      sampleRange: f.sampleRange,
    });
    if (!self.correct)
      errors.push(
        `field ${f.id}: expected answer "${f.expected}" does not validate against itself (parsed as "${self.normalizedInput}")`,
      );
  }

  return errors;
}
