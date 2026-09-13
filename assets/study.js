/* Custom Study Modules: shared engine
   Load order in a module page:
     <link rel="stylesheet" href="assets/study.css">
     <script src="assets/study.js"></script>
     <script src="assets/mathjax-tex-svg.js"></script>
   Everything below is exposed as globals (no build step, works from file://). */

/* ============================================================ MathJax */
if(typeof window!=='undefined'){
  window.MathJax={tex:{inlineMath:[['\\(','\\)']],displayMath:[['\\[','\\]']],packages:{'[+]':['ams']}},svg:{fontCache:'global'},options:{enableMenu:false,renderActions:{addMenu:[]}},startup:{typeset:false}};
}
function typeset(el){
  if(typeof MathJax==='undefined'||!MathJax.startup)return Promise.resolve();
  return MathJax.startup.promise.then(()=>MathJax.typesetPromise([el||document.body])).catch(e=>console.warn('typeset',e));
}
/* TeX helpers: M('x^2') -> inline math html, D('...') -> display math html */
const M=s=>`<span class="tex">\\(${s}\\)</span>`;
const D=s=>`<div class="tex-d">\\[${s}\\]</div>`;

/* ============================================================ utilities */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const rint=(lo,hi)=>Math.floor(Math.random()*(hi-lo+1))+lo;
const rnz=(lo,hi)=>{let v;do{v=rint(lo,hi);}while(v===0);return v;};       /* random non-zero int */
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const near=(a,b,tol=1e-6)=>Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b));
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a;}
/* fmt: integers plain, simple fractions as a/b, otherwise 2 decimals */
function fmt(x){
  if(typeof x==='string')return x;
  if(!Number.isFinite(x))return String(x);
  if(Math.abs(x-Math.round(x))<1e-9)return String(Math.round(x));
  for(let d=2;d<=24;d++){const n=x*d;if(Math.abs(n-Math.round(n))<1e-9){const nn=Math.round(n);const g=gcd(nn,d);return (nn/g)+'/'+(d/g);}}
  return String(Math.round(x*100)/100);
}
const fmtDec=(x,p=2)=>{if(!Number.isFinite(x))return String(x);const v=Math.round(x*10**p)/10**p;return String(v===0?0:v);};
/* TeX fraction/number formatting */
function texNum(x){
  if(typeof x==='string')return x;
  if(!Number.isFinite(x))return String(x);
  if(Math.abs(x-Math.round(x))<1e-9)return String(Math.round(x));
  for(let d=2;d<=24;d++){const n=x*d;if(Math.abs(n-Math.round(n))<1e-9){const nn=Math.round(n);const g=gcd(nn,d);const s=nn<0?'-':'';return `${s}\\tfrac{${Math.abs(nn)/g}}{${d/g}}`;}}
  return String(Math.round(x*1000)/1000);
}
/* texSqrt(n): writes sqrt(n) simplified, e.g. 12 -> 2\sqrt{3}; n must be a non-negative integer */
function texSqrt(n){
  n=Math.round(n);if(n<0)return '\\text{undefined}';if(n===0)return '0';
  let a=1,b=n;for(let k=2;k*k<=b;k++){while(b%(k*k)===0){b/=k*k;a*=k;}}
  if(b===1)return String(a);return (a===1?'':a)+`\\sqrt{${b}}`;
}
/* fmtSqrt for plain text: 12 -> 2√3 */
function fmtSqrt(n){n=Math.round(n);if(n===0)return '0';let a=1,b=n;for(let k=2;k*k<=b;k++){while(b%(k*k)===0){b/=k*k;a*=k;}}if(b===1)return String(a);return (a===1?'':a)+'√'+b;}
/* coefficient formatting for building expressions like 3x - 2y + z */
function texLin(coeffs,vars,{constant=0}={}){
  let out='';
  coeffs.forEach((c,i)=>{if(c===0)return;const v=vars[i];const a=Math.abs(c);const body=(a===1?'':texNum(a))+v;
    out+=out===''?(c<0?'-':'')+body:(c<0?' - ':' + ')+body;});
  if(constant!==0||out===''){const a=Math.abs(constant);out+=out===''?texNum(constant):(constant<0?' - ':' + ')+texNum(a);}
  return out;
}
const sgn=(c,first=false)=>first?(c<0?'-':''):(c<0?' - ':' + ');
/* vectors */
const vadd=(a,b)=>a.map((x,i)=>x+b[i]);
const vsub=(a,b)=>a.map((x,i)=>x-b[i]);
const vscale=(k,a)=>a.map(x=>k*x);
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>Math.sqrt(dot(a,a));
const unit=a=>{const n=norm(a);return n?vscale(1/n,a):a.map(()=>0);};
const vzero=a=>a.every(x=>Math.abs(x)<1e-9);
const vparallel=(a,b)=>{if(a.length===2)return Math.abs(a[0]*b[1]-a[1]*b[0])<1e-6*(1+norm(a)*norm(b));return vzero(cross(a,b));};
const texVec=a=>`\\langle ${a.map(texNum).join(',\\,')} \\rangle`;
const texIJK=a=>{const n=['\\mathbf{i}','\\mathbf{j}','\\mathbf{k}'];let s='';a.forEach((c,i)=>{if(c===0)return;const m=Math.abs(c);s+=(s===''?(c<0?'-':''):(c<0?' - ':' + '))+(m===1?'':texNum(m))+n[i];});return s||'\\mathbf{0}';};
const texPt=a=>`(${a.map(texNum).join(',\\,')})`;

