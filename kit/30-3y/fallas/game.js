/* =====================================================================
   ¡FALLAS! · GAME LAYER
   1 utilities · 2 settings & speech · 3 text analysis (future, preterite) · 4 UI helpers
   5 the week (constraints) · 6 missions · 7 end of session · 8 boot
   ===================================================================== */
const $id = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms * (window.__testSpeed || 1)));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const capFirst = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const starStr = n => '★'.repeat(n) + '☆'.repeat(3 - n);
const stripMarks = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const norm = s => stripMarks(String(s).toLowerCase()).replace(/[¿?¡!.,;:"“”«»()\-–—…'’]/g, ' ').replace(/\s+/g, ' ').trim();
const words = s => s.match(/[A-Za-zÀ-ÖØ-öø-ÿ]+/g) || [];
const keyOf = w => stripMarks(w.toLowerCase());
const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

/* ============ 2 · SETTINGS & SPEECH (same behaviour as the other 30-3Y games) ============ */
const SPEEDS = { lento: 0.72, normal: 0.92, natural: 1.08 };
const SETTINGS = { text: false, speed: 'normal', voice: '' };
try { Object.assign(SETTINGS, JSON.parse(localStorage.getItem('ndl-settings') || '{}')); } catch (e) {}
SETTINGS.text = false;
const URLP = new URLSearchParams(location.search);
const ACCOMMODATION = URLP.get('texto') === '1';
function saveSettings() { try { localStorage.setItem('ndl-settings', JSON.stringify({ speed: SETTINGS.speed, voice: SETTINGS.voice })); } catch (e) {} }
const VOICE_PREFS = ['es-ES', 'es-MX', 'es-US', 'es-419'];
const TTS = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let VOICES = [], VOZ = null, speakTok = 0, lastSpoken = null, voicesSettled = false;
function rankVoice(v) {
  const l = (v.lang || '').replace('_', '-'); if (!/^es(-|$)/i.test(l)) return -1;
  let s = 0; const i = VOICE_PREFS.findIndex(p => p.toLowerCase() === l.toLowerCase()); if (i >= 0) s += (VOICE_PREFS.length - i) * 6;
  if (/natural|online|neural/i.test(v.name)) s += 40; if (/google/i.test(v.name)) s += 22; return s;
}
function loadVoices() {
  if (!TTS) { VOZ = null; applyNoVoice(); return; }
  try { VOICES = speechSynthesis.getVoices().map(v => [rankVoice(v), v]).filter(x => x[0] >= 0).sort((a, b) => b[0] - a[0]).map(x => x[1]); } catch (e) { VOICES = []; }
  VOZ = VOICES.find(v => v.name === SETTINGS.voice) || VOICES[0] || null;
  const sel = $id('voiceSel'); if (sel) sel.innerHTML = VOICES.length ? VOICES.map(v => `<option value="${esc(v.name)}"${v === VOZ ? ' selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('') : '<option>No Spanish voice found</option>';
  const vn = $id('vozName'); if (vn) vn.textContent = VOZ ? `${VOZ.name} (${VOZ.lang})` : 'none found';
  applyNoVoice();
}
function applyNoVoice() { if (!voicesSettled && TTS) return; document.body.classList.toggle('no-tts', !VOZ); if (!VOZ) setText(true, 'novoice'); }
function initVoices() {
  if (TTS) { loadVoices(); try { speechSynthesis.addEventListener('voiceschanged', () => { voicesSettled = true; loadVoices(); }); } catch (e) {} setTimeout(loadVoices, 600); setTimeout(() => { voicesSettled = true; loadVoices(); }, 2500); }
  else { voicesSettled = true; applyNoVoice(); }
}
function chunkText(t) { return t.split(/(?<=[.!?…»])\s+(?=[¿¡«A-ZÁÉÍÓÚÑ0-9])/).filter(Boolean); }
function speakRaw(text, who = {}, tok) {
  return new Promise(resolve => {
    const rate = SPEEDS[SETTINGS.speed] * (who.rate || 1);
    if (!VOZ || window.__mute) { setTimeout(resolve, Math.max(900, text.length * 55 / rate) * (window.__testSpeed || 1)); return; }
    const chunks = chunkText(text.replace(/[«»]/g, '')); let i = 0;
    const next = () => {
      if (tok !== speakTok || i >= chunks.length) { resolve(); return; }
      const c = chunks[i++]; let done = false;
      const fin = () => { if (done) return; done = true; clearTimeout(guard); next(); };
      const guard = setTimeout(fin, 2500 + c.length * 110 / rate);
      try { const u = new SpeechSynthesisUtterance(c); u.voice = VOZ; u.lang = VOZ.lang; u.rate = rate; u.pitch = who.pitch || 1; u.onend = fin; u.onerror = fin; speechSynthesis.speak(u); } catch (e) { fin(); }
    };
    next();
  });
}
function stopSpeech() { speakTok++; try { if (TTS) speechSynthesis.cancel(); } catch (e) {} setSpeaking(false); }
const CAST = {
  lucia: { name: 'Lucía', pitch: 1.1, guide: true }, nerea: { name: 'Nerea', pitch: 1.18 }, amparo: { name: 'Amparo (mamá)', pitch: 1.04, rate: .96 },
  vicent: { name: 'Vicent (papá)', pitch: .82 }, pepa: { name: 'Abuela Pepa', pitch: .98, rate: .86 }, pau: { name: 'Pau', pitch: 1.4, rate: 1.04 },
  toni: { name: 'Toni, presidente de la falla', pitch: .78 }, laia: { name: 'Laia', pitch: 1.25 }, vendedor: { name: 'El vendedor', pitch: .9 },
  megafonia: { name: 'Megafonía', pitch: .92, rate: .9 }, fallera: { name: 'La fallera mayor', pitch: 1.12 },
};
/* speak lines as one person; lines are logged to the transcript */
async function talk(lines, who, opts = {}) {
  lines = [].concat(lines).filter(Boolean); if (!lines.length) return;
  stopSpeech(); const tok = speakTok;
  if (!opts.replay) { lastSpoken = { lines, who }; lines.forEach(l => logLine(who.name, l)); }
  $id('who').textContent = who.name;
  for (const l of lines) {
    if (tok !== speakTok) return;
    showLine(l); setSpeaking(true);
    await speakRaw(l, who, tok);
    if (tok !== speakTok) return;
    setSpeaking(false); await sleep(200);
  }
}
function replay() { if (!lastSpoken) return; session.stats.replays++; if (SETTINGS.speed === 'lento') session.stats.slow++; talk(lastSpoken.lines, lastSpoken.who, { replay: true }); }
function setSpeaking(on) { const b = $id('linebar'); if (b) b.classList.toggle('speaking', on); }
function showLine(t) { state.lastLine = t; $id('lineEs').textContent = t; }
function setText(on, reason) {
  SETTINGS.text = on; document.body.classList.toggle('show-text', on);
  const cb = $id('optText'); if (cb) cb.checked = on;
  if (on) { session.textShown = true; session.textReason = session.textReason || reason || 'student'; }
}

/* ============ 3 · TEXT ANALYSIS ============ */
const ENGLISH = new Set(['the', 'is', 'are', 'i', 'you', 'my', 'want', 'we', 'will', 'go', 'went', 'and', 'it', 'was', 'to', 'of', 'they', 'this', 'that', 'with', 'on', 'see', 'saw']);
const looksEnglish = n => { const w = n.split(' '), e = w.filter(x => ENGLISH.has(x)).length; return e >= 2 && e / w.length > .3; };
const ACCENT_WORDS = { tambien: 'también', manana: 'mañana', despues: 'después', ademas: 'además', mama: 'mamá', papa: 'papá', musica: 'música', miercoles: 'miércoles', sabado: 'sábado', mascleta: 'mascletà', bunuelos: 'buñuelos', bunuelo: 'buñuelo', cremà: 'cremà', crema: 'cremà', tia: 'tía', tio: 'tío', dia: 'día', dias: 'días', aqui: 'aquí', alli: 'allí', rapido: 'rápido', ultimo: 'último', jamas: 'jamás', fantastico: 'fantástico', increible: 'increíble' };
function reviewAccents(raw) {
  const out = [];
  words(raw).forEach(w => { const k = keyOf(w), t = ACCENT_WORDS[k]; if (!t || w.toLowerCase() === t || (k === 'crema' && !/la crema/i.test(raw))) return; if (k === 'papa' && /\bla papa\b/i.test(raw)) return; if (!out.some(x => x.fix === t)) out.push({ wrote: w, fix: t }); });
  if (raw.includes('?') && !raw.includes('¿')) out.push({ wrote: '?', fix: '¿…?', punct: true });
  return out.slice(0, 3);
}

/* ---- simple future ---- */
const FUT_REG = 'ir ver comer beber llevar visitar mirar tomar escuchar pasear caminar comprar cenar merendar bailar celebrar disfrutar encontrar quedar volver regresar acompañar llegar conocer entregar probar buscar votar dar estar ser ofrecer quemar invitar ayudar cantar sacar pedir vivir escribir subir abrir empezar terminar jugar aprender correr esperar descansar dormir levantar ducharse quedarse vestir saludar hablar viajar oír admirar gritar pagar desayunar almorzar mojar sentar'.split(' ');
const FUT_IRR = { hacer: 'har', tener: 'tendr', poder: 'podr', salir: 'saldr', venir: 'vendr', poner: 'pondr', decir: 'dir', querer: 'querr', saber: 'sabr', haber: 'habr', valer: 'valdr' };
const FUT_END = ['é', 'ás', 'á', 'emos', 'éis', 'án'], PERS = ['yo', 'tu', '3s', 'nos', 'vos', '3p'];
const FUT = new Map(), FUT_SLIP = new Map();
(function buildFuture() {
  const add = (m, f, v) => { m.set(keyOf(f), Object.assign({ form: f }, v)); };
  FUT_REG.forEach(inf => { const base = inf.replace(/se$/, ''); FUT_END.forEach((e, i) => add(FUT, base + e, { inf: base, p: PERS[i] })); });
  Object.entries(FUT_IRR).forEach(([inf, st]) => FUT_END.forEach((e, i) => { add(FUT, st + e, { inf, p: PERS[i] }); add(FUT_SLIP, inf + e, { inf, p: PERS[i], fix: st + e }); }));
  // common slips: -er/-ir stems of irregulars with a vowel, and a missing -r-
  [['hacer', 'hacier'], ['tener', 'tenir'], ['poder', 'podir'], ['salir', 'salier'], ['venir', 'venier'], ['poner', 'ponir'], ['decir', 'decir'], ['querer', 'querir']].forEach(([inf, bad]) => FUT_END.forEach((e, i) => { if (!FUT_SLIP.has(keyOf(bad + e))) add(FUT_SLIP, bad + e, { inf, p: PERS[i], fix: FUT_IRR[inf] + e }); }));
})();
const IR_A = /(?:^| )(voy|vas|va|vamos|vais|van) a ([a-z]*(?:ar|er|ir))(?= |$)/g;
const PRES_PLAN = { vamos: 'iremos', vemos: 'veremos', comemos: 'comeremos', llevamos: 'llevaremos', visitamos: 'visitaremos', salimos: 'saldremos', hacemos: 'haremos', tenemos: 'tendremos', tomamos: 'tomaremos', bebemos: 'beberemos', miramos: 'miraremos', pedimos: 'pediremos', voy: 'iré', veo: 'veré', como: null, llevo: 'llevaré', visito: 'visitaré', hago: 'haré', salgo: 'saldré' };
const NOT_FUT = new Set(['ira', 'cena', 'para', 'sera', 'vera', 'era', 'pena', 'hora', 'ahora', 'fuera', 'tierra']);
function analyzeFuture(raw) {
  const r = { fut: [], slips: [], accents: [], irA: [], present: [] }, n = norm(raw);
  words(raw).forEach(w => {
    const k = keyOf(w), lw = w.toLowerCase();
    if (FUT_SLIP.has(k) && !FUT.has(k)) { const s = FUT_SLIP.get(k); r.slips.push({ wrote: w, fix: s.fix }); r.fut.push({ w, inf: s.inf }); return; }
    const f = FUT.get(k); if (!f) { if (PRES_PLAN[k]) r.present.push({ wrote: w, fix: PRES_PLAN[k] }); return; }
    if (NOT_FUT.has(k) && lw === k) return;
    r.fut.push({ w, inf: f.inf, p: f.p });
    if (f.form !== stripMarks(f.form) && lw === stripMarks(lw)) r.accents.push({ wrote: w, fix: f.form });
  });
  let m; IR_A.lastIndex = 0; while ((m = IR_A.exec(n))) r.irA.push(m[0].trim());
  if (r.irA.length) r.present = r.present.filter(p => !/^(voy|vas|va|vamos|vais|van)$/.test(keyOf(p.wrote)));
  r.verbs = [...new Set(r.fut.map(f => f.inf))];
  return r;
}

/* ---- preterite (tables from the series engine) ---- */
const VERBS = {
  ar: 'caminar llegar entrar tomar comprar visitar pagar buscar mirar hablar escuchar bailar cantar gritar regresar encontrar dejar llevar quedar pasar sacar tocar trabajar viajar usar jugar empezar cruzar ayudar terminar esperar preguntar contestar mostrar sentar almorzar cenar desayunar probar pensar llamar ganar votar entregar disfrutar merendar celebrar quemar admirar saludar explotar acabar durar lanzar mojar invitar preparar levantar acostar despertar encantar gustar asustar emocionar flipar alucinar arder'.split(' '),
  er: 'comer beber correr perder ver aprender conocer volver romper caer leer creer parecer aparecer desaparecer ofrecer responder esconder sorprender vender mover entender encender'.split(' '),
  ir: 'salir vivir subir abrir escribir recibir decidir descubrir seguir pedir sentir dormir repetir servir preferir compartir oir vestir'.split(' ')
};
const IRR_STEM = { tener: 'tuv', estar: 'estuv', andar: 'anduv', poder: 'pud', poner: 'pus', saber: 'sup', querer: 'quis', venir: 'vin', hacer: 'hic', decir: 'dij', traer: 'traj' };
const E_I = { pedir: 1, sentir: 1, repetir: 1, servir: 1, preferir: 1, vestir: 1, seguir: 1 }, O_U = { dormir: 1 };
const Y_VERBS = { caer: 'ca', leer: 'le', creer: 'cre', oir: 'o' };
const FORMS = new Map(), PRET_NOS = {};
function addForm(form, inf, tense, person) { const k = keyOf(form); if (!FORMS.has(k)) FORMS.set(k, []); FORMS.get(k).push({ form, inf, tense, person, acc: form !== stripMarks(form) }); }
(function buildPret() {
  const P = ['yo', 'tu', '3s', 'nos', '3p'];
  const all = [...VERBS.ar.map(v => [v, 'ar']), ...VERBS.er.map(v => [v, 'er']), ...VERBS.ir.map(v => [v, 'ir']), ...Object.keys(IRR_STEM).map(v => [v, 'irr'])];
  for (const [inf, cls] of all) {
    const stem = inf.slice(0, -2); let pret;
    if (IRR_STEM[inf]) { const s = IRR_STEM[inf], j = /j$/.test(s); pret = [s + 'e', s + 'iste', inf === 'hacer' ? 'hizo' : s + 'o', s + 'imos', s + (j ? 'eron' : 'ieron')]; }
    else if (cls === 'ar') { const yo = /car$/.test(inf) ? stem.slice(0, -1) + 'qué' : /gar$/.test(inf) ? stem + 'ué' : /zar$/.test(inf) ? stem.slice(0, -1) + 'cé' : stem + 'é'; pret = [yo, stem + 'aste', stem + 'ó', stem + 'amos', stem + 'aron']; }
    else if (Y_VERBS[inf]) { const b = Y_VERBS[inf]; pret = [b + 'í', b + 'íste', b + 'yó', b + 'ímos', b + 'yeron']; }
    else { let s3 = stem; if (E_I[inf]) s3 = stem.replace(/e(?=[^e]*$)/, 'i'); if (O_U[inf]) s3 = stem.replace(/o(?=[^o]*$)/, 'u'); pret = inf === 'ver' ? ['vi', 'viste', 'vio', 'vimos', 'vieron'] : [stem + 'í', stem + 'iste', s3 + 'ió', stem + 'imos', s3 + 'ieron']; }
    pret.forEach((f, i) => addForm(f, inf, 'pret', P[i])); PRET_NOS[inf] = pret[3];
    const imp = cls === 'ar' || inf === 'estar' || inf === 'andar' ? ['aba', 'abas', 'aba', 'ábamos', 'aban'] : ['ía', 'ías', 'ía', 'íamos', 'ían'];
    if (inf !== 'ver') imp.forEach((e, i) => addForm((inf === 'oir' ? 'o' : stem) + e, inf, 'imp', P[i]));
  }
  [['fui', 'yo'], ['fuiste', 'tu'], ['fue', '3s'], ['fuimos', 'nos'], ['fueron', '3p']].forEach(([f, p]) => addForm(f, 'ir/ser', 'pret', p)); PRET_NOS.ir = 'fuimos'; PRET_NOS.ser = 'fuimos';
  [['di', 'yo'], ['diste', 'tu'], ['dio', '3s'], ['dimos', 'nos'], ['dieron', '3p']].forEach(([f, p]) => addForm(f, 'dar', 'pret', p)); PRET_NOS.dar = 'dimos';
  ['era', 'eras', 'era', 'éramos', 'eran'].forEach((f, i) => addForm(f, 'ser', 'imp', P[i]));
  ['iba', 'ibas', 'iba', 'íbamos', 'iban'].forEach((f, i) => addForm(f, 'ir', 'imp', P[i]));
  ['veía', 'veíamos', 'veían'].forEach(f => addForm(f, 'ver', 'imp', '3s'));
  addForm('había', 'haber', 'imp', '3s'); addForm('hubo', 'haber', 'pret', '3s'); PRET_NOS.haber = 'hubo';
})();
const SLIPS = {
  fuemos: 'fuimos', fueimos: 'fuimos', hacimos: 'hicimos', hacemos_: 'hicimos', tenimos: 'tuvimos', teniamos_: 'tuvimos', estuvemos: 'estuvimos', podimos: 'pudimos', ponimos: 'pusimos', venimos_: 'vinimos', decimos_: 'dijimos', pidimos: 'pedimos', durmimos: 'dormimos',
  hacio: 'hizo', tenio: 'tuvo', ponio: 'puso', venio: 'vino', pudio: 'pudo', estuvio: 'estuvo', pedio: 'pidió', dormio: 'durmió', seguio: 'siguió', leio: 'leyó', caio: 'cayó', creio: 'creyó', oio: 'oyó',
  llege: 'llegué', page: 'pagué', juge: 'jugué', busce: 'busqué', toce: 'toqué', sace: 'saqué', empeze: 'empecé', cruze: 'crucé', almorze: 'almorcé', lanze: 'lancé',
  hacieron: 'hicieron', tenieron: 'tuvieron', poderon: 'pudieron', venieron: 'vinieron', pedieron: 'pidieron', dijieron: 'dijeron', trajieron: 'trajeron',
  hize: 'hice', teni: 'tuve', estuvi: 'estuve', podi: 'pude', poni: 'puse', hici: 'hice', vini: 'vine', andi: 'anduve', ande: 'anduve', pidi: 'pedí'
};
const SLIP_ACCENT = { fué: 'fue', fuí: 'fui', dió: 'dio', vió: 'vio' };
const NOT_VERBS = new Set(['cena', 'nada', 'hora', 'paso', 'camino', 'baile', 'viaje', 'noche', 'calle', 'parte', 'pasa', 'mira', 'queda', 'llega', 'trabajo', 'compra', 'visita', 'cambio', 'vista', 'como', 'bajo', 'llamo', 'gusto', 'helado', 'hecho', 'a', 'llevo', 'paseo', 'canto', 'grito', 'pago', 'gana', 'vuelta']);
function analyzePast(raw) {
  const r = { pret: [], imp: [], present: [], slips: [], accents: [], future: [] }, seen = new Set();
  words(raw).forEach(w => {
    const k = keyOf(w), lw = w.toLowerCase();
    if (SLIP_ACCENT[lw]) r.accents.push({ wrote: w, fix: SLIP_ACCENT[lw], note: 'One-syllable preterites have no accent.' });
    if (SLIPS[k]) { r.slips.push({ wrote: w, fix: SLIPS[k] }); r.pret.push(SLIPS[k]); return; }
    const fut = FUT.get(k); if (fut && !NOT_FUT.has(k) && !FORMS.has(k)) { r.future.push({ wrote: w, fix: PRET_NOS[fut.inf] || null }); return; }
    const c = FORMS.get(k); if (!c) return;
    const hasAcc = w !== stripMarks(w);
    if (NOT_VERBS.has(k) && !hasAcc) return;
    const pret = c.filter(x => x.tense === 'pret'), imp = c.filter(x => x.tense === 'imp');
    if (imp.length && !pret.length) { r.imp.push(w); return; }
    if (pret.length) {
      r.pret.push(pret[0].inf + ':' + k);
      const acc = pret.find(x => x.acc); if (acc && !hasAcc && !pret.some(x => !x.acc) && !seen.has(k)) { seen.add(k); r.accents.push({ wrote: w, fix: acc.form }); }
    }
  });
  r.distinct = new Set(r.pret.map(p => p.split(':')[0])).size;
  return r;
}

/* ============ 4 · UI HELPERS ============ */
const state = { lastLine: '', onSubmit: null, help: null };
let session = null;
function newSession() { return { started: Date.now(), textShown: ACCOMMODATION, textReason: ACCOMMODATION ? 'accommodation' : '', missions: [], writing: [], transcript: [], stats: { messages: 0, replays: 0, slow: 0, hints: 0, misses: 0 }, events: [], details: {} }; }
function logLine(who, text) { session && session.transcript.push({ who, text }); }
function setTask(html, eyebrow = 'Ahora') { $id('taskEyebrow').textContent = eyebrow; const t = $id('task'); t.innerHTML = html; t.classList.remove('appear'); void t.offsetWidth; t.classList.add('appear'); }
function chipEl(kind, es, en) { const c = document.createElement('div'); c.className = 'chip appear ' + kind; c.innerHTML = `${es ? `<b>${es}</b>` : ''}${en ? `<span class="en">${en}</span>` : ''}`; return c; }
function fb(kind, es, en, append = true) { try { SFX.play({ ok: 'correct', err: 'wrong', warn: 'hint', info: 'soft' }[kind] || 'soft'); } catch (e) {} const c = chipEl(kind, es, en); if (append) $id('fbs').appendChild(c); else $id('fbs').replaceChildren(c); return c; }
const clearFb = () => $id('fbs').replaceChildren();
function youSaid(text) { const d = document.createElement('div'); d.className = 'yousaid appear'; d.innerHTML = '<span>Tú</span><p></p>'; d.querySelector('p').textContent = text; $id('fbs').replaceChildren(d); }
function ia(html) { const el = $id('ia'); el.innerHTML = html; return el; }
const VOWEL = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú' };
const ACCENT_BAR = '<button type="button" data-ch="á">á</button><button type="button" data-ch="é">é</button><button type="button" data-ch="í">í</button><button type="button" data-ch="ó">ó</button><button type="button" data-ch="ú">ú</button><button type="button" data-ch="ñ">ñ</button><button type="button" data-ch="ü">ü</button><button type="button" data-ch="¿">¿</button><button type="button" data-ch="¡">¡</button><span class="caps">a+\' = á · n+~ = ñ · ? = ¿</span>';
function attachAccentInput(input, bar) {
  bar.innerHTML = ACCENT_BAR;
  const flashB = ch => { const b = bar.querySelector(`[data-ch="${ch.toLowerCase()}"]`); if (b) { b.classList.add('flash'); setTimeout(() => b.classList.remove('flash'), 350); } };
  input.addEventListener('input', e => {
    if (!e.inputType || !e.inputType.startsWith('insertText')) return;
    const pos = input.selectionStart, v = input.value, last = v[pos - 1], prev = v[pos - 2]; let rep = null;
    if ((last === "'" || last === '´' || last === '’') && prev && VOWEL[prev]) rep = VOWEL[prev];
    else if (last === '~' && (prev === 'n' || prev === 'N')) rep = prev === 'n' ? 'ñ' : 'Ñ';
    else if (last === ':' && (prev === 'u' || prev === 'U')) rep = prev === 'u' ? 'ü' : 'Ü';
    if (rep) { input.value = v.slice(0, pos - 2) + rep + v.slice(pos); input.setSelectionRange(pos - 1, pos - 1); flashB(rep); return; }
    const atStart = pos === 1 || (prev === ' ' && /[.!?]/.test(v[pos - 3] || '')) || prev === '\n';
    if ((last === '?' || last === '!') && atStart) { const inv = last === '?' ? '¿' : '¡'; input.value = v.slice(0, pos - 1) + inv + v.slice(pos); input.setSelectionRange(pos, pos); flashB(inv); }
  });
  bar.querySelectorAll('button').forEach(b => { b.addEventListener('pointerdown', e => e.preventDefault()); b.addEventListener('click', e => { const ch = e.shiftKey ? b.dataset.ch.toUpperCase() : b.dataset.ch, s = input.selectionStart ?? input.value.length, en = input.selectionEnd ?? s; input.value = input.value.slice(0, s) + ch + input.value.slice(en); input.focus(); input.setSelectionRange(s + ch.length, s + ch.length); }); });
}
function composer({ multiline = false, placeholder = 'Escribe en español…', rows = 4 } = {}) {
  ia(`<div class="composer"><div class="accentbar" id="abar"></div><div class="inputrow">${multiline ? `<textarea id="inp" rows="${rows}" placeholder="${placeholder}"></textarea>` : `<input type="text" id="inp" autocomplete="off" spellcheck="false" placeholder="${placeholder}">`}<button class="btn primary" id="sendBtn" type="button">Enviar</button></div>${multiline ? '<p class="keyhelp"><kbd>Ctrl</kbd>+<kbd>Enter</kbd> to send</p>' : ''}</div>`);
  const inp = $id('inp'); attachAccentInput(inp, $id('abar'));
  const send = () => { const v = inp.value.trim(); if (!v || !state.onSubmit) return; if (!multiline) inp.value = ''; state.onSubmit(v); };
  $id('sendBtn').addEventListener('click', send);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter' && (!multiline || e.ctrlKey || e.metaKey)) { e.preventDefault(); send(); } });
  setTimeout(() => inp.focus({ preventScroll: true }), 50);
}
function waitSubmit(handler) { return new Promise(resolve => { state.onSubmit = async raw => { const r = await handler(raw); if (r !== false && r !== undefined) { state.onSubmit = null; resolve(r); } }; }); }
function choice(options) { // [{label, ok}] → resolves when the right one is chosen; returns misses
  return new Promise(resolve => {
    let misses = 0;
    ia(`<div class="choices">${options.map((o, i) => `<button class="choice" type="button" data-i="${i}">${esc(o.label)}</button>`).join('')}</div>`);
    $id('ia').querySelectorAll('.choice').forEach(b => b.addEventListener('click', async () => {
      const o = options[+b.dataset.i];
      if (o.ok) { b.classList.add('ok'); try { SFX.play('correct'); } catch (e) {} await sleep(500); ia(''); resolve(misses); }
      else { misses++; b.disabled = true; b.classList.add('no'); if (o.onWrong) o.onWrong(misses); else try { SFX.play('wrong'); } catch (e) {} }
    }));
  });
}
function pick3D(targets) { return new Promise(resolve => setPick(targets, id => resolve(id))); }
function goButton(label) {
  const b = $id('goBtn'); b.hidden = false; b.disabled = false; b.textContent = label;
  return new Promise(resolve => { b.onclick = () => { b.disabled = true; resolve(); }; });
}
const hideGo = () => { $id('goBtn').hidden = true; };
async function titleCard(eyebrow, title, sub) {
  const tc = $id('titleCard'); $id('tcEyebrow').textContent = eyebrow; $id('tcTitle').textContent = title; $id('tcSub').textContent = sub || '';
  tc.hidden = false; tc.classList.remove('out'); try { SFX.play('whoosh'); } catch (e) {}
  await sleep(2000); tc.classList.add('out'); await sleep(450); tc.hidden = true;
}
function setHelp(text) { state.help = text; state.helpLevel = 0; }
function onHelp() {
  if (!state.help) { fb('info', '', 'Listen again with ⟲ Repetir, or slow it down in ⚙ Ajustes.'); return; }
  session.stats.hints++;
  const h = typeof state.help === 'function' ? state.help(state.helpLevel++) : state.help;
  fb('info', '💡', h);
}
function accentTips(raw) { reviewAccents(raw).forEach(is => fb('warn', is.punct ? '¿…?' : `<span class="fix"><s>${esc(is.wrote)}</s> → ${esc(is.fix)}</span>`, is.punct ? 'Questions open with ¿ (type ? at the start).' : 'Accent')); }

/* missions panel, plan view, messages, gems */
const MISSIONS = [['plan', 'El plan de la semana'], ['mensaje', 'El mensaje a la familia'], ['semana', 'La semana de Fallas'], ['blog', 'El blog']];
function renderMissions(cur) {
  $id('missionList').innerHTML = MISSIONS.map(([id, t]) => { const m = session.missions.find(x => x.id === id); return `<li class="${m ? 'done' : id === cur ? 'cur' : ''}"><span>${esc(t)}</span><span class="stars">${m ? starStr(m.stars) : ''}</span></li>`; }).join('');
}
function finishMission(id, stars) { stars = Math.max(1, Math.min(3, stars)); session.missions.push({ id, title: MISSIONS.find(m => m[0] === id)[1], stars }); renderMissions(); }
function renderGems() {
  const all = [{ id: 'mascleta', t: 'La mascletà' }, { id: 'valenciano', t: 'El valenciano' }, { id: 'ninots', t: 'Los ninots' }, { id: 'ofrenda', t: 'La ofrenda' }, { id: 'bunyols', t: 'Buñuelos y horchata' }, { id: 'crema', t: 'La cremà' }];
  $id('gemCount').textContent = `${found.size}/6`;
  $id('gemList').innerHTML = all.map(g => `<li class="${found.has(g.id) ? 'on' : ''}">${found.has(g.id) ? '✦' : '·'} ${found.has(g.id) ? esc(g.t) : '???'}</li>`).join('');
}
window.onGem = gem => { renderGems(); talk([gem.es], CAST.nerea); try { SFX.play('star'); } catch (e) {} };

/* ============ 5 · THE WEEK: slots, activities, family constraints ============ */
const DAYS = [['martes', 16, 'mar'], ['miércoles', 17, 'mie'], ['jueves', 18, 'jue']];
const SLOTS = []; DAYS.forEach(([d, n, k]) => ['tarde', 'noche'].forEach(p => SLOTS.push({ id: k + '-' + p[0], day: d, n, part: p })));
const slotById = id => SLOTS.find(s => s.id === id);
const ACTS = {
  mascleta: { es: 'la mascletà', short: 'La mascletà', icon: '💥', parts: ['tarde'], days: null, scene: 'plaza', rule: 'Every day at 2 p.m. (afternoon only)', rx: /\bmasclet/, place: 'Plaza del Ayuntamiento' },
  ofrenda: { es: 'la ofrenda', short: 'La ofrenda', icon: '💐', parts: ['tarde'], days: ['miércoles', 'jueves'], scene: 'ofrenda', rule: '17 and 18 March only (Wed/Thu), in the afternoon', rx: /\b(?:ofrenda|virgen|manto|ramos?)\b/, place: 'Plaza de la Virgen' },
  luces: { es: 'las luces del barrio', short: 'Las luces y la falla del barrio', icon: '✨', parts: ['noche'], days: null, scene: 'calle', rule: 'After dark (evening only)', rx: /\b(?:luces|barrio|falla infantil|ninots?)\b/, place: 'Una calle del barrio' },
  bunyols: { es: 'los buñuelos', short: 'Los buñuelos', icon: '🍩', parts: ['tarde', 'noche'], days: null, scene: 'bunyols', rule: 'Any time', rx: /\b(?:bu[nñ]uelos?|bunyols?|chocolates?|horchatas?|churros?|fartons?|xocolateria)\b/, place: 'Un puesto de buñuelos' },
};
const ACT_KEYS = Object.keys(ACTS);
function slotOk(act, s) { const A = ACTS[act]; return A.parts.includes(s.part) && (!A.days || A.days.includes(s.day)); }
const dayOf = s => s.day, partOf = s => s.part;
/* constraint templates, one per family member */
function makeConstraints() {
  const dpick = arr => pick(arr), D = DAYS.map(d => d[0]);
  const byWho = {
    nerea: [
      () => { const s = pick(SLOTS.filter(x => x.part === 'tarde')); return { who: 'nerea', lines: [`¡Hola! Te escribo por el plan. El ${s.day} por la tarde tendré clase de música, así que ese día no podré salir por la tarde.`], test: P => !Object.values(P).includes(s.id), fail: [`¡Ay, no! El ${s.day} por la tarde tendré clase de música.`], en: `Nerea: music class on ${s.day} afternoon` }; },
      () => { const d = dpick(D); return { who: 'nerea', lines: [`¡Hola! Mis amigos verán las luces del barrio el ${d} por la noche. ¡Iremos con ellos, ¿vale?!`], test: P => P.luces && slotById(P.luces).day === d, fail: [`Pero mis amigos irán a ver las luces el ${d} por la noche. ¡Iremos con ellos!`], en: `Nerea: lights with friends on ${d} night` }; },
    ],
    vicent: [
      () => { const s = pick(SLOTS.filter(x => x.part === 'noche')); return { who: 'vicent', lines: [`Hola, soy Vicent. Una cosa: el ${s.day} por la noche cenaremos con los tíos en casa. Esa noche no saldremos.`], test: P => !Object.values(P).includes(s.id), fail: [`El ${s.day} por la noche cenaremos con los tíos, ¿te acuerdas?`], en: `Papá: dinner at home ${s.day} night` }; },
      () => { const d = dpick(D); return { who: 'vicent', lines: [`Hola, soy Vicent. El ${d} no trabajaré por la tarde. ¡Iremos juntos a la mascletà!`], test: P => P.mascleta === SLOTS.find(s => s.day === d && s.part === 'tarde').id, fail: [`Yo solo podré ir a la mascletà el ${d}. ¡Iremos ese día!`], en: `Papá: mascletà together on ${d}` }; },
    ],
    amparo: [
      () => { const d = dpick(['miércoles', 'jueves']); return { who: 'amparo', lines: [`Hola, cariño. Este año llevaré mi ramo a la Virgen el ${d}. ¡Vendrás conmigo a la ofrenda!`], test: P => P.ofrenda && slotById(P.ofrenda).day === d, fail: [`La ofrenda será el ${d}, cariño. Llevaré mi ramo ese día.`], en: `Mamá: ofrenda on ${d}` }; },
      () => ({ who: 'amparo', lines: ['Hola, cariño. Después de la ofrenda estaremos muy cansados: esa noche no haremos nada más.'], test: P => { if (!P.ofrenda) return true; const s = slotById(P.ofrenda), other = SLOTS.find(x => x.day === s.day && x.part === 'noche').id; return !Object.values(P).includes(other); }, fail: ['Después de la ofrenda estaremos muy cansados. Esa noche no saldremos.'], en: 'Mamá: nothing the night of the ofrenda' }),
    ],
    pepa: [
      () => ({ who: 'pepa', lines: ['Hola, soy la abuela. Os invitaré a buñuelos con chocolate, pero por la noche no saldré: me acostaré pronto.'], test: P => P.bunyols && slotById(P.bunyols).part === 'tarde', fail: ['Por la noche no saldré, cariño. ¡Iremos a por buñuelos por la tarde!'], en: 'Abuela: buñuelos in the afternoon' }),
      () => { const d = dpick(D); return { who: 'pepa', lines: [`Hola, soy la abuela. El ${d} no tendré nada que hacer. Ese día os invitaré a buñuelos.`], test: P => P.bunyols && slotById(P.bunyols).day === d, fail: [`Os invitaré a buñuelos el ${d}, cariño. Los otros días estaré ocupada.`], en: `Abuela: buñuelos on ${d}` }; },
    ],
    pau: [
      () => { const d = dpick(D); return { who: 'pau', lines: [`¡Hola! Soy Pau. ¡Quiero ir a la mascletà con vosotros! Pero el ${d} tendré excursión con el cole y no podré ir.`], test: P => !P.mascleta || slotById(P.mascleta).day !== d, fail: [`¡No! El ${d} tendré excursión. ¡Yo también quiero ir a la mascletà!`], en: `Pau: no mascletà on ${d}` }; },
    ],
  };
  for (let tries = 0; tries < 400; tries++) {
    const cs = ['nerea', 'vicent', 'amparo', 'pepa', 'pau'].map(w => pick(byWho[w])());
    const sols = solutions(cs);
    if (sols.length >= 1 && sols.length <= 4) return { cs, sols };
  }
  const cs = [byWho.pau[0](), byWho.pepa[0]()]; return { cs, sols: solutions(cs) };
}
function solutions(cs) {
  const out = [], ids = SLOTS.map(s => s.id);
  for (const a of ids) for (const b of ids) for (const c of ids) for (const d of ids) {
    if (new Set([a, b, c, d]).size < 4) continue;
    const P = { mascleta: a, ofrenda: b, luces: c, bunyols: d };
    if (!ACT_KEYS.every(k => slotOk(k, slotById(P[k])))) continue;
    if (cs.every(x => x.test(P))) out.push(P);
  }
  return out;
}

/* ============ 6 · MISSIONS ============ */
let WEEK = null, PLAN = {};
async function startGame() {
  session = newSession(); found.clear(); PLAN = {}; clearFb(); ia(''); hideGo();
  $id('summary').hidden = true; $id('summary').innerHTML = '';
  drawThemes(); rebuild(Object.keys(BUILT));
  WEEK = makeConstraints();
  renderMissions('plan'); renderGems(); renderPlan(); renderMsgs();
  enterScene('calle', { look: 'golden', place: '<b>Lunes 15 de marzo</b> · Valencia · La calle de Nerea' });
  orbit.tR = 36;
  await talk(['¡Hola! Soy Lucía. ¡Bienvenidos a Valencia!', 'Es marzo y la ciudad celebra su gran fiesta: ¡las Fallas!', 'Esta semana vivirás con la familia de mi amiga Nerea.', 'Primero, escucharás sus mensajes y harás el plan de la semana. Al final, escribirás un blog sobre todo lo que hiciste.', '¡Disfruta, y busca los datos de Valencia!'], CAST.lucia);
  await missionPlan();
  await missionMessage();
  await missionWeek();
  await missionBlog();
  enterScene('crema', { look: 'night', place: '<b>Sábado 20 de marzo</b> · Valencia' });
  await talk(['¡Qué semana! Valencia ya no tiene secretos para ti.', 'Yo me voy de viaje otra vez. Mi próximo destino: La Habana, en Cuba. ¡Nos vemos allí!'], CAST.lucia);
  endSession();
}

/* ---- Mission 1: the voice messages and the plan ---- */
function renderMsgs() {
  const ul = $id('msgList');
  if (!WEEK) { ul.innerHTML = '<li class="empty">Voice messages from the family will appear here.</li>'; return; }
  ul.innerHTML = WEEK.cs.map((c, i) => `<li class="vmsg${c.heard ? ' heard' : ''}"><button class="aplay" type="button" data-m="${i}" aria-label="Escuchar">▶</button><div><b>${esc(CAST[c.who].name)}</b><span class="wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><p class="es-text">${esc(c.lines.join(' '))}</p></div></li>`).join('');
  ul.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { const c = WEEK.cs[+b.dataset.m]; c.heard = true; b.closest('li').classList.add('heard'); talk(c.lines, CAST[c.who], { replay: !c.logged }); c.logged = true; }));
}
function renderPlan(editable = false, onChange) {
  const el = $id('planView');
  const cell = s => { const a = ACT_KEYS.find(k => PLAN[k] === s.id); return `<td class="slot${a ? ' full' : ''}${editable ? ' ed' : ''}" data-s="${s.id}">${a ? `<span class="tok">${ACTS[a].icon} ${esc(ACTS[a].short)}</span>` : '<span class="ph">—</span>'}</td>`; };
  el.innerHTML = `<table class="plan"><thead><tr><th></th>${DAYS.map(d => `<th>${capFirst(d[0])} ${d[1]}</th>`).join('')}<th>Viernes 19</th></tr></thead><tbody>
    <tr><th>Por la tarde</th>${DAYS.map(d => cell(SLOTS.find(s => s.day === d[0] && s.part === 'tarde'))).join('')}<td class="slot fixed"><span class="ph">—</span></td></tr>
    <tr><th>Por la noche</th>${DAYS.map(d => cell(SLOTS.find(s => s.day === d[0] && s.part === 'noche'))).join('')}<td class="slot fixed full"><span class="tok">🔥 La cremà</span></td></tr></tbody></table>`;
  if (editable) el.querySelectorAll('td.ed').forEach(td => td.addEventListener('click', () => onChange && onChange(td.dataset.s)));
}
async function missionPlan() {
  renderMissions('plan');
  setTask('The family has sent you <b>five voice messages</b> about the week (on the right, under <b>Mensajes</b>). Listen to each one, then make the plan: put each activity in a free afternoon or evening so that it works for everyone. Friday night is the cremà.', 'Misión 1 · El plan');
  await talk(['¡Hola! Soy Nerea. ¡Qué bien que estás aquí!', 'Mi familia te ha mandado unos mensajes de voz. Escúchalos y haz el plan de la semana. ¡Habrá mascletà, ofrenda, luces y buñuelos!'], CAST.nerea);
  renderMsgs();
  setHelp(lvl => lvl === 0 ? 'Each message gives one rule. Replay a message as often as you like (▶). Some activities only happen at certain times: see the small rules under each activity.' : 'Write the rules down as you listen: who, which day, afternoon or evening, and what they can or can’t do.');
  let sel = null, checks = 0, fails = 0;
  const draw = () => {
    ia(`<div class="acts">${ACT_KEYS.map(k => `<button type="button" class="act${sel === k ? ' sel' : ''}${PLAN[k] ? ' placed' : ''}" data-a="${k}"><span class="ic">${ACTS[k].icon}</span><b>${esc(ACTS[k].short)}</b><small>${esc(ACTS[k].rule)}</small></button>`).join('')}</div>
      <p class="keyhelp">Click an activity, then click a cell in <b>Tu plan</b> (right). Click a filled cell to empty it.</p>
      <div class="row"><button class="btn primary" type="button" id="checkPlan"${ACT_KEYS.every(k => PLAN[k]) ? '' : ' disabled'}>Comprobar el plan</button></div>`);
    $id('ia').querySelectorAll('.act').forEach(b => b.addEventListener('click', () => { sel = b.dataset.a; draw(); }));
    renderPlan(true, sid => {
      const here = ACT_KEYS.find(k => PLAN[k] === sid);
      if (here && !sel) { delete PLAN[here]; draw(); return; }
      if (!sel) { if (here) { delete PLAN[here]; draw(); } return; }
      if (here) delete PLAN[here];
      PLAN[sel] = sid; sel = ACT_KEYS.find(k => !PLAN[k]) || null; draw();
    });
    const cb = $id('checkPlan'); if (cb) cb.addEventListener('click', check);
  };
  let resolveP; const done = new Promise(r => resolveP = r);
  const check = async () => {
    checks++; clearFb();
    for (const k of ACT_KEYS) { const s = slotById(PLAN[k]); if (!slotOk(k, s)) { fails++; const why = ACTS[k].parts.includes(s.part) ? `La ofrenda es el miércoles 17 y el jueves 18, no el ${s.day}.` : k === 'mascleta' ? 'La mascletà es a las dos de la tarde, ¡no por la noche!' : 'Las luces se ven por la noche, cuando ya es de noche.'; fb('err', ACTS[k].short, ACTS[k].rule); await talk([why], CAST.nerea); return; } }
    const bad = WEEK.cs.find(c => !c.test(PLAN));
    if (bad) { fails++; fb('err', CAST[bad.who].name, `This plan doesn’t work for ${CAST[bad.who].name.split(' ')[0]}. Listen to their message again.`); session.stats.misses++; await talk(bad.fail, CAST[bad.who]); return; }
    fb('ok', '¡Perfecto!', checks === 1 ? 'The plan works for everyone, first time!' : `The plan works for everyone (${checks} checks).`);
    setPick(null); renderPlan(false); ia('');
    await talk(['¡Genial! ¡Será una semana increíble!'], CAST.nerea);
    finishMission('plan', fails === 0 ? 3 : fails <= 2 ? 2 : 1);
    resolveP();
  };
  draw();
  await done;
  session.plan = Object.assign({}, PLAN);
}

/* ---- Mission 2: the message to the family (simple future) ---- */
const DAY_RX = { martes: /\bmartes\b/, miércoles: /\bmiercoles\b/, jueves: /\bjueves\b/, viernes: /\bviernes\b/, lunes: /\blunes\b/ };
function sentencesOf(raw) { return raw.split(/(?<=[.!?;\n])\s*|\s+(?=y (?:el|luego|despues|después|por) )/).map(s => s.trim()).filter(Boolean); }
function nearestDay(sentence, idx) {
  const n = norm(sentence); let best = null;
  for (const [d, rx] of Object.entries(DAY_RX)) { const m = new RegExp(rx.source, 'g'); let x; while ((x = m.exec(n))) { const dist = Math.abs(x.index - idx); if (!best || dist < best.dist) best = { d, dist }; } }
  return best && best.d;
}
function checkPlanText(raw) {
  const res = {};
  const sents = raw.split(/(?<=[.!?;\n])/).map(s => s.trim()).filter(Boolean);
  ACT_KEYS.forEach(k => {
    const A = ACTS[k], s = slotById(PLAN[k]); res[k] = { status: 'missing' };
    for (const sent of sents) {
      const n = norm(sent), m = n.match(new RegExp(A.rx.source));
      if (!m) continue;
      // split a sentence that lists two days: take the clause around the activity
      const d = nearestDay(sent, m.index), f = analyzeFuture(sent);
      const partWrong = (/\btarde\b/.test(n) && s.part === 'noche' && !/\bnoche\b/.test(n)) || (/\bnoche\b/.test(n) && s.part === 'tarde' && !/\btarde\b/.test(n));
      if (!d) { res[k] = { status: 'noday', sent }; continue; }
      if (d !== s.day) { res[k] = { status: 'wrongday', d, sent }; continue; }
      if (!f.fut.length) { res[k] = { status: 'nofuture', sent, f }; continue; }
      res[k] = { status: partWrong ? 'part' : 'ok', sent }; break;
    }
  });
  return res;
}
async function missionMessage() {
  renderMissions('mensaje');
  setTask('Now tell the family your plan in the <b>group chat</b>. Write one sentence for each activity, with the day, in the <b>simple future</b>: <i>iremos, veremos, comeremos, llevaremos, haremos, saldremos…</i>', 'Misión 2 · El mensaje');
  await talk(['¡Ahora escribe el plan en el grupo de la familia! Así todos sabrán qué haremos cada día.'], CAST.nerea);
  setHelp(lvl => ['Start each sentence with the day: “El martes por la tarde iremos a la mascletà.”', 'Simple future = infinitive + é, ás, á, emos, éis, án: iremos, veremos, comeremos. Irregular: haremos, saldremos, tendremos, podremos, vendremos.', 'Example: “El jueves por la noche veremos las luces del barrio y comeremos buñuelos.”'][Math.min(lvl, 2)]);
  composer({ multiline: true, placeholder: 'El martes por la tarde iremos a…', rows: 5 });
  let tries = 0;
  const text = await waitSubmit(async raw => {
    youSaid(raw); session.stats.messages++; logLine('Tú', raw);
    if (looksEnglish(norm(raw))) { fb('warn', 'En español, por favor', 'Write it in Spanish.'); return false; }
    tries++;
    const f = analyzeFuture(raw), res = checkPlanText(raw), ok = ACT_KEYS.filter(k => res[k].status === 'ok' || res[k].status === 'part');
    f.slips.forEach(s => fb('err', `<span class="fix"><s>${esc(s.wrote)}</s> → ${esc(s.fix)}</span>`, 'Irregular future stem'));
    f.accents.slice(0, 2).forEach(s => fb('warn', `<span class="fix"><s>${esc(s.wrote)}</s> → ${esc(s.fix)}</span>`, 'The future has an accent on every form except nosotros (iremos).'));
    if (f.irA.length) fb('info', `${esc(f.irA[0])} → simple future`, 'Ir a + infinitive is fine in conversation, but here use the simple future: vamos a ver → veremos.');
    f.present.slice(0, 2).forEach(p => p.fix && fb('info', `<span class="fix"><s>${esc(p.wrote)}</s> → ${esc(p.fix)}</span>`, 'That’s the present. For the plan, use the future.'));
    ACT_KEYS.forEach(k => {
      const r = res[k], s = slotById(PLAN[k]);
      if (r.status === 'ok') fb('ok', ACTS[k].short, `${capFirst(s.day)} por la ${s.part} ✓`);
      else if (r.status === 'part') fb('warn', ACTS[k].short, `In your plan it’s in the ${s.part === 'tarde' ? 'afternoon (por la tarde)' : 'evening (por la noche)'}.`);
      else if (r.status === 'wrongday') fb('err', ACTS[k].short, `In your plan it’s on ${s.day}, not ${r.d}.`);
      else if (r.status === 'noday') fb('warn', ACTS[k].short, 'Say which day.');
      else if (r.status === 'nofuture') fb('warn', ACTS[k].short, 'Use a verb in the simple future in that sentence (iremos, veremos…).');
      else fb('info', ACTS[k].short, 'Not in your message yet.');
    });
    accentTips(raw);
    const met = ok.length === 4;
    if (met || tries >= 3) {
      session.writing.push({ scene: 'Mensaje a la familia', text: raw });
      session.details.futVerbs = f.verbs.length; session.details.futSlips = f.slips.length;
      const stars = met ? (f.verbs.length >= 2 && !f.slips.length ? 3 : 2) : 1;
      finishMission('mensaje', stars); ia('');
      await talk(met ? ['¡Perfecto! Así lo haremos. ¡Qué ganas!'] : ['Bueno, ya lo hablaremos en casa. ¡Vamos!'], CAST.amparo);
      return raw;
    }
    const miss = ACT_KEYS.find(k => !ok.includes(k));
    await talk([`¿Y ${ACTS[miss].es}? ¿Qué día iremos?`], CAST.nerea);
    return false;
  });
  return text;
}

/* ---- Mission 3: the week, scene by scene ---- */
const NUM_ES = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte'];
const CENT_ES = { 10: 'diez', 20: 'veinte', 30: 'treinta', 40: 'cuarenta', 50: 'cincuenta', 60: 'sesenta', 70: 'setenta', 80: 'ochenta', 90: 'noventa' };
function eurosEs(x) { const e = Math.floor(x + 1e-6), c = Math.round((x - e) * 100); return `${NUM_ES[e]} ${e === 1 ? 'euro' : 'euros'}${c ? ' con ' + CENT_ES[c] : ''}`; }
const eurosNum = x => x.toFixed(2).replace('.', ',') + ' €';
async function missionWeek() {
  renderMissions('semana');
  const order = ACT_KEYS.slice().sort((a, b) => SLOTS.findIndex(s => s.id === PLAN[a]) - SLOTS.findIndex(s => s.id === PLAN[b]));
  session.stats.misses = 0; const before = session.stats.misses;
  for (const k of order) {
    const s = slotById(PLAN[k]), when = `${capFirst(s.day)} ${s.n} de marzo · por la ${s.part}`;
    clearFb(); ia(''); hideGo();
    await titleCard(when, ACTS[k].short, ACTS[k].place);
    await TASKS[k](s);
    session.events.push({ act: k, day: s.day, part: s.part });
  }
  clearFb(); ia(''); hideGo();
  await titleCard('Viernes 19 de marzo · por la noche', 'La cremà', 'Plaza del Ayuntamiento');
  await TASKS.crema();
  session.events.push({ act: 'crema', day: 'viernes', part: 'noche' });
  const misses = session.stats.misses - before;
  session.details.weekMisses = misses;
  finishMission('semana', misses <= 1 ? 3 : misses <= 4 ? 2 : 1);
}
const lookFor = (k, s) => ({ plaza: 'day', ofrenda: 'golden', calle: 'dusk', bunyols: s.part === 'tarde' ? 'golden' : 'dusk' })[ACTS[k].scene];
const TASKS = {
  async mascleta(s) {
    const api = enterScene('plaza', { look: 'day', place: `<b>${capFirst(s.day)} ${s.n}</b> · Plaza del Ayuntamiento · 13:45` });
    const keys = Object.keys(api.SPOTS), spot = pick(keys), S = api.SPOTS[spot];
    api.placeCousins(spot); session.details.cousins = S; window.__expect = spot;
    setTask('Find Nerea’s cousins, Jordi and Laia. Listen to where they’re waiting, then <b>click that place in the square</b>.', 'La mascletà');
    setHelp(lvl => lvl === 0 ? 'Listen for the landmark: el balcón del Ayuntamiento, el cartel en valenciano, el puesto de buñuelos or el quiosco de periódicos.' : `They’re ${S.en}.`);
    await talk([`¡Ya estamos en la plaza! Mis primos Jordi y Laia nos esperarán ${S.es}.`, '¿Los ves? ¡Búscalos!'], CAST.nerea);
    let misses = 0;
    while (true) {
      const id = await pick3D(api.targets);
      if (id === spot) break;
      misses++; session.stats.misses++; try { SFX.play('wrong'); } catch (e) {}
      if (misses >= 2) fb('info', S.es, `They’re ${S.en}.`);
      await talk([`No, allí no están. Te lo repito: nos esperarán ${S.es}.`], CAST.nerea);
    }
    setPick(null); fb('ok', '¡Los encontraste!', S.en);
    await talk(['¡Hola! ¡Por fin! La mascletà empezará dentro de un minuto.'], CAST.laia);
    setTask('Watch the mascletà. Press the button when you’re ready. (Turn the volume down a little!)', 'La mascletà');
    await goButton('¡Que empiece la mascletà!');
    await talk(['Senyor pirotècnic, pot començar la mascletà!'], CAST.fallera);
    await new Promise(r => api.startShow(r));
    hideGo();
    await talk(['¡Qué fuerte! ¡Me ha encantado! Mañana a las dos volveremos a oírla desde casa.'], CAST.nerea);
  },
  async luces(s) {
    const api = enterScene('calle', { look: 'dusk', place: `<b>${capFirst(s.day)} ${s.n}</b> · Una calle del barrio · 21:00` });
    setTask('The president of the neighbourhood falla wants your vote for the <b>ninot indultat</b>. Listen to his favourite, then <b>click that figure</b> around the base of the falla.', 'La falla del barrio');
    setHelp(lvl => lvl === 0 ? 'Listen for two things: what the figure is holding (tiene…) and what it’s wearing (lleva…).' : `His favourite: ${api.vote.short}.`);
    await talk(['¡Bienvenidos a nuestra falla! Este año votaremos por el ninot indultat.', `Mi ninot favorito ${api.vote.desc}. ¿Cuál es? ¡Vota por él!`], CAST.toni);
    orbit.tR = 17; orbit.tPh = 1.2; orbit.target.set(0, 3, 0); window.__expect = api.vote.idx;
    let misses = 0;
    while (true) {
      const id = await pick3D(api.targets);
      if (id === api.vote.idx) break;
      misses++; session.stats.misses++; try { SFX.play('wrong'); } catch (e) {}
      if (misses >= 2) fb('info', api.vote.short, '');
      await talk([`No, ese no. Mi favorito ${api.vote.desc}.`], CAST.toni);
    }
    setPick(null); fb('ok', '¡Voto registrado!', api.vote.short);
    session.details.ninot = api.vote;
    await talk(['¡Ese es! ¡El mío! Muchas gracias por tu voto.'], CAST.toni);
    orbit.tR = 33; orbit.target.set(0, 7, 0);
    await talk(['¡Mira qué luces! Esta noche nos quedaremos aquí un rato, ¿vale?'], CAST.nerea);
  },
  async ofrenda(s) {
    const api = enterScene('ofrenda', { look: 'golden', place: `<b>${capFirst(s.day)} ${s.n}</b> · Plaza de la Virgen · 18:00` });
    setTask('Amparo will tell you which bouquet is yours. Listen, then <b>click your bouquet</b> on the table.', 'La ofrenda');
    setHelp(lvl => lvl === 0 ? 'Listen for the colours of the carnations (claveles) and of the ribbon (la cinta).' : `Yours: ${api.bouquet.desc}.`);
    api.focus(true); window.__expect = api.bouquet.idx;
    await talk(['¡Ya estamos! Mira, aquí están los ramos de la familia.', `Tú llevarás el ramo de ${api.bouquet.desc}.`], CAST.amparo);
    let misses = 0;
    while (true) {
      const id = await pick3D(api.targets);
      if (id === api.bouquet.idx) break;
      misses++; session.stats.misses++; try { SFX.play('wrong'); } catch (e) {}
      if (misses >= 2) fb('info', api.bouquet.desc, '');
      await talk([`Ese no es, cariño. El tuyo es el de ${api.bouquet.desc}.`], CAST.amparo);
    }
    setPick(null); fb('ok', '¡Ese es tu ramo!', api.bouquet.desc);
    session.details.bouquet = api.bouquet;
    api.focus(false);
    await talk(['¡Muy bien! Ahora iremos en la procesión hasta la Virgen.'], CAST.amparo);
    setTask('Join the procession and hand over your bouquet.', 'La ofrenda');
    await goButton('Entregar el ramo');
    for (let i = 0; i < 4; i++) { api.deliver(); await sleep(250); }
    hideGo();
    await talk(['¡Qué emoción! Con nuestras flores, el manto quedará precioso.'], CAST.amparo);
  },
  async bunyols(s) {
    const api = enterScene('bunyols', { look: s.part === 'tarde' ? 'golden' : 'dusk', place: `<b>${capFirst(s.day)} ${s.n}</b> · Puesto de buñuelos · ${s.part === 'tarde' ? '18:30' : '21:30'}` });
    const items = shuffle(Object.keys(api.MENU)).slice(0, 3), who = ['Yo', 'La abuela', 'Pau'];
    const total = items.reduce((t, k) => t + api.MENU[k][1], 0); window.__expect = { items: items.map(k => api.MENU[k][0]), total: eurosNum(total) };
    setTask('Listen to what everyone wants, then <b>order for the whole family</b> from the vendor. Be polite: use <i>usted</i> and <i>por favor</i>. The menu with prices is on the stall.', 'Los buñuelos');
    setHelp(lvl => lvl === 0 ? 'Polite orders: “Me pone…, por favor”, “Quería…”, “¿Me da…?” List all three things.' : `Order: ${items.map(k => api.MENU[k][0]).join(', ')}.`);
    await talk([`¡Qué hambre! Yo quiero ${api.MENU[items[0]][0]}.`, `La abuela tomará ${api.MENU[items[1]][0]} y Pau, ${api.MENU[items[2]][0]}.`, 'Pide tú para todos, ¿vale?'], CAST.nerea);
    await talk(['¡Buenas! ¿Qué les pongo?'], CAST.vendedor);
    composer({ placeholder: 'Me pone…, por favor.' });
    let tries = 0;
    const order = await waitSubmit(async raw => {
      youSaid(raw); session.stats.messages++; logLine('Tú', raw); tries++;
      const n = norm(raw), missing = items.filter(k => !api.MENU[k][2].test(n)), extra = Object.keys(api.MENU).filter(k => !items.includes(k) && api.MENU[k][2].test(n));
      const polite = /por favor|quer[ií]a|me pone|nos pone|me da|nos da|querr[ií]a|podr[ií]a|usted/.test(n), tu = /(?:^| )(dame|ponme|quieres|tienes|puedes|me das|me pones)(?= |$)/.test(n);
      if (tu) fb('warn', 'Usted', 'Use usted with the vendor: “¿Me pone…?”, “¿Me da…?”, not “ponme / dame”.');
      if (extra.length) fb('warn', api.MENU[extra[0]][0], 'Nobody asked for that.');
      accentTips(raw);
      if (missing.length && tries < 3) { session.stats.misses++; fb('err', 'Falta algo', 'Something is missing from the order.'); await talk([`Muy bien… ¿y qué más?`], CAST.vendedor); if (tries === 2) await talk([`¡Te olvidas de ${api.MENU[missing[0]][0]}!`], CAST.nerea); return false; }
      if (polite && !tu) fb('ok', 'Muy educado', 'Polite and clear.');
      session.writing.push({ scene: 'El pedido', text: raw });
      return raw;
    });
    ia(''); api.drop(); session.details.order = items.map(k => api.MENU[k]);
    await talk(['¡Marchando! Aquí tienen.', `Son ${eurosEs(total)}.`], CAST.vendedor);
    setTask('How much is it? Listen to the vendor and choose the right amount to pay.', 'Los buñuelos');
    const wrongs = shuffle([total + 1, total - 1, total + 10, Math.max(1, total - .9)].filter(x => x > 0 && Math.abs(x - total) > .01)).slice(0, 2);
    const misses = await choice(shuffle([{ label: eurosNum(total), ok: true }, ...wrongs.map(x => ({ label: eurosNum(x), onWrong: () => { session.stats.misses++; try { SFX.play('wrong'); } catch (e) {} talk([`No, no. Son ${eurosEs(total)}.`], CAST.vendedor); } }))]));
    fb('ok', eurosNum(total), misses ? '' : 'Right first time.');
    await talk(['¡Gracias! ¡Que aproveche!'], CAST.vendedor);
    await talk(['¡Mmm, qué ricos! Los buñuelos de la abuela son los mejores, pero estos también.'], CAST.nerea);
  },
  async crema() {
    const api = enterScene('crema', { look: 'night', place: '<b>Viernes 19</b> · Plaza del Ayuntamiento · 00:50' });
    const INSTR = window.__instr = shuffle([['no crucen las vallas', 'Don’t cross the barriers.'], ['dejen libre el paso de los bomberos', 'Keep the firefighters’ path clear.'], ['no lancen petardos durante la cremà', 'Don’t throw firecrackers during the cremà.']]);
    setTask('Listen to the announcement. Then answer Nerea’s questions.', 'La cremà');
    setHelp('Listen for the time (la una, la una y media…) and for what people are asked to do (por favor, …).');
    await talk(['Atención, por favor.', 'La cremà de la falla de la plaza empezará a la una en punto.', `Por favor, ${INSTR[0][0]}. Muchas gracias.`], CAST.megafonia);
    await talk(['¿Qué han dicho? ¿A qué hora será la cremà?'], CAST.nerea);
    await choice(shuffle([{ label: '00:30', onWrong: () => { session.stats.misses++; try { SFX.play('wrong'); } catch (e) {} } }, { label: '01:00', ok: true }, { label: '01:30', onWrong: () => { session.stats.misses++; try { SFX.play('wrong'); } catch (e) {} } }]));
    await talk(['¿Y qué nos piden?'], CAST.nerea);
    await choice(shuffle(INSTR.map((x, i) => ({ label: x[1], ok: i === 0, onWrong: () => { session.stats.misses++; try { SFX.play('wrong'); } catch (e) {} } }))));
    fb('ok', '¡Eso es!', INSTR[0][1]);
    await talk(['¡Ya es la una! ¡Empieza la cremà!'], CAST.nerea);
    setTask('The last night of Fallas. Press the button to start the cremà.', 'La cremà');
    await goButton('¡Que empiece la cremà!');
    await new Promise(resolve => api.start({
      onFuse: () => talk(['¡Mira! La fallera mayor ha encendido la traca.'], CAST.nerea),
      onBurn: () => talk(['¡Ya arde! ¡Qué calor!'], CAST.nerea),
      onEnd: resolve,
    }));
    hideGo();
    await talk(['¡Adiós, falla! El año que viene volveremos a la plaza.'], CAST.nerea);
  },
};

/* ---- Mission 4: the blog (preterite) ---- */
const EVENT_RX = { mascleta: ACTS.mascleta.rx, ofrenda: ACTS.ofrenda.rx, luces: /\b(?:luces|barrio|falla infantil|ninots?|presidente|votamos|vote)\b/, bunyols: ACTS.bunyols.rx, crema: /\b(?:crema|quem\w*|fuego|arde|ardio|ardia)\b/ };
const EVENT_ES = { mascleta: 'la mascletà', ofrenda: 'la ofrenda', luces: 'las luces y la falla del barrio', bunyols: 'los buñuelos', crema: 'la cremà' };
function blogFacts(raw) {
  const sents = raw.split(/(?<=[.!?;\n])/).map(s => s.trim()).filter(Boolean), r = { events: new Set(), wrongDay: [], details: [] };
  sents.forEach(sent => {
    const n = norm(sent);
    session.events.forEach(ev => {
      const m = n.match(new RegExp(EVENT_RX[ev.act].source)); if (!m) return;
      r.events.add(ev.act);
      const d = nearestDay(sent, m.index); if (d && stripMarks(d) !== stripMarks(ev.day)) r.wrongDay.push({ ev, said: d });
    });
  });
  const n = norm(raw), D = session.details;
  if (D.cousins && D.cousins.rx.test(n) && /primo|jordi|laia/.test(n)) r.details.push('cousins');
  if (D.ninot && D.ninot.rx.test(n)) r.details.push('ninot');
  if (D.bouquet && D.bouquet.rx.test(n) && /ramo|clavel|flores|cinta/.test(n)) r.details.push('bouquet');
  if (D.order && D.order.filter(o => o[2].test(n)).length >= 2) r.details.push('order');
  return r;
}
async function missionBlog() {
  renderMissions('blog'); clearFb(); ia(''); hideGo();
  enterScene('crema', { look: 'night', place: '<b>Viernes 19</b> · Plaza del Ayuntamiento · 02:00' });
  setTask(`Write a <b>blog post</b> about your week at Fallas, in the <b>preterite</b>: what you did and saw each day (<i>fuimos, vimos, comimos, llevé, votamos, encontramos, quemaron…</i>).
    <ul class="checklist"><li>At least five sentences</li><li>Four or more of the week’s events, with the right days</li><li>A detail only you know: where you met the cousins, the ninot you voted for, your bouquet, or what you ordered</li></ul>`, 'Misión 4 · El blog');
  await talk(['¡Qué semana! Ahora escribe tu blog: cuenta qué hiciste cada día.', 'Yo lo leeré mañana. ¡Y lo compartiré con mis amigos!'], CAST.nerea);
  setHelp(lvl => ['Go day by day: “El martes por la tarde fuimos a la mascletà. Encontramos a Jordi y Laia al lado del…”', 'Preterite, nosotros: fuimos, vimos, comimos, bebimos, llevamos, votamos, hicimos, tuvimos. Yo: fui, vi, comí, llevé, voté, pedí.', 'Include a detail: “Voté por el ninot que tenía un móvil.” “Mi ramo tenía claveles rojos y blancos.”'][Math.min(lvl, 2)]);
  composer({ multiline: true, placeholder: 'El martes por la tarde fuimos a la mascletà…', rows: 8 });
  let tries = 0;
  await waitSubmit(async raw => {
    youSaid(raw); session.stats.messages++; logLine('Tú', raw); tries++;
    if (looksEnglish(norm(raw))) { fb('warn', 'En español, por favor', 'Write it in Spanish.'); return false; }
    const a = analyzePast(raw), facts = blogFacts(raw), wc = words(raw).length, nSent = raw.split(/[.!?]+/).filter(s => words(s).length >= 3).length;
    a.slips.slice(0, 3).forEach(s => fb('err', `<span class="fix"><s>${esc(s.wrote)}</s> → ${esc(s.fix)}</span>`, 'Preterite form'));
    a.accents.slice(0, 2).forEach(s => fb('warn', `<span class="fix"><s>${esc(s.wrote)}</s> → ${esc(s.fix)}</span>`, s.note || 'Accent on the preterite'));
    a.future.slice(0, 2).forEach(s => fb('info', `<span class="fix"><s>${esc(s.wrote)}</s>${s.fix ? ' → ' + esc(s.fix) : ''}</span>`, 'That’s the future. In the blog, the week is over: tell it in the past.'));
    facts.wrongDay.slice(0, 2).forEach(w => fb('err', EVENT_ES[w.ev.act], `That was on ${w.ev.day}, not ${w.said}.`));
    accentTips(raw);
    const okPret = a.pret.length >= 5 && a.distinct >= 3, okEv = facts.events.size >= 4, okLen = nSent >= 5 || wc >= 50;
    fb(okPret ? 'ok' : 'warn', `Pretérito: ${a.pret.length}`, okPret ? `${a.distinct} different verbs` : 'Use at least five preterite verbs (three different ones).');
    fb(okEv ? 'ok' : 'warn', `Eventos: ${facts.events.size}/5`, okEv ? [...facts.events].map(e => EVENT_ES[e]).join(', ') : `Missing: ${['mascleta', 'luces', 'ofrenda', 'bunyols', 'crema'].filter(e => !facts.events.has(e)).map(e => EVENT_ES[e]).join(', ')}`);
    if (!okLen) fb('warn', 'Más, por favor', `Five sentences or more (${nSent} so far).`);
    if (facts.details.length) fb('ok', 'Un detalle', 'Nerea will love that detail.'); else fb('info', 'Un detalle', 'Add something only you know: the cousins’ spot, your ninot, your bouquet or your order.');
    const met = okPret && okEv && okLen && !facts.wrongDay.length;
    if (met || tries >= 3) {
      session.writing.push({ scene: 'El blog', text: raw });
      session.details.blogDetail = facts.details.length > 0; session.details.blogDays = !facts.wrongDay.length;
      const stars = met ? (facts.details.length && a.slips.length <= 1 ? 3 : 2) : 1;
      finishMission('blog', stars); ia('');
      await talk(met ? ['¡Me encanta tu blog! ¡Lo has contado todo!', facts.details.length ? '¡Y te acordaste de todo! ¡Qué memoria!' : '¡Qué bonito!'] : ['¡Gracias! Lo leeré con calma.'], CAST.nerea);
      return raw;
    }
    const miss = ['mascleta', 'luces', 'ofrenda', 'bunyols', 'crema'].find(e => !facts.events.has(e));
    await talk([miss && !okEv ? `¿Y ${EVENT_ES[miss]}? ¿Qué hicimos ese día?` : !okPret ? 'Cuéntame más: ¿qué hiciste? ¿Qué viste?' : '¡Me gusta! Escribe un poco más.'], CAST.nerea);
    return false;
  });
}

/* ============ 7 · END OF SESSION ============ */
function endSession() {
  stopSpeech(); hideGo();
  const mins = Math.max(1, Math.round((Date.now() - session.started) / 60000));
  const total = session.missions.reduce((a, m) => a + m.stars, 0), D = session.details;
  const badges = [
    ['Datos de Valencia', 'Found all six facts about Valencia', found.size >= 6],
    ['Oído fino', 'The whole week with at most one listening slip', (D.weekMisses || 0) <= 1],
    ['El futuro, perfecto', 'Plan message with 3+ different future verbs and no slips', (D.futVerbs || 0) >= 3 && !D.futSlips],
    ['Cronista fallero', 'Blog with the right days and a personal detail', !!(D.blogDetail && D.blogDays)],
  ];
  const el = $id('summary');
  el.innerHTML = `
    <div><p class="eyebrow">Fin de las Fallas · Valencia</p><h2>¡Adiós, Valencia!</h2></div>
    <div class="stats">
      <div class="stat"><div class="v">${total}/12</div><div class="k">Estrellas</div></div>
      <div class="stat"><div class="v">${found.size}/6</div><div class="k">Datos de Valencia</div></div>
      <div class="stat"><div class="v">${session.stats.replays}</div><div class="k">Repeticiones</div></div>
      <div class="stat"><div class="v">${mins}</div><div class="k">Minutos</div></div>
    </div>
    <div class="mrows">${session.missions.map(m => `<div class="mrow"><span>${esc(m.title)}</span><span class="stars">${starStr(m.stars)}</span></div>`).join('')}</div>
    <div class="badges">${badges.map(([t, d, on]) => `<span class="badge${on ? '' : ' off'}" title="${esc(d)}">★ ${esc(t)}</span>`).join('')}</div>
    <div><h3 class="lbl">Lo que escribiste</h3><ol class="transcript" style="margin-top:8px">${session.writing.map(w => `<li><b>${esc(w.scene)}:</b> ${esc(w.text)}</li>`).join('')}</ol></div>
    <p class="outcomes">${session.textShown ? 'Text was turned on during this session' + (session.textReason === 'novoice' ? ' (no Spanish voice on this computer).' : session.textReason === 'accommodation' ? ' (accommodation link).' : '.') + ' · ' : 'Played audio-only. · '}Falla themes: ${esc(THEMES[STATE.theme].es)} (plaza), ${esc(THEMES[STATE.street].es)} (barrio). Outcomes practised (30-3Y): LC–1.3 a (celebrations, cultural) · LC–1.4 b (simple future, preterite) · LC–4.1 b · GC–1.5 a · A–3.2 a · A–4.3 a, b · A–4.4 a · LC–2.1 a · LC–2.3 a · LC–5.1 a · LC–5.2 a.</p>
    <div class="row"><button class="btn primary" type="button" id="againBtn" data-again>Jugar otra vez</button></div>`;
  el.hidden = false;
  try { SFX.celebrate(0); } catch (e) {}
  $id('againBtn').addEventListener('click', () => { el.hidden = true; window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); startGame(); });
  el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  setTask('That’s the end of Fallas. Your summary and report are below.', 'Fin'); ia('');
}

