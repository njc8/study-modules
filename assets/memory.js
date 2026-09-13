/* Custom Study Modules: spaced-repetition memory trainer (MATH 102).
   Loads after study.js, calc102.js, and a deck file that fills window.MEM_MODULES and window.MEM_CARDS.

   Card schema (see assets/m102-deck.js):
     {id, mod, kind, prompt, show, why?, ans?, vars?, domain?, tol?, placeholder?, label?}
     kind: 'const'   typed antiderivative, graded with checkExprUpToConstant(ans, vars||['x'], {domain})
           'expr'    typed expression, checkExpr(ans, vars, {domain})
           'seq'     typed expression in n sampled at integers, checkExprInt(ans, vars||['n'], {domain})
           'number'  typed number, checkNumber(ans, {tol})
           'limit'   typed number or inf / DNE / diverges, checkLimit(ans)
           'complex' typed complex number, checkComplex([re,im])
           'interval' typed interval, checkInterval({lo,hi,loIn,hiIn})
           'list'    order-free comma list of numbers, checkNumberList(ans)
           'recall'  free recall: the learner writes the fact in the box, reveals, and self-rates
   Scheduling: an SM-2 style scheduler. Grades: 0 again, 1 hard, 2 good, 3 easy. State lives in localStorage under m102-memory. */

