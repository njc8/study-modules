/* gauntletcheck.js - headless check of a gauntlet page and its item bank.
   Run: node tools/harness/gauntletcheck.js [midterm1-gauntlet.html]
   Loads the page in jsdom (no MathJax / MathQuill / tutor), then for every item:
   - static: unique id, known topic, non-empty concept question / rubric / model answer / prompt / solution,
     every non-written part has a sol (or a valid choice ans), and a written part is the only part;
   - checkers: each part's sol passes its checker, and a wrong answer ("7919" or a flipped choice) fails;
   - flow: drives the topic runner through the item (skip the concept, fill the sols, check, next) and
     confirms it is recorded as a pass; then fails one item and confirms it is requeued and listed as weak;
   - mixed: runs every problem with no concept step, checks no title leaks before an item is finished,
     that a miss lands on Weak spots, and that a later clean solve clears it.
   Also flags em dashes and bare "<letter" inside TeX in the item bank. Exit code 1 on any failure. */
const fs=require('fs'),path=require('path');
const {JSDOM,VirtualConsole}=require('jsdom');
const ROOT=path.resolve(__dirname,'..','..');
const file=path.resolve(ROOT,process.argv[2]||'midterm1-gauntlet.html');
let html=fs.readFileSync(file,'utf8');
const bankSrc=[];
html=html.replace(/<script src="([^"]+)"><\/script>/g,(m,src)=>{
  if(/mathjax|mathquill|jquery/.test(src))return '';
  let code=fs.readFileSync(path.resolve(path.dirname(file),src),'utf8');
  if(/gauntlet-/.test(src))bankSrc.push(code);
  if(/study\.js$/.test(src))code+='\n;window.MathJax.startup.promise=Promise.resolve();window.MathJax.typesetPromise=()=>Promise.resolve();';
  return '<script>'+code.replace(/<\/script>/g,'<\\/script>')+'</script>';
}).replace(/<link[^>]+>/g,'');
const vc=new VirtualConsole();const errors=[];
vc.on('jsdomError',e=>errors.push(String(e.message||e).split('\n')[0]));vc.on('error',(...a)=>errors.push(a.map(String).join(' ')));
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'+path.basename(file),virtualConsole:vc,
  beforeParse(w){const noop=()=>{};const ctx=new Proxy({},{get:(t,k)=>k==='canvas'?{}:(k==='measureText'?()=>({width:10}):noop),set:()=>true});
    w.HTMLCanvasElement.prototype.getContext=()=>ctx;w.scrollTo=noop;w.HTMLElement.prototype.scrollIntoView=noop;}});
const w=dom.window;
const fails=[];const bad=(it,msg)=>fails.push(`${it.id}: ${msg}`);