/* ============================================================ expression engine */
const Expr=(()=>{
  const FN_LIST=['arcsin','arccos','arctan','asin','acos','atan','sinh','cosh','tanh','sqrt','cbrt','sin','cos','tan','sec','csc','cot','ln','log','exp','abs'];
  const FN_CANON={asin:'arcsin',acos:'arccos',atan:'arctan'};
  const INV_OF={sin:'arcsin',cos:'arccos',tan:'arctan'};
  const MULTI_VARS=['theta','phi','rho','lambda','alpha','beta'];
  const GREEK={'θ':'theta','φ':'phi','ϕ':'phi','ρ':'rho','λ':'lambda','α':'alpha','β':'beta'};
  function tokenize(src){
    let s=normalizeInput(String(src)).replace(/[−–]/g,'-').replace(/[·×∙⋅]/g,'*').replace(/÷/g,'/').replace(/π/g,'pi').replace(/√/g,'sqrt').replace(/²/g,'^2').replace(/³/g,'^3').replace(/⁻¹/g,'^-1').replace(/\*\*/g,'^');
    s=s.replace(/[θφϕρλαβ]/g,ch=>' '+GREEK[ch]+' ');
    const toks=[];let i=0;
    while(i<s.length){
      const c=s[i];
      if(/\s/.test(c)){i++;continue;}
      if(/[0-9.]/.test(c)){let j=i;while(j<s.length&&/[0-9.]/.test(s[j]))j++;let str=s.slice(i,j);
        if((str.match(/\./g)||[]).length>1||str==='.')throw new Error('"'+str+'" is not a number');
        const sci=/^[eE][+-]?\d+(?![a-zA-Z0-9.^(])/.exec(s.slice(j));if(sci){str+=sci[0];j+=sci[0].length;}
        toks.push({t:'num',v:parseFloat(str)});i=j;continue;}
      if(/[a-zA-Z]/.test(c)){
        let m=null;for(const nm of FN_LIST){if(s.startsWith(nm,i)&&!/[a-zA-Z]/.test(s[i+nm.length]||'')||s.startsWith(nm,i)&&['sqrt','ln','log','exp','abs','sin','cos','tan','sec','csc','cot','sinh','cosh','tanh','arcsin','arccos','arctan','asin','acos','atan','cbrt'].includes(nm)&&!/[a-zA-Z]/.test(s[i+nm.length]||'')){m=nm;break;}}
        if(!m){for(const nm of FN_LIST){if(s.startsWith(nm,i)){m=nm;break;}}}
        if(m){i+=m.length;const tk={t:'fn',n:FN_CANON[m]||m};
          if(m==='log'&&s[i]==='_'){i++;if(s[i]==='{'){const j=s.indexOf('}',i);if(j<0)throw new Error('Missing } in log base');tk.base=parse(s.slice(i+1,j));i=j+1;}
            else if(/[0-9]/.test(s[i]||'')){let j=i;while(j<s.length&&/[0-9.]/.test(s[j]))j++;tk.base={t:'num',v:parseFloat(s.slice(i,j))};i=j;}
            else throw new Error('Missing log base after _');}
          toks.push(tk);continue;}
        if(s.startsWith('pi',i)&&!/[a-zA-Z]/.test(s[i+2]||'')){toks.push({t:'const',n:'pi'});i+=2;continue;}
        let mv=null;for(const nm of MULTI_VARS){if(s.startsWith(nm,i)){mv=nm;break;}}
        if(mv){toks.push({t:'var',n:mv});i+=mv.length;continue;}
        if(c==='e'&&!/[a-zA-Z]/.test(s[i+1]||'')||c==='e'&&/[\^\s\*\/\+\-\)]/.test(s[i+1]||'')){toks.push({t:'const',n:'e'});i++;continue;}
        if(c==='e'){toks.push({t:'const',n:'e'});i++;continue;}
        toks.push({t:'var',n:c});i++;continue;
      }
      if('+-*/^(),|!'.includes(c)){toks.push({t:'op',v:c});i++;continue;}
      if(c==='['||c==='{'){toks.push({t:'op',v:'('});i++;continue;}
      if(c===']'||c==='}'){toks.push({t:'op',v:')'});i++;continue;}
      throw new Error('Unexpected character "'+c+'"');
    }
    return toks;
  }
  function parse(src){
    if(src==null||String(src).trim()==='')throw new Error('Empty answer');
    const toks=tokenize(src);let p=0,absDepth=0;
    const peek=()=>toks[p];const next=()=>toks[p++];
    const isOp=v=>{const t=peek();return !!t&&t.t==='op'&&t.v===v;};
    function expect(v,msg){if(!isOp(v))throw new Error(msg);next();}
    function startsFactor(t){if(!t)return false;if(t.t==='num'||t.t==='var'||t.t==='const'||t.t==='fn')return true;if(t.t==='op'&&t.v==='(')return true;if(t.t==='op'&&t.v==='|'&&absDepth===0)return true;return false;}
    function expr(){let a=term();while(isOp('+')||isOp('-')){const op=next().v;const b=term();a=op==='+'?{t:'add',a,b}:{t:'sub',a,b};}return a;}
    function term(){let a=unary();for(;;){const t=peek();if(!t)break;
      if(t.t==='op'&&(t.v==='*'||t.v==='/')){next();const b=unary();a=t.v==='*'?{t:'mul',a,b}:{t:'div',a,b};}
      else if(startsFactor(t)){const b=power();a={t:'mul',a,b};}
      else break;}
      return a;}
    function unary(){if(isOp('-')){next();return {t:'neg',a:unary()};}if(isOp('+')){next();return unary();}return power();}
    function power(){let base=primary();while(isOp('!')){next();base={t:'fn',n:'fact',a:base};}if(isOp('^')){next();const e=unary();return {t:'pow',a:base,b:e};}return base;}
    function primary(){
      const t=next();if(!t)throw new Error('The expression ends too early');
      if(t.t==='num')return {t:'num',v:t.v};
      if(t.t==='var')return {t:'var',n:t.n};
      if(t.t==='const')return {t:'const',n:t.n};
      if(t.t==='op'&&t.v==='('){const e=expr();expect(')','Missing a closing parenthesis');return e;}
      if(t.t==='op'&&t.v==='|'){absDepth++;const e=expr();absDepth--;expect('|','Missing a closing |');return {t:'abs',a:e};}
      if(t.t==='fn')return fnApp(t);
      throw new Error('Unexpected "'+(t.v!==undefined?t.v:t.n)+'"');
    }
    function fnApp(t){
      let ex=null,inv=false;
      if(isOp('^')){next();ex=unary();if((ex.t==='neg'&&ex.a.t==='num'&&ex.a.v===1)||(ex.t==='num'&&ex.v===-1)){inv=true;ex=null;}}
      let arg;
      if(isOp('(')){next();arg=expr();expect(')','Missing a closing parenthesis');}
      else if(isOp('|')){next();absDepth++;const e=expr();absDepth--;expect('|','Missing a closing |');arg={t:'abs',a:e};}
      else arg=tight(t.n);
      let name=t.n;
      if(inv){if(INV_OF[name])name=INV_OF[name];else ex={t:'neg',a:{t:'num',v:1}};}
      let node={t:'fn',n:name,a:arg};if(t.base)node.base=t.base;
      if(ex)node={t:'pow',a:node,b:ex};
      return node;
    }
    function tight(fname){
      const t=peek();
      if(t&&t.t==='fn')return primary();
      if(!t||!(t.t==='num'||t.t==='var'||t.t==='const'))throw new Error(fname+' needs an argument, like '+fname+'(x)');
      let a=power();while(peek()&&(peek().t==='num'||peek().t==='var'||peek().t==='const'))a={t:'mul',a,b:power()};return a;
    }
    const ast=expr();
    if(p<toks.length){const t=toks[p];throw new Error('Unexpected "'+(t.v!==undefined?t.v:t.n||'')+'"');}
    return ast;
  }
  function ev(n,env){
    switch(n.t){
      case 'num':return n.v;
      case 'var':{const v=env[n.n];return v===undefined?NaN:v;}
      case 'const':return n.n==='pi'?Math.PI:Math.E;
      case 'add':return ev(n.a,env)+ev(n.b,env);
      case 'sub':return ev(n.a,env)-ev(n.b,env);
      case 'mul':return ev(n.a,env)*ev(n.b,env);
      case 'div':return ev(n.a,env)/ev(n.b,env);
      case 'neg':return -ev(n.a,env);
      case 'pow':{const a=ev(n.a,env),b=ev(n.b,env);if(a<0&&!Number.isInteger(b)){const k3=b*3;if(Math.abs(k3-Math.round(k3))<1e-9)return Math.pow(Math.cbrt(a),Math.round(k3));return NaN;}return Math.pow(a,b);}
      case 'abs':return Math.abs(ev(n.a,env));
      case 'fn':{const x=ev(n.a,env);switch(n.n){
        case 'sin':return Math.sin(x);case 'cos':return Math.cos(x);case 'tan':return Math.tan(x);
        case 'sec':return 1/Math.cos(x);case 'csc':return 1/Math.sin(x);case 'cot':return Math.cos(x)/Math.sin(x);
        case 'arcsin':return Math.asin(x);case 'arccos':return Math.acos(x);case 'arctan':return Math.atan(x);
        case 'sinh':return Math.sinh(x);case 'cosh':return Math.cosh(x);case 'tanh':return Math.tanh(x);
        case 'sqrt':return Math.sqrt(x);case 'cbrt':return Math.cbrt(x);case 'ln':return Math.log(x);
        case 'log':return n.base?Math.log(x)/Math.log(ev(n.base,env)):Math.log10(x);
        case 'exp':return Math.exp(x);case 'abs':return Math.abs(x);
        case 'fact':{if(x<0||Math.abs(x-Math.round(x))>1e-9||x>170)return NaN;let f=1;for(let k=2;k<=Math.round(x);k++)f*=k;return f;}}return NaN;}
    }
    return NaN;
  }
  function vars(n,set=new Set()){if(!n)return set;if(n.t==='var')set.add(n.n);['a','b','base'].forEach(k=>{if(n[k])vars(n[k],set);});return set;}
  /* compile: returns env => number, or throws with a friendly message */
  function compile(src){const ast=parse(src);return env=>ev(ast,env);}
  function evalNumber(src){const ast=parse(src);const v=ev(ast,{});if(!Number.isFinite(v))throw new Error('That does not evaluate to a number');return v;}
  return {tokenize,parse,ev,vars,compile,evalNumber};
})();

/* ============================================================ answer checkers
   All checkers return {ok:boolean, err?:string}. err is a parse/format problem to show the user. */
const DNE=/^\s*(dne|does not exist|none|undefined|no)\s*$/i;
function normalizeInput(s){
  s=String(s==null?'':s);if(!/\\/.test(s))return s;
  const grab=(str,i)=>{let d=0,j=i;for(;j<str.length;j++){if(str[j]==='{')d++;else if(str[j]==='}'){d--;if(d===0)break;}}return {body:str.slice(i+1,j),end:j+1};};
  const frac=str=>{let out='',i=0;while(i<str.length){const m=/^\\[td]?frac\s*\{/.exec(str.slice(i));if(m){const a=grab(str,i+m[0].length-1);const bi=str.indexOf('{',a.end);if(bi<0){out+=str.slice(i);break;}const b=grab(str,bi);out+='(('+frac(a.body)+')/('+frac(b.body)+'))';i=b.end;}else out+=str[i++];}return out;};
  s=frac(s);
  for(;;){const m=/\\sqrt\s*\[([^\]]*)\]\s*\{/.exec(s);if(!m)break;const b=grab(s,m.index+m[0].length-1);s=s.slice(0,m.index)+'(('+b.body+')^(1/('+m[1]+')))'+s.slice(b.end);}
  s=s.replace(/\\(left|right|,|;|!|quad|qquad| )/g,'').replace(/\\(cdot|times)/g,'*').replace(/\\div/g,'/')
     .replace(/\\operatorname\{([A-Za-z]+)\}/g,'$1')
     .replace(/\\(sqrt|sin|cos|tan|sec|csc|cot|ln|log|exp|arcsin|arccos|arctan|sinh|cosh|tanh)\b/g,'$1')
     .replace(/\\(pi|theta|phi|rho|lambda|alpha|beta)\b/g,'$1')
     .replace(/\\langle/g,'<').replace(/\\rangle/g,'>').replace(/\\lt\b/g,'<').replace(/\\gt\b/g,'>')
     .replace(/\\(?:mathbf|hat|vec|boldsymbol)\{([ijk])\}/g,'$1')
     .replace(/\\text\{([^}]*)\}/g,'$1')
     .replace(/\\/g,'');
  return s;
}
function cleanAns(s){return normalizeInput(s).trim().replace(/[−–]/g,'-');}
function splitTop(s,sep=','){const out=[];let depth=0,cur='';for(const ch of s){if('([{⟨<'.includes(ch))depth++;if(')]}⟩>'.includes(ch))depth--;if(ch===sep&&depth===0){out.push(cur);cur='';}else cur+=ch;}out.push(cur);return out.map(x=>x.trim()).filter(x=>x!=='');}
function stripBrackets(s){s=s.trim();if(!s)return s;const open='([{⟨<',close=')]}⟩>';const oi=open.indexOf(s[0]);if(oi<0)return s;
  /* only strip when the leading bracket closes at the very end */
  let depth=0;for(let i=0;i<s.length;i++){if(open.includes(s[i]))depth++;else if(close.includes(s[i])){depth--;if(depth===0&&i<s.length-1)return s;}}
  if(depth!==0||close.indexOf(s[s.length-1])!==oi)return s;return s.slice(1,-1).trim();}
