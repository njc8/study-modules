/* Midterm gauntlet engine. Loaded after study.js by a gauntlet page.

   A gauntlet is a run through items. Each item pairs a concept or process question with an
   application problem:
     Step 1  the student explains the idea in words; the tutor proxy grades it against a rubric
             (GOT IT / SHAKY / MISSED). Offline, the student compares with the model answer and grades themself.
     Step 2  the real problem: answer boxes checked locally, or a written argument graded by the tutor.
   An item is passed when the concept is GOT IT and the problem is right on the first check.
   Anything else goes back to the end of the run (at most twice), and stays on the Weak spots list until passed.

   Page markup: one <section> per topic holding <div class="gx" data-mode="topic" data-topic="vec">,
   plus sections holding data-mode="exam" and data-mode="weak". Call
     initGauntlet({key, items, topics:[{id, title}]})
   right before initModule. Section ids must equal topic ids.

   Item: {id, topic, title, concept:{q, rubric:[...], model}, app:{source, prompt, fig?, parts:[...], solution}}
     source   'Week 5 HW · Problem 3', or 'Practice' for problems written to fill a gap
     fig      {cls:'wide'|'short'|'', style, opts (Plot2D options), draw(p, solved)}
     parts    kinds checked here: number{ans,tol} vector{ans,parallel,sameDir} expr{ans,vars,domain}
              exprVector{ans,vars} equation{ans,vars} line{P,d} choice{options,ans} custom{check(v)->{ok,err}}
              written{rubric}: tutor-graded, and must be the item's only part.
              Every other part carries sol: a string its checker accepts (used by the self-test). */

const GRADE_RULES=`GRADING MODE. Ignore the graph instructions above: never draw a graph here.
You are grading one short answer from a MATH 212 student studying for Midterm 1. The user message holds the question, the rubric (the key ideas a complete answer contains), and the student's answer.
Grade the idea, not the wording. Informal language is fine when the idea is right. Do not require formulas unless the rubric does. A factually wrong claim outweighs extra correct detail.
Verdicts:
- GOT IT: every rubric point is present or clearly implied, and nothing stated is wrong.
- SHAKY: the core idea is right, but a rubric point is missing or vague, or there is a minor error.
- MISSED: the core idea is missing or wrong, or the answer is blank or off topic.
Reply format, exactly:
Line 1: VERDICT: GOT IT | SHAKY | MISSED
Then at most three short bullets, addressed to the student as "you": what is right, then what is missing or wrong, with the correct idea in one sentence. Under 90 words after line 1. Write math in LaTeX with \\( \\). No headings, no restating the question, no praise padding. Never use the em dash; use a comma or a plain hyphen.`;

const GX_VERDICT={got:'Got it',shaky:'Shaky',missed:'Missed'};
const GX_APP={clean:'right on the first check',retry:'right after a retry',revealed:'solution revealed'};

/* ------------------------------------------------------------ tutor grading */
function gxPlain(html){const d=document.createElement('div');d.innerHTML=html;return d.textContent.replace(/\s+/g,' ').trim();}
async function gxGrade({question,rubric,answer,onText,signal}){
  const K=window.TutorKit;const url=K&&K.endpoint();
  if(!url)throw new Error('The tutor is not connected on this copy of the site.');
  const msg=`Question: ${question}\n\nRubric (the key ideas a complete answer contains):\n${rubric.map((r,i)=>`${i+1}. ${gxPlain(r)}`).join('\n')}\n\nStudent answer: ${answer}`;
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:msg}],context:GRADE_RULES}),signal});
  if(!res.ok){let m='The tutor is unavailable right now ('+res.status+').';try{const j=await res.json();if(j.error)m=j.error;}catch(e){}throw new Error(m);}
  const reader=res.body.getReader(),dec=new TextDecoder();let buf='',text='';
  for(;;){
    const {value,done}=await reader.read();if(done)break;
    buf+=dec.decode(value,{stream:true});let i;
    while((i=buf.indexOf('\n'))>=0){
      const line=buf.slice(0,i).trim();buf=buf.slice(i+1);
      if(!line.startsWith('data:'))continue;const data=line.slice(5).trim();if(data==='[DONE]')continue;
      let j;try{j=JSON.parse(data);}catch(e){continue;}
      if(j.error)throw new Error(j.error.message||'The model returned an error.');
      const d=j.choices&&j.choices[0]&&j.choices[0].delta;if(d&&d.content){text+=d.content;if(onText)onText(text);}
    }
  }
  return text;
}
function gxVerdict(text){const m=/VERDICT:\s*\**\s*(GOT IT|SHAKY|MISSED)/i.exec(text);return m?{'GOT IT':'got',SHAKY:'shaky',MISSED:'missed'}[m[1].toUpperCase()]:null;}
function gxFeedback(text){return text.replace(/^[\s\S]*?VERDICT:[^\n]*\n?/i,'').replace(/\s*\u2014\s*/g,' - ').trim();}
function gxMd(src){const K=window.TutorKit;if(K&&K.mdToHtml)return K.mdToHtml(src);const d=document.createElement('div');d.textContent=src;return '<p>'+d.innerHTML.replace(/\n/g,'<br>')+'</p>';}
function gxChip(v){return `<span class="gx-verdict v-${v}"><i></i>${GX_VERDICT[v]}</span>`;}

