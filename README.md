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

Fourteen types, covering both papers.

| id | topic | what it drills |
| --- | --- | --- |
| `triangle-bisector` | analytic geometry | angle bisector length via the bisector theorem |
| `triangle-from-lines` | analytic geometry | vertices from two perpendicular bisectors + circumscribed circle |
| `circle-tangent` | analytic geometry | completing the square, tangent at a point, tangent length |
| `function-investigation` | calculus | domain, extrema, asymptotes, tangent (`ln` / rational / root families) |
| `polynomial-investigation` | calculus | roots, extrema, inflection and monotonicity of a cubic |
| `area-between-curves` | calculus | bounded area with a split point where the boundary changes |
| `volume-revolution` | calculus | disc and washer method, about either axis |
| `reverse-integral` | calculus | recover a constant from a definite integral |
| `optimization` | calculus | extremal problems (open box, largest inscribed rectangle) |
| `limits` | calculus | 8 families needing simplification before substitution |
| `sequences` | algebra | arithmetic and geometric, including sums to infinity |
| `growth-decay` | algebra | exponential models inverted with logarithms |
| `probability` | probability | two-stage trees, total probability, Bayes, binomial |
| `trigonometry` | trigonometry | cosine rule (integer third side) and trig equations |

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
- constants accept hand-rounded decimals, but never a different answer:
  `3.33` passes for `10/3`; `1025` never passes for `1024`, and `3/4096`
  never passes for `9/2048` (rounding must be small in absolute *and*
  relative terms, or small probabilities all look alike)

## Recognition: the "spot the pattern" drill

Recognition is a separate skill from solving, and it is the one that makes a
student fast — in the exam you should never spend minutes working out which
tool to reach for. `/spot` shows a question stem with **no answer fields and no
figure** and asks only: which method is this? Ten seconds each, twenty in three
minutes.

- **Distractors are confusable by construction** (`CONFUSABLE` in `lib/spot.ts`),
  never random. "Is this a limit or a triangle?" teaches nothing; "is this a
  circle tangent or a function tangent?" is where recognition actually fails.
- **Cues are highlighted in the real wording** once answered. Each pattern
  declares literal `triggers` that occur in its own statements, and a test
  asserts every generated statement contains at least one — and that no
  pattern's triggers fire on every other pattern. That second test immediately
  caught `"bisector of"`, which also matches "the **perpendicular** bisector
  of AB" and would have trained a misread.
- **Recognition is stored separately from solving mastery**, so the two can be
  read apart: knowing every method but being slow to identify them is a
  completely different problem from the reverse, and needs different practice.
- Selection is weighted toward the types you misread.

## The teaching layer

The app is built on one claim: **Bagrut questions are rehearsed forms, not
puzzles.** A student who recognises the form and runs a memorised recipe
finishes in a third of the time of one who re-derives everything. So the unit
of learning here is not the worked example — it is the *pattern*.

`lib/patterns.ts` gives each template:

- **signature** — the cues that identify the type in about five seconds
- **recipe** — the fixed sequence of moves; only the numbers change
- **why it works** — the reason the recipe is valid, not just that it is
- **speed tip** — the shortcut that saves real exam minutes (integrate in $y$
  instead of $x$; never find the bisector's equation; skip the quotient rule
  after a long division)
- **watch out** — what to check before writing the final line

Every solution step carries a `move` index into its recipe, so when the worked
solution is revealed each line is labelled *“Move 3 · name the upper and lower
boundary”*. The concrete instance and the general method are always shown
together. `/patterns` is the study view of all fourteen.

Ochre is used for pattern content and for nothing else, so the colour itself
comes to mean “this is the transferable part”.

## Three skills, measured apart

The exam tests three things that fail independently, and a single blended
"mastery" number cannot tell you which is costing marks:

| Skill | Where it is trained | Where it is measured |
| --- | --- | --- |
| **Recognition** — which method is this? | `/spot` | recognition % |
| **Pace** — can you do it in the exam's time? | `/quick` + budgets | × of budget |
| **Accuracy** — right *first* time? | `/` practice | first-attempt % |

Progress reports all three and names the weakest one in a sentence:
*"Accurate, but over the exam allocation. You would not finish the paper."*
`lib/budgets.ts` holds a realistic allocation per question type, which is what
turns "slow" from a feeling into a number.

### Quick fire (`/quick`)

Every full question takes minutes, which is the wrong grain for building
speed. `lib/micro.ts` drills the atoms the methods are made of — distance
formula, completing the square, long division, differentiating, solving
`qⁿ = k`, sequence steps, log simplification. Ten at a time, about a minute.

## Getting it wrong is the lesson

A first wrong answer is a teaching moment, not a verdict:

1. The answer is graded and the mistake is **named** (see below).
2. Where the diagnosis maps onto a recipe move, that move is named too.
3. **Try again** — nothing is written to your progress until you either
   succeed or ask for the solution.
4. Solving on the second attempt records at 65% credit, so mastery reflects
   the help you needed.

Only when you give up does the worked solution appear.

### Follow-through marking

Real graders award marks for work that is consistent with your *own* earlier
wrong answer. `lib/grade.ts` does the same: if part (א) is wrong but part (ב)
is worked correctly from that wrong value, (ב) earns 70%. One early sign slip
no longer wipes out a perfect second half — which is both the honest score and
the right lesson.

### Your traps

Every named mistake has a stable id (`lib/traps.ts`), so repeat offences are
counted across questions: *"Section-formula weights swapped ×4"*. An open trap
raises the selection weight of its question type, so the thing you keep
getting wrong comes back sooner. Avoid it three times and it clears.

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
nerdamer (Algebra + Calculus + Solve) · Zustand · Vitest. Type is Frank Ruhl
Libre, IBM Plex Sans Hebrew and IBM Plex Mono — all three carry Latin and
Hebrew, so the page does not change character when you switch language.

Persistence is `localStorage` behind the `StorageAdapter` interface in
`lib/storage.ts`; swapping in Supabase means writing one class and changing the
export at the bottom of that file. No auth in v1.

## Tests

```bash
npm test
```

327 tests. Every template is generated 100 times and each sample is verified
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
