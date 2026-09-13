# Authoring guide for Custom Study Modules

Every module is one HTML file in this folder that loads the shared engine.
Read `01-vectors.html` end to end before writing a module: it is the reference for tone, pacing, structure, widget density, and drill design.
Match it closely.

## File skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Module title</title>
<link rel="stylesheet" href="assets/study.css">
<link rel="stylesheet" href="assets/mathquill/mathquill.css">
<script src="assets/jquery.min.js"></script>
<script src="assets/mathquill/mathquill.min.js"></script>
<script src="assets/study.js"></script>
<script src="assets/mathjax-tex-svg.js"></script>
</head>
<body>
<div class="app">
<nav class="side" id="nav"></nav>
<main>
<section data-id="welcome" data-title="Start here"> ... </section>
<section data-id="ch1" data-title="Short chapter name" data-goal="6"> ... </section>
...
<section data-id="quiz" data-title="Mastery quiz"> <div class="card" id="quizBox"></div> </section>
</main>
</div>
<script>
/* question types, widgets, drills, quiz */
initModule({key:'module-key',title:'Module title',sub:'Module N · Stewart 14.1 to 14.4'});
</script>
</body>
</html>
```

Rules:
- `initModule` must be the last call. It builds the sidebar from the `<section>` elements, wires hash routing and pagers, loads progress under `sm-progress-<key>`, and typesets the page.
- Section order is chapter order. Every module has a `welcome` section first and a `quiz` section last.
- Static TeX goes straight in the HTML as `\( ... \)` (inline) or `\[ ... \]` (display). Dynamic TeX built in JS uses `M('tex')` for inline and `D('tex')` for display; write TeX in JS with `String.raw` (`const R=String.raw;` then `` M(R`\mathbf{a}\cdot\mathbf{b}`) ``).
- `Drill` and `makeQuiz` call `typeset()` for you after rendering questions and feedback. If you inject TeX anywhere else at runtime (a walkthrough, a readout), call `typeset(element)` afterward.
- Never use browser automation tools while authoring. Test with `node --check` on the extracted script (see Testing). The orchestrator runs the browser tests.

## Chapter anatomy (copy this rhythm)

1. `<p class="eyebrow">Chapter N · Stewart 14.3</p>`, `<h2>`, `<p class="lead">` one-sentence hook.
2. Two to five short paragraphs of teaching with `.formula` cards for the key formulas (each with a `<span class="cap">` caption saying how to read it).
3. At least one **Explore** card: a `Plot2D` or `Scene3D` widget with sliders, steppers, presets, or dragging, plus a `.readout` that shows the numbers live, plus a `.hint` paragraph telling the learner what to try and what to notice.
4. A `.note` (blue, key insight) or `.warn` (amber, common mistake) callout.
5. Where a procedure has steps, a step-by-step walkthrough card with Back / Next / New buttons and an `.expr` or `.steps` display (see the determinant walkthrough in module 1).
6. `<h3>Practice</h3>` and `<div class="card" id="drill-<id>"></div>` driven by a `Drill` with 4 to 8 question types.

Length target: 5 to 7 sections including welcome and quiz, roughly 900 to 1500 lines total. Prefer fewer, deeper widgets over many shallow ones.

Writing style: plain, direct, second person, short sentences. No em dashes (use a plain dash or a comma). Explain the why behind each formula in one line. Name the common mistake. Bold the term when it is defined.

Design rules: never draw a colored left-edge strip on cards or rows. Carry meaning with fills, dots, or glyphs. Colors: `--a` orange for the first object, `--b` blue for the second, `--c` green for results, `--d` purple for points, curves, and shapes.

## Engine API (assets/study.js)

Utilities: `$`, `$$`, `rint(lo,hi)`, `rnz(lo,hi)` (nonzero), `pick(arr)`, `shuffle(arr)`, `near(a,b)`, `clamp`, `gcd`, `fmt(x)` (integers, simple fractions as `a/b`, else 2 decimals), `fmtDec(x,p)`, `texNum(x)` (fractions as `\tfrac`), `texSqrt(n)` (simplified radical), `fmtSqrt(n)`, `texLin([coeffs],[vars],{constant})` builds `3x - y + 2z - 5`.

Vectors: `vadd, vsub, vscale(k,v), dot, cross, norm, unit, vzero, vparallel, texVec(v)` (`\langle 1, 2 \rangle`), `texIJK(v)`, `texPt(p)`.

Expressions: `Expr.parse(str)`, `Expr.compile(str)` returns `env => number`, `Expr.evalNumber(str)`. Variables are single letters (x, y, z, t, u, v, s, r) plus `theta`, `phi`, `rho`, `lambda` (Greek letters typed directly also work). Constants `pi`, `e`. Functions sin cos tan sec csc cot arcsin arccos arctan sinh cosh tanh sqrt cbrt ln log exp abs. Implicit multiplication works (`2xy`, `x^2y`, `xe^y`, `sin x`).

Answer checkers, all return `{ok, err?}` where `err` is a parse or format problem to show the learner:
- `checkNumber(user, value, {tol})` exact by default (relative 1e-6); pass `{tol:0.01}` for rounded answers. `value` may be `'DNE'`.
- `checkExpr(user, ref, vars, {domain:{x:[0,3]}, extraVars})` where `ref` is a `env => number` function or a string. Compares by sampling. Use `domain` to keep samples where the expression is defined (sqrt, ln). Answers containing variables outside `vars` are rejected with an `err`.
- `checkVector(user, ref, {parallel:true} | {sameDir:true})` numeric components; accepts `<1,2,3>`, `⟨1,2,3⟩`, `(1,2,3)`, `1,2,3`, `2i-j+3k`.
- `checkExprVector(user, [refFns...], vars)` vector whose components are expressions (velocity, gradient as a function, parametric curves).
- `checkEquation(user, refZeroFn, vars)` any equation equivalent up to a nonzero factor: planes, tangent planes, tangent lines, level curves. `refZeroFn(env)` is zero exactly on the solution set, e.g. `e=>3*e.x-e.y-6*e.z+13`.
- `checkLine(user, point, direction)` parametric line in `t`; any parametrization of the same line accepted; accepts `<1+2t, 3-t, 4t>`, `x=1+2t, y=3-t, z=4t`, `(x,y,z)=(...)`.
- `checkExprUpToConstant(user, ref, vars, {domain})` like `checkExpr` but any additive constant is accepted (potential functions, antiderivatives). The learner may also write `+ C` or `+ K`.
- `checkAngle(user, refRadians, {tol, mod})` equal modulo \(2\pi\) (polar, cylindrical, and spherical \(\theta\)); the learner may type `pi/4`, `7pi/4`, or a decimal.
- `checkNumberList(user, [values], {tol})` order-free comma list; `[]` means DNE expected.
- `checkPointList(user, [[x,y],...], {tol})` order-free list of points; `[]` means DNE expected.
- Every `input.num` is upgraded into a calcPad-style MathQuill field by `initMathFields()` (called by `initModule`) and by `Drill`/`makeQuiz` after each render; the original input becomes hidden and always holds the field's LaTeX, so `$('[data-k=..]').value` keeps working. Modules must load `assets/mathquill/mathquill.css`, `assets/jquery.min.js`, and `assets/mathquill/mathquill.min.js` in the head (see the skeleton). Use `focusInput(inp)` rather than `inp.focus()`. If MathQuill is absent the inputs stay plain text with a live rendered preview (`.preview`). LaTeX-style input (`\sqrt{}`, `\frac{}{}`, `\pi`, `\langle\rangle`, `\mathbf{i}`) is normalized before parsing by `normalizeInput`, which `cleanAns` applies to every checker.
- `gradeInput(inputEl, res)` colors the input and shows `res.err` under it. Pattern used in module 1: `const G=(el,k,res)=>{gradeInput($(`[data-k=${k}]`,el),res);return res;};` and `Gall(el,[[k,res],...])` for several inputs.

DOM helpers: `el(tag,attrs,html)`, `numInput(k,{wide,xwide,placeholder})`, `ansLine(labelHtml,k,{wide,xwide,placeholder,after})` returns a `.ans` row with `<input class="num" data-k="k">`, `choiceButtons(mount,[{label,value}],onPick)` returns a getter for the picked value (null if none), `stepper(mount,val,lo,hi,onChange)`, `sliderRow(mount,{label,min,max,step,value,onInput})` returns `{value,set}`, `opRow([...])`, `renderMat(matrix,{label,dims,editable,hlRow,hlCol,hlCell,cellClass,fmt,cls})`, `gradeMat(container,expected)`.

Drills:
```js
new Drill({mount:'#drill-ch1', section:'ch1', goal:6, ...mixDrill([Q.typeA, Q.typeA, Q.typeB])});
```
Repeating a type in the list weights it. Each question type is an object:
```js
Q.name={name:'human readable name',           // shown in the quiz review
  gen(){ return {/* everything needed to render, check, and solve */}; },
  render(q,el){ el.innerHTML=`<p class="prompt">...</p>`; el.appendChild(ansLine(M('f_x='),'fx',{wide:true})); },
  check(q,el){ return G(el,'fx',checkExpr($('[data-k=fx]',el).value, q.fx, ['x','y'])); },   // {ok, msg?, err?}
  hint(q,el){ /* optional: reveal a partial step inside el */ },
  solution(q){ return `Worked solution with ${M(...)} in one to three sentences.`; }
};
```
Choice questions store the getter on `q` in render (`q.get=choiceButtons(...)`) and return `{ok:false,msg:'Pick one.'}` when nothing is picked.

Quiz: `makeQuiz('#quizBox',{n:12,pass:10,section:'quiz',types:[...]})`.

Progress: `markDone(sectionId)` marks a chapter complete (drills do this automatically at `goal`; call it yourself for explore-only chapters, for example after the learner has used a widget and a walkthrough).

Plot2D:
```js
const p=new Plot2D('#canvasId',{xmin:-4,xmax:4,ymin:-4,ymax:4,grid:true,axes:true,labels:true});
p.begin();                              // clears, draws grid and axes; call at the start of every redraw
p.fn(x=>x*x,{color,width,xmin,xmax,dash});
p.param(t=>[Math.cos(t),Math.sin(t)],0,2*Math.PI,{color,arrow:true});
p.vector([x0,y0],[x1,y1],{color,label,dash,width});
p.point([x,y],{color,label,r,ring});
p.poly(points,{fill,stroke});           // polygon
p.region(a,b,lo,hi,{fill,stroke});      // area between y=lo(x) and y=hi(x)
p.contour((x,y)=>f,[levels],{color,colors,labels});   // marching squares level curves
p.heat((x,y)=>v,{colorFn:v=>'rgba(...)'});
p.field((x,y)=>[P,Q],{step,scale,normalize,color});
p.text([x,y],'label',{color,align,dx,dy});
p.on('down',w=>...).on('drag',w=>...).on('up',...).on('move',...)   // w is world coords [x,y]
```
Canvas markup: `<canvas class="scene" id="canvasId"></canvas>` (square) or add `wide` / `short` for 4:3 or 3:2. Redraw when the chapter becomes visible: `redrawOnShow('ch1', draw)`.

Scene3D:
```js
const s=new Scene3D('#canvasId',{range:3,azim:-55,elev:24});
s.clear();
s.vector(from,to,{color,label,width,dash});
s.point(p,{color,label,drop:true});    // drop draws dashed guides to the xy-plane and axes
s.polyline(points,{color,width,dash,arrow});
s.curve(t=>[x,y,z],t0,t1,{color,n});
s.polygon(points,{fill,stroke});
s.plane(point,normal,{size,fill,stroke});
s.surface((x,y)=>z,[x0,x1],[y0,y1],{n,base:SURF.blue,alpha,colorFn,stroke});
s.param((u,v)=>[x,y,z],[u0,u1],[v0,v1],{n,m,base:SURF.purple,alpha});
s.text(p,'label',{color});
s.render();                             // painter's algorithm; drag to orbit, wheel to zoom are built in
```
`SURF` has blue, purple, green, orange, pink, gray bases. Surfaces are drawn beneath lines and vectors, so draw curves that lie on a surface slightly above it if they must stay visible, or use a low `alpha`.

## Designing gradable questions

- Generate random parameters so that the answer is an integer, a simple fraction, or a clean radical. Choose vectors from a "nice" list when a length must be an integer. Build polynomials whose critical points are rational. For integrals, build the integrand from the answer backward.
- For symbolic answers (partial derivatives, gradients, curl, parametrizations) use `checkExpr` or `checkExprVector` and state the variables. Always pass `domain` when the expression involves sqrt or ln.
- For equations (planes, tangent planes, tangent lines) use `checkEquation` so any equivalent form is accepted.
- For "set up the iterated integral" questions, ask for the four limits as separate inputs graded with `checkExpr` (bounds are expressions in the outer variable) plus the integrand.
- Accept DNE where Stewart would (extrema lists, limits).
- Tell the learner the expected format in the prompt when it is not obvious: "Enter a comma-separated list", "Fractions like 1/2 are fine", "Give the value in degrees to one decimal place".
- The `solution(q)` must be a real worked solution, not just the answer: name the rule, show the key intermediate quantities, state the answer.

## Test hook (required)

At the end of the script, before `initModule`, define `window.__solvers`: a map from each question type's `name` to a function that returns the correct inputs for a generated question, so the orchestrator's harness can auto-answer every type:
```js
window.__solvers={
  'partial derivatives':q=>({fx:q.fxStr, fy:q.fyStr}),        // key = the data-k of each input, value = a string the checker accepts
  'classify the critical point':q=>({_btn:['max','min','saddle'].indexOf(q.kind)}),   // _btn = index of the correct choice button
};
```
Every type must have a solver. Strings can be raw numbers (`String(q.value)`), vectors (`'<'+q.v.join(',')+'>'`), or expression strings you stored in `gen()`.

## Testing before you finish

1. Extract the script and syntax-check it:
   `sed -n '/^<script>$/,/^<\/script>$/p' NN-name.html | sed '1d;$d' > /tmp/mNN.js && node --check /tmp/mNN.js`
2. Re-read your `gen()` functions and confirm by hand, for two random draws each, that the stored answer really is the answer to the displayed prompt. Most bugs are here.
3. Confirm every `Drill` mount id exists in the HTML, every canvas id used by a widget exists, and every section with a drill has `data-goal`.
