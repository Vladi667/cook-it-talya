import nerdamer from "./nerdamer";
import type { AnswerType } from "./types";

/**
 * Answer checking is ALWAYS symbolic (or numeric), never string comparison.
 * `2x+3`, `3+2x` and `(4x+6)/2` all validate against `2*x+3`.
 */

export interface CheckResult {
  correct: boolean;
  /** What we believe the user typed, after tolerant parsing. */
  normalizedInput: string;
  /** Optional nudge shown on a wrong answer (sign slip, factor of 2, ...). */
  hint?: string;
}

export interface CheckOptions {
  /** Free variables for the numeric fallback. Inferred when omitted. */
  vars?: string[];
  /** Window to sample the numeric fallback in. */
  sampleRange?: [number, number];
}

const EPS = 1e-7;

const FUNCTIONS = new Set([
  "sqrt",
  "log",
  "ln",
  "sin",
  "cos",
  "tan",
  "cot",
  "sec",
  "csc",
  "asin",
  "acos",
  "atan",
  "abs",
  "exp",
]);

/** Answers like "no vertical asymptote". */
const NONE_WORDS = new Set([
  "none",
  "no",
  "nothing",
  "n/a",
  "na",
  "-",
  "—",
  "∅",
  "empty",
  "doesnotexist",
  "dne",
  "אין",
  "לא",
  "ריק",
]);

export function isNoneAnswer(s: string): boolean {
  const t = s.trim().toLowerCase().replace(/\s+/g, "");
  return t.length > 0 && NONE_WORDS.has(t);
}

/* ------------------------------------------------------------------ */
/* Tolerant parsing                                                    */
/* ------------------------------------------------------------------ */

/** Unicode + notation cleanup that applies to every answer type. */
export function preNormalize(raw: string): string {
  let s = raw.trim().toLowerCase();
  s = s
    .replace(/[−–—]/g, "-")
    .replace(/[·×∙⋅]/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "pi")
    .replace(/∞/g, "infinity")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/⁴/g, "^4")
    .replace(/≠/g, "!=")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/\*\*/g, "^")
    .replace(/ /g, " ");

  // √(...) and √token
  s = s.replace(/√\s*\(/g, "sqrt(");
  s = s.replace(/√\s*([0-9]*\.?[0-9]+|[a-z][a-z0-9]*)/g, "sqrt($1)");
  s = s.replace(/√/g, "sqrt");

  // In nerdamer, log IS the natural log. Map ln -> log, and e^x stays as is.
  s = s.replace(/\bln\b/g, "log");
  s = s.replace(/\blan\b/g, "log");
  return s;
}

type Tok =
  | { k: "num"; v: string }
  | { k: "id"; v: string }
  | { k: "op"; v: string }
  | { k: "lp" }
  | { k: "rp" };

function tokenize(s: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(s[i + 1] ?? ""))) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      toks.push({ k: "num", v: s.slice(i, j) });
      i = j;
      continue;
    }
    if (/[a-z_]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-z0-9_]/.test(s[j])) j++;
      let word = s.slice(i, j);
      // "sqrt2" / "log3" -> function applied to the trailing number
      const m = /^(sqrt|log|sin|cos|tan|cot|abs|exp)([0-9].*)$/.exec(word);
      if (m) {
        toks.push({ k: "id", v: m[1] });
        toks.push({ k: "num", v: m[2] });
        i = j;
        continue;
      }
      toks.push({ k: "id", v: word });
      i = j;
      continue;
    }
    if (c === "(" || c === "[" || c === "{") {
      toks.push({ k: "lp" });
      i++;
      continue;
    }
    if (c === ")" || c === "]" || c === "}") {
      toks.push({ k: "rp" });
      i++;
      continue;
    }
    // multi-char operators first
    if ((c === "!" || c === "<" || c === ">" || c === "=") && s[i + 1] === "=") {
      toks.push({ k: "op", v: s.slice(i, i + 2) });
      i += 2;
      continue;
    }
    toks.push({ k: "op", v: c });
    i++;
  }
  return toks;
}

function isAtomStart(t: Tok): boolean {
  return t.k === "num" || t.k === "id" || t.k === "lp";
}

function isAtomEnd(t: Tok): boolean {
  return t.k === "num" || t.k === "id" || t.k === "rp";
}

