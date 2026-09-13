/* MATH 102 memory deck. Loaded by math102/memory.html and by every MATH 102 module (for the "Know these cold" card).
   Card schema is documented at the top of assets/memory.js. Write TeX in prompts as \( ... \); `show` and `why` are HTML.
   Keep ids stable: the schedule is stored by id. Prefix ids with the module key's short name. */
window.MEM_MODULES=[
  {key:'c2-found',title:'Module 0 · Integration foundations'},
  {key:'c2-usub',title:'Module 1 · Substitution'},
  {key:'c2-parts',title:'Module 2 · Integration by parts'},
  {key:'c2-pf',title:'Module 3 · Partial fractions'},
  {key:'c2-polar',title:'Module 4 · Polar coordinates'},
  {key:'c2-trigint',title:'Module 5 · Trigonometric integrals'},
  {key:'c2-param',title:'Module 6 · Parametric curves'},
  {key:'c2-trigsub',title:'Module 7 · Trigonometric substitution'},
  {key:'c2-improper',title:'Module 8 · Improper integrals'},
  {key:'c2-series',title:'Module 9 · Sequences and series'},
  {key:'c2-tests',title:'Module 10 · Series tests'},
  {key:'c2-taylor',title:'Module 11 · Power series and Taylor series'},
  {key:'c2-complex',title:'Module 12 · Complex numbers'},
];
window.MEM_CARDS=window.MEM_CARDS||[];
const R_=String.raw;
/* ---- seed cards showing each kind. The full deck is appended below by module. ---- */
MEM_CARDS.push(
{id:'found-int-sec2',mod:'c2-found',kind:'const',prompt:R_`\(\displaystyle\int \sec^2 x\,dx\)`,ans:'tan(x)',vars:['x'],domain:{x:[-1.2,1.2]},placeholder:'antiderivative',
 show:R_`\(\tan x + C\)`,why:R_`Because \(\frac{d}{dx}\tan x=\sec^2 x\). Pair: \(\int\csc^2x\,dx=-\cot x+C\).`},
{id:'found-ddx-arctan',mod:'c2-found',kind:'expr',prompt:R_`\(\dfrac{d}{dx}\arctan x=\)`,ans:'1/(1+x^2)',vars:['x'],placeholder:'derivative',
 show:R_`\(\dfrac{1}{1+x^2}\)`,why:R_`So \(\int\frac{dx}{1+x^2}=\arctan x+C\) and \(\int\frac{dx}{a^2+x^2}=\frac1a\arctan\frac{x}{a}+C\).`},
{id:'series-geo-sum',mod:'c2-series',kind:'expr',prompt:R_`For \(|r|<1\): \(\displaystyle\sum_{n=0}^{\infty} a r^n=\)`,ans:'a/(1-r)',vars:['a','r'],domain:{a:[-3,3],r:[-0.9,0.9]},placeholder:'in terms of a and r',
 show:R_`\(\dfrac{a}{1-r}\), and the series diverges when \(|r|\ge 1\).`,why:'First term over one minus the ratio. Always identify the first term actually present, not the formula\'s \\(a\\).'},
{id:'taylor-exp',mod:'c2-taylor',kind:'seq',prompt:R_`Maclaurin series of \(e^x\): the general term \(a_n=\)`,ans:'x^n/n!',vars:['n','x'],domain:{n:[0,8],x:[-1.5,1.5]},placeholder:'in terms of x and n',
 show:R_`\(\displaystyle e^x=\sum_{n=0}^{\infty}\frac{x^n}{n!}=1+x+\frac{x^2}{2!}+\frac{x^3}{3!}+\cdots\), all \(x\).`,why:R_`Every derivative of \(e^x\) is 1 at 0, so \(c_n=f^{(n)}(0)/n!=1/n!\). Radius \(\infty\).`},
{id:'improper-p-test',mod:'c2-improper',kind:'recall',prompt:R_`For which \(p\) does \(\displaystyle\int_1^\infty \frac{dx}{x^p}\) converge, and to what?`,
 show:R_`Converges exactly when \(p>1\), to \(\dfrac{1}{p-1}\). Diverges for \(p\le 1\).`,why:R_`Near 0 the rule flips: \(\int_0^1 x^{-p}\,dx\) converges when \(p<1\).`},
{id:'complex-euler',mod:'c2-complex',kind:'complex',prompt:R_`\(e^{i\pi/2}=\)`,ans:[0,1],placeholder:'a + bi',
 show:R_`\(i\)`,why:R_`Euler: \(e^{i\theta}=\cos\theta+i\sin\theta\), so \(e^{i\pi/2}=0+1i\).`},
{id:'taylor-interval-ln',mod:'c2-taylor',kind:'interval',prompt:R_`Interval of convergence of \(\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{n+1}x^n}{n}\) (the series for \(\ln(1+x)\)):`,ans:{lo:-1,hi:1,loIn:false,hiIn:true},placeholder:'like [-1, 1)',
 show:R_`\((-1,1]\)`,why:R_`Radius 1 from the ratio test. At \(x=1\) it is the alternating harmonic series (converges to \(\ln 2\)); at \(x=-1\) it is minus the harmonic series (diverges).`},
{id:'series-limit-rn',mod:'c2-series',kind:'limit',prompt:R_`\(\displaystyle\lim_{n\to\infty} r^n\) for \(r=-1\):`,ans:'DNE',placeholder:'value, or DNE',
 show:R_`Does not exist: the sequence is \(-1,1,-1,1,\dots\)`,why:R_`\(r^n\) converges exactly when \(-1<r\le 1\): to 0 for \(|r|<1\), to 1 for \(r=1\).`}
);