/* ------------------------------------------------------------ answer checking */
function gxCheckPart(part,v){
  switch(part.kind){
    case 'number':return checkNumber(v,part.ans,part.tol!=null?{tol:part.tol}:{});
    case 'vector':return checkVector(v,part.ans,{parallel:!!part.parallel,sameDir:!!part.sameDir});
    case 'expr':return checkExpr(v,part.ans,part.vars||['x','y'],{domain:part.domain});
    case 'exprVector':return checkExprVector(v,part.ans,part.vars||['t'],{domain:part.domain});
    case 'equation':return checkEquation(v,part.ans,part.vars||['x','y','z']);
    case 'line':return checkLine(v,part.P,part.d);
    case 'custom':return part.check(v);
    default:return {ok:false,err:'unknown part kind '+part.kind};
  }
}

/* ------------------------------------------------------------ store */
const GX={items:[],byId:{},topics:[],store:{rec:{},runs:{}},storeKey:'',runners:{}};
function gxSave(){try{localStorage.setItem(GX.storeKey,JSON.stringify(GX.store));}catch(e){}}
function gxLoad(){try{const s=JSON.parse(localStorage.getItem(GX.storeKey)||'null');if(s&&s.rec&&s.runs)GX.store=s;}catch(e){}}
function gxState(id){const r=GX.store.rec[id];if(!r)return 'new';if(r.pass)return 'pass';return (r.c==='missed'||r.a==='revealed')?'missed':'shaky';}
function gxWeak(){return GX.items.filter(it=>{const r=GX.store.rec[it.id];return r&&!r.pass;});}
function gxRefreshDone(){
  GX.topics.forEach(t=>{const its=GX.items.filter(i=>i.topic===t.id);if(its.length&&its.every(i=>gxState(i.id)==='pass'))markDone(t.id);});
  if(GX.items.every(i=>GX.store.rec[i.id])&&!gxWeak().length)markDone('weak');
}
/* exam order: shuffle within each topic, deal the topics round-robin so any prefix is balanced, then shuffle the prefix */
function gxExamQueue(n){
  const piles=GX.topics.map(t=>shuffle(GX.items.filter(i=>i.topic===t.id).map(i=>i.id)));const out=[];
  while(piles.some(p=>p.length))shuffle(piles).forEach(p=>{if(p.length)out.push(p.pop());});
  return shuffle(out.slice(0,n));
}

/* ------------------------------------------------------------ one runner per section */
class GxRunner{
  constructor(mount){
    this.mount=mount;this.section=mount.closest('section').dataset.id;this.mode=mount.dataset.mode;this.topic=mount.dataset.topic;
    this.drawFig=null;GX.runners[this.section]=this;this.render();
  }
  get run(){return GX.store.runs[this.section]||null;}
  set run(r){if(r)GX.store.runs[this.section]=r;else delete GX.store.runs[this.section];gxSave();}
  pool(){return this.mode==='topic'?GX.items.filter(i=>i.topic===this.topic):this.mode==='weak'?gxWeak():GX.items;}
  render(){const r=this.run;if(r&&r.pos<r.queue.length)this.renderItem();else if(r)this.renderSummary();else this.renderIntro();}
  mapHtml(ids,cur){
    return `<div class="gx-map">${ids.map((id,k)=>{const it=GX.byId[id];return `<button type="button" class="${gxState(id)}${id===cur?' cur':''}" data-jump="${id}" title="${k+1}. ${it.title}"></button>`;}).join('')}</div>`;
  }
  start(queue){this.run={queue,pos:0,first:{},tries:{}};this.render();this.focusTop();}
  focusTop(){const s=this.mount.closest('section');if(s&&s.classList.contains('active'))this.mount.scrollIntoView({block:'start',behavior:'smooth'});}

