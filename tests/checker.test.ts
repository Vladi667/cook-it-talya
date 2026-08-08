import { describe, it, expect } from "vitest";
import {
  checkAnswer,
  normalizeExpression,
  parseDomain,
  formatDomain,
  symbolicEqual,
} from "@/lib/checker";

const ok = (input: string, expected: string, type = "expression" as const) =>
  checkAnswer(input, expected, type).correct;

describe("tolerant parsing", () => {
  it("normalizes roots written every plausible way", () => {
    expect(ok("sqrt(2)", "sqrt(2)")).toBe(true);
    expect(ok("√2", "sqrt(2)")).toBe(true);
    expect(ok("2^0.5", "sqrt(2)")).toBe(true);
    expect(ok("sqrt 2", "sqrt(2)")).toBe(true);
    expect(ok("√(2)", "sqrt(2)")).toBe(true);
    expect(ok("sqrt2", "sqrt(2)")).toBe(true);
  });

  it("accepts ln with and without parentheses", () => {
    expect(ok("ln x", "log(x)")).toBe(true);
    expect(ok("ln(x)", "log(x)")).toBe(true);
    expect(ok("LN(x)", "log(x)")).toBe(true);
  });

  it("handles implicit multiplication", () => {
    expect(normalizeExpression("2x")).toBe("2*x");
    expect(normalizeExpression("(x+1)(x-2)")).toBe("(x+1)*(x-2)");
    expect(ok("2x(x+1)", "2*x^2+2*x")).toBe(true);
    expect(ok("3√2", "3*sqrt(2)")).toBe(true);
  });

  it("accepts unicode operators and constants", () => {
    expect(ok("2·x", "2*x")).toBe(true);
    expect(ok("x−1", "x-1")).toBe(true);
    expect(ok("π", "pi")).toBe(true);
    expect(ok("x²", "x^2")).toBe(true);
  });
});

describe("symbolic equivalence, never string comparison", () => {
  it("validates all algebraically equal forms", () => {
    expect(ok("2x+3", "2*x+3")).toBe(true);
    expect(ok("3+2x", "2*x+3")).toBe(true);
    expect(ok("(4x+6)/2", "2*x+3")).toBe(true);
    expect(ok("2(x+1.5)", "2*x+3")).toBe(true);
  });

  it("rejects genuinely different expressions", () => {
    expect(ok("2x+4", "2*x+3")).toBe(false);
    expect(ok("x", "2*x")).toBe(false);
    expect(ok("-sqrt(2)", "sqrt(2)")).toBe(false);
  });

  it("compares transcendental expressions numerically", () => {
    expect(symbolicEqual("log(x)+log(2)", "log(2*x)")).toBe(true);
    expect(symbolicEqual("e^log(x)", "x")).toBe(true);
    expect(symbolicEqual("log(x^2)", "2*log(x)")).toBe(true);
  });

  it("handles unsimplified radicals", () => {
    expect(ok("sqrt(8)", "2*sqrt(2)")).toBe(true);
    expect(ok("6/sqrt(2)", "3*sqrt(2)")).toBe(true);
  });

  it("flags sign slips and factor-of-two slips", () => {
    expect(checkAnswer("-6", "6", "number").hint).toBe("sign");
    expect(checkAnswer("12", "6", "number").hint).toBe("factor2");
  });
});

describe("points and sets", () => {
  it("compares points component-wise", () => {
    expect(ok("(3, -1)", "(3,-1)", "point" as never)).toBe(true);
    expect(checkAnswer("x=3, y=-1", "(3,-1)", "point").correct).toBe(true);
    expect(checkAnswer("(3, 1)", "(3,-1)", "point").correct).toBe(false);
    expect(checkAnswer("(6/2, -1)", "(3,-1)", "point").correct).toBe(true);
  });

  it("compares point lists order-insensitively", () => {
    expect(
      checkAnswer("(1,2), (3,4)", "(3,4),(1,2)", "points").correct,
    ).toBe(true);
    expect(checkAnswer("(1,2)", "(3,4),(1,2)", "points").correct).toBe(false);
  });

  it("compares scalar sets order-insensitively", () => {
    expect(checkAnswer("2, -3", "-3,2", "set").correct).toBe(true);
    expect(checkAnswer("{2, -3}", "-3,2", "set").correct).toBe(true);
    expect(checkAnswer("2", "-3,2", "set").correct).toBe(false);
  });
});

