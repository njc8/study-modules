/* Custom Study Modules: MATH 102 (single variable calculus II) helpers.
   Load after assets/study.js. Adds checkers and formatting helpers that the Calc 2 modules need
   and that the shared engine does not have. Everything is a global, like study.js. */

/* ============================================================ words for infinity / divergence */
const INF_RE=/^\s*\+?\s*(inf|infinity|infty|oo|∞)\s*$/i;
const NINF_RE=/^\s*-\s*(inf|infinity|infty|oo|∞)\s*$/i;
const DIV_RE=/^\s*(diverges?|divergent|dne|does not exist|none|undefined|no limit)\s*$/i;

/* checkLimit(user, ref): ref is a number, 'inf', '-inf', or 'DNE'.
   For an infinite or nonexistent reference the learner may write inf, infinity, oo, -inf, DNE, or diverges
   (any of them is accepted unless opts.strict, in which case 'inf' needs an infinity word and 'DNE' needs DNE/diverges). */
function checkLimit(user,ref,opts={}){
  const s=cleanAns(user);
  const isInf=INF_RE.test(s),isNInf=NINF_RE.test(s),isDiv=DIV_RE.test(s);
  if(ref==='inf'||ref==='-inf'||ref==='DNE'||ref===Infinity||ref===-Infinity){
    if(ref===Infinity)ref='inf';if(ref===-Infinity)ref='-inf';
    if(opts.strict){if(ref==='inf')return {ok:isInf};if(ref==='-inf')return {ok:isNInf};return {ok:isDiv};}
    if(ref==='inf')return {ok:isInf||isDiv};
    if(ref==='-inf')return {ok:isNInf||isDiv};
    return {ok:isDiv||isInf||isNInf};
  }
  if(isInf||isNInf||isDiv)return {ok:false};
  return checkNumber(s,ref,opts);
}

/* ============================================================ intervals
   checkInterval(user, {lo, hi, loIn, hiIn}) : lo/hi may be -Infinity / Infinity. A single point is lo===hi with both inclusive.
   Accepts [a,b), (a,b], (-inf,inf), a<=x<b, x>a, x>=3, {2}, x=2, "all real numbers", "R", and "empty"/"none" when ref is null. */