/* numbers: accepts 3/4, sqrt(2)/2, pi/3, e^2, DNE (when ref is 'DNE') */
function checkNumber(user,ref,opts={}){
  const s=cleanAns(user);
  if(ref==='DNE'||ref===null)return {ok:DNE.test(s)};
  if(DNE.test(s))return {ok:false};
  let v;try{v=Expr.evalNumber(s);}catch(e){return {ok:false,err:e.message};}
  if(opts.tol!=null)return {ok:Math.abs(v-ref)<=opts.tol};
  return {ok:near(v,ref,opts.rel||1e-6)};
}
/* expressions in variables: ref is a function(env)->number or a string. opts.domain={x:[lo,hi],...}, opts.samples */
function checkExpr(user,ref,vars,opts={}){
  const s=cleanAns(user);
  if(ref==='DNE')return {ok:DNE.test(s)};
  let f;try{f=Expr.compile(s);}catch(e){return {ok:false,err:e.message};}
  const g=typeof ref==='string'?Expr.compile(ref):ref;
  const used=Expr.vars(Expr.parse(s));const allowed=new Set(vars.concat(opts.extraVars||[]));
  for(const v of used)if(!allowed.has(v))return {ok:false,err:`"${v}" should not appear in this answer`};
  return {ok:sampleEqual(f,g,vars,opts)};
}
function sampleEqual(f,g,vars,opts={}){
  const N=opts.samples||24;let valid=0,bad=0;
  for(let k=0;k<N*3&&valid<N;k++){
    const env={};vars.forEach(v=>{const d=(opts.domain&&opts.domain[v])||[-2.5,2.5];env[v]=d[0]+Math.random()*(d[1]-d[0]);});
    let r,u;try{r=g(env);u=f(env);}catch(e){continue;}
    if(!Number.isFinite(r)||Math.abs(r)>1e8)continue;
    valid++;
    if(!Number.isFinite(u)||!near(u,r,opts.rel||1e-6))bad++;
  }
  return valid>=Math.min(6,N)&&bad===0;
}
/* vectors: numeric components. Accepts <1,2,3>, ⟨1,2,3⟩, (1,2,3), [1,2,3], 1,2,3, i-2j+3k. opts.parallel: any nonzero multiple ok; opts.sameDir: positive multiple */
function parseVector(user,dim){
  const s=cleanAns(user);if(!s)return {err:'Empty answer'};
  if(/[ijk]/.test(s)&&!/,/.test(s)){
    let f;try{f=Expr.compile(s);}catch(e){return {err:e.message};}
    const b=[[1,0,0],[0,1,0],[0,0,1]].map(e=>f({i:e[0],j:e[1],k:e[2]}));
    const z=f({i:0,j:0,k:0}),sum=f({i:1,j:1,k:1});
    if(!b.every(Number.isFinite)||Math.abs(z)>1e-9||!near(sum,b[0]+b[1]+b[2]))return {err:'Write the vector as a combination of i, j, k, like 2i - j + 3k'};
    return {v:dim===2?b.slice(0,2):b};
  }
  const parts=splitTop(stripBrackets(s));
  if(dim&&parts.length!==dim)return {err:`Expected ${dim} components separated by commas`};
  const v=[];for(const p of parts){try{v.push(Expr.evalNumber(p));}catch(e){return {err:e.message};}}
  return {v};
}
function checkVector(user,ref,opts={}){
  const r=parseVector(user,ref.length);if(r.err)return {ok:false,err:r.err};
  const v=r.v;
  if(opts.parallel||opts.sameDir){if(vzero(v))return {ok:false};if(!vparallel(v,ref))return {ok:false};if(opts.sameDir&&dot(v,ref)<0)return {ok:false};return {ok:true};}
  return {ok:v.every((x,i)=>near(x,ref[i],opts.rel||1e-6))};
}
/* vector of expressions, e.g. r'(t) = <2t, cos(t), 1> or 2t i + cos(t) j + k. refFns: array of functions(env) or strings */
function checkExprVector(user,refFns,vars,opts={}){
  const s=cleanAns(user);if(!s)return {ok:false,err:'Empty answer'};
  const gs=refFns.map(r=>typeof r==='string'?Expr.compile(r):r);
  let fs;
  if(/[ijk]/.test(s)&&!/,/.test(s)){
    let f;try{f=Expr.compile(s);}catch(e){return {ok:false,err:e.message};}
    fs=[[1,0,0],[0,1,0],[0,0,1]].slice(0,refFns.length).map(e=>env=>f({...env,i:e[0],j:e[1],k:e[2]}));
    const z=f({i:0,j:0,k:0,...Object.fromEntries(vars.map(v=>[v,0.7]))});if(!near(z,0,1e-9))return {ok:false,err:'Write the vector as a combination of i, j, k'};
  }else{
    let parts=splitTop(stripBrackets(s)).map(p=>p.replace(/^[xyz]\s*(\(t\))?\s*=\s*/,''));
    if(parts.length!==refFns.length)return {ok:false,err:`Expected ${refFns.length} components separated by commas`};
    try{fs=parts.map(p=>Expr.compile(p));}catch(e){return {ok:false,err:e.message};}
  }
  for(let i=0;i<gs.length;i++)if(!sampleEqual(fs[i],gs[i],vars,opts))return {ok:false};
  return {ok:true};
}
/* equations like 3x - y + 2z = 5 or z = 2x + 3y - 1. ref(env) is zero exactly on the solution set. Any nonzero multiple accepted. */
function checkEquation(user,ref,vars,opts={}){
  const s=cleanAns(user);if(!s)return {ok:false,err:'Empty answer'};
  const sides=s.split('=');if(sides.length>2)return {ok:false,err:'Use a single = sign'};
  let L,R;try{L=Expr.compile(sides[0]);R=sides.length===2?Expr.compile(sides[1]):()=>0;}catch(e){return {ok:false,err:e.message};}
  const h=env=>L(env)-R(env);const g=typeof ref==='string'?Expr.compile(ref):ref;
  let ratio=null,valid=0;
  for(let k=0;k<80&&valid<16;k++){
    const env={};vars.forEach(v=>{const d=(opts.domain&&opts.domain[v])||[-3,3];env[v]=d[0]+Math.random()*(d[1]-d[0]);});
    const r=g(env),u=h(env);if(!Number.isFinite(r)||!Number.isFinite(u))continue;
    if(Math.abs(r)<1e-7){if(Math.abs(u)>1e-6)return {ok:false};continue;}
    valid++;const q=u/r;
    if(ratio===null){ratio=q;if(Math.abs(q)<1e-9)return {ok:false};}
    else if(!near(q,ratio,1e-6))return {ok:false};
  }
  return {ok:valid>=6&&ratio!==null};
}
/* parametric line in t: accepts <1+2t, 3-t, 4t>, (x,y,z)=(...), x=1+2t, y=..., z=... ; P point on line, d direction. Any parametrization of the same line is accepted. */
function checkLine(user,P,d){
  let s=cleanAns(user).replace(/^\(?\s*x\s*,\s*y\s*(,\s*z)?\s*\)?\s*=\s*/,'');
  const parts=splitTop(stripBrackets(s)).map(p=>p.replace(/^[xyz]\s*(\(t\))?\s*=\s*/,''));
  if(parts.length!==P.length)return {ok:false,err:`Expected ${P.length} component equations separated by commas`};
  let fs;try{fs=parts.map(p=>Expr.compile(p));}catch(e){return {ok:false,err:e.message};}
  const at=t=>fs.map(f=>f({t,s:t}));
  const A=at(0),B=at(1),C=at(2);
  if(![A,B,C].every(v=>v.every(Number.isFinite)))return {ok:false};
  const dir=vsub(B,A);if(vzero(dir))return {ok:false};
  if(!vparallel(dir,d))return {ok:false};
  if(!vsub(C,B).every((x,i)=>near(x,dir[i])))return {ok:false};
  const AP=vsub(A,P);if(!vzero(AP)&&!vparallel(AP,d))return {ok:false};
  return {ok:true};
}
/* expression equal up to an additive constant (potential functions, antiderivatives) */
function checkExprUpToConstant(user,ref,vars,opts={}){
  const s=cleanAns(user);if(!s)return {ok:false,err:'Empty answer'};
  let f;try{f=Expr.compile(s);}catch(e){return {ok:false,err:e.message};}
  const g=typeof ref==='string'?Expr.compile(ref):ref;
  const used=Expr.vars(Expr.parse(s));const allowed=new Set(vars.concat(opts.extraVars||['C','K']));
  for(const v of used)if(!allowed.has(v))return {ok:false,err:`"${v}" should not appear in this answer`};
  const base={};vars.forEach(v=>{const d=(opts.domain&&opts.domain[v])||[-2.5,2.5];base[v]=d[0]+0.37*(d[1]-d[0]);});base.C=0;base.K=0;
  const f0=f(base),g0=g(base);if(!Number.isFinite(f0)||!Number.isFinite(g0))return {ok:false};
  return {ok:sampleEqual(env=>f({...env,C:0,K:0})-f0,env=>g(env)-g0,vars,opts)};
}
/* angles equal modulo 2pi (polar, cylindrical, spherical theta). opts.mod overrides the period */
function checkAngle(user,ref,opts={}){
  const s=cleanAns(user);let v;try{v=Expr.evalNumber(s);}catch(e){return {ok:false,err:e.message};}
  const P=opts.mod||2*Math.PI;let d=((v-ref)%P+P)%P;if(d>P/2)d=P-d;return {ok:d<=(opts.tol||1e-4)};
}
/* list of numbers, order-free: "0, 5, -3". ref [] means DNE */
function checkNumberList(user,ref,opts={}){
  const s=cleanAns(user);
  if(ref.length===0)return {ok:DNE.test(s)};
  if(DNE.test(s))return {ok:false};
  const parts=splitTop(s);const vals=[];for(const p of parts){try{vals.push(Expr.evalNumber(p));}catch(e){return {ok:false,err:e.message};}}
  if(vals.length!==ref.length)return {ok:false};
  const left=ref.slice();for(const v of vals){const i=left.findIndex(r=>Math.abs(v-r)<=(opts.tol!=null?opts.tol:1e-6*Math.max(1,Math.abs(r))));if(i<0)return {ok:false};left.splice(i,1);}
  return {ok:true};
}
/* list of points, order-free: "(1,2), (3,-1)". ref [] means DNE */
function checkPointList(user,ref,opts={}){
  const s=cleanAns(user);
  if(ref.length===0)return {ok:DNE.test(s)};
  if(DNE.test(s))return {ok:false};
  /* top-level bracket groups, so coordinates like sqrt(3)/2 or (1/2) inside a point are kept whole */
  const groups=[];{const open='([⟨<',close=')]⟩>';let depth=0,start=-1;for(let i=0;i<s.length;i++){const ch=s[i];if(open.includes(ch)){if(depth===0)start=i;depth++;}else if(close.includes(ch)){depth--;if(depth===0&&start>=0){groups.push(s.slice(start,i+1));start=-1;}}}}
  if(!groups.length)groups.push(...(s.match(/[\(\[⟨<][^\)\]⟩>]*[\)\]⟩>]/g)||[]));
  if(!groups)return {ok:false,err:'Write points as (a, b) separated by commas'};
  const pts=[];for(const g of groups){const r=parseVector(g,ref[0].length);if(r.err)return {ok:false,err:r.err};pts.push(r.v);}
  if(pts.length!==ref.length)return {ok:false};
  const left=ref.slice();for(const p of pts){const i=left.findIndex(r=>r.every((x,k)=>Math.abs(p[k]-x)<=(opts.tol!=null?opts.tol:1e-6*Math.max(1,Math.abs(x)))));if(i<0)return {ok:false};left.splice(i,1);}
  return {ok:true};
}
/* apply a checker result to an input element */
function gradeInput(inp,res){
  inp.classList.remove('ok','bad');inp.classList.add(res.ok?'ok':'bad');
  if(inp._mqWrap){inp._mqWrap.classList.remove('ok','bad');inp._mqWrap.classList.add(res.ok?'ok':'bad');}
  let e=inp.parentElement.querySelector('.parse-err[data-for="'+(inp.dataset.k||'')+'"]');
  if(res.err){if(!e){e=document.createElement('div');e.className='parse-err';e.dataset.for=inp.dataset.k||'';inp.insertAdjacentElement('afterend',e);}e.textContent=res.err;}
  else if(e)e.remove();
  return res.ok;
}
/* gradeAll: [[inputEl,res],...] -> all ok */
function gradeAll(pairs){let ok=true;pairs.forEach(([i,r])=>{if(!gradeInput(i,r))ok=false;});return ok;}