describe("equations", () => {
  it("accepts any scalar multiple / rearrangement", () => {
    expect(checkAnswer("y=2x+3", "y=2*x+3", "equation").correct).toBe(true);
    expect(checkAnswer("y-2x-3=0", "y=2*x+3", "equation").correct).toBe(true);
    expect(checkAnswer("2y=4x+6", "y=2*x+3", "equation").correct).toBe(true);
    expect(checkAnswer("y=2x+4", "y=2*x+3", "equation").correct).toBe(false);
  });

  it("accepts expanded circle equations", () => {
    const expected = "(x-2)^2+(y+1)^2=25";
    expect(checkAnswer("(x-2)^2+(y+1)^2=25", expected, "equation").correct).toBe(
      true,
    );
    expect(
      checkAnswer("x^2+y^2-4x+2y-20=0", expected, "equation").correct,
    ).toBe(true);
    expect(checkAnswer("(x-2)^2+(y+1)^2=16", expected, "equation").correct).toBe(
      false,
    );
  });
});

describe("domains", () => {
  it("treats inequality and interval notation as the same thing", () => {
    expect(checkAnswer("x>0", "x>0", "domain").correct).toBe(true);
    expect(checkAnswer("(0,∞)", "x>0", "domain").correct).toBe(true);
    expect(checkAnswer("(0, infinity)", "x>0", "domain").correct).toBe(true);
    expect(checkAnswer("0<x", "x>0", "domain").correct).toBe(true);
    expect(checkAnswer("x>=0", "x>0", "domain").correct).toBe(false);
    expect(checkAnswer("[0,∞)", "x>=0", "domain").correct).toBe(true);
  });

  it("handles punctured domains", () => {
    expect(checkAnswer("x!=2", "x != 2", "domain").correct).toBe(true);
    expect(
      checkAnswer("(-∞,2)∪(2,∞)", "x != 2", "domain").correct,
    ).toBe(true);
    expect(checkAnswer("x>0, x≠2", "x>0 and x!=2", "domain").correct).toBe(true);
    expect(
      checkAnswer("(0,2)U(2,infinity)", "x>0 and x!=2", "domain").correct,
    ).toBe(true);
  });

  it("formats a canonical domain back to the user", () => {
    const d = parseDomain("x>0 and x!=2")!;
    expect(formatDomain(d)).toBe("(0, 2) ∪ (2, ∞)");
  });

  it("understands bounded intervals", () => {
    expect(checkAnswer("-2<x<3", "(-2,3)", "domain").correct).toBe(true);
    expect(checkAnswer("[-2,3)", "(-2,3)", "domain").correct).toBe(false);
  });
});

describe("none answers", () => {
  it("accepts several spellings of 'no such thing'", () => {
    expect(checkAnswer("none", "none", "equation").correct).toBe(true);
    expect(checkAnswer("אין", "none", "equation").correct).toBe(true);
    expect(checkAnswer("-", "none", "equation").correct).toBe(true);
    expect(checkAnswer("y=0", "none", "equation").correct).toBe(false);
    expect(checkAnswer("none", "y=0", "equation").correct).toBe(false);
  });
});

describe("empty input", () => {
  it("is never correct", () => {
    expect(checkAnswer("", "2*x", "expression").correct).toBe(false);
    expect(checkAnswer("   ", "2*x", "expression").hint).toBe("empty");
  });
});