function parseEnd(str){
  const s=str.trim();
  if(INF_RE.test(s))return Infinity;if(NINF_RE.test(s))return -Infinity;
  return Expr.evalNumber(s);
}
function parseInterval(raw){
  let s=cleanAns(raw).replace(/\s+/g,' ').replace(/≤/g,'<=').replace(/≥/g,'>=').replace(/−/g,'-').trim();
  if(!s)throw new Error('Empty answer');
  if(/^(all real numbers|all reals|reals|r|\(-?(inf|infinity|oo|∞),\s*\+?(inf|infinity|oo|∞)\))$/i.test(s))return {lo:-Infinity,hi:Infinity,loIn:false,hiIn:false};
  let m=/^([\[(])\s*(.+?)\s*,\s*(.+?)\s*([\])])$/.exec(s);
  if(m){return {lo:parseEnd(m[2]),hi:parseEnd(m[3]),loIn:m[1]==='[',hiIn:m[4]===']'};}
  m=/^\{\s*(.+?)\s*\}$/.exec(s);
  if(m){const v=Expr.evalNumber(m[1]);return {lo:v,hi:v,loIn:true,hiIn:true};}
  m=/^([a-z])\s*=\s*(.+)$/i.exec(s);
  if(m){const v=Expr.evalNumber(m[2]);return {lo:v,hi:v,loIn:true,hiIn:true};}
  /* two-sided inequality a <= x < b */
  m=/^(.+?)\s*(<=|<)\s*[a-z]\s*(<=|<)\s*(.+)$/i.exec(s);
  if(m)return {lo:parseEnd(m[1]),hi:parseEnd(m[4]),loIn:m[2]==='<=',hiIn:m[3]==='<='};
  m=/^(.+?)\s*(>=|>)\s*[a-z]\s*(>=|>)\s*(.+)$/i.exec(s);
  if(m)return {lo:parseEnd(m[4]),hi:parseEnd(m[1]),loIn:m[3]==='>=',hiIn:m[2]==='>='};
  /* one-sided */
  m=/^[a-z]\s*(<=|<|>=|>)\s*(.+)$/i.exec(s);
  if(m){const v=parseEnd(m[2]);if(m[1][0]==='<')return {lo:-Infinity,hi:v,loIn:false,hiIn:m[1]==='<='};return {lo:v,hi:Infinity,loIn:m[1]==='>=',hiIn:false};}
  m=/^(.+?)\s*(<=|<|>=|>)\s*[a-z]$/i.exec(s);
  if(m){const v=parseEnd(m[1]);if(m[2][0]==='<')return {lo:v,hi:Infinity,loIn:m[2]==='<=',hiIn:false};return {lo:-Infinity,hi:v,loIn:false,hiIn:m[2]==='>='};}
  /* |x-c| < R */
  m=/^\|\s*[a-z]\s*(?:([+-])\s*(.+?))?\s*\|\s*(<=|<)\s*(.+)$/i.exec(s);
  if(m){const c=m[1]?(m[1]==='-'?1:-1)*Expr.evalNumber(m[2]):0;const Rr=Expr.evalNumber(m[4]);return {lo:c-Rr,hi:c+Rr,loIn:m[3]==='<=',hiIn:m[3]==='<='};}
  throw new Error('Write an interval like [-1, 1) or (-inf, inf), or an inequality like -1 <= x < 1');
}
function checkInterval(user,ref,opts={}){
  if(ref===null){return {ok:/^\s*(empty|none|no values|dne|\{\}|∅)\s*$/i.test(cleanAns(user))};}
  let u;try{u=parseInterval(user);}catch(e){return {ok:false,err:e.message};}
  const tol=opts.tol!=null?opts.tol:1e-6;
  const same=(a,b)=>(a===b)||(Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)));
  if(!same(u.lo,ref.lo)||!same(u.hi,ref.hi))return {ok:false};
  if(Number.isFinite(ref.lo)&&u.loIn!==ref.loIn)return {ok:false};
  if(Number.isFinite(ref.hi)&&u.hiIn!==ref.hiIn)return {ok:false};
  return {ok:true};
}
/* checkCondition(user, {v:'p', op:'>', val:1}) : accepts p>1, 1<p, p >= 1. op is one of > >= < <= = */
function checkCondition(user,ref){
  let s=cleanAns(user).replace(/\s+/g,'').replace(/≤/g,'<=').replace(/≥/g,'>=');
  if(!s)return {ok:false,err:'Empty answer'};
  const v=ref.v||'p';
  let m=new RegExp('^'+v+'(<=|>=|<|>|=)(.+)$').exec(s);
  let op,val;
  if(m){op=m[1];try{val=Expr.evalNumber(m[2]);}catch(e){return {ok:false,err:e.message};}}
  else{m=new RegExp('^(.+?)(<=|>=|<|>|=)'+v+'$').exec(s);if(!m)return {ok:false,err:`Write a condition on ${v}, like ${v} > 1`};
    const flip={'<':'>','>':'<','<=':'>=','>=':'<=','=':'='};op=flip[m[2]];try{val=Expr.evalNumber(m[1]);}catch(e){return {ok:false,err:e.message};}}
  return {ok:op===ref.op&&near(val,ref.val)};
}

/* ============================================================ sequences: expressions in n sampled at integers
   checkExprInt(user, ref, ['n'], {domain:{n:[1,12]}}) : like checkExpr but samples integer values of the first variable,
   so (-1)^n and n! work. n! (factorial) is accepted in the learner's answer and in ref strings. */