/* ============================================================ TeX printer + live answer preview */
const GREEK_TEX={theta:'\\theta',phi:'\\phi',rho:'\\rho',lambda:'\\lambda',alpha:'\\alpha',beta:'\\beta'};
function toTex(n){
  const P={add:1,sub:1,mul:2,div:2,neg:3,pow:4};const prec=x=>P[x.t]||5;
  const wrap=(x,minp)=>prec(x)<minp?`\\left(${toTex(x)}\\right)`:toTex(x);
  switch(n.t){
    case 'num':return Number.isInteger(n.v)?String(n.v):String(Math.round(n.v*1e9)/1e9);
    case 'var':return GREEK_TEX[n.n]||n.n;
    case 'const':return n.n==='pi'?'\\pi':'e';
    case 'add':return n.b.t==='neg'?toTex(n.a)+'-'+wrap(n.b.a,2):toTex(n.a)+'+'+toTex(n.b);
    case 'sub':return toTex(n.a)+'-'+(n.b.t==='neg'?`\\left(${toTex(n.b)}\\right)`:wrap(n.b,2));
    case 'mul':{const a=wrap(n.a,2);const b=n.b.t==='neg'?`\\left(${toTex(n.b)}\\right)`:wrap(n.b,2);const dot=n.b.t==='num'||(n.a.t==='num'&&n.b.t==='num');return a+(dot?'\\cdot ':'\\,')+b;}
    case 'div':return `\\frac{${toTex(n.a)}}{${toTex(n.b)}}`;
    case 'neg':return '-'+(n.a.t==='div'||n.a.t==='fn'||n.a.t==='abs'?toTex(n.a):wrap(n.a,3));
    case 'pow':return `${wrap(n.a,5)}^{${toTex(n.b)}}`;
    case 'abs':return `\\left|${toTex(n.a)}\\right|`;
    case 'fn':{if(n.n==='fact')return `${wrap(n.a,5)}!`;if(n.n==='sqrt')return `\\sqrt{${toTex(n.a)}}`;if(n.n==='cbrt')return `\\sqrt[3]{${toTex(n.a)}}`;if(n.n==='abs')return `\\left|${toTex(n.a)}\\right|`;if(n.n==='exp')return `e^{${toTex(n.a)}}`;
      const name=n.n==='log'&&n.base?`\\log_{${toTex(n.base)}}`:'\\'+n.n;return `${name}\\left(${toTex(n.a)}\\right)`;}
  }
  return '';
}
/* previewTex: render a raw answer string (number, expression, vector, list, equation) as TeX; null if unreadable */
function previewTex(raw,depth=0){
  if(depth>4)return null;const s=cleanAns(raw);if(!s)return '';
  if(DNE.test(s))return '\\text{DNE}';
  try{return toTex(Expr.parse(s));}catch(e){}
  const eq=s.split('=');
  if(eq.length===2){const L=previewTex(eq[0],depth+1),R=previewTex(eq[1],depth+1);if(L===null||R===null)return null;return L+' = '+R;}
  const parts=splitTop(s);
  if(parts.length>1){const inner=parts.map(p=>previewTex(p,depth+1));if(inner.some(x=>x===null))return null;return inner.join(',\\ ');}
  const stripped=stripBrackets(s);
  if(stripped!==s){const o=s.trim()[0];const inner=previewTex(stripped,depth+1);if(inner===null)return null;return '<⟨'.includes(o)?`\\langle ${inner}\\rangle`:o==='['?`\\left[${inner}\\right]`:`\\left(${inner}\\right)`;}
  try{return toTex(Expr.parse(s));}catch(e){return null;}
}
function showPreview(inp){
  if(inp._mq)return;const k=inp.dataset.k||'';const host=inp.parentElement;if(!host)return;
  let el=[...host.querySelectorAll('.preview')].find(p=>p.dataset.for===k);
  const tex=previewTex(inp.value);
  if(!tex){if(el)el.remove();return;}
  if(!el){el=document.createElement('span');el.className='preview';el.dataset.for=k;el.title='How your answer is being read';const err=host.querySelector(`.parse-err[data-for="${k}"]`);(err||inp).insertAdjacentElement('afterend',el);}
  if(el.dataset.tex===tex)return;el.dataset.tex=tex;
  if(typeof MathJax!=='undefined'&&MathJax.typesetClear)MathJax.typesetClear([el]);
  el.innerHTML='\\('+tex+'\\)';clearTimeout(el._t);el._t=setTimeout(()=>typeset(el),90);
}
if(typeof document!=='undefined'){document.addEventListener('input',e=>{const t=e.target;if(t&&t.tagName==='INPUT'&&t.classList.contains('num'))showPreview(t);});}

/* ============================================================ calcPad-style math fields (MathQuill)
   Every <input class="num"> becomes a WYSIWYG math field. The original input is kept (hidden) and always
   holds the field's LaTeX, so checkers keep reading inp.value; cleanAns normalizes the LaTeX. */
let MQ=null;
const MQ_CONFIG={spaceBehavesLikeTab:false,restrictMismatchedBrackets:true,supSubsRequireOperand:true,charsThatBreakOutOfSupSub:'+-=<>,',autoSubscriptNumerals:false,
  autoCommands:'pi theta phi rho lambda sqrt',autoOperatorNames:'sin cos tan sec csc cot arcsin arccos arctan sinh cosh tanh ln log exp'};
function focusInput(f){if(f&&f._mq)f._mq.focus();else if(f)f.focus();}
function upgradeMathInputs(root){
  if(!MQ)return;
  (root||document).querySelectorAll('input.num').forEach(inp=>{
    if(inp._mq||inp.type==='hidden')return;
    const wrap=el('span',{class:'mqf'+(inp.classList.contains('wide')?' wide':'')+(inp.classList.contains('xwide')?' xwide':'')+' empty'});
    const field=el('span',{class:'mqfield'});wrap.appendChild(field);
    if(inp.placeholder)wrap.appendChild(el('span',{class:'mqph'},inp.placeholder));
    inp.insertAdjacentElement('beforebegin',wrap);inp.type='hidden';
    const initial=inp.value;
    const m=MQ.MathField(field,{...MQ_CONFIG,handlers:{
      edit(){wrap.classList.toggle('empty',!m.latex());inp.classList.remove('ok','bad');wrap.classList.remove('ok','bad');
        const host=inp.parentElement;const err=host&&host.querySelector(`.parse-err[data-for="${inp.dataset.k||''}"]`);if(err)err.remove();
        inp.dispatchEvent(new Event('input',{bubbles:true}));},
      enter(){inp.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));}}});
    /* .value reads and writes go through the math field, so existing code keeps working */
    Object.defineProperty(inp,'value',{configurable:true,get(){return m.latex();},set(v){m.latex(v==null?'':String(v));wrap.classList.toggle('empty',!m.latex());}});
    if(initial){m.latex(initial);wrap.classList.toggle('empty',!m.latex());}
    inp._mq=m;inp._mqWrap=wrap;wrap._inp=inp;
  });
}
function initMathFields(){
  if(typeof MathQuill==='undefined'||typeof jQuery==='undefined')return;
  MQ=MathQuill.getInterface(2);
  upgradeMathInputs(document);
  new MutationObserver(muts=>{for(const mu of muts)for(const n of mu.addedNodes){if(n.nodeType!==1)continue;if(n.matches&&n.matches('input.num'))upgradeMathInputs(n.parentElement);else if(n.querySelector&&n.querySelector('input.num'))upgradeMathInputs(n);}}).observe(document.body,{childList:true,subtree:true});
}


