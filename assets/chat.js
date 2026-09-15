/* Tutor chat for the study modules. Loaded automatically by study.js on every module page.

   Talks to the chat proxy in tools/chat-proxy (which holds the OpenRouter key). The student can
   type a question, paste or upload an image, or click "Snip" and drag a rectangle over a screenshot
   of the page; the image goes to the model with the question. The current module and section
   (with the real TeX of every formula on screen) ride along as context.

   The model can answer with an interactive graph: a fenced ```graph block holding a JSON spec
   (documented in tools/chat-proxy/handler.js). While the block streams in, a skeleton card holds its
   place; once it closes, the spec is drawn with the modules' own Plot2D / Scene3D widgets and
   sliders. The spec stays in the message text, so it survives reloads and goes back to the model
   as part of the conversation.

   Endpoint resolution:
     window.STUDY_CHAT_ENDPOINT  if a page sets it,
     /chat                       when served by tools/chat-proxy/server.js on localhost,
     HOSTED_ENDPOINT             the deployed worker URL, for the GitHub Pages site. */
(function(){
if(typeof window==='undefined'||typeof document==='undefined')return;

const HOSTED_ENDPOINT='https://study-chat.njc8-study.workers.dev';   /* the deployed tools/chat-proxy Worker; change after `npx wrangler deploy` prints a new URL */
const MAX_IMAGE_EDGE=1800;  /* screenshots are downscaled to this before upload */
const IMAGES_KEPT=4;        /* only the newest N images are re-sent with each turn */
const ICON={
  chat:'<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z"/></svg>',
  snip:'<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 1.5v10h10"/><path d="M1.5 4.5h10v10"/></svg>',
  image:'<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2.5" width="12" height="11" rx="1.5"/><circle cx="5.5" cy="6" r="1.2"/><path d="M14 10.5l-3.5-3.5-5 5"/></svg>',
  send:'<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V3"/><path d="M4 7l4-4 4 4"/></svg>',
  stop:'<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><rect x="3" y="3" width="10" height="10" rx="1.5"/></svg>',
  close:'<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
  fresh:'<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8a5 5 0 1 1-1.5-3.6"/><path d="M13 2.5v3h-3"/></svg>',
  draw:'<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 13.5l.8-3.2 7.4-7.4 2.4 2.4-7.4 7.4z"/><path d="M9.5 4.1l2.4 2.4"/></svg>',
  eraser:'<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.5l-3.3-3.3a1 1 0 0 1 0-1.4L8.6 2.9a1 1 0 0 1 1.4 0l3.1 3.1a1 1 0 0 1 0 1.4L7 13.5z"/><path d="M4.2 8.4l3.4 3.4"/><path d="M6 13.5h7.5"/></svg>',
  undo:'<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6.5h6.5a3 3 0 0 1 0 6H6"/><path d="M5.5 4L3 6.5 5.5 9"/></svg>',
  trash:'<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5h10M6.5 2.5h3M4.5 4.5l.6 9h5.8l.6-9"/></svg>',
  expand:'<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5L9.5 6.5M2.5 13.5l4-4"/></svg>',
  shrink:'<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 6.5h-4v-4M2.5 9.5h4v4M9.5 6.5l4-4M6.5 9.5l-4 4"/></svg>',
};

/* ------------------------------------------------------------ whiteboard */
const BOARD_W=1600,BOARD_H=1000;   /* drawing space in world units; exported at this size */
const BOARD_COLORS=[['Black','#1c1b1a'],['Red','#dc2626'],['Orange','#ea7a0b'],['Yellow','#eab308'],['Green','#16a34a'],['Blue','#2563eb'],['Purple','#7c3aed']];
/* A small whiteboard with colored pens and an eraser. Strokes live in world units so the
   same drawing renders in the panel, in full screen, and in the exported PNG. */
function makeBoard(root,{onAttach}){
  root.innerHTML=`
    <div class="bar">
      <div class="pens">${BOARD_COLORS.map(([n,c],i)=>`<button type="button" class="pen${i===0?' on':''}" data-color="${c}" title="${n}" aria-label="${n} pen"><i style="background:${c}"></i></button>`).join('')}<button type="button" class="pen tool" data-tool="eraser" title="Eraser" aria-label="Eraser">${ICON.eraser}</button></div>
      <div class="acts">
        <button type="button" class="btn small icon only" data-b="undo" title="Undo last stroke" aria-label="Undo">${ICON.undo}</button>
        <button type="button" class="btn small icon only" data-b="clear" title="Clear the board" aria-label="Clear">${ICON.trash}</button>
        <button type="button" class="btn small icon only" data-b="full" title="Full screen" aria-label="Full screen">${ICON.expand}</button>
        <button type="button" class="btn small icon only" data-b="close" title="Close the board" aria-label="Close">${ICON.close}</button>
      </div>
    </div>
    <div class="stage"><canvas></canvas><button type="button" class="btn small primary icon attach" data-b="attach" title="Attach the drawing to your message" disabled>${ICON.image}<span>Attach drawing</span></button></div>`;
  const stage=root.querySelector('.stage'),canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),attachBtn=root.querySelector('[data-b=attach]'),fullBtn=root.querySelector('[data-b=full]');
  let strokes=[],cur=null,color=BOARD_COLORS[0][1],eraser=false,scale=1;
  const paint=(c,s,k)=>{c.strokeStyle=s.color;c.lineWidth=s.width*k;c.lineCap='round';c.lineJoin='round';c.beginPath();const p=s.points;c.moveTo(p[0][0]*k,p[0][1]*k);if(p.length===1)c.lineTo(p[0][0]*k,p[0][1]*k);for(let i=1;i<p.length;i++)c.lineTo(p[i][0]*k,p[i][1]*k);c.stroke();};
  function redraw(){const dpr=window.devicePixelRatio||1;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width/dpr,canvas.height/dpr);for(const s of strokes)paint(ctx,s,scale);if(cur)paint(ctx,cur,scale);attachBtn.disabled=!strokes.length;}
  function fit(){
    const r=stage.getBoundingClientRect();if(!r.width||!r.height)return;
    const pad=root.classList.contains('full')?24:0;
    scale=Math.min((r.width-pad*2)/BOARD_W,(r.height-pad*2)/BOARD_H);
    const w=Math.round(BOARD_W*scale),h=Math.round(BOARD_H*scale),dpr=window.devicePixelRatio||1;
    canvas.style.width=w+'px';canvas.style.height=h+'px';canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);redraw();
  }
  const pt=e=>{const b=canvas.getBoundingClientRect();return [Math.max(0,Math.min(BOARD_W,(e.clientX-b.left)/scale)),Math.max(0,Math.min(BOARD_H,(e.clientY-b.top)/scale))];};
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);cur={color:eraser?'#fff':color,width:eraser?44:5,points:[pt(e)]};redraw();});
  canvas.addEventListener('pointermove',e=>{if(!cur)return;const p=pt(e);cur.points.push(p);const dpr=window.devicePixelRatio||1;ctx.setTransform(dpr,0,0,dpr,0,0);const n=cur.points.length;paint(ctx,{color:cur.color,width:cur.width,points:cur.points.slice(Math.max(0,n-2))},scale);});
  const end=()=>{if(!cur)return;strokes.push(cur);cur=null;redraw();};
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  root.addEventListener('click',e=>{
    const pen=e.target.closest('.pen');
    if(pen){root.querySelectorAll('.pen').forEach(b=>b.classList.toggle('on',b===pen));eraser=pen.dataset.tool==='eraser';if(!eraser)color=pen.dataset.color;return;}
    const b=e.target.closest('[data-b]');if(!b)return;
    switch(b.dataset.b){
      case 'undo':strokes.pop();redraw();break;
      case 'clear':strokes=[];redraw();break;
      case 'full':setFull(!root.classList.contains('full'));break;
      case 'close':api.hide();break;
      case 'attach':if(!strokes.length)return;onAttach(exportPng());api.hide();break;
    }
  });
  function setFull(on){root.classList.toggle('full',on);fullBtn.innerHTML=on?ICON.shrink:ICON.expand;fullBtn.title=on?'Exit full screen':'Full screen';fit();requestAnimationFrame(fit);}
  function exportPng(){const c=document.createElement('canvas');c.width=BOARD_W;c.height=BOARD_H;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,BOARD_W,BOARD_H);for(const s of strokes)paint(g,s,1);return c.toDataURL('image/png');}
  if(window.ResizeObserver)new ResizeObserver(()=>fit()).observe(stage);else window.addEventListener('resize',fit);
  const api={
    show(){root.hidden=false;fit();requestAnimationFrame(fit);},
    hide(){setFull(false);root.hidden=true;},
    toggle(){root.hidden?api.show():api.hide();},
    get open(){return !root.hidden;},
    get full(){return root.classList.contains('full');},
    exitFull(){setFull(false);},
  };
  return api;
}

