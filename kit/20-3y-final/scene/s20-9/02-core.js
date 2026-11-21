/* ===================== Core: seeded game, clock, glossary text, resume code ===================== */
const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const T_END = 6 * 24; // Sunday 08:00, counted from Monday 08:00
const COST = { ask: 1, hint: 1, miss: 1 };
const BONUS = 2;

function mulberry(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const sPick = (r, a) => a[Math.floor(r() * a.length)];
const sShuffle = (r, a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* distance and flight time */
function km(a, b) {
  const R = 6371, rad = d => d * Math.PI / 180, [lo1, la1] = a, [lo2, la2] = b;
  const h = Math.sin(rad(la2 - la1) / 2) ** 2 + Math.cos(rad(la1)) * Math.cos(rad(la2)) * Math.sin(rad(lo2 - lo1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const cityOf = id => id === 'lethbridge' ? LETH : CITIES[id];
const rawHrs = (a, b) => km(cityOf(a).ll, cityOf(b).ll) / 850 + 2;
// every route gets about the same total flying time, so the race is equally fair for every playthrough
const flightHrs = (a, b) => Math.max(3, Math.round(rawHrs(a, b) * ((S.G && S.G.fscale) || 1)));

/* every random choice that must survive a resume code comes from the seed */
function makeGame(seed) {
  const r = mulberry(seed * 2654435761 + 12345);
  const five = sShuffle(r, POOL).slice(0, 5);
  let route;
  for (let tries = 0; tries < 50; tries++) {
    route = sShuffle(r, ['mexico', 'miami', ...five]);
    // keep near neighbours apart so a leg is never a 1-hour hop that the clues can't tell apart
    let ok = true;
    for (let i = 1; i < route.length; i++) if (km(CITIES[route[i - 1]].ll, CITIES[route[i]].ll) < 900) ok = false;
    if (ok) break;
  }
  route.push('granada');

  // which feature each stop reveals: all four in the first four stops, then repeats
  const order = sShuffle(r, FEAT_KEYS);
  while (order.length < 7) order.push(sPick(r, FEAT_KEYS.filter(k => k !== order[order.length - 1])));

  // suspects: the culprit is unique on all four features, but the first two clues are not enough
  const people = sShuffle(r, SUSPECT_POOL).slice(0, 5);
  let feats, culprit, guard = 0;
  do {
    feats = people.map(() => Object.fromEntries(FEAT_KEYS.map(k => [k, sPick(r, Object.keys(FEATS[k].vals))])));
    culprit = Math.floor(r() * 5);
    guard++;
  } while (guard < 5000 && !suspectsOk(feats, culprit, order));
  const suspects = people.map((p, i) => ({ ...p, f: feats[i] }));

  const fam = sShuffle(r, FAMILY), stayed = sShuffle(r, STAYED);
  const legs = route.map((id, i) => {
    const from = i === 0 ? 'lethbridge' : route[i - 1];
    const next = CITIES[id];
    const plain = sShuffle(r, next.clues);
    const dato = next.datos && next.datos.length ? sPick(r, next.datos) : null;
    const others = Object.keys(CITIES).filter(k => k !== id && k !== from && !route.slice(0, i).includes(k));
    // decoys: not too close to the right answer, so the clues decide
    const far = others.filter(k => km(CITIES[k].ll, next.ll) > 1200);
    const decoys = sShuffle(r, far.length >= 2 ? far : others).slice(0, 2);
    return { id, from, clueA: plain[0], clueB: dato || plain[1], clueC: plain[dato ? 1 : 2] || plain[0], decoys };
  });
  const fscale = 68 / legs.reduce((t, L) => t + rawHrs(L.from, L.id), 0);
  return { seed, route, suspects, culprit, order, fam, stayed, legs, fscale };
}
function suspectsOk(feats, c, order) {
  const others = feats.filter((_, i) => i !== c), same = (o, ks) => ks.every(k => o[k] === feats[c][k]);
  if (others.some(o => same(o, FEAT_KEYS))) return false;                       // the four clues identify the thief
  if (FEAT_KEYS.some(k => !others.some(o => o[k] === feats[c][k]))) return false; // no single clue does
  if (!others.some(o => same(o, order.slice(0, 2)))) return false;              // the first two clues don't either
  if (!others.some(o => same(o, order.slice(0, 3)))) return false;              // nor the first three
  for (const k of FEAT_KEYS) { const n = {}; feats.forEach(f => { n[f[k]] = (n[f[k]] || 0) + 1; }); if (Math.max(...Object.values(n)) > 3) return false; }
  for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) if (FEAT_KEYS.every(k => feats[i][k] === feats[j][k])) return false;
  return true;
}

/* ---- the clock ---- */
function clockText(t) {
  const abs = 8 + t, day = Math.floor(abs / 24), h = Math.floor(abs % 24), m = Math.round((abs % 1) * 60);
  return `${capFirst(DAYS[Math.min(day, 6)])} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function hoursLeft() { return Math.max(0, T_END - S.t); }
/* advance the clock; nights from 23:00 to 07:00 are slept. Returns true if time ran out. */
function advance(h, why) {
  if (!h) return false;
  S.t += h;
  const hod = (8 + S.t) % 24;
  if (hod >= 23 || hod < 7) {
    S.t += (31 - hod) % 24;
    S.slept = true;
  }
  renderClock(h, why);
  if (S.t >= T_END) { S.t = T_END; renderClock(); timeUp(); return true; }
  return false;
}
function gain(h) { S.t = Math.max(0, S.t - h); renderClock(-h); }

/* ---- glossary-aware text ---- */
const WORD_RE = /[A-Za-zÀ-ÖØ-öø-ÿ]+/g;
function gl(text) {
  return esc(text).replace(WORD_RE, w => {
    const lemma = GFORM[keyOf(w)];
    if (!lemma) return w;
    const fresh = !S.glos.has(lemma);
    if (fresh) { S.glos.add(lemma); S.glosNew.add(lemma); S.glosPing = true; }
    return `<span class="gw${fresh ? ' new' : ''}" data-l="${esc(lemma)}" tabindex="0">${w}</span>`;
  });
}
function unlockWords(text) { gl(text); }
let tipEl = null;
function showTip(el) {
  const g = GLOSS[el.dataset.l]; if (!g) return;
  if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'gwtip'; document.body.appendChild(tipEl); }
  tipEl.innerHTML = `<span class="ic">${g.ic}</span><b>${esc(el.dataset.l)}</b> · ${esc(g.en)}`;
  const r = el.getBoundingClientRect();
  tipEl.hidden = false;
  const w = tipEl.offsetWidth || 200;
  tipEl.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
  tipEl.style.top = Math.max(8, r.top - (tipEl.offsetHeight || 40) - 8) + 'px';
}
const hideTip = () => { if (tipEl) tipEl.hidden = true; };
document.addEventListener('mouseover', e => { const g = e.target.closest && e.target.closest('.gw'); if (g) showTip(g); });
document.addEventListener('mouseout', e => { if (e.target.closest && e.target.closest('.gw')) hideTip(); });
document.addEventListener('focusin', e => { const g = e.target.closest && e.target.closest('.gw'); if (g) showTip(g); });
document.addEventListener('focusout', hideTip);
document.addEventListener('click', e => { const g = e.target.closest && e.target.closest('.gw'); if (g) { showTip(g); setTimeout(hideTip, 2200); } });
window.addEventListener('scroll', hideTip, { passive: true });

/* ---- resume code: XXXX-XXXX-XXXX-XXXX ---- */
const RB32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const RFIELDS = [['seed', 20], ['stop', 3], ['t', 8], ['s0', 2], ['s1', 2], ['s2', 2], ['s3', 2], ['s4', 2], ['s5', 2], ['s6', 2], ['rem', 3], ['gems', 5], ['hints', 5], ['wrong', 4], ['arch', 4], ['miss', 6]];
function rHash(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
function resumeEncode(f) {
  let v = 0n;
  for (const [k, bits] of RFIELDS) v = (v << BigInt(bits)) | BigInt(Math.max(0, Math.min((1 << bits) - 1, Math.round(f[k] || 0))));
  const check = BigInt(rHash('cibola|' + v.toString(36)) & 0xff);
  let all = (v << 8n) | check;
  all ^= (BigInt(rHash('elena')) << 48n) | (BigInt(rHash('robles')) << 16n) | BigInt(rHash('1890') & 0xffff); // scramble (80 bits)
  all &= (1n << 80n) - 1n;
  let s = '';
  for (let i = 15; i >= 0; i--) s += RB32[Number((all >> BigInt(i * 5)) & 31n)];
  return s.match(/.{4}/g).join('-');
}
function resumeDecode(code) {
  const c = String(code || '').toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
  if (c.length !== 16) return null;
  let all = 0n;
  for (const ch of c) { const i = RB32.indexOf(ch); if (i < 0) return null; all = (all << 5n) | BigInt(i); }
  all ^= ((BigInt(rHash('elena')) << 48n) | (BigInt(rHash('robles')) << 16n) | BigInt(rHash('1890') & 0xffff)) & ((1n << 80n) - 1n);
  const check = all & 0xffn;
  let v = all >> 8n;
  if (BigInt(rHash('cibola|' + v.toString(36)) & 0xff) !== check) return null;
  const f = {};
  for (let i = RFIELDS.length - 1; i >= 0; i--) { const [k, bits] = RFIELDS[i]; f[k] = Number(v & ((1n << BigInt(bits)) - 1n)); v >>= BigInt(bits); }
  if (f.stop > 7 || f.seed === 0) return null;
  return f;
}
function currentCode() {
  const f = { seed: S.G.seed, stop: S.i, t: Math.round(S.t), rem: S.rem, gems: S.gems.size + (S.gemsPrior || 0), hints: S.hints, wrong: S.wrong, arch: S.arch.size + (S.archPrior || 0), miss: S.miss };
  for (let k = 0; k < 7; k++) f['s' + k] = S.stopStars[k] || 0;
  return resumeEncode(f);
}