/* ============ 8 · BOOT ============ */
function syncSpeed() { document.querySelectorAll('[data-speed]').forEach(b => b.classList.toggle('on', b.dataset.speed === SETTINGS.speed)); }
function wireUI() {
  $id('introFace').innerHTML = luciaSVG('happy');
  $id('startBtn').addEventListener('click', () => { $id('intro').hidden = true; try { SFX.play('whoosh', { force: true }); } catch (e) {} startGame(); });
  $id('testVoice').addEventListener('click', () => talk(['¡Hola! Bienvenido a Valencia.'], CAST.lucia, { replay: true }));
  $id('replay').addEventListener('click', replay);
  $id('helpBtn').addEventListener('click', onHelp);
  document.querySelectorAll('[data-speed]').forEach(b => b.addEventListener('click', () => { SETTINGS.speed = b.dataset.speed; saveSettings(); syncSpeed(); }));
  $id('slow').addEventListener('click', () => { if (!lastSpoken) return; const sp = SETTINGS.speed; SETTINGS.speed = 'lento'; session && session.stats.slow++; talk(lastSpoken.lines, lastSpoken.who, { replay: true }).then(() => { SETTINGS.speed = sp; }); });
  syncSpeed();
  $id('settingsBtn').addEventListener('click', () => { const d = $id('settingsDlg'); if (d.showModal) d.showModal(); else d.setAttribute('open', ''); });
  $id('closeSettings').addEventListener('click', () => { const d = $id('settingsDlg'); if (d.close) d.close(); else d.removeAttribute('open'); });
  $id('optText').addEventListener('change', e => setText(e.target.checked, 'student'));
  $id('voiceSel').addEventListener('change', e => { SETTINGS.voice = e.target.value; saveSettings(); loadVoices(); talk(['Esta es mi voz.'], CAST.lucia, { replay: true }); });
  const setMute = m => { try { SFX.setMuted(m); } catch (e) {} $id('sfxOn').checked = !m; $id('optSfx').checked = !m; };
  try { setMute(SFX.muted()); } catch (e) {}
  $id('sfxOn').addEventListener('change', e => setMute(!e.target.checked));
  $id('optSfx').addEventListener('change', e => setMute(!e.target.checked));
  document.querySelectorAll('.libtabs button').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('.libtabs button').forEach(x => x.classList.toggle('on', x === b)); document.querySelectorAll('.libpane').forEach(p => p.hidden = p.id !== b.dataset.pane); }));
  document.addEventListener('keydown', e => { if (e.key === 'r' && e.altKey) replay(); });
  initVoices();
  session = newSession();
  if (ACCOMMODATION) setText(true, 'accommodation');
  renderMissions(); renderGems(); renderPlan(); renderMsgs();
  enterScene('plaza', { place: '<b>Valencia</b> · Plaza del Ayuntamiento' });
  frame();
}
wireUI();
window.__fallasGame = { missionBlog, endSession, renderMissions, finishMission, get session() { return session; }, set session(s) { session = s; }, get WEEK() { return WEEK; }, get PLAN() { return PLAN; }, set PLAN(p) { PLAN = p; }, analyzeFuture, analyzePast, checkPlanText, blogFacts, solutions, startGame, setText, TASKS, BUILT, orbit, STATE, state };
