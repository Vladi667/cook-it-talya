/** Formatting helpers shared by every template. Pure, no CAS needed. */

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export interface Frac {
  n: number;
  d: number;
}

export function frac(n: number, d: number): Frac {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

/** "3/4" — always parseable by nerdamer. */
export function fracPlain(n: number, d: number): string {
  const f = frac(n, d);
  return f.d === 1 ? String(f.n) : `${f.n}/${f.d}`;
}

/** "\frac{3}{4}" or "3" */
export function fracLatex(n: number, d: number): string {
  const f = frac(n, d);
  if (f.d === 1) return String(f.n);
  const sign = f.n < 0 ? "-" : "";
  return `${sign}\\frac{${Math.abs(f.n)}}{${f.d}}`;
}

/** "+3", "-3" — for building polynomials without a leading "+". */
export function signed(n: number): string {
  return n < 0 ? `- ${Math.abs(n)}` : `+ ${n}`;
}

/** A coefficient in front of a symbol: 1x -> "x", -1x -> "-x", 0x -> "". */
export function coef(n: number, sym: string): string {
  if (n === 0) return "";
  if (n === 1) return sym;
  if (n === -1) return `-${sym}`;
  return `${n}${sym}`;
}

/** Same, but as a trailing term with an explicit sign: "+ 3x", "- x". */
export function signedTerm(n: number, sym: string): string {
  if (n === 0) return "";
  const body = Math.abs(n) === 1 ? sym : `${Math.abs(n)}${sym}`;
  return n < 0 ? ` - ${body}` : ` + ${body}`;
}

/** Wraps negatives so "10 - -2" prints as "10 - (-2)". */
export function paren(n: number): string {
  return n < 0 ? `(${n})` : String(n);
}

export function pt(x: number, y: number): string {
  return `(${trim(x)},${trim(y)})`;
}

export function ptLatex(name: string, x: number | string, y: number | string): string {
  return `${name}\\left(${typeof x === "number" ? trim(x) : x},\\ ${
    typeof y === "number" ? trim(y) : y
  }\\right)`;
}

export function trim(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return String(Number(v.toFixed(6)));
}

/**
 * Reduce sqrt(inside)*outside/den to lowest terms.
 * Returns the pieces so callers can build both LaTeX and plain forms.
 */
export function simplifyRadical(
  radicand: number,
  den = 1,
): { outside: number; inside: number; den: number } {
  let outside = 1;
  let inside = Math.round(radicand);
  for (let p = 2; p * p <= inside; p++) {
    while (inside % (p * p) === 0) {
      inside /= p * p;
      outside *= p;
    }
  }
  const g = gcd(outside, den);
  return { outside: outside / g, inside, den: den / g };
}

export function radicalPlain(radicand: number, den = 1): string {
  const r = simplifyRadical(radicand, den);
  if (r.inside === 1) return fracPlain(r.outside, r.den);
  const num = r.outside === 1 ? `sqrt(${r.inside})` : `${r.outside}*sqrt(${r.inside})`;
  return r.den === 1 ? num : `(${num})/${r.den}`;
}

export function radicalLatex(radicand: number, den = 1): string {
  const r = simplifyRadical(radicand, den);
  if (r.inside === 1) return fracLatex(r.outside, r.den);
  const num = r.outside === 1 ? `\\sqrt{${r.inside}}` : `${r.outside}\\sqrt{${r.inside}}`;
  return r.den === 1 ? num : `\\frac{${num}}{${r.den}}`;
}

/** Distance squared between two integer points. */
export function dist2(
  a: [number, number],
  b: [number, number],
): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
}

/** Cross product of AB x AC — zero exactly when the points are collinear. */
export function cross(
  a: [number, number],
  b: [number, number],
  c: [number, number],
): number {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}

/** Linear expression "ax + b" in LaTeX, collapsing the usual special cases. */
export function linearLatex(a: number, b: number, sym = "x"): string {
  if (a === 0) return String(b);
  const head = coef(a, sym);
  if (b === 0) return head;
  return `${head} ${signed(b)}`;
}
