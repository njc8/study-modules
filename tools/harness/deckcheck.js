/* deckcheck.js - verifies assets/m102-deck.js against the memory.js card schema and the calc102 checkers.
   Run: node <this file>
   Loads assets/study.js, assets/calc102.js, assets/memory.js, assets/m102-deck.js into one vm context
   (window is the context global itself, no localStorage) and asserts:
     - every card id is unique
     - every card mod is a key in MEM_MODULES
     - every non-recall card satisfies memCheck(card, memSolve(card)).ok === true
     - every recall card has a non-empty show
*/
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const FILES = ['assets/study.js', 'assets/calc102.js', 'assets/memory.js', 'assets/m102-deck.js'];

const sandbox = {
  console,
  /* study.js registers a DOMContentLoaded handler on window at load time */
  addEventListener() {},
  removeEventListener() {},
};
const ctx = vm.createContext(sandbox);
/* window is the context global itself, so window.MEM_CARDS resolves */
vm.runInContext('var window = this; var self = this;', ctx, { filename: 'bootstrap' });

for (const f of FILES) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  try {
    vm.runInContext(src, ctx, { filename: f });
  } catch (e) {
    console.error(`FATAL: ${f} failed to load: ${e && e.stack || e}`);
    process.exit(1);
  }
}

/* run the assertions inside the context so the lexically scoped globals
   (memCheck, memSolve, MEM_MODULES) are visible */
const REPORT = vm.runInContext(`(function(){
  const cards = window.MEM_CARDS || [];
  const mods = (window.MEM_MODULES || []).map(m => m.key);
  const modSet = new Set(mods);
  const failures = [];
  const seen = new Map();
  const perMod = {};
  const perKind = {};
  mods.forEach(k => perMod[k] = 0);

  cards.forEach((c, i) => {
    const where = c && c.id ? c.id : 'index ' + i;
    if (!c || typeof c !== 'object') { failures.push(where + ': not an object'); return; }
    if (!c.id) failures.push(where + ': missing id');
    if (seen.has(c.id)) failures.push(c.id + ': duplicate id (also at index ' + seen.get(c.id) + ')');
    else seen.set(c.id, i);
    if (!modSet.has(c.mod)) failures.push(where + ': unknown mod "' + c.mod + '"');
    else perMod[c.mod]++;
    perKind[c.kind] = (perKind[c.kind] || 0) + 1;
    if (!c.prompt || !String(c.prompt).trim()) failures.push(where + ': empty prompt');
    if (!c.show || !String(c.show).trim()) failures.push(where + ': empty show');

    if (c.kind === 'recall') {
      if (c.ans !== undefined) failures.push(where + ': recall card should not carry ans');
      return;
    }
    let solved, res;
    try { solved = memSolve(c); } catch (e) { failures.push(where + ': memSolve threw ' + e.message); return; }
    if (solved === '' || solved == null) { failures.push(where + ': memSolve produced nothing (kind ' + c.kind + ')'); return; }
    /* run the sampling checkers a few times: they use random sample points */
    const tries = (c.kind === 'const' || c.kind === 'expr' || c.kind === 'seq') ? 5 : 1;
    for (let t = 0; t < tries; t++) {
      try { res = memCheck(c, solved); } catch (e) { failures.push(where + ': memCheck threw ' + e.message); return; }
      if (!res || res.ok !== true) {
        failures.push(where + ' [' + c.kind + ']: memCheck("' + solved + '") not ok' + (res && res.err ? ' - ' + res.err : ''));
        return;
      }
    }
  });

  /* every em dash is banned in this project */
  return { total: cards.length, perMod: perMod, perKind: perKind, mods: mods, failures: failures };
})()`, ctx, { filename: 'deckcheck-assertions' });

/* no em dash anywhere in the deck file */
const deckSrc = fs.readFileSync(path.join(ROOT, 'assets/m102-deck.js'), 'utf8');
const emDashLines = deckSrc.split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => l.includes('—'));
emDashLines.forEach(([n]) => REPORT.failures.push('assets/m102-deck.js line ' + n + ': em dash'));

console.log('cards per module');
REPORT.mods.forEach(k => console.log('  ' + k.padEnd(14) + String(REPORT.perMod[k]).padStart(4)));
console.log('cards per kind');
Object.keys(REPORT.perKind).sort().forEach(k => console.log('  ' + k.padEnd(14) + String(REPORT.perKind[k]).padStart(4)));
console.log('total cards: ' + REPORT.total);
console.log('failures: ' + REPORT.failures.length);
REPORT.failures.forEach(f => console.log('  FAIL ' + f));
process.exit(REPORT.failures.length ? 1 : 0);