function checkExprInt(user,ref,vars=['n'],opts={}){
  const s=cleanAns(user);if(!s)return {ok:false,err:'Empty answer'};
  if(ref==='DNE')return {ok:DNE.test(s)};
  let f;try{f=Expr.compile(s);}catch(e){return {ok:false,err:e.message};}
  const g=typeof ref==='string'?Expr.compile(ref):ref;
  const used=Expr.vars(Expr.parse(s));const allowed=new Set(vars.concat(opts.extraVars||[]));
  for(const v of used)if(!allowed.has(v))return {ok:false,err:`"${v}" should not appear in this answer`};
  const d=(opts.domain&&opts.domain[vars[0]])||[1,12];
  let valid=0,bad=0;
  for(let k=d[0];k<=d[1];k++){
    const env={};env[vars[0]]=k;vars.slice(1).forEach(v=>{const dd=(opts.domain&&opts.domain[v])||[-2,2];env[v]=dd[0]+Math.random()*(dd[1]-dd[0]);});
    let r,u;try{r=g(env);u=f(env);}catch(e){continue;}
    if(!Number.isFinite(r)||Math.abs(r)>1e12)continue;
    valid++;if(!Number.isFinite(u)||!near(u,r,opts.rel||1e-6))bad++;
  }
  return {ok:valid>=4&&bad===0};
}

/* ============================================================ expressions equal up to a constant factor (comparison series b_n) */
function checkExprUpToFactor(user,ref,vars,opts={}){
  const s=cleanAns(user);if(!s)return {ok:false,err:'Empty answer'};
  let f;try{f=Expr.compile(s);}catch(e){return {ok:false,err:e.message};}
  const g=typeof ref==='string'?Expr.compile(ref):ref;
  const used=Expr.vars(Expr.parse(s));const allowed=new Set(vars.concat(opts.extraVars||[]));
  for(const v of used)if(!allowed.has(v))return {ok:false,err:`"${v}" should not appear in this answer`};
  let ratio=null,valid=0;
  for(let k=0;k<90&&valid<18;k++){
    const env={};vars.forEach(v=>{const d=(opts.domain&&opts.domain[v])||[1,12];env[v]=opts.integer?Math.round(d[0]+Math.random()*(d[1]-d[0])):d[0]+Math.random()*(d[1]-d[0]);});
    let r,u;try{r=g(env);u=f(env);}catch(e){continue;}
    if(!Number.isFinite(r)||!Number.isFinite(u)||Math.abs(r)<1e-9)continue;
    valid++;const q=u/r;
    if(ratio===null){ratio=q;if(!Number.isFinite(q)||Math.abs(q)<1e-9)return {ok:false};if(opts.positive&&q<0)return {ok:false};}
    else if(!near(q,ratio,1e-6))return {ok:false};
  }
  return {ok:valid>=6&&ratio!==null};
}

/* ============================================================ partial fraction form
   checkPFForm(user, basis, letters): basis is an array of functions x=>number, one per unknown constant, e.g.
   [x=>1/(x-1), x=>1/(x-1)**2, x=>x/(x*x+4), x=>1/(x*x+4)] for A/(x-1)+B/(x-1)^2+(Cx+D)/(x^2+4).
   The learner's expression must be linear in its capital letters and its basis functions must match the reference set (any letter order). */
function checkPFForm(user,basis,letters=['A','B','C','D','E','F','G','H']){
  const s=cleanAns(user);if(!s)return {ok:false,err:'Empty answer'};
  let ast,f;try{ast=Expr.parse(s);f=env=>Expr.ev(ast,env);}catch(e){return {ok:false,err:e.message};}
  const used=[...Expr.vars(ast)];
  const consts=used.filter(v=>letters.includes(v));
  for(const v of used)if(v!=='x'&&!letters.includes(v))return {ok:false,err:`"${v}" should not appear: use x and capital letters A, B, C, ...`};
  if(consts.length!==basis.length)return {ok:false,msg:`Expected ${basis.length} unknown constants, found ${consts.length}.`};
  const xs=[0.37,1.31,-0.83,2.19,-1.57,0.91,3.3,-2.4];
  const envOf=(x,vals)=>{const e={x};letters.forEach(L=>e[L]=0);consts.forEach((c,i)=>e[c]=vals[i]);return e;};
  /* linearity: f(x,2L)=2f(x,L), f(x,0)=0 */
  for(const x of xs){const vals=consts.map(()=>Math.random()*2-1);const a=f(envOf(x,vals)),b=f(envOf(x,vals.map(v=>2*v))),z=f(envOf(x,consts.map(()=>0)));
    if(![a,b,z].every(Number.isFinite))continue;if(!near(b,2*a,1e-6)||Math.abs(z)>1e-8)return {ok:false,msg:'The form must be a sum of terms, each a constant (or linear numerator) over one factor.'};}
  /* basis matching */
  const phi=consts.map((c,i)=>x=>f(envOf(x,consts.map((_,j)=>j===i?1:0))));
  const left=basis.slice();
  for(const p of phi){const k=left.findIndex(b=>sampleEqual(x=>p(x.x),x=>b(x.x),['x'],{domain:{x:[-3,3]}}));if(k<0)return {ok:false};left.splice(k,1);}
  return {ok:true};
}

