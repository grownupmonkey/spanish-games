/* =====================================================================
   SE ME ROMPIÓ · GAME LAYER
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
const VOICE_PREFS = ['es-CO', 'es-US', 'es-MX', 'es-419', 'es-ES'];
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
  lucia: { name: 'Lucía', pitch: 1.1, guide: true }, fabio: { name: 'Fabio (el taller)', pitch: .84 }, narr: { name: 'Palabra', pitch: 1.02, rate: .9 },
};
/* speak lines as one person; lines are logged to the transcript */
async function talk(lines, who, opts = {}) {
  lines = [].concat(lines).filter(Boolean); if (!lines.length) return;
  stopSpeech(); const tok = speakTok;
  if (!opts.replay) { lastSpoken = { lines, who }; lines.forEach(l => logLine(who.name, l)); }
  $id('who').textContent = who.name;
  for (const l of lines) {
    if (tok !== speakTok) return;
    showLine(l); setSpeaking(true); state.speakingCust = !!who.cust;
    await speakRaw(l, who, tok); state.speakingCust = false;
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
const ACCENT_WORDS = { bateria: 'batería', camara: 'cámara', cafeteria: 'cafetería', jardin: 'jardín', sofa: 'sofá', estacion: 'estación', ciclovia: 'ciclovía', medellin: 'Medellín', telefono: 'teléfono', aqui: 'aquí', despues: 'después', avería: 'avería', averia: 'avería', reparacion: 'reparación', garantia: 'garantía', tambien: 'también', manana: 'mañana', despues: 'después', ademas: 'además', mama: 'mamá', papa: 'papá', musica: 'música', miercoles: 'miércoles', sabado: 'sábado', mascleta: 'mascletà', bunuelos: 'buñuelos', bunuelo: 'buñuelo', cremà: 'cremà', crema: 'cremà', tia: 'tía', tio: 'tío', dia: 'día', dias: 'días', aqui: 'aquí', alli: 'allí', rapido: 'rápido', ultimo: 'último', jamas: 'jamás', fantastico: 'fantástico', increible: 'increíble' };
function reviewAccents(raw) {
  const out = [];
  words(raw).forEach(w => { const k = keyOf(w), t = ACCENT_WORDS[k]; if (!t || w.toLowerCase() === t.toLowerCase() || (k === 'crema' && !/la crema/i.test(raw))) return; if (k === 'papa' && /\bla papa\b/i.test(raw)) return; if (!out.some(x => x.fix === t)) out.push({ wrote: w, fix: t }); });
  if (raw.includes('?') && !raw.includes('¿')) out.push({ wrote: '?', fix: '¿…?', punct: true });
  return out.slice(0, 3);
}