/* ============================================================ DOM helpers */
function el(tag,attrs={},html){const e=document.createElement(tag);for(const k in attrs){if(k==='class')e.className=attrs[k];else if(k==='dataset')Object.assign(e.dataset,attrs[k]);else e.setAttribute(k,attrs[k]);}if(html!=null)e.innerHTML=html;return e;}
function numInput(k,opts={}){const i=document.createElement('input');i.className='num'+(opts.wide?' wide':'')+(opts.xwide?' xwide':'');i.dataset.k=k;i.autocomplete='off';i.spellcheck=false;if(opts.placeholder)i.placeholder=opts.placeholder;return i;}
/* answer line: label html + input. returns wrapper */
function ansLine(labelHtml,k,opts={}){const w=el('div',{class:'ans'});const l=el('span',{},labelHtml);w.appendChild(l);w.appendChild(numInput(k,opts));if(opts.after)w.appendChild(el('span',{},opts.after));return w;}
function renderMat(Mx,o={}){
  const rows=Mx.length,cols=Mx[0].length;
  const e=document.createElement('div');e.className='mat'+(o.cls?' '+o.cls:'');
  e.style.gridTemplateColumns=`repeat(${cols},auto)`;
  Mx.forEach((row,i)=>row.forEach((v,j)=>{
    const c=document.createElement(o.editable?'input':'div');c.className='cell';c.dataset.i=i;c.dataset.j=j;
    if(o.editable){c.type='text';c.autocomplete='off';c.spellcheck=false;c.value=(v==null?'':v);}
    else c.innerHTML=(o.fmt||fmt)(v,i,j);
    if(o.hlRow===i)c.classList.add('hl-row');if(o.hlCol===j)c.classList.add('hl-col');
    if(o.hlCell&&o.hlCell[0]===i&&o.hlCell[1]===j)c.classList.add('hl-cell');
    if(o.cellClass){const k=o.cellClass(i,j);if(k)c.classList.add(...k.split(' '));}
    e.appendChild(c);
  }));
  if(o.label!==undefined||o.dims){const w=document.createElement('div');w.className='matwrap';w.appendChild(e);const l=document.createElement('div');l.className='matlabel';l.innerHTML=(o.label||'')+(o.dims?` <span class="tag">${rows}×${cols}</span>`:'');w.appendChild(l);return w;}
  return e;
}
function readMatInputs(container){const inputs=$$('input.cell',container);if(!inputs.length)return null;const cols=parseInt(inputs[0].closest('.mat').style.gridTemplateColumns.match(/\d+/)[0]);const rows=inputs.length/cols;const Mx=Array.from({length:rows},()=>Array(cols).fill(null));inputs.forEach((inp,k)=>{try{Mx[Math.floor(k/cols)][k%cols]=Expr.evalNumber(inp.value);}catch(e){Mx[Math.floor(k/cols)][k%cols]=null;}});return Mx;}
function gradeMat(container,expected){const inputs=$$('input.cell',container);const cols=parseInt(inputs[0].closest('.mat').style.gridTemplateColumns.match(/\d+/)[0]);let all=true,empty=0;inputs.forEach((inp,k)=>{const i=Math.floor(k/cols),j=k%cols;let v=null;try{v=Expr.evalNumber(inp.value);}catch(e){}inp.classList.remove('ok','bad');if(v===null){empty++;all=false;inp.classList.add('bad');return;}if(near(v,expected[i][j]))inp.classList.add('ok');else{inp.classList.add('bad');all=false;}});return {all,empty};}
function stepper(mount,val,lo,hi,onChange){
  const e=typeof mount==='string'?$(mount):mount;e.innerHTML='';e.classList.add('stepper');
  const dec=el('button',{type:'button'},'−'),span=el('span',{},String(val)),inc=el('button',{type:'button'},'+');
  e.append(dec,span,inc);
  const api={get value(){return val;},set(v,silent){val=clamp(v,lo,hi);span.textContent=val;if(!silent)onChange(val);}};
  dec.onclick=()=>api.set(val-1);inc.onclick=()=>api.set(val+1);return api;
}
function choiceButtons(mount,options,onPick){
  const wrap=el('div',{class:'choice'});let picked=null;
  options.forEach(o=>{const b=el('button',{class:'btn',type:'button'},o.label);b.onclick=()=>{picked=o.value;$$('.btn',wrap).forEach(x=>x.classList.remove('picked'));b.classList.add('picked');if(onPick)onPick(o.value);};wrap.appendChild(b);});
  mount.appendChild(wrap);typeset(wrap);return ()=>picked;
}
function opRow(parts){const r=el('div',{class:'row'});parts.forEach(p=>{if(typeof p==='string'){r.appendChild(el('span',{class:'op'},p));}else r.appendChild(p);});return r;}
/* slider with label + live value. returns {value, set, input} */
function sliderRow(mount,{label,min,max,step=0.1,value,fmt:f=fmtDec,onInput}){
  const lab=el('label');const b=el('b',{},`${label} = ${f(value)}`);const inp=el('input',{type:'range',min,max,step,value});
  lab.append(b,inp);mount.appendChild(lab);
  const api={get value(){return +inp.value;},set(v){inp.value=v;b.innerHTML=`${label} = ${f(+inp.value)}`;},input:inp};
  inp.addEventListener('input',()=>{b.innerHTML=`${label} = ${f(+inp.value)}`;onInput(+inp.value);});
  return api;
}

/* ============================================================ progress + module scaffolding */
const Progress={
  key:null,data:{},
  load(key){this.key='sm-progress-'+key;try{this.data=JSON.parse(localStorage.getItem(this.key)||'{}');}catch(e){this.data={};}},
  save(){try{localStorage.setItem(this.key,JSON.stringify(this.data));}catch(e){}},
};
let __sections=[],__onShow={};
function markDone(id){if(Progress.data[id])return;Progress.data[id]=true;Progress.save();renderNav();}
function renderNav(){
  const box=$('#navlinks');if(!box)return;box.innerHTML='';
  __sections.forEach((s,i)=>{const a=el('a',{href:'#'+s.dataset.id,class:(s.classList.contains('active')?'active':'')+(Progress.data[s.dataset.id]?' done':'')});a.innerHTML=`<span class="n">${Progress.data[s.dataset.id]?'✓':i}</span><span>${s.dataset.title}</span>`;box.appendChild(a);});
}
function show(id){
  let s=__sections.find(x=>x.dataset.id===id)||__sections[0];
  __sections.forEach(x=>x.classList.toggle('active',x===s));
  renderNav();window.scrollTo({top:0});
  if(__onShow[s.dataset.id])setTimeout(()=>__onShow[s.dataset.id].forEach(f=>f()),0);
  if(__onShow['*'])setTimeout(()=>__onShow['*'].forEach(f=>f(s.dataset.id)),0);
}
function onShow(id,fn){(__onShow[id]=__onShow[id]||[]).push(fn);}
/* initModule({key,title,sub}) : builds sidebar + pagers from <section data-id data-title> elements inside <main> */
function initModule({key,title,sub,hub='index.html'}){
  Progress.load(key);
  __sections=$$('main > section');
  try{localStorage.setItem('sm-sections-'+key,String(__sections.length));}catch(e){}
  const nav=$('#nav');
  nav.innerHTML=`<a class="hub" href="${hub}">◀ All modules</a><h1>${title}</h1><p class="sub">${sub||''}</p><div id="navlinks"></div><button class="reset" id="resetProgress">Reset progress</button>`;
  $('#resetProgress').onclick=()=>{Progress.data={};Progress.save();renderNav();};
  __sections.forEach((s,i)=>{const pg=el('div',{class:'pager'});const prev=__sections[i-1],next=__sections[i+1];
    pg.innerHTML=`<span>${prev?`<a class="btn" href="#${prev.dataset.id}">◀ ${prev.dataset.title}</a>`:''}</span><span>${next?`<a class="btn primary" href="#${next.dataset.id}">${next.dataset.title} ▶</a>`:''}</span>`;s.appendChild(pg);});
  window.addEventListener('hashchange',()=>show(location.hash.slice(1)));
  show(location.hash.slice(1)||__sections[0].dataset.id);
  typeset(document.body);
  document.title=title;
  initMathFields();
}

/* ============================================================ WebAssign problems (assets/webassign-data.js)
   Each entry: {id, hw, num, module (file basename like '04-partial-derivatives'), chapter (section id), status,
   prompt (html with TeX), parts:[{k,label,kind,ans,...}], solution (html)}.
   kinds: number{ans,tol} expr{ans,vars,domain} vector{ans,parallel,sameDir} exprVector{ans,vars} equation{ans,vars}
          line{P,d} numberList{ans,tol} pointList{ans,tol} angle{ans} constant{ans,vars} choice{options,ans} text{ans} */
const WA={
  currentModule(){const m=/([^\/]+)\.html?$/.exec(decodeURIComponent(location.pathname));return m?m[1]:'';},
  pool(module,chapter){return (window.WA_PROBLEMS||[]).filter(p=>p.module===module&&(!chapter||p.chapter===chapter));},
  type(module,chapter){
    const pool=WA.pool(module,chapter);if(!pool.length)return null;
    const t={name:'from WebAssign',_wa:true,
      gen(){return {p:pick(pool)};},
      render(q,e){const p=q.p;
        e.innerHTML=`<div class="wa-tag" title="Pulled from your WebAssign course"><span class="wa-dot"></span>From ${p.source||'WebAssign'}${p.hw?' · '+p.hw:''} · Problem ${p.num}</div><div class="prompt">${p.prompt}</div>`;
        p.parts.forEach(part=>{
          if(part.kind==='choice'){if(part.label)e.appendChild(el('div',{class:'wa-partlabel'},part.label));q['get_'+part.k]=choiceButtons(e,part.options.map((o,i)=>({label:o,value:i})));}
          else{const wide=['expr','vector','exprVector','equation','line','numberList','pointList','constant'].includes(part.kind);e.appendChild(ansLine(part.label||'',part.k,{wide:wide&&!part.xwide,xwide:!!part.xwide,placeholder:part.placeholder,after:part.after}));}
        });},
      check(q,e){let ok=true,err,wrong=[];
        for(const part of q.p.parts){
          if(part.kind==='choice'){const v=q['get_'+part.k]();if(v===null)return {ok:false,msg:'Pick an option for every part.'};if(v!==part.ans){ok=false;wrong.push(part.label||'the choice');}continue;}
          const inp=e.querySelector(`[data-k="${part.k}"]`);const v=inp?inp.value:'';let r;
          switch(part.kind){
            case 'number':r=checkNumber(v,part.ans,part.tol!=null?{tol:part.tol}:{});break;
            case 'expr':r=checkExpr(v,part.ans,part.vars||['x','y'],{domain:part.domain});break;
            case 'vector':r=checkVector(v,part.ans,{parallel:!!part.parallel,sameDir:!!part.sameDir});break;
            case 'exprVector':r=checkExprVector(v,part.ans,part.vars||['t'],{domain:part.domain});break;
            case 'equation':r=checkEquation(v,part.ans,part.vars||['x','y','z']);break;
            case 'line':r=checkLine(v,part.P,part.d);break;
            case 'numberList':r=checkNumberList(v,part.ans,part.tol!=null?{tol:part.tol}:{});break;
            case 'pointList':r=checkPointList(v,part.ans,part.tol!=null?{tol:part.tol}:{});break;
            case 'angle':r=checkAngle(v,part.ans);break;
            case 'constant':r=checkExprUpToConstant(v,part.ans,part.vars||['x','y'],{domain:part.domain});break;
            case 'text':r={ok:cleanAns(v).replace(/\s+/g,'').toLowerCase()===String(part.ans).replace(/\s+/g,'').toLowerCase()};break;
            default:r={ok:false,err:'unknown part kind '+part.kind};
          }
          if(inp)gradeInput(inp,r);if(!r.ok){ok=false;if(r.err&&!err)err=r.err;}
        }
        return {ok,err,msg:ok?'':(wrong.length?`Not quite: check ${wrong.join(', ')}.`:'Not quite. Fix the marked answers and check again.')};},
      solution(q){return q.p.solution||'Worked solution not available for this problem yet.';},
    };
    return t;
  },
  /* harness support: correct inputs for a generated WA question */
  solve(q){const out={};let ci=0;q.p.parts.forEach(part=>{const a=part.ans;switch(part.kind){
      case 'number':case 'angle':out[part.k]=String(a);break;
      case 'expr':case 'constant':out[part.k]=typeof a==='string'?a:'';break;
      case 'vector':out[part.k]='<'+a.join(',')+'>';break;
      case 'exprVector':out[part.k]='<'+a.join(',')+'>';break;
      case 'equation':out[part.k]=part.eq||(a+'=0');break;
      case 'line':out[part.k]='<'+part.P.map((x,i)=>x+'+('+part.d[i]+')t').join(',')+'>';break;
      case 'numberList':out[part.k]=a.length?a.join(', '):'DNE';break;
      case 'pointList':out[part.k]=a.length?a.map(p=>'('+p.join(',')+')').join(', '):'DNE';break;
      case 'text':out[part.k]=String(a);break;
      case 'choice':out['_btn'+(ci?ci:'')]=a;ci++;break;}});return out;},
};
if(typeof window!=='undefined'){window.addEventListener('DOMContentLoaded',()=>{window.__solvers=window.__solvers||{};window.__solvers['from WebAssign']=q=>WA.solve(q);});}

