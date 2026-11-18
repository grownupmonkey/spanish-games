/* =====================================================================
   NOCHE DE LEYENDAS · GAME ENGINE
   Reads the DATA block at the top of the file. Sections:
   1 utilities · 2 settings · 3 speech · 4 templates & variables · 5 text analysis
   6 stage & UI · 7 step handlers · 8 map & directions · 9 run flow · 10 end of session
   ===================================================================== */
const $ = id => document.getElementById(id);
const SPEED = () => window.__testSpeed || 1;
const sleep = ms => new Promise(r => setTimeout(r, ms * SPEED()));
const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
const rand = n => Math.floor(Math.random() * n);
const pick = a => a[rand(a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const capFirst = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const starStr = n => '★'.repeat(n) + '☆'.repeat(3 - n);
const stripMarks = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const norm = s => stripMarks(String(s).toLowerCase()).replace(/[¿?¡!.,;:"“”«»()\-–—…'’]/g, ' ').replace(/\s+/g, ' ').trim();
const words = s => s.match(/[A-Za-zÀ-ÖØ-öø-ÿ]+/g) || [];
const keyOf = w => stripMarks(w.toLowerCase());

/* ============ 2 · SETTINGS ============ */
const SPEEDS = { lento: 0.72, normal: 0.92, natural: 1.08 };
const SETTINGS = { text: false, speed: 'normal', voice: '', sfx: true };
try { Object.assign(SETTINGS, JSON.parse(localStorage.getItem('ndl-settings') || '{}')); } catch (e) {}
SETTINGS.text = false; // audio-only by default, every session
const URLP = new URLSearchParams(location.search);
const ACCOMMODATION = URLP.get('texto') === '1';
function saveSettings() { try { localStorage.setItem('ndl-settings', JSON.stringify({ speed: SETTINGS.speed, voice: SETTINGS.voice })); } catch (e) {} }

/* ============ 3 · SPEECH ============ */
const TTS = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let VOICES = [], VOZ = null, speakTok = 0, lastSpoken = null;
function rankVoice(v) {
  const l = (v.lang || '').replace('_', '-');
  if (!/^es(-|$)/i.test(l)) return -1;
  let s = 0;
  const i = GAME.voicePrefs.findIndex(p => p.toLowerCase() === l.toLowerCase());
  if (i >= 0) s += (GAME.voicePrefs.length - i) * 6;
  if (/natural|online|neural/i.test(v.name)) s += 40;
  if (/google/i.test(v.name)) s += 22;
  return s;
}
function loadVoices() {
  if (!TTS) { VOZ = null; applyNoVoice(); return; }
  try { VOICES = speechSynthesis.getVoices().map(v => [rankVoice(v), v]).filter(x => x[0] >= 0).sort((a, b) => b[0] - a[0]).map(x => x[1]); } catch (e) { VOICES = []; }
  VOZ = VOICES.find(v => v.name === SETTINGS.voice) || VOICES[0] || null;
  const sel = $('voiceSel');
  if (sel) sel.innerHTML = VOICES.length ? VOICES.map(v => `<option value="${esc(v.name)}"${v === VOZ ? ' selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('') : '<option>No Spanish voice found</option>';
  const vn = $('vozName'); if (vn) vn.textContent = VOZ ? `${VOZ.name} (${VOZ.lang})` : 'none found';
  applyNoVoice();
}
function applyNoVoice() {
  const none = !VOZ;
  if (!voicesSettled && TTS) return;
  document.body.classList.toggle('no-tts', none);
  if (none) { setText(true, 'novoice'); }
}
let voicesSettled = false;
function initVoices() {
  if (TTS) { loadVoices(); try { speechSynthesis.addEventListener('voiceschanged', () => { voicesSettled = true; loadVoices(); }); } catch (e) {} setTimeout(loadVoices, 600); setTimeout(() => { voicesSettled = true; loadVoices(); }, 2500); }
  else { voicesSettled = true; applyNoVoice(); }
}

function chunkText(t) { return t.split(/(?<=[.!?…»])\s+(?=[¿¡«A-ZÁÉÍÓÚÑ0-9])/).filter(Boolean); }
function speakRaw(text, who = {}, tok) {
  return new Promise(resolve => {
    const rate = SPEEDS[SETTINGS.speed] * (who.rate || 1);
    if (!VOZ || window.__mute) { setTimeout(resolve, Math.max(900, text.length * 55 / rate) * SPEED()); return; }
    const chunks = chunkText(text);
    let i = 0;
    const next = () => {
      if (tok !== speakTok || i >= chunks.length) { resolve(); return; }
      const c = chunks[i++];
      let done = false;
      const fin = () => { if (done) return; done = true; clearTimeout(guard); next(); };
      const guard = setTimeout(fin, (2500 + c.length * 110 / rate));
      try {
        const u = new SpeechSynthesisUtterance(c);
        u.voice = VOZ; u.lang = VOZ.lang; u.rate = rate; u.pitch = who.pitch || 1;
        u.onend = fin; u.onerror = fin;
        speechSynthesis.speak(u);
      } catch (e) { fin(); }
    };
    next();
  });
}
function stopSpeech() { speakTok++; try { if (TTS) speechSynthesis.cancel(); } catch (e) {} setSpeaking(false); }
/* Speak a list of lines as one person. Lines beginning with [en] are stage directions: shown, never spoken. */
async function say(lines, who, opts = {}) {
  lines = [].concat(lines).filter(Boolean);
  if (!lines.length) return;
  stopSpeech();
  const tok = speakTok;
  if (!opts.replay) {
    lastSpoken = { lines, who };
    lines.forEach(l => { if (!l.startsWith('[en]')) logLine(who.name, l); });
  }
  showSpeaker(who);
  for (const l of lines) {
    if (tok !== speakTok) return;
    if (l.startsWith('[en]')) { showSubs(l.slice(4), true); await sleep(1800); continue; }
    showSubs(l);
    setSpeaking(true);
    await speakRaw(l, who, tok);
    if (tok !== speakTok) return;
    setSpeaking(false);
    await sleep(220);
  }
  if (tok === speakTok) { setSpeaking(false); if (!SETTINGS.text) hideSubs(); }
}
function replay() {
  if (!lastSpoken) return;
  session.stats.replays++;
  if (SETTINGS.speed === 'lento') session.stats.slow++;
  say(lastSpoken.lines, lastSpoken.who, { replay: true });
}

/* ============ 4 · TEMPLATES & VARIABLES ============ */
function getPath(obj, path) {
  let o = obj;
  for (const seg of String(path).split('.')) { if (o == null) return undefined; o = o[seg]; }
  return o;
}
function joinList(a) { a = a.filter(x => x !== '' && x != null); return a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1]; }
function fmtVal(v, filter) {
  if (Array.isArray(v)) v = joinList(v.map(x => (x && typeof x === 'object') ? x.name : x));
  else if (v && typeof v === 'object') v = v.name ?? '';
  v = String(v);
  if (filter === 'cap') v = capFirst(v);
  if (filter === 'lower') v = v.toLowerCase();
  return v;
}
function tpl(str, vars, forRegex = false) {
  if (str == null) return '';
  str = String(str);
  if (!forRegex) str = str.replace(/\(\(([^()]*)\)\)/g, (_, alts) => pick(alts.split('|')));
  return str.replace(/\{([\w.$]+)(?:\|(\w+))?\}/g, (m, path, filter) => {
    const v = getPath(vars, path);
    return v === undefined ? m : fmtVal(v, filter);
  });
}
const line = (spec, vars) => tpl(Array.isArray(spec) ? pick(spec) : spec, vars);
const lines = (list, vars) => [].concat(list || []).map(l => line(l, vars));
function resolveRef(ref, vars) {
  if (typeof ref !== 'string') return ref;
  if (ref.startsWith('$')) return getPath(vars, ref.slice(1));
  const m = ref.match(/^([A-Z_]+)\.(\d+)$/);
  if (m && LISTS[m[1]]) return LISTS[m[1]][+m[2]];
  if (LISTS[ref]) return LISTS[ref];
  return ref;
}
function calc(expr, vars) {
  const e = String(expr).replace(/[A-Za-z_$][\w.$]*/g, p => { const v = getPath(vars, p); return Number(v) || 0; });
  if (!/^[\d\s+\-*/().]+$/.test(e)) return 0;
  try { return Math.round(Function('return (' + e + ')')()); } catch (err) { return 0; }
}
function evalSpec(spec, vars) {
  if (spec === null || typeof spec !== 'object' || Array.isArray(spec)) return spec;
  const excl = () => [].concat(spec.exclude || []).flatMap(k => [].concat(getPath(vars, k) ?? []));
  if ('oneOf' in spec) return pick(spec.oneOf);
  if ('range' in spec) { const [a, b] = spec.range, st = spec.step || 1; return a + rand(Math.floor((b - a) / st) + 1) * st; }
  if ('from' in spec) { const ex = excl(); const pool = (LISTS[spec.from] || []).filter(x => !ex.includes(x)); return spec.count ? shuffle(pool).slice(0, spec.count) : pick(pool); }
  if ('pick' in spec) { const ex = excl(); const pool = [].concat(getPath(vars, spec.pick) || []).filter(x => !ex.includes(x)); return pick(pool); }
  if ('calc' in spec) return calc(spec.calc, vars);
  if ('agree' in spec) { const c = getPath(vars, spec.agree), w = getPath(vars, spec.with); return c && w ? c[w.g] : ''; }
  if ('template' in spec) return tpl(spec.template, vars);
  return spec;
}
function applySpecs(specs, vars) { for (const [k, sp] of Object.entries(specs || {})) vars[k] = evalSpec(sp, vars); }
function rx(src, vars) { try { return new RegExp('(?:^| )(?:' + tpl(src, vars, true) + ')'); } catch (e) { return /$^/; } }
const test = (src, n, vars) => rx(src, vars).test(n);

/* numbers in digits or Spanish words */
const NUMW = { cero: 0, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20, veintiuno: 21, veintiun: 21, veintidos: 22, veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29, treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90, cien: 100, ciento: 100, doscientos: 200, trescientos: 300, cuatrocientos: 400, quinientos: 500 };
function parseNums(text) {
  const out = [], toks = norm(text).split(' ');
  let cur = null, wantUnit = false;
  const flush = () => { if (cur != null) out.push(cur); cur = null; wantUnit = false; };
  for (const t of toks) {
    const d = t.match(/^q?(\d+)$/);
    if (d) { flush(); out.push(+d[1]); continue; }
    if (t in NUMW) {
      const v = NUMW[t];
      if (cur == null) cur = v;
      else if (wantUnit && v < 10) { cur += v; wantUnit = false; }
      else if (cur >= 100 && cur % 100 === 0 && v < 100) cur += v;
      else { flush(); cur = v; }
      continue;
    }
    if (t === 'y' && cur != null && cur >= 30 && cur % 10 === 0 && cur % 100 !== 0 || t === 'y' && cur != null && cur > 100 && cur % 10 === 0) { wantUnit = true; continue; }
    flush();
  }
  flush();
  return out;
}

/* ============ 5 · TEXT ANALYSIS (accents, register, past tenses, personal a) ============ */
const ENGLISH = new Set(['the', 'is', 'are', 'i', 'you', 'my', 'want', 'how', 'much', 'where', 'please', 'thanks', 'thank', 'what', 'have', 'did', 'went', 'and', 'it', 'was', 'do', 'can', 'to', 'of', 'he', 'she', 'they', 'this', 'that', 'with', 'yes']);
const looksEnglish = n => { const w = n.split(' '); return w.filter(x => ENGLISH.has(x)).length >= 2 && w.filter(x => ENGLISH.has(x)).length / w.length > .3; };
const ACCENT_WORDS = { tambien: 'también', senor: 'señor', senora: 'señora', anos: 'años', dias: 'días', adios: 'adiós', aqui: 'aquí', alli: 'allí', ahi: 'ahí', manana: 'mañana', despues: 'después', ademas: 'además', cafe: 'café', pepian: 'pepián', jocon: 'jocón', telefono: 'teléfono', camara: 'cámara', mama: 'mamá', papa: 'papá', nino: 'niño', nina: 'niña', lucia: 'Lucía', rapido: 'rápido', ultimo: 'último', habitacion: 'habitación', musica: 'música', pequeno: 'pequeño', pequena: 'pequeña', jamas: 'jamás', perdon: 'perdón', dificil: 'difícil', facil: 'fácil', melodia: 'melodía', policia: 'policía', farmacia: 'farmacia' };
const QWORDS = { como: 'cómo', que: 'qué', donde: 'dónde', cuanto: 'cuánto', cuanta: 'cuánta', cuantos: 'cuántos', cuantas: 'cuántas', cual: 'cuál', quien: 'quién', cuando: 'cuándo', adonde: 'adónde' };
function reviewAccents(raw) {
  const issues = [], isQ = /[?¿]/.test(raw);
  words(raw).forEach(w => {
    const k = keyOf(w);
    let target = ACCENT_WORDS[k];
    if (!target && isQ && QWORDS[k] && /^(\W*)(¿|^)/.test(raw)) target = QWORDS[k];
    if (!target || w.toLowerCase() === target.toLowerCase()) return;
    const fix = /[A-ZÁÉÍÓÚÑ]/.test(w[0]) ? capFirst(target) : target;
    if (!issues.some(x => x.fix === fix)) issues.push({ wrote: w, fix });
  });
  if (raw.includes('?') && !raw.includes('¿')) issues.push({ wrote: '?', fix: '¿…?', punct: true });
  return issues.slice(0, 3);
}
const TU_FORMS = /(?:^| )(puedes|quieres|tienes|sabes|eres|podrias|me das|me dices|me puedes|me traes|me vendes|me cobras|dime|oye|vas a)(?= |$)/;

/* ---- verb tables: generated from infinitives ---- */
const VERBS = {
  ar: 'caminar llegar entrar tomar comprar visitar pagar buscar mirar hablar escuchar bailar cantar llorar gritar regresar encontrar cerrar dejar llevar quedar pasar sacar tocar trabajar viajar usar jugar empezar cruzar dibujar ayudar salvar asustar desmayar despertar enamorar acercar levantar olvidar lavar cortar voltear acompañar castigar terminar esperar preguntar contestar robar montar mostrar sentar notar almorzar cenar desayunar probar pensar soltar llamar amar matar besar cuidar escapar ganar pelear atacar cargar bajar subir? quemar trenzar navegar pintar gobernar firmar llenar derrumbar trasladar mandar casar enojar alcanzar sonar respirar brillar nadar bañar peinar acostar apagar parar callar tirar arrastrar cambiar intentar lograr necesitar recordar preparar sentar arreglar celebrar caminar'.split(' ').filter(v => !v.includes('?')),
  er: 'comer beber correr perder ver aprender conocer volver meter temer romper prometer deber recoger toser caer leer creer parecer aparecer desaparecer crecer nacer ofrecer responder esconder sorprender coger vender poseer devolver mover entender encender proteger'.split(' '),
  ir: 'salir vivir subir abrir escribir recibir decidir descubrir sufrir huir seguir pedir sentir dormir morir repetir servir preferir compartir existir cubrir oir convertir mentir vestir despedir construir destruir'.split(' ')
};
const IRR_STEM = { tener: 'tuv', estar: 'estuv', andar: 'anduv', poder: 'pud', poner: 'pus', saber: 'sup', querer: 'quis', venir: 'vin', hacer: 'hic', decir: 'dij', traer: 'traj', conducir: 'conduj' };
const E_I = { pedir: 1, sentir: 1, repetir: 1, servir: 1, preferir: 1, convertir: 1, mentir: 1, vestir: 1, despedir: 1, seguir: 1 };
const O_U = { dormir: 1, morir: 1 };
const Y_VERBS = { caer: 'ca', leer: 'le', creer: 'cre', oir: 'o', huir: 'hu', construir: 'constru', destruir: 'destru', poseer: 'pose' };
const PRES_STEM = { encontrar: 'encuentr', volver: 'vuelv', poder: 'pued', dormir: 'duerm', morir: 'muer', cerrar: 'cierr', empezar: 'empiez', pensar: 'piens', despertar: 'despiert', sentir: 'sient', querer: 'quier', perder: 'pierd', seguir: 'sig', pedir: 'pid', repetir: 'repit', servir: 'sirv', preferir: 'prefier', jugar: 'jueg', mostrar: 'muestr', sentar: 'sient', acostar: 'acuest', contar: 'cuent', soltar: 'suelt', probar: 'prueb', recordar: 'recuerd', devolver: 'devuelv', mover: 'muev', entender: 'entiend', encender: 'enciend', despedir: 'despid', vestir: 'vist', mentir: 'mient', convertir: 'conviert', almorzar: 'almuerz', gobernar: 'gobiern', sonar: 'suen', acordar: 'acuerd' };
const FORMS = new Map();     // key (no accents) → [{form, inf, tense, person, acc}]
function addForm(form, inf, tense, person) {
  const k = keyOf(form);
  if (!FORMS.has(k)) FORMS.set(k, []);
  FORMS.get(k).push({ form, inf, tense, person, acc: form !== stripMarks(form) });
}
const PRET = {};   // inf → {yo, 3s}
function buildVerbs() {
  const P = ['yo', 'tu', '3s', 'nos', '3p'];
  const all = [...VERBS.ar.map(v => [v, 'ar']), ...VERBS.er.map(v => [v, 'er']), ...VERBS.ir.map(v => [v, 'ir']), ...Object.keys(IRR_STEM).map(v => [v, 'irr'])];
  for (const [inf, cls] of all) {
    const stem = inf.slice(0, -2);
    let pret;
    if (IRR_STEM[inf]) {
      const s = IRR_STEM[inf], j = /j$/.test(s);
      pret = [s + 'e', s + 'iste', inf === 'hacer' ? 'hizo' : s + 'o', s + 'imos', s + (j ? 'eron' : 'ieron')];
    } else if (cls === 'ar') {
      const yo = /car$/.test(inf) ? stem.slice(0, -1) + 'qué' : /gar$/.test(inf) ? stem + 'ué' : /zar$/.test(inf) ? stem.slice(0, -1) + 'cé' : stem + 'é';
      pret = [yo, stem + 'aste', stem + 'ó', stem + 'amos', stem + 'aron'];
    } else if (Y_VERBS[inf]) {
      const b = Y_VERBS[inf];
      pret = [b + 'í', b + 'íste', b + 'yó', b + 'ímos', b + 'yeron'];
      if (inf === 'huir' || inf === 'construir' || inf === 'destruir') pret = [b + 'í', b + 'iste', b + 'yó', b + 'imos', b + 'yeron'];
    } else {
      let s3 = stem;
      if (E_I[inf]) s3 = stem.replace(/e(?=[^e]*$)/, 'i');
      if (O_U[inf]) s3 = stem.replace(/o(?=[^o]*$)/, 'u');
      if (inf === 'ver') pret = ['vi', 'viste', 'vio', 'vimos', 'vieron'];
      else pret = [stem + 'í', stem + 'iste', s3 + 'ió', stem + 'imos', s3 + 'ieron'];
    }
    pret.forEach((f, i) => addForm(f, inf, 'pret', P[i]));
    PRET[inf] = { yo: pret[0], '3s': pret[2], '3p': pret[4] };
    // imperfect
    const imp = cls === 'ar' || inf === 'andar' || inf === 'estar' ? ['aba', 'abas', 'aba', 'ábamos', 'aban'] : ['ía', 'ías', 'ía', 'íamos', 'ían'];
    const istem = inf.slice(0, -2) + (inf === 'oir' ? '' : '');
    if (inf !== 'ver') imp.forEach((e, i) => addForm((inf === 'oir' ? 'o' : istem) + e, inf, 'imp', P[i]));
    // present (3rd person + yo) for tips
    const pst = PRES_STEM[inf] || stem;
    const e3 = cls === 'ar' || ['andar', 'estar'].includes(inf) ? 'a' : 'e';
    if (!['tener', 'estar', 'poder', 'poner', 'saber', 'querer', 'venir', 'hacer', 'decir', 'traer', 'oir', 'ver', 'caer', 'salir', 'seguir', 'huir', 'construir', 'destruir', 'conocer', 'parecer', 'aparecer', 'desaparecer', 'crecer', 'nacer', 'ofrecer', 'proteger', 'recoger', 'coger', 'conducir'].includes(inf)) {
      addForm(pst + e3, inf, 'pres', '3s'); addForm(pst + e3 + 'n', inf, 'pres', '3p'); addForm(inf.slice(0, -2) + 'o', inf, 'pres', 'yo');
      if (PRES_STEM[inf]) addForm(PRES_STEM[inf] + 'o', inf, 'pres', 'yo');
    }
  }
  [['fui', 'yo'], ['fuiste', 'tu'], ['fue', '3s'], ['fuimos', 'nos'], ['fueron', '3p']].forEach(([f, p]) => { addForm(f, 'ir/ser', 'pret', p); });
  PRET['ir/ser'] = PRET.ir = PRET.ser = { yo: 'fui', '3s': 'fue', '3p': 'fueron' };
  [['di', 'yo'], ['diste', 'tu'], ['dio', '3s'], ['dimos', 'nos'], ['dieron', '3p']].forEach(([f, p]) => addForm(f, 'dar', 'pret', p));
  PRET.dar = { yo: 'di', '3s': 'dio', '3p': 'dieron' };
  ['era', 'eras', 'era', 'éramos', 'eran'].forEach((f, i) => addForm(f, 'ser', 'imp', P[i]));
  ['iba', 'ibas', 'iba', 'íbamos', 'iban'].forEach((f, i) => addForm(f, 'ir', 'imp', P[i]));
  ['veía', 'veías', 'veía', 'veíamos', 'veían'].forEach((f, i) => addForm(f, 'ver', 'imp', P[i]));
  addForm('había', 'haber', 'imp', '3s'); addForm('hubo', 'haber', 'pret', '3s');
  [['es', 'ser', '3s', 'fue'], ['son', 'ser', '3p', 'fueron'], ['soy', 'ser', 'yo', 'fui'], ['va', 'ir', '3s', 'fue'], ['van', 'ir', '3p', 'fueron'], ['voy', 'ir', 'yo', 'fui'], ['tiene', 'tener', '3s'], ['tienen', 'tener', '3p'], ['tengo', 'tener', 'yo'], ['esta', 'estar', '3s'], ['estan', 'estar', '3p'], ['estoy', 'estar', 'yo'], ['hace', 'hacer', '3s'], ['hacen', 'hacer', '3p'], ['hago', 'hacer', 'yo'], ['dice', 'decir', '3s'], ['dicen', 'decir', '3p'], ['digo', 'decir', 'yo'], ['puede', 'poder', '3s'], ['pueden', 'poder', '3p'], ['quiere', 'querer', '3s'], ['viene', 'venir', '3s'], ['sale', 'salir', '3s'], ['salgo', 'salir', 'yo'], ['ve', 'ver', '3s'], ['veo', 'ver', 'yo'], ['oye', 'oir', '3s'], ['sigue', 'seguir', '3s'], ['siguen', 'seguir', '3p'], ['cae', 'caer', '3s'], ['huye', 'huir', '3s'], ['aparece', 'aparecer', '3s'], ['desaparece', 'desaparecer', '3s'], ['conoce', 'conocer', '3s'], ['conozco', 'conocer', 'yo'], ['protege', 'proteger', '3s']]
    .forEach(([f, inf, p]) => addForm(f, inf, 'pres', p));
}
buildVerbs();
const NOT_VERBS = new Set(['casa', 'llama', 'cuenta', 'vela', 'ayuda', 'baja', 'cena', 'nada', 'vida', 'cama', 'hora', 'vuelta', 'puerta', 'ropa', 'cara', 'toma', 'pena', 'sola', 'solo', 'como', 'bajo', 'paso', 'camino', 'pelo', 'canto', 'llanto', 'grito', 'miedo', 'susto', 'cuento', 'regreso', 'baile', 'viaje', 'muerte', 'noche', 'calle', 'parte', 'entonces', 'pasa', 'mira', 'queda', 'llega', 'entrada', 'cierra', 'trabajo', 'beso', 'cuido', 'dibujo', 'robo', 'pago', 'compra', 'visita', 'lavo', 'corte', 'llamo', 'gano', 'cambio', 'mando', 'baño', 'bano', 'pelea', 'carga', 'firma', 'pinta', 'nado', 'tira', 'sueno', 'suena', 'vista', 'lleno', 'llena', 'fin', 'cayo', 'era', 'iba', 've', 'va', 'es', 'esta', 'son', 'dio', 'vio', 'fue', 'oye', 'tiene', 'sale', 'muere', 'entra', 'parecia', 'a']);
['era', 'iba', 'dio', 'vio', 'fue', 'cayo'].forEach(w => NOT_VERBS.delete(w));
['es', 'esta', 'son', 'va', 've', 'oye', 'tiene', 'sale', 'muere', 'entra'].forEach(w => NOT_VERBS.delete(w));
const SLIPS = {
  tenio: 'tuvo', teneo: 'tuvo', hacio: 'hizo', decio: 'dijo', dicio: 'dijo', ponio: 'puso', poneo: 'puso', sabio: 'supo', querio: 'quiso', venio: 'vino', pudio: 'pudo', estuvio: 'estuvo',
  pedio: 'pidió', sentio: 'sintió', dormio: 'durmió', morio: 'murió', seguio: 'siguió', repetio: 'repitió', servio: 'sirvió', leio: 'leyó', caio: 'cayó', huio: 'huyó', oio: 'oyó', creio: 'creyó',
  llege: 'llegué', page: 'pagué', juge: 'jugué', busce: 'busqué', toce: 'toqué', sace: 'saqué', empeze: 'empecé', cruze: 'crucé', almorze: 'almorcé',
  dijieron: 'dijeron', trajieron: 'trajeron', hacieron: 'hicieron', tenieron: 'tuvieron', poderon: 'pudieron', sabieron: 'supieron', venieron: 'vinieron', pedieron: 'pidieron', morieron: 'murieron', dormieron: 'durmieron',
  hize: 'hice', teni: 'tuve', estuvi: 'estuve', podi: 'pude', poni: 'puse', hici: 'hice', deci: 'dije', vini: 'vine', andi: 'anduve', ande: 'anduve', sabi: 'supe', queri: 'quise', trai: 'traje'
};
const SLIP_ACCENT = { fué: 'fue', fuí: 'fui', dió: 'dio', vió: 'vio' };
const PERSON_NOUNS = 'muchacha|muchacho|muchachos|mujer|mujeres|hombre|hombres|nino|nina|ninos|hijos|hija|hijo|hijas|senor|senora|joven|chico|chica|guardia|guardias|carcelero|celestina|tatuana|chepe|chabela|tacho|beatriz|madre|mama|papa|padre|novia|novio|vecino|vecina|amigo|amiga|amigos|lavandera|comerciante|monja|monjas|esposa|esposo|gente|familia|campesinos|sombreron|abuelo|abuela|alvarado|pedro|policia|turista';
const PA_VERBS = /^(vio|vieron|veia|encontro|encontraron|busco|buscaron|buscaba|llamo|llamaron|conocio|ayudo|ayudaron|siguio|siguieron|seguia|miro|miraron|miraba|asusto|asustaron|salvo|protegio|acompano|acompanaron|beso|castigo|espero|esperaba|cuido|cuidaba|mato|mataron|queria|amaba|visito|visitaron|encerraron|encerro|acuso|acusaron|llevaron|llevo|despidio|ataco|atacaron|abrazo|escucho|oyo|oia)$/;
const DETS = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'su', 'sus', 'mi', 'mis', 'este', 'esta', 'ese', 'esa', 'aquel', 'aquella', 'otro', 'otra', 'unos', 'unas']);
function analyzePast(raw, person = 'any') {
  const toks = words(raw), r = { pret: [], imp: [], pretYo: [], present: [], slips: [], accents: [], pa: { ok: [], missing: [] } };
  const seen = new Set();
  toks.forEach((w, i) => {
    const k = keyOf(w), lw = w.toLowerCase();
    if (SLIP_ACCENT[lw]) r.accents.push({ wrote: w, fix: SLIP_ACCENT[lw], note: 'One-syllable preterites have no accent.' });
    if (SLIPS[k]) { r.slips.push({ wrote: w, fix: SLIPS[k] }); r.pret.push(SLIPS[k]); if (person === 'yo' && /[eé]$/.test(SLIPS[k])) r.pretYo.push(SLIPS[k]); return; }
    const cands = FORMS.get(k);
    if (!cands) return;
    const hasAcc = w !== stripMarks(w);
    if (NOT_VERBS.has(k) && !hasAcc && !['era', 'iba', 'dio', 'vio', 'fue', 'cayo'].includes(k)) return;
    const pret = cands.filter(c => c.tense === 'pret'), imp = cands.filter(c => c.tense === 'imp'), pres = cands.filter(c => c.tense === 'pres');
    if (imp.length) { r.imp.push(w); return; }
    if (pret.length) {
      let c = pret[0];
      if (person === 'yo') {
        const yoC = pret.find(x => x.person === 'yo');
        const presYo = pres.find(x => x.person === 'yo');
        if (presYo && !hasAcc && !yoC) { if (!NOT_VERBS.has(k)) r.present.push({ wrote: w, fix: PRET[presYo.inf]?.yo }); return; }
        if (yoC) { c = yoC; r.pretYo.push(w); r.pret.push(w); if (yoC.acc && !hasAcc) r.accents.push({ wrote: w, fix: yoC.form }); return; }
        const s3 = pret.find(x => x.person === '3s');
        if (s3 && (hasAcc || !s3.acc) && PRET[s3.inf]) { const prev = keyOf(toks[i - 1] || ''); if (prev === 'yo' || !['el', 'ella', 'usted'].includes(prev)) { r.slips.push({ wrote: w, fix: PRET[s3.inf].yo, note: 'With yo: ' + PRET[s3.inf].yo }); r.pret.push(w); return; } }
        r.pret.push(w); return;
      }
      if (pres.length && !hasAcc && pret.every(x => x.acc)) {
        // ambiguous without the accent (llego/llegó): in a third-person story, read it as the preterite
        const s3 = pret.find(x => x.person === '3s');
        if (s3 && !NOT_VERBS.has(k)) { r.pret.push(w); r.accents.push({ wrote: w, fix: s3.form, note: s3.form + ' (past) needs its accent; without it, it means “I …”.' }); }
        return;
      }
      r.pret.push(w);
      if (c.acc && !hasAcc && !seen.has(k)) { seen.add(k); r.accents.push({ wrote: w, fix: c.form }); }
      return;
    }
    if (pres.length && !NOT_VERBS.has(k)) {
      const p = pres[0];
      const fix = person === 'yo' ? PRET[p.inf]?.yo : PRET[p.inf]?.[p.person === '3p' ? '3p' : '3s'];
      if (fix && (person === 'yo' ? p.person === 'yo' : p.person !== 'yo')) r.present.push({ wrote: w, fix });
    }
  });
  // personal a
  const nt = norm(raw).split(' ');
  nt.forEach((w, i) => {
    if (!PA_VERBS.test(w)) return;
    let j = i + 1;
    if (nt[j] === 'a' || nt[j] === 'al') {
      let k = j + 1; if (DETS.has(nt[k])) k++;
      if (new RegExp('^(' + PERSON_NOUNS + '|nadie|alguien)$').test(nt[k] || '')) r.pa.ok.push(`${w} ${nt[j]} ${nt.slice(j + 1, k + 1).join(' ')}`);
      return;
    }
    let k = j; if (DETS.has(nt[k])) k++;
    if (new RegExp('^(' + PERSON_NOUNS + ')$').test(nt[k] || '')) {
      const phrase = nt.slice(j, k + 1).join(' ');
      const fixed = /^el /.test(phrase) ? phrase.replace(/^el /, 'al ') : 'a ' + phrase;
      r.pa.missing.push({ wrote: `${w} ${phrase}`, fix: `${w} ${fixed}` });
    }
  });
  r.past = r.pret.length + r.imp.length;
  return r;
}

/* ============ 6 · STAGE & UI ============ */
const state = { run: null, scene: null, stage: 0, busy: false, onSubmit: null, helpLevel: 0, step: null, player: null };
const session = newSession();
function newSession() {
  return { game: GAME.id, course: GAME.course, started: Date.now(), textShown: ACCOMMODATION, textReason: ACCOMMODATION ? 'accommodation' : '', missions: [], legends: [], finale: null, writing: [], transcript: [], gems: [], sides: [], stats: { messages: 0, replays: 0, slow: 0, hints: 0, options: 0 } };
}
function logLine(who, text) { session.transcript.push({ who, text, t: Date.now() }); }

function setText(on, reason) {
  SETTINGS.text = on;
  document.body.classList.toggle('show-text', on);
  const cb = $('optText'); if (cb) cb.checked = on;
  if (on) { state.textReason = state.textReason || reason || 'student'; session.textShown = true; session.textReason = session.textReason || state.textReason; showSubs(state.lastSub || ''); }
  else hideSubs();
}
function showSubs(text, stage = false) {
  state.lastSub = stage ? state.lastSub : text;
  const el = $('subs');
  if (stage) { el.innerHTML = `<i>${esc(text)}</i>`; el.hidden = false; return; }
  if (!SETTINGS.text || !text) { el.hidden = true; return; }
  el.innerHTML = `<b>${esc(state.speaker?.name || '')}</b> ${esc(text)}`;
  el.hidden = false;
}
const hideSubs = () => { $('subs').hidden = true; };
function setSpeaking(on) { $('npc').classList.toggle('speaking', on); $('replayBtn').classList.toggle('pulse', false); }
function showSpeaker(who) {
  state.speaker = who;
  if (!who) { $('npc').hidden = true; return; }
  $('npc').hidden = false;
  $('npcName').textContent = who.name;
  const key = who.name + (who.guide ? 'g' : '');
  if ($('npcPortrait').dataset.key !== key) {
    $('npcPortrait').dataset.key = key;
    $('npcPortrait').innerHTML = who.guide ? luciaSVG('happy') : bustSVG(who.look);
    $('npc').classList.remove('enter'); void $('npc').offsetWidth; $('npc').classList.add('enter');
  }
}
function setStage(i) { state.stage = Math.min(i, GAME.clock.length - 1); $('clock').textContent = GAME.clock[state.stage]; }
function setPlace(name) { $('placeName').textContent = name; }
function showScene(cfg, seed) {
  $('mapLayer').hidden = true; $('npc').classList.remove('mini');
  const L = $('sceneLayer');
  L.innerHTML = sceneSVG(cfg, state.stage, seed);
  L.hidden = false;
  L.classList.remove('fadein'); void L.offsetWidth; L.classList.add('fadein');
}
async function titleCard(eyebrow, title, sub) {
  const tc = $('titleCard');
  $('tcEyebrow').textContent = eyebrow; $('tcTitle').textContent = title; $('tcSub').textContent = sub || '';
  tc.hidden = false; tc.classList.remove('out'); SFX.play('whoosh');
  await sleep(1900);
  tc.classList.add('out'); await sleep(500); tc.hidden = true;
}
function setTask(text, eyebrow = 'Ahora') { $('taskEyebrow').textContent = eyebrow; $('task').innerHTML = text; $('task').classList.remove('appear'); void $('task').offsetWidth; $('task').classList.add('appear'); }
function chipEl(kind, es, en) {
  const c = document.createElement('div');
  c.className = 'chip appear ' + kind;
  c.innerHTML = `${es ? `<b>${es}</b>` : ''}${en ? `<span class="en">${en}</span>` : ''}`;
  return c;
}
function fb(kind, es, en, append = true) {
  SFX.play({ ok: 'correct', err: 'wrong', warn: 'hint', info: 'soft' }[kind] || 'soft');
  const c = chipEl(kind, es, en);
  if (append) $('fbs').appendChild(c); else $('fbs').replaceChildren(c);
  return c;
}
const clearFb = () => $('fbs').replaceChildren();
function youSaid(text) {
  const d = document.createElement('div');
  d.className = 'yousaid appear';
  d.innerHTML = `<span>Tú</span><p></p>`;
  d.querySelector('p').textContent = text;
  $('fbs').replaceChildren(d);
}
function ia(html) { const el = $('ia'); el.innerHTML = html; return el; }

/* accent bar (same behaviour as every game in the series) */
const VOWEL = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú' };
const ACCENT_BAR = '<button type="button" data-ch="á">á</button><button type="button" data-ch="é">é</button><button type="button" data-ch="í">í</button><button type="button" data-ch="ó">ó</button><button type="button" data-ch="ú">ú</button><button type="button" data-ch="ñ">ñ</button><button type="button" data-ch="ü">ü</button><button type="button" data-ch="¿">¿</button><button type="button" data-ch="¡">¡</button><span class="caps">a+\' = á · n+~ = ñ · ? = ¿</span>';
function attachAccentInput(input, bar) {
  bar.innerHTML = ACCENT_BAR;
  const flash = ch => { const b = bar.querySelector(`[data-ch="${ch.toLowerCase()}"]`); if (b) { b.classList.add('flash'); setTimeout(() => b.classList.remove('flash'), 350); } };
  input.addEventListener('input', e => {
    if (!e.inputType || !e.inputType.startsWith('insertText')) return;
    const pos = input.selectionStart, v = input.value, last = v[pos - 1], prev = v[pos - 2];
    let rep = null;
    if ((last === "'" || last === '´' || last === '’') && prev && VOWEL[prev]) rep = VOWEL[prev];
    else if (last === '~' && (prev === 'n' || prev === 'N')) rep = prev === 'n' ? 'ñ' : 'Ñ';
    else if (last === ':' && (prev === 'u' || prev === 'U')) rep = prev === 'u' ? 'ü' : 'Ü';
    if (rep) { input.value = v.slice(0, pos - 2) + rep + v.slice(pos); input.setSelectionRange(pos - 1, pos - 1); flash(rep); return; }
    const atStart = pos === 1 || (prev === ' ' && /[.!?]/.test(v[pos - 3] || ''));
    if ((last === '?' || last === '!') && atStart) { const inv = last === '?' ? '¿' : '¡'; input.value = v.slice(0, pos - 1) + inv + v.slice(pos); input.setSelectionRange(pos, pos); flash(inv); }
  });
  bar.querySelectorAll('button').forEach(b => {
    b.addEventListener('pointerdown', e => e.preventDefault());
    b.addEventListener('click', e => {
      const ch = e.shiftKey ? b.dataset.ch.toUpperCase() : b.dataset.ch;
      const s = input.selectionStart ?? input.value.length, en = input.selectionEnd ?? s;
      input.value = input.value.slice(0, s) + ch + input.value.slice(en);
      input.focus(); input.setSelectionRange(s + ch.length, s + ch.length);
    });
  });
}
/* composer: returns a promise-free UI; submissions go to state.onSubmit */
function composer({ multiline = false, placeholder = 'Escribe en español…', numeric = false } = {}) {
  const el = ia(`<div class="composer"><div class="accentbar" id="abar"></div><div class="inputrow">${multiline ? `<textarea id="inp" rows="4" placeholder="${placeholder}"></textarea>` : `<input type="text" id="inp" autocomplete="off" spellcheck="false" placeholder="${placeholder}"${numeric ? ' inputmode="text"' : ''}>`}<button class="btn primary" id="sendBtn" type="button">Enviar</button></div>${multiline ? '<p class="keyhelp"><kbd>Ctrl</kbd>+<kbd>Enter</kbd> to send</p>' : ''}</div>`);
  const inp = $('inp');
  if (!numeric) attachAccentInput(inp, $('abar')); else $('abar').remove();
  const send = () => { const v = inp.value.trim(); if (!v || !state.onSubmit) return; inp.value = ''; state.onSubmit(v); };
  $('sendBtn').addEventListener('click', send);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter' && (!multiline || e.ctrlKey || e.metaKey)) { e.preventDefault(); send(); } });
  setTimeout(() => inp.focus({ preventScroll: true }), 50);
  return el;
}
/* audio choice cards (used for options and audiopick) */
function audioCards(items, { label = 'Opción', onChoose, who }) {
  const el = document.createElement('div');
  el.className = 'acards';
  items.forEach((it, i) => {
    const c = document.createElement('div');
    c.className = 'acard appear';
    c.style.animationDelay = i * 60 + 'ms';
    c.innerHTML = `<button class="aplay" type="button" aria-label="Escuchar">▶</button><div class="alabel"><b>${esc(label)} ${String.fromCharCode(65 + i)}</b><span class="es-text">${esc(it.text)}</span></div><button class="btn small primary achoose" type="button">Elegir</button>`;
    c.querySelector('.aplay').addEventListener('click', () => { c.classList.add('heard'); say([it.text], who || { name: 'Tú', pitch: 1 }, { replay: true }); });
    c.querySelector('.achoose').addEventListener('click', () => onChoose(it, i, c));
    el.appendChild(c);
  });
  return el;
}

/* missions + libreta */
function renderMissions() {
  const run = state.run; if (!run) return;
  $('missionList').innerHTML = run.plan.map((sc, i) => {
    const m = session.missions.find(x => x.id === sc.id);
    const cls = m ? 'done' : (i === run.idx ? 'current' : '');
    return `<li class="${cls}"><span class="n">${i + 1}</span><span class="t">${esc(sc.title)}</span>${m ? `<span class="stars">${starStr(m.stars)}</span>` : ''}</li>`;
  }).join('');
}
function renderLibreta() {
  const L = $('libLegends');
  L.innerHTML = session.legends.length ? session.legends.map(l => `<li><span class="licon">${legendIcon(l.icon)}</span><div><b>${esc(l.title)}</b><span>${esc(l.en)} · told by ${esc(l.teller)}</span></div></li>`).join('') : '<li class="empty">Legends you hear will be collected here.</li>';
  const M = $('libMsgs');
  M.innerHTML = state.notes && state.notes.length ? state.notes.map((n, i) => `<li><button class="aplay small" data-note="${i}" type="button">▶</button><div><b>Lucía · ${esc(n.when)}</b><span class="es-text">${esc(n.lines.join(' '))}</span></div></li>`).join('') : '<li class="empty">Lucía’s voice messages will be here.</li>';
  M.querySelectorAll('[data-note]').forEach(b => b.addEventListener('click', () => { const n = state.notes[+b.dataset.note]; session.stats.replays++; say(n.lines, CAST.lucia, { replay: true }); }));
  const placed = state.run ? state.run.gems.length : GAME.gemsPerRun;
  const found = session.gems.filter(g => state.run && state.run.gems.some(x => x.id === g));
  $('gemCount').textContent = `${found.length}/${placed}`;
  const D = $('libGems');
  D.innerHTML = session.gems.length ? session.gems.map(id => { const g = GEMS.find(x => x.id === id); return `<li><button class="aplay small" data-gem="${id}" type="button">▶</button><div><b>${esc(g.title)}</b><span>${esc(g.en)}</span></div></li>`; }).join('') : '<li class="empty">Find the sparkles ✦ hidden in the city.</li>';
  D.querySelectorAll('[data-gem]').forEach(b => b.addEventListener('click', () => { const g = GEMS.find(x => x.id === b.dataset.gem); say([g.es], CAST.lucia, { replay: true }); }));
}
function legendIcon(k) {
  const I = { hat: '<path d="M2 15h20M7 15c0-6 2-9 5-9s5 3 5 9" stroke="currentColor" stroke-width="2" fill="none"/>', boat: '<path d="M3 15h18l-3 4H6zM12 4v11M12 5l6 8h-6" stroke="currentColor" stroke-width="2" fill="none"/>', dog: '<path d="M4 18v-6l3-5 2 3h6l2-3 2 5v6M8 14h.01M16 14h.01" stroke="currentColor" stroke-width="2" fill="none"/>', drop: '<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z" stroke="currentColor" stroke-width="2" fill="none"/>', volcano: '<path d="M2 20l7-12h6l7 12zM10 4l1 3M14 4l-1 3" stroke="currentColor" stroke-width="2" fill="none"/>', comb: '<path d="M4 8h16v4H4zM6 12v6M9 12v6M12 12v6M15 12v6M18 12v6" stroke="currentColor" stroke-width="2" fill="none"/>' };
  return `<svg viewBox="0 0 24 24" width="22" height="22">${I[k] || I.hat}</svg>`;
}

/* gems */
function placeSceneGems(sceneId) {
  const layer = $('gemLayer'); layer.innerHTML = '';
  if (!state.run) return;
  state.run.gems.filter(g => g.where === sceneId && !session.gems.includes(g.id)).forEach(g => addGemSpark(layer, g, g.x, g.y));
}
function addGemSpark(layer, g, x, y) {
  const b = document.createElement('button');
  b.className = 'gem'; b.type = 'button'; b.title = 'Dato de Antigua';
  b.style.left = x + '%'; b.style.top = y + '%';
  b.innerHTML = '<span class="ring"></span><span class="spark">✦</span>';
  b.addEventListener('click', e => { e.stopPropagation(); openGem(g, b); });
  layer.appendChild(b);
}
function openGem(g, btn) {
  if (!session.gems.includes(g.id)) session.gems.push(g.id);
  btn && btn.remove();
  SFX.play('badge', { force: true });
  const pop = $('gemPop');
  pop.innerHTML = `<p class="eyebrow">Dato de Antigua</p><h3>${esc(g.title)}</h3><p class="es-text es">${esc(g.es)}</p><p class="en">${esc(g.en)}</p><div class="row"><button class="btn ghost small" id="gemHear" type="button">▶ Escuchar</button><button class="btn primary small" id="gemClose" type="button">Cerrar</button></div>`;
  pop.hidden = false;
  pop.classList.remove('appear'); void pop.offsetWidth; pop.classList.add('appear');
  const prev = lastSpoken;
  const hear = () => say([g.es], CAST.lucia, { replay: true });
  hear();
  $('gemHear').onclick = hear;
  $('gemClose').onclick = () => { pop.hidden = true; stopSpeech(); lastSpoken = prev; };
  renderLibreta();
}

/* parallax on the stage */
function wireParallax() {
  const vp = $('viewport');
  let raf = 0, tx = 0, ty = 0;
  vp.addEventListener('pointermove', e => {
    if (reduced()) return;
    const r = vp.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - .5) * 2; ty = ((e.clientY - r.top) / r.height - .5) * 2;
    if (!raf) raf = requestAnimationFrame(() => {
      raf = 0;
      vp.querySelectorAll('#sceneLayer .plx').forEach(g => { const d = +g.dataset.depth; g.setAttribute('transform', `translate(${(-tx * d).toFixed(1)} ${(-ty * d * .4).toFixed(1)})`); });
    });
  });
}
function motes() {
  const m = $('motes'); m.innerHTML = '';
  for (let i = 0; i < 18; i++) {
    const d = document.createElement('i');
    d.style.left = (Math.random() * 100) + '%'; d.style.top = (40 + Math.random() * 60) + '%';
    d.style.animationDelay = (-Math.random() * 12) + 's'; d.style.animationDuration = (9 + Math.random() * 8) + 's';
    d.style.opacity = (.3 + Math.random() * .5).toFixed(2);
    m.appendChild(d);
  }
}

/* ============ 7 · STEP HANDLERS ============ */
/* Each handler returns a promise that resolves when the step is complete.
   ctx = { vars, who, sc, pen() } — pen() costs the scene one star (once per step). */
function waitSubmit(handler) {
  return new Promise(resolve => { state.onSubmit = async raw => { if (state.busy) return; state.busy = true; try { const r = await handler(raw); if (r) { state.onSubmit = null; resolve(r); } } finally { state.busy = false; } }; });
}
function registerTips(raw, n, ctx) {
  if ((ctx.sc.register || 'usted') !== 'usted' || ctx.tipped) return;
  if (TU_FORMS.test(n)) { ctx.tipped = true; fb('warn', 'Usted, por favor', 'In Guatemala, use usted with adults you don’t know: ¿puede…?, ¿tiene…?, ¿me trae…?, ¿me podría…?'); }
}
function accentTips(raw) { reviewAccents(raw).forEach(is => fb('warn', is.punct ? '¿…?' : `<span class="fix"><s>${esc(is.wrote)}</s> → ${esc(is.fix)}</span>`, is.punct ? 'Questions open with ¿ (type ? at the start).' : 'Accent')); }
function englishCheck(n, ctx) {
  if (!looksEnglish(n)) return false;
  fb('info', 'En español, por favor', 'Try it in Spanish. Press 💡 Ayuda if you are stuck.');
  say(lines([PHRASES.english], ctx.vars), ctx.who);
  return true;
}
function setHelp(step, ctx, extra) { state.help = { step, ctx, extra }; state.helpLevel = 0; }

const STEPS = {
  async say(step, ctx) {
    if (step.set) applySpecs(step.set, ctx.vars);
    setTask(step.task ? tpl(step.task, ctx.vars) : '<span class="listen">🎧 Listen…</span>', 'Escucha');
    ia('');
    await say(lines(step.lines, ctx.vars), ctx.who);
    await sleep(300);
  },

  async talk(step, ctx) {
    const V = ctx.vars;
    if (step.set) applySpecs(step.set, V);
    setTask(esc(tpl(step.taskVar ? getPath(V, step.taskVar) : step.task, V)));
    if (step.card === 'booking') showBooking(V);
    if (step.npc) await say(lines(step.npc, V), ctx.who);
    composer();
    const done = (step.parts || []).map(() => false);
    let tries = 0, usedOptions = false;
    setHelp(step, ctx, { showOptions: () => showOptions() });
    const finish = async () => {
      $('ia').innerHTML = '';
      if (tries >= 3 || usedOptions) ctx.pen('talk');
      await say(lines(step.done, V), ctx.who);
      if (step.goto) return { goto: step.goto };
      return true;
    };
    const showOptions = () => {
      if (!step.options || $('ia').querySelector('.acards')) return;
      session.stats.options++;
      const opts = shuffle(step.options.map(o => ({ ...o, text: tpl(o.say, V) })));
      const cards = audioCards(opts, {
        label: 'Opción', who: { name: 'Tú', pitch: 1.05 },
        onChoose: async (o, i, card) => {
          stopSpeech();
          youSaid(SETTINGS.text ? o.text : `Opción ${String.fromCharCode(65 + i)}`);
          logLine('Tú', o.text);
          if (o.ok) {
            usedOptions = true;
            for (const [k, ref] of Object.entries(o.effect || {})) V[k] = resolveRef(ref, V);
            // capture defaults for parts that capture from a list
            (step.parts || []).forEach(p => { if (p.capture && V[p.capture] == null) { const it = matchItems(p.match, o.text, V)[0]; if (it) V[p.capture] = it; } });
            card.classList.add('right'); SFX.play('correct');
            state.optionResolve && state.optionResolve(await finish());
          } else {
            card.classList.add('wrongpick'); SFX.play('wrong');
            await say(lines(o.reply || PHRASES.notUnderstood, V), ctx.who);
          }
        }
      });
      $('ia').appendChild(cards);
      fb('info', '', 'Listen to the options (▶) and choose what you would say. Using options costs a star.');
    };
    const typed = waitSubmit(async raw => {
      youSaid(raw); session.stats.messages++; logLine('Tú', raw);
      const n = norm(raw);
      accentTips(raw); registerTips(raw, n, ctx);
      if (englishCheck(n, ctx)) { tries++; return false; }
      if (step.branches) {
        const b = step.branches.find(br => test(br.re, n, V));
        if (b) { if (b.set) applySpecs(b.set, V); fb('ok', pick(['¡Bien!', '¡Muy bien!', '¡Eso!']), ''); await say(lines(b.say, V), ctx.who); return b.goto ? { goto: b.goto } : true; }
      } else {
        let progressed = false, rejected = null;
        (step.parts || []).forEach((p, i) => {
          if (done[i]) return;
          const res = matchPart(p, n, raw, V);
          if (res === true) { done[i] = true; progressed = true; }
          else if (res && res.reject) rejected = rejected || res.reject;
        });
        if (rejected) { fb('warn', '', 'Listen to what she says, and try again.'); await say(lines(rejected.say, V), ctx.who); return false; }
        if (done.every(Boolean)) { fb('ok', pick(['¡Perfecto!', '¡Muy bien!', '¡Eso es!', '¡Bien dicho!']), ''); return finish(); }
        if (progressed) { tries = 0; const next = step.parts.find((p, i) => !done[i]); fb('ok', pick(['¡Bien!', 'Va bien…']), 'Good. There’s one more thing to say.'); await say(lines(next.ask, V), ctx.who); return false; }
      }
      tries++;
      await say(lines(step.else || PHRASES.notUnderstood, V), ctx.who);
      if (tries === 2) fb('info', '', 'Need help? Press 💡 Ayuda for a hint.');
      if (tries >= 3 && step.options) showOptions();
      return false;
    });
    const viaOptions = new Promise(r => { state.optionResolve = r; });
    const r = await Promise.race([typed, viaOptions]);
    state.onSubmit = null; state.optionResolve = null;
    return r;
  },

  async haggle(step, ctx) {
    const V = ctx.vars;
    let cur = +tpl(step.start, V);
    const target = +tpl(step.target, V), floor = +tpl(step.floor, V);
    setTask(esc(tpl(step.task, V)));
    composer({ placeholder: '¿Me lo deja en…?' });
    let rounds = 0;
    setHelp(step, ctx, { showOptions: () => showOpts() });
    const accept = async (offer, full) => {
      $('ia').innerHTML = '';
      V[step.paidVar || 'paid'] = offer; V.offer = offer;
      if (offer > target) { ctx.pen('haggle'); fb('warn', `Pagaste Q${offer}`, `Your goal was Q${target} or less. Next time, bargain a little more.`); }
      else fb('ok', `¡Buen trato! Q${offer}`, rounds ? 'You bargained like a chapín.' : 'Great price.');
      await say(lines(full ? (step.acceptFull || step.accept) : step.accept, V), ctx.who);
      return true;
    };
    const respond = async (raw, n) => {
      const nums = parseNums(raw).filter(x => x >= 3 && x < cur + 1);
      const agree = /(?:^| )(esta bien|de acuerdo|va pues|trato|lo llevo|me lo llevo|la llevo|me la llevo|acepto|vamos|dale|bueno|perfecto|si)(?= |$)/.test(n);
      const discount = /(?:^| )(mas barato|rebaja|descuento|menos|muy caro|caro|demasiado|no tengo|solo tengo|me lo deja|me la deja|lo deja|la deja|baja)/.test(n);
      if (nums.length) {
        const offer = Math.min(...nums);
        rounds++;
        if (offer >= floor) return accept(offer, false);
        cur = Math.max(floor, Math.round((offer + cur) / 2 / 5) * 5);
        V.counter = cur; await say(lines(step.counter, V), ctx.who); return false;
      }
      if (discount) { rounds++; cur = Math.max(floor, cur - (cur - floor > 10 ? 10 : 5)); V.counter = cur; await say(lines(step.counter, V), ctx.who); return false; }
      if (agree) return accept(cur, true);
      return null;
    };
    const showOpts = () => {
      if (!step.options || $('ia').querySelector('.acards')) return;
      session.stats.options++;
      const opts = shuffle(step.options.map(o => ({ ...o, text: tpl(o.say, V) })));
      $('ia').appendChild(audioCards(opts, { label: 'Opción', who: { name: 'Tú', pitch: 1.05 }, onChoose: async (o, i, card) => {
        stopSpeech(); youSaid(SETTINGS.text ? o.text : `Opción ${String.fromCharCode(65 + i)}`); logLine('Tú', o.text);
        if (o.ok) { ctx.pen('haggle-opt'); card.classList.add('right'); const r = o.full ? await accept(cur, true) : (await respond(o.text, norm(o.text))); if (r) state.optionResolve && state.optionResolve(true); }
        else { card.classList.add('wrongpick'); await say(lines(o.reply, V), ctx.who); }
      } }));
    };
    let misses = 0;
    const typed = waitSubmit(async raw => {
      youSaid(raw); session.stats.messages++; logLine('Tú', raw);
      const n = norm(raw);
      accentTips(raw); registerTips(raw, n, ctx);
      if (englishCheck(n, ctx)) return false;
      const r = await respond(raw, n);
      if (r === null) { misses++; await say(lines(PHRASES.notUnderstood, V), ctx.who); if (misses >= 2) fb('info', '', tpl(step.hint, V)); if (misses >= 3) showOpts(); return false; }
      return r;
    });
    const viaOptions = new Promise(r => { state.optionResolve = r; });
    const r = await Promise.race([typed, viaOptions]);
    state.onSubmit = null; state.optionResolve = null;
    return r;
  },

  async num(step, ctx) {
    const V = ctx.vars, ans = +tpl(step.answer, V);
    setTask(esc(tpl(step.task, V)), 'Escucha y responde');
    composer({ placeholder: 'Número (o en palabras)…', numeric: true });
    let tries = 0;
    setHelp(step, ctx);
    return waitSubmit(async raw => {
      const nums = parseNums(raw);
      youSaid(raw);
      if (!nums.length) { fb('info', '', 'Type a number, in digits (45) or words (cuarenta y cinco).'); return false; }
      if (nums.includes(ans)) { fb('ok', `¡Exacto! Q${ans}`, ''); $('ia').innerHTML = ''; await sleep(500); return true; }
      tries++;
      if (tries >= 2) { ctx.pen('num'); fb('err', `Era Q${ans}`, step.listen === false ? `The answer was ${ans}.` : `It was ${ans}. Listen once more:`); $('ia').innerHTML = ''; if (step.listen !== false && lastSpoken) await say(lastSpoken.lines, lastSpoken.who, { replay: true }); else await sleep(1200); return true; }
      fb('err', '', step.listen === false ? 'Not quite. Check your arithmetic.' : PHRASES.numWrong);
      return false;
    });
  },

  async pick(step, ctx) {
    const V = ctx.vars;
    let options;
    if (step.optionsFrom) {
      const ans = resolveRef(step.answer, V);
      const pool = shuffle(LISTS[step.optionsFrom].filter(x => x !== ans)).slice(0, 2);
      options = shuffle([ans, ...pool]).map(x => ({ label: x[step.label] || x.name, ok: x === ans }));
    } else options = shuffle(step.options.map((o, i) => ({ label: tpl(o, V), ok: i === 0 })));
    setTask(esc(tpl(step.task, V)), step.eyebrow || 'Escucha y elige');
    return pickUI(options, ctx, step);
  },

  async audiopick(step, ctx) {
    const V = ctx.vars, items = resolveRef(step.choices, V), ans = resolveRef(step.answer, V);
    setTask(esc(tpl(step.task, V)), 'Escucha y elige');
    const el = ia('');
    let tries = 0;
    return new Promise(resolve => {
      const voices = shuffle(CAST.AYUDANTES.concat(CAST.DRIVERS)).slice(0, items.length);
      el.appendChild(audioCards(items.map((it, i) => ({ text: it[step.sayKey], item: it, who: { ...voices[i], name: `${step.label} ${i + 1}` } })), {
        label: step.label,
        onChoose: async (o, i, card) => {
          if (o.item === ans) { card.classList.add('right'); fb('ok', '¡Esa es!', `Bus ${i + 1} goes to ${ans.name}.`); if (tries) ctx.pen('audiopick'); await sleep(700); resolve(true); }
          else { tries++; card.classList.add('wrongpick'); fb('err', '', `That one goes somewhere else. Listen again.`); }
        }
      }));
      // play buttons should use the bus voice
      let stopAuto = false;
      el.querySelectorAll('.acard').forEach((c, i) => { const b = c.querySelector('.aplay'); const nb = b.cloneNode(true); b.replaceWith(nb); nb.addEventListener('click', () => { stopAuto = true; c.classList.add('heard'); const v = voices[i]; say([items[i][step.sayKey]], { ...v, name: `${step.label} ${i + 1}` }, { replay: true }); }); });
      (async () => { for (let i = 0; i < items.length && !stopAuto; i++) { await say([items[i][step.sayKey]], { ...voices[i], name: `${step.label} ${i + 1}` }); await sleep(250); } lastSpoken = { lines: items.map(x => x[step.sayKey]), who: { name: step.label, pitch: 1 } }; })();
      setHelp(step, ctx);
    });
  },

  async legend(step, ctx) {
    const V = ctx.vars, L = ctx.sc._legend;
    if (!L) return true;
    const teller = step.cast ? castFor(step.cast, ctx) : ctx.who;
    setTask('<span class="listen">🎧 Listen: a local is telling you a legend.</span>', 'Una leyenda');
    ia('');
    await say([...lines(step.intro, V), L.fragment], teller);
    if (!session.legends.some(x => x.id === L.id)) session.legends.push({ id: L.id, title: L.title, en: L.en, icon: L.icon, teller: teller.name.replace(/, .*/, '') });
    renderLibreta(); SFX.play('hint');
    setTask(esc(L.q.ask), 'Escucha y elige');
    return pickUI(shuffle(L.q.options.map((o, i) => ({ label: o, ok: i === 0 }))), { ...ctx, who: teller }, { legend: true });
  },

  async map(step, ctx) { return runMapStep(step, ctx); },

  async write(step, ctx) {
    const V = ctx.vars;
    setTask(esc(tpl(step.task, V)), 'Escribe');
    if (step.npc) await say(lines(step.npc, V), ctx.who);
    composer({ multiline: true, placeholder: 'Escribe en español…' });
    let tries = 0;
    setHelp(step, ctx);
    return waitSubmit(async raw => {
      youSaid(raw); session.stats.messages++; logLine('Tú', raw);
      const n = norm(raw);
      if (englishCheck(n, ctx)) return false;
      const a = analyzePast(raw, step.person);
      const met = checkMin(step.min, a);
      writeFeedback(a, step.min, met);
      if (step.captureColor) { const c = LISTS.COLORS.find(c => test(c.re, n, V)); if (c) V[step.captureColor] = c; }
      if (met) {
        session.writing.push({ scene: ctx.sc.title, prompt: tpl(step.task, V), text: raw, past: a.past, slips: a.slips.length });
        $('ia').innerHTML = '';
        await say(lines(step.done, V), ctx.who);
        return true;
      }
      tries++;
      if (tries >= 3) {
        ctx.pen('write');
        fb('info', 'Un ejemplo', `<span class="es-text show">${esc(step.model)}</span>`);
        session.writing.push({ scene: ctx.sc.title, prompt: tpl(step.task, V), text: raw, past: a.past, slips: a.slips.length, modelShown: true });
        $('ia').innerHTML = '';
        await sleep(2600 / SPEED());
        await say(lines(step.done, V), ctx.who);
        return true;
      }
      await say([pick(['¿Y qué más?', 'A ver, cuénteme un poquito más.', 'Ajá… ¿y luego?'])], ctx.who);
      return false;
    });
  }
};
function matchItems(match, text, V) {
  const items = [].concat(resolveRef(match, V) || []);
  const n = norm(text);
  return items.filter(it => it && it.re && test(it.re, n, V)).sort((a, b) => n.search(rx(a.re, V)) - n.search(rx(b.re, V)));
}
function matchPart(p, n, raw, V) {
  if (p.match) {
    const found = matchItems(p.match, raw, V);
    const rejectSet = (p.reject || []).flatMap(r => r.match ? [].concat(resolveRef(r.match, V) || []) : []);
    const valid = found.filter(x => !rejectSet.includes(x));
    if (valid.length) { if (p.capture) V[p.capture] = valid[0]; return true; }
    if (found.length) { const r = p.reject.find(r => r.match && [].concat(resolveRef(r.match, V)).some(x => found.includes(x))); return { reject: r }; }
    return false;
  }
  const hit = test(p.re, n, V);
  if (hit) return true;
  const r = (p.reject || []).find(r => r.re && test(r.re, n, V));
  return r ? { reject: r } : false;
}
function checkMin(min = {}, a) {
  if (min.pretYo && a.pretYo.length < min.pretYo) return false;
  if (min.imperfect && a.imp.length < min.imperfect) return false;
  if (min.past && a.past < min.past) return false;
  if (min.pret && a.pret.length < min.pret) return false;
  return true;
}
function writeFeedback(a, min, met) {
  const list = [...new Set([...a.pret, ...a.imp])].slice(0, 8).map(esc).join(', ');
  if (met) fb('ok', pick(['¡Bien contado!', '¡Muy bien!', '¡Excelente!']), list ? `Past tense: ${list}` : '');
  else {
    const need = [];
    if (min.pretYo && a.pretYo.length < min.pretYo) need.push(`${min.pretYo} things you did (yo + preterite: fui, comí, compré…) — found ${a.pretYo.length}`);
    if (min.imperfect && a.imp.length < min.imperfect) need.push('a description in the imperfect (era, tenía, estaba…)');
    if (min.past && a.past < min.past) need.push(`at least ${min.past} verbs in the past — found ${a.past}`);
    if (min.pret && a.pret.length < min.pret) need.push(`at least ${min.pret} events in the preterite (llegó, vio, corrió…)`);
    fb('info', 'Casi…', 'Add ' + need.join('; and ') + '.');
  }
  a.slips.slice(0, 3).forEach(s => fb('warn', `<span class="fix"><s>${esc(s.wrote)}</s> → ${esc(s.fix)}</span>`, s.note || 'Irregular preterite'));
  a.accents.slice(0, 2).forEach(s => fb('warn', `<span class="fix"><s>${esc(s.wrote)}</s> → ${esc(s.fix)}</span>`, s.note || 'Accent'));
  if (a.present.length) fb('info', a.present.slice(0, 3).map(p => `<span class="fix"><s>${esc(p.wrote)}</s> → ${esc(p.fix)}</span>`).join(' · '), 'Tell it in the past.');
  a.pa.missing.slice(0, 2).forEach(m => fb('warn', `<span class="fix"><s>${esc(m.wrote)}</s> → ${esc(m.fix)}</span>`, 'Personal a: put a before a person who receives the action.'));
  if (a.pa.ok.length) fb('ok', '', `Personal a ✓ (${esc(a.pa.ok[0])})`);
}
function pickUI(options, ctx, step = {}) {
  const el = ia('<div class="choices"></div>');
  let tries = 0;
  setHelp(step, ctx);
  return new Promise(resolve => {
    options.forEach((o, i) => {
      const b = document.createElement('button');
      b.className = 'choice appear'; b.type = 'button'; b.style.animationDelay = i * 60 + 'ms';
      b.innerHTML = `<span class="k">${String.fromCharCode(65 + i)}</span>${esc(o.label)}`;
      b.addEventListener('click', async () => {
        if (o.ok) {
          b.classList.add('right'); el.querySelectorAll('.choice').forEach(x => x.disabled = true);
          fb('ok', pick(['¡Correcto!', '¡Eso es!', '¡Muy bien!']), ''); if (tries) ctx.pen('pick');
          await sleep(800); resolve(true);
        } else { tries++; b.classList.add('wrongpick'); b.disabled = true; fb('err', '', 'Not that one. Press ⟲ Repetir to listen again.'); }
      });
      el.firstChild.appendChild(b);
    });
  });
}
function showBooking(V) {
  const b = $('booking');
  b.innerHTML = `<div class="ticket"><span class="eyebrow">Reservación</span><b>${esc(V.posada.name)}</b><span>Antigua Guatemala · 1 noche</span></div>`;
  b.hidden = false;
}
function castFor(pool, ctx) {
  ctx.castCache = ctx.castCache || {};
  if (!ctx.castCache[pool]) ctx.castCache[pool] = pick(CAST[pool].filter(p => p !== ctx.who));
  return ctx.castCache[pool];
}

/* help button: hint → options (talk/haggle) */
function onHelp() {
  const h = state.help; if (!h) return;
  session.stats.hints++;
  const { step, ctx, extra } = h;
  state.helpLevel++;
  if (step.type === 'talk' || step.type === 'haggle') {
    if (state.helpLevel === 1 && step.hint) fb('info', 'Pista', esc(tpl(step.hint, ctx.vars)));
    else if (extra && extra.showOptions) extra.showOptions();
  } else if (step.type === 'write') fb('info', 'Pista', esc(step.hint || 'Use verbs in the past.'));
  else if (step.type === 'map') fb('info', 'Pista', 'Find the arrow (where you are and which way you face). Follow each turn block by block. Press ⟲ Repetir, or switch to Lento.');
  else if (step.type === 'order') fb('info', 'Pista', 'Listen to each card. Which one starts the story? Which one is right before Don Chepe stopped?');
  else fb('info', 'Pista', 'Press ⟲ Repetir to hear it again, or set the speed to Lento.');
}

/* ============ 8 · MAP & DIRECTIONS ============ */
const DIRV = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
const RIGHT = { N: 'E', E: 'S', S: 'W', W: 'N' };
function turnOf(from, to) { if (from === to) return 'straight'; if (RIGHT[from] === to) return 'right'; if (RIGHT[to] === from) return 'left'; return 'back'; }
const inGrid = (c, r) => c >= 1 && c <= MAP.cols && r >= 1 && r <= MAP.rows;
function makeRoute(start) {
  for (let k = 0; k < 200; k++) {
    const tc = 1 + rand(MAP.cols), tr = 1 + rand(MAP.rows);
    const dc = tc - start.col, dr = tr - start.row, dist = Math.abs(dc) + Math.abs(dr);
    if (dist < 2 || dist > 6 || dc === 0 && dr === 0) continue;
    if (Object.values(LANDMARKS).some(L => L.col === tc && L.row === tr)) continue;
    const legs = [];
    const h = dc ? { dir: dc > 0 ? 'E' : 'W', n: Math.abs(dc) } : null, v = dr ? { dir: dr > 0 ? 'S' : 'N', n: Math.abs(dr) } : null;
    if (h && v) { if (Math.random() < .5) legs.push(h, v); else legs.push(v, h); } else legs.push(h || v);
    return { target: { col: tc, row: tr }, legs };
  }
  return { target: { col: start.col + 2, row: start.row }, legs: [{ dir: 'E', n: 2 }] };
}
function routeNodes(start, legs) {
  const pts = [{ ...start }]; let c = start.col, r = start.row;
  legs.forEach(l => { for (let i = 0; i < l.n; i++) { c += DIRV[l.dir][0]; r += DIRV[l.dir][1]; pts.push({ col: c, row: r }); } });
  return pts;
}
function makeDirections(start, fromName, it) {
  const facing = pick(['N', 'S', 'E', 'W']);
  const { target, legs } = makeRoute(start);
  const D = DIRECTIONS, out = [tpl(pick(D.start), { from: fromName, ref: D.refs[facing] })];
  let cur = facing;
  const nodes = routeNodes(start, legs);
  const passLm = Object.values(LANDMARKS).find(L => nodes.slice(1, -1).some(p => p.col === L.col && p.row === L.row));
  legs.forEach((leg, i) => {
    const t = turnOf(cur, leg.dir);
    const phr = tpl(pick(D[t]), { n: D.blocks[leg.n] });
    const lead = i === 0 ? pick(D.firstLead) : pick(D.connectors);
    out.push(capFirst(lead + phr) + '.');
    cur = leg.dir;
  });
  if (passLm && Math.random() < .8) out.splice(out.length - 1, 0, tpl(pick(D.pass), { lm: passLm.name }));
  out.push(tpl(pick(D.end), { it }));
  // decoys: the mirror (wrong first turn), one block short/long, and random
  const dec = [];
  const add = p => { if (inGrid(p.col, p.row) && !(p.col === target.col && p.row === target.row) && !(p.col === start.col && p.row === start.row) && !dec.some(d => d.col === p.col && d.row === p.row) && !Object.values(LANDMARKS).some(L => L.col === p.col && L.row === p.row)) dec.push(p); };
  const mirror = legs.map(l => ({ ...l, dir: { N: 'S', S: 'N', E: 'W', W: 'E' }[l.dir] }));
  add(routeNodes(start, [mirror[0], ...legs.slice(1)]).pop());
  add(routeNodes(start, [legs[0], ...(mirror[1] ? [mirror[1]] : [])]).pop());
  const last = legs[legs.length - 1];
  add(routeNodes(start, [...legs.slice(0, -1), { ...last, n: last.n + 1 }]).pop());
  if (last.n > 1) add(routeNodes(start, [...legs.slice(0, -1), { ...last, n: last.n - 1 }]).pop());
  for (let k = 0; dec.length < 4 && k < 100; k++) add({ col: 1 + rand(MAP.cols), row: 1 + rand(MAP.rows) });
  return { lines: out, facing, target, legs, decoys: shuffle(dec).slice(0, 4), nodes };
}
function renderMap(opts = {}) {
  const L = $('mapLayer');
  const rng = mulberry(state.run ? state.run.seed : 3);
  let s = `<svg class="map" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid meet">${mapBaseSVG(state.stage, rng)}<g id="mapOver"></g></svg>`;
  L.innerHTML = s; L.hidden = false; $('sceneLayer').hidden = true; $('npc').classList.add('mini');
  L.classList.remove('fadein'); void L.offsetWidth; L.classList.add('fadein');
  return L.querySelector('#mapOver');
}
function svgEl(tag, attrs, html = '') { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (html) e.innerHTML = html; return e; }
async function runMapStep(step, ctx) {
  const V = ctx.vars;
  const startNode = step.from === 'posada' ? state.run.posadaNode : LANDMARKS[step.from];
  const fromName = step.from === 'posada' ? V.posadaName || 'la posada' : LANDMARKS[step.from].name;
  const it = tpl(step.it || 'el lugar', V);
  const d = makeDirections(startNode, fromName, it);
  setTask(esc(tpl(step.task, V)), 'Sigue las indicaciones');
  const over = renderMap();
  setPlace('Mapa de Antigua');
  const [sx, sy] = nodeXY(startNode.col, startNode.row);
  const ang = { N: 0, E: 90, S: 180, W: 270 }[d.facing];
  over.appendChild(svgEl('g', { class: 'you', transform: `translate(${sx} ${sy})` }, `<circle r="22" class="youring"/><circle r="9" fill="#5FE0C8"/><g transform="rotate(${ang})"><path d="M0 -38 L10 -20 L-10 -20 Z" fill="#5FE0C8"/></g><text class="mlbl youlbl" y="40" text-anchor="middle">Usted está aquí</text>`));
  const cands = shuffle([d.target, ...d.decoys]);
  let tries = 0, targetEl = null;
  ia(`<p class="maphelp">🎧 Listen to the directions, then click the door ✦ where you end up. The arrow shows which way you are facing.</p><button class="btn ghost small" id="dirAgain" type="button">⟲ Indicaciones otra vez</button>`);
  setHelp({ type: 'map' }, ctx);
  const speakDirs = (slow) => { const prev = SETTINGS.speed; if (slow) SETTINGS.speed = 'lento'; const p = say(d.lines, ctx.who); if (slow) p.then(() => { SETTINGS.speed = prev; }); return p; };
  $('dirAgain').addEventListener('click', () => { session.stats.replays++; speakDirs(false); });
  speakDirs(false);
  return new Promise(resolve => {
    cands.forEach(p => {
      const [x, y] = nodeXY(p.col, p.row);
      const g = svgEl('g', { class: 'cand', transform: `translate(${x} ${y})`, tabindex: 0, role: 'button' }, glyphSVG('door', 0, 0) + '<circle r="26" fill="transparent"/>');
      const choose = async () => {
        if (g.classList.contains('nope')) return;
        if (p === d.target) {
          g.classList.add('yes'); SFX.play('correct');
          if (tries >= 2) ctx.pen('map');
          await drawRoute(over, d.nodes);
          fb('ok', '¡Llegaste!', ''); await say([pick(DIRECTIONS.ok)], ctx.who);
          resolve(true);
        } else {
          tries++; g.classList.add('nope'); SFX.play('wrong');
          if (tries >= 2) { fb('err', '', 'Here is the route.'); await drawRoute(over, d.nodes); over.querySelectorAll('.cand').forEach(c => c.classList.toggle('hint', c === targetEl)); return; }
          fb('err', '', 'Not there. Listen again, more slowly.');
          await say([pick(DIRECTIONS.retry)], ctx.who); speakDirs(true);
        }
      };
      g.addEventListener('click', choose);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
      over.appendChild(g);
      if (p === d.target) { targetEl = g; state.mapTarget = g; }
    });
  });
}
async function drawRoute(over, nodes) {
  const pts = nodes.map(p => nodeXY(p.col, p.row).join(',')).join(' ');
  const pl = svgEl('polyline', { points: pts, class: 'route' });
  over.insertBefore(pl, over.firstChild);
  await sleep(900);
}

/* ============ 9 · RUN FLOW ============ */
function buildRun() {
  const run = { seed: rand(1e9), idx: 0 };
  const chosen = shuffle(SCENARIOS).slice(0, GAME.scenesPerRun);
  run.plan = [ARRIVAL, ...chosen, { id: 'finale', title: FINALE.title, place: FINALE.place, finale: true }];
  // places
  const used = new Set(Object.values(LANDMARKS).map(L => `${L.col},${L.row}`));
  const free = () => { for (let k = 0; k < 300; k++) { const c = 1 + rand(MAP.cols), r = 1 + rand(MAP.rows); if (!used.has(`${c},${r}`)) { used.add(`${c},${r}`); return { col: c, row: r }; } } return { col: 4, row: 7 }; };
  run.posadaNode = free();
  run.nodes = {};
  run.plan.forEach(sc => {
    if (sc.place === 'random') run.nodes[sc.id] = free();
    else if (sc.place === 'posada') run.nodes[sc.id] = run.posadaNode;
    else run.nodes[sc.id] = { col: LANDMARKS[sc.place].col, row: LANDMARKS[sc.place].row };
  });
  // legends: prefer ones that fit the place
  const usedL = [];
  run.plan.filter(s => !s.finale).forEach(sc => {
    const pref = (sc.prefers || []).filter(id => !usedL.includes(id));
    const id = pref.length && Math.random() < .8 ? pick(pref) : pick(LEGENDS.map(l => l.id).filter(id => !usedL.includes(id)));
    usedL.push(id); run[`legend_${sc.id}`] = LEGENDS.find(l => l.id === id);
  });
  const fid = pick(usedL); run.finaleLegend = LEGENDS.find(l => l.id === fid);
  // sides
  run.sides = shuffle(SIDES).slice(0, GAME.sidesPerRun);
  // gems: only ones whose place is in this run
  const ids = new Set(run.plan.map(s => s.id));
  const placeable = GEMS.filter(g => g.where === 'map' || ids.has(g.where));
  run.gems = shuffle(placeable).slice(0, GAME.gemsPerRun);
  return run;
}
async function startGame() {
  $('intro').hidden = true;
  state.run = buildRun();
  state.notes = [];
  Object.assign(session, newSession());
  if (SETTINGS.text) { session.textShown = true; session.textReason = state.textReason || 'student'; }
  setStage(0); renderMissions(); renderLibreta(); motes();
  const arrivalVars = {};
  applySpecs(ARRIVAL.vars, arrivalVars);
  state.run.arrivalVars = arrivalVars;
  // Lucía's welcome over the scene
  showScene({ props: 'arch' }, state.run.seed);
  setPlace('Antigua Guatemala');
  setTask('<span class="listen">🎧 Lucía is sending you a voice message.</span>', 'Mensaje de Lucía');
  const intro = lines(LUCIA.intro, {});
  state.notes.push({ when: 'llegada', lines: intro }); renderLibreta();
  await say(intro, CAST.lucia);
  await playScenario(ARRIVAL, 0);
  state.player = state.run.posadaNode;
  for (let i = 1; i < state.run.plan.length; i++) {
    state.run.idx = i; renderMissions();
    await hub(state.run.plan[i], i);
    if (state.run.plan[i].finale) await playFinale(i);
    else await playScenario(state.run.plan[i], i);
  }
  await endSession();
}
async function playScenario(sc, i) {
  state.run.idx = i; renderMissions();
  setStage(i);
  const vars = i === 0 ? state.run.arrivalVars : {};
  if (i > 0) { applySpecs(sc.vars, vars); vars.posada = state.run.arrivalVars.posada; }
  vars.posadaName = (/^Hostal/.test(vars.posada.name) ? 'el ' : 'la ') + vars.posada.name;
  if (state.run.briefVars && state.run.briefVars[sc.id]) Object.assign(vars, state.run.briefVars[sc.id]);
  const who = pick(CAST[sc.cast]);
  sc._legend = state.run[`legend_${sc.id}`];
  const ctx = { vars, who, sc, penalties: new Set(), stepIdx: 0 };
  await titleCard(GAME.clock[state.stage], sc.title, sc.en);
  const cfg = { ...sc.scene, paints: vars.buses ? vars.buses.map(b => b.paint) : null };
  showScene(cfg, state.run.seed + i * 17);
  setPlace(sc.title + (sc.place && LANDMARKS[sc.place] ? ' · ' + capFirst(LANDMARKS[sc.place].name.replace(/^(el|la) /, '')) : ''));
  placeSceneGems(sc.id);
  showSpeaker(who);
  $('booking').hidden = true;
  const steps = sc.steps;
  let k = 0;
  while (k < steps.length) {
    const step = steps[k];
    ctx.stepIdx = k;
    ctx.pen = reason => { if (!ctx.penalties.has(k)) { ctx.penalties.add(k); } };
    ctx.who = step.cast ? castFor(step.cast, ctx) : who;
    clearFb(); renderStepDots(steps.length, k);
    state.ctx = ctx; state.step = step;
    if (!step.card) $('booking').hidden = true;
    if (step.type === 'map' || step.type === 'pick' || step.type === 'audiopick' || step.type === 'legend') { /* stage handled by step */ }
    const res = await STEPS[step.type](step, ctx);
    if (step.type === 'map') { showScene(cfg, state.run.seed + i * 17); placeSceneGems(sc.id); setPlace(sc.title); }
    if (res && res.goto) { k = steps.findIndex(s => s.id === res.goto); if (k < 0) break; }
    else k++;
  }
  const stars = Math.max(1, 3 - ctx.penalties.size);
  session.missions.push({ id: sc.id, title: sc.title, stars });
  SFX.mission(stars);
  renderMissions();
  clearFb(); fb('ok', `${sc.title}: ${starStr(stars)}`, stars === 3 ? 'Perfect scene!' : 'Scene complete.');
  await sleep(900);
}
function renderStepDots(n, k) { $('stepDots').innerHTML = Array.from({ length: n }, (_, i) => `<i class="${i < k ? 'd' : i === k ? 'c' : ''}"></i>`).join(''); }

/* the city map between scenes */
async function hub(next, i, again = false) {
  setStage(i);
  const over = renderMap();
  setPlace('Mapa de Antigua');
  showSpeaker(CAST.lucia);
  $('booking').hidden = true;
  const nodeOf = sc => state.run.nodes[sc.id];
  const cur = state.player || state.run.posadaNode;
  // posada
  const [px, py] = nodeXY(state.run.posadaNode.col, state.run.posadaNode.row);
  over.appendChild(svgEl('g', { class: 'posada' }, glyphSVG('bed', px, py - 22, '#C9A2E8') + `<text class="mlbl lmname" x="${px}" y="${py - 40}" text-anchor="middle">${esc(state.run.arrivalVars.posada.name.replace(/^(Posada|Hostal|Casa) /, ''))}</text>`));
  // gems on the map
  $('gemLayer').innerHTML = '';
  state.run.gems.filter(g => g.where === 'map' && !session.gems.includes(g.id)).forEach(g => {
    let x = g.x * 12, y = g.y * 6.75;
    if (g.lm) { const L = LANDMARKS[g.lm]; [x, y] = nodeXY(L.col, L.row); x += 34; y -= 12; }
    const sp = svgEl('g', { class: 'mgem', transform: `translate(${x} ${y})`, tabindex: 0, role: 'button' }, '<circle r="20" class="mgring"/><text class="mgspark" text-anchor="middle" y="7">✦</text>');
    sp.addEventListener('click', () => openGem(g, sp));
    over.appendChild(sp);
  });
  // sides
  state.run.sides.filter(s => !session.sides.includes(s.id)).forEach(sd => {
    const L = LANDMARKS[sd.place]; const [x, y] = nodeXY(L.col, L.row);
    const g = svgEl('g', { class: 'sidepin', transform: `translate(${x + 26} ${y + 16})`, tabindex: 0, role: 'button' }, `<circle r="16" class="sidering"/><circle r="7" fill="#5FE0C8"/><text class="mlbl" y="32" text-anchor="middle">${esc(sd.title)}</text>`);
    g.addEventListener('click', () => state.sideClick && state.sideClick(sd));
    over.appendChild(g);
  });
  // next mission pin
  const nn = nodeOf(next); const [mx, my] = nodeXY(nn.col, nn.row);
  const pin = svgEl('g', { class: 'mission', transform: `translate(${mx} ${my})`, tabindex: 0, role: 'button' }, `<circle r="30" class="mring"/><circle r="13" fill="#FFC27A"/><text class="mlbl mtitle" y="-40" text-anchor="middle">${esc(next.title)}</text>`);
  over.appendChild(pin);
  // you
  const [ux, uy] = nodeXY(cur.col, cur.row);
  const you = svgEl('g', { class: 'you', transform: `translate(${ux} ${uy})` }, `<circle r="20" class="youring"/><circle r="9" fill="#5FE0C8"/>`);
  over.appendChild(you);
  // Lucía's voice note
  state.run.briefVars = state.run.briefVars || {};
  const V = state.run.briefVars[next.id] || {};
  if (next.vars && next.brief && !state.run.briefVars[next.id]) { applySpecs(next.vars, V); state.run.briefVars[next.id] = V; }
  V.nextCity = GAME.nextCity;
  const note = next.finale ? lines(LUCIA.finale, V) : next.brief ? lines(next.brief, V) : lines(LUCIA.notes[next.id] || [], V);
  setTask(`<span class="listen">🎧 A voice message from Lucía.</span> Then click the glowing pin to go to <b>${esc(next.title)}</b>.`, 'El mapa');
  ia(`<div class="hubrow"><button class="btn primary" id="goBtn" type="button">Ir a ${esc(next.title)} →</button></div><p class="keyhelp">Optional: visit the small teal pins and look for sparkles ✦ (Datos de Antigua).</p>`);
  if (note.length && !again) { state.notes.push({ when: next.title, lines: note }); renderLibreta(); }
  const sayNote = note.length && !again ? say(note, CAST.lucia) : Promise.resolve();
  setHelp({ type: 'hub' }, { vars: V });
  await new Promise(resolve => {
    const go = async () => {
      if (state.traveling) return;
      state.traveling = true; stopSpeech();
      $('goBtn').disabled = true;
      await travel(you, cur, nn);
      state.player = nn; state.traveling = false; state.sideClick = null; $('gemLayer').innerHTML = '';
      resolve();
    };
    pin.addEventListener('click', go);
    pin.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    $('goBtn').addEventListener('click', go);
    state.sideClick = async sd => {
      if (state.traveling || state.inSide) return;
      state.inSide = true; stopSpeech();
      await playSide(sd);
      state.inSide = false;
      resolve(hub(next, i, true));
    };
  });
  await sayNote.catch(() => {});
}
async function travel(you, from, to) {
  const path = routeNodes(from, [{ dir: to.col >= from.col ? 'E' : 'W', n: Math.abs(to.col - from.col) }, { dir: to.row >= from.row ? 'S' : 'N', n: Math.abs(to.row - from.row) }].filter(l => l.n));
  for (const p of path.slice(1)) {
    const [x, y] = nodeXY(p.col, p.row);
    you.setAttribute('transform', `translate(${x} ${y})`);
    SFX.play('step');
    await sleep(170);
  }
  await sleep(250);
}
async function playSide(sd) {
  const who = sd.who;
  const prevStage = state.stage;
  const L = LANDMARKS[sd.place];
  showScene({ props: sd.place === 'parque' ? 'park' : 'street', landmark: sd.place === 'merced' ? 'merced' : sd.place === 'catedral' ? 'catedral' : null }, hashStr(sd.id));
  setPlace(sd.title + ' · ' + capFirst(L.name.replace(/^(el|la) /, '')));
  $('gemLayer').innerHTML = '';
  showSpeaker(who);
  clearFb(); $('stepDots').innerHTML = '';
  const ctx = { vars: {}, who, sc: { register: 'usted' }, pen() {} };
  await STEPS.say({ lines: sd.say }, ctx);
  let tries = 0;
  setTask(esc(sd.task), 'Encuentro');
  composer();
  setHelp({ type: 'side' }, ctx);
  await waitSubmit(async raw => {
    youSaid(raw); logLine('Tú', raw); session.stats.messages++;
    const n = norm(raw);
    accentTips(raw);
    if (englishCheck(n, ctx)) return false;
    const b = sd.branches.find(br => test(br.re, n, {}));
    if (b || ++tries >= 3) {
      $('ia').innerHTML = '';
      if (b) fb('ok', pick(['¡Bien!', '¡Muy bien!']), '');
      await say(lines(b ? b.say : sd.branches[0].say, {}), who);
      return true;
    }
    await say(lines(PHRASES.notUnderstood, {}), who);
    return false;
  });
  session.sides.push(sd.id);
  const g = GEMS.find(x => x.id === sd.gem);
  if (g) { await sleep(400); openGem(g, null); await new Promise(r => { const c = $('gemClose'); const h = () => { c.removeEventListener('click', h); r(); }; c.addEventListener('click', h); }); }
  setStage(prevStage);
}

/* ---- the finale: Don Chepe at the Arco ---- */
async function playFinale(i) {
  setStage(i);
  const L = state.run.finaleLegend, who = CAST.storyteller;
  const ctx = { vars: {}, who, sc: { title: FINALE.title, register: 'usted' }, penalties: new Set() };
  let k = 0;
  ctx.pen = () => ctx.penalties.add(k);
  session.finale = { legend: L.id, title: L.title };
  state.step = { type: 'finale' }; state.finaleLegend = L;
  await titleCard(GAME.clock[state.stage], FINALE.title, 'Don Chepe at the Arco de Santa Catalina');
  showScene({ props: 'arch' }, state.run.seed + 99);
  setPlace(FINALE.title + ' · Arco de Santa Catalina');
  $('gemLayer').innerHTML = '';
  placeSceneGems('finale');
  showSpeaker(who);
  const N = 6;
  // 1. welcome + the story (segments)
  renderStepDots(N, k); clearFb();
  setTask('<span class="listen">🎧 Don Chepe is telling a legend. Listen carefully: you will need it.</span>', 'La leyenda');
  ia(`<div class="segs" id="segs">${L.story.map((s, j) => `<button class="seg" type="button" data-seg="${j}" disabled><span>${j + 1}</span><em class="es-text">${esc(s)}</em></button>`).join('')}</div>`);
  await say(lines(FINALE.welcome, {}), who);
  await say([`La leyenda se llama ${L.title}.`], who);
  for (let j = 0; j < L.story.length; j++) {
    const b = document.querySelector(`[data-seg="${j}"]`);
    b.classList.add('now'); b.disabled = false;
    await say([L.story[j]], who);
    b.classList.remove('now'); b.classList.add('heard');
  }
  lastSpoken = { lines: L.story, who };
  await say(lines(PHRASES.storyStop, {}), who);
  document.querySelectorAll('#segs .seg').forEach(b => b.addEventListener('click', () => { session.stats.replays++; say([L.story[+b.dataset.seg]], who, { replay: true }); }));
  $('ia').insertAdjacentHTML('beforeend', '<p class="keyhelp">Click a numbered part to hear it again.</p><button class="btn primary" id="contBtn" type="button">Continuar →</button>');
  await new Promise(r => $('contBtn').addEventListener('click', r, { once: true }));
  stopSpeech();
  // 2. order the events
  k = 1; renderStepDots(N, k); clearFb();
  await orderStep(L, ctx);
  // 3. why
  k = 2; renderStepDots(N, k); clearFb();
  setTask(esc(L.why.ask), 'Piensa');
  await say(['Díganme una cosa…'], who);
  await pickUI(shuffle(L.why.options.map((o, j) => ({ label: o, ok: j === 0 }))), ctx, {});
  // 4. write the ending
  k = 3; renderStepDots(N, k); clearFb();
  const endText = await finaleWrite(L, ctx);
  // 5. the real ending
  k = 4; renderStepDots(N, k);
  const hits = L.endKeys.filter(e => test(e.re, norm(endText), {}));
  ia('');
  setTask('<span class="listen">🎧 Now hear how Don Chepe’s grandfather told the ending.</span>', 'El final');
  await say([pick(hits.length ? FINALE.reactHit : FINALE.reactMiss)], who);
  await say([L.ending], who);
  if (hits.length) fb('ok', 'Tu final y el de Don Chepe', 'Same idea: ' + hits.map(h => h.en).join(' · '));
  session.finale.matched = hits.map(h => h.en);
  await say(lines(FINALE.closing, {}), who);
  k = 5; renderStepDots(N, N);
  const stars = Math.max(1, 3 - ctx.penalties.size);
  session.missions.push({ id: 'finale', title: FINALE.title, stars });
  SFX.mission(stars); renderMissions();
  await sleep(900);
  // Lucía's goodbye
  showSpeaker(CAST.lucia);
  await say(lines(LUCIA.goodbye, { nextCity: GAME.nextCity }), CAST.lucia);
}
const CARD_GLYPHS = ['◆', '●', '▲', '■', '✦'];
async function orderStep(L, ctx) {
  const who = ctx.who;
  setTask(esc(FINALE.orderTask), 'Ordena la historia');
  const cards = shuffle(L.events.map((e, idx) => ({ e, idx })));
  const slots = Array(cards.length).fill(null), locked = new Set();
  let checks = 0;
  ia(`<div class="order"><div class="pool" id="pool"></div><ol class="slots" id="slots"></ol><div class="row"><button class="btn ghost small" id="resetOrd" type="button">Borrar</button><button class="btn primary" id="checkOrd" type="button" disabled>Comprobar</button></div></div>`);
  setHelp({ type: 'order' }, ctx);
  const draw = () => {
    $('pool').innerHTML = '';
    cards.forEach((c, j) => {
      if (slots.includes(c)) return;
      const d = document.createElement('div');
      d.className = 'ocard appear';
      d.innerHTML = `<button class="aplay" type="button" aria-label="Escuchar">▶</button><span class="og">${CARD_GLYPHS[j]}</span><span class="es-text">${esc(c.e)}</span><button class="btn small primary" type="button">Añadir</button>`;
      d.querySelector('.aplay').addEventListener('click', () => { d.classList.add('heard'); say([c.e], who, { replay: true }); });
      d.querySelector('.btn').addEventListener('click', () => { const s = slots.indexOf(null); if (s >= 0) { slots[s] = c; SFX.play('soft'); draw(); } });
      $('pool').appendChild(d);
    });
    if (!$('pool').children.length) $('pool').innerHTML = '<p class="keyhelp">All cards placed. Check your order, or remove a card with ×.</p>';
    $('slots').innerHTML = slots.map((c, s) => {
      if (!c) return `<li class="empty"><span class="n">${s + 1}</span><span class="ph">…</span></li>`;
      const j = cards.indexOf(c);
      return `<li class="${locked.has(c) ? 'lock' : ''}"><span class="n">${s + 1}</span><button class="aplay small" type="button" data-play="${s}" aria-label="Escuchar">▶</button><span class="og">${CARD_GLYPHS[j]}</span><span class="es-text">${esc(c.e)}</span>${locked.has(c) ? '<span class="tick">✓</span>' : `<button class="x" type="button" data-rm="${s}" aria-label="Quitar">×</button>`}</li>`;
    }).join('');
    $('slots').querySelectorAll('[data-play]').forEach(b => b.addEventListener('click', () => say([slots[+b.dataset.play].e], who, { replay: true })));
    $('slots').querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { slots[+b.dataset.rm] = null; draw(); }));
    $('checkOrd').disabled = slots.includes(null);
  };
  await say(['Les voy a decir cinco cosas que pasaron en la historia. Pónganlas en orden.'], who);
  draw();
  $('resetOrd').addEventListener('click', () => { slots.forEach((c, s) => { if (c && !locked.has(c)) slots[s] = null; }); draw(); });
  await new Promise(resolve => {
    $('checkOrd').addEventListener('click', async () => {
      checks++;
      let right = 0;
      slots.forEach((c, s) => { if (c && c.idx === s) { locked.add(c); right++; } else slots[s] = null; });
      if (right === cards.length) {
        fb('ok', '¡Perfecto!', checks > 1 ? `In order after ${checks} tries.` : 'All in order on the first try!');
        if (checks > 2) ctx.pen();
        draw(); await sleep(600); $('ia').innerHTML = '';
        await say(['¡Eso! Ustedes sí pusieron atención.'], who); resolve(); return;
      }
      SFX.play('wrong');
      if (checks >= 3) {
        cards.forEach(c => { slots[c.idx] = c; locked.add(c); }); draw(); ctx.pen();
        fb('info', 'El orden correcto', 'Here is the right order. Listen to it once more.');
        await say(L.events, who); await sleep(400); $('ia').innerHTML = ''; resolve(); return;
      }
      fb('warn', `${right}/${cards.length}`, 'Ticked cards are in the right place. The others went back: listen again and try once more.');
      draw();
    });
  });
}
async function finaleWrite(L, ctx) {
  const who = ctx.who;
  setTask(esc(FINALE.writeTask), 'Escribe el final');
  await say(lines(PHRASES.howEnded, {}), who);
  composer({ multiline: true, placeholder: 'Al final…' });
  let tries = 0;
  setHelp({ type: 'write', hint: 'Start with what happened next: “Entonces el perro blanco… / La Tatuana subió… / Celestina…” Use the preterite for events (llegó, vio, corrió) and the imperfect for descriptions (estaba, tenía, era).' }, ctx);
  return waitSubmit(async raw => {
    youSaid(raw); session.stats.messages++; logLine('Tú', raw);
    const n = norm(raw);
    if (englishCheck(n, ctx)) return false;
    const a = analyzePast(raw, 'any');
    const wc = words(raw).length;
    const met = checkMin(FINALE.writeMin, a) && wc >= 15;
    writeFeedback(a, FINALE.writeMin, met);
    if (!met && wc < 15) fb('info', '', `Write a little more: three sentences or more (${wc} words so far).`);
    if (met || ++tries >= 3) {
      if (!met) ctx.pen();
      if (a.slips.length + a.pa.missing.length > 2) ctx.pen();
      const both = a.pret.length && a.imp.length;
      if (met && both) fb('ok', 'Pretérito + imperfecto', 'You used both: events and descriptions.');
      session.writing.push({ scene: FINALE.title, prompt: FINALE.writeTask, text: raw, past: a.past, pret: a.pret.length, imp: a.imp.length, slips: a.slips.length, personalA: a.pa.ok.length });
      session.finale.ending = raw;
      $('ia').innerHTML = '';
      return raw;
    }
    await say([pick(['¿Y entonces? ¿Qué más pasó?', 'Ajá… cuénteme más.', '¡Qué interesante! ¿Y después?'])], who);
    return false;
  });
}

/* ============ 10 · END OF SESSION ============ */
/* ===== SESSION REPORT HOOK =====
   The end-of-session report and achievement codes are added later in the series.
   `session` holds everything a report needs: missions (id, title, stars), legends heard,
   finale (legend, ending text, matched ideas), writing (each written answer with counts),
   gems found, side encounters, stats (messages, replays, slow, hints, options),
   textShown/textReason (whether subtitles were used and why), and the full transcript.
   The summary below uses the same classes as the series' renderSummary (.stat .v/.k,
   .mrow stars, ol), so kit/report_inject.py can attach the report panel without changes. */
const REPORT = {
  onSessionEnd(s) { /* add the report here */ }
};
async function endSession() {
  stopSpeech();
  const mins = Math.max(1, Math.round((Date.now() - session.started) / 60000));
  const total = session.missions.reduce((a, m) => a + m.stars, 0);
  const placed = state.run.gems.length;
  const found = session.gems.filter(id => state.run.gems.some(g => g.id === id)).length;
  const el = $('summary');
  el.innerHTML = `
    <div><p class="eyebrow">Fin de la noche · ${esc(GAME.city)}</p><h2>¡Buenas noches, Antigua!</h2></div>
    <div class="stats">
      <div class="stat"><div class="v">${total}/${session.missions.length * 3}</div><div class="k">Estrellas</div></div>
      <div class="stat"><div class="v">${session.legends.length}</div><div class="k">Leyendas escuchadas</div></div>
      <div class="stat"><div class="v">${found}/${placed}</div><div class="k">Datos de Antigua</div></div>
      <div class="stat"><div class="v">${mins}</div><div class="k">Minutos</div></div>
    </div>
    <div class="mrows">${session.missions.map(m => `<div class="mrow"><span>${esc(m.title)}</span><span class="stars">${starStr(m.stars)}</span></div>`).join('')}</div>
    <div><h3 class="lbl">Lo que escribiste</h3><ol class="transcript" style="margin-top:8px">${session.writing.map(w => `<li><b>${esc(w.scene)}:</b> ${esc(w.text)}</li>`).join('')}</ol></div>
    <p class="outcomes">${session.textShown ? 'Text was turned on during this session' + (session.textReason === 'novoice' ? ' (no Spanish voice on this computer).' : session.textReason === 'accommodation' ? ' (accommodation link).' : '.') + ' · ' : 'Played audio-only. · '}Legend in the finale: ${esc(session.finale ? session.finale.title : '')}. Outcomes practised (30-3Y): LC–1.3 a (folk tales, legends and fables) · LC–1.4 b (preterite, imperfect, personal a) · A–3.2 a · A–4.3 a, b · A–4.4 a · LC–2.1 a · LC–2.3 a · LC–5.1 a · LC–5.2 a.</p>
    <div class="row"><button class="btn primary" type="button" id="againBtn">Jugar otra vez</button></div>`;
  el.hidden = false;
  SFX.celebrate(0);
  REPORT.onSessionEnd(session);
  $('againBtn').addEventListener('click', () => { el.hidden = true; window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); state.player = null; startGame(); });
  el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  setTask('That’s the end of the night. Your summary is below.', 'Fin');
  ia('');
}

/* ============ boot ============ */
function wireUI() {
  $('startBtn').addEventListener('click', () => { SFX.play('whoosh', { force: true }); startGame(); });
  $('testVoice').addEventListener('click', () => say(['¡Hola! Bienvenido a Antigua Guatemala.'], CAST.lucia, { replay: true }));
  $('replayBtn').addEventListener('click', replay);
  $('helpBtn').addEventListener('click', onHelp);
  document.querySelectorAll('#speedSeg button, #speedSeg2 button').forEach(b => b.addEventListener('click', () => { SETTINGS.speed = b.dataset.speed; saveSettings(); syncSpeed(); }));
  syncSpeed();
  $('settingsBtn').addEventListener('click', () => { const d = $('settingsDlg'); if (d.showModal) d.showModal(); else d.setAttribute('open', ''); });
  $('closeSettings').addEventListener('click', () => { const d = $('settingsDlg'); if (d.close) d.close(); else d.removeAttribute('open'); });
  $('optText').addEventListener('change', e => setText(e.target.checked, 'student'));
  $('voiceSel').addEventListener('change', e => { SETTINGS.voice = e.target.value; saveSettings(); loadVoices(); say(['Esta es mi voz.'], CAST.lucia, { replay: true }); });
  $('optSfx').checked = !SFX.muted();
  $('optSfx').addEventListener('change', e => { SFX.setMuted(!e.target.checked); $('sfxOn').checked = e.target.checked; });
  $('sfxOn').checked = !SFX.muted();
  $('sfxOn').addEventListener('change', e => { SFX.setMuted(!e.target.checked); $('optSfx').checked = e.target.checked; if (e.target.checked) SFX.play('correct', { force: true }); });
  document.querySelectorAll('.libtabs button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.libtabs button').forEach(x => x.classList.toggle('on', x === b));
    document.querySelectorAll('.libpane').forEach(p => p.hidden = p.id !== b.dataset.pane);
  }));
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('button, [role="button"]'); if (b && !b.disabled) SFX.play('tap'); }, true);
  document.addEventListener('keydown', e => { if (e.key === 'r' && e.altKey) replay(); });
  wireParallax();
  initVoices();
  if (ACCOMMODATION) setText(true, 'accommodation');
  showScene({ props: 'arch' }, 7);
  motes();
}
function syncSpeed() { document.querySelectorAll('#speedSeg button, #speedSeg2 button').forEach(b => b.classList.toggle('on', b.dataset.speed === SETTINGS.speed)); }
wireUI();
window.__noche = { state, session, analyzePast, parseNums, makeDirections, buildRun, tpl, evalSpec, applySpecs, matchPart, norm, STEPS, startGame, setText, renderScene: (props, t) => { setStage(t); showScene({ props, landmark: props === "tuktuk" ? "merced" : null, paints: [["#D8433E","#F2C14E"],["#3E7BD8","#F4F0E6"],["#3FA36B","#F2C14E"]] }, 5); } };
