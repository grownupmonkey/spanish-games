/* ---- end-of-session report with a code (parts/report.js) ----
   Self-contained: works in every game (kit builds and the older 10-3Y pages).
   It watches #summary; when a game shows its summary, it reads the summary from the page
   (stats, mission stars, badges, the student's lines, outcomes) and adds a report panel:
   name + course, a 12-character code, Print and Copy-for-Teams buttons. A print-only sheet
   (#sgrSheet) is what Ctrl+P / Imprimir prints. A code checker goes in "Para el profe".
   The game id comes from <meta name="sg-game" content="N">. */
(() => {
  'use strict';
  // id: [level of the game, title, scene label]
  const GAMES = {
    1: ['10-3Y', 'Primer encuentro con Lucía', 'Escena 1'],
    2: ['10-3Y', 'Una tarde en Guadalajara', 'Escena 2'],
    3: ['10-3Y', 'Una tarde en Guadalajara 3D', 'Escena 2 (3D)'],
    4: ['10-3Y', '¿Quién se comió el pastel?', 'Escena 3'],
    5: ['10-3Y', 'Los quehaceres', 'Escena 4'],
    6: ['10-3Y', 'La maleta', 'Escena 5'],
    7: ['10-3Y', 'El primer día de clases', 'Escena 6'],
    8: ['10-3Y', 'La fiesta de Lucía', 'Escena 7'],
    9: ['10-3Y', 'El taller de alebrijes', 'Escena 8'],
    21: ['20-3Y', 'Otra vez tarde', 'Escena 1 · Bogotá'],
    22: ['20-3Y', '¿Quedamos?', 'Escena 2 · San Juan'],
    23: ['20-3Y', 'El mercado', 'Escena 3 · Oaxaca'],
    24: ['20-3Y', '¿Moda o no moda?', 'Escena 4 · Madrid'],
    25: ['20-3Y', '¡Gol!', 'Escena 5 · Buenos Aires'],
    26: ['20-3Y', 'La farmacia de guardia', 'Escena 6 · Puerto Viejo'],
    27: ['20-3Y', 'Conexión perdida', 'Escena 7 · Lima'],
    28: ['20-3Y', 'Mismo idioma, otro mundo', 'Escena 8 · Lethbridge'],
    31: ['30-3Y', 'Noche de leyendas', 'Juego 1 · Antigua Guatemala'],
    32: ['30-3Y', 'Cuando era pequeño', 'Juego 2 · Montevideo'],
    33: ['30-3Y', '¡Fallas!', 'Juego 3 · Valencia'],
    34: ['30-3Y', 'Radio Habana', 'Juego 4 · La Habana'],
    35: ['30-3Y', 'Se me rompió', 'Juego 5 · Medellín'],
    36: ['30-3Y', 'Se busca', 'Juego 6 · Barcelona']
  };
  const LEVELS = ['10-3Y', '20-3Y', '30-3Y'];
  const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford base 32 (no I, L, O, U)
  const SALT = 'atardecer|lethbridge|espanol';
  const EPOCH = Date.UTC(2026, 0, 1);
  const meta = document.querySelector('meta[name="sg-game"]');
  const GID = meta ? (parseInt(meta.content, 10) || 0) : 0;
  const GAME = GAMES[GID] || [document.title.includes('30-3Y') ? '30-3Y' : document.title.includes('20-3Y') ? '20-3Y' : '10-3Y', document.title, ''];

  const store = {
    get(k) { try { return window.localStorage.getItem('sgr.' + k) || ''; } catch (e) { return ''; } },
    set(k, v) { try { window.localStorage.setItem('sgr.' + k, v); } catch (e) { /* private mode */ } }
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const normName = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim();

  /* ---- code: 48 bits of facts, masked with the name, plus a 12-bit check ---- */
  function fnv(str) { // FNV-1a 32-bit
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h >>> 0;
  }
  const mask48 = name => (BigInt(fnv(SALT + '#a#' + name)) << 16n) ^ BigInt(fnv('#b#' + name + SALT) & 0xffff);
  // scramble the 48 bits (invertible: odd multipliers mod 2^48 and xor-shifts) so nearby facts give unlike codes
  const M48 = (1n << 48n) - 1n, K1 = 0x9E3779B97F4An | 1n, K2 = 0xC2B2AE3D27D5n | 1n;
  const inv = k => { let x = 1n; for (let i = 0; i < 6; i++) x = (x * (2n - k * x)) & M48; return x; }; // Newton: inverse mod 2^48
  const I1 = inv(K1), I2 = inv(K2);
  const mix = v => { v = (v * K1) & M48; v ^= v >> 24n; v = (v * K2) & M48; v ^= v >> 24n; return v; };
  const unmix = v => { v ^= v >> 24n; v = (v * I2) & M48; v ^= v >> 24n; v = (v * I1) & M48; return v; };
  const clamp = (v, max) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)));
  const FIELDS = [['gid', 6], ['level', 2], ['stars', 6], ['maxStars', 6], ['badges', 4], ['maxBadges', 4], ['mins', 8], ['day', 12]];

  function encode(f, name) {
    const n = normName(name);
    if (!n) return '';
    let v = 0n;
    for (const [k, bits] of FIELDS) v = (v << BigInt(bits)) | BigInt(clamp(f[k], (1 << bits) - 1));
    const check = fnv(n + '|' + v.toString(36) + '|' + SALT) & 0xfff;
    const all = (mix(v ^ mask48(n)) << 12n) | BigInt(check);
    let s = '';
    for (let i = 11; i >= 0; i--) s += B32[Number((all >> BigInt(i * 5)) & 31n)];
    return s.slice(0, 4) + '-' + s.slice(4, 8) + '-' + s.slice(8);
  }

  function decode(code, name) {
    const n = normName(name);
    const clean = String(code || '').toUpperCase().replace(/[\s-]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
    if (!n || clean.length !== 12 || /[^0-9A-HJKMNP-TV-Z]/.test(clean)) return null;
    let all = 0n;
    for (const c of clean) all = (all << 5n) | BigInt(B32.indexOf(c));
    const check = Number(all & 0xfffn);
    const v = unmix(all >> 12n) ^ mask48(n);
    if ((fnv(n + '|' + v.toString(36) + '|' + SALT) & 0xfff) !== check) return null;
    const f = {}; let rest = v;
    for (const [k, bits] of [...FIELDS].reverse()) { f[k] = Number(rest & BigInt((1 << bits) - 1)); rest >>= BigInt(bits); }
    if (!GAMES[f.gid] || f.level > 2) return null;
    return f;
  }
  const dayNum = d => Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - EPOCH) / 864e5);
  const dayDate = n => new Date(EPOCH + n * 864e5);
  const fmtDay = d => d.toLocaleDateString('es-CA', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

  /* ---- read the game's own summary ---- */
  function scrape(sum) {
    const mine = el => !el.closest('.sgr');
    const txt = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
    const stats = [...sum.querySelectorAll('.stat')].filter(mine).map(s => [txt(s.querySelector('.v')), txt(s.querySelector('.k'))]);
    const rows = [...sum.querySelectorAll('.mrow')].filter(mine).map(r => {
      const sp = r.querySelectorAll('span'), st = sp.length ? sp[sp.length - 1].textContent : '';
      return [txt(sp[0]), (st.match(/★/g) || []).length, (st.match(/[★☆]/g) || []).length];
    });
    const badges = [...sum.querySelectorAll('.badge')].filter(mine).map(b => [txt(b).replace(/^★\s*/, ''), b.getAttribute('title') || '', !b.classList.contains('off')]);
    const ol = [...sum.querySelectorAll('ol')].filter(mine)[0];
    let listTitle = '';
    if (ol) { const h = ol.parentElement && ol.parentElement.querySelector('h3'); listTitle = txt(h) || 'Lo que escribiste'; }
    const list = ol ? [...ol.children].map(li => txt(li)).filter(Boolean) : [];
    let stars = rows.reduce((a, r) => a + r[1], 0), maxStars = rows.reduce((a, r) => a + r[2], 0);
    if (!rows.length) {
      const st = stats.find(([v, k]) => /star|estrell/i.test(k) && /^\d+\s*\/\s*\d+$/.test(v));
      if (st) [stars, maxStars] = st[0].split('/').map(x => parseInt(x, 10));
    }
    return {
      eyebrow: txt(sum.querySelector('.eyebrow')), heading: txt(sum.querySelector('h2')),
      stats, rows, badges, listTitle, list,
      outcomes: txt(sum.querySelector('.outcomes')).replace(/\s*In the (site version|next build) this becomes the printable report with a save code\.?/i, ''),
      stars, maxStars, nBadges: badges.filter(b => b[2]).length, maxBadges: badges.length
    };
  }

  /* ---- state for the current summary ---- */
  let t0 = Date.now(), cur = null, sheet = null;

  function fields() {
    const lvl = LEVELS.indexOf($v('sgrLevel')), now = cur.at;
    return { gid: GID, level: lvl < 0 ? LEVELS.indexOf(GAME[0]) : lvl, stars: cur.d.stars, maxStars: cur.d.maxStars, badges: cur.d.nBadges, maxBadges: cur.d.maxBadges, mins: cur.mins, day: dayNum(now) };
  }
  function $v(id) { const el = document.getElementById(id); return el ? el.value : ''; }
  function currentCode() { return cur ? encode(fields(), $v('sgrName')) : ''; }

  function refresh() {
    if (!cur) return;
    const name = $v('sgrName').trim(), code = currentCode();
    const b = document.getElementById('sgrCode');
    if (b) { b.textContent = code || 'Write your name to get your code'; b.classList.toggle('wait', !code); }
    renderSheet(name, code);
  }

  function renderSheet(name, code) {
    if (!sheet) { sheet = document.createElement('div'); sheet.id = 'sgrSheet'; document.body.appendChild(sheet); }
    const d = cur.d, at = cur.at, lvl = $v('sgrLevel') || GAME[0];
    const when = at.toLocaleDateString('es-CA', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + at.toLocaleTimeString('es-CA', { hour: '2-digit', minute: '2-digit' });
    sheet.innerHTML = `
      <div class="top">
        <div><p class="sub">Español ${esc(GAME[0])} · ${esc(GAME[2] || d.eyebrow)} · Informe de la sesión</p><h1>${esc(GAME[1])}</h1>
          <table class="who">
            <tr><td>Nombre</td><td><b>${name ? esc(name) : '______________________'}</b></td></tr>
            <tr><td>Curso</td><td>Español ${esc(lvl)}</td></tr>
            <tr><td>Fecha</td><td>${esc(when)}</td></tr>
            <tr><td>Tiempo de juego</td><td>${cur.mins} min</td></tr>
            ${d.maxStars ? `<tr><td>Estrellas</td><td>${d.stars} / ${d.maxStars}</td></tr>` : ''}
            ${d.maxBadges ? `<tr><td>Logros</td><td>${d.nBadges} / ${d.maxBadges}</td></tr>` : ''}
          </table></div>
        <div class="codebox"><small>Código</small><b>${code ? esc(code) : '—'}</b></div>
      </div>
      ${d.stats.length ? `<h2>Resumen</h2><div class="grid">${d.stats.map(([v, k]) => `<div><b>${esc(v)}</b><span>${esc(k)}</span></div>`).join('')}</div>` : ''}
      ${d.rows.length ? `<h2>Misiones</h2><ul class="rows">${d.rows.map(([l, s, m]) => `<li><span>${esc(l)}</span><span>${'★'.repeat(s)}${'☆'.repeat(Math.max(0, m - s))}</span></li>`).join('')}</ul>` : ''}
      ${d.badges.length ? `<h2>Logros</h2><ul class="bdg">${d.badges.map(([n, t, on]) => `<li class="${on ? '' : 'off'}">${on ? '★' : '☆'} ${esc(n)}${t ? ` — ${esc(t)}` : ''}</li>`).join('')}</ul>` : ''}
      ${d.list.length ? `<h2>${esc(d.listTitle)}</h2><ol class="tr">${d.list.map(t => `<li>${esc(t)}</li>`).join('')}</ol>` : ''}
      ${d.outcomes ? `<h2>Para el profe</h2><p class="outc">${esc(d.outcomes)}</p>` : ''}
      <p class="foot">${esc(d.heading)} · The code holds the game, course, date, stars, badges and minutes, tied to the name above. To check it: open any game, then “Para el profe” → “Check a report code”.</p>`;
  }

  function teamsText() {
    const d = cur.d, name = $v('sgrName').trim(), lvl = $v('sgrLevel') || GAME[0];
    const at = cur.at, date = at.getFullYear() + '-' + String(at.getMonth() + 1).padStart(2, '0') + '-' + String(at.getDate()).padStart(2, '0');
    const parts = [];
    if (d.maxStars) parts.push(`Estrellas: ${d.stars}/${d.maxStars}`);
    if (d.maxBadges) parts.push(`Logros: ${d.nBadges}/${d.maxBadges}`);
    parts.push(`${cur.mins} min`);
    return [`Informe · Español ${GAME[0]} · ${GAME[1]}`, `Nombre: ${name} (Español ${lvl})`, `Fecha: ${date}`, parts.join(' · '), `Código: ${currentCode()}`].join('\n');
  }

  function msg(t) { const m = document.querySelector('.sgr-msg'); if (m) m.textContent = t; }
  function needName() {
    if (currentCode()) return false;
    msg('Escribe tu nombre primero. (Write your name first.)');
    const n = document.getElementById('sgrName'); if (n) n.focus();
    return true;
  }

  function doPrint() {
    if (needName()) return;
    refresh(); msg('');
    try { window.print(); } catch (e) { /* blocked in some frames */ }
    msg('If the print window didn’t open, press Ctrl+P (⌘P on a Mac): the page prints as your report.');
  }

  function doCopy() {
    if (needName()) return;
    const text = teamsText(), box = document.querySelector('.sgr-copybox');
    const showBox = () => { if (box) { box.hidden = false; box.value = text; box.focus(); box.select(); } };
    const done = () => msg('Copiado. Paste it into Teams (Ctrl+V).');
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, () => { showBox(); msg('Press Ctrl+C to copy the text above, then paste it into Teams.'); });
        return;
      }
    } catch (e) { /* fall through */ }
    showBox();
    let ok = false; try { ok = document.execCommand && document.execCommand('copy'); } catch (e) { ok = false; }
    msg(ok ? 'Copiado. Paste it into Teams (Ctrl+V).' : 'Press Ctrl+C to copy the text above, then paste it into Teams.');
  }

  function attach(sum) {
    if (sum.querySelector('.sgr')) return;
    const d = scrape(sum);
    const oc = sum.querySelector('.outcomes'); if (oc) oc.textContent = d.outcomes;
    cur = { d, at: new Date(), mins: Math.max(1, Math.min(255, Math.round((Date.now() - t0) / 60000))) };
    const box = document.createElement('div');
    box.className = 'sgr';
    const lvlSaved = store.get('level'), lvl = LEVELS.includes(lvlSaved) && LEVELS.indexOf(lvlSaved) >= LEVELS.indexOf(GAME[0]) ? lvlSaved : GAME[0];
    box.innerHTML = `
      <h3 class="lbl">Informe de la sesión</h3>
      <p class="sgr-help">Write your name and course, then print this report or copy it for Teams.</p>
      <div class="sgr-row">
        <label class="grow">Nombre <input type="text" id="sgrName" autocomplete="name" spellcheck="false" maxlength="60" placeholder="Nombre y apellido"></label>
        <label>Curso <select id="sgrLevel">${LEVELS.map(l => `<option${l === lvl ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
      </div>
      <div class="sgr-code"><span>Código</span><b id="sgrCode" class="wait"></b></div>
      <div class="sgr-btns"><button class="btn primary" type="button" data-sgr-print>Imprimir informe</button><button class="btn ghost" type="button" data-sgr-copy>Copiar para Teams</button></div>
      <textarea class="sgr-copybox" readonly hidden aria-label="Report text for Teams"></textarea>
      <p class="sgr-msg" aria-live="polite"></p>`;
    const again = [...sum.children].find(c => c.querySelector && c.querySelector('[data-again], #again'));
    sum.insertBefore(box, again || null);
    const nameEl = box.querySelector('#sgrName');
    nameEl.value = store.get('name');
    nameEl.addEventListener('input', () => { store.set('name', nameEl.value); msg(''); refresh(); });
    box.querySelector('#sgrLevel').addEventListener('change', e => { store.set('level', e.target.value); refresh(); });
    box.querySelector('[data-sgr-print]').addEventListener('click', doPrint);
    box.querySelector('[data-sgr-copy]').addEventListener('click', doCopy);
    document.documentElement.classList.add('sgr-ready');
    refresh();
  }

  function detach() {
    cur = null; t0 = Date.now();
    document.documentElement.classList.remove('sgr-ready');
    if (sheet) sheet.innerHTML = '';
  }

  /* ---- teacher's code checker ---- */
  function addVerifier() {
    const det = document.querySelector('details.teacher');
    if (!det || det.querySelector('.sgr-verify')) return;
    const v = document.createElement('div');
    v.className = 'sgr-verify';
    v.innerHTML = `<b>Check a report code</b>
      <p>Type the student’s name as it appears on the report, and the code. Codes from any game in the set work here.</p>
      <div class="vrow"><input type="text" placeholder="Nombre" aria-label="Student name" spellcheck="false"><input type="text" placeholder="XXXX-XXXX-XXXX" aria-label="Report code" spellcheck="false" maxlength="16"><button class="btn ghost small" type="button">Comprobar</button></div>
      <output aria-live="polite"></output>`;
    det.appendChild(v);
    const [nIn, cIn] = v.querySelectorAll('input'), out = v.querySelector('output');
    const check = () => {
      const f = decode(cIn.value, nIn.value);
      if (!nIn.value.trim() || !cIn.value.trim()) { out.className = ''; out.textContent = ''; return; }
      if (!f) { out.className = 'bad'; out.textContent = '✗ This code doesn’t match that name. Check the spelling of the name and the code.'; return; }
      const g = GAMES[f.gid];
      out.className = 'ok';
      out.textContent = `✓ Valid · ${g[1]} (${g[0]} · ${g[2]}) · played as ${LEVELS[f.level]} · ${fmtDay(dayDate(f.day))} · `
        + (f.maxStars ? `${f.stars}/${f.maxStars} stars · ` : '') + (f.maxBadges ? `${f.badges}/${f.maxBadges} badges · ` : '') + `${f.mins} min`;
    };
    v.querySelector('button').addEventListener('click', check);
    cIn.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  }

  function watch() {
    addVerifier();
    const sum = document.getElementById('summary');
    if (!sum) return;
    const look = () => {
      const shown = !sum.hidden && sum.children.length > 0;
      if (shown && !sum.querySelector('.sgr')) attach(sum);
      else if (!shown && cur) detach();
    };
    new MutationObserver(look).observe(sum, { attributes: true, attributeFilter: ['hidden'], childList: true });
    look();
  }

  window.__report = { encode, decode, scrape, normName, GAMES, gid: GID, code: currentCode, teamsText: () => (cur ? teamsText() : '') };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
})();