/* ============================================================ complex numbers */
const Cx={
  of:(re,im=0)=>({re,im}),
  add:(a,b)=>({re:a.re+b.re,im:a.im+b.im}),sub:(a,b)=>({re:a.re-b.re,im:a.im-b.im}),
  mul:(a,b)=>({re:a.re*b.re-a.im*b.im,im:a.re*b.im+a.im*b.re}),
  div:(a,b)=>{const d=b.re*b.re+b.im*b.im;return {re:(a.re*b.re+a.im*b.im)/d,im:(a.im*b.re-a.re*b.im)/d};},
  neg:a=>({re:-a.re,im:-a.im}),abs:a=>Math.hypot(a.re,a.im),arg:a=>Math.atan2(a.im,a.re),
  exp:a=>{const r=Math.exp(a.re);return {re:r*Math.cos(a.im),im:r*Math.sin(a.im)};},
  log:a=>({re:Math.log(Cx.abs(a)),im:Cx.arg(a)}),
  pow:(a,b)=>{if(Math.abs(b.im)<1e-12&&Number.isInteger(b.re)){let n=b.re,base=a,r={re:1,im:0};const neg=n<0;n=Math.abs(n);while(n>0){if(n&1)r=Cx.mul(r,base);base=Cx.mul(base,base);n>>=1;}return neg?Cx.div({re:1,im:0},r):r;}
    if(Cx.abs(a)<1e-15)return {re:0,im:0};return Cx.exp(Cx.mul(b,Cx.log(a)));},
  sqrt:a=>Cx.pow(a,{re:0.5,im:0}),
  isReal:a=>Math.abs(a.im)<1e-9,
};
function cev(n,env){
  switch(n.t){
    case 'num':return Cx.of(n.v);
    case 'var':{if(n.n==='i')return Cx.of(0,1);const v=env[n.n];if(v===undefined)throw new Error(`"${n.n}" should not appear in this answer`);return typeof v==='number'?Cx.of(v):v;}
    case 'const':return Cx.of(n.n==='pi'?Math.PI:Math.E);
    case 'add':return Cx.add(cev(n.a,env),cev(n.b,env));
    case 'sub':return Cx.sub(cev(n.a,env),cev(n.b,env));
    case 'mul':return Cx.mul(cev(n.a,env),cev(n.b,env));
    case 'div':return Cx.div(cev(n.a,env),cev(n.b,env));
    case 'neg':return Cx.neg(cev(n.a,env));
    case 'pow':return Cx.pow(cev(n.a,env),cev(n.b,env));
    case 'abs':return Cx.of(Cx.abs(cev(n.a,env)));
    case 'fn':{const z=cev(n.a,env);
      if(n.n==='sqrt'){if(Cx.isReal(z)&&z.re<0)return Cx.of(0,Math.sqrt(-z.re));if(Cx.isReal(z))return Cx.of(Math.sqrt(z.re));return Cx.sqrt(z);}
      if(n.n==='exp')return Cx.exp(z);if(n.n==='abs')return Cx.of(Cx.abs(z));
      if(n.n==='ln'||n.n==='log')return Cx.log(z);
      if(n.n==='cbrt'&&Cx.isReal(z))return Cx.of(Math.cbrt(z.re));
      if(!Cx.isReal(z))throw new Error(n.n+' of a complex number is not supported here');
      const x=z.re;const F={sin:Math.sin,cos:Math.cos,tan:Math.tan,arctan:Math.atan,arcsin:Math.asin,arccos:Math.acos,sinh:Math.sinh,cosh:Math.cosh,tanh:Math.tanh,sec:v=>1/Math.cos(v),csc:v=>1/Math.sin(v),cot:v=>1/Math.tan(v)}[n.n];
      if(!F)throw new Error('Unknown function '+n.n);return Cx.of(F(x));}
  }
  throw new Error('Bad expression');
}
/* evalComplex('3+4i') -> {re,im}. Also accepts polar-ish forms like 2e^(i pi/3), 2(cos(pi/3)+i sin(pi/3)), cis is not supported. */
function evalComplex(str){const s=cleanAns(str);if(!s)throw new Error('Empty answer');const ast=Expr.parse(s);const z=cev(ast,{});if(!Number.isFinite(z.re)||!Number.isFinite(z.im))throw new Error('That does not evaluate to a complex number');return z;}
function checkComplex(user,ref,opts={}){
  let z;try{z=evalComplex(user);}catch(e){return {ok:false,err:e.message};}
  const r=Array.isArray(ref)?{re:ref[0],im:ref[1]}:ref;const tol=opts.tol!=null?opts.tol:1e-6*Math.max(1,Cx.abs(r));
  return {ok:Math.abs(z.re-r.re)<=tol&&Math.abs(z.im-r.im)<=tol};
}
/* order-free list of complex numbers: "1+i, 1-i" */
function checkComplexList(user,refs,opts={}){
  const s=cleanAns(user);const parts=splitTop(s);const zs=[];
  for(const p of parts){try{zs.push(evalComplex(p));}catch(e){return {ok:false,err:e.message};}}
  if(zs.length!==refs.length)return {ok:false,msg:`Expected ${refs.length} values.`};
  const left=refs.map(r=>Array.isArray(r)?{re:r[0],im:r[1]}:r);
  for(const z of zs){const tol=opts.tol!=null?opts.tol:1e-6;const k=left.findIndex(r=>Math.abs(z.re-r.re)<=tol*Math.max(1,Cx.abs(r))&&Math.abs(z.im-r.im)<=tol*Math.max(1,Cx.abs(r)));if(k<0)return {ok:false};left.splice(k,1);}
  return {ok:true};
}
/* TeX for a complex number from parts: texCx(3,-4) -> 3-4i ; texCx(0,1) -> i */
function texCx(re,im){
  const r=Math.abs(re)<1e-12?null:texNum(re);const m=Math.abs(im)<1e-12?null:im;
  if(r===null&&m===null)return '0';
  let s=r===null?'':r;
  if(m!==null){const a=Math.abs(m);const coef=near(a,1)?'':texNum(a);s+=(s===''?(m<0?'-':''):(m<0?'-':'+'))+coef+'i';}
  return s;
}