  renderIntro(){
    const m=this.mount;this.drawFig=null;
    if(this.mode==='topic'){
      const ids=this.pool().map(i=>i.id);const passed=ids.filter(id=>gxState(id)==='pass').length;
      m.innerHTML=`<div class="card"><div class="gx-top"><b>${ids.length} items</b><span class="muted">${passed} passed</span></div>${this.mapHtml(ids)}
        <ol class="gx-list">${ids.map(id=>`<li><i class="gx-dot ${gxState(id)}"></i>${GX.byId[id].title}<span class="muted small"> · ${GX.byId[id].app.source}</span></li>`).join('')}</ol>
        <div class="drill-bar"><button class="btn primary" data-a="start">Start this gauntlet ▶</button></div></div>`;
      $('[data-a=start]',m).onclick=()=>this.start(ids);
    }else if(this.mode==='exam'){
      const N=GX.items.length;
      m.innerHTML=`<div class="card"><p>Items are dealt from every topic in random order, so a short run still covers the whole exam. Misses come back at the end, like the topic runs.</p>
        <div class="gx-top"><b>Length</b></div><div class="choice gx-len">${[10,20,N].map((n,i)=>`<button class="btn${i===0?' picked':''}" data-n="${n}">${n===N?'All '+N:n+' items'}</button>`).join('')}</div>
        <div class="drill-bar"><button class="btn primary" data-a="start">Start the shuffled exam ▶</button></div></div>`;
      let n=10;$$('.gx-len .btn',m).forEach(b=>b.onclick=()=>{n=+b.dataset.n;$$('.gx-len .btn',m).forEach(x=>x.classList.toggle('picked',x===b));});
      $('[data-a=start]',m).onclick=()=>this.start(gxExamQueue(n));
    }else{
      const weak=gxWeak();const unseen=GX.items.filter(i=>!GX.store.rec[i.id]).length;
      m.innerHTML=`<div class="card">${weak.length?`<div class="gx-top"><b>${weak.length} weak item${weak.length>1?'s':''}</b><span class="muted">not yet passed cleanly</span></div>
        <ol class="gx-list">${weak.map(it=>{const r=GX.store.rec[it.id];return `<li><i class="gx-dot ${gxState(it.id)}"></i>${it.title}<span class="muted small"> · concept ${GX_VERDICT[r.c].toLowerCase()}, problem ${GX_APP[r.a]}</span></li>`;}).join('')}</ol>
        <div class="drill-bar"><button class="btn primary" data-a="start">Run the weak spots ▶</button></div>`
        :`<p>${unseen?`Nothing weak yet. ${unseen} of ${GX.items.length} items have not been attempted: run the topics first.`:'No weak spots. Every item is passed.'}</p>`}</div>`;
      if(weak.length)$('[data-a=start]',m).onclick=()=>this.start(weak.map(i=>i.id));
    }
    this.wireJumps();
  }
  wireJumps(){
    $$('[data-jump]',this.mount).forEach(b=>b.onclick=()=>{
      const id=b.dataset.jump;const r=this.run;
      if(r&&r.pos<r.queue.length){const k=r.queue.indexOf(id,r.pos);if(k<0)return;r.queue.splice(k,1);r.queue.splice(r.pos,0,id);this.run=r;this.renderItem();}
      else{const ids=this.pool().map(i=>i.id);const k=ids.indexOf(id);if(k>=0)this.start(ids.slice(k).concat(ids.slice(0,k)));}
    });
  }

