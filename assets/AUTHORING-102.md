# Authoring guide addendum: MATH 102 modules

Read `assets/AUTHORING.md` first. Everything there applies. This file adds what is specific to the MATH 102 (single variable calculus II) modules, which live in `math102/`.

Reference modules to read before writing: `01-vectors.html` (tone, pacing, drill design) and `07-double-integrals.html` (integral walkthroughs, `Plot2D.region` shading, limits-as-expressions questions).

## File skeleton (paths differ from the MATH 212 modules)

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Module title</title>
<link rel="stylesheet" href="../assets/study.css">
<link rel="stylesheet" href="../assets/mathquill/mathquill.css">
<script src="../assets/jquery.min.js"></script>
<script src="../assets/mathquill/mathquill.min.js"></script>
<script src="../assets/study.js"></script>
<script src="../assets/calc102.js"></script>
<script src="../assets/m102-deck.js"></script>
<script src="../assets/mathjax-tex-svg.js"></script>
</head>
<body>
<div class="app">
<nav class="side" id="nav"></nav>
<main>
<section data-id="welcome" data-title="Start here">
  <p class="eyebrow">Module N · Stewart 7.1</p>
  <h2>Title</h2>
  <p class="lead">One-sentence hook.</p>
  <div class="card"> How to use this + answer formats (copy the wording from 01-vectors.html, adapted) </div>
  <div class="card tint"> What you will be able to do at the end </div>
  <div id="memcard"></div>