function endpoint(){
  if(window.STUDY_CHAT_ENDPOINT)return window.STUDY_CHAT_ENDPOINT;
  const h=location.hostname;
  if(location.protocol==='http:'&&(h==='localhost'||h==='127.0.0.1'))return '/chat';
  return HOSTED_ENDPOINT?HOSTED_ENDPOINT.replace(/\/$/,'')+(HOSTED_ENDPOINT.endsWith('/chat')?'':'/chat'):'';
}

/* ------------------------------------------------------------ page context */
function moduleKey(){
  const k=(typeof Progress!=='undefined'&&Progress.key)?Progress.key.replace(/^sm-progress-/,''):'';
  if(k)return k;
  const m=/([^\/]+)\.html?$/.exec(decodeURIComponent(location.pathname));return m?m[1]:'page';
}
function courseName(){return /\/math102\//.test(location.pathname)?'MATH 102 (Calculus II)':'MATH 212 (Multivariable Calculus)';}
function texMap(){
  const map=new Map();
  try{if(window.MathJax&&MathJax.startup&&MathJax.startup.document)for(const item of MathJax.startup.document.math)if(item.typesetRoot)map.set(item.typesetRoot,item.math);}catch(e){}
  return map;
}
function walk(node,out,map){
  if(node.nodeType===3){out.push(node.nodeValue);return;}
  if(node.nodeType!==1)return;
  const tag=node.tagName.toLowerCase();
  if(tag==='script'||tag==='style'||tag==='svg'||tag==='canvas'||tag==='button')return;
  const cl=node.classList;
  if(cl.contains('pager')||cl.contains('mqf')||cl.contains('mqph')||node.id==='tutor'||cl.contains('tutor-fab'))return;
  if(tag==='mjx-container'){const t=map.get(node);out.push(t?(node.getAttribute('display')==='true'?'\n\\['+t+'\\]\n':' \\('+t+'\\) '):' [formula] ');return;}
  if(tag==='input'||tag==='textarea'){if(node.type==='range'||node.type==='checkbox'||node.type==='radio')return;const v=(node.value||'').trim();out.push(v?' [student typed: '+v+'] ':' [empty answer box] ');return;}
  const block=/^(p|div|li|h[1-6]|tr|br|section|ul|ol|table|pre)$/.test(tag);
  if(block)out.push('\n');
  for(const c of node.childNodes)walk(c,out,map);
  if(block)out.push('\n');
}
function sectionText(sec){
  const out=[];walk(sec,out,texMap());
  return out.join('').replace(/[ \t]+/g,' ').replace(/\s*\n\s*/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
}
function buildContext(){
  const sec=document.querySelector('main > section.active');
  const title=document.title||'';
  let s=`Context for this conversation. Course: ${courseName()}. The student is on the module "${title}"`;
  if(sec){s+=`, in the section "${sec.dataset.title||sec.dataset.id||''}". The text of that section, as the student sees it (formulas in TeX, answer boxes marked), is below. Use it to know what the student is looking at, but only quote it when useful.\n\n---\n`+sectionText(sec).slice(0,6500);}
  return s;
}

/* ------------------------------------------------------------ markdown + math rendering */
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
/* A graph is a fenced block tagged graph, or an untagged / json block whose content is a graph spec. */
const FENCE_RE=/```[ \t]*([\w-]*)[^\n]*\n?([\s\S]*?)```/g;
function isGraphFence(lang,content){return lang==='graph'||((lang===''||lang==='json')&&/^\s*\{/.test(content)&&/"(kind|items|params)"\s*:/.test(content));}
/* streaming: everything before the first graph fence streams as usual; from the moment the fence
   opens, the rest of the reply is held back behind a shimmering skeleton and the whole thing is
   rendered at once when the stream ends. Outside streaming an unclosed graph fence is a cut-off graph. */
function mdToHtml(src,{streaming=false}={}){
  if(streaming){
    const re=/```[ \t]*([\w-]*)[^\n]*\n?/g;let m;
    while((m=re.exec(src))){
      const rest=src.slice(m.index+m[0].length),end=rest.indexOf('```'),content=end<0?rest:rest.slice(0,end);
      if(isGraphFence(m[1],content))return mdToHtml(src.slice(0,m.index))+graphSkeleton(content);
      if(end<0)break;re.lastIndex=m.index+m[0].length+end+3;
    }
  }
  const slots=[];const keep=s=>{slots.push(s);return '\u0000'+(slots.length-1)+'\u0000';};
  let gi=0;
  src=src.replace(FENCE_RE,(m,lang,c)=>keep(isGraphFence(lang,c)?`<div class="graph" data-gi="${gi++}"></div>`:'<pre><code>'+esc(c.replace(/\n$/,''))+'</code></pre>'));
  src=src.replace(/```[ \t]*([\w-]*)[^\n]*\n?([\s\S]*)$/,(m,lang,c)=>isGraphFence(lang,c)?keep('<p class="gcut">The graph was cut off before it finished.</p>'):m);
  src=src.replace(/\\\[([\s\S]*?)\\\]/g,(m,t)=>keep('<div class="tex-d">\\['+esc(t)+'\\]</div>'));
  src=src.replace(/\$\$([\s\S]*?)\$\$/g,(m,t)=>keep('<div class="tex-d">\\['+esc(t)+'\\]</div>'));
  src=src.replace(/\\\(([\s\S]*?)\\\)/g,(m,t)=>keep('\\('+esc(t)+'\\)'));
  src=src.replace(/(^|[^\\$\w])\$(?!\s)([^$\n]+?)(?<!\s)\$(?![\w$])/g,(m,pre,t)=>pre+keep('\\('+esc(t)+'\\)'));
  src=src.replace(/`([^`\n]+)`/g,(m,c)=>keep('<code>'+esc(c)+'</code>'));
  src=esc(src);
  src=src.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*\w])\*(?!\s)([^*\n]+?)(?<!\s)\*(?!\w)/g,'$1<em>$2</em>');
  const lines=src.split('\n');let html='',list=null,para=[],tableRows=[];
  const flushP=()=>{if(para.length){html+='<p>'+para.join(' ')+'</p>';para=[];}};
  const flushL=()=>{if(list){html+='</'+list+'>';list=null;}};
  const flushT=()=>{if(!tableRows.length)return;const rows=tableRows.map(r=>r.slice(1,-1).split('|').map(c=>c.trim()));tableRows=[];
    const sep=rows.length>1&&rows[1].every(c=>/^:?-{2,}:?$/.test(c));const head=sep?rows[0]:null;const body=sep?rows.slice(2):rows;
    html+='<div class="tbl"><table>'+(head?'<thead><tr>'+head.map(c=>'<th>'+c+'</th>').join('')+'</tr></thead>':'')+'<tbody>'+body.map(r=>'<tr>'+r.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';};
  for(const raw of lines){
    const l=raw.replace(/\s+$/,'');const t=l.trim();
    if(tableRows.length&&!/^\|.*\|$/.test(t))flushT();
    if(!t){flushP();flushL();continue;}
    const h=/^(#{1,4})\s+(.*)/.exec(t);const li=/^([-*•]|\d+[.)])\s+(.*)/.exec(t);
    if(h){flushP();flushL();const lvl=Math.min(6,h[1].length+2);html+=`<h${lvl}>${h[2]}</h${lvl}>`;continue;}
    if(li){flushP();const kind=/^\d/.test(li[1])?'ol':'ul';if(list!==kind){flushL();html+='<'+kind+'>';list=kind;}html+='<li>'+li[2]+'</li>';continue;}
    if(list&&/^\s{2,}/.test(l)){html=html.replace(/<\/li>$/,' '+t+'</li>');continue;}
    if(/^\u0000\d+\u0000$/.test(t)&&/^<(pre|div)/.test(slots[+t.slice(1,-1)])){flushP();flushL();html+=t;continue;}
    if(/^---+$/.test(t)){flushP();flushL();html+='<hr>';continue;}
    if(/^\|.*\|$/.test(t)){flushP();flushL();tableRows.push(t);continue;}
    para.push(t);
  }
  flushP();flushL();flushT();
  return html.replace(/\u0000(\d+)\u0000/g,(m,i)=>slots[+i]);
}
function typesetEl(el){if(typeof typeset==='function')return typeset(el);return Promise.resolve();}

/* ------------------------------------------------------------ interactive graphs
   A ```graph block is one JSON object:
     {kind:'2d'|'3d', title, x:[lo,hi], y:[lo,hi] (2d window), range (3d), params:[{name,label,min,max,step,value}],
      presets:[{label,values:{name:value}}], items:[...], readout:[lines with {expr}], caption, hint}
   Any number in an item may be an expression string in the params (and the item's own variable),
   evaluated with the modules' Expr. Items map one-to-one onto Plot2D / Scene3D calls. */
const GCOLOR={a:'#d97706',b:'#2563eb',c:'#16a34a',d:'#7c3aed',e:'#db2777'};
const GBASE={a:'orange',b:'blue',c:'green',d:'purple',e:'pink'};
const gcolor=(c,dflt)=>c==null||c===''?dflt:(GCOLOR[String(c).toLowerCase()]||String(c));
function gfill(c,a){const m=/^#([0-9a-f]{6})$/i.exec(c);if(!m)return c;const n=parseInt(m[1],16);return `rgba(${n>>16},${(n>>8)&255},${n&255},${a})`;}
const gnum=(v,d)=>typeof v==='number'&&Number.isFinite(v)?v:d;
const grange=(r,d)=>Array.isArray(r)&&r.length===2&&r.every(x=>typeof x==='number'&&Number.isFinite(x))&&r[1]>r[0]?r:d;
const gtext=v=>v==null?'':String(v);

function graphSkeleton(partial){
  let title='';const m=/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(partial||'');if(m){try{title=JSON.parse('"'+m[1]+'"');}catch(e){title=m[1];}}
  return `<div class="graph skel"><div class="gh"><strong>${title?esc(title):'Drawing a graph'}</strong><span class="thinking"><i class="pulse"></i><span class="lbl">Drawing</span></span></div><div class="ph stage"></div><div class="ph-row"><i></i><i></i><i></i></div><div class="ph line"></div></div>`;
}
function graphError(msg){const d=document.createElement('div');d.className='graph gerr';d.textContent=msg;return {el:d,draw(){}};}
function makeGraph(json){
  let spec;try{spec=JSON.parse(json);}catch(e){return graphError('The tutor drew a graph that could not be read. Ask it to try again.');}
  try{return buildGraph(spec);}catch(e){console.warn('graph',e);return graphError('The tutor drew a graph that could not be shown. Ask it to try again.');}
}
function buildGraph(spec){
  if(!spec||typeof spec!=='object')throw new Error('bad spec');
  const items=(Array.isArray(spec.items)?spec.items:[]).filter(it=>it&&typeof it==='object'&&typeof it.type==='string').slice(0,40);
  const is3=spec.kind==='3d'||(spec.kind!=='2d'&&items.some(it=>/^(surface|curve|plane)$/.test(it.type)||(Array.isArray(it.to)&&it.to.length===3)||(Array.isArray(it.at)&&it.at.length===3)));
  const params=(Array.isArray(spec.params)?spec.params:[]).filter(p=>p&&typeof p.name==='string'&&/^[a-zA-Z][a-zA-Z0-9]*$/.test(p.name)&&!/^(x|y|z|t|u|v|e|pi)$/.test(p.name)).slice(0,8);
  const names=params.map(p=>p.name);
  /* one shared environment: the params plus whichever local variable an item is sweeping */
  const E={};params.forEach(p=>{E[p.name]=gnum(p.value,0);});
  const compiled=new Map();
  const fnOf=v=>{
    if(typeof v==='number')return ()=>v;
    if(typeof v!=='string')return ()=>NaN;
    let f=compiled.get(v);
    if(!f){try{f=Expr.compile(v,names);}catch(e){f=()=>NaN;}compiled.set(v,f);}
    return f;
  };
  const ev=v=>fnOf(v)(E);
  const vec=(arr,n,dflt)=>{if(!Array.isArray(arr))return dflt;const out=[];for(let i=0;i<n;i++)out.push(ev(arr[i]));return out;};
  const dash=it=>it.dash?(Array.isArray(it.dash)?it.dash:[6,4]):undefined;

  const root=document.createElement('div');root.className='graph gw'+(is3?' three':'');
  root.innerHTML=`<div class="gh"><strong></strong><button type="button" class="btn small icon only" data-g="full" title="Enlarge" aria-label="Enlarge">${ICON.expand}</button></div>
    <div class="gx"><div class="gstage"><canvas class="scene"></canvas><p class="plotcap" hidden></p></div>
    <div class="gside"><div class="sliders" hidden></div><div class="presets" hidden></div><div class="readout" hidden></div><div class="hint" hidden></div></div></div>`;
  root.querySelector('strong').textContent=gtext(spec.title)||(is3?'Explore in 3D':'Explore');
  const canvas=root.querySelector('canvas'),cap=root.querySelector('.plotcap'),sl=root.querySelector('.sliders'),pr=root.querySelector('.presets'),ro=root.querySelector('.readout'),hint=root.querySelector('.hint'),fullBtn=root.querySelector('[data-g=full]');
  if(spec.caption){cap.hidden=false;cap.innerHTML=mdToHtml(gtext(spec.caption));}
  if(spec.hint){hint.hidden=false;hint.innerHTML=mdToHtml(gtext(spec.hint));}
  const readLines=Array.isArray(spec.readout)?spec.readout.filter(l=>typeof l==='string'):(typeof spec.readout==='string'?[spec.readout]:[]);
  if(readLines.length)ro.hidden=false;

  let plot;
  if(is3){
    const range=Math.max(0.5,Math.min(50,gnum(spec.range,3)));
    plot=new Scene3D(canvas,{range,azim:gnum(spec.azim,-55),elev:gnum(spec.elev,24)});
  }else{
    const [xmin,xmax]=grange(spec.x,[-4,4]),[ymin,ymax]=grange(spec.y,[-4,4]);
    plot=new Plot2D(canvas,{xmin,xmax,ymin,ymax});
    canvas.style.aspectRatio=String(Math.max(0.9,Math.min(1.8,(xmax-xmin)/(ymax-ymin))));
  }

  function draw2d(){
    const p=plot,o=p.o;p.begin();
    for(const it of items){
      const col=gcolor(it.color,it.type==='vector'?GCOLOR.a:it.type==='point'?'#1c1b1a':it.type==='field'?'#6b6862':it.type==='text'?'#57534e':'#3b5bdb');
      const width=gnum(it.width,undefined);
      switch(it.type){
        case 'fn':{const f=fnOf(it.expr);const [a,b]=grange(it.x,[o.xmin,o.xmax]);p.fn(x=>{E.x=x;return f(E);},{color:col,width,xmin:a,xmax:b,dash:dash(it)});
          if(it.label){const x=a+(b-a)*0.82;E.x=x;const y=f(E);if(Number.isFinite(y))p.text([x,clamp(y,o.ymin,o.ymax)],gtext(it.label),{color:col,font:'600 13px -apple-system,Segoe UI,sans-serif',dx:4,dy:-6});}break;}
        case 'param':{const fx=fnOf(it.x),fy=fnOf(it.y);const [t0,t1]=grange(it.t,[0,2*Math.PI]);p.param(t=>{E.t=t;return [fx(E),fy(E)];},t0,t1,{color:col,width,dash:dash(it),arrow:!!it.arrow});break;}
        case 'vector':{const from=vec(it.from,2,[0,0]),to=vec(it.to,2,[1,0]);if(from.concat(to).every(Number.isFinite))p.vector(from,to,{color:col,width,label:gtext(it.label)||undefined,dash:dash(it)});break;}
        case 'point':{const at=vec(it.at,2,[0,0]);if(at.every(Number.isFinite))p.point(at,{color:col,label:gtext(it.label)||undefined,ring:!!it.ring,r:gnum(it.r,5)});break;}
        case 'polygon':{const pts=(Array.isArray(it.points)?it.points:[]).map(q=>vec(q,2,[NaN,NaN])).filter(q=>q.every(Number.isFinite));if(pts.length>=2)p.poly(pts,{fill:it.fill===false?null:gfill(col,.15),stroke:col,close:it.close!==false});break;}
        case 'region':{const [a,b]=grange(it.x,[o.xmin,o.xmax]);const lo=fnOf(it.lo==null?0:it.lo),hi=fnOf(it.hi==null?0:it.hi);p.region(a,b,x=>{E.x=x;return lo(E);},x=>{E.x=x;return hi(E);},{fill:gfill(col,.15),stroke:col});break;}
        case 'contour':{const f=fnOf(it.expr);const levels=(Array.isArray(it.levels)?it.levels:[-2,-1,0,1,2]).map(ev).filter(Number.isFinite).slice(0,24);p.contour((x,y)=>{E.x=x;E.y=y;return f(E);},levels,{color:col,width,labels:it.labels!==false});break;}
        case 'field':{const P=fnOf(it.P==null?it.x:it.P),Q=fnOf(it.Q==null?it.y:it.Q);p.field((x,y)=>{E.x=x;E.y=y;return [P(E),Q(E)];},{color:col,step:Math.max(0.1,gnum(it.step,1)),scale:gnum(it.scale,0.35),normalize:!!it.normalize});break;}
        case 'text':{const at=vec(it.at,2,[0,0]);if(at.every(Number.isFinite))p.text(at,gtext(it.text||it.label),{color:col});break;}
      }
    }
  }
  function draw3d(){
    const s=plot;s.clear();
    for(const it of items){
      const col=gcolor(it.color,it.type==='vector'?GCOLOR.a:it.type==='point'?'#1c1b1a':it.type==='curve'||it.type==='polyline'?GCOLOR.d:it.type==='text'?'#57534e':'#3b5bdb');
      const width=gnum(it.width,undefined);
      const base=GBASE[String(it.color||'').toLowerCase()]?SURF[GBASE[String(it.color).toLowerCase()]]:SURF.blue;
      switch(it.type){
        case 'vector':{const from=vec(it.from,3,[0,0,0]),to=vec(it.to,3,[1,0,0]);if(from.concat(to).every(Number.isFinite))s.vector(from,to,{color:col,width,label:gtext(it.label)||undefined,dash:dash(it)});break;}
        case 'point':{const at=vec(it.at,3,[0,0,0]);if(at.every(Number.isFinite))s.point(at,{color:col,label:gtext(it.label)||undefined,drop:!!it.drop,ring:!!it.ring,r:gnum(it.r,5)});break;}
        case 'curve':{const fx=fnOf(it.x),fy=fnOf(it.y),fz=fnOf(it.z);const [t0,t1]=grange(it.t,[0,2*Math.PI]);s.curve(t=>{E.t=t;return [fx(E),fy(E),fz(E)];},t0,t1,{color:col,width,dash:dash(it),arrow:!!it.arrow,n:200});break;}
        case 'polyline':{const pts=(Array.isArray(it.points)?it.points:[]).map(q=>vec(q,3,[NaN,NaN,NaN]));if(pts.length>=2)s.polyline(pts,{color:col,width,dash:dash(it),arrow:!!it.arrow});break;}
        case 'surface':{const f=fnOf(it.expr);const xr=grange(it.x,[-s.o.range,s.o.range]),yr=grange(it.y,[-s.o.range,s.o.range]);s.surface((x,y)=>{E.x=x;E.y=y;return f(E);},xr,yr,{n:Math.max(6,Math.min(40,gnum(it.n,24))),base,alpha:gnum(it.alpha,0.6)});break;}
        case 'param':{const fx=fnOf(it.x),fy=fnOf(it.y),fz=fnOf(it.z);const ur=grange(it.u,[0,2*Math.PI]),vr=grange(it.v,[0,1]);s.param((u,v)=>{E.u=u;E.v=v;return [fx(E),fy(E),fz(E)];},ur,vr,{n:Math.max(6,Math.min(40,gnum(it.n,24))),base,alpha:gnum(it.alpha,0.6)});break;}
        case 'plane':{const pt=vec(it.point,3,[0,0,0]),n=vec(it.normal,3,[0,0,1]);if(pt.concat(n).every(Number.isFinite)&&norm(n)>1e-9)s.plane(pt,n,{size:gnum(it.size,1.6),fill:gfill(col,.16),stroke:col});break;}
        case 'polygon':{const pts=(Array.isArray(it.points)?it.points:[]).map(q=>vec(q,3,[NaN,NaN,NaN])).filter(q=>q.every(Number.isFinite));if(pts.length>=3)s.polygon(pts,{fill:gfill(col,.15),stroke:col});break;}
        case 'text':{const at=vec(it.at,3,[0,0,0]);if(at.every(Number.isFinite))s.text(at,gtext(it.text||it.label),{color:col});break;}
      }
    }
    s.render();
  }
  function readout(){
    if(!readLines.length)return;
    ro.innerHTML=readLines.map(l=>esc(l.replace(/\{([^{}]+)\}/g,(m,x)=>{const v=ev(x);return Number.isFinite(v)?fmtDec(v,3):'undefined';}))).join('<br>');
  }
  let raf=0;
  function draw(){
    if(raf)return;
    raf=requestAnimationFrame(()=>{raf=0;try{if(is3)draw3d();else draw2d();readout();}catch(e){console.warn('graph draw',e);}});
  }
  /* controls */
  const sliders={};
  if(params.length){
    sl.hidden=false;
    for(const p of params){
      const min=gnum(p.min,-5),max=gnum(p.max,5);
      sliders[p.name]=sliderRow(sl,{label:gtext(p.label)||p.name,min:Math.min(min,max),max:Math.max(min,max),step:Math.max(1e-6,gnum(p.step,0.1)),value:E[p.name],onInput:v=>{E[p.name]=v;draw();}});
    }
  }
  const presets=(Array.isArray(spec.presets)?spec.presets:[]).filter(q=>q&&typeof q==='object'&&q.values&&typeof q.values==='object').slice(0,8);
  if(presets.length){
    pr.hidden=false;
    presets.forEach((q,i)=>{const b=el('button',{class:'btn small',type:'button'},esc(gtext(q.label)||('Preset '+(i+1))));
      b.onclick=()=>{for(const [k,v] of Object.entries(q.values)){if(!(k in sliders))continue;const val=typeof v==='number'?v:ev(v);if(!Number.isFinite(val))continue;E[k]=val;sliders[k].set(val);}draw();};pr.appendChild(b);});
  }
  if(window.ResizeObserver)new ResizeObserver(()=>draw()).observe(canvas);
  const setFull=on=>{root.classList.toggle('full',on);fullBtn.innerHTML=on?ICON.shrink:ICON.expand;fullBtn.title=on?'Exit full screen (Esc)':'Enlarge';draw();};
  fullBtn.onclick=()=>setFull(!root.classList.contains('full'));
  const api={el:root,draw,get full(){return root.classList.contains('full');},exitFull(){setFull(false);}};
  graphApi.set(root,api);return api;
}
/* Place each message's graphs into the placeholders that mdToHtml left, reusing widgets already
   built for that message so slider state survives the repaints that streaming causes. */
const graphCache=new WeakMap();
function mountGraphs(body,text,msg){
  const phs=body.querySelectorAll('.graph[data-gi]');if(!phs.length)return;
  let cache=graphCache.get(msg);if(!cache){cache=[];graphCache.set(msg,cache);}
  const specs=[];String(text||'').replace(FENCE_RE,(m,lang,c)=>{if(isGraphFence(lang,c))specs.push(c);});
  phs.forEach(ph=>{const i=+ph.dataset.gi;if(!(i in specs))return;let w=cache[i];if(!w)w=cache[i]=makeGraph(specs[i]);ph.replaceWith(w.el);w.draw();});
}
const graphApi=new WeakMap();   /* widget element -> api, so Esc can find the enlarged one */
function openGraph(){const el=document.querySelector('#tutor .graph.full');return el?graphApi.get(el):null;}

/* ------------------------------------------------------------ images */
function loadImage(src){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=src;});}
async function normalizeImage(src,{photo=false}={}){
  const im=await loadImage(src);
  const scale=Math.min(1,MAX_IMAGE_EDGE/Math.max(im.naturalWidth,im.naturalHeight));
  const c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*scale);c.height=Math.round(im.naturalHeight*scale);
  const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);
  return photo?c.toDataURL('image/jpeg',.88):c.toDataURL('image/png');
}
function fileToDataUrl(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);});}

