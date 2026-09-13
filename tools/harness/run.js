/* Headless drill harness for Custom Study Modules.
   usage: node run.js <module.html> [rounds=25] [typeFilter]
   Loads the page in jsdom (without MathJax / MathQuill / jQuery), then for every Drill and every question type:
   generate, render, fill the inputs from window.__solvers[type.name], click choice buttons for _btn keys, check.
   Reports types that fail, throw, or lack a solver. Exit code 1 on any failure. */
const fs=require('fs'),path=require('path');
const {JSDOM,VirtualConsole}=require('jsdom');
const file=path.resolve(process.argv[2]);const rounds=parseInt(process.argv[3]||'25');const filter=process.argv[4]||null;
let html=fs.readFileSync(file,'utf8');
const dir=path.dirname(file);
/* strip heavy / browser-only scripts and inline the rest */
html=html.replace(/<script src="([^"]+)"><\/script>/g,(m,src)=>{
  if(/mathjax|mathquill|jquery/.test(src))return '';
  const p=path.resolve(dir,src);if(!fs.existsSync(p)){console.log('MISSING SCRIPT',src);return '';}
  let code=fs.readFileSync(p,'utf8');
  if(/study\.js$/.test(src))code+='\n;window.__mixDrillOrig=mixDrill;mixDrill=function(types){const o=window.__mixDrillOrig(types);o.types=types;return o;};window.mixDrill=mixDrill;window.MathJax.startup.promise=Promise.resolve();window.MathJax.typesetPromise=()=>Promise.resolve();window.MathJax.typesetClear=()=>{};';
  return '<script>'+code.replace(/<\/script>/g,'<\\/script>')+'</script>';
}).replace(/<link[^>]+>/g,'');
const vc=new VirtualConsole();const errors=[];
vc.on('jsdomError',e=>{errors.push(String(e.message||e).split('\n')[0]);});
vc.on('error',(...a)=>errors.push(a.map(String).join(' ')));vc.on('warn',()=>{});vc.on('log',(...a)=>console.log('[page]',...a));
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'+path.basename(dir)+'/'+path.basename(file),virtualConsole:vc,
  beforeParse(window){
    const noop=()=>{};const ctxProxy=new Proxy({},{get:(t,k)=>k==='canvas'?{}:(k==='measureText'?()=>({width:10}):noop),set:()=>true});
    window.HTMLCanvasElement.prototype.getContext=()=>ctxProxy;
    window.scrollTo=noop;window.HTMLElement.prototype.scrollIntoView=noop;
    Object.defineProperty(window.HTMLElement.prototype,'clientWidth',{get(){return 400;}});Object.defineProperty(window.HTMLElement.prototype,'clientHeight',{get(){return 400;}});
  }});
const w=dom.window;
function fill(qEl,ans){
  for(const k in ans){
    if(/^_btn/.test(k)){const groups=[...qEl.querySelectorAll('.choice')];const gi=k==='_btn'?0:parseInt(k.slice(4));const g=groups[gi];if(!g)throw new Error('no choice group '+gi);const b=g.querySelectorAll('.btn')[ans[k]];if(!b)throw new Error('no button '+ans[k]+' in group '+gi);b.click();continue;}
    const inp=qEl.querySelector(`[data-k="${k}"]`);if(!inp)throw new Error('no input data-k='+k);inp.value=String(ans[k]);
  }
}
setTimeout(()=>{
  const drills=w.__drills||[];const solvers=w.__solvers||{};
  const results={};let fails=0;
  const seen=new Set();
  drills.forEach((d,di)=>{
    const types=(d.o&&d.o.types)||[d.o];
    types.forEach(t=>{
      if(!t||seen.has(t))return;seen.add(t);
      const name=t.name||'(unnamed type in drill '+di+')';if(filter&&!name.includes(filter))return;
      const r=results[name]={ok:0,bad:0,err:0,nosolver:false,examples:[]};
      const solve=solvers[name];if(!solve){r.nosolver=true;fails++;return;}
      for(let i=0;i<rounds;i++){
        let q,ans,fb='';
        try{
          q=t.gen();q.type=t;d.q=q;d.cur=d.o;d.done=false;q.tried=false;d.qEl.innerHTML='';d.fb.innerHTML='';
          t.render(q,d.qEl,d);
          ans=solve(q);fill(d.qEl,ans);
          d.check();fb=d.fb.textContent;
          if(d.done)r.ok++;else{r.bad++;if(r.examples.length<2)r.examples.push({prompt:d.qEl.textContent.replace(/\s+/g,' ').slice(0,300),ans,fb:fb.slice(0,200)});}
          const sol=t.solution(q,d.qEl);if(typeof sol!=='string'||!sol.trim())throw new Error('empty solution');
          if(t.hint)t.hint(q,d.qEl,d);
        }catch(e){r.err++;if(r.examples.length<2)r.examples.push({error:String(e.stack||e).split('\n').slice(0,3).join(' | '),ans});}
      }
      if(r.bad||r.err)fails++;
    });
  });
  /* solvers with no matching type (typo in the name) */
  const typeNames=new Set([...seen].map(t=>t.name));const orphan=Object.keys(solvers).filter(n=>!typeNames.has(n)&&n!=='from WebAssign');
  console.log(`== ${path.basename(file)}: ${drills.length} drills, ${seen.size} question types, ${rounds} rounds each`);
  for(const [name,r] of Object.entries(results)){
    const status=r.nosolver?'NO SOLVER':(r.bad||r.err)?'FAIL':'ok';
    console.log(`${status.padEnd(9)} ${name}  ok=${r.ok} wrong=${r.bad} threw=${r.err}`);
    r.examples.forEach(ex=>console.log('    ',JSON.stringify(ex)));
  }
  if(orphan.length)console.log('solvers without a matching type name:',orphan.join(' ; '));
  if(errors.length){console.log('page errors:');errors.slice(0,8).forEach(e=>console.log('   ',e));}
  console.log(fails||errors.length?`FAILED (${fails} types, ${errors.length} page errors)`:'ALL PASS');
  process.exit(fails||errors.length?1:0);
},800);
