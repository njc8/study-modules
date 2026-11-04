/* MATH 102 Midterm 2 gauntlet items (Fall 2026: improper integrals through remainder estimates).
   Sources: the Fall 2024 MMT Practice Midterm 2, the Fall 2026 MMT Week 7 Miniexam, and the worked examples on the Midterm 2 Review sheet.
   These are practice materials, not graded work, so the exact problems appear here. "Practice" marks a problem written to fill a gap.
   Format: see the header of assets/gauntlet.js. */
window.GAUNTLET_C2M2=[];
(function(){
const R=String.raw;
const F24='F24 Practice Midterm 2',W7='F26 Week 7 Miniexam',SHEET='Midterm 2 Review sheet';
const V2=['converges','diverges'];
const V3=['converges absolutely','converges conditionally','diverges'];

/* ---------------- custom checkers */
const lim=(ref,opts)=>v=>checkLimit(v,ref,opts||{});
const seqExpr=(ref,lo)=>v=>checkExprInt(v,ref,['n'],{domain:{n:[lo||1,12]}});
const listOf=ref=>v=>checkNumberList(v,ref);
const either=(...vals)=>v=>{const r=vals.map(x=>checkNumber(v,x));return r.find(x=>x.ok)||r[0];};
/* a nonzero sequence with f(n) e^n -> 0 */
const decaysAgainstExp=v=>{
  const s=cleanAns(v);if(!s)return {ok:false,err:'Empty answer'};
  let f;try{f=Expr.compile(s);}catch(e){return {ok:false,err:e.message};}
  for(const u of Expr.vars(Expr.parse(s)))if(u!=='n')return {ok:false,err:`"${u}" should not appear`};
  try{
    const p=n=>{const x=f({n})*Math.exp(n);return Number.isNaN(x)?0:Math.abs(x);};
    if(!f({n:50})&&!f({n:100}))return {ok:false};
    const a=p(100),b=p(200),c=p(400);
    if(![a,b,c].every(Number.isFinite))return {ok:false};
    return {ok:a>0&&c<0.3&&(b===0||b<0.999*a)&&(c===0||c<0.999*b)};
  }catch(e){return {ok:false,err:e.message};}
};

window.GAUNTLET_C2M2.push(

/* ================================================================ improper integrals */
{id:'imp-both-ends',topic:'imp',title:'An integrand that blows up at both endpoints',
 concept:{q:R`How do you handle an integral whose integrand blows up at both endpoints of \([a,b]\)? When is the answer allowed to be \(0\)?`,
  rubric:['Split at an interior point so that each piece has one bad endpoint','Take a separate one-sided limit on each piece','Both pieces must converge; if either diverges the whole integral diverges, and cancellation or symmetry alone does not justify an answer of 0'],
  model:R`<p>Split at any interior point so each piece has exactly one bad endpoint, then replace that endpoint with \(t\) and take a one-sided limit from inside the interval.</p><p>The integral converges only if both pieces converge. The answer can be \(0\) if the two converged pieces cancel, but symmetry alone is never a justification: you may not cancel divergent behavior.</p>`},
 app:{source:F24+' · Problem 1',
  prompt:R`Evaluate \(\displaystyle\int_0^1\frac{4x-2}{\sqrt[3]{x^2-x}}\,dx\), or explain why it does not converge.`,
  parts:[{k:'L',label:R`\(\displaystyle\int_0^{1/2}=\)`,kind:'custom',check:lim(3/Math.pow(4,2/3)),sol:'3/4^(2/3)',placeholder:'value, or diverges'},
   {k:'T',label:R`\(\displaystyle\int_0^{1}=\)`,kind:'custom',check:lim(0),sol:'0',placeholder:'value, or diverges'}],
  solution:R`<p>The denominator vanishes at both \(x=0\) and \(x=1\), so split at \(x=\tfrac12\). Let \(u=x^2-x\), \(du=(2x-1)\,dx\), so \((4x-2)\,dx=2\,du\) and an antiderivative is \(3u^{2/3}=3(x^2-x)^{2/3}\).</p><p>\(\displaystyle\lim_{t\to0^+}\Big[3(x^2-x)^{2/3}\Big]_t^{1/2}=3\left(\tfrac14\right)^{2/3}\), and \(\displaystyle\lim_{t\to1^-}\Big[3(x^2-x)^{2/3}\Big]_{1/2}^{t}=-3\left(\tfrac14\right)^{2/3}\).</p><p>Both pieces converge, so the integral converges, and its value is \(\mathbf 0\). Note that \((x^2-x)^{2/3}\) means the cube root squared, so it is real and positive even though \(x^2-x\lt 0\) here.</p>`}},

{id:'imp-ln-pf',topic:'imp',title:'Substitution, then partial fractions, then a limit',
 concept:{q:R`You see \(\dfrac{1}{x}\) times a function of \(\ln x\) on an infinite interval. What is your plan, start to finish, and where does the limit symbol go?`,
  rubric:['Substitute u = ln x, with du = dx/x, and change the limits, so the top limit stays infinite','Factor the resulting quadratic and use partial fractions','Write t for the infinite limit and take the limit at the end; the log of the ratio tends to ln 1 = 0'],
  model:R`<p>Let \(u=\ln x\), so \(du=dx/x\), and change the limits. A quadratic in \(u\) in the denominator then factors, and partial fractions gives a difference of logs.</p><p>Replace the infinite limit with \(t\) and let \(t\to\infty\). The two logs do not separately converge, so combine them first: \(\ln\frac{u+a}{u+b}\to\ln 1=0\).</p>`},
 app:{source:F24+' · Problem 2',
  prompt:R`Evaluate \(\displaystyle\int_2^\infty\frac{dx}{x\left(\ln^2x+3\ln x+2\right)}\), or explain why it does not converge. Exact value, with ln in the answer.`,
  parts:[{k:'v',label:'value =',kind:'custom',check:lim(Math.log((2+Math.LN2)/(1+Math.LN2))),sol:'ln((2+ln(2))/(1+ln(2)))',xwide:true,placeholder:'value, or diverges'}],
  solution:R`<p>Let \(u=\ln x\). The integral becomes \(\displaystyle\int_{\ln 2}^\infty\frac{du}{(u+1)(u+2)}=\int_{\ln 2}^\infty\left(\frac{1}{u+1}-\frac{1}{u+2}\right)du\).</p><p>\(\displaystyle\lim_{t\to\infty}\left[\ln\frac{u+1}{u+2}\right]_{\ln 2}^{t}=0-\ln\frac{1+\ln 2}{2+\ln 2}=\ln\frac{2+\ln 2}{1+\ln 2}\).</p>`}},

{id:'imp-arctan',topic:'imp',title:'An exponential substitution on an infinite interval',
 concept:{q:R`Why can you not just plug \(\infty\) into an antiderivative? What do you write instead?`,
  rubric:['An improper integral is defined as a limit of proper integrals','Replace the infinite endpoint by t, integrate over the finite interval, then let t tend to infinity','The integral converges only if that limit exists as a finite number'],
  model:R`<p>\(\int_a^\infty f\,dx\) is defined as \(\displaystyle\lim_{t\to\infty}\int_a^t f\,dx\). So you integrate over a finite interval and then take a limit. The integral converges only if that limit exists. Keep the limit symbol on every line until it is gone.</p>`},
 app:{source:W7+' · Problem 1',
  prompt:R`Evaluate \(\displaystyle\int_0^\infty\frac{e^x}{e^{2x}+1}\,dx\), or show it diverges.`,
  parts:[{k:'v',label:'value =',kind:'custom',check:lim(Math.PI/4),sol:'pi/4',placeholder:'value, or diverges'}],
  solution:R`<p>Let \(u=e^x\), \(du=e^x\,dx\). Then \(\displaystyle\lim_{t\to\infty}\int_1^{e^t}\frac{du}{u^2+1}=\lim_{t\to\infty}\big(\arctan e^t-\arctan 1\big)=\frac{\pi}{2}-\frac{\pi}{4}=\frac{\pi}{4}\).</p>`}},

{id:'imp-typeII-compare',topic:'imp',title:'Direct comparison near a bad point',
 concept:{q:R`How does the Direct Comparison Test work for a Type II integral, and which benchmark exponents are the convergent ones near \(0\)?`,
  rubric:['Compare continuous nonnegative functions on the one-sided interval next to the bad point','A larger convergent integral proves convergence; a smaller divergent integral proves divergence','Near 0, the integral of 1/x^p converges exactly when p is less than 1, the reverse of the condition at infinity'],
  model:R`<p>The theorem is the same as Type I, on the relevant one-sided interval, with continuous nonnegative functions. A larger convergent integral proves convergence, and a smaller divergent one proves divergence.</p><p>The benchmark flips: \(\int_0^1 x^{-p}\,dx\) converges iff \(p\lt 1\), while \(\int_1^\infty x^{-p}\,dx\) converges iff \(p>1\).</p>`},
 app:{source:W7+' · Problem 2',
  prompt:R`Determine if \(\displaystyle\int_0^\pi\frac{\sin^2x}{\sqrt x}\,dx\) converges or diverges. Give the exponent \(p\) of the benchmark \(1/x^p\) you compare with.`,
  parts:[{k:'p',label:R`\(p=\)`,kind:'number',ans:0.5,sol:'1/2'},{k:'v',label:'The integral',kind:'choice',options:V2,ans:0}],
  solution:R`<p>On \((0,\pi]\), \(\;0\le\dfrac{\sin^2x}{\sqrt x}\le\dfrac{1}{\sqrt x}\), and both are continuous there. Since \(\int_0^\pi x^{-1/2}\,dx\) converges (\(p=\tfrac12\lt 1\)), the Direct Comparison Test says the integral <b>converges</b>.</p><p>In fact \(\sin^2x/\sqrt x\to 0\) as \(x\to 0^+\), so it has no real blow-up. The comparison is the clean way to say so.</p>`}},

{id:'imp-interior',topic:'imp',title:'A blow-up inside the interval',
 concept:{q:R`What goes wrong if you apply the Fundamental Theorem straight across a point where the integrand blows up, and what do you do instead?`,
  rubric:['The Fundamental Theorem needs the integrand continuous on the closed interval, so it does not apply directly','Split at the bad point and take a one-sided limit on each side','Both pieces must converge for the integral to converge'],
  model:R`<p>The Fundamental Theorem requires continuity on the whole closed interval. Across an infinite discontinuity, a direct plug-in can produce a number for an integral that diverges, like \(\int_{-1}^1 x^{-2}\,dx\).</p><p>So split at the bad point, take a one-sided limit on each side, and require both to converge.</p>`},
 app:{source:W7+' · Problem 3',
  prompt:R`Evaluate \(\displaystyle\int_{-1}^{8}\frac{1}{x^{1/3}}\,dx\), or show it diverges.`,
  parts:[{k:'v',label:'value =',kind:'custom',check:lim(4.5),sol:'9/2',placeholder:'value, or diverges'}],
  solution:R`<p>Split at \(0\). An antiderivative is \(\tfrac32x^{2/3}\). Then \(\displaystyle\lim_{t\to0^-}\Big[\tfrac32x^{2/3}\Big]_{-1}^{t}=-\tfrac32\) and \(\displaystyle\lim_{t\to0^+}\Big[\tfrac32x^{2/3}\Big]_{t}^{8}=6\). Both converge, and the total is \(\tfrac92\).</p>`}},

{id:'imp-dialysis',topic:'imp',title:'Interpreting an improper integral',
 concept:{q:R`Dialysis removes urea at rate \(u(t)=\frac{r}{V}C_0e^{-rt/V}\) mg/min, where \(C_0\) is the urea in the blood at \(t=0\). In two sentences, what does \(\int_0^\infty u(t)\,dt\) mean, and what value should it have?`,
  rubric:['The integral of a removal rate over time is the total amount removed','Over an infinite time window it is the total urea ever removed by continuing treatment forever','It should equal C_0: in this model all of the urea initially present is eventually removed'],
  model:R`<p>Integrating a rate over time gives a total, so this is the total urea removed if treatment ran forever. It equals \(C_0\): in this model, all the urea that was in the blood at the start is eventually removed, though never in finite time.</p>`},
 app:{source:W7+' · Problem 4(a)',
  prompt:R`Evaluate \(\displaystyle\int_0^\infty\frac{r}{V}C_0e^{-rt/V}\,dt\) for positive constants \(r,V,C_0\). Write your answer as \(k\cdot C_0\), and enter \(k\).`,
  parts:[{k:'k',label:R`\(k=\)`,kind:'number',ans:1,sol:'1'}],
  solution:R`<p>\(\displaystyle\lim_{T\to\infty}\Big[-C_0e^{-rt/V}\Big]_0^{T}=0-(-C_0)=C_0\). The factor \(r/V\) cancels the chain rule. So \(k=1\).</p>`}},

{id:'imp-review-quiz',topic:'imp',title:'The sheet\'s worked integral quiz',
 concept:{q:R`State the Asymptotic Comparison Test for improper integrals with its conditions, and explain how you find the comparison function for a complicated quotient.`,
  rubric:['Conditions: f and g continuous and positive on [a, infinity), and f asymptotic to c times g for a constant c greater than 0','Conclusion: the two integrals both converge or both diverge','Find leading terms of numerator and denominator separately, comparing whole summands, then check the ratio limit'],
  model:R`<p>If \(f,g\) are continuous and positive on \([a,\infty)\) and \(f\sim cg\) for a constant \(c>0\), then \(\int_a^\infty f\) and \(\int_a^\infty g\) both converge or both diverge.</p><p>To find \(g\), work on the numerator and denominator separately: separate at the outermost sums, compare whole summands, choose a candidate, divide by it, and verify the ratio tends to \(1\).</p>`},
 app:{source:SHEET+' · Worked Quiz',
  prompt:R`Determine whether \(\displaystyle\int_e^\infty\frac{x^{-2}+\ln x+\arctan x+x^5(0.5)^x}{e^x\ln x+\ln(x5^x)}\,dx\) converges or diverges. Give the simple \(G(x)\) with \(F\sim G\).`,
  parts:[{k:'g',label:R`\(G(x)=\)`,kind:'expr',ans:'e^(-x)',vars:['x'],domain:{x:[1,5]},sol:'e^(-x)'},{k:'v',label:'The integral',kind:'choice',options:V2,ans:0}],
  solution:R`<p><b>Numerator:</b> dividing by \(\ln x\) gives \(\frac{x^{-2}}{\ln x}+1+\frac{\arctan x}{\ln x}+\frac{x^5(0.5)^x}{\ln x}\to 1\), so it is asymptotic to \(\ln x\).</p><p><b>Denominator:</b> \(\ln(x5^x)=\ln x+x\ln5\), and dividing by \(e^x\ln x\) gives \(1+e^{-x}+\frac{x\ln 5}{e^x\ln x}\to 1\), so it is asymptotic to \(e^x\ln x\).</p><p>So \(F\sim e^{-x}\). Both are continuous and positive on \([e,\infty)\), and \(\int_e^\infty e^{-x}\,dx\) converges. By the Asymptotic Comparison Test for Improper Integrals, \(\int_e^\infty F\) <b>converges</b>.</p>`}},

/* ================================================================ asymptotics and little-o */
{id:'asym-match',topic:'asym',title:'Matching asymptotic functions',
 concept:{q:R`What does \(f\sim g\) mean, and how do you find a leading term? Why is it not enough to look at isolated factors?`,
  rubric:['f asymptotic to g means the ratio f/g tends to 1','Separate at the outermost sums, compare whole summands, then verify by dividing','A factor may lose as part of its summand, as x^5 (0.5)^x tends to 0 even though x^5 grows'],
  model:R`<p>\(f\sim g\) means \(f/g\to 1\). Separate the expression at its outermost sums, compare whole summands, choose a candidate, and verify the ratio tends to \(1\).</p><p>Compare summands, not factors: \(x^5(0.5)^x\to 0\) even though \(x^5\) grows.</p>`},
 app:{source:W7+' · Problem 5',
  prompt:R`\(f_1=x^2+3x+5,\;\; f_2=e^x+\dfrac1x,\;\; f_3=\ln x+x^{-1},\;\; f_4=\dfrac{x^3+2x}{x}\).<br>\(g_1=\ln x,\;\; g_2=x^2,\;\; g_3=e^x,\;\; g_4=x^2\).<br>For each \(f_i\), enter the index \(j\) of a function \(g_j\) with \(f_i\sim g_j\) as \(x\to\infty\). (The sheet lists \(x^2\) twice, so either index works there.)`,
  parts:[{k:'a',label:R`\(f_1\sim g_j,\ j=\)`,kind:'custom',check:either(2,4),sol:'2'},{k:'b',label:R`\(f_2\sim g_j,\ j=\)`,kind:'number',ans:3,sol:'3'},
   {k:'c',label:R`\(f_3\sim g_j,\ j=\)`,kind:'number',ans:1,sol:'1'},{k:'d',label:R`\(f_4\sim g_j,\ j=\)`,kind:'custom',check:either(2,4),sol:'4'}],
  solution:R`<p>\(f_1\sim x^2\), the highest power. \(f_2\sim e^x\), since \(1/x\to 0\). \(f_3\sim\ln x\), since \(x^{-1}\to 0\). And \(f_4=x^2+2\sim x^2\), which you only see after simplifying.</p>`}},

{id:'asym-o-match',topic:'asym',title:'Every function that f is little-o of',
 concept:{q:R`What does \(f=o(g)\) mean? Why can one \(f\) be little-o of many different functions, and why is \(x^2\) not \(o(x^2)\)?`,
  rubric:['f = o(g) means the ratio f/g tends to 0','It only says g grows strictly faster in that sense, so every faster g works','The ratio x^2/x^2 equals 1, not 0, so a function is not little-o of itself or of a constant multiple of itself'],
  model:R`<p>\(f=o(g)\) means \(f/g\to 0\): \(f\) is negligible next to \(g\). Any \(g\) growing strictly faster works, so \(x^2=o(x^3)\) and \(x^2=o(e^x)\) are both true.</p><p>\(x^2/x^2=1\), which does not tend to \(0\), so \(x^2\) is not \(o(x^2)\).</p>`},
 app:{source:W7+' · Problem 6',
  prompt:R`\(f_1=\ln x+x^2-\sin x,\;\; f_2=\dfrac{x^3}{e^x}+x,\;\; f_3=\sqrt x+\dfrac{1}{\ln x},\;\; f_4=x^3+\sqrt{x^9}\).<br>\(g_1=x^2,\;\; g_2=e^x,\;\; g_3=\sqrt{x^7},\;\; g_4=2^x\).<br>The exam asks you to match. To see all the options, enter every \(j\) with \(f_i=o(g_j)\), as a comma-separated list.`,
  parts:[{k:'a',label:R`\(f_1\):`,kind:'custom',check:listOf([2,3,4]),sol:'2,3,4',placeholder:'like 1, 3'},{k:'b',label:R`\(f_2\):`,kind:'custom',check:listOf([1,2,3,4]),sol:'1,2,3,4',placeholder:'like 1, 3'},
   {k:'c',label:R`\(f_3\):`,kind:'custom',check:listOf([1,2,3,4]),sol:'1,2,3,4',placeholder:'like 1, 3'},{k:'d',label:R`\(f_4\):`,kind:'custom',check:listOf([2,4]),sol:'2,4',placeholder:'like 1, 3'}],
  solution:R`<p>Leading terms: \(f_1\sim x^2\), \(f_2\sim x\), \(f_3\sim\sqrt x\), \(f_4\sim x^{9/2}\).</p><p>\(f_1\) is not \(o(x^2)\), since that ratio tends to \(1\). \(f_4\) beats \(\sqrt{x^7}=x^{7/2}\) and \(x^2\), so only the exponentials work. One valid one-to-one matching is \(f_1\to g_3,\ f_2\to g_1,\ f_3\to g_2,\ f_4\to g_4\).</p>`}},

{id:'asym-tf-algebra',topic:'asym',title:'True or false: the algebra of asymptotics',
 concept:{q:R`Are \(\sim\) and \(o\) defined by a ratio limit or by a difference? What is the quickest way to test a claim about them?`,
  rubric:['Both are statements about the limit of a ratio, with limit 1 for asymptotic and limit 0 for little-o','Write the ratio in the claim and apply limit laws','A false claim needs one concrete counterexample'],
  model:R`<p>Both are ratio statements: \(f/g\to 1\) and \(f/g\to 0\). To test a claim, write its ratio and use limit laws. If it fails, give one concrete pair of functions as a counterexample.</p>`},
 app:{source:F24+' · Problem 10(a, b, g, h)',
  prompt:R`True or false, with a reason or a counterexample for each.<br>(a) If \(f\sim g\) and \(g\sim h\), then \(f\sim h\).<br>(b) If \(f=o(g)\) as \(x\to\infty\), then \(f\cdot g\sim g\).<br>(g) If \(f=o(g)\) as \(x\to\infty\), then \(cf=o(g)\) for any constant \(c\).<br>(h) \(0=o(f)\) for any nonzero function \(f(x)\) as \(x\to\infty\).`,
  parts:[{k:'w',kind:'written',rubric:['(a) is true, because f/h = (f/g)(g/h) tends to 1 times 1','(b) is false: fg/g = f, which need not tend to 1, for example f = 2 and g = x','(g) is true, because cf/g = c(f/g) tends to c times 0 = 0','(h) is true, because 0/f = 0 for every x, which tends to 0']}],
  solution:R`<p><b>(a) True.</b> \(\frac fh=\frac fg\cdot\frac gh\to 1\cdot 1\).</p><p><b>(b) False.</b> \(\frac{fg}{g}=f\), which would have to tend to \(1\). Take \(f=2,\ g=x\): then \(f=o(g)\), but \(fg/g=2\), so \(fg\) is not asymptotic to \(g\).</p><p><b>(g) True.</b> \(\frac{cf}{g}=c\cdot\frac fg\to 0\).</p><p><b>(h) True.</b> \(\frac0f=0\to 0\).</p>`}},

{id:'asym-tf-integrals',topic:'asym',title:'True or false: integrals and limits',
 concept:{q:R`State the Little-o Comparison Test for improper integrals. If \(\int_0^\infty f\) converges, must \(f(x)\to 0\)?`,
  rubric:['For f, g continuous and positive with f = o(g): if the integral of g converges, so does the integral of f; if the integral of f diverges, so does the integral of g','No: f need not tend to 0','Narrow spikes of height 1 with shrinking widths give a finite total area while f has no limit'],
  model:R`<p>If \(f,g\) are continuous and positive on \([a,\infty)\) and \(f=o(g)\), then \(\int g\) converges implies \(\int f\) converges, and \(\int f\) diverges implies \(\int g\) diverges.</p><p>And no, \(f\) need not tend to \(0\). Spikes of height \(1\) at the integers, with widths summing to something finite, have finite area and no limit.</p>`},
 app:{source:F24+' · Problem 10(c, d)',
  prompt:R`True or false, with a reason or a counterexample for each.<br>(c) If \(f\) and \(g\) are positive, \(f=o(g)\), and \(\int_0^\infty g(x)\,dx\) converges, then \(\int_0^\infty f(x)\,dx\) converges.<br>(d) If \(\int_0^\infty f(x)\,dx\) converges, then \(\lim_{x\to\infty}f(x)=0\).`,
  parts:[{k:'w',kind:'written',rubric:['(c) is true by the Little-o Comparison Test (assuming the functions are continuous on the interval)','(d) is false','A counterexample to (d): narrow spikes or bumps of fixed height with shrinking widths, whose total area is finite but which do not tend to 0']}],
  solution:R`<p><b>(c) True,</b> by the Little-o Comparison Test. The theorem assumes \(f,g\) are continuous on the interval, and the exam intends that here. Without continuity, \(f\) could blow up near \(0\), because \(o\) only speaks about \(x\to\infty\).</p><p><b>(d) False.</b> Take spikes of height \(1\) at each integer \(k\), of width \(2^{-k}\). The total area is finite, but \(f\) keeps returning to \(1\), so it has no limit.</p>`}},

/* ================================================================ sequences and partial sums */
{id:'seq-closed',topic:'seq',title:'A closed formula for an interleaved list',
 concept:{q:R`How can you write one formula for a sequence that follows one pattern at odd positions and another at even positions?`,
  rubric:['Use (-1)^n to build a switch','(1-(-1)^n)/2 is 1 at odd n and 0 at even n, and (1+(-1)^n)/2 is the reverse','Multiply each pattern by its switch and add'],
  model:R`<p>Build switches from \((-1)^n\): \(\frac{1-(-1)^n}{2}\) is \(1\) at odd \(n\) and \(0\) at even \(n\), and \(\frac{1+(-1)^n}{2}\) is the reverse. Multiply each pattern by its switch and add.</p>`},
 app:{source:F24+' · Problem 3',
  prompt:R`Find a closed formula for the sequence \(\sin(1),\ \ln(2),\ \sin(3),\ \ln(4),\dots\) Use \((-1)^n\), not a piecewise formula.`,
  parts:[{k:'a',label:R`\(a_n=\)`,kind:'custom',check:seqExpr(e=>((1-Math.pow(-1,e.n))/2)*Math.sin(e.n)+((1+Math.pow(-1,e.n))/2)*Math.log(e.n)),sol:'((1-(-1)^n)/2)sin(n)+((1+(-1)^n)/2)ln(n)',xwide:true}],
  solution:R`<p>\(a_n=\dfrac{1-(-1)^n}{2}\sin n+\dfrac{1+(-1)^n}{2}\ln n\). At odd \(n\) the first switch is \(1\) and the second is \(0\). At even \(n\) they swap.</p>`}},

{id:'seq-build',topic:'seq',title:'Building a sequence on demand',
 concept:{q:R`You need \(f(n)\) with \(f(n)e^n\to 0\). What property must \(f\) have, and why does \(f(n)=e^{-n}\) fail?`,
  rubric:['f must be little-o of e^(-n), so it must die strictly faster than e^(-n)','Examples are e^(-2n) or e^(-n)/n','e^(-n) fails because the product is exactly 1, which does not tend to 0'],
  model:R`<p>You need \(f=o(e^{-n})\): \(f\) must die strictly faster than \(e^{-n}\). So \(e^{-2n}\) works, since \(e^{-2n}e^n=e^{-n}\to 0\). The borderline \(e^{-n}\) fails, because the product is exactly \(1\).</p>`},
 app:{source:F24+' · Problem 4',
  prompt:R`Find a nonzero sequence \(\{f(n)\}_{n=1}^\infty\) such that \(\displaystyle\lim_{n\to\infty}f(n)\cdot e^n=0\). Any valid answer is accepted.`,
  parts:[{k:'f',label:R`\(f(n)=\)`,kind:'custom',check:decaysAgainstExp,sol:'e^(-2n)'}],
  solution:R`<p>For example, \(f(n)=e^{-2n}\), since \(f(n)\cdot e^n=e^{-n}\to 0\). The justification is that one computed limit.</p>`}},

{id:'seq-recover',topic:'seq',title:'Recovering terms from partial sums',
 concept:{q:R`Given a formula for the partial sums \(S_k\), how do you get \(a_n\) and the sum? Why must \(a_1\) be handled separately?`,
  rubric:['For n at least 2, a_n = S_n minus S_(n-1)','The sum of the series is the limit of S_k','a_1 = S_1, because the difference formula would need S_0, which the formula does not define, so the n >= 2 formula may not extend to n = 1'],
  model:R`<p>\(a_1=S_1\), \(a_n=S_n-S_{n-1}\) for \(n\ge 2\), and \(\sum a_n=\lim S_k\). The difference formula needs \(S_{n-1}\), and the given formula does not define \(S_0\). So the \(n\ge 2\) formula may not extend to \(n=1\).</p>`},
 app:{source:SHEET+' · Worked Quiz',
  prompt:R`The partial sums of \(\sum_{n=1}^\infty a_n\) are \(S_k=\dfrac{k-8}{k+8}\) for \(k\ge 1\). Find \(a_1\), the formula for \(a_n\) when \(n\ge 2\), and the sum.`,
  parts:[{k:'a',label:R`\(a_1=\)`,kind:'number',ans:-7/9,sol:'-7/9'},{k:'n',label:R`\(a_n=\)`,kind:'custom',check:seqExpr(e=>16/((e.n+7)*(e.n+8)),2),sol:'16/((n+7)(n+8))',xwide:true},{k:'s',label:R`\(\sum a_n=\)`,kind:'custom',check:lim(1),sol:'1'}],
  solution:R`<p>\(a_1=S_1=-\tfrac79\). For \(n\ge 2\), \(a_n=\dfrac{n-8}{n+8}-\dfrac{n-9}{n+7}=\dfrac{16}{(n+7)(n+8)}\). The sum is \(\lim_{k\to\infty}\frac{k-8}{k+8}=1\). At \(n=1\) the formula would give \(\tfrac29\), not \(-\tfrac79\).</p>`}},

{id:'seq-recursive',topic:'seq',title:'A recursive sequence',
 concept:{q:R`What should you do first with a recursively defined sequence? Why is solving \(L=g(L)\) not a safe first step?`,
  rubric:['Generate enough terms to identify the behavior before trying to take a limit','Solving for L assumes the limit exists, which has not been shown','A periodic nonconstant sequence diverges, even though the equation may have a solution'],
  model:R`<p>Compute several terms first. Solving for a fixed point assumes the limit exists, so it can produce a number that means nothing. If two consecutive terms repeat an earlier pair, the recurrence repeats too, and a periodic nonconstant sequence diverges.</p>`},
 app:{source:SHEET+' · Recursive Sequence Example',
  prompt:R`Let \(a_1=1,\ a_2=2,\ a_{n+2}=a_{n+1}-a_n\). Find the period and \(a_{2026}\), and decide the sequence.`,
  parts:[{k:'p',label:'period:',kind:'number',ans:6,sol:'6'},{k:'v',label:R`\(a_{2026}=\)`,kind:'number',ans:-1,sol:'-1'},{k:'c',label:'The sequence',kind:'choice',options:V2,ans:1}],
  solution:R`<p>The terms are \(1,2,1,-1,-2,-1,1,2,\dots\) The pair \((a_7,a_8)=(1,2)\) matches \((a_1,a_2)\), so the period is \(6\). Since \(2026=6\cdot 337+4\), \(a_{2026}=a_4=-1\). The sequence is periodic and nonconstant, so it <b>diverges</b>.</p>`}},

/* ================================================================ series tests */
{id:'ser-1overk',topic:'ser',title:'A logarithm in the denominator',
 concept:{q:R`State the Integral Test with its conditions. When does a substitution \(u=\ln x\) make it work?`,
  rubric:['a_n = f(n) with f positive, continuous, and eventually decreasing','Then the series and the integral both converge or both diverge','u = ln x works when the integrand has the form (1/x) times a function of ln x'],
  model:R`<p>If \(a_n=f(n)\), with \(f\) positive, continuous, and eventually decreasing, then \(\sum a_n\) and \(\int f\) both converge or both diverge. When the integrand is \(\frac1x\) times a function of \(\ln x\), \(u=\ln x\) reduces it to a plain power of \(u\).</p>`},
 app:{source:F24+' · Problem 5',
  prompt:R`Determine whether \(\displaystyle\sum_{k=1}^\infty\frac{1}{k(\ln k)^3+1/k}\) converges or diverges. Give the value of \(\displaystyle\int_2^\infty\frac{dx}{x(\ln x)^3}\), the benchmark integral.`,
  parts:[{k:'i',label:'benchmark integral =',kind:'custom',check:lim(1/(2*Math.LN2*Math.LN2)),sol:'1/(2(ln(2))^2)',wide:true,placeholder:'value, or diverges'},{k:'v',label:'The series',kind:'choice',options:V2,ans:0}],
  solution:R`<p>For \(k\ge 2\), \(0\lt a_k\le\dfrac{1}{k(\ln k)^3}\). The function \(\dfrac{1}{x(\ln x)^3}\) is positive, continuous, and decreasing on \([2,\infty)\), and with \(u=\ln x\), \(\displaystyle\int_2^\infty\frac{dx}{x(\ln x)^3}=\frac{1}{2(\ln 2)^2}\), which is finite. So that series converges by the Integral Test, and \(\sum a_k\) <b>converges</b> by the Direct Comparison Test. The \(k=1\) term equals \(1\) and does not affect convergence.</p>`}},

{id:'ser-cos-pi',topic:'ser',title:'A hidden alternating sign',
 concept:{q:R`What does \(\cos(\pi k)\) equal at integers? If the Alternating Series Test fails on a series, what can you conclude, and what test proves divergence?`,
  rubric:['cos(pi k) = (-1)^k at integers','A failed AST condition only makes the test unavailable and does not prove divergence','The Divergence Test proves divergence: if the terms do not tend to 0, the series diverges'],
  model:R`<p>\(\cos(\pi k)=(-1)^k\). If an AST condition fails, the test is simply unavailable. To prove divergence you need something else, usually the Divergence Test: if \(a_k\not\to 0\), the series diverges.</p>`},
 app:{source:F24+' · Problem 7(a)',
  prompt:R`Classify \(\displaystyle\sum_{k=2}^\infty\frac{k\cos(\pi k)}{\ln k}\). Give \(\displaystyle\lim_{k\to\infty}|a_k|\) (type inf if infinite).`,
  parts:[{k:'l',label:R`\(\lim|a_k|=\)`,kind:'custom',check:lim('inf'),sol:'inf'},{k:'v',label:'The series',kind:'choice',options:V3,ans:2}],
  solution:R`<p>\(|a_k|=\dfrac{k}{\ln k}\to\infty\), since \(\ln k=o(k)\). So \(a_k\not\to 0\), and by the Divergence Test the series <b>diverges</b>.</p>`}},

{id:'ser-log-abs',topic:'ser',title:'An alternating log with a small argument',
 concept:{q:R`On an alternating series, why test absolute convergence first? What is \(\ln(1+u)\) like when \(u\to 0\)?`,
  rubric:['Absolute convergence is the stronger conclusion, and it implies convergence by the Absolute Convergence Theorem, so AST may not be needed','Only if the series of absolute values diverges do you go on to check the AST conditions','ln(1+u) is asymptotic to u as u tends to 0'],
  model:R`<p>If \(\sum|a_k|\) converges, you are done: the Absolute Convergence Theorem gives the stronger conclusion. Only if it diverges do you check the three AST conditions. And \(\ln(1+u)\sim u\) as \(u\to 0\), which turns a log of something near \(1\) into a power.</p>`},
 app:{source:F24+' · Problem 7(b)',
  prompt:R`Classify \(\displaystyle\sum_{k=2}^\infty(-1)^k\ln\!\left(\frac{k^2+1}{k^2-1}\right)\). Give the simple \(b_k\) with \(|a_k|\sim b_k\). (Enter it in the variable \(n\) in place of \(k\).)`,
  parts:[{k:'b',label:R`\(b_n=\)`,kind:'custom',check:seqExpr(e=>2/(e.n*e.n)),sol:'2/n^2'},{k:'v',label:'The series',kind:'choice',options:V3,ans:0}],
  solution:R`<p>\(|a_k|=\ln\!\left(1+\dfrac{2}{k^2-1}\right)\sim\dfrac{2}{k^2-1}\sim\dfrac{2}{k^2}\). Both are positive, and \(\sum 1/k^2\) converges by the \(p\)-Series Test with \(p=2>1\). By the Asymptotic Comparison Test, \(\sum|a_k|\) converges, so the series <b>converges absolutely</b>.</p>`}},

{id:'ser-power-k',topic:'ser',title:'A whole term raised to the k',
 concept:{q:R`State the Direct Comparison Test for series with its conditions. Which direction proves convergence?`,
  rubric:['a_n and b_n nonnegative with a_n at most b_n for all n past some M','If the larger series converges, the smaller converges','If the smaller series diverges, the larger diverges; the other two directions tell you nothing'],
  model:R`<p>If \(0\le a_n\le b_n\) for all \(n\ge M\): the larger converging proves the smaller converges, and the smaller diverging proves the larger diverges. To prove convergence, you need a larger convergent benchmark.</p>`},
 app:{source:F24+' · Problem 7(c)',
  prompt:R`Classify \(\displaystyle\sum_{k=1}^\infty\frac{k^{2k}}{(1+2k^2)^k}\). Give the ratio \(r\) of the geometric series you compare with.`,
  parts:[{k:'r',label:R`\(r=\)`,kind:'number',ans:0.5,sol:'1/2'},{k:'v',label:'The series',kind:'choice',options:V3,ans:0}],
  solution:R`<p>\(a_k=\left(\dfrac{k^2}{1+2k^2}\right)^k\), and \(\dfrac{k^2}{1+2k^2}\le\dfrac12\). So \(0\le a_k\le\left(\tfrac12\right)^k\). The Geometric Series Test gives convergence of the larger series (\(|r|=\tfrac12\lt 1\)), and the Direct Comparison Test finishes it. The terms are positive, so it <b>converges absolutely</b>.</p><p>The Root Test also gives \(L=\tfrac12\). It is not on this year's review sheet, so the comparison is the safer route.</p>`}},

{id:'ser-ratio',topic:'ser',title:'A factorial against a power',
 concept:{q:R`State the Ratio Test with its conditions and all three cases. When should you reach for it?`,
  rubric:['Terms eventually nonzero and L = lim |a_(n+1)/a_n| exists, allowing infinity','L less than 1 gives absolute convergence, L greater than 1 (including infinity) gives divergence, L = 1 is inconclusive','Use it for factorials or adjacent exponential powers, where the ratio produces cancellation'],
  model:R`<p>With terms eventually nonzero and \(L=\lim|a_{n+1}/a_n|\) existing (allowing \(\infty\)): \(0\le L\lt 1\) gives absolute convergence, \(1\lt L\le\infty\) gives divergence, and \(L=1\) is inconclusive. Reach for it with factorials or adjacent exponential powers.</p>`},
 app:{source:F24+' · Problem 8',
  prompt:R`Decide \(\displaystyle\sum_{k=1}^\infty\frac{(2k)!}{k^{2k}}\). Give the ratio limit \(L\), exactly.`,
  parts:[{k:'L',label:R`\(L=\)`,kind:'number',ans:4/(Math.E*Math.E),sol:'4/e^2'},{k:'v',label:'The series',kind:'choice',options:V2,ans:0}],
  solution:R`<p>\(\left|\dfrac{a_{k+1}}{a_k}\right|=\dfrac{(2k+2)(2k+1)}{(k+1)^2}\left(\dfrac{k}{k+1}\right)^{2k}\). The first factor tends to \(4\), and the second to \(e^{-2}\). So \(L=4e^{-2}\lt 1\), and by the Ratio Test the series <b>converges</b>, in fact absolutely.</p>`}},

{id:'ser-p-log',topic:'ser',title:'For which p does a log series converge?',
 concept:{q:R`How do you handle a family of series with a parameter, such as \(\sum\frac{1}{k^p\ln k}\)? Why does \(p=1\) need its own test?`,
  rubric:['Split into the cases p > 1, p = 1, and p < 1','For p > 1 compare with the convergent p-series; for p < 1 compare from below with the p = 1 case','At p = 1 comparison with 1/k points the useless way, so use the Integral Test, with u = ln x giving ln ln x, which diverges'],
  model:R`<p>Split into cases. For \(p>1\), \(\frac{1}{k^p\ln k}\le\frac{1}{k^p}\) for \(k\ge 3\), so it converges. At \(p=1\), the term is smaller than the divergent \(1/k\), which is useless, so use the Integral Test: \(\int\frac{dx}{x\ln x}=\ln\ln x\to\infty\). For \(p\lt 1\), the term is larger than the \(p=1\) term, so it diverges.</p>`},
 app:{source:F24+' · Problem 9',
  prompt:R`Find the values of \(p\) for which \(\displaystyle\sum_{k=2}^\infty\frac{1}{k^p\ln k}\) converges. Answer like \(p>2\).`,
  parts:[{k:'c',label:R`\(p:\)`,kind:'custom',check:v=>checkCondition(v,{v:'p',op:'>',val:1}),sol:'p>1',placeholder:'p > ...'}],
  solution:R`<p>Converges exactly when \(p>1\). For \(p>1\): \(0\le\frac{1}{k^p\ln k}\le\frac{1}{k^p}\) for \(k\ge 3\), so Direct Comparison with a convergent \(p\)-series. For \(p=1\): \(\frac{1}{x\ln x}\) is positive, continuous, and decreasing on \([2,\infty)\), and \(\int_2^\infty\frac{dx}{x\ln x}=\lim_{t\to\infty}\ln\ln t-\ln\ln 2=\infty\), so it diverges by the Integral Test. For \(p\lt 1\): \(\frac{1}{k^p\ln k}\ge\frac{1}{k\ln k}\), so it diverges by Direct Comparison.</p>`}},

{id:'ser-integral-example',topic:'ser',title:'The sheet\'s Integral Test example',
 concept:{q:R`What three conditions must you check before using the Integral Test, and how do you check "decreasing"?`,
  rubric:['f must be positive, continuous, and eventually decreasing, with a_n = f(n)','Check decreasing by showing the derivative is negative for x past some point','If a condition fails the test is unavailable, and that failure alone does not determine convergence'],
  model:R`<p>\(f\) must be positive, continuous, and eventually decreasing, with \(a_n=f(n)\). To check decreasing, show \(f'(x)\lt 0\) past some point. If a condition fails, the test is unavailable. That failure alone determines nothing.</p>`},
 app:{source:SHEET+' · Integral Test example',
  prompt:R`For \(f(x)=\dfrac{1}{x(\ln x)^2}\) on \([2,\infty)\), give \(\displaystyle\int_2^\infty f(x)\,dx\) and decide \(\displaystyle\sum_{n=2}^\infty\frac{1}{n(\ln n)^2}\).`,
  parts:[{k:'i',label:'integral =',kind:'custom',check:lim(1/Math.LN2),sol:'1/ln(2)',placeholder:'value, or diverges'},{k:'v',label:'The series',kind:'choice',options:V2,ans:0}],
  solution:R`<p>\(f\) is positive and continuous on \([2,\infty)\), and \(f'(x)=-\dfrac{\ln x+2}{x^2(\ln x)^3}\lt 0\). With \(u=\ln x\), \(\displaystyle\int_2^\infty\frac{dx}{x(\ln x)^2}=\frac{1}{\ln 2}\). So the series <b>converges</b> by the Integral Test. Its sum is not \(\frac{1}{\ln 2}\).</p>`}},

{id:'ser-tf-sum-integral',topic:'ser',title:'True or false: series against integrals',
 concept:{q:R`Why can a series and an integral of the same \(f\) disagree? Which hypotheses of the Integral Test prevent that?`,
  rubric:['The series only uses the values of f at the integers, while the integral uses every value in between','Without the positive, continuous, decreasing hypotheses, f can wiggle or spike between the integers','So in general neither convergence implies the other'],
  model:R`<p>The series only sees \(f(1),f(2),\dots\), while the integral sees everything in between. Without the Integral Test's hypotheses, \(f\) can add area between the dots, or spike at the dots with almost no area. Neither convergence then implies the other.</p>`},
 app:{source:F24+' · Problem 10(e, f)',
  prompt:R`True or false, with a counterexample for each one that is false. Here \(f(k)=a_k\) with no other assumptions.<br>(e) If \(\sum_{k=1}^\infty a_k\) converges, then \(\int_0^\infty f(x)\,dx\) converges.<br>(f) If \(\int_0^\infty f(x)\,dx\) converges, then \(\sum_{k=1}^\infty a_k\) converges.`,
  parts:[{k:'w',kind:'written',rubric:['(e) is false: a function can match the terms at the integers but add area in between, like f(x) = sin^2(pi x), where every a_k = 0 and the integral diverges','(f) is false: a function can spike to height 1 at each integer with shrinking widths, so the integral converges while a_k = 1 diverges','The Integral Test does not apply because its hypotheses are not assumed']}],
  solution:R`<p><b>(e) False.</b> Take \(f(x)=\sin^2(\pi x)\). Every \(a_k=0\), so the series converges, but the integral diverges.</p><p><b>(f) False.</b> Take spikes of height \(1\) at each integer \(k\) with width \(2^{-k}\), and \(0\) elsewhere. The integral converges, but \(a_k=1\) for all \(k\), so the series diverges.</p><p>Neither contradicts the Integral Test: these \(f\) are not decreasing.</p>`}},

{id:'ser-tf-mixed',topic:'ser',title:'True or false: quick series facts',
 concept:{q:R`What exactly does \(a_k\to 0\) tell you? For which \(r\) does \(\sum_{k\ge 0}r^k\) converge?`,
  rubric:['a_k tending to 0 is necessary for convergence but not sufficient; the harmonic series is the counterexample','The geometric series converges if and only if |r| is less than 1','So r less than 1 alone is not enough, because r could be -1 or -2'],
  model:R`<p>\(a_k\to 0\) is necessary, not sufficient: \(1/k\to 0\), yet the harmonic series diverges. A geometric series converges iff \(|r|\lt 1\), so \(r\lt 1\) alone is not enough. \(r=-2\) is a counterexample.</p>`},
 app:{source:F24+' · Problem 10(i, j, k)',
  prompt:R`True or false, with a reason or a counterexample for each.<br>(i) The series \(\sum_{n=1}^\infty n^{\ln(1/n)}\) converges.<br>(j) If \(a_k\to 0\), then \(\sum_{k=1}^\infty a_k\) converges.<br>(k) If \(r\lt 1\), then the series \(\sum_{k=0}^\infty r^k\) is a convergent geometric series.`,
  parts:[{k:'w',kind:'written',rubric:['(i) is true: n^(ln(1/n)) = n^(-ln n), and once ln n is at least 2 the term is at most 1/n^2, so Direct Comparison gives convergence','(j) is false, with the harmonic series as a counterexample','(k) is false, because convergence needs |r| less than 1; r = -1 or r = -2 is a counterexample']}],
  solution:R`<p><b>(i) True.</b> \(n^{\ln(1/n)}=n^{-\ln n}\). Once \(\ln n\ge 2\), that is at most \(n^{-2}\). Direct Comparison with the \(p\)-series \(p=2\) gives convergence.</p><p><b>(j) False.</b> \(1/k\to 0\), and the harmonic series diverges.</p><p><b>(k) False.</b> \(r=-2\) satisfies \(r\lt 1\), and the series diverges. Convergence needs \(|r|\lt 1\).</p>`}},

/* ================================================================ remainder estimates */
{id:'rem-sign',topic:'rem',title:'Smallest N when the signs change',
 concept:{q:R`State the Direct Comparison Remainder Theorem with its conditions. Why can you not apply it directly to \(\frac{\cos k+\cos^2k+\cos^3k}{k^3}\), and what do you do instead?`,
  rubric:['For convergent series with g(k) >= f(k) >= 0 for k >= N, and g positive, continuous, and decreasing on [N, infinity), the remainders satisfy R^f_n <= R^g_n <= the integral of g from n to infinity','It needs f nonnegative, but this numerator can be negative','Pass to absolute values: |R_N| is at most the tail of |a_k|, then bound |a_k| by 3/k^3'],
  model:R`<p>If both series converge, \(g(k)\ge f(k)\ge 0\) for \(k\ge N\), and \(g\) is positive, continuous, and decreasing on \([N,\infty)\), then for \(n\ge N\), \(R^f_n\le R^g_n\le\int_n^\infty g\).</p><p>This numerator can be negative, so the theorem needs absolute values first: \(|R_N|\le\sum_{k>N}|a_k|\), and \(|a_k|\le 3/k^3\). The alternating theorem does not apply either, because the signs of \(\cos k\) do not alternate regularly.</p>`},
 app:{source:F24+' · Problem 6',
  prompt:R`Find the smallest \(N\) you can such that \(S_N\) estimates \(\displaystyle\sum_{k=1}^\infty\frac{\cos k+\cos^2k+\cos^3k}{k^3}\) within \(0.001\) of its true value.`,
  parts:[{k:'C',label:R`bound \(|a_k|\le C/k^3\), \(C=\)`,kind:'number',ans:3,sol:'3'},{k:'N',label:R`\(N=\)`,kind:'number',ans:39,sol:'39'}],
  solution:R`<p>\(|a_k|\le\dfrac{3}{k^3}\), since each cosine power has size at most \(1\). The function \(g(x)=3/x^3\) is positive, continuous, and decreasing. So \(|R_N|\le\displaystyle\sum_{k>N}|a_k|\le\int_N^\infty\frac{3}{x^3}\,dx=\frac{3}{2N^2}\).</p><p>Then \(\dfrac{3}{2N^2}\le 0.001\) gives \(N\ge\sqrt{1500}\approx 38.73\), so \(N=39\). This is the smallest \(N\) this argument certifies, not necessarily the true minimum.</p>`}},

{id:'rem-ast',topic:'rem',title:'The alternating remainder',
 concept:{q:R`State the Alternating Series Remainder Theorem with its conditions. What extra information does it give about where \(S\) lies?`,
  rubric:['a_k alternates with b_k positive, decreasing, and tending to 0','Then |R_N| is at most b_(N+1), the first omitted term','S lies between S_N and S_(N+1), and the error has the sign of the first omitted term'],
  model:R`<p>If \(a_k=(-1)^kb_k\) or \((-1)^{k+1}b_k\), with \(b_k>0\), \(b_{k+1}\le b_k\), and \(b_k\to 0\), then \(|R_N|\le b_{N+1}\). Also \(S\) lies between \(S_N\) and \(S_{N+1}\), and the error has the sign of the first omitted term.</p>`},
 app:{source:SHEET+' · Alternating Remainder example',
  prompt:R`For \(\displaystyle\sum_{k=1}^\infty\frac{(-1)^k}{k^2}\), find the smallest \(N\) certified by the theorem for error at most \(0.001\).`,
  parts:[{k:'N',label:R`\(N=\)`,kind:'number',ans:31,sol:'31'}],
  solution:R`<p>All three conditions hold, so \(|R_N|\le\dfrac{1}{(N+1)^2}\le 0.001\) when \(N+1\ge\sqrt{1000}\approx 31.6\). So \(N+1=32\), and \(N=31\). This is the smallest \(N\) certified by the theorem. It need not be the actual smallest \(N\) whose error meets the tolerance.</p>`}},

{id:'rem-int',topic:'rem',title:'When N is the actual minimum',
 concept:{q:R`State the Integral Test Remainder Theorem with its conditions. How can you ever prove that your \(N\) is the actual minimum, rather than merely sufficient?`,
  rubric:['The series converges, f(k) = a_k, and f is positive, continuous, and decreasing for x >= n; then the integral from n+1 to infinity <= R_n <= the integral from n to infinity','An upper bound alone only proves sufficiency','Use the lower bound to show N-1 fails; positive tails decrease with N, so every smaller index fails as well'],
  model:R`<p>If \(\sum a_k\) converges, \(f(k)=a_k\), and \(f\) is positive, continuous, and decreasing for \(x\ge n\), then \(\int_{n+1}^\infty f\le R_n\le\int_n^\infty f\).</p><p>An upper bound only shows \(N\) is enough. To prove it is the minimum, use the lower bound to show \(N-1\) fails. Positive tails decrease as \(N\) grows, so every smaller index fails too.</p>`},
 app:{source:SHEET+' · Integral Remainder example',
  prompt:R`For \(\displaystyle\sum_{k=1}^\infty\frac{1}{k^2}\) and error at most \(0.001\), find \(N\), and give the lower bound the theorem provides for \(R_{N-1}\).`,
  parts:[{k:'N',label:R`\(N=\)`,kind:'number',ans:1000,sol:'1000'},{k:'L',label:R`\(R_{N-1}\ge\)`,kind:'number',ans:0.001,sol:'1/1000'}],
  solution:R`<p>\(\dfrac{1}{N+1}\lt R_N\lt\dfrac1N\), so \(N=1000\) works. And \(R_{999}>\dfrac{1}{1000}=0.001\), so \(999\) fails. Positive tails decrease, so every smaller index fails too. So \(N=1000\) is the <b>actual</b> smallest index in this example.</p>`}},

{id:'rem-dir',topic:'rem',title:'A series you cannot integrate',
 concept:{q:R`Why does \(\frac{e^{1/k}}{k^3}\) call for a comparison remainder rather than the Integral Test Remainder? What exactly does your final \(N\) prove?`,
  rubric:['Its antiderivative is not convenient, so you bound e^(1/k) by e and integrate the simpler g(x) = e/x^3','The bound is the integral of g from N to infinity, by the Direct Comparison Remainder Theorem','The resulting N is sufficient, and this upper bound does not prove it is the actual minimum'],
  model:R`<p>\(e^{1/k}\le e\), so \(g(x)=e/x^3\) is a larger function you can integrate, and it is positive, continuous, and decreasing. The Direct Comparison Remainder Theorem bounds the tail by \(\int_N^\infty g\). The \(N\) you get is sufficient. This upper bound does not prove it is the minimum.</p>`},
 app:{source:SHEET+' · Direct Comparison Remainder example',
  prompt:R`For \(a_k=\dfrac{e^{1/k}}{k^3}\), use \(e^{1/k}\le e\) to find the \(N\) this certifies for error at most \(0.001\), and the bound on \(R_{10}\) (exact).`,
  parts:[{k:'R',label:R`\(R_{10}\le\)`,kind:'number',ans:Math.E/200,sol:'e/200'},{k:'N',label:R`\(N=\)`,kind:'number',ans:37,sol:'37'}],
  solution:R`<p>\(R_N\le\displaystyle\int_N^\infty\frac{e}{x^3}\,dx=\frac{e}{2N^2}\), so \(R_{10}\le\dfrac{e}{200}\approx 0.01359\). For \(0.001\): \(N\ge\sqrt{500e}\approx 36.87\), so \(N=37\) suffices. This upper bound does not prove \(37\) is the actual minimum.</p>`}},

{id:'rem-review-series',topic:'ser',title:'The sheet\'s complicated series',
 concept:{q:R`State the Asymptotic Comparison Test for series with its conditions, and walk through the five lines of a full-credit answer.`,
  rubric:['Both series eventually positive and a_n asymptotic to c times b_n for a nonzero constant c; then both converge or both diverge','The five lines: state the benchmark, state the theorem and conditions, show the decisive ratio limit, say why the benchmark behaves naming its test, state the conclusion'],
  model:R`<p>If \(\sum a_n,\sum b_n\) are eventually positive and \(a_n\sim cb_n\) for a nonzero constant \(c\), they both converge or both diverge.</p><p>Five lines: the benchmark, the theorem and its conditions, the decisive ratio limit, why the benchmark behaves (naming its test), and the conclusion.</p>`},
 app:{source:SHEET+' · Worked Quiz',
  prompt:R`Determine the convergence of \(\displaystyle\sum_{n=1}^\infty\frac{\sqrt{5^{-n}+n^{-2}+1}+e^{-n}\ln n}{\sqrt{n^2+5\ln n+\sin(2n)}+(1.5)^n}\). Give the simple \(b_n\) with \(a_n\sim b_n\).`,
  parts:[{k:'b',label:R`\(b_n=\)`,kind:'custom',check:seqExpr(e=>Math.pow(2/3,e.n)),sol:'(2/3)^n'},{k:'v',label:'The series',kind:'choice',options:V2,ans:0}],
  solution:R`<p><b>Numerator:</b> \(5^{-n},\ n^{-2},\ e^{-n}\ln n\to 0\), so it tends to \(1\). The constant dominates, and neither \(e^{-n}\) nor \(\ln n\) is the leading term.</p><p><b>Denominator:</b> the root term \(\sim n\), and \(n/(1.5)^n\to 0\), so it is \(\sim(1.5)^n\). Notice that \((1.5)^n\) is outside the square root.</p><p>Take \(b_n=(2/3)^n\). Both are eventually positive (the radicand is at least \(n^2-1>0\) for \(n\ge 2\)), and \(a_n/b_n\to 1\). \(\sum b_n\) converges by the Geometric Series Test (\(|r|=\tfrac23\lt 1\)). By the Asymptotic Comparison Test, \(\sum a_n\) <b>converges</b>.</p>`}}
);
})();
