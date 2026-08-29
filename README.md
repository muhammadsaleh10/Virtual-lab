# Virtual Science Lab

An interactive virtual physics laboratory for Cambridge AS & A Level students.
Version 1 contains **one** experiment, done properly:

> **Hooke's Law — determining the spring constant**

The student sets up the apparatus, reads a millimetre ruler with their own
eyes, records their own results table, plots their own graph, draws their own
line of best fit, calculates the spring constant and receives a marked
practical report. Nothing is measured or corrected for them.

---

## Running it

You need [Node.js](https://nodejs.org) 18 or newer. From this folder:

```bash
npm install     # once, to download the dependencies
npm run dev     # start the app
```

Then open the address it prints (normally <http://localhost:5173>).

Other commands:

| Command             | What it does                                       |
| ------------------- | -------------------------------------------------- |
| `npm run build`     | Builds the production version into `dist/`         |
| `npm run preview`   | Serves that production build so you can check it   |
| `npm run typecheck` | Checks the TypeScript types without building       |

There is no server, no database and no account system. The student's work is
kept in their own browser (`localStorage`) so a refresh does not lose it.

---

## How it is put together

```
src/
  lib/
    physics.ts    the spring model — F = mg, F = kx, the elastic limit
    types.ts      the shape of the experiment state
    store.ts      one useReducer holding everything + browser persistence
    feedback.ts   the rule-based examiner
  components/
    Apparatus.tsx clamp stand, spring, ruler, masses and magnifier (SVG)
    GraphPlot.tsx the scientific graph with a draggable line of best fit
    LabScreen.tsx the two-panel lab layout
    Landing.tsx   the home page
  steps/          one file per stage of the practical
  styles/         design tokens, then base and application styles
```

**State.** Everything the experiment knows lives in a single reducer in
`lib/store.ts`. There is no global state library and no prop-drilling of
callbacks — components receive `state` and `dispatch`.

**Physics.** `lib/physics.ts` is the only place that knows how the spring
behaves. The rendered position of the pointer is computed from `x = F / k`,
so the picture and the numbers can never disagree.

Each experiment generates a fresh spring with a hidden constant between 24 and
36 N m⁻¹, so the answer cannot be memorised, plus:

- a small, repeatable manufacturing imperfection (under 1 mm) so the data is
  not suspiciously perfect;
- an **elastic limit** near 4.2–4.6 N. Past it the spring stops obeying
  Hooke's law and the points curve away from the straight line. The student is
  not warned during the experiment — the feedback teaches it afterwards.

**Marking.** `lib/feedback.ts` is a set of plain rules, one per thing an
examiner looks for: number and range of readings, accuracy of each ruler
reading, the `W = mg` conversion, placement of the line of best fit, scatter,
the value of `k`, units, elastic-limit awareness and the conclusion. No AI
model or external API is involved.