/**
 * Rebuilds the token stream with explicit multiplication (`2x` -> `2*x`,
 * `(x+1)(x-2)` -> `(x+1)*(x-2)`) and with bare function application closed
 * (`ln x` -> `log(x)`, `sqrt 5` -> `sqrt(5)`).
 */
function reassemble(toks: Tok[]): string {
  const out: string[] = [];
  const pending: number[] = []; // depth markers for auto-inserted parens
  let depth = 0;

  const closeAuto = () => {
    while (pending.length && pending[pending.length - 1] === depth) {
      out.push(")");
      pending.pop();
    }
  };

  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    const prev = toks[i - 1];

    if (prev && isAtomEnd(prev) && isAtomStart(t)) {
      // Never between a function name and its argument, parenthesised or not:
      // `sqrt 2` and `ln x` are applications, not products.
      const prevIsFn = prev.k === "id" && FUNCTIONS.has(prev.v);
      if (!prevIsFn) out.push("*");
    }

    if (t.k === "num") {
      out.push(t.v);
      closeAuto();
    } else if (t.k === "id") {
      const next = toks[i + 1];
      if (FUNCTIONS.has(t.v) && next && next.k !== "lp") {
        // bare application: consume the next atom into parentheses
        out.push(t.v, "(");
        pending.push(depth);
      } else {
        out.push(t.v);
        if (!(FUNCTIONS.has(t.v) && next && next.k === "lp")) closeAuto();
      }
    } else if (t.k === "lp") {
      out.push("(");
      depth++;
    } else if (t.k === "rp") {
      depth--;
      out.push(")");
      closeAuto();
    } else {
      // An operator continues the current expression, except that `^` binds
      // tighter than the auto-paren we opened for `sqrt x^2`.
      if (t.v === "^") out.push("^");
      else {
        closeAuto();
        out.push(t.v);
      }
    }
  }
  while (pending.length) {
    out.push(")");
    pending.pop();
  }
  return out.join("");
}

/** Full tolerant normalization of a scalar/expression answer. */
export function normalizeExpression(raw: string): string {
  return reassemble(tokenize(preNormalize(raw)));
}

/* ------------------------------------------------------------------ */
/* Symbolic + numeric equivalence                                      */
/* ------------------------------------------------------------------ */

function parse(expr: string) {
  return nerdamer(expr);
}

function variablesOf(expr: string): string[] {
  try {
    return parse(expr).variables();
  } catch {
    return [];
  }
}