/* ============================================================ polar point (r, theta): r exact, theta modulo 2pi */
function checkPolar(user,ref,opts={}){
  const s=cleanAns(user);const parts=splitTop(stripBrackets(s));
  if(parts.length!==2)return {ok:false,err:'Write the point as (r, theta)'};
  let r,th;try{r=Expr.evalNumber(parts[0]);th=Expr.evalNumber(parts[1]);}catch(e){return {ok:false,err:e.message};}
  if(!near(r,ref[0],opts.rel||1e-6))return {ok:false};
  return checkAngle(String(th),ref[1],{tol:opts.tol||1e-4});
}

/* ============================================================ fractions and TeX formatting */
function fr(n,d){if(d<0){n=-n;d=-d;}const g=gcd(n,d)||1;return [n/g,d/g];}
const frAdd=(a,b)=>fr(a[0]*b[1]+b[0]*a[1],a[1]*b[1]);
const frMul=(a,b)=>fr(a[0]*b[0],a[1]*b[1]);
const frVal=a=>a[0]/a[1];
/* texFrac(n,d): simplified fraction with the sign out front: texFrac(-6,4) -> -\frac{3}{2}; integers plain */
function texFrac(n,d,{tf=false}={}){const [a,b]=fr(n,d);if(b===1)return String(a);const s=a<0?'-':'';return `${s}\\${tf?'t':''}frac{${Math.abs(a)}}{${b}}`;}
/* texCoef(c): '' for 1, '-' for -1, else the number (fractions as \tfrac). Use in front of a symbol. */
function texCoef(c){if(near(c,1))return '';if(near(c,-1))return '-';return texNum(c);}
/* texTerm(c, body, first): a signed term like ' - 3x^2' ; skips zero */
function texTerm(c,body,first=false){if(Math.abs(c)<1e-12)return '';const a=Math.abs(c);const co=near(a,1)&&body?'':texNum(a);const sign=first?(c<0?'-':''):(c<0?' - ':' + ');return sign+co+body;}
/* texPoly([a_n,...,a_0], 'x'): highest degree first */
function texPoly(coeffs,v='x'){let out='';const n=coeffs.length-1;coeffs.forEach((c,i)=>{const k=n-i;if(Math.abs(c)<1e-12)return;const body=k===0?'':k===1?v:`${v}^{${k}}`;out+=texTerm(c,body,out==='');});return out||'0';}
/* texInt(lo, hi, body, dv): definite (or indefinite when lo is null) integral */
function texInt(lo,hi,body,dv='x'){return (lo==null?'\\int':`\\int_{${lo}}^{${hi}}`)+' '+body+'\\,d'+dv;}
/* texSum(body, from='n=1', to='\infty') */
function texSum(body,from='n=1',to='\\infty'){return `\\sum_{${from}}^{${to}} ${body}`;}
/* texLn(arg): \ln|arg| */
const texLn=arg=>`\\ln\\left|${arg}\\right|`;
/* clean exact angle names for the unit circle */
const ANGLE_TEX={0:'0',30:'\\tfrac{\\pi}{6}',45:'\\tfrac{\\pi}{4}',60:'\\tfrac{\\pi}{3}',90:'\\tfrac{\\pi}{2}',120:'\\tfrac{2\\pi}{3}',135:'\\tfrac{3\\pi}{4}',150:'\\tfrac{5\\pi}{6}',180:'\\pi',210:'\\tfrac{7\\pi}{6}',225:'\\tfrac{5\\pi}{4}',240:'\\tfrac{4\\pi}{3}',270:'\\tfrac{3\\pi}{2}',300:'\\tfrac{5\\pi}{3}',315:'\\tfrac{7\\pi}{4}',330:'\\tfrac{11\\pi}{6}',360:'2\\pi'};
const ANGLE_STR={0:'0',30:'pi/6',45:'pi/4',60:'pi/3',90:'pi/2',120:'2pi/3',135:'3pi/4',150:'5pi/6',180:'pi',210:'7pi/6',225:'5pi/4',240:'4pi/3',270:'3pi/2',300:'5pi/3',315:'7pi/4',330:'11pi/6',360:'2pi'};
/* exact sin/cos of the special angles as [tex, value, plainString] */
const TRIG_EXACT={
  sin:{0:['0',0,'0'],30:['\\tfrac12',0.5,'1/2'],45:['\\tfrac{\\sqrt2}{2}',Math.SQRT2/2,'sqrt(2)/2'],60:['\\tfrac{\\sqrt3}{2}',Math.sqrt(3)/2,'sqrt(3)/2'],90:['1',1,'1']},
  cos:{0:['1',1,'1'],30:['\\tfrac{\\sqrt3}{2}',Math.sqrt(3)/2,'sqrt(3)/2'],45:['\\tfrac{\\sqrt2}{2}',Math.SQRT2/2,'sqrt(2)/2'],60:['\\tfrac12',0.5,'1/2'],90:['0',0,'0']},
};
/* sinExact(deg) / cosExact(deg) for any multiple of 30 or 45 degrees: returns [tex, value, plain] */
function sinExact(deg){deg=((deg%360)+360)%360;const ref=deg<=90?deg:deg<=180?180-deg:deg<=270?deg-180:360-deg;const [t,v,p]=TRIG_EXACT.sin[ref];const neg=deg>180&&deg<360&&v!==0;return neg?['-'+t,-v,'-'+p]:[t,v,p];}
function cosExact(deg){deg=((deg%360)+360)%360;const ref=deg<=90?deg:deg<=180?180-deg:deg<=270?deg-180:360-deg;const [t,v,p]=TRIG_EXACT.cos[ref];const neg=deg>90&&deg<270&&v!==0;return neg?['-'+t,-v,'-'+p]:[t,v,p];}