/* ============================================================ drills */
class Drill{
  constructor(o){this.o=o;this.mount=typeof o.mount==='string'?$(o.mount):o.mount;this.goal=o.goal||5;this.correct=0;this.streak=0;this.build();this.next();(window.__drills=window.__drills||[]).push(this);}
  build(){
    this.mount.innerHTML=`<div class="drill"><div class="q"></div><div class="fb"></div>
      <div class="drill-bar"><button class="btn primary check">Check</button>${this.o.hint?'<button class="btn hintbtn">Hint</button>':''}
      <button class="btn show">Show answer</button><button class="btn next">New question</button>
      <span class="score"><span>Correct <b class="c">0</b></span><span>Streak <b class="s">0</b></span><span class="goalwrap">Goal <span class="goalbar"><i></i></span></span></span></div></div>`;
    this.qEl=$('.q',this.mount);this.fb=$('.fb',this.mount);
    $('.check',this.mount).onclick=()=>this.check();$('.show',this.mount).onclick=()=>this.show();$('.next',this.mount).onclick=()=>this.next();
    if(this.o.hint)$('.hintbtn',this.mount).onclick=()=>{if(this.cur&&this.cur._wa)return;this.o.hint(this.q,this.qEl,this);typeset(this.qEl);};
    this.mount.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'){e.preventDefault();if(this.done)this.next();else this.check();}});
    this.updateScore();
  }
  next(){
    const waT=this.o.section?WA.type(WA.currentModule(),this.o.section):null;
    this.cur=(waT&&Math.random()<0.35)?waT:this.o;
    this.q=this.cur.gen();if(this.cur._wa)this.q.type=this.cur;this.q.tried=false;this.done=false;this.qEl.innerHTML='';
    this.cur.render(this.q,this.qEl,this);this.fb.className='fb';this.fb.innerHTML='';
    const hb=$('.hintbtn',this.mount);if(hb)hb.style.display=this.cur._wa?'none':'';
    typeset(this.qEl);upgradeMathInputs(this.qEl);
    const f=$('input',this.qEl);if(f&&this.mount.closest('section')&&this.mount.closest('section').classList.contains('active'))focusInput(f);
  }
  check(){
    if(this.done)return;
    const r=(this.cur||this.o).check(this.q,this.qEl);
    if(r.ok){if(!this.q.tried){this.correct++;this.streak++;}this.done=true;this.fb.className='fb good';this.fb.innerHTML=pick(['Correct.','Yes.','Right.','Nice.','Exactly.'])+(r.msg?' '+r.msg:'');if(this.correct>=this.goal&&this.o.section)markDone(this.o.section);}
    else{if(!this.q.tried)this.streak=0;this.fb.className='fb bad';this.fb.innerHTML=r.err?('Could not read your answer: '+r.err):(r.msg||'Not quite. Fix the marked answers and check again.');}
    this.q.tried=true;this.updateScore();typeset(this.fb);
  }
  show(){if(!this.q.tried)this.streak=0;this.q.tried=true;this.done=true;this.fb.className='fb';this.fb.innerHTML='<div class="sol">'+(this.cur||this.o).solution(this.q,this.qEl)+'</div>';this.updateScore();typeset(this.fb);}
  updateScore(){$('.c',this.mount).textContent=this.correct;$('.s',this.mount).textContent=this.streak;$('.goalbar i',this.mount).style.width=Math.min(100,100*this.correct/this.goal)+'%';$('.goalwrap',this.mount).title=`${Math.min(this.correct,this.goal)} of ${this.goal} needed to complete this chapter`;}
}
/* combine several question types into one drill. Each type: {gen, render(q,el), check(q,el)->{ok,msg?,err?}, solution(q,el)->html, hint?(q,el)} */
function mixDrill(types){const o={gen(){const t=pick(types);const q=t.gen();q.type=t;return q;},render(q,e,d){q.type.render(q,e,d);},check(q,e){return q.type.check(q,e);},solution(q,e){return q.type.solution(q,e);}};if(types.some(t=>t.hint))o.hint=(q,e,d)=>{if(q.type.hint)q.type.hint(q,e,d);};return o;}
/* quiz: n questions drawn from types (each type used before repeats), pass threshold marks section done */
function makeQuiz(mount,{n=10,types,pass=8,section='quiz',labels={}}){
  const box=typeof mount==='string'?$(mount):mount;let qs,idx,score,log;
  function start(){qs=[];const waT=WA.type(WA.currentModule(),null);const pool=types.slice();if(waT){pool.push(waT,waT,waT);}while(qs.length<n){const t=pool.length?pool.splice(Math.floor(Math.random()*pool.length),1)[0]:pick(types);const q=t.gen();q.type=t;qs.push(q);}idx=0;score=0;log=[];ask();}
  function ask(){
    const q=qs[idx];
    box.innerHTML=`<div class="quiz-head"><span>Question ${idx+1} of ${n}</span><span>Score ${score}</span></div><div class="qbar"><i style="width:${100*idx/n}%"></i></div>
      <div class="drill"><div class="q"></div><div class="fb"></div><div class="drill-bar"><button class="btn primary check">Check</button><button class="btn next" style="display:none">Next ▶</button></div></div>`;
    const qEl=$('.q',box),fb=$('.fb',box);q.type.render(q,qEl);typeset(qEl);upgradeMathInputs(qEl);
    let answered=false;
    const check=()=>{if(answered)return;const r=q.type.check(q,qEl);
      if(!r.ok&&(r.err||(r.msg&&/pick|click|choose/i.test(r.msg)))&&!q.tried){fb.className='fb bad';fb.textContent=r.err?('Could not read your answer: '+r.err):r.msg;return;}
      answered=true;if(r.ok)score++;log.push({q,ok:r.ok});
      fb.className='fb '+(r.ok?'good':'bad');fb.innerHTML=(r.ok?'Correct. ':'Incorrect. ')+'<div class="sol">'+q.type.solution(q,qEl)+'</div>';typeset(fb);
      $('.check',box).style.display='none';$('.next',box).style.display='';$('.next',box).focus();$('.quiz-head span:last-child',box).textContent='Score '+score;};
    $('.check',box).onclick=check;$('.next',box).onclick=()=>{idx++;if(idx<n)ask();else finish();};
    box.onkeydown=e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'){e.preventDefault();if(answered)$('.next',box).click();else check();}};
    const f=$('input',qEl);if(f)focusInput(f);
  }
  function finish(){
    const ok=score>=pass;if(ok)markDone(section);
    box.innerHTML=`<div class="result">${score} / ${n}</div><p>${ok?'You have this material. Nicely done.':score>=pass-2?'Close. Review the chapters for the questions you missed, then try again.':'Keep drilling. The practice boxes never run out of problems.'}</p>
      <ul class="review">${log.map((l,i)=>`<li>${l.ok?'✅':'❌'} Q${i+1}: ${l.q.type.name||'question'}</li>`).join('')}</ul><button class="btn primary" id="quizAgain">Take it again</button>`;
    $('#quizAgain').onclick=start;box.onkeydown=null;
  }
  start();
}