function evalAt(expr: string, subs: Record<string, number>): number | null {
  try {
    const sub: Record<string, string> = {};
    for (const [k, v] of Object.entries(subs)) sub[k] = String(v);
    const text = nerdamer(expr, sub).evaluate().text("decimals");
    const v = Number(text);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

function constantValue(expr: string): number | null {
  return evalAt(expr, {});
}

function close(a: number, b: number): boolean {
  // Identical infinities must compare equal — interval endpoints rely on it.
  if (a === b) return true;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) <= EPS * Math.max(1, Math.abs(a), Math.abs(b));
}

/**
 * Forgives hand-rounding without ever forgiving a different answer.
 *
 * A purely relative tolerance is wrong here: 1e-3 of 1024 is more than 1, so
 * 1025 would pass for 1024. Rounding only needs forgiving when the true value
 * does not terminate, and in that case the gap a student introduces is
 * absolute (two or three decimal places), not proportional.
 */
const DECIMAL_SLACK = 5e-3;
/** Rounding never moves a value by more than a couple of percent of itself. */
const RELATIVE_CEILING = 0.02;

function closeLoose(a: number, b: number): boolean {
  if (a === b) return true;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  const diff = Math.abs(a - b);
  const scale = Math.max(Math.abs(a), Math.abs(b));
  // "3.33" for 10/3 — but the absolute slack alone would also accept 3/4096
  // for 9/2048, since small probabilities live well inside it. Rounding has
  // to be small in absolute *and* relative terms to count as rounding.
  if (diff <= DECIMAL_SLACK && diff <= RELATIVE_CEILING * scale) return true;
  return diff <= 1e-6 * Math.max(1, scale);
}

/** True when two expressions are equal as functions. */
export function symbolicEqual(
  a: string,
  b: string,
  opts: CheckOptions = {},
): boolean {
  if (!a || !b) return false;

  // Fast path: exact structural cancellation.
  try {
    const diff = nerdamer(`(${a})-(${b})`).expand().toString();
    if (diff === "0") return true;
  } catch {
    /* fall through to numeric */
  }

  const vars = Array.from(
    new Set([...(opts.vars ?? []), ...variablesOf(a), ...variablesOf(b)]),
  ).filter((v) => v !== "e" && v !== "pi");

  if (vars.length === 0) {
    const va = constantValue(a);
    const vb = constantValue(b);
    if (va === null || vb === null) return false;
    // Constants get a looser tolerance so a hand-rounded "5.83" is accepted
    // for 7*sqrt(5)/3. Symbolic answers still match exactly via the fast path.
    return closeLoose(va, vb);
  }

  // Sample away from integers so we dodge the usual poles and branch points.
  const needsPositive = /log\(|sqrt\(/.test(a) || /log\(|sqrt\(/.test(b);
  const [lo, hi] =
    opts.sampleRange ?? (needsPositive ? [0.31, 3.29] : [-2.71, 3.19]);

  let agreements = 0;
  let disagreements = 0;
  const N = 14;
  for (let i = 0; i < N; i++) {
    const subs: Record<string, number> = {};
    for (let k = 0; k < vars.length; k++) {
      const t = (i + 1 + k * 0.37) / (N + 1);
      subs[vars[k]] = lo + (hi - lo) * ((t * 1.618) % 1);
    }
    const va = evalAt(a, subs);
    const vb = evalAt(b, subs);
    if (va === null || vb === null) continue;
    if (close(va, vb)) agreements++;
    else disagreements++;
  }
  return disagreements === 0 && agreements >= 4;
}

/* ------------------------------------------------------------------ */
/* Structured answers: points, sets, equations                         */
/* ------------------------------------------------------------------ */

/** Splits on commas/semicolons that are not nested inside brackets. */
function splitTop(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const c of s) {
    if ("([{".includes(c)) depth++;
    if (")]}".includes(c)) depth--;
    if ((c === "," || c === ";") && depth === 0) {
      parts.push(cur);
      cur = "";
    } else cur += c;
  }
  parts.push(cur);
  return parts.map((p) => p.trim()).filter((p) => p.length > 0);
}

function stripOuterBrackets(s: string): string {
  let t = s.trim();
  while (
    t.length > 1 &&
    "([{".includes(t[0]) &&
    ")]}".includes(t[t.length - 1])
  ) {
    // only strip when the first bracket matches the last
    let depth = 0;
    let matches = true;
    for (let i = 0; i < t.length; i++) {
      if ("([{".includes(t[i])) depth++;
      if (")]}".includes(t[i])) depth--;
      if (depth === 0 && i < t.length - 1) {
        matches = false;
        break;
      }
    }
    if (!matches) break;
    t = t.slice(1, -1).trim();
  }
  return t;
}

/** "(3, -1)" | "x=3, y=-1" | "3,-1" -> ["3", "-1"] */
function parsePoint(raw: string): string[] {
  let s = preNormalize(raw).replace(/^p\s*=/, "");
  s = stripOuterBrackets(s);
  const parts = splitTop(s).map((p) => p.replace(/^[a-z]\s*=\s*/, ""));
  return parts.map((p) => normalizeExpression(p));
}

function pointsEqual(a: string[], b: string[], opts: CheckOptions): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => symbolicEqual(v, b[i], opts));
}

/**
 * Extracts "(a,b)" groups; falls back to treating the whole input as one.
 * Anything left over after removing the groups (beyond separators) means the
 * input was not a plain list of points, and is rejected rather than ignored.
 */
function parsePointList(raw: string): string[][] | null {
  const s = preNormalize(raw);
  const groups = s.match(/\([^()]*,[^()]*\)/g);
  if (groups && groups.length > 0) {
    let rest = s;
    for (const g of groups) rest = rest.replace(g, "");
    if (/[^\s,;]/.test(rest)) return null;
    return groups.map((g) => parsePoint(g));
  }
  return [parsePoint(s)];
}

function unorderedMatch<T>(
  a: T[],
  b: T[],
  eq: (x: T, y: T) => boolean,
): boolean {
  if (a.length !== b.length) return false;
  const used = new Array(b.length).fill(false);
  for (const x of a) {
    const j = b.findIndex((y, k) => !used[k] && eq(x, y));
    if (j < 0) return false;
    used[j] = true;
  }
  return true;
}

/** "y=2x+3" -> "y-(2*x+3)"; a bare expression is treated as "expr = 0". */
function equationToDiff(raw: string): string | null {
  const s = preNormalize(raw);
  const sides = s.split("=");
  if (sides.length === 1) return normalizeExpression(sides[0]);
  if (sides.length !== 2) return null;
  const l = normalizeExpression(sides[0]);
  const r = normalizeExpression(sides[1]);
  if (!l || !r) return null;
  return `(${l})-(${r})`;
}

/** Two equations match when their (lhs - rhs) differ by a nonzero constant. */
function equationsEqual(userDiff: string, expectedDiff: string): boolean {
  if (symbolicEqual(userDiff, expectedDiff)) return true;

  const vars = Array.from(
    new Set([...variablesOf(userDiff), ...variablesOf(expectedDiff)]),
  ).filter((v) => v !== "e" && v !== "pi");
  if (vars.length === 0) return false;

  let ratio: number | null = null;
  let samples = 0;
  for (let i = 0; i < 16; i++) {
    const subs: Record<string, number> = {};
    for (let k = 0; k < vars.length; k++) {
      subs[vars[k]] = -4.3 + ((i * 1.7 + k * 2.3) % 9);
    }
    const u = evalAt(userDiff, subs);
    const e = evalAt(expectedDiff, subs);
    if (u === null || e === null) continue;
    if (Math.abs(e) < 1e-6) continue;
    const r = u / e;
    if (Math.abs(r) < 1e-9) return false;
    if (ratio === null) ratio = r;
    else if (!close(ratio, r)) return false;
    samples++;
  }
  return ratio !== null && samples >= 3;
}

/* ------------------------------------------------------------------ */
/* Domains as unions of intervals                                      */
/* ------------------------------------------------------------------ */

export interface Interval {
  lo: number;
  hi: number;
  loOpen: boolean;
  hiOpen: boolean;
}

const FULL_LINE: Interval[] = [
  { lo: -Infinity, hi: Infinity, loOpen: true, hiOpen: true },
];

function endpointValue(raw: string): number | null {
  const s = normalizeExpression(raw);
  if (/^-?infinity$/.test(s)) return s.startsWith("-") ? -Infinity : Infinity;
  if (s === "inf") return Infinity;
  if (s === "-inf") return -Infinity;
  return constantValue(s);
}

function normalizeIntervals(list: Interval[]): Interval[] {
  const valid = list.filter(
    (iv) =>
      iv.lo < iv.hi ||
      (iv.lo === iv.hi && !iv.loOpen && !iv.hiOpen && Number.isFinite(iv.lo)),
  );
  valid.sort((a, b) => a.lo - b.lo || Number(a.loOpen) - Number(b.loOpen));
  const out: Interval[] = [];
  for (const iv of valid) {
    const last = out[out.length - 1];
    if (!last) {
      out.push({ ...iv });
      continue;
    }
    const touching =
      iv.lo < last.hi ||
      (close(iv.lo, last.hi) && !(iv.loOpen && last.hiOpen));
    if (touching) {
      if (iv.hi > last.hi) {
        last.hi = iv.hi;
        last.hiOpen = iv.hiOpen;
      } else if (close(iv.hi, last.hi)) {
        last.hiOpen = last.hiOpen && iv.hiOpen;
      }
    } else out.push({ ...iv });
  }
  return out;
}

function intersectIntervals(a: Interval[], b: Interval[]): Interval[] {
  const out: Interval[] = [];
  for (const x of a) {
    for (const y of b) {
      const lo = Math.max(x.lo, y.lo);
      const hi = Math.min(x.hi, y.hi);
      if (lo > hi) continue;
      const loOpen =
        (close(lo, x.lo) && x.loOpen) || (close(lo, y.lo) && y.loOpen);
      const hiOpen =
        (close(hi, x.hi) && x.hiOpen) || (close(hi, y.hi) && y.hiOpen);
      out.push({ lo, hi, loOpen, hiOpen });
    }
  }
  return normalizeIntervals(out);
}

function parseDomainAtom(raw: string): Interval[] | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^(all|r|reals?|real numbers?|any|כל|כלר|הממשיים)$/i.test(s.replace(/\s+/g, " ").trim()))
    return FULL_LINE;

  // interval notation: (a,b) [a,b) etc.
  const iv = /^([([])\s*([^,]+?)\s*,\s*([^,]+?)\s*([)\]])$/.exec(s);
  if (iv) {
    const lo = endpointValue(iv[2]);
    const hi = endpointValue(iv[3]);
    if (lo === null || hi === null) return null;
    return normalizeIntervals([
      { lo, hi, loOpen: iv[1] === "(", hiOpen: iv[4] === ")" },
    ]);
  }

  // a < x < b
  const dbl = /^(.+?)\s*(<=|<)\s*[a-z]\s*(<=|<)\s*(.+)$/.exec(s);
  if (dbl) {
    const lo = endpointValue(dbl[1]);
    const hi = endpointValue(dbl[4]);
    if (lo === null || hi === null) return null;
    return normalizeIntervals([
      { lo, hi, loOpen: dbl[2] === "<", hiOpen: dbl[3] === "<" },
    ]);
  }

  // x != a
  const ne = /^[a-z]\s*!=\s*(.+)$/.exec(s) ?? /^(.+?)\s*!=\s*[a-z]$/.exec(s);
  if (ne) {
    const v = endpointValue(ne[1]);
    if (v === null) return null;
    return [
      { lo: -Infinity, hi: v, loOpen: true, hiOpen: true },
      { lo: v, hi: Infinity, loOpen: true, hiOpen: true },
    ];
  }

  // x > a  /  a < x  (and <=, >=)
  const one = /^([^<>=]+?)\s*(<=|>=|<|>)\s*([^<>=]+)$/.exec(s);
  if (one) {
    const left = one[1].trim();
    const right = one[3].trim();
    const op = one[2];
    const leftIsVar = /^[a-z]$/.test(left);
    const bound = endpointValue(leftIsVar ? right : left);
    if (bound === null) return null;
    // rewrite so the variable is always on the left
    const effective = leftIsVar
      ? op
      : op === "<"
        ? ">"
        : op === "<="
          ? ">="
          : op === ">"
            ? "<"
            : "<=";
    if (effective === ">" || effective === ">=")
      return [
        {
          lo: bound,
          hi: Infinity,
          loOpen: effective === ">",
          hiOpen: true,
        },
      ];
    return [
      { lo: -Infinity, hi: bound, loOpen: true, hiOpen: effective === "<" },
    ];
  }
  return null;
}