const MEM={
  KEY:'m102-memory',
  DAY:86400000,
  state:{cards:{},settings:{newPerDay:12},days:{}},
  load(){try{const s=JSON.parse(localStorage.getItem(this.KEY)||'null');if(s&&s.cards){this.state=Object.assign({cards:{},settings:{newPerDay:12},days:{}},s);}}catch(e){}return this;},
  save(){try{localStorage.setItem(this.KEY,JSON.stringify(this.state));}catch(e){}},
  today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;},
  dayRec(){const k=this.today();return this.state.days[k]=this.state.days[k]||{new:0,reviews:0,again:0};},
  card(id){return this.state.cards[id]||(this.state.cards[id]={ivl:0,ease:2.5,due:0,reps:0,lapses:0,status:'new',last:0});},
  peek(id){return this.state.cards[id]||{ivl:0,ease:2.5,due:0,reps:0,lapses:0,status:'new',last:0};},
  isDue(id,now=Date.now()){const s=this.peek(id);if(s.status==='new'||s.status==='suspended')return false;return s.due<=now;},
  fuzz(days){return days<=2?days:days*(0.95+Math.random()*0.1);},
  /* grade a card: g in 0..3. Returns a short description of what was scheduled. */
  grade(id,g){
    const s=this.card(id),now=Date.now(),rec=this.dayRec();
    const wasNew=s.status==='new';
    if(wasNew)rec.new++;else rec.reviews++;
    if(g===0)rec.again++;
    s.reps++;s.last=now;
    let msg='';
    if(s.status==='new'||s.status==='learning'){
      if(g===0){s.status='learning';s.ivl=0;s.due=now;msg='again in this session';}
      else if(g===1){s.status='review';s.ivl=1;msg='tomorrow';}
      else if(g===2){s.status='review';s.ivl=s.lapses?1:(s.ivl>=1?3:1);msg=s.ivl===1?'tomorrow':'in 3 days';}
      else{s.status='review';s.ivl=4;msg='in 4 days';}
    }else if(s.status==='review'){
      if(g===0){s.lapses++;s.ease=Math.max(1.3,s.ease-0.2);s.status='learning';s.ivl=0;s.due=now;msg='again in this session';}
      else if(g===1){s.ease=Math.max(1.3,s.ease-0.15);s.ivl=Math.max(s.ivl+1,Math.round(s.ivl*1.2));msg=`in ${s.ivl} days`;}
      else if(g===2){s.ivl=Math.max(s.ivl+1,Math.round(s.ivl*s.ease));msg=`in ${s.ivl} days`;}
      else{s.ease=Math.min(3.2,s.ease+0.15);s.ivl=Math.max(s.ivl+2,Math.round(s.ivl*s.ease*1.3));msg=`in ${s.ivl} days`;}
    }else if(s.status==='known'){
      if(g===0){s.lapses++;s.status='learning';s.ease=2.3;s.ivl=0;s.due=now;msg='back to learning';}
      else{s.ivl=Math.min(180,Math.round(s.ivl*(g===3?2.2:g===2?1.8:1.2)));msg=`audit again in ${s.ivl} days`;}
    }
    if(s.status!=='learning')s.due=now+Math.round(this.fuzz(s.ivl)*this.DAY);
    this.save();return msg;
  },
  known(id){const s=this.card(id);s.status='known';s.ease=Math.max(s.ease,2.8);s.ivl=45;s.due=Date.now()+45*this.DAY;s.last=Date.now();this.save();},
  suspend(id,on=true){const s=this.card(id);if(on){s.status='suspended';}else{s.status=s.reps?'review':'new';if(s.reps){s.ivl=Math.max(1,s.ivl);s.due=Date.now();}}this.save();},
  reset(id){delete this.state.cards[id];this.save();},
  resetAll(){this.state={cards:{},settings:this.state.settings,days:{}};this.save();},
  cardsOf(mods){const set=mods&&mods.length?new Set(mods):null;return (window.MEM_CARDS||[]).filter(c=>!set||set.has(c.mod));},
  newAllowance(){return Math.max(0,(this.state.settings.newPerDay||12)-this.dayRec().new);},
  /* stats for a set of modules */
  stats(mods){
    const now=Date.now();const cs=this.cardsOf(mods);const o={total:cs.length,due:0,fresh:0,learning:0,review:0,mastered:0,known:0,suspended:0,forecast:Array(7).fill(0)};
    cs.forEach(c=>{const s=this.peek(c.id);
      if(s.status==='new')o.fresh++;else if(s.status==='suspended')o.suspended++;else if(s.status==='known')o.known++;else if(s.status==='learning')o.learning++;else{o.review++;if(s.ivl>=21)o.mastered++;}
      if(this.isDue(c.id,now))o.due++;
      if(s.status==='review'||s.status==='known'){const d=Math.floor((s.due-now)/this.DAY);if(d>=0&&d<7)o.forecast[d]++;}});
    return o;
  },
  /* the session queue: due cards (shuffled, overdue first), then new cards spread through them */
  buildQueue(mods,{cram=false}={}){
    const cs=this.cardsOf(mods);
    if(cram)return shuffle(cs.map(c=>c.id));
    const now=Date.now();
    const due=cs.filter(c=>this.isDue(c.id,now)).map(c=>c.id);
    const fresh=cs.filter(c=>this.peek(c.id).status==='new').map(c=>c.id).slice(0,this.newAllowance());
    const q=shuffle(due);
    if(fresh.length){const step=Math.max(1,Math.floor((q.length+fresh.length)/fresh.length));fresh.forEach((id,i)=>q.splice(Math.min(q.length,(i+1)*step-1),0,id));}
    return q;
  },
};

/* ============================================================ grading a typed answer for a card */
function memCheck(card,value){
  const v=card.vars||(card.kind==='seq'?['n']:['x']);const o={domain:card.domain};
  switch(card.kind){
    case 'const':return checkExprUpToConstant(value,card.ans,v,o);
    case 'expr':return checkExpr(value,card.ans,v,o);
    case 'seq':return checkExprInt(value,card.ans,v,o);
    case 'number':return checkNumber(value,card.ans,card.tol!=null?{tol:card.tol}:{});
    case 'limit':return checkLimit(value,card.ans,card.tol!=null?{tol:card.tol}:{});
    case 'complex':return checkComplex(value,card.ans,card.tol!=null?{tol:card.tol}:{});
    case 'interval':return checkInterval(value,card.ans);
    case 'list':return checkNumberList(value,card.ans,card.tol!=null?{tol:card.tol}:{});
  }
  return {ok:false,err:'unknown card kind '+card.kind};
}
/* a harness-friendly correct answer string for a card */
function memSolve(card){
  const a=card.ans;
  switch(card.kind){
    case 'const':case 'expr':case 'seq':return typeof a==='string'?a:'';
    case 'number':case 'limit':return String(a);
    case 'complex':return `${a[0]}+(${a[1]})i`;
    case 'interval':return `${a.loIn?'[':'('}${a.lo===-Infinity?'-inf':a.lo},${a.hi===Infinity?'inf':a.hi}${a.hiIn?']':')'}`;
    case 'list':return a.join(', ');
  }
  return '';
}