/* ============================================================ plotting helpers */
/* polar curve r(theta) on a Plot2D */
function polarCurve(p,rf,t0,t1,opts={}){return p.param(t=>{const r=rf(t);return [r*Math.cos(t),r*Math.sin(t)];},t0,t1,Object.assign({n:600},opts));}
/* polar grid: circles and spokes */
function polarGrid(p,{rmax=4,color='#eeece6'}={}){const ctx=p.ctx;ctx.strokeStyle=color;ctx.lineWidth=1;for(let r=1;r<=rmax;r++){ctx.beginPath();const [cx,cy]=p.px(0,0);ctx.ellipse(cx,cy,r*p.sx,r*p.sy,0,0,2*Math.PI);ctx.stroke();}
  for(let k=0;k<12;k++){const a=k*Math.PI/6;const [x0,y0]=p.px(0,0),[x1,y1]=p.px(rmax*Math.cos(a),rmax*Math.sin(a));ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();}return p;}
/* animator: requestAnimationFrame loop that stops itself when another section is shown.
   const anim=animator('ch2', dt=>{ t+=dt; draw(); }); anim.start(); anim.stop(); anim.toggle(); anim.running */
function animator(sectionId,step){
  let raf=null,last=0;const api={running:false,
    start(){if(api.running)return;api.running=true;last=performance.now();const loop=now=>{if(!api.running)return;const dt=Math.min(0.05,(now-last)/1000);last=now;step(dt);raf=requestAnimationFrame(loop);};raf=requestAnimationFrame(loop);},
    stop(){api.running=false;if(raf)cancelAnimationFrame(raf);raf=null;},
    toggle(){api.running?api.stop():api.start();}};
  if(typeof onShow==='function')onShow('*',id=>{if(id!==sectionId)api.stop();});
  return api;
}

/* ============================================================ flashcard link for module welcome pages
   memoryCard(modKey, [fact html, ...]) -> a .card element listing the facts this module expects you to know cold,
   with a button into the flashcards for this unit (math102/memory.html). */
function memoryCard(modKey,facts){
  const total=(window.MEM_CARDS||[]).filter(c=>c.mod===modKey).length;
  const c=el('div',{class:'card tint memcard'});
  c.innerHTML=`<h4>Know these cold</h4><p class="small muted">The facts below are pure recall. The drills assume them. Write each answer in your notebook, then flip the card.</p>
    <ul>${facts.map(f=>`<li>${f}</li>`).join('')}</ul>
    <div class="controls"><a class="btn primary" href="memory.html#mod=${modKey}">Flashcards for this unit${total?` (${total} cards)`:''}</a></div>`;
  return c;
}

if(typeof module!=='undefined')module.exports={checkLimit,checkExprInt,parseInterval,checkInterval,checkCondition,checkExprUpToFactor,checkPFForm,Cx,evalComplex,checkComplex,checkComplexList,texCx,checkPolar,fr,frAdd,frMul,texFrac,texCoef,texTerm,texPoly,texInt,texSum,texLn,sinExact,cosExact,ANGLE_TEX,ANGLE_STR};