setTimeout(()=>{try{main();}catch(e){console.log('HARNESS CRASH',e.stack);errors.forEach(x=>console.log('page error: '+x));process.exit(1);}},300);
function main(){
  const items=w.GAUNTLET_M1||[];const G=w.eval('GX');
  const topics=new Set(G.topics.map(t=>t.id));const ids=new Set();
  /* ---- static + checkers */
  for(const it of items){
    if(ids.has(it.id))bad(it,'duplicate id');ids.add(it.id);
    if(!topics.has(it.topic))bad(it,'unknown topic '+it.topic);
    const c=it.concept||{},a=it.app||{};
    if(!c.q||!c.model||!Array.isArray(c.rubric)||!c.rubric.length)bad(it,'incomplete concept');
    if(!a.source||!a.prompt||!a.solution||!Array.isArray(a.parts)||!a.parts.length)bad(it,'incomplete app');
    const written=a.parts.filter(p=>p.kind==='written');
    if(written.length&&a.parts.length>1)bad(it,'written part must be the only part');
    for(const p of a.parts){
      if(p.kind==='written'){if(!p.rubric||!p.rubric.length)bad(it,'written part without rubric');continue;}
      if(p.kind==='choice'){if(!(p.ans>=0&&p.ans<p.options.length))bad(it,`choice ${p.k}: ans out of range`);continue;}
      if(p.sol==null){bad(it,`part ${p.k}: no sol`);continue;}
      let r;try{r=w.gxCheckPart(p,p.sol);}catch(e){bad(it,`part ${p.k}: checker threw ${e.message}`);continue;}
      if(!r.ok)bad(it,`part ${p.k}: sol "${p.sol}" rejected${r.err?' ('+r.err+')':''}`);
      let wr;try{wr=w.gxCheckPart(p,p.kind==='vector'||p.kind==='custom'&&/</.test(p.sol)?'<7919,1,2>':'7919');}catch(e){wr={ok:false};}
      if(wr.ok)bad(it,`part ${p.k}: a wrong answer was accepted`);
    }
  }
  /* ---- flow: run every topic end to end with correct answers */
  const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  const answerCurrent=(runner,correct)=>{
    const m=runner.mount;
    if(!runner.blind){
      click(m.querySelector('[data-a=idk]'));
      runner.cur.c='got';                                 /* stand in for a GOT IT verdict from the tutor */
      click(m.querySelector('[data-a=cont]'));
    }
    const app=m.querySelector('.gx-app');const it=runner.cur.it;
    if(it.app.parts[0].kind==='written'){click(app.querySelector('[data-a=sol]'));}
    else{
      const groups=[...app.querySelectorAll('.choice')];let gi=0;
      for(const p of it.app.parts){
        if(p.kind==='choice'){const want=correct?p.ans:(p.ans+1)%p.options.length;click(groups[gi++].querySelectorAll('.btn')[want]);continue;}
        const inp=app.querySelector(`[data-k="${p.k}"]`);inp.value=correct?p.sol:'7919';
      }
      click(app.querySelector('[data-a=check]'));
      if(!correct){if(runner.cur.a)bad(it,'wrong answers finished the item');click(app.querySelector('[data-a=sol]'));}
      else if(runner.cur.a!=='clean')bad(it,'correct sols did not pass in the page: '+app.querySelector('.fb').textContent.slice(0,120));
    }
    click(app.querySelector('[data-a=next]'));
  };
  for(const t of G.topics){
    const runner=G.runners[t.id];click(runner.mount.querySelector('[data-a=start]'));
    let guard=0;while(runner.run&&runner.run.pos<runner.run.queue.length&&guard++<60)answerCurrent(runner,true);
    const pool=items.filter(i=>i.topic===t.id);
    for(const it of pool){const rec=G.store.rec[it.id];const written=it.app.parts[0].kind==='written';
      if(!rec)bad(it,'not recorded after the run');else if(!written&&!rec.pass)bad(it,'recorded as not passed after correct answers');}
    if(!runner.mount.querySelector('.result'))fails.push(`topic ${t.id}: no summary after the run`);
  }
  /* ---- flow: a wrong answer is requeued and shows up under Weak spots */
  const r0=G.runners[G.topics[0].id];click(r0.mount.querySelector('[data-a=again]'));click(r0.mount.querySelector('[data-a=start]'));
  const first=r0.run.queue[0];answerCurrent(r0,false);
  if(r0.run.queue.filter(id=>id===first).length!==2)fails.push('flow: a failed item was not requeued');
  const weak=G.runners.weak;weak.render();
  if(!weak.mount.textContent.includes(G.byId[first].title))fails.push('flow: a failed item is not listed under Weak spots');
  /* ---- flow: mixed practice, problems only */
  const mx=G.runners.mixed;
  if(!mx)fails.push('mixed: no mixed runner on the page');
  else{
    mx.mount.querySelector('.gx-len .btn:last-child').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));click(mx.mount.querySelector('[data-a=start]'));
    if(mx.run.queue.length!==items.length)fails.push(`mixed: "All" dealt ${mx.run.queue.length} of ${items.length}`);
    const before=JSON.parse(JSON.stringify(G.store.rec));
    const target=mx.run.queue.find(id=>G.byId[id].app.parts[0].kind!=='written');let guard=0,k=0;
    while(mx.run&&mx.run.pos<mx.run.queue.length&&guard++<200){
      const it=G.byId[mx.run.queue[mx.run.pos]];
      if(mx.mount.querySelector('.gx-concept'))bad(it,'mixed: concept step shown');
      if(mx.mount.innerHTML.includes(it.title))bad(it,'mixed: title visible before the problem is finished');
      const miss=it.id===target&&k++===0;answerCurrent(mx,!miss);
      if(miss){
        const rec=G.store.rec[target];
        if(!rec||rec.pass||rec.c!==null)fails.push('mixed: a missed problem was not recorded as a mixed miss');
        weak.render();if(!weak.mount.textContent.includes(G.byId[target].title))fails.push('mixed: a missed problem is not listed under Weak spots');
      }
    }
    if(!mx.mount.querySelector('.result'))fails.push('mixed: no summary after the run');
    if(!(G.store.rec[target]||{}).pass)fails.push('mixed: a clean retry did not clear the mixed miss');
    for(const it of items)if(it.id!==target&&it.app.parts[0].kind!=='written'&&before[it.id]&&JSON.stringify(before[it.id])!==JSON.stringify(G.store.rec[it.id]))bad(it,'mixed: a clean solve changed a topic-run record');
  }
  /* ---- text rules */
  const src=bankSrc.join('\n');
  if(/\u2014/.test(src))fails.push('item bank contains an em dash');
  const texRe=/\\\((.*?)\\\)|\\\[(.*?)\\\]/g;let m;while((m=texRe.exec(src))){const b=m[1]||m[2]||'';if(/<[a-zA-Z\\]/.test(b))fails.push('bare "<" before a letter inside TeX: '+b.slice(0,60));}
  errors.forEach(e=>fails.push('page error: '+e));
  console.log(`${items.length} items across ${G.topics.length} topics`);
  G.topics.forEach(t=>console.log(`  ${t.id.padEnd(9)} ${items.filter(i=>i.topic===t.id).length}`));
  fails.forEach(f=>console.log('  FAIL '+f));
  console.log(fails.length?`GAUNTLET CHECK FAILED (${fails.length})`:'GAUNTLET CHECK OK');
  process.exit(fails.length?1:0);
}