/* Capture a frame of this tab, then let the student drag a rectangle over the frozen frame. */
async function snipScreen(){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getDisplayMedia)throw new Error('Screen capture is not available in this browser. Paste or upload a screenshot instead.');
  let stream;
  try{
    stream=await navigator.mediaDevices.getDisplayMedia({video:{displaySurface:'browser'},audio:false,preferCurrentTab:true,selfBrowserSurface:'include',surfaceSwitching:'exclude',monitorTypeSurfaces:'include'});
  }catch(e){if(e&&e.name==='NotAllowedError')return null;throw e;}
  try{
    const video=document.createElement('video');video.srcObject=stream;video.muted=true;video.playsInline=true;await video.play();
    await new Promise(r=>{if(video.requestVideoFrameCallback)video.requestVideoFrameCallback(()=>video.requestVideoFrameCallback(()=>r()));else setTimeout(r,350);});
    const c=document.createElement('canvas');c.width=video.videoWidth;c.height=video.videoHeight;c.getContext('2d').drawImage(video,0,0);
    stream.getTracks().forEach(t=>t.stop());stream=null;
    return await cropOverlay(c.toDataURL('image/png'));
  }finally{if(stream)stream.getTracks().forEach(t=>t.stop());}
}
function cropOverlay(dataUrl){
  return new Promise(resolve=>{
    const ov=document.createElement('div');ov.className='tutor-snip';
    ov.innerHTML=`<img alt=""><div class="guide gx"></div><div class="guide gy"></div><div class="sel" hidden><span class="dim"></span></div><div class="tip">${ICON.snip}<span>Drag over the part you want to ask about</span><kbd>Esc</kbd><span class="muted">cancels</span></div>`;
    const img=ov.querySelector('img'),sel=ov.querySelector('.sel'),dim=ov.querySelector('.dim'),gx=ov.querySelector('.gx'),gy=ov.querySelector('.gy');img.src=dataUrl;
    document.body.appendChild(ov);
    let start=null,rect=null;
    const box=()=>img.getBoundingClientRect();
    const clampPt=e=>{const b=box();return {x:Math.min(Math.max(e.clientX,b.left),b.right),y:Math.min(Math.max(e.clientY,b.top),b.bottom)};};
    const guides=p=>{gx.style.transform=`translateX(${p.x}px)`;gy.style.transform=`translateY(${p.y}px)`;};
    const draw=()=>{if(!rect)return;sel.hidden=false;sel.style.left=rect.x+'px';sel.style.top=rect.y+'px';sel.style.width=rect.w+'px';sel.style.height=rect.h+'px';
      const b=box();const sx=img.naturalWidth/b.width;dim.textContent=Math.round(rect.w*sx)+' × '+Math.round(rect.h*sx);dim.classList.toggle('below',rect.y<40);};
    const finish=async ok=>{
      document.removeEventListener('keydown',onKey);
      let out=null;
      if(ok&&rect&&rect.w>6&&rect.h>6){
        const b=box();const sx=img.naturalWidth/b.width,sy=img.naturalHeight/b.height;
        const c=document.createElement('canvas');c.width=Math.round(rect.w*sx);c.height=Math.round(rect.h*sy);
        c.getContext('2d').drawImage(img,(rect.x-b.left)*sx,(rect.y-b.top)*sy,c.width,c.height,0,0,c.width,c.height);
        out=c.toDataURL('image/png');
      }
      ov.remove();resolve(out);
    };
    const onKey=e=>{if(e.key==='Escape'){e.preventDefault();finish(false);}};
    document.addEventListener('keydown',onKey);
    ov.addEventListener('pointerdown',e=>{if(e.button!==0){finish(false);return;}e.preventDefault();ov.setPointerCapture(e.pointerId);start=clampPt(e);rect={x:start.x,y:start.y,w:0,h:0};ov.classList.add('dragging');draw();});
    ov.addEventListener('pointermove',e=>{const p=clampPt(e);guides(p);if(!start)return;rect={x:Math.min(start.x,p.x),y:Math.min(start.y,p.y),w:Math.abs(p.x-start.x),h:Math.abs(p.y-start.y)};draw();});
    ov.addEventListener('contextmenu',e=>e.preventDefault());
    ov.addEventListener('pointerup',e=>{if(!start)return;start=null;finish(true);});
    ov.addEventListener('pointercancel',()=>finish(false));
  });
}

