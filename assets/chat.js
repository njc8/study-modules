/* Tutor chat for the study modules. Loaded automatically by study.js on every module page.

   Talks to the chat proxy in tools/chat-proxy (which holds the OpenRouter key). The student can
   type a question, paste or upload an image, or click "Snip" and drag a rectangle over a screenshot
   of the page; the image goes to the model with the question. The current module and section
   (with the real TeX of every formula on screen) ride along as context.

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
};

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
function mdToHtml(src){
  const slots=[];const keep=s=>{slots.push(s);return '\u0000'+(slots.length-1)+'\u0000';};
  src=src.replace(/```[\w-]*\n?([\s\S]*?)```/g,(m,c)=>keep('<pre><code>'+esc(c.replace(/\n$/,''))+'</code></pre>'));
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
      <div class="attach" hidden><img alt="attached screenshot"><div class="meta"><strong></strong><span>Sent with your next message</span></div><button type="button" class="x" title="Remove image" aria-label="Remove image">${ICON.close}</button></div>
      <div class="notice" hidden></div>
      <textarea rows="1" placeholder="Ask about this section, a problem, or your work…"></textarea>
      <div class="tools">
        ${canSnip?`<button type="button" class="btn small icon" data-act="snip" title="Screenshot part of this page and attach it">${ICON.snip}<span>Snip</span></button>`:''}
        <button type="button" class="btn small icon" data-act="upload" title="Attach an image from your device">${ICON.image}<span>Image</span></button>
        <input type="file" accept="image/*" hidden>
        <span class="spacer"></span>
        <button type="button" class="btn small icon" data-act="stop" hidden>${ICON.stop}<span>Stop</span></button>
        <button type="button" class="btn small primary icon" data-act="send" title="Send (Enter)">${ICON.send}<span>Send</span></button>
      </div>
    </div>`;
  document.body.appendChild(fab);document.body.appendChild(panel);
  const q=s=>panel.querySelector(s);
  const msgs=q('.msgs'),ta=q('textarea'),attach=q('.attach'),notice=q('.notice'),file=q('input[type=file]'),stopBtn=q('[data-act=stop]'),sendBtn=q('[data-act=send]');

  const save=()=>{try{sessionStorage.setItem(storeKey,JSON.stringify(history));}catch(e){try{sessionStorage.setItem(storeKey,JSON.stringify(history.map(m=>({...m,image:undefined}))));}catch(e2){}}};
  const setNotice=t=>{notice.hidden=!t;notice.textContent=t||'';};
  const updateCtx=()=>{const sec=document.querySelector('main > section.active');q('.ctx').textContent=sec?(sec.dataset.title||''):'';};
  const scroll=()=>{msgs.scrollTop=msgs.scrollHeight;};

  function addMsg(m){
    const d=document.createElement('div');d.className='m '+m.role;
    if(m.image){const im=document.createElement('img');im.src=m.image;im.alt='attached screenshot';im.className='shot';d.appendChild(im);}
    const b=document.createElement('div');b.className='body';d.appendChild(b);
    if(m.role==='user'){b.textContent=m.text;}
    else{b.innerHTML=mdToHtml(m.text||'');typesetEl(b);}
    msgs.appendChild(d);scroll();return b;
  }
  function renderAll(){
    msgs.innerHTML='';
    if(!history.length){const w=document.createElement('div');w.className='welcome';w.innerHTML='<p>Ask about the lesson you are on, a practice problem, or paste your own work. I can see the current section.</p><p class="hint">'+(canSnip?'Snip a region of the page, or paste a screenshot, to ask about exactly what you are looking at.':'Paste or upload a screenshot to ask about exactly what you are looking at.')+'</p>';msgs.appendChild(w);}
    history.forEach(addMsg);
  }
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
    const reply={role:'assistant',text:''};
    const body=addMsg(reply);body.classList.add('streaming');body.innerHTML='<span class="thinking">Thinking…</span>';
    busy=new AbortController();stopBtn.hidden=false;sendBtn.disabled=true;
    let raf=0;const paint=()=>{raf=0;body.innerHTML=mdToHtml(reply.text);scroll();};
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
          const d=j.choices&&j.choices[0]&&j.choices[0].delta;if(!d||!d.content)continue;
          reply.text+=d.content;if(!raf)raf=requestAnimationFrame(paint);
        }
      }
      if(raf)cancelAnimationFrame(raf);
      if(!reply.text.trim())reply.text='(The model returned an empty reply. Try asking again.)';
      body.innerHTML=mdToHtml(reply.text);await typesetEl(body);
    }catch(e){
      if(raf)cancelAnimationFrame(raf);
      if(e.name==='AbortError'){if(!reply.text.trim())reply.text='(stopped)';body.innerHTML=mdToHtml(reply.text);typesetEl(body);}
      else{reply.text=reply.text||'';body.innerHTML=mdToHtml(reply.text)+'<p class="err">'+esc(e.message||String(e))+'</p>';}
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
      case 'snip':close();fab.hidden=true;try{await takeImage(async()=>{const shot=await snipScreen();return shot?normalizeImage(shot):null;},'capture the screen','Screenshot attached');}finally{open();}break;
    }
  });
  attach.querySelector('.x').onclick=()=>setPending(null);
  file.onchange=async()=>{const f=file.files[0];file.value='';if(f)takeImage(async()=>normalizeImage(await fileToDataUrl(f),{photo:/jpe?g/i.test(f.type)}),'read that image','Image attached');};
  ta.addEventListener('paste',e=>{const f=[...(e.clipboardData&&e.clipboardData.files||[])].find(x=>x.type.startsWith('image/'));if(f){e.preventDefault();takeImage(async()=>normalizeImage(await fileToDataUrl(f),{photo:/jpe?g/i.test(f.type)}),'read the pasted image','Pasted image attached');}});
  ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});
  ta.addEventListener('input',autosize);
  fab.onclick=open;
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden&&!document.querySelector('.tutor-snip'))close();});
  if(typeof onShow==='function')onShow('*',updateCtx);
  renderAll();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