/* ============================================================ trainer UI */
class MemoryTrainer{
  constructor(mount,{mods,cram=false,onDone}={}){
    this.box=typeof mount==='string'?$(mount):mount;this.mods=mods;this.cram=cram;this.onDone=onDone;
    this.queue=MEM.buildQueue(mods,{cram});this.seen=0;this.log={again:0,hard:0,good:0,easy:0};this.startedAt=Date.now();
    this.box.onkeydown=e=>this.key(e);
    if(typeof window!=='undefined')window.__memTrainer=this;
    this.next();
  }
  byId(id){return (window.MEM_CARDS||[]).find(c=>c.id===id);}
  requeue(id,gap){const at=Math.min(this.queue.length,gap);this.queue.splice(at,0,id);}
  next(){
    if(!this.queue.length){return this.finish();}
    const id=this.queue.shift();const card=this.byId(id);if(!card)return this.next();
    this.card=card;this.phase='ask';this.tried=false;this.shownAt=Date.now();
    const s=MEM.peek(id);const tag=this.cram?'cram':s.status==='new'?'new':s.status==='known'?'audit':s.status==='learning'?'learning':`review · interval ${s.ivl}d`;
    const modTitle=(window.MEM_MODULES||[]).find(m=>m.key===card.mod);
    this.box.innerHTML=`<div class="mem-head"><span class="tag">${tag}</span><span class="muted small">${modTitle?modTitle.title:card.mod}</span><span class="mem-count muted small">${this.seen+1} of ${this.seen+1+this.queue.length}</span></div>
      <div class="mem-prompt">${card.prompt}</div><div class="mem-answer"></div><div class="fb"></div><div class="mem-bar"></div>`;
    const ans=$('.mem-answer',this.box),bar=$('.mem-bar',this.box);
    if(card.kind==='recall'){
      ans.innerHTML=`<textarea class="mem-recall" rows="2" placeholder="Write it from memory (or say it out loud), then reveal"></textarea>`;
      bar.innerHTML=`<button class="btn primary reveal">Reveal</button>`;
      $('.reveal',bar).onclick=()=>this.reveal();
      setTimeout(()=>{const t=$('textarea',ans);if(t)t.focus();},0);
    }else{
      ans.appendChild(ansLine(card.label||'',`a`,{xwide:true,placeholder:card.placeholder||''}));
      bar.innerHTML=`<button class="btn primary check">Check</button><button class="btn show">Show answer</button>`;
      $('.check',bar).onclick=()=>this.check();$('.show',bar).onclick=()=>this.giveUp();
      upgradeMathInputs(ans);setTimeout(()=>focusInput($('input',ans)),0);
    }
    typeset(this.box);
  }
  answerHtml(){const c=this.card;return `<div class="mem-show">${c.show}</div>${c.why?`<div class="mem-why">${c.why}</div>`:''}`;}
  ratingBar(opts){
    const bar=$('.mem-bar',this.box);
    const btn=(cls,label,g,key)=>`<button class="btn ${cls}" data-g="${g}"><span>${label}</span><kbd>${key}</kbd></button>`;
    bar.innerHTML=(opts.again?btn('again','Again',0,'1'):'')+btn('','Hard',1,'2')+btn('primary','Good',2,'3')+btn('','Easy',3,'4')+(opts.known&&!this.cram?`<button class="btn known" title="Stop asking for about 45 days, then audit once">I know this cold</button>`:'');
    $$('button[data-g]',bar).forEach(b=>b.onclick=()=>this.rate(+b.dataset.g));
    const k=$('.known',bar);if(k)k.onclick=()=>{MEM.known(this.card.id);this.log.easy++;this.seen++;this.next();};
  }
  check(){
    if(this.phase!=='ask')return;
    const inp=$('input[data-k=a]',this.box);const r=memCheck(this.card,inp.value);
    gradeInput(inp,r);const fb=$('.fb',this.box);
    if(r.err){fb.className='fb bad';fb.textContent='Could not read your answer: '+r.err;return;}   /* parse problems do not count as an attempt */
    if(r.ok){
      const secs=(Date.now()-this.shownAt)/1000;this.phase='rate';
      fb.className='fb good';fb.innerHTML=`Correct${secs<7?' and fast':''}. Rate how it felt: Hard if you had to reconstruct it, Good if it came with a little thought, Easy if it was instant.`+this.answerHtml();
      this.ratingBar({again:false,known:true});
    }else{
      this.phase='rate';fb.className='fb bad';fb.innerHTML='Not this time. Read the answer, then continue: it will come back later in this session.'+this.answerHtml();
      const bar=$('.mem-bar',this.box);bar.innerHTML=`<button class="btn primary cont">Continue <kbd>Enter</kbd></button>`;$('.cont',bar).onclick=()=>this.rate(0);
    }
    typeset(this.box);
  }
  giveUp(){if(this.phase!=='ask')return;this.phase='rate';const fb=$('.fb',this.box);fb.className='fb';fb.innerHTML='Here it is. It counts as a miss and comes back later in this session.'+this.answerHtml();
    const bar=$('.mem-bar',this.box);bar.innerHTML=`<button class="btn primary cont">Continue <kbd>Enter</kbd></button>`;$('.cont',bar).onclick=()=>this.rate(0);typeset(this.box);}
  reveal(){if(this.phase!=='ask')return;this.phase='rate';const fb=$('.fb',this.box);fb.className='fb';fb.innerHTML='Compare with what you wrote, then rate yourself honestly. Again if you missed any part of it.'+this.answerHtml();this.ratingBar({again:true,known:true});typeset(this.box);}
  rate(g){
    if(this.phase!=='rate')return;
    const id=this.card.id;
    if(!this.cram){MEM.grade(id,g);}
    this.log[['again','hard','good','easy'][g]]++;
    if(g===0)this.requeue(id,4);else if(g===1&&(this.cram||MEM.peek(id).status==='learning'))this.requeue(id,8);
    this.seen++;this.next();
  }
  key(e){
    if(e.key==='Enter'){
      if(this.phase==='ask'){if(e.target.tagName==='INPUT'){e.preventDefault();this.check();}else if(e.target.tagName==='TEXTAREA'&&!e.shiftKey){e.preventDefault();this.reveal();}}
      else if(this.phase==='rate'){e.preventDefault();const c=$('.cont',this.box);if(c)c.click();else this.rate(2);}
    }else if(this.phase==='rate'&&/^[1-4]$/.test(e.key)&&e.target.tagName!=='TEXTAREA'){const b=$(`button[data-g="${+e.key-1}"]`,this.box);if(b){e.preventDefault();b.click();}}
  }
  finish(){
    const n=this.seen;const mins=Math.max(1,Math.round((Date.now()-this.startedAt)/60000));
    this.box.innerHTML=`<div class="result">${n?'Session complete':'Nothing due'}</div>
      ${n?`<p>${n} cards in about ${mins} min. Again ${this.log.again}, Hard ${this.log.hard}, Good ${this.log.good}, Easy ${this.log.easy}.</p>`:'<p>Nothing is due right now for the selected modules. Come back tomorrow, add more new cards per day in settings, or cram a module before an exam.</p>'}
      <div class="controls"><button class="btn primary" id="memAgain">${this.cram?'Cram again':'Check for more'}</button></div>`;
    $('#memAgain').onclick=()=>{if(this.onDone)this.onDone();};
  }
}

if(typeof window!=='undefined'){window.__memSolve=memSolve;window.__memCheck=memCheck;}