/* ============================================================ 2D plotting */
class Plot2D{
  constructor(canvas,o={}){
    this.c=typeof canvas==='string'?$(canvas):canvas;this.ctx=this.c.getContext('2d');
    this.o=Object.assign({xmin:-4,xmax:4,ymin:-4,ymax:4,grid:true,axes:true,labels:true},o);
    this.handlers={};this._wire();
  }
  _wire(){
    const c=this.c;let drag=false;
    c.addEventListener('pointerdown',e=>{drag=true;c.setPointerCapture(e.pointerId);const w=this.toWorld(e);if(this.handlers.down)this.handlers.down(w,e);});
    c.addEventListener('pointermove',e=>{const w=this.toWorld(e);if(drag&&this.handlers.drag)this.handlers.drag(w,e);if(this.handlers.move)this.handlers.move(w,e);});
    c.addEventListener('pointerup',e=>{drag=false;if(this.handlers.up)this.handlers.up(this.toWorld(e),e);});
    c.addEventListener('pointerleave',()=>{if(this.handlers.leave)this.handlers.leave();});
  }
  on(evt,fn){this.handlers[evt]=fn;return this;}
  begin(){
    const c=this.c,dpr=window.devicePixelRatio||1;const W=c.clientWidth||400,H=c.clientHeight||W;
    if(c.width!==Math.round(W*dpr)||c.height!==Math.round(H*dpr)){c.width=Math.round(W*dpr);c.height=Math.round(H*dpr);}
    this.W=W;this.H=H;const ctx=this.ctx;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    const o=this.o;this.sx=W/(o.xmax-o.xmin);this.sy=H/(o.ymax-o.ymin);
    if(o.grid)this.grid();if(o.axes)this.axes();return this;
  }
  px(x,y){return [(x-this.o.xmin)*this.sx,this.H-(y-this.o.ymin)*this.sy];}
  toWorld(e){const r=this.c.getBoundingClientRect();const x=this.o.xmin+(e.clientX-r.left)/r.width*(this.o.xmax-this.o.xmin);const y=this.o.ymax-(e.clientY-r.top)/r.height*(this.o.ymax-this.o.ymin);return [x,y];}
  grid(step=1,color='#eeece6'){const ctx=this.ctx,o=this.o;ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();
    for(let x=Math.ceil(o.xmin/step)*step;x<=o.xmax;x+=step){const [px]=this.px(x,0);ctx.moveTo(px,0);ctx.lineTo(px,this.H);}
    for(let y=Math.ceil(o.ymin/step)*step;y<=o.ymax;y+=step){const [,py]=this.px(0,y);ctx.moveTo(0,py);ctx.lineTo(this.W,py);}ctx.stroke();return this;}
  axes(color='#b9b5ab'){const ctx=this.ctx,o=this.o;ctx.strokeStyle=color;ctx.lineWidth=1.4;ctx.beginPath();const [x0,y0]=this.px(0,0);
    if(o.ymin<=0&&o.ymax>=0){ctx.moveTo(0,y0);ctx.lineTo(this.W,y0);}if(o.xmin<=0&&o.xmax>=0){ctx.moveTo(x0,0);ctx.lineTo(x0,this.H);}ctx.stroke();
    if(o.labels){ctx.fillStyle='#8b877e';ctx.font='12px -apple-system,Segoe UI,sans-serif';for(let x=Math.ceil(o.xmin);x<=o.xmax;x++){if(x===0)continue;const [px,py]=this.px(x,0);ctx.fillText(x,px-4,clamp(py+14,12,this.H-4));}for(let y=Math.ceil(o.ymin);y<=o.ymax;y++){if(y===0)continue;const [px,py]=this.px(0,y);ctx.fillText(y,clamp(px+5,2,this.W-14),py+4);}}
    return this;}
  fn(f,{color='#3b5bdb',width=2.2,xmin,xmax,dash}={}){const ctx=this.ctx,o=this.o;const a=xmin==null?o.xmin:xmin,b=xmax==null?o.xmax:xmax;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash||[]);ctx.beginPath();let pen=false;
    for(let i=0;i<=400;i++){const x=a+(b-a)*i/400;const y=f(x);if(!Number.isFinite(y)||Math.abs(y)>1e4){pen=false;continue;}const [px,py]=this.px(x,y);if(pen)ctx.lineTo(px,py);else ctx.moveTo(px,py);pen=true;}ctx.stroke();ctx.setLineDash([]);return this;}
  param(r,t0,t1,{color='#3b5bdb',width=2.2,n=300,dash,arrow=false}={}){const ctx=this.ctx;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash||[]);ctx.beginPath();let last=null;
    for(let i=0;i<=n;i++){const t=t0+(t1-t0)*i/n;const p=r(t);if(!p.every(Number.isFinite)){last=null;continue;}const q=this.px(p[0],p[1]);if(last)ctx.lineTo(q[0],q[1]);else ctx.moveTo(q[0],q[1]);last=q;}ctx.stroke();ctx.setLineDash([]);
    if(arrow){const tm=t0+(t1-t0)*0.55,eps=(t1-t0)*1e-3;const a=r(tm-eps),b=r(tm+eps);this._head(...this.px(a[0],a[1]),...this.px(b[0],b[1]),color);}return this;}
  _head(x0,y0,x1,y1,color,L=10){const ctx=this.ctx;const ang=Math.atan2(y1-y0,x1-x0);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x1-L*Math.cos(ang-.45),y1-L*Math.sin(ang-.45));ctx.lineTo(x1-L*Math.cos(ang+.45),y1-L*Math.sin(ang+.45));ctx.closePath();ctx.fill();}
  vector(from,to,{color='#d97706',width=2.6,label,dash,labelOffset=[8,-6]}={}){const ctx=this.ctx;const [x0,y0]=this.px(from[0],from[1]),[x1,y1]=this.px(to[0],to[1]);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash||[]);ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.setLineDash([]);
    if(Math.hypot(x1-x0,y1-y0)>3)this._head(x0,y0,x1,y1,color);if(label){ctx.fillStyle=color;ctx.font='600 13px -apple-system,Segoe UI,sans-serif';ctx.fillText(label,x1+labelOffset[0],y1+labelOffset[1]);}return this;}
  point(p,{color='#1c1b1a',r=5,label,labelOffset=[8,-8],ring=false}={}){const ctx=this.ctx;const [x,y]=this.px(p[0],p[1]);ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();if(ring){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,y,r*0.45,0,7);ctx.fill();}
    if(label){ctx.fillStyle=color;ctx.font='600 13px -apple-system,Segoe UI,sans-serif';ctx.fillText(label,x+labelOffset[0],y+labelOffset[1]);}return this;}
  poly(pts,{fill='rgba(59,91,219,.12)',stroke='#3b5bdb',width=1.5,close=true}={}){const ctx=this.ctx;ctx.beginPath();pts.forEach((p,i)=>{const q=this.px(p[0],p[1]);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});if(close)ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}return this;}
  /* shade region between curves: x in [a,b], y from lo(x) to hi(x) */
  region(a,b,lo,hi,{fill='rgba(59,91,219,.14)',stroke='#3b5bdb',n=120}={}){const pts=[];for(let i=0;i<=n;i++){const x=a+(b-a)*i/n;pts.push([x,lo(x)]);}for(let i=n;i>=0;i--){const x=a+(b-a)*i/n;pts.push([x,hi(x)]);}return this.poly(pts,{fill,stroke,width:1});}
  text(p,str,{color='#57534e',font='13px -apple-system,Segoe UI,sans-serif',align='left',dx=0,dy=0}={}){const ctx=this.ctx;const [x,y]=this.px(p[0],p[1]);ctx.fillStyle=color;ctx.font=font;ctx.textAlign=align;ctx.fillText(str,x+dx,y+dy);ctx.textAlign='left';return this;}
  /* contour lines of f(x,y) at given levels (marching squares) */
  contour(f,levels,{color='#3b5bdb',width=1.4,n=90,labels=true,colors}={}){const ctx=this.ctx,o=this.o;const xs=[],ys=[];for(let i=0;i<=n;i++){xs.push(o.xmin+(o.xmax-o.xmin)*i/n);ys.push(o.ymin+(o.ymax-o.ymin)*i/n);}
    const g=ys.map(y=>xs.map(x=>f(x,y)));
    levels.forEach((lv,li)=>{ctx.strokeStyle=colors?colors[li%colors.length]:color;ctx.lineWidth=width;ctx.beginPath();let labelPt=null;
      for(let j=0;j<n;j++)for(let i=0;i<n;i++){const v=[g[j][i],g[j][i+1],g[j+1][i+1],g[j+1][i]];if(!v.every(Number.isFinite))continue;
        const c=[[xs[i],ys[j]],[xs[i+1],ys[j]],[xs[i+1],ys[j+1]],[xs[i],ys[j+1]]];const pts=[];
        for(let k=0;k<4;k++){const a=v[k],b=v[(k+1)%4];if((a<lv)!==(b<lv)){const t=(lv-a)/(b-a);const p=c[k],q=c[(k+1)%4];pts.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}}
        if(pts.length>=2){const p=this.px(...pts[0]),q=this.px(...pts[1]);ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);if(pts.length===4){const r=this.px(...pts[2]),s=this.px(...pts[3]);ctx.moveTo(r[0],r[1]);ctx.lineTo(s[0],s[1]);}if(!labelPt&&j%7===3&&i%9===4)labelPt=pts[0];}}
      ctx.stroke();
      if(labels&&labelPt){const [x,y]=this.px(...labelPt);ctx.fillStyle='#fff';ctx.fillRect(x-3,y-11,String(fmtDec(lv)).length*7+6,14);ctx.fillStyle=colors?colors[li%colors.length]:color;ctx.font='11px -apple-system,Segoe UI,sans-serif';ctx.fillText(fmtDec(lv),x,y);}});
    return this;}
  /* heatmap of f over the window (cheap fill, for sign or magnitude maps) */
  heat(f,{n=60,colorFn}={}){const ctx=this.ctx,o=this.o;const dx=(o.xmax-o.xmin)/n,dy=(o.ymax-o.ymin)/n;for(let j=0;j<n;j++)for(let i=0;i<n;i++){const x=o.xmin+(i+.5)*dx,y=o.ymin+(j+.5)*dy;const v=f(x,y);if(!Number.isFinite(v))continue;ctx.fillStyle=colorFn(v);const [px,py]=this.px(o.xmin+i*dx,o.ymin+(j+1)*dy);ctx.fillRect(px,py,dx*this.sx+0.5,dy*this.sy+0.5);}return this;}
  /* vector field F(x,y)->[P,Q], arrows on a grid */
  field(F,{step=1,color='#6b6862',scale=0.35,normalize=false,width=1.4}={}){const o=this.o;for(let x=Math.ceil(o.xmin/step)*step;x<=o.xmax;x+=step)for(let y=Math.ceil(o.ymin/step)*step;y<=o.ymax;y+=step){let v=F(x,y);if(!v.every(Number.isFinite))continue;const n=norm(v);if(n<1e-9)continue;if(normalize)v=vscale(scale/n,v);else v=vscale(scale,v);this.vector([x,y],[x+v[0],y+v[1]],{color,width});}return this;}
}