/** Parses "x>0 and x!=2", "(0,2)U(2,inf)", "[0,∞)" into interval unions. */
export function parseDomain(raw: string): Interval[] | null {
  let s = preNormalize(raw)
    .replace(/∪/g, "|")
    .replace(/\bunion\b/g, "|")
    .replace(/\bor\b/g, "|")
    .replace(/\band\b/g, "&")
    .replace(/∩/g, "&")
    .replace(/\bx\s*∈\s*/g, "")
    .replace(/\bin\b/g, "")
    .replace(/[{}]/g, "");
  // A capital-U style union between two interval groups.
  s = s.replace(/\)\s*u\s*\(/g, ")|(").replace(/\]\s*u\s*\(/g, "]|(");
  s = s.replace(/\)\s*u\s*\[/g, ")|[").replace(/\]\s*u\s*\[/g, "]|[");

  // Top-level commas act as "and" (e.g. "x>0, x!=2").
  let depth = 0;
  let rebuilt = "";
  for (const c of s) {
    if ("([".includes(c)) depth++;
    if (")]".includes(c)) depth--;
    rebuilt += c === "," && depth === 0 ? "&" : c;
  }

  const unionParts = splitOn(rebuilt, "|");
  const result: Interval[] = [];
  for (const up of unionParts) {
    const andParts = splitOn(up, "&");
    let acc: Interval[] | null = null;
    for (const ap of andParts) {
      const atom = parseDomainAtom(ap);
      if (!atom) return null;
      acc = acc === null ? atom : intersectIntervals(acc, atom);
    }
    if (!acc) return null;
    result.push(...acc);
  }
  return normalizeIntervals(result);
}

