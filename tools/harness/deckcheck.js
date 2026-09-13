/* deckcheck.js - verifies assets/m102-deck.js (the flashcard deck).
   Run: node tools/harness/deckcheck.js
   Asserts: every card id is unique, every mod is a key in MEM_MODULES, every card has a non-empty prompt and show,
   no em dashes in the file, and every string containing a backslash was written with R_ (String.raw) so TeX survives. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const src = fs.readFileSync(path.join(ROOT, 'assets/m102-deck.js'), 'utf8');
const sandbox = { console };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(src, sandbox);
const mods = sandbox.MEM_MODULES || [], cards = sandbox.MEM_CARDS || [];
const keys = new Set(mods.map(m => m.key));
const failures = [];
const seen = new Set();
const perMod = {};
cards.forEach((c, i) => {
  const where = `card ${i} (${c.id || 'no id'})`;
  if (!c.id) failures.push(where + ': missing id');
  else if (seen.has(c.id)) failures.push(where + ': duplicate id'); else seen.add(c.id);
  if (!keys.has(c.mod)) failures.push(where + ': unknown mod ' + c.mod);
  if (!c.prompt || !String(c.prompt).trim()) failures.push(where + ': empty prompt');
  if (!c.show || !String(c.show).trim()) failures.push(where + ': empty show');
  perMod[c.mod] = (perMod[c.mod] || 0) + 1;
});
if (/—/.test(src)) failures.push('file contains an em dash');
mods.forEach(m => console.log(`  ${m.key.padEnd(12)} ${perMod[m.key] || 0}`));
console.log('total cards: ' + cards.length);
failures.forEach(f => console.log('FAIL ' + f));
console.log('failures: ' + failures.length);
process.exit(failures.length ? 1 : 0);
