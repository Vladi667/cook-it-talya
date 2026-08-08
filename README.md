# Cook it Talya — Bagrut math trainer

A practice engine for Israeli 5-unit Bagrut mathematics (Mo'ed 581/582 style).
Drill generated exam questions, get step-by-step solutions, and let the app
push you toward your weak areas.

## The architectural constraint

**Problems are generated from parametrized templates with closed-form
solutions — never by an LLM at runtime.**

Each template in `lib/templates/` defines four things:

| Piece | Where |
| --- | --- |
| parameter sampler | `draw(rng)` in the template |
| validity check | the same `draw`, returning `null` to reject a degenerate case |
| symbolic solver | closed-form expressions built alongside the parameters |
| ordered solution steps | the `steps` array |

The parameters are chosen so the answers stay clean: Pythagorean direction
vectors give integer side lengths, lattice circles give integer circumcentres,
integration bounds are picked so the irrational parts cancel. Nothing is
approximated and nothing is guessed.

**No LLM is involved anywhere at runtime**, including in the *“why was I
wrong?”* explainer — see below. The app needs no API key, makes no network
calls, and costs nothing to run.

## Templates

| id | topic |
| --- | --- |
| `triangle-bisector` | angle bisector length via the bisector theorem |
| `triangle-from-lines` | vertices from two perpendicular bisectors + circumscribed circle |
| `function-investigation` | domain, extrema, asymptotes, tangent (`ln` / rational / root families) |
| `area-between-curves` | bounded area with a split point where the boundary changes |
| `reverse-integral` | recover a constant from a definite integral |
| `limits` | 8 families needing simplification before substitution |

## Answer checking

`lib/checker.ts` never compares strings. `2x+3`, `3+2x` and `(4x+6)/2` all
validate against the same expected answer.

- tolerant parsing: `sqrt(2)`, `√2`, `2^0.5`, `sqrt 2`, `ln x`, `ln(x)`, `2x`,
  `(x+1)(x-2)`, `π`, `x²`, unicode minus
- symbolic equivalence via nerdamer, with a numeric fallback that samples both
  expressions at several points in the domain
- points compared component-wise, point/scalar sets order-insensitively
- equations compared up to a nonzero scalar multiple, so
  `x^2+y^2-4x+2y-20=0` matches `(x-2)^2+(y+1)^2=25`
- domains parsed into canonical interval unions, so `x>0, x≠2` matches
  `(0,2)∪(2,∞)`
- constants accept hand-rounded decimals (~3 significant digits)

## “Why was I wrong?”

Deterministic, instant, offline (`lib/diagnose.ts`). Rules are tried
most-specific first:

1. **Declared pitfalls.** Each template lists the wrong answers students
   actually produce, with the reason — the midpoint of `BC` instead of the
   bisector foot (“that is the *median*”), the swapped weights in the section
   formula, integrating `curve − line` across the whole interval when the line
   is below the axis, the remainder of the long division instead of `b`,
   `e^(a+b)` instead of `e^(ab)`, an upside-down ratio, `f(x₀)` used as the
   `y`-intercept, `x = p` instead of `x = −p`.
2. **The right answer to a different part** of the same question.
3. **Shape of the error** from the checker: exact sign flip, factor of two,
   arithmetic-only slip, wrong number of answers.
4. **Fallback** pointing at the first solution step.

Two tests keep this honest: no declared pitfall may equal the correct answer
(a real bug this caught twice — the trap collapses onto the right answer when
`p=1`, and when `|a|=|b|` an upside-down ratio is the same number), and every
declared pitfall must actually be diagnosed by name.

## Adaptive drilling

Spaced repetition keyed on the **template type**, not on individual questions —
every question is new, so there is nothing to repeat verbatim. Mastery is
accuracy discounted by how little evidence there is, decayed with a 10-day
half-life. Selection weight rewards low mastery and staleness, with a floor so
no template ever drops out of the rotation.

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind v4 · KaTeX ·
nerdamer (Algebra + Calculus + Solve) · Zustand · Vitest.

Persistence is `localStorage` behind the `StorageAdapter` interface in
`lib/storage.ts`; swapping in Supabase means writing one class and changing the
export at the bottom of that file. No auth in v1.

## Tests

```bash
npm test
```

86 tests. Every template is generated 100 times and each sample is verified
*independently* of its own algebra — numeric integration for areas and
integrals, numeric limits for limits, central differences for derivatives, and
direct geometric checks (is `D` on `BC`? does `AD` bisect the angle? do all
three vertices lie on the circle?). There is also a meta-test that corrupts
each claimed value and asserts every check goes red, so the harness cannot
silently pass.

> Note: `nerdamer.diff` is wrong for `sqrt` inside a product — it returns
> `sqrt((1/2)x^(-1/2))` where `sqrt(x)` belongs. That is why derivative
> verification uses central differences instead.

## Development

```bash
npm install
npm run dev
```

There is nothing to configure — no API keys, no environment variables, no
backend. The whole app runs client-side.
