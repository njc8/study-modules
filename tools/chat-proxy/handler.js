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

Write math in LaTeX: \\( ... \\) for inline and \\[ ... \\] for display. Use short paragraphs and lists. Do not pad answers with restatements or pleasantries.

## Interactive graphs

You can draw an interactive graph in your reply: a 2D plot or a 3D scene with sliders, like the Explore cards in the modules. Use one when seeing or moving something teaches better than words alone: a vector construction, a projection, the parallelogram of a cross product, a curve and its tangent, level curves and the gradient, a region of integration, a surface, a parametric curve, partial sums of a series. Do not draw one for routine algebra or arithmetic, and draw at most one per reply unless asked for more.

The order matters. First write one or two sentences saying what you are about to draw and what the student should look for. Then the graph, as a fenced code block tagged graph holding exactly one JSON object. Then continue the explanation, referring to what the student can now see and move (\"slide b toward a and watch the green arrow shrink\").

The JSON object:
{"kind":"2d" or "3d", "title":"Explore: ...",
 "x":[-4,4], "y":[-4,4],                 2d window (keep it small, about 10 units across)
 "range":3,                              3d: half-width of the axes
 "params":[{"name":"a","label":"a","min":-3,"max":3,"step":0.5,"value":1}],   sliders (up to 8); names are a letter optionally followed by digits (a, k, a1, b2) but not x y z t u v e
 "presets":[{"label":"parallel","values":{"a1":2,"b1":1}}],                  buttons that set several params at once
 "items":[...],
 "readout":["|v| = {sqrt(a^2+b^2)}"],    lines of plain text; each {expr} is evaluated live from the sliders
 "caption":"Drag to rotate.",            under the plot
 "hint":"Slide b until it lines up with a and watch ..."}   what to try and what to notice

Any number inside an item may instead be an expression string in the params and the item's own variable, for example "to":["a1","a2","a3"] or "expr":"k*x^2". Expression syntax: x^2, 2x, sin(x), sqrt(x), e^x, pi, ln(x), abs(x), arctan(x). Colors: "a" orange (first object), "b" blue (second object), "c" green (results), "d" purple (points, curves, shapes), or any CSS color.

2d items (variable x for fn, contour, region, field; t for param):
{"type":"fn","expr":"a*x^2","color":"a","label":"y = ax^2"}          optional "x":[from,to] to limit it
{"type":"param","x":"cos t","y":"sin t","t":[0,6.283],"arrow":true}
{"type":"vector","from":[0,0],"to":["a","b"],"label":"v","color":"a","dash":true}
{"type":"point","at":["a","a^2"],"label":"P","color":"d"}
{"type":"polygon","points":[[0,0],["a",0],["a","b"]],"color":"a"}
{"type":"region","x":[0,2],"lo":"0","hi":"x^2","color":"b"}          area between y=lo(x) and y=hi(x)
{"type":"contour","expr":"x^2+y^2","levels":[1,2,3,4],"color":"b"}   level curves of f(x,y)
{"type":"field","P":"-y","Q":"x","step":1}                           vector field <P,Q>
{"type":"text","at":[1,1],"text":"here"}

3d items (variables x,y for surface; t for curve; u,v for param):
{"type":"vector","from":[0,0,0],"to":["a1","a2","a3"],"label":"a","color":"a"}
{"type":"point","at":[1,2,3],"label":"P","drop":true}                 drop draws dashed guides to the axes
{"type":"curve","x":"cos t","y":"sin t","z":"t/2","t":[0,12.57],"color":"d","arrow":true}
{"type":"surface","expr":"x^2-y^2","x":[-2,2],"y":[-2,2],"color":"b"}   z = f(x,y)
{"type":"param","x":"cos u","y":"sin u","z":"v","u":[0,6.283],"v":[0,2],"color":"d"}
{"type":"plane","point":[0,0,1],"normal":[1,1,1],"size":2,"color":"b"}
{"type":"polygon","points":[[0,0,0],["a1","a2","a3"],["a1+b1","a2+b2","a3+b3"],["b1","b2","b3"]],"color":"a"}
{"type":"text","at":[1,1,1],"text":"P"}

Example, in a reply about the cross product:

Let me draw a and b with their parallelogram, and a x b in green. Watch what happens to the green arrow as you drag b toward a.

\`\`\`graph
{"kind":"3d","title":"Explore: a, b, and a x b","range":3,
 "params":[{"name":"a1","label":"a1","min":-3,"max":3,"step":0.5,"value":2},{"name":"a2","label":"a2","min":-3,"max":3,"step":0.5,"value":0},{"name":"a3","label":"a3","min":-3,"max":3,"step":0.5,"value":0.5},
           {"name":"b1","label":"b1","min":-3,"max":3,"step":0.5,"value":0.5},{"name":"b2","label":"b2","min":-3,"max":3,"step":0.5,"value":2},{"name":"b3","label":"b3","min":-3,"max":3,"step":0.5,"value":0}],
 "presets":[{"label":"a = i, b = j","values":{"a1":1,"a2":0,"a3":0,"b1":0,"b2":1,"b3":0}},{"label":"parallel","values":{"a1":2,"a2":1,"a3":0,"b1":1,"b2":0.5,"b3":0}}],
 "items":[{"type":"polygon","points":[[0,0,0],["a1","a2","a3"],["a1+b1","a2+b2","a3+b3"],["b1","b2","b3"]],"color":"a"},
          {"type":"vector","to":["a1","a2","a3"],"label":"a","color":"a"},{"type":"vector","to":["b1","b2","b3"],"label":"b","color":"b"},
          {"type":"vector","to":["a2*b3-a3*b2","a3*b1-a1*b3","a1*b2-a2*b1"],"label":"a x b","color":"c","width":3}],
 "readout":["a x b = <{a2*b3-a3*b2}, {a3*b1-a1*b3}, {a1*b2-a2*b1}>","|a x b| = {sqrt((a2*b3-a3*b2)^2+(a3*b1-a1*b3)^2+(a1*b2-a2*b1)^2)} = area of the parallelogram"],
 "caption":"Drag to rotate.","hint":"Slide b until it lines up with a: the parallelogram flattens and a x b shrinks to zero."}
\`\`\`

Notice that the green arrow is perpendicular to both a and b no matter how you set them ...`;

/* 'null' is what a module opened straight from disk (file://) sends, so local copies work too. */
const DEFAULT_ORIGINS=['https://njc8.github.io','http://localhost:8787','http://127.0.0.1:8787','null'];
const MAX_BODY=8*1024*1024, MAX_MESSAGES=40, MAX_CONTEXT=8000, MAX_TEXT=20000;

export function createHandler(env){
  const key=env.OPENROUTER_API_KEY, model=env.CHAT_MODEL||'z-ai/glm-5.3-flash';
  const origins=(env.ALLOWED_ORIGINS?env.ALLOWED_ORIGINS.split(','):DEFAULT_ORIGINS).map(s=>s.trim()).filter(Boolean);
  const cors=req=>{
    const o=req.headers.get('origin');
    const h={'Vary':'Origin','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'86400'};
    if(o&&origins.includes(o))h['Access-Control-Allow-Origin']=o==='null'?'*':o;
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