  renderSummary(){
    const r=this.run,m=this.mount;this.drawFig=null;
    const ids=[...new Set(r.queue)];const f=id=>r.first[id]||{};
    const first=ids.filter(id=>f(id).pass).length,cleared=ids.filter(id=>!f(id).pass&&gxState(id)==='pass').length,weak=ids.filter(id=>gxState(id)!=='pass').length;
    if(this.mode==='exam'&&first>=0.8*ids.length)markDone('exam');
    m.innerHTML=`<div class="card"><div class="result">${first} / ${ids.length}</div><p>passed on the first attempt${cleared?`, ${cleared} more cleared on a retry`:''}.${weak?` ${weak} still weak: they are on the Weak spots page.`:' Nothing left weak from this run.'}</p>
      <ul class="gx-sum">${ids.map(id=>{const x=f(id);return `<li><i class="gx-dot ${gxState(id)}"></i><span>${GX.byId[id].title}</span><span class="muted small">first try: concept ${x.c?GX_VERDICT[x.c].toLowerCase():'-'}, problem ${x.a?GX_APP[x.a]:'-'}</span></li>`;}).join('')}</ul>
      <div class="drill-bar"><button class="btn primary" data-a="again">Run it again</button>${weak?'<a class="btn" href="#weak">Go to Weak spots</a>':''}</div></div>`;
    $('[data-a=again]',m).onclick=()=>{this.run=null;this.render();};
  }

