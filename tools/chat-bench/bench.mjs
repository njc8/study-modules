/* Benchmark a chat model on MATH 212 questions through OpenRouter.
   Usage: node tools/chat-bench/bench.mjs <out.md> [model]
   Reads OPENROUTER_API_KEY and CHAT_MODEL from the repo's .env. Sends each question in
   questions.json with the same tutor system prompt the proxy uses, then problem.png as a
   vision test. Writes a markdown report you grade by hand: correctness AND teaching quality.
   Past reports live in reports/. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {SYSTEM_PROMPT} from '../chat-proxy/handler.js';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(__dirname,'../..');
const env=Object.fromEntries(fs.readFileSync(path.join(root,'.env'),'utf8').split('\n')
  .filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const KEY=env.OPENROUTER_API_KEY, MODEL=process.argv[3]||env.CHAT_MODEL, OUT=process.argv[2]||'bench-report.md';
const questions=JSON.parse(fs.readFileSync(path.join(__dirname,'questions.json'),'utf8'));
async function ask(messages){
  const t=Date.now();
  const r=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',
    headers:{Authorization:'Bearer '+KEY,'Content-Type':'application/json','HTTP-Referer':'https://njc8.github.io/study-modules/','X-Title':'Study Modules bench'},
    body:JSON.stringify({model:MODEL,messages:[{role:'system',content:SYSTEM_PROMPT},...messages],max_tokens:8000})});
  const j=await r.json();const ms=Date.now()-t;
  if(!r.ok||j.error)return {error:JSON.stringify(j.error||j),ms};
  const m=j.choices[0].message;
  return {text:m.content,reasoning:m.reasoning?String(m.reasoning).length:0,usage:j.usage,ms,finish:j.choices[0].finish_reason};
}
(async()=>{
  let md=`# Bench: ${MODEL}\n\n`;
  const img=path.join(__dirname,'problem.png');
  const items=questions.slice();
  if(fs.existsSync(img))items.push({id:'vision',type:'vision',prompt:'[image] What problem is shown in this screenshot? Solve it and explain each step.',expected:'f=x^2+y^2-2x on disk x^2+y^2<=4: interior critical point (1,0) value -1 (min); boundary via x=2cos t: max 8 at (-2,0)',
    content:[{type:'text',text:'What problem is shown in this screenshot? Solve it and explain each step.'},{type:'image_url',image_url:{url:'data:image/png;base64,'+fs.readFileSync(img).toString('base64')}}]});
  for(const q of items){
    process.stderr.write(`${q.id}... `);
    const res=await ask([{role:'user',content:q.content||q.prompt}]);
    process.stderr.write(res.error?`ERROR ${res.error.slice(0,120)}\n`:`${res.ms}ms, ${res.usage&&res.usage.completion_tokens} tokens, finish=${res.finish}\n`);
    md+=`\n---\n\n## ${q.id} (${q.type})\n\n**Prompt:** ${q.prompt}\n\n**Expected:** ${q.expected}\n\n**Meta:** ${res.ms} ms, usage ${JSON.stringify(res.usage||{})}, reasoning chars ${res.reasoning||0}, finish ${res.finish||''}\n\n**Response:**\n\n${res.error?'ERROR: '+res.error:res.text}\n`;
    fs.writeFileSync(OUT,md);
    await new Promise(r=>setTimeout(r,1500));
  }
  console.log('wrote',OUT);
})();