</section>
<section data-id="ch1" data-title="Short chapter name" data-goal="6"> ... </section>
...
<section data-id="quiz" data-title="Mastery quiz"> <div class="card" id="quizBox"></div> </section>
</main>
</div>
<script>
const R=String.raw;
/* question types, widgets, drills, quiz */
$('#memcard').replaceWith(memoryCard('c2-xxx',[ 'fact html', ... ]));
window.__solvers={...};
initModule({key:'c2-xxx',title:'Module title',sub:'Module N · Stewart 7.1'});
</script>
</body>
</html>
```

- Module keys are fixed: `c2-found`, `c2-usub`, `c2-parts`, `c2-pf`, `c2-polar`, `c2-trigint`, `c2-param`, `c2-trigsub`, `c2-improper`, `c2-series`, `c2-tests`, `c2-taylor`, `c2-complex`. The key is the progress key and the memory deck tag.
- `hub` defaults to `index.html`, which inside `math102/` is the MATH 102 hub. Do not pass `hub`.
- `memoryCard(modKey, facts)` (from `calc102.js`) builds the "Know these cold" card: a list of the facts the module expects from memory, with a button into the flashcards for that unit. List 4 to 10 facts as short HTML strings with TeX. This card belongs in the welcome section only.

## Extra engine API (assets/calc102.js)

Checkers (all return `{ok, err?, msg?}`):
- `checkLimit(user, ref, {strict})` where `ref` is a number, `'inf'`, `'-inf'`, or `'DNE'`. Learners may type `inf`, `infinity`, `oo`, `-inf`, `DNE`, `diverges`. Use it for limits of sequences, improper integrals, and series sums that may diverge.
- `checkExprInt(user, ref, ['n'], {domain:{n:[1,12]}})` compares expressions by sampling **integer** values of the first variable. Use it for every answer that is a formula in `n` (sequence terms, series general terms, Taylor coefficients), since `(-1)^n` and `n!` are undefined at non-integers. `n!` is accepted in typed answers and in `ref` strings. Extra variables after the first (like `x`) are sampled as reals.
- `checkInterval(user, {lo, hi, loIn, hiIn})` for intervals of convergence. `lo`/`hi` may be `-Infinity`/`Infinity`. A single point is `lo===hi` with both inclusive. Accepts `[-1,1)`, `-1<=x<1`, `(-inf,inf)`, `{2}`, `x=2`, `|x-1|<3`. Pass `null` as ref when the answer is "no values".
- `checkCondition(user, {v:'p', op:'>', val:1})` for answers like `p > 1`.
- `checkExprUpToFactor(user, ref, ['n'], {domain, positive:true})` for "give a comparison series b_n": any positive constant multiple is accepted.
- `checkPFForm(user, basis)` for "write the form of the partial fraction decomposition without solving": `basis` is an array of functions of `x`, one per unknown constant, e.g. `[x=>1/(x-1), x=>1/(x-1)**2, x=>x/(x*x+4), x=>1/(x*x+4)]` for `A/(x-1)+B/(x-1)^2+(Cx+D)/(x^2+4)`. Any letter order is accepted.
- `checkComplex(user, [re, im], {tol})` and `checkComplexList(user, [[re,im],...], {tol})`. Accepts `3+4i`, `(1+2i)(3-i)`, `2e^(i pi/3)`, `2(cos(pi/3)+i sin(pi/3))`, `sqrt(-4)`. `texCx(re, im)` prints a complex number.
- `checkPolar(user, [r, theta])` for a point `(r, theta)` with theta modulo 2pi.
- From study.js, the ones you will use most: `checkExprUpToConstant` (antiderivatives; `+C` optional; **always pass a `domain`** that keeps sqrt, ln, arcsin, tan, sec inside their domains and away from asymptotes), `checkNumber` (exact; `{tol}` for decimals), `checkExpr`, `checkEquation` (Cartesian equations of curves, tangent lines), `checkExprVector` (parametrizations `<x(t), y(t)>`), `checkNumberList`, `checkPointList`, `checkAngle`.

Formatting helpers: `texFrac(n,d)` simplified fraction with the sign in front (`{tf:true}` for `\tfrac`), `texCoef(c)` (`''` for 1, `'-'` for -1), `texTerm(c, body, first)`, `texPoly([a_n..a_0], 'x')`, `texInt(lo, hi, body, dv)` (`lo=null` for indefinite), `texSum(body, from, to)`, `texLn(arg)` gives `\ln|arg|`, `sinExact(deg)` / `cosExact(deg)` return `[tex, value, plainString]` for multiples of 30 and 45 degrees, `ANGLE_TEX[deg]` and `ANGLE_STR[deg]` for the angle itself. Fractions as `[n,d]` pairs: `fr`, `frAdd`, `frMul`, `frVal`.

Plotting: `polarCurve(plot, theta=>r, t0, t1, opts)`, `polarGrid(plot, {rmax})`, `plot.region(a, b, lo, hi, {fill, stroke})` for the area between curves, `animator(sectionId, dt=>{...})` returns `{start, stop, toggle, running}` and stops itself when the learner leaves the section. Use a Play/Pause button, never an animation that cannot be stopped.

## Question design rules for this course

- **No multiple choice, no true/false pools.** The learner asked for this explicitly: recognition creates an illusion of fluency. Every question must require a produced answer (a number, an expression, an equation, an interval, a list). Choice buttons are allowed only for a decision that is inherently categorical (converges/diverges, absolutely/conditionally, horizontal/vertical, which substitution family) and only **alongside** a typed quantity that proves the work (the limit, the value of p, the ratio L, the comparison series). A question whose only input is a choice is not allowed.
- **Rote facts go in the memory deck, not the drills.** Drills practice procedures. If a question is really "recall the formula", do not write it as a drill type; put the fact in the `memoryCard` list (the flashcard deck in `assets/m102-deck.js` already has it).
- **Design the answer first.** Build integrands backwards from a clean antiderivative; choose limits so definite integrals come out as rationals, multiples of pi, or `ln` of a rational; choose polar and parametric parameters from the special angles; make series limits rational. Reject degenerate draws in `gen()` with a loop.
- **Tell the learner the expected form** in the prompt when it is not obvious: "exact value", "you may leave ln in the answer", "comma-separated list", "an interval like [-1, 1)", "type diverges if it diverges", "to three decimal places".
- **Domains for `checkExprUpToConstant`.** `ln|x|` needs `domain:{x:[0.3,3]}` or a symmetric domain excluding 0 is not possible with one interval, so pick one side; `arcsin` needs `[-0.9,0.9]`; `sec`/`tan` need `[-1.2,1.2]`; `sqrt(x^2-a^2)` needs `x>a`. When two forms differ by a constant (like `-cos^2 x` vs `sin^2 x`) the up-to-constant checker already accepts both.
- **Absolute values.** Learners type `ln|x|` (MathQuill bar) or `ln(abs(x))`; both parse. Solutions should show `\ln|x|` where Stewart would.
- **Worked solutions** must show the method, the key intermediate step (the substitution and `du`, the choice of `u` and `dv`, the decomposition, the sector limits), and the final answer. One to four sentences.
- Goals: 5 to 8 correct answers per chapter. Quiz: `n:12, pass:10` unless the module is small.
- Use hints for multi-step procedures (`hint(q,el)` reveals the substitution or the first step).

## Explore widgets that work well for single variable calculus

- Area under or between curves with a draggable bound or slider and a live readout of the running integral (`plot.region`).
- Riemann or sector approximations with an n slider.
- Parametric motion: a point moving along the curve with a Play button (`animator`), velocity arrow drawn with `plot.vector`.
- Polar sweep: draw `r(theta)` progressively as theta grows (slider or animation) so the learner sees which theta range traces which loop.
- Tail of an improper integral with a slider for the upper limit b and the running value.
- Sequence dot plots and partial-sum dot plots side by side.
- Taylor polynomial overlay with a degree slider and a center slider.
- Complex plane with draggable z, showing conjugate, modulus, product, and roots.

Every Explore card has a `.readout` with live numbers and a `.hint` paragraph telling the learner what to try and what to notice.

## Testing (required before you finish)

1. Syntax: `sed -n '/^<script>$/,/^<\/script>$/p' math102/NN-name.html | sed '1d;$d' > /tmp/mNN.js && node --check /tmp/mNN.js`
2. Headless drill harness (jsdom): from the repo root, `node tools/harness/run.js math102/NN-name.html 40`. It generates every question type of every drill 40 times, fills the inputs from `window.__solvers`, clicks choice buttons for `_btn` keys, checks, and prints a line per type. Every type must print `ok` with zero wrong and zero thrown, and the run must end with `ALL PASS`. If a type says `NO SOLVER`, add the solver. If it says wrong, either the generator's stored answer is not the answer to the displayed prompt (most common) or the solver returns a string the checker cannot parse. Fix the generator, not the test. Run it twice to catch rare draws.
3. Re-read every `gen()` and confirm by hand for two draws that the stored answer is the answer to the displayed prompt.
4. Confirm every `Drill` mount id exists in the HTML, every canvas id exists, and every section with a drill has `data-goal`.

Never use browser automation tools while authoring. The orchestrator runs the browser checks.