/* ============================================================ 3D scene (orbit with drag, wheel to zoom) */
class Scene3D{
  constructor(canvas,o={}){
    this.c=typeof canvas==='string'?$(canvas):canvas;this.ctx=this.c.getContext('2d');
    this.o=Object.assign({range:3,azim:-55,elev:24,zoom:1,axes:true,grid:true,labels:['x','y','z']},o);
    this.items=[];this._wire();
  }
  _wire(){
    const c=this.c;let drag=null;
    c.addEventListener('pointerdown',e=>{if(this.o.lock)return;drag=[e.clientX,e.clientY,this.o.azim,this.o.elev];c.setPointerCapture(e.pointerId);});
    c.addEventListener('pointermove',e=>{if(!drag)return;this.o.azim=drag[2]+(e.clientX-drag[0])*0.5;this.o.elev=clamp(drag[3]+(e.clientY-drag[1])*0.5,-89,89);this.render();});
    c.addEventListener('pointerup',()=>drag=null);
    c.addEventListener('wheel',e=>{if(this.o.lock)return;e.preventDefault();this.o.zoom=clamp(this.o.zoom*(e.deltaY>0?0.92:1.08),0.3,4);this.render();},{passive:false});
  }
  clear(){this.items=[];return this;}
  add(item){this.items.push(item);return this;}
  vector(from,to,opts={}){return this.add({type:'vector',from,to,...opts});}
  point(p,opts={}){return this.add({type:'point',p,...opts});}
  polyline(pts,opts={}){return this.add({type:'polyline',pts,...opts});}
  curve(r,t0,t1,opts={}){const n=opts.n||200;const pts=[];for(let i=0;i<=n;i++)pts.push(r(t0+(t1-t0)*i/n));return this.polyline(pts,opts);}
  polygon(pts,opts={}){return this.add({type:'polygon',pts,...opts});}
  text(p,str,opts={}){return this.add({type:'text',p,str,...opts});}
  /* surface z=f(x,y) over [x0,x1]x[y0,y1] */
  surface(f,[x0,x1],[y0,y1],opts={}){const n=opts.n||24;const r=(u,v)=>[u,v,f(u,v)];return this.param(r,[x0,x1],[y0,y1],opts);}
  /* parametric surface r(u,v) */
  param(r,[u0,u1],[v0,v1],opts={}){const n=opts.n||24,m=opts.m||n;const grid=[];for(let i=0;i<=n;i++){const row=[];for(let j=0;j<=m;j++){row.push(r(u0+(u1-u0)*i/n,v0+(v1-v0)*j/m));}grid.push(row);}return this.add({type:'surface',grid,...opts});}
  /* plane through point p with normal nrm, drawn as a square of half-size s */
  plane(p,nrm,opts={}){const s=opts.size||1.6;const n=unit(nrm);let a=Math.abs(n[0])<0.9?[1,0,0]:[0,1,0];const u=unit(cross(n,a)),v=cross(n,u);const pts=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([i,j])=>vadd(p,vadd(vscale(i*s,u),vscale(j*s,v))));return this.polygon(pts,{fill:opts.fill||'rgba(59,91,219,.16)',stroke:opts.stroke||'#3b5bdb',...opts});}
  /* projection */
  proj(p){const o=this.o;const az=o.azim*Math.PI/180,elv=o.elev*Math.PI/180;
    const x=p[0],y=p[1],z=p[2];
    const x1=x*Math.cos(az)-y*Math.sin(az),y1=x*Math.sin(az)+y*Math.cos(az);
    const y2=y1*Math.cos(elv)-z*Math.sin(elv),z2=y1*Math.sin(elv)+z*Math.cos(elv);
    const depth=y2;const s=this.s;return [this.W/2+x1*s,this.H/2-z2*s,depth];}
  render(){
    const c=this.c,dpr=window.devicePixelRatio||1;const W=c.clientWidth||400,H=c.clientHeight||W;
    if(c.width!==Math.round(W*dpr)||c.height!==Math.round(H*dpr)){c.width=Math.round(W*dpr);c.height=Math.round(H*dpr);}
    this.W=W;this.H=H;const ctx=this.ctx;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    this.s=Math.min(W,H)/(2*this.o.range)*0.62*this.o.zoom;
    const R=this.o.range;
    const line=(a,b,color,w,dash)=>{const p=this.proj(a),q=this.proj(b);ctx.strokeStyle=color;ctx.lineWidth=w;ctx.setLineDash(dash||[]);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();ctx.setLineDash([]);};
    if(this.o.grid){for(let k=-R;k<=R;k++){line([k,-R,0],[k,R,0],'#eeece6',1);line([-R,k,0],[R,k,0],'#eeece6',1);}}
    /* faces: collect surface quads + polygons, sort by depth */
    const faces=[];
    const light=unit([0.4,-0.6,0.8]);
    this.items.forEach(it=>{
      if(it.type==='surface'){const g=it.grid;for(let i=0;i<g.length-1;i++)for(let j=0;j<g[i].length-1;j++){const q=[g[i][j],g[i+1][j],g[i+1][j+1],g[i][j+1]];if(!q.every(p=>p.every(Number.isFinite)))continue;
          const nrm=unit(cross(vsub(q[1],q[0]),vsub(q[3],q[0])));const sh=0.55+0.45*Math.abs(dot(nrm,light));
          const col=it.colorFn?it.colorFn(q[0],sh):(it.color||`rgba(59,91,219,${it.alpha!=null?it.alpha:0.55})`);
          faces.push({pts:q,fill:col,shade:sh,stroke:it.stroke===undefined?'rgba(30,40,80,.18)':it.stroke,it});}}
      else if(it.type==='polygon')faces.push({pts:it.pts,fill:it.fill||'rgba(59,91,219,.16)',stroke:it.stroke||'#3b5bdb',shade:1,it});
    });
    const pf=faces.map(f=>{const pp=f.pts.map(p=>this.proj(p));return {f,pp,d:pp.reduce((s,p)=>s+p[2],0)/pp.length};});
    pf.sort((a,b)=>a.d-b.d);
    /* axes behind (draw negative halves first is overkill; draw all axes lightly, then faces, then re-draw axis tips) */
    const axisColor='#8b877e';
    if(this.o.axes){line([-R,0,0],[R,0,0],'#c9c5bb',1.2);line([0,-R,0],[0,R,0],'#c9c5bb',1.2);line([0,0,-R],[0,0,R],'#c9c5bb',1.2);}
    pf.forEach(({f,pp})=>{ctx.beginPath();pp.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();
      let fill=f.fill;if(f.it.type==='surface'&&!f.it.colorFn&&!f.it.color){fill=shadeColor(f.it.base||[59,91,219],f.shade,f.it.alpha!=null?f.it.alpha:0.6);}
      ctx.fillStyle=fill;ctx.fill();if(f.stroke){ctx.strokeStyle=f.stroke;ctx.lineWidth=f.it.lineWidth||0.8;ctx.stroke();}});
    /* lines, vectors, points, text on top */
    this.items.forEach(it=>{
      if(it.type==='polyline'){ctx.strokeStyle=it.color||'#7c3aed';ctx.lineWidth=it.width||2.2;ctx.setLineDash(it.dash||[]);ctx.beginPath();let pen=false;it.pts.forEach(p=>{if(!p.every(Number.isFinite)){pen=false;return;}const q=this.proj(p);if(pen)ctx.lineTo(q[0],q[1]);else ctx.moveTo(q[0],q[1]);pen=true;});ctx.stroke();ctx.setLineDash([]);
        if(it.arrow){const n=it.pts.length;const a=this.proj(it.pts[Math.floor(n*0.5)]),b=this.proj(it.pts[Math.floor(n*0.5)+1]);this._head(a[0],a[1],b[0],b[1],it.color||'#7c3aed');}}
      else if(it.type==='vector'){const p=this.proj(it.from),q=this.proj(it.to);ctx.strokeStyle=it.color||'#d97706';ctx.lineWidth=it.width||2.6;ctx.setLineDash(it.dash||[]);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();ctx.setLineDash([]);if(Math.hypot(q[0]-p[0],q[1]-p[1])>3)this._head(p[0],p[1],q[0],q[1],it.color||'#d97706');
        if(it.label){ctx.fillStyle=it.color||'#d97706';ctx.font='600 13px -apple-system,Segoe UI,sans-serif';ctx.fillText(it.label,q[0]+7,q[1]-6);}}
      else if(it.type==='point'){const p=this.proj(it.p);ctx.fillStyle=it.color||'#1c1b1a';ctx.beginPath();ctx.arc(p[0],p[1],it.r||5,0,7);ctx.fill();if(it.ring){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(p[0],p[1],(it.r||5)*0.45,0,7);ctx.fill();}
        if(it.label){ctx.fillStyle=it.color||'#1c1b1a';ctx.font='600 13px -apple-system,Segoe UI,sans-serif';ctx.fillText(it.label,p[0]+8,p[1]-8);}
        if(it.drop){line(it.p,[it.p[0],it.p[1],0],'#b9b5ab',1,[4,3]);line([it.p[0],it.p[1],0],[it.p[0],0,0],'#b9b5ab',1,[4,3]);line([it.p[0],it.p[1],0],[0,it.p[1],0],'#b9b5ab',1,[4,3]);}}
      else if(it.type==='text'){const p=this.proj(it.p);ctx.fillStyle=it.color||'#57534e';ctx.font=it.font||'13px -apple-system,Segoe UI,sans-serif';ctx.fillText(it.str,p[0]+(it.dx||0),p[1]+(it.dy||0));}
    });
    if(this.o.axes){const L=this.o.labels;const tips=[[R,0,0],[0,R,0],[0,0,R]];tips.forEach((t,i)=>{const p=this.proj(t);ctx.fillStyle=axisColor;ctx.font='italic 600 14px -apple-system,Segoe UI,sans-serif';ctx.fillText(L[i],p[0]+4,p[1]-4);});
      /* tick marks at integers */
      ctx.fillStyle='#b9b5ab';ctx.font='10px -apple-system,sans-serif';for(let k=-Math.floor(R);k<=Math.floor(R);k++){if(!k)continue;[[k,0,0],[0,k,0],[0,0,k]].forEach(t=>{const p=this.proj(t);ctx.fillRect(p[0]-1.5,p[1]-1.5,3,3);});}}
    return this;
  }
  _head(x0,y0,x1,y1,color,L=10){const ctx=this.ctx;const ang=Math.atan2(y1-y0,x1-x0);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x1-L*Math.cos(ang-.45),y1-L*Math.sin(ang-.45));ctx.lineTo(x1-L*Math.cos(ang+.45),y1-L*Math.sin(ang+.45));ctx.closePath();ctx.fill();}
}
function shadeColor([r,g,b],sh,a){return `rgba(${Math.round(r*sh+255*(1-sh)*0.35)},${Math.round(g*sh+255*(1-sh)*0.35)},${Math.round(b*sh+255*(1-sh)*0.35)},${a})`;}
/* handy color bases for surfaces */
const SURF={blue:[59,91,219],purple:[124,58,237],green:[22,163,74],orange:[217,119,6],pink:[219,39,119],gray:[120,113,108]};
/* Common: draw both a 2D plot and refresh on section show */
function redrawOnShow(id,fn){onShow(id,fn);window.addEventListener('resize',()=>{const s=$(`section[data-id="${id}"]`);if(s&&s.classList.contains('active'))fn();});}

if(typeof module!=='undefined')module.exports={Expr,normalizeInput,toTex,previewTex,checkExprUpToConstant,checkAngle,checkNumber,checkExpr,checkVector,checkExprVector,checkEquation,checkLine,checkNumberList,checkPointList,parseVector,fmt,texNum,texSqrt,texLin,texVec,texIJK,cross,dot,norm,unit,vparallel,near,gcd,fmtSqrt};
