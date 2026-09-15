/* lint.js: static checks for a module file. usage: node lint.js <module.html>
   - TeX inequalities written with a bare < followed by a letter (the HTML parser eats "<b" as a tag): use &lt; or \lt
   - em dashes
   - drilled sections without data-goal, drill mounts referenced by Drill({mount}) that do not exist, canvas ids used by Plot2D/Scene3D that do not exist
   - initModule must be the last statement */
const fs=require('fs'),path=require('path');
const file=path.resolve(process.argv[2]);const src=fs.readFileSync(file,'utf8');
let problems=[];
const lines=src.split('\n');
lines.forEach((l,i)=>{
  const n=i+1;
  if(/—/.test(l))problems.push(`${n}: em dash`);
  /* bare "<letter" inside \( \) or \[ \] or inside a template/quoted string that looks like TeX */
  const texRe=/\\\((.*?)\\\)|\\\[(.*?)\\\]/g;let m;
  while((m=texRe.exec(l))){const body=m[1]||m[2]||'';if(/<[a-zA-Z\\]/.test(body))problems.push(`${n}: "<" followed by a letter inside TeX (HTML eats it as a tag): ${body.slice(0,60)}`);}
});
/* sections / goals / mounts / canvases */
const secs=[...src.matchAll(/<section\s+data-id="([^"]+)"([^>]*)>/g)].map(m=>({id:m[1],attrs:m[2]}));
const drills=[...src.matchAll(/new Drill\(\{mount:'#([^']+)',\s*section:'([^']+)'/g)].map(m=>({mount:m[1],section:m[2]}));
drills.forEach(d=>{if(!new RegExp(`id="${d.mount}"`).test(src))problems.push(`drill mount #${d.mount} not in HTML`);const s=secs.find(x=>x.id===d.section);if(!s)problems.push(`drill section ${d.section} not found`);else if(!/data-goal=/.test(s.attrs))problems.push(`section ${d.section} has a drill but no data-goal`);});
const canv=[...src.matchAll(/new (?:Plot2D|Scene3D)\('#([^']+)'\s*[,)]/g)].map(m=>m[1]);
canv.forEach(c=>{if(!new RegExp(`id="${c}"`).test(src))problems.push(`canvas #${c} not in HTML`);});
if(!/initModule\(\{[^\n]*\}\);\s*<\/script>/.test(src))problems.push('initModule is not the last statement before </script>');
if(!/window\.__solvers/.test(src))problems.push('no window.__solvers');
const last=secs[secs.length-1]&&secs[secs.length-1].id;
if(last!=='quiz')problems.push('last section is not quiz');
console.log(`lint ${path.basename(file)}: ${secs.length} sections, ${drills.length} drills, ${canv.length} canvases`);
problems.forEach(p=>console.log('  ',p));
console.log(problems.length?`LINT FAILED (${problems.length})`:'LINT OK');
process.exit(problems.length?1:0);