/* ------------------------------------------------------------ the panel */
function build(){
  const key=moduleKey();const storeKey='sm-chat-'+key;
  let history=[];try{history=JSON.parse(sessionStorage.getItem(storeKey)||'[]');}catch(e){history=[];}
  let pending=null;   /* attached image data URL waiting to be sent */
  let busy=null;      /* AbortController while a reply streams */
  const canSnip=!!(navigator.mediaDevices&&navigator.mediaDevices.getDisplayMedia);

  const fab=document.createElement('button');fab.className='tutor-fab';fab.type='button';fab.innerHTML=ICON.chat+'<span>Ask the tutor</span>';
  const panel=document.createElement('aside');panel.id='tutor';panel.hidden=true;
  panel.innerHTML=`
    <div class="head">
      <div class="ttl"><strong>Tutor</strong><span class="ctx"></span></div>
      <div class="acts"><button type="button" class="btn small icon" data-act="new" title="Start a new conversation">${ICON.fresh}<span>New chat</span></button><button type="button" class="btn small icon only" data-act="close" title="Close (Esc)" aria-label="Close">${ICON.close}</button></div>
    </div>
    <div class="msgs"></div>
    <div class="compose">
      <div class="board" hidden></div>
      <div class="attach" hidden><img alt="attached screenshot"><div class="meta"><strong></strong><span>Sent with your next message</span></div><button type="button" class="x" title="Remove image" aria-label="Remove image">${ICON.close}</button></div>
      <div class="notice" hidden></div>
      <textarea rows="1" placeholder="Ask about this section, a problem, or your work…"></textarea>
      <div class="tools">
        ${canSnip?`<button type="button" class="btn small icon" data-act="snip" title="Screenshot part of this page and attach it">${ICON.snip}<span>Snip</span></button>`:''}
        <button type="button" class="btn small icon" data-act="upload" title="Attach an image from your device">${ICON.image}<span>Image</span></button>
        <button type="button" class="btn small icon" data-act="draw" title="Draw something for the tutor">${ICON.draw}<span>Draw</span></button>
        <input type="file" accept="image/*" hidden>
        <span class="spacer"></span>
        <button type="button" class="btn small icon" data-act="stop" hidden>${ICON.stop}<span>Stop</span></button>
        <button type="button" class="btn small primary icon" data-act="send" title="Send (Enter)">${ICON.send}<span>Send</span></button>
      </div>
    </div>`;
  document.body.appendChild(fab);document.body.appendChild(panel);
  const q=s=>panel.querySelector(s);
  const msgs=q('.msgs'),ta=q('textarea'),attach=q('.attach'),notice=q('.notice'),file=q('input[type=file]'),stopBtn=q('[data-act=stop]'),sendBtn=q('[data-act=send]');
  const board=makeBoard(q('.board'),{onAttach:url=>{setPending(url,'Drawing attached');}});

  const save=()=>{try{sessionStorage.setItem(storeKey,JSON.stringify(history));}catch(e){try{sessionStorage.setItem(storeKey,JSON.stringify(history.map(m=>({...m,image:undefined}))));}catch(e2){}}};
  const setNotice=t=>{notice.hidden=!t;notice.textContent=t||'';};
  const updateCtx=()=>{const sec=document.querySelector('main > section.active');q('.ctx').textContent=sec?(sec.dataset.title||''):'';};
  const scroll=()=>{msgs.scrollTop=msgs.scrollHeight;};

  function addMsg(m){
    const d=document.createElement('div');d.className='m '+m.role;
    if(m.image){const im=document.createElement('img');im.src=m.image;im.alt='attached screenshot';im.className='shot';d.appendChild(im);}
    const b=document.createElement('div');b.className='body';d.appendChild(b);
    if(m.role==='user'){b.textContent=m.text;}
    else{renderReply(b,m);typesetEl(b);}
    msgs.appendChild(d);scroll();return b;
  }
  /* an assistant bubble: the thought note, the markdown, and any graphs mounted into place */
  function renderReply(b,m,{streaming=false,extra=''}={}){
    b.innerHTML=thoughtNote(m.thinkMs)+mdToHtml(m.text||'',{streaming})+extra;
    mountGraphs(b,m.text,m);
  }
  function renderAll(){
    msgs.innerHTML='';
    if(!history.length){const w=document.createElement('div');w.className='welcome';w.innerHTML='<p>Ask about the lesson you are on, a practice problem, or paste your own work. I can see the current section.</p><p class="hint">'+(canSnip?'Snip a region of the page, or paste a screenshot, to ask about exactly what you are looking at.':'Paste or upload a screenshot to ask about exactly what you are looking at.')+'</p>';msgs.appendChild(w);}
    history.forEach(addMsg);
  }
  /* the model's hidden reasoning: a live one-line glimpse while it thinks, then a small note */
  const thoughtNote=ms=>ms?`<div class="thought">Thought for ${Math.max(1,Math.round(ms/1000))} s</div>`:'';
  const thinkingLine=text=>`<div class="thinking"><i class="pulse"></i><span class="lbl">Thinking</span><span class="peek"><span>${esc(text.replace(/\s+/g,' ').slice(-200))}</span></span></div>`;
  function setPending(url,label){pending=url;attach.hidden=!url;if(url){attach.querySelector('img').src=url;attach.querySelector('strong').textContent=label||'Image attached';}ta.focus();if(url)ta.placeholder='Ask about the screenshot, or press Enter to send it as is';else ta.placeholder='Ask about this section, a problem, or your work…';}
  function open(){panel.hidden=false;fab.hidden=true;updateCtx();scroll();ta.focus();}
  function close(){panel.hidden=true;fab.hidden=false;}

  function apiMessages(){
    const recent=history.slice(-24);let imgs=0;
    for(let i=recent.length-1;i>=0;i--)if(recent[i].image)imgs++;
    let seen=0;
    return recent.map((m,i)=>{
      if(m.role==='assistant')return {role:'assistant',content:m.text||''};
      if(!m.image)return {role:'user',content:m.text};
      const idx=++seen;const keepImg=imgs-idx<IMAGES_KEPT;
      return keepImg?{role:'user',content:[{type:'text',text:m.text},{type:'image_url',image_url:{url:m.image}}]}:{role:'user',content:m.text+'\n[screenshot omitted from history]'};
    });
  }

  async function send(){
    if(busy)return;
    const text=ta.value.trim();const image=pending;
    if(!text&&!image)return;
    const url=endpoint();
    if(!url){setNotice('The tutor is not connected on this copy of the site yet. Run `node tools/chat-proxy/server.js` locally, or deploy tools/chat-proxy and set HOSTED_ENDPOINT in assets/chat.js.');return;}
    setNotice('');
    const userMsg={role:'user',text:text||'Here is a screenshot from the module. Help me with what is shown.',image:image||undefined};
    history.push(userMsg);save();
    if(!history.length||msgs.querySelector('.welcome'))msgs.innerHTML='';
    addMsg(userMsg);ta.value='';autosize();setPending(null);
    const reply={role:'assistant',text:''};let reason='',thinkStart=0;
    const body=addMsg(reply);body.innerHTML=thinkingLine('');
    busy=new AbortController();stopBtn.hidden=false;sendBtn.disabled=true;
    let raf=0;const paint=()=>{raf=0;if(reply.text)renderReply(body,reply,{streaming:true});else body.innerHTML=thinkingLine(reason);scroll();};
    try{
      const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:apiMessages(),context:buildContext()}),signal:busy.signal});
      if(!res.ok){let msg='The tutor is unavailable right now ('+res.status+').';try{const j=await res.json();if(j.error)msg=j.error;}catch(e){}throw new Error(msg);}
      const reader=res.body.getReader();const dec=new TextDecoder();let buf='';
      while(true){
        const {value,done}=await reader.read();if(done)break;
        buf+=dec.decode(value,{stream:true});let i;
        while((i=buf.indexOf('\n'))>=0){
          const line=buf.slice(0,i).trim();buf=buf.slice(i+1);
          if(!line.startsWith('data:'))continue;
          const data=line.slice(5).trim();if(data==='[DONE]')continue;
          let j;try{j=JSON.parse(data);}catch(e){continue;}
          if(j.error)throw new Error(j.error.message||'The model returned an error.');
          const d=j.choices&&j.choices[0]&&j.choices[0].delta;if(!d)continue;
          if(typeof d.reasoning==='string'&&d.reasoning){reason+=d.reasoning;if(!thinkStart)thinkStart=Date.now();if(!reply.text&&!raf)raf=requestAnimationFrame(paint);}
          if(!d.content)continue;
          if(!reply.text){if(thinkStart)reply.thinkMs=Date.now()-thinkStart;body.classList.add('streaming');}
          reply.text+=d.content;if(!raf)raf=requestAnimationFrame(paint);
        }
      }
      if(raf)cancelAnimationFrame(raf);
      if(!reply.text.trim())reply.text='(The model returned an empty reply. Try asking again.)';
      renderReply(body,reply);await typesetEl(body);
    }catch(e){
      if(raf)cancelAnimationFrame(raf);
      if(e.name==='AbortError'){if(!reply.text.trim())reply.text='(stopped)';renderReply(body,reply);typesetEl(body);}
      else{reply.text=reply.text||'';renderReply(body,reply,{extra:'<p class="err">'+esc(e.message||String(e))+'</p>'});}
    }finally{
      body.classList.remove('streaming');history.push(reply);save();busy=null;stopBtn.hidden=true;sendBtn.disabled=false;scroll();
    }
  }

  async function takeImage(getter,label,chip){
    setNotice('');
    try{const url=await getter();if(url)setPending(url,chip);}
    catch(e){setNotice(e.message||('Could not '+label+'.'));}
  }
  function autosize(){ta.style.height='auto';ta.style.height=Math.min(160,ta.scrollHeight)+'px';}

  panel.addEventListener('click',async e=>{
    const b=e.target.closest('[data-act]');if(!b)return;
    switch(b.dataset.act){
      case 'close':close();break;
      case 'new':if(busy)busy.abort();history=[];save();renderAll();setPending(null);setNotice('');break;
      case 'send':send();break;
      case 'stop':if(busy)busy.abort();break;
      case 'upload':file.click();break;
      case 'draw':board.toggle();break;
      case 'snip':close();fab.hidden=true;try{await takeImage(async()=>{const shot=await snipScreen();return shot?normalizeImage(shot):null;},'capture the screen','Screenshot attached');}finally{open();}break;
    }
  });
  attach.querySelector('.x').onclick=()=>setPending(null);
  file.onchange=async()=>{const f=file.files[0];file.value='';if(f)takeImage(async()=>normalizeImage(await fileToDataUrl(f),{photo:/jpe?g/i.test(f.type)}),'read that image','Image attached');};
  ta.addEventListener('paste',e=>{const f=[...(e.clipboardData&&e.clipboardData.files||[])].find(x=>x.type.startsWith('image/'));if(f){e.preventDefault();takeImage(async()=>normalizeImage(await fileToDataUrl(f),{photo:/jpe?g/i.test(f.type)}),'read the pasted image','Pasted image attached');}});
  ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});
  ta.addEventListener('input',autosize);
  fab.onclick=open;
  document.addEventListener('keydown',e=>{if(e.key!=='Escape'||panel.hidden||document.querySelector('.tutor-snip'))return;const g=openGraph();if(g)g.exitFull();else if(board.full)board.exitFull();else if(board.open)board.hide();else close();});
  if(typeof onShow==='function')onShow('*',updateCtx);
  renderAll();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
