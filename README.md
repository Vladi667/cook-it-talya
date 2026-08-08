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

An LLM is used in exactly one place: the optional *“why was I wrong?”*
explainer (`app/api/explain/route.ts`). It runs **after** the question, the
solution and the verdict have all been computed symbolically, and it is handed
the correct solution — so an approximate answer there is acceptable. Without
`ANTHROPIC_API_KEY` the route returns 503 and the button hides itself.

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

Every template is generated 100 times and each sample is verified
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

Optional, to enable the explainer:

```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
```
