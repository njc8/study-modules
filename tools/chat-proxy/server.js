/* Local dev server: serves the study modules from the repo root AND the /chat proxy on one origin,
   so the tutor chat and the screenshot snip work at http://localhost:8787 exactly as they do on the
   hosted site. Reads .env from the repo root.
     node tools/chat-proxy/server.js            (port 8787, or PORT=...) */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHandler} from './handler.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const env={...readEnv(path.join(root,'.env')),...process.env};
const handle=createHandler(env);
const PORT=Number(env.PORT||8787);
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2','.md':'text/markdown; charset=utf-8','.txt':'text/plain; charset=utf-8'};

function readEnv(file){
  if(!fs.existsSync(file))return {};
  return Object.fromEntries(fs.readFileSync(file,'utf8').split('\n')
    .filter(l=>l.includes('=')&&!l.trim().startsWith('#'))
    .map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()];}));
}

http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://'+(req.headers.host||'localhost'));
  if(url.pathname==='/chat'){
    const chunks=[];for await(const c of req)chunks.push(c);
    const headers=new Headers();for(const [k,v] of Object.entries(req.headers))if(typeof v==='string')headers.set(k,v);
    const request=new Request(url,{method:req.method,headers,body:req.method==='GET'||req.method==='HEAD'||req.method==='OPTIONS'?undefined:Buffer.concat(chunks)});
    const response=await handle(request);
    res.writeHead(response.status,Object.fromEntries(response.headers));
    if(response.body)for await(const chunk of response.body)res.write(chunk);
    res.end();return;
  }
  /* static files */
  let p=decodeURIComponent(url.pathname);if(p.endsWith('/'))p+='index.html';
  const file=path.normalize(path.join(root,p));
  if(!file.startsWith(root)||/[\/\\]\.(env|git)/.test(file)){res.writeHead(403);res.end('forbidden');return;}
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404);res.end('not found');return;}
    res.writeHead(200,{'Content-Type':MIME[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
    res.end(data);
  });
}).listen(PORT,()=>{
  console.log(`Study modules + tutor chat at http://localhost:${PORT}/  (model: ${env.CHAT_MODEL||'z-ai/glm-5.3-flash'}, key ${env.OPENROUTER_API_KEY?'loaded':'MISSING'})`);
});