function splitOn(s: string, sep: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const c of s) {
    if ("([".includes(c)) depth++;
    if (")]".includes(c)) depth--;
    if (c === sep && depth === 0) {
      parts.push(cur);
      cur = "";
    } else cur += c;
  }
  parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
}

function domainsEqual(a: Interval[], b: Interval[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((x, i) => {
    const y = b[i];
    const loEq =
      (x.lo === -Infinity && y.lo === -Infinity) || close(x.lo, y.lo);
    const hiEq = (x.hi === Infinity && y.hi === Infinity) || close(x.hi, y.hi);
    return (
      loEq &&
      hiEq &&
      (x.lo === -Infinity || x.loOpen === y.loOpen) &&
      (x.hi === Infinity || x.hiOpen === y.hiOpen)
    );
  });
}

export function formatDomain(list: Interval[]): string {
  return list
    .map((iv) => {
      const lo = iv.lo === -Infinity ? "-∞" : trimNum(iv.lo);
      const hi = iv.hi === Infinity ? "∞" : trimNum(iv.hi);
      return `${iv.loOpen ? "(" : "["}${lo}, ${hi}${iv.hiOpen ? ")" : "]"}`;
    })
    .join(" ∪ ");
}

function trimNum(v: number): string {
  return Number.isInteger(v) ? String(v) : String(Number(v.toFixed(6)));
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

function slipHint(userExpr: string, expected: string): string | undefined {
  const u = constantValue(userExpr);
  const e = constantValue(expected);
  if (u === null || e === null || Math.abs(e) < 1e-12) return undefined;
  const r = u / e;
  if (close(r, -1)) return "sign";
  if (close(r, 2) || close(r, 0.5)) return "factor2";
  if (Math.abs(r - 1) < 0.05) return "close";
  return undefined;
}

export function checkAnswer(
  userInput: string,
  expected: string,
  type: AnswerType,
  opts: CheckOptions = {},
): CheckResult {
  const raw = (userInput ?? "").trim();
  if (!raw) return { correct: false, normalizedInput: "", hint: "empty" };

  const expectsNone = expected.trim().toLowerCase() === "none";
  if (expectsNone || isNoneAnswer(raw)) {
    const userSaysNone = isNoneAnswer(raw);
    return {
      correct: expectsNone && userSaysNone,
      normalizedInput: userSaysNone ? "none" : raw,
      hint: expectsNone ? undefined : "notNone",
    };
  }

  try {
    switch (type) {
      case "domain": {
        const u = parseDomain(raw);
        const e = parseDomain(expected);
        if (!u) return { correct: false, normalizedInput: raw, hint: "parse" };
        if (!e) return { correct: false, normalizedInput: formatDomain(u) };
        return {
          correct: domainsEqual(u, e),
          normalizedInput: formatDomain(u),
        };
      }

      case "equation": {
        const u = equationToDiff(raw);
        const e = equationToDiff(expected);
        if (!u || !e)
          return { correct: false, normalizedInput: raw, hint: "parse" };
        return { correct: equationsEqual(u, e), normalizedInput: pretty(u) };
      }

      case "point": {
        const u = parsePoint(raw);
        const e = parsePoint(expected);
        return {
          correct: pointsEqual(u, e, opts),
          normalizedInput: `(${u.join(", ")})`,
          hint: u.length !== e.length ? "arity" : undefined,
        };
      }

      case "points": {
        const u = parsePointList(raw);
        const e = parsePointList(expected);
        if (!u || !e)
          return { correct: false, normalizedInput: raw, hint: "parse" };
        return {
          correct: unorderedMatch(u, e, (x, y) => pointsEqual(x, y, opts)),
          normalizedInput: u.map((p) => `(${p.join(", ")})`).join(", "),
          hint: u.length !== e.length ? "count" : undefined,
        };
      }

      case "set": {
        const u = splitTop(stripOuterBrackets(preNormalize(raw))).map(
          normalizeExpression,
        );
        const e = splitTop(stripOuterBrackets(preNormalize(expected))).map(
          normalizeExpression,
        );
        return {
          correct: unorderedMatch(u, e, (x, y) => symbolicEqual(x, y, opts)),
          normalizedInput: u.join(", "),
          hint: u.length !== e.length ? "count" : undefined,
        };
      }

      case "number":
      case "expression":
      default: {
        const u = normalizeExpression(raw);
        const e = normalizeExpression(expected);
        // Reject input the CAS cannot read at all, so the user is told to fix
        // their notation rather than being told their maths is wrong.
        if (!u || !parses(u))
          return { correct: false, normalizedInput: raw, hint: "parse" };
        const correct = symbolicEqual(u, e, opts);
        return {
          correct,
          normalizedInput: pretty(u),
          hint: correct ? undefined : slipHint(u, e),
        };
      }
    }
  } catch {
    return { correct: false, normalizedInput: raw, hint: "parse" };
  }
}

function pretty(expr: string): string {
  try {
    return nerdamer(expr).toString();
  } catch {
    return expr;
  }
}

function parses(expr: string): boolean {
  try {
    nerdamer(expr);
    return true;
  } catch {
    return false;
  }
}