  /* ---------------- one item */
  renderItem(){
    const r=this.run,id=r.queue[r.pos],it=GX.byId[id],m=this.mount;
    const retry=r.queue.indexOf(id)<r.pos;
    const mapIds=this.mode==='topic'?this.pool().map(i=>i.id):[...new Set(r.queue)];
    m.innerHTML=`<div class="quiz-head"><span>Item ${r.pos+1} of ${r.queue.length}${retry?' · second look':''}</span><span><button class="gx-link" data-a="end">End run</button></span></div>
      <div class="qbar"><i style="width:${100*r.pos/r.queue.length}%"></i></div>${this.mapHtml(mapIds,id)}
      <h3 class="gx-title">${it.title}</h3>
      <div class="card gx-step gx-concept"></div><div class="card gx-step gx-app" hidden></div>`;
    $('[data-a=end]',m).onclick=()=>{r.queue=r.queue.slice(0,r.pos);this.run=r;this.render();};
    this.wireJumps();
    this.cur={it,c:null,a:null,tried:false};
    this.renderConcept($('.gx-concept',m));
    typeset(m);
  }
  renderConcept(box){
    const it=this.cur.it;
    box.innerHTML=`<p class="eyebrow">Step 1 · Concept</p><div class="prompt">${it.concept.q}</div>
      <textarea class="gx-ta" placeholder="Explain it in your own words, the way you would to a classmate. A few sentences is plenty."></textarea>
      <div class="drill-bar gx-ask"><button class="btn primary" data-a="grade">Grade my explanation</button><button class="btn" data-a="idk">I don't know yet</button><span class="muted small">⌘ Enter grades</span></div>
      <div class="gx-fb" hidden></div>
      <div class="gx-model" hidden><h4>Model answer</h4>${it.concept.model}</div>
      <div class="drill-bar gx-next" hidden><button class="btn" data-a="model">Show model answer</button><span class="gx-over"></span><button class="btn primary" data-a="cont">Continue to the problem ▶</button></div>`;
    const ta=$('.gx-ta',box),fb=$('.gx-fb',box),model=$('.gx-model',box);
    const showModel=()=>{model.hidden=false;$('[data-a=model]',box).hidden=true;typeset(model);};
    const settle=(v,{self=false}={})=>{
      this.cur.c=v;$('.gx-ask',box).hidden=true;ta.readOnly=true;$('.gx-next',box).hidden=false;
      $('.gx-over',box).innerHTML=self?'':`<span class="muted small">Grade wrong? Set it:</span>${['got','shaky','missed'].map(k=>`<button class="gx-link" data-set="${k}">${GX_VERDICT[k]}</button>`).join('')}`;
      $$('[data-set]',box).forEach(b=>b.onclick=()=>{this.cur.c=b.dataset.set;const chip=$('.gx-verdict',fb);if(chip)chip.outerHTML=gxChip(b.dataset.set);});
      if(v!=='got')showModel();
    };
    const selfGrade=msg=>{
      fb.hidden=false;fb.innerHTML=`<p class="err">${msg}</p><p>Compare your answer with the model answer below, then grade yourself:</p><div class="choice">${['got','shaky','missed'].map(k=>`<button class="btn" data-self="${k}">${GX_VERDICT[k]}</button>`).join('')}</div>`;
      showModel();$('.gx-ask',box).hidden=true;
      $$('[data-self]',fb).forEach(b=>b.onclick=()=>{fb.innerHTML=gxChip(b.dataset.self);settle(b.dataset.self,{self:true});});
    };
    const grade=async()=>{
      const answer=ta.value.trim();if(!answer){ta.focus();return;}
      const btn=$('[data-a=grade]',box);btn.disabled=true;btn.textContent='Grading…';fb.hidden=false;fb.innerHTML='<p class="muted">The tutor is reading your answer…</p>';
      try{
        const text=await gxGrade({question:gxPlain(it.concept.q),rubric:it.concept.rubric,answer,onText:t=>{const b=gxFeedback(t);if(b&&/VERDICT/i.test(t))fb.innerHTML=b?gxMd(b):'';}});
        const v=gxVerdict(text);if(!v){selfGrade('The tutor replied without a clear verdict.');return;}
        fb.innerHTML=gxChip(v)+'<div class="gx-note">'+gxMd(gxFeedback(text))+'</div>';typeset(fb);settle(v);
      }catch(e){selfGrade(e.message||String(e));}
    };
    $('[data-a=grade]',box).onclick=grade;
    ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();grade();}});
    $('[data-a=idk]',box).onclick=()=>{fb.hidden=false;fb.innerHTML=gxChip('missed')+'<p class="muted small">Read the model answer, then try the problem.</p>';settle('missed',{self:true});};
    $('[data-a=model]',box).onclick=showModel;
    $('[data-a=cont]',box).onclick=()=>{$('.gx-next',box).hidden=true;const app=$('.gx-app',this.mount);app.hidden=false;this.renderApp(app);app.scrollIntoView({block:'start',behavior:'smooth'});};
    const s=this.mount.closest('section');if(s&&s.classList.contains('active'))setTimeout(()=>ta.focus({preventScroll:true}),0);
  }
  renderApp(box){
    const it=this.cur.it,app=it.app;const written=app.parts.length===1&&app.parts[0].kind==='written';
    box.innerHTML=`<p class="eyebrow">Step 2 · Apply it</p><div class="wa-tag"><span class="wa-dot"></span>${app.source==='Practice'?'Practice problem':'From '+app.source}</div>
      <div class="drill"><div class="q"><div class="prompt">${app.prompt}</div></div><div class="fb"></div>
      <div class="drill-bar"><button class="btn primary" data-a="check">${written?'Grade my argument':'Check'}</button><button class="btn" data-a="sol">Show solution</button><button class="btn primary" data-a="next" hidden>Next item ▶</button></div></div>`;
    const q=$('.q',box),fb=$('.fb',box);
    if(app.fig){const w=el('div',{class:'gx-fig'});const c=el('canvas',{class:'scene '+(app.fig.cls||''),style:app.fig.style||''});w.appendChild(c);q.appendChild(w);
      const p=new Plot2D(c,app.fig.opts);this.drawFig=()=>{p.begin();app.fig.draw(p,!!this.cur.a);};this.drawFig();}
    else this.drawFig=null;
    const getters={};
    app.parts.forEach(part=>{
      if(part.kind==='choice'){if(part.label)q.appendChild(el('div',{class:'wa-partlabel'},part.label));getters[part.k]=choiceButtons(q,part.options.map((o,i)=>({label:o,value:i})));}
      else if(part.kind==='written'){q.appendChild(el('textarea',{class:'gx-ta','data-k':part.k,placeholder:'Write the argument in words and symbols. Plain text like |p|^2 = p·p is fine.'}));}
      else{const wide=part.kind!=='number';q.appendChild(ansLine(part.label||'',part.k,{wide:wide&&!part.xwide,xwide:!!part.xwide,placeholder:part.placeholder,after:part.after}));}
    });
    typeset(q);upgradeMathInputs(q);
    const finish=(kind,note)=>{
      this.cur.a=kind;$('[data-a=check]',box).hidden=true;$('[data-a=sol]',box).hidden=true;$('[data-a=next]',box).hidden=false;
      fb.className='fb'+(kind==='revealed'?'':' good');
      fb.innerHTML=(note||'')+'<div class="sol">'+app.solution+'</div>';typeset(fb);if(this.drawFig)this.drawFig();
      $('[data-a=next]',box).focus({preventScroll:true});
    };
    const check=async()=>{
      if(this.cur.a)return;
      if(written){
        const ta=$('textarea',q),answer=ta.value.trim();if(!answer){ta.focus();return;}
        const btn=$('[data-a=check]',box);btn.disabled=true;btn.textContent='Grading…';fb.className='fb';fb.innerHTML='<p class="muted">The tutor is reading your argument…</p>';
        try{
          const text=await gxGrade({question:gxPlain(app.prompt),rubric:app.parts[0].rubric,answer});const v=gxVerdict(text);
          const note=(v?gxChip(v):'')+'<div class="gx-note">'+gxMd(gxFeedback(text))+'</div>';
          if(v==='got'){finish(this.cur.tried?'retry':'clean',note);return;}
          this.cur.tried=true;fb.className='fb';fb.innerHTML=note+'<p class="muted small">Revise your argument and grade it again, or show the solution.</p>';typeset(fb);
        }catch(e){fb.className='fb bad';fb.textContent=(e.message||String(e))+' Show the solution and compare it with your argument.';}
        btn.disabled=false;btn.textContent='Grade my argument';return;
      }
      let ok=true,err=null;const wrong=[];
      for(const part of app.parts){
        if(part.kind==='choice'){const v=getters[part.k]();if(v===null){fb.className='fb bad';fb.textContent='Pick an option for every part.';return;}if(v!==part.ans){ok=false;wrong.push(gxPlain(part.label||'the choice'));}continue;}
        const inp=q.querySelector(`[data-k="${part.k}"]`);const res=gxCheckPart(part,inp?inp.value:'');
        if(inp)gradeInput(inp,res);if(!res.ok){ok=false;if(res.err&&!err)err=res.err;}
      }
      if(ok){finish(this.cur.tried?'retry':'clean','Correct. ');return;}
      fb.className='fb bad';
      if(err&&!wrong.length){fb.textContent='Could not read your answer: '+err;return;}
      this.cur.tried=true;fb.innerHTML=wrong.length?`Not quite: check ${wrong.join('; ')}.`:'Not quite. Fix the marked answers and check again.';typeset(fb);
    };
    $('[data-a=check]',box).onclick=check;
    $('[data-a=sol]',box).onclick=()=>finish('revealed');
    $('[data-a=next]',box).onclick=()=>this.next();
    box.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'){e.preventDefault();if(this.cur.a)this.next();else check();}});
    const f=$('input',q);if(f)setTimeout(()=>focusInput(f),0);
  }
  next(){
    const r=this.run,{it,c,a}=this.cur;const pass=c==='got'&&a==='clean';
    GX.store.rec[it.id]={c,a,pass,t:Date.now()};
    if(!r.first[it.id])r.first[it.id]={c,a,pass};
    r.tries[it.id]=(r.tries[it.id]||0)+1;
    if(!pass&&r.tries[it.id]<3)r.queue.push(it.id);
    r.pos++;this.run=r;gxRefreshDone();
    Object.values(GX.runners).forEach(x=>{if(x!==this&&!(x.run&&x.run.pos<x.run.queue.length))x.render();});
    this.render();this.focusTop();
  }
}

function initGauntlet({key,items,topics}){
  GX.items=items;GX.topics=topics;GX.byId=Object.fromEntries(items.map(i=>[i.id,i]));GX.storeKey='sm-gauntlet-'+key;gxLoad();
  $$('.gx').forEach(m=>{const r=new GxRunner(m);onShow(r.section,()=>{if(r.drawFig)r.drawFig();});window.addEventListener('resize',()=>{const s=m.closest('section');if(s.classList.contains('active')&&r.drawFig)r.drawFig();});});
}
