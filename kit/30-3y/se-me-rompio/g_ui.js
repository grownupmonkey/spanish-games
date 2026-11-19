/* ============ 4 · UI HELPERS ============ */
const state = { lastLine: '', onSubmit: null, help: null };
let session = null;
function newSession() { return { started: Date.now(), textShown: ACCOMMODATION || SETTINGS.text, textReason: ACCOMMODATION ? 'accommodation' : (voicesSettled && !VOZ) ? 'novoice' : SETTINGS.text ? 'student' : '', missions: [], writing: [], transcript: [], stats: { messages: 0, replays: 0, slow: 0, hints: 0, misses: 0 }, events: [], details: {} }; }
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

