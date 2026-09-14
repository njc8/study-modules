/* Tutor chat proxy: one request handler shared by the local Node server (server.js) and the
   Cloudflare Worker (worker.js). Web-standard Request in, Response out.

   POST /chat   body {messages:[{role, content}], context?: string}  ->  SSE stream from OpenRouter
   GET  /chat   -> {ok:true, model}

   The browser never sees the API key. The model, key, and allowed origins come from env:
     OPENROUTER_API_KEY   required
     CHAT_MODEL           OpenRouter model id, e.g. z-ai/glm-5.3-flash
     CHAT_REASONING       optional reasoning effort: low | medium | high
     ALLOWED_ORIGINS      comma-separated page origins allowed to call this (default: the GitHub Pages site + localhost) */

export const SYSTEM_PROMPT=`You are a patient, precise tutor for MATH 212 (Multivariable Calculus, Stewart chapters 12 to 16) and MATH 102 (Calculus II) at Rice University. The student is working through interactive study modules and may ask about the lesson, a practice problem, or their own work.

Teach, do not just answer. For every problem: name the idea or theorem being used, show the key steps with brief reasons, point out the mistake students usually make there, and check the final result (units, sign, a sanity check, or a second method) when that is cheap. If the student asks for a hint, give the next step only and stop. If the student shares their own work, find the specific error and explain why it is an error before giving the fix. If the student shares a screenshot, read it carefully and respond to what is actually shown.

Write math in LaTeX: \\( ... \\) for inline and \\[ ... \\] for display. Use short paragraphs and lists. Do not pad answers with restatements or pleasantries.`;

const DEFAULT_ORIGINS=['https://njc8.github.io','http://localhost:8787','http://127.0.0.1:8787'];
const MAX_BODY=8*1024*1024, MAX_MESSAGES=40, MAX_CONTEXT=8000, MAX_TEXT=20000;

export function createHandler(env){
  const key=env.OPENROUTER_API_KEY, model=env.CHAT_MODEL||'z-ai/glm-5.3-flash';
  const origins=(env.ALLOWED_ORIGINS?env.ALLOWED_ORIGINS.split(','):DEFAULT_ORIGINS).map(s=>s.trim()).filter(Boolean);
  const cors=req=>{
    const o=req.headers.get('origin');
    const h={'Vary':'Origin','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'86400'};
    if(o&&origins.includes(o))h['Access-Control-Allow-Origin']=o;
    return h;
  };
  const json=(req,status,obj)=>new Response(JSON.stringify(obj),{status,headers:{'Content-Type':'application/json',...cors(req)}});

  return async function handle(req){
    const url=new URL(req.url);
    if(url.pathname!=='/chat')return new Response('Not found',{status:404});
    if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(req)});
    if(req.method==='GET')return json(req,200,{ok:!!key,model});
    if(req.method!=='POST')return json(req,405,{error:'POST only'});
    if(!key)return json(req,500,{error:'The proxy has no OPENROUTER_API_KEY set.'});
    const origin=req.headers.get('origin');
    if(origin&&!origins.includes(origin))return json(req,403,{error:'Origin not allowed: '+origin});
    const len=Number(req.headers.get('content-length')||0);
    if(len>MAX_BODY)return json(req,413,{error:'Request too large. Send a smaller image.'});

    let body;
    try{body=await req.json();}catch(e){return json(req,400,{error:'Body must be JSON.'});}
    const messages=sanitizeMessages(body.messages);
    if(!messages)return json(req,400,{error:'messages must be a non-empty array of {role, content}.'});
    const context=typeof body.context==='string'?body.context.slice(0,MAX_CONTEXT):'';
    const system=context?SYSTEM_PROMPT+'\n\n'+context:SYSTEM_PROMPT;

    const payload={model,stream:true,max_tokens:8000,messages:[{role:'system',content:system},...messages]};
    if(env.CHAT_REASONING)payload.reasoning={effort:env.CHAT_REASONING};

    let upstream;
    try{
      upstream=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',
        headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json','HTTP-Referer':'https://njc8.github.io/study-modules/','X-Title':'Custom Study Modules'},
        body:JSON.stringify(payload)});
    }catch(e){return json(req,502,{error:'Could not reach OpenRouter: '+e.message});}
    if(!upstream.ok){
      let msg='OpenRouter returned '+upstream.status;
      try{const j=await upstream.json();msg=(j.error&&j.error.message)||msg;}catch(e){}
      return json(req,upstream.status===429?429:502,{error:msg});
    }
    return new Response(upstream.body,{status:200,headers:{'Content-Type':'text/event-stream','Cache-Control':'no-cache','X-Accel-Buffering':'no',...cors(req)}});
  };
}

/* Keep only the shapes we forward: user/assistant roles, text or text+image_url parts. */
function sanitizeMessages(list){
  if(!Array.isArray(list)||!list.length||list.length>MAX_MESSAGES)return null;
  const out=[];
  for(const m of list){
    if(!m||(m.role!=='user'&&m.role!=='assistant'))return null;
    if(typeof m.content==='string'){out.push({role:m.role,content:m.content.slice(0,MAX_TEXT)});continue;}
    if(!Array.isArray(m.content))return null;
    const parts=[];
    for(const p of m.content){
      if(!p)return null;
      if(p.type==='text'&&typeof p.text==='string')parts.push({type:'text',text:p.text.slice(0,MAX_TEXT)});
      else if(p.type==='image_url'&&p.image_url&&typeof p.image_url.url==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(p.image_url.url))parts.push({type:'image_url',image_url:{url:p.image_url.url}});
      else return null;
    }
    if(!parts.length)return null;
    out.push({role:m.role,content:parts});
  }
  return out;
}
