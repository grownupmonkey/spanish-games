/* ============ 5 · THE PHONE (Curro, a job app) ============ */
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const wait = ms => sleep(ms);
const spoken = t => t.replace(/\/a\b/g, '').toLowerCase();
const APP = { tab: 'ofertas', open: { ofertas: true, audios: false, llamada: false, perfil: false }, detail: null, quiz: null, onTapJob: null, applicants: [], call: null, profile: '', profileJob: null };
const PHONE_T0 = Date.now();
function phoneClock() { const m = 10 * 60 + 24 + Math.floor((Date.now() - PHONE_T0) / 20000); $id('pclock').textContent = `${Math.floor(m / 60) % 24}:${String(m % 60).padStart(2, '0')}`; }
function setTab(t, force) {
  if (!APP.open[t] && !force) { try { SFX.play('soft'); } catch (e) {} return; }
  APP.open[t] = true; APP.tab = t; if (t !== 'ofertas') APP.detail = null;
  document.querySelectorAll('#ptabs button').forEach(b => { b.classList.toggle('on', b.dataset.tab === t); b.classList.toggle('locked', !APP.open[b.dataset.tab]); });
  renderPhone();
}
function renderPhone() {
  const el = $id('pscreen'); if (!el) return;
  const t = APP.tab;
  el.innerHTML = t === 'ofertas' ? (APP.detail ? detailHTML(APP.detail) : ofertasHTML()) : t === 'audios' ? audiosHTML() : t === 'llamada' ? callHTML() : perfilHTML();
  el.scrollTop = 0; wirePhone();
}
const appHead = (title, sub) => `<div class="ahead"><span class="alogo">curro</span><span class="atitle">${title}</span>${sub ? `<small>${sub}</small>` : ''}</div>`;
function ofertasHTML() {
  return appHead('Ofertas', 'Barcelona · Verano') + `<div class="jlist">${JOBS.map(j => `<article class="jcard${APP.quiz && APP.quiz.done.has(j.id) ? ' got' : ''}" data-job="${j.id}" tabindex="0">
    <div class="jtop">${iconSVG(j.id, 34)}<div><b>${esc(j.title)}</b><small>${esc(j.company)} · ${esc(j.place)}</small></div></div>
    <ul class="jreq">${j.req.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
    <div class="jmeta"><span>${esc(j.hours)}</span><button class="jmore" type="button" data-more="${j.id}" aria-label="Ver la oferta">Ver ›</button></div></article>`).join('')}</div>`;
}
function detailHTML(id) {
  const j = JOB(id), canApply = !!APP.onApply;
  return `<div class="jdetail"><div class="jband" style="background:${j.color}"><button class="pback" type="button" data-back="1">‹ Ofertas</button>${iconSVG(j.id, 52)}<h4>${esc(j.title)}</h4><p>${esc(j.company)}</p></div>
    <div class="jbody"><p class="lbl">La oferta</p><p>${esc(j.desc)}</p><p class="lbl">Requisitos</p><ul>${j.req.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
    <p class="lbl">Dónde</p><p>${esc(j.place)}</p><p class="lbl">Horario</p><p>${esc(j.hours)}</p><p class="lbl">Sueldo</p><p>${esc(j.pay)}</p>
    ${canApply ? `<button class="apply" type="button" data-apply="${j.id}">Solicitar este puesto</button>` : ''}</div></div>`;
}
function audiosHTML() {
  const list = APP.applicants;
  return appHead('Audios', 'Candidatos') + (list.length ? `<div class="alist">${list.map(a => `<div class="anote${APP.playing === a.id ? ' playing' : ''}" data-a="${a.id}"><div class="aav">${bustSVG(appStyle(a))}</div><div class="amid"><b>${esc(a.name)}</b><div class="wave">${Array.from({ length: 22 }, (_, i) => `<i style="height:${6 + Math.abs(Math.sin(i * 1.7 + a.name.length)) * 16}px"></i>`).join('')}</div></div><button class="aplay2" type="button" data-play="${a.id}" aria-label="Escuchar a ${esc(a.name)}">▶</button></div>`).join('')}</div>` : '<p class="pempty">No tienes audios todavía.</p>');
}
function callHTML() {
  const c = APP.call; if (!c) return appHead('Llamada') + '<p class="pempty">No tienes llamadas.</p>';
  const j = JOB(c.job);
  return `<div class="call${c.state === 'ringing' ? ' ringing' : ''}${c.state === 'ended' ? ' ended' : ''}"><div class="cface${APP.bossTalking ? ' talking' : ''}">${bustSVG(j.boss)}</div>
    <div class="ctop"><b>${esc(j.boss.name)}</b><small>${esc(j.company)}</small><span class="ctime" id="ctime">${c.state === 'ringing' ? 'Llamando…' : c.state === 'ended' ? 'Llamada finalizada' : '● 00:00'}</span></div>
    <div class="cself"><svg viewBox="0 0 60 80"><circle cx="30" cy="28" r="15" fill="#B9B2D6"/><path d="M4 80 q4 -32 26 -32 q22 0 26 32z" fill="#B9B2D6"/></svg><span>Tú</span></div>
    ${c.caption ? `<div class="ccap"><b>Tú:</b> ${esc(c.caption)}</div>` : ''}
    <div class="cbtns"><span class="cb1">🎤</span><span class="cb1">📷</span><span class="cb1 hang">✆</span></div></div>`;
}
function perfilHTML() {
  const j = APP.profileJob ? JOB(APP.profileJob) : null, t = APP.profile, ck = APP.profileCheck || {};
  const item = (k, label) => `<li class="${ck[k] ? 'ok' : ''}">${ck[k] ? '✓' : '○'} ${label}</li>`;
  return `<div class="pf"><div class="pfband"><div class="pfav"><svg viewBox="0 0 60 80"><circle cx="30" cy="28" r="15" fill="#fff"/><path d="M4 80 q4 -32 26 -32 q22 0 26 32z" fill="#fff"/></svg></div><b>Tu perfil</b>${j ? `<small>Busco trabajo: ${esc(j.title)}</small>` : ''}</div>
    <div class="pfbody"><p class="lbl">Sobre mí</p><p class="pftext${t ? '' : ' empty'}">${t ? esc(t) : 'Escribe tu perfil abajo…'}</p>
    <p class="lbl">Completa tu perfil</p><ul class="pfck">${item('perf', 'Experiencia (he…)')}${item('pret', 'El verano pasado')}${item('fut', 'Este verano (-é, -á…)')}${item('se', 'Sé…')}${item('con', 'Conozco…')}${item('len', `Unas 50 palabras (${words(t).length})`)}</ul></div></div>`;
}
function wirePhone() {
  const el = $id('pscreen');
  el.querySelectorAll('.jcard').forEach(c => c.addEventListener('click', e => {
    if (e.target.closest('[data-more]')) { APP.detail = e.target.closest('[data-more]').dataset.more; renderPhone(); return; }
    if (APP.onTapJob) APP.onTapJob(c.dataset.job, c); else { APP.detail = c.dataset.job; renderPhone(); }
  }));
  el.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => { APP.detail = null; renderPhone(); }));
  el.querySelectorAll('[data-apply]').forEach(b => b.addEventListener('click', () => APP.onApply && APP.onApply(b.dataset.apply)));
  el.querySelectorAll('[data-play]').forEach(b => b.addEventListener('click', () => playApplicant(b.dataset.play)));
}
function banner(title, text, ms = 6000) {
  const b = $id('pbanner'); b.innerHTML = `<span class="alogo">curro</span><div><b>${esc(title)}</b><p>${esc(text)}</p></div>`; b.hidden = false; b.classList.remove('out'); void b.offsetWidth; b.classList.add('in');
  try { SFX.play('star'); } catch (e) {}
  clearTimeout(banner.t); if (ms) banner.t = setTimeout(() => { b.classList.add('out'); setTimeout(() => { b.hidden = true; }, 400); }, ms);
}
/* the talking hook from g_head: animate the interviewer's mouth and the voice message being played */
function onSpeak(who, on) {
  if (who.boss) { APP.bossTalking = on; const f = document.querySelector('#pscreen .cface'); if (f) f.classList.toggle('talking', on); }
  if (who.applicant) { APP.playing = on ? who.applicant : null; document.querySelectorAll(`[data-a="${who.applicant}"]`).forEach(n => n.classList.toggle('playing', on)); }
}
const applicantVoice = a => ({ name: `${a.name} (audio)`, pitch: a.pitch, rate: a.rate, applicant: a.id });
function playApplicant(id) { const a = APPLICANTS.find(x => x.id === id); if (!a) return; session && session.stats.replays++; if (APP.open.audios && APP.tab !== 'audios') setTab('audios'); talk(a.note, applicantVoice(a), { replay: true }); }

/* ============ 6 · PANELS ============ */
const MISSIONS = [['ofertas', 'Las ofertas'], ['candidatos', 'Los candidatos'], ['entrevista', 'La entrevista'], ['perfil', 'Tu perfil']];
function renderMissions(cur) { $id('missionList').innerHTML = MISSIONS.map(([id, t]) => { const m = session.missions.find(x => x.id === id); return `<li class="${m ? 'done' : id === cur ? 'cur' : ''}"><span>${esc(t)}</span><span class="stars">${m ? starStr(m.stars) : ''}</span></li>`; }).join(''); }
function finishMission(id, stars) { stars = Math.max(1, Math.min(3, stars)); session.missions.push({ id, title: MISSIONS.find(m => m[0] === id)[1], stars }); renderMissions(); try { SFX.play('mission'); } catch (e) {} }
const SOL = {};
function renderSolicitud() {
  const el = $id('solicitud'); if (!SOL.job) { el.innerHTML = '<p class="keyhelp">After you choose a job, your application appears here.</p>'; return; }
  const j = JOB(SOL.job), row = (k, label) => `<div class="orow ${SOL[k] ? 'ok' : ''}"><span>${label}</span><b>${SOL[k] ? '✓' : '—'}</b></div>`;
  el.innerHTML = `<p class="otitle">${iconSVG(j.id, 22)} ${esc(j.title)} · ${esc(j.company)}</p>${row('q1', 'Experiencia (perfecto)')}${row('q2', 'Sé… / Conozco…')}${row('q3', 'El verano pasado (pretérito)')}${row('q4', 'Este verano (futuro)')}${row('perfil', 'Perfil')}`;
}
const VOCAB = ['la oferta de trabajo', 'el puesto', 'los requisitos', 'el horario', 'el sueldo', 'el turno', 'las propinas', 'la experiencia', 'el título', 'la entrevista', 'solicitar', 'contratar', 'el jefe, la jefa', 'ahorrar'];
function renderVocab() { $id('vocabList').innerHTML = VOCAB.map(w => `<li class="wb"><button type="button" class="aplay small" data-w="${esc(w)}">▶</button><span>${esc(w)}</span></li>`).join(''); $id('vocabList').querySelectorAll('[data-w]').forEach(b => b.addEventListener('click', () => talk([b.dataset.w], CAST.app, { replay: true }))); }
const found = new Set();
function renderGems() { $id('gemCount').textContent = `${found.size}/6`; $id('gemList').innerHTML = GEMS.map(g => `<li class="${found.has(g.id) ? 'on' : ''}">${found.has(g.id) ? '✦' : '·'} ${found.has(g.id) ? esc(g.t) : '???'}</li>`).join(''); document.querySelectorAll('.scene .gem').forEach(n => n.classList.toggle('found', found.has(n.dataset.gem))); }
function openGem(id) { const g = GEMS.find(x => x.id === id); if (!g) return; found.add(id); renderGems(); $id('gemEs').textContent = g.es; $id('gemEn').textContent = g.en; $id('gemCard').hidden = false; talk([g.es], CAST.lucia); try { SFX.play('star'); } catch (e) {} }

/* drag-or-click helper: items move into zones; returns nothing, calls onDrop(itemId, zoneEl|null) */
function dragify(root, itemSel, zoneSel, onDrop, onPick) {
  root.querySelectorAll(itemSel).forEach(el => { el.addEventListener('click', e => { if (e.detail === 0 && !e.target.closest('button.aplay')) onPick(el.dataset.id); }); if (el.tagName !== 'BUTTON') el.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === el) { e.preventDefault(); onPick(el.dataset.id); } }); });
  root.querySelectorAll(itemSel).forEach(el => el.addEventListener('pointerdown', e => {
    if (e.button > 0 || e.target.closest('[data-noDrag],button.aplay,button.cplay')) return;
    e.preventDefault(); const x0 = e.clientX, y0 = e.clientY, r0 = el.getBoundingClientRect(); let ghost = null, over = null, lastY = y0, raf = 0;
    const edge = () => { const v = window.innerHeight, d = lastY < 70 ? -14 : lastY > v - 70 ? 14 : 0; if (d) window.scrollBy(0, d); if (ghost) raf = requestAnimationFrame(edge); };
    const zoneAt = (x, y) => { const t = document.elementFromPoint(x, y); return t && t.closest(zoneSel); };
    const mv = ev => {
      lastY = ev.clientY;
      if (!ghost && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 6) return;
      if (!ghost) { ghost = el.cloneNode(true); ghost.classList.add('ghost'); ghost.style.width = r0.width + 'px'; document.body.appendChild(ghost); el.classList.add('dragging'); raf = requestAnimationFrame(edge); }
      ghost.style.left = (ev.clientX - (x0 - r0.left)) + 'px'; ghost.style.top = (ev.clientY - (y0 - r0.top)) + 'px';
      const z = zoneAt(ev.clientX, ev.clientY); if (z !== over) { over && over.classList.remove('over'); over = z; over && over.classList.add('over'); }
    };
    const up = ev => {
      window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up);
      if (!ghost) { onPick(el.dataset.id); return; }
      cancelAnimationFrame(raf); ghost.remove(); ghost = null; el.classList.remove('dragging'); over && over.classList.remove('over');
      onDrop(el.dataset.id, zoneAt(ev.clientX, ev.clientY));
    };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  }));
}

/* ============ 7 · THE DAY ============ */
async function startGame() {
  session = newSession(); found.clear(); Object.keys(SOL).forEach(k => delete SOL[k]); clearFb(); ia(''); hideGo();
  $id('summary').hidden = true; $id('summary').innerHTML = '';
  Object.assign(APP, { open: { ofertas: true, audios: false, llamada: false, perfil: false }, detail: null, quiz: null, onTapJob: null, onApply: null, applicants: [], call: null, profile: '', profileJob: null, profileCheck: {} });
  setTab('ofertas'); renderMissions('ofertas'); renderGems(); renderSolicitud();
  await talk(['¡Hola! Soy Lucía. ¡Saludos desde Barcelona!', 'Estoy en una terraza con unas vistas increíbles. ¿Ves la Sagrada Familia?', 'Este verano tú también vas a estar aquí, y necesitas un trabajo de verano.', 'Mira tu móvil: es Curro, una aplicación para buscar trabajo. ¡Vamos a ver qué ofertas hay!'], CAST.lucia);
  await missionOfertas();
  await missionCandidatos();
  await missionEntrevista();
  await missionPerfil();
  endSession();
}

/* ---- 1 · read the postings: the app asks, you tap the posting ---- */
async function missionOfertas() {
  renderMissions('ofertas'); clearFb(); ia('');
  setTask('Read the six job postings on the phone. The app will ask five questions out loud: <b>tap the posting</b> that answers each one. Press ⟲ Repetir to hear a question again.', 'Las ofertas');
  setHelp(lvl => ['Each posting lists its requisitos (requirements) and its horario (hours). The answer is always in the posting.', '“Hay que saber…” = you need to know how to…; “haber trabajado con…” = to have worked with…'][Math.min(lvl, 1)]);
  const jobs = shuffle(JOBS).slice(0, 5), qs = jobs.map(j => ({ job: j.id, q: pick(j.q) }));
  APP.quiz = { done: new Set() }; setTab('ofertas'); let misses = 0;
  await talk(['Hola, soy Curro. Te voy a hacer unas preguntas sobre las ofertas. Toca la oferta correcta.'], CAST.app);
  for (const [n, q] of qs.entries()) {
    window.__quiz = q;
    setTask(`Read the postings on the phone and <b>tap the one that answers the question</b>. <span class="cnt">${n + 1}/5</span>`, 'Las ofertas');
    const asked = talk([q.q], CAST.app);
    await new Promise(resolve => {
      APP.onTapJob = async (id, card) => {
        if (id === q.job) {
          APP.onTapJob = null; APP.quiz.done.add(id); card.classList.add('got', 'pulse'); fb('ok', '¡Sí!', `${JOB(id).title} · ${JOB(id).company}`); await asked; await wait(500); resolve();
        } else {
          misses++; card.classList.remove('nope'); void card.offsetWidth; card.classList.add('nope'); try { SFX.play('wrong'); } catch (e) {}
          fb('warn', 'No…', 'Not that one. Listen again and read the requisitos.'); talk([q.q], CAST.app, { replay: true });
        }
      };
    });
  }
  APP.onTapJob = null; window.__quiz = null; session.stats.misses += misses; session.details.ofertas = misses;
  finishMission('ofertas', misses <= 1 ? 3 : misses <= 3 ? 2 : 1);
  await talk([misses <= 1 ? '¡Muy bien! Has leído las ofertas con mucha atención.' : '¡Bien! Ya conoces todas las ofertas.'], CAST.app);
}

/* ---- 2 · match the applicants to the jobs, then sé / conozco ---- */
async function missionCandidatos() {
  renderMissions('candidatos'); clearFb(); ia('');
  APP.applicants = shuffle(APPLICANTS).slice(0, 4);
  banner('4 audios nuevos', 'Candidatos para las ofertas de verano');
  setTab('audios', true);
  await talk(['¡Mira! Tienes cuatro audios nuevos. Son personas que buscan trabajo.', 'Escucha a cada persona y decide: ¿qué trabajo es perfecto para ella? Cuidado: hay seis ofertas y solo cuatro candidatos.'], CAST.app);
  const checks = await matchBoard();
  const errors = await scSort();
  session.details.match = checks; session.details.sc = errors;
  finishMission('candidatos', checks === 1 && errors <= 1 ? 3 : checks <= 2 && errors <= 3 ? 2 : 1);
}
function matchBoard() {
  const apps = APP.applicants, place = {}, ok = new Set(), bad = new Set(); let sel = null, checks = 0;
  setTask('Listen to each applicant (▶) and <b>drag them onto the job</b> that fits them best, or click an applicant, then a job. Two jobs will stay empty. Then <b>Comprobar</b>.', 'Los candidatos');
  setHelp(lvl => ['Listen for what each person has done (he trabajado…), what they know how to do (sé…) and the places they know (conozco…). Compare with the requisitos.', 'Also listen for the hours they can work: por las mañanas, por las tardes, por la noche.'][Math.min(lvl, 1)]);
  return new Promise(resolve => {
    const draw = () => {
      const placed = new Set(Object.values(place));
      ia(`<div class="mboard"><div class="mapps"><h4>Candidatos</h4>${apps.filter(a => !Object.values(place).includes(a.id)).map(a => appCard(a)).join('') || '<p class="keyhelp">All placed. Press Comprobar.</p>'}</div>
        <div class="mjobs">${JOBS.map(j => { const a = apps.find(x => place[j.id] === x.id); return `<div class="mjob${a && ok.has(j.id) ? ' good' : ''}${a && bad.has(j.id) ? ' bad' : ''}" data-job="${j.id}">
          <div class="mjt">${iconSVG(j.id, 28)}<div><b>${esc(j.title)}</b><small>${esc(j.company)}</small></div></div><ul>${j.req.map(r => `<li>${esc(r)}</li>`).join('')}</ul><small class="mh">${esc(j.hours)}</small>
          <div class="mslot">${a ? appCard(a, ok.has(j.id)) : '<span class="ph">Arrastra aquí</span>'}</div></div>`; }).join('')}</div></div>
        <div class="row"><button class="btn primary" type="button" id="checkMatch"${Object.keys(place).length < apps.length ? ' disabled' : ''}>Comprobar</button></div>`);
      const root = $id('ia');
      root.querySelectorAll('[data-play]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); playApplicant(b.dataset.play); }));
      root.querySelectorAll('.mjob').forEach(z => z.addEventListener('click', e => { if (sel && !e.target.closest('[data-play]')) drop(sel, z); }));
      dragify(root, '.acard:not(.locked)', '.mjob, .mapps', drop, id => { sel = sel === id ? null : id; root.querySelectorAll('.acard').forEach(c => c.classList.toggle('sel', c.dataset.id === sel)); });
      const cb = $id('checkMatch'); if (cb) cb.addEventListener('click', check);
    };
    const drop = (id, zone) => {
      const from = Object.keys(place).find(k => place[k] === id); if (from && ok.has(from)) return;
      if (!zone || zone.classList.contains('mapps')) { if (from) { delete place[from]; bad.delete(from); } sel = null; draw(); return; }
      const jid = zone.dataset.job; if (ok.has(jid)) return;
      const prev = place[jid]; if (from) delete place[from]; if (prev && from) place[from] = prev;
      place[jid] = id; bad.delete(jid); if (from) bad.delete(from); sel = null; try { SFX.play('soft'); } catch (e) {} draw();
    };
    const check = async () => {
      checks++; bad.clear(); let right = 0;
      Object.entries(place).forEach(([jid, aid]) => { if (APPLICANTS.find(a => a.id === aid).job === jid) { ok.add(jid); right++; } else bad.add(jid); });
      if (right === apps.length) { draw(); $id('checkMatch').disabled = true; fb('ok', '¡Perfecto!', checks === 1 ? 'Every applicant matched on the first try.' : `All matched after ${checks} tries.`); await wait(900); resolve(checks); return; }
      try { SFX.play('wrong'); } catch (e) {}
      if (checks >= 3) { apps.forEach(a => { Object.keys(place).forEach(k => { if (place[k] === a.id) delete place[k]; }); place[a.job] = a.id; ok.add(a.job); }); bad.clear(); draw(); $id('checkMatch').disabled = true; fb('info', 'Las respuestas', 'Here are the right matches. Listen to the messages again if you like.'); await goButton('Siguiente →'); hideGo(); resolve(checks); return; }
      fb('warn', `${right}/${apps.length}`, 'The glowing ones are on the wrong job. Green ones are locked in. Listen again and move the others.'); draw();
    };
    window.__match = { place, drop: (aid, jid) => drop(aid, jid ? document.querySelector(`.mjob[data-job="${jid}"]`) : null), apps };
    draw();
  });
}
const appCard = (a, locked) => `<div class="acard${locked ? ' locked' : ''}" data-id="${a.id}" data-a="${a.id}" tabindex="0"><span class="aav">${bustSVG(appStyle(a))}</span><b>${esc(a.name)}</b><button class="aplay small" type="button" data-play="${a.id}" aria-label="Escuchar">▶</button></div>`;
function scSort() {
  const items = shuffle([...shuffle(SC_ITEMS.filter(i => i[1] === 's')).slice(0, 4), ...shuffle(SC_ITEMS.filter(i => i[1] === 'c')).slice(0, 4)]).map(([t, k], i) => ({ id: 'i' + i, t, k }));
  const place = {}; let sel = null, errors = 0;
  clearFb();
  setTask('What did the applicants say? Sort each phrase: does it go with <b>Sé…</b> or <b>Conozco…</b>? Click a phrase, then a box (or drag it). Then <b>Comprobar</b>.', '¿Sé o conozco?');
  setHelp(lvl => ['Saber: knowing how to do something (sé nadar) or knowing a fact (sé dónde…, sé que…).', 'Conocer: being familiar with a place, a thing or a person (conozco Barcelona, conozco a Marta). People take “a”.'][Math.min(lvl, 1)]);
  return new Promise(resolve => {
    const draw = () => {
      const pool = items.filter(o => !place[o.id]);
      ia(`<div class="sortpool">${pool.map(o => `<button type="button" class="wchip${sel === o.id ? ' sel' : ''}" data-id="${o.id}">… ${esc(o.t)}</button>`).join('') || '<span class="keyhelp">All placed. Check your boxes.</span>'}</div>
        <div class="buckets two">${[['s', 'Sé…'], ['c', 'Conozco…']].map(([k, t]) => `<div class="bucket" data-cat="${k}"><h4>${t}</h4>${items.filter(o => place[o.id] === k).map(o => `<button type="button" class="wchip in" data-id="${o.id}">${esc(o.t)}</button>`).join('')}</div>`).join('')}</div>
        <div class="row"><button class="btn primary" type="button" id="checkSort"${pool.length ? ' disabled' : ''}>Comprobar</button></div>`);
      const root = $id('ia');
      root.querySelectorAll('.bucket .wchip').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); delete place[b.dataset.id]; draw(); }));
      root.querySelectorAll('.bucket').forEach(bk => bk.addEventListener('click', () => { if (!sel) return; place[sel] = bk.dataset.cat; sel = items.find(o => !place[o.id])?.id || null; try { SFX.play('soft'); } catch (e) {} draw(); }));
      dragify(root, '.sortpool .wchip', '.bucket', (id, z) => { if (z) { place[id] = z.dataset.cat; try { SFX.play('soft'); } catch (e) {} } sel = null; draw(); }, id => { sel = id; draw(); });
      const cb = $id('checkSort'); if (cb) cb.addEventListener('click', async () => {
        const wrong = items.filter(o => place[o.id] !== o.k);
        if (!wrong.length) { fb('ok', '¡Perfecto!', errors ? `All sorted (${errors} moved back).` : 'All sorted, first try!'); ia(''); await talk(items.map(o => `${o.k === 's' ? 'Sé' : 'Conozco'} ${o.t}.`).slice(0, 4), CAST.app); resolve(errors); return; }
        errors += wrong.length; try { SFX.play('wrong'); } catch (e) {}
        root.querySelectorAll('.bucket .wchip').forEach(b => { if (wrong.some(o => o.id === b.dataset.id)) b.classList.add('bad'); });
        fb('warn', `${items.length - wrong.length}/${items.length}`, 'The glowing phrases are in the wrong box. They will go back so you can try again.');
        await wait(1300); wrong.forEach(o => delete place[o.id]); draw();
      });
    };
    window.__sc = { items, place };
    draw();
  });
}

/* ---- 3 · the video interview, about yourself ---- */
const TU_ADDR = /(?:^| )(y tu|a ti|contigo|tienes|puedes|quieres|eres|estas|sabes|conoces|te gusta)(?= |$)/;
async function missionEntrevista() {
  renderMissions('entrevista'); clearFb(); ia('');
  await talk(['¡Ahora te toca a ti! Elige el trabajo que más te gusta y solicítalo.', 'Después tendrás una entrevista por videollamada.'], CAST.app);
  setTask('Which job do you want? <b>Choose one</b> below, or open a posting on the phone and press <b>Solicitar</b>. Any job is fine: the interview is about <b>you</b>.', 'La entrevista');
  setHelp('Pick the job you’d really like. In the interview, you answer about yourself, so it doesn’t need to match your experience.');
  setTab('ofertas');
  const jid = await new Promise(resolve => {
    APP.onApply = id => resolve(id);
    ia(`<div class="choices jobpick">${JOBS.map(j => `<button class="choice" type="button" data-j="${j.id}">${iconSVG(j.id, 26)} ${esc(j.title)}<small>${esc(j.company)}</small></button>`).join('')}</div>`);
    $id('ia').querySelectorAll('[data-j]').forEach(b => b.addEventListener('click', () => resolve(b.dataset.j)));
    window.__apply = id => resolve(id);
  });
  APP.onApply = null; APP.detail = null; ia(''); const J = JOB(jid); SOL.job = jid; APP.profileJob = jid; renderSolicitud(); try { SFX.play('correct'); } catch (e) {}
  const boss = { name: `${J.boss.name} (${J.company})`, pitch: J.boss.fem ? 1.06 : .84, rate: .95, boss: true }, A = J.boss.fem ? 'a' : 'o';
  APP.call = { job: jid, state: 'ringing', caption: '' }; setTab('llamada', true);
  await wait(1800); APP.call.state = 'live'; renderPhone(); const t0 = Date.now();
  const timer = setInterval(() => { const e = $id('ctime'); if (!e || APP.call.state !== 'live') return; const s = Math.floor((Date.now() - t0) / 1000); e.textContent = `● ${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 1000);
  await talk([`¡Hola, buenos días! Soy ${J.boss.name}, de ${J.company}. Encantad${A} de conocerle.`, `Gracias por solicitar el puesto de ${spoken(J.title)}. Vamos a empezar, ¿vale?`], boss);
  const skill = J.req.find(r => /^Saber/.test(r)) || 'Saber trabajar en equipo', place = J.req.find(r => /^Conocer/.test(r));
  const QS = [
    { k: 'q1', q: ['Bueno, cuénteme: ¿ha trabajado antes? ¿Qué ha hecho?'], follow: '¿Y qué cosas ha hecho? Por ejemplo, ¿ha cuidado a niños, ha ayudado en casa, ha trabajado en una tienda?',
      task: 'Answer about <b>your experience</b>. What have you done? Use the <b>perfect</b>.', help: ['Perfect: he + participle: he trabajado, he cuidado, he ayudado, he vendido, he hecho.', 'No experience? That’s fine: Nunca he trabajado, pero he ayudado a mis padres en…'],
      test: (raw, r) => r.perf.count >= 1, miss: 'Use the perfect: he trabajado, he cuidado, he ayudado…' },
    { k: 'q2', q: [`Para este trabajo hay que ${skill.replace(/^Saber/, 'saber')}${place ? ` y ${place.replace(/^Conocer/, 'conocer')}` : ''}.`, '¿Qué sabe hacer usted? ¿Y qué lugares conoce bien?'],
      task: 'What do you <b>know how to do</b>, and what <b>places</b> (or people) do you know? Use <b>sé…</b> and <b>conozco…</b>.', help: ['Sé + infinitive: sé nadar, sé cocinar, sé hablar inglés. Conozco + place or person: conozco Lethbridge, conozco a mucha gente.', 'Remember the accent: sé (I know). Conozco has a z.'],
      test: (raw, r) => r.sc.saber.length >= 1 && r.sc.conocer.length >= 1 && !r.sc.slips.some(s => s.mix), miss: null,
      followFn: r => !r.sc.saber.length ? '¿Y qué sabe hacer? ¿Sabe cocinar, nadar, hablar idiomas…?' : !r.sc.conocer.length ? '¿Y qué lugares conoce? ¿Conoce bien su ciudad?' : '¿Perdón? ¿Qué sabe hacer y qué lugares conoce?' },
    { k: 'q3', q: ['Muy bien. Ahora hábleme del verano pasado. ¿Qué hizo?'], follow: '¿Y adónde fue? ¿Qué más hizo? ¿Trabajó, viajó…?',
      task: 'Tell the interviewer what you did <b>last summer</b>. Use the <b>preterite</b> (at least two verbs).', help: ['Preterite, yo: trabajé, viajé, visité, ayudé, aprendí, fui, hice, tuve.', 'Two sentences is enough: El verano pasado fui a… y trabajé en…'],
      test: (raw, r) => r.past.pret.length >= 2, miss: 'Use two or more verbs in the preterite: trabajé, fui, hice…' },
    { k: 'q4', q: ['Última pregunta: si le damos el trabajo, ¿qué hará con el dinero? ¿Y qué más hará este verano?'], follow: '¿Y qué hará exactamente? ¿Ahorrará, viajará, comprará algo?',
      task: 'What <b>will</b> you do with the money, and this summer? Use the <b>simple future</b> (at least two verbs).', help: ['Simple future: infinitive + é: trabajaré, ahorraré, compraré, viajaré. Irregular: haré, tendré, podré, saldré.', '“Voy a ahorrar” is correct Spanish, but here use the simple future: ahorraré.'],
      test: (raw, r) => r.fut.fut.length >= 2, miss: 'Use two or more verbs in the simple future: ahorraré, viajaré, haré…' },
  ];
  let issues = 0;
  for (const Q of QS) {
    clearFb(); setTask(Q.task, 'La entrevista'); setHelp(lvl => Q.help[Math.min(lvl, Q.help.length - 1)]);
    await talk(Q.q, boss);
    composer({ placeholder: 'Escribe tu respuesta…' });
    let tries = 0;
    await waitSubmit(async raw => {
      youSaid(raw); session.stats.messages++; logLine('Tú', raw); APP.call.caption = raw; renderPhone();
      const n = norm(raw);
      if (looksEnglish(n)) { fb('warn', 'En español, por favor', ''); await talk(['Perdone, ¿me lo puede decir en español?'], boss); return false; }
      tries++;
      const r = { perf: analyzePerfect(raw), sc: analyzeSC(raw), past: analyzePast(raw), fut: analyzeFuture(raw) };
      const slips = [...r.perf.slips, ...r.sc.slips, ...(Q.k === 'q3' ? r.past.slips : []), ...(Q.k === 'q4' ? r.fut.slips.map(s => ({ wrote: s.wrote, fix: s.fix, note: 'Irregular future stem' })) : [])];
      slips.slice(0, 3).forEach(s => fb('err', `<span class="fix"><s>${esc(s.wrote)}</s> → ${esc(s.fix)}</span>`, s.note || ''));
      if (Q.k === 'q4') r.fut.accents.slice(0, 2).forEach(s => fb('warn', `<span class="fix"><s>${esc(s.wrote)}</s> → ${esc(s.fix)}</span>`, 'Future endings have an accent: -é, -á, -án'));
      accentTips(raw);
      if (TU_ADDR.test(n) && /(tu|ti|contigo)\b/.test(n)) fb('info', 'Usted', 'In an interview, use usted: ¿y usted? ¿Puede…?');
      const met = Q.test(raw, r), short = words(raw).length < 4;
      if (met && !short) {
        fb('ok', { q1: `Perfecto ✓ ${esc(r.perf.forms.slice(0, 2).map(f => f.text).join(', '))}`, q2: `Sé ✓ · Conozco ✓`, q3: `Pretérito ✓ ${r.past.pret.length}`, q4: `Futuro ✓ ${esc(r.fut.fut.slice(0, 3).map(f => f.w).join(', '))}` }[Q.k], '');
        issues += (tries > 1 ? 1 : 0) + (slips.length ? 1 : 0); SOL[Q.k] = true; renderSolicitud(); session.writing.push({ scene: `Entrevista (${J.title})`, text: raw });
        ia(''); await talk([pick(['¡Muy bien!', '¡Qué interesante!', 'Vale, perfecto.', '¡Estupendo!', 'Ah, muy bien. Eso nos viene genial.'])], boss); return raw;
      }
      if (short) fb('warn', 'Más detalles', 'Say a little more: one or two full sentences.');
      else if (Q.miss) fb('warn', 'Casi', Q.miss);
      else { if (!r.sc.saber.length) fb('warn', 'Sé…', 'Say what you know how to do: sé + infinitive.'); if (!r.sc.conocer.length) fb('warn', 'Conozco…', 'Say a place or person you know: conozco…'); }
      if (tries >= 3) { issues += 2; session.writing.push({ scene: `Entrevista (${J.title})`, text: raw }); ia(''); await talk(['Vale, gracias. Sigamos.'], boss); return raw; }
      await talk([short ? '¿Me puede dar más detalles?' : Q.followFn ? Q.followFn(r) : Q.follow], boss);
      return false;
    });
  }
  await talk(['¡Estupendo! Muchas gracias por su tiempo.', 'Ahora, por favor, complete su perfil en la aplicación. ¡Le escribiremos pronto! Hasta luego.'], boss);
  clearInterval(timer); APP.call.state = 'ended'; APP.call.caption = ''; renderPhone();
  session.details.interview = { job: jid, issues };
  finishMission('entrevista', issues <= 1 ? 3 : issues <= 3 ? 2 : 1);
}

/* ---- 4 · your profile ("Sobre mí"), shown live on the phone ---- */
function profileCheck(raw) {
  const p = analyzePerfect(raw), a = analyzePast(raw), f = analyzeFuture(raw), sc = analyzeSC(raw);
  return { perf: p.count >= 2, pret: a.pret.length >= 2, fut: f.fut.length >= 2, se: sc.saber.length >= 1, con: sc.conocer.length >= 1, len: words(raw).length >= 45, _: { p, a, f, sc } };
}
async function missionPerfil() {
  renderMissions('perfil'); clearFb(); ia(''); setTab('perfil', true);
  await talk(['Último paso: escribe la sección «Sobre mí» de tu perfil. Las empresas la van a leer.'], CAST.app);
  setTask(`Write the <b>“Sobre mí”</b> for your profile (about <b>50 words</b>). It appears live on the phone.
    <ul class="checklist"><li>What you <b>have done</b>: two or more verbs in the perfect (<i>he trabajado…</i>)</li><li>What you <b>did</b> last summer: two or more in the preterite</li><li>What you <b>will do</b> this summer: two or more in the simple future</li><li>What you know: <b>sé…</b> and <b>conozco…</b></li></ul>`, 'Tu perfil');
  setHelp(lvl => ['Start like this: Me llamo… Tengo… años. He trabajado… y he…', 'Reuse what you said in the interview: experience, sé/conozco, last summer, this summer.'][Math.min(lvl, 1)]);
  composer({ multiline: true, rows: 7, placeholder: 'Me llamo… He trabajado…' });
  const inp = $id('inp'); let deb = 0;
  inp.addEventListener('input', () => { clearTimeout(deb); deb = setTimeout(() => { APP.profile = inp.value; APP.profileCheck = profileCheck(inp.value); if (APP.tab === 'perfil') { const t = document.querySelector('#pscreen .pftext'), ck = document.querySelector('#pscreen .pfck'); if (t && ck) { t.textContent = inp.value || 'Escribe tu perfil abajo…'; t.classList.toggle('empty', !inp.value); ck.outerHTML = perfilHTML().match(/<ul class="pfck">[\s\S]*?<\/ul>/)[0]; } else renderPhone(); } }, 250); });
  let tries = 0;
  await waitSubmit(async raw => {
    youSaid(raw); session.stats.messages++; logLine('Tú', raw);
    const n = norm(raw); if (looksEnglish(n)) { fb('warn', 'En español, por favor', ''); return false; }
    tries++; APP.profile = raw; const c = profileCheck(raw); APP.profileCheck = c; renderPhone();
    const slips = [...c._.p.slips, ...c._.sc.slips, ...c._.a.slips, ...c._.f.slips.map(s => ({ wrote: s.wrote, fix: s.fix, note: 'Irregular future stem' }))];
    slips.slice(0, 4).forEach(s => fb('err', `<span class="fix"><s>${esc(s.wrote)}</s> → ${esc(s.fix)}</span>`, s.note || ''));
    c._.f.accents.slice(0, 2).forEach(s => fb('warn', `<span class="fix"><s>${esc(s.wrote)}</s> → ${esc(s.fix)}</span>`, 'Accent'));
    accentTips(raw);
    fb(c.perf ? 'ok' : 'warn', `Perfecto: ${c._.p.count}`, c.perf ? '✓' : 'Two or more: he trabajado, he cuidado…');
    fb(c.pret ? 'ok' : 'warn', `Pretérito: ${c._.a.pret.length}`, c.pret ? '✓' : 'Two or more: trabajé, fui, hice…');
    fb(c.fut ? 'ok' : 'warn', `Futuro: ${c._.f.fut.length}`, c.fut ? '✓' : 'Two or more: trabajaré, ahorraré…');
    fb(c.se && c.con ? 'ok' : 'warn', 'Sé · Conozco', c.se && c.con ? '✓' : !c.se ? 'Add sé + infinitive.' : 'Add conozco + a place or person.');
    if (!c.len) fb('warn', 'Más, por favor', `A little longer (${words(raw).length} words).`);
    const met = c.perf && c.pret && c.fut && c.se && c.con && c.len && !c._.sc.slips.some(s => s.mix);
    if (met || tries >= 3) {
      session.writing.push({ scene: 'Sobre mí', text: raw }); session.details.profile = { met, slips: slips.length }; SOL.perfil = true; renderSolicitud();
      finishMission('perfil', met ? (slips.length <= 1 ? 3 : 2) : 1); ia('');
      return raw;
    }
    return false;
  });
  const J = JOB(APP.profileJob);
  await wait(900);
  banner(J.company, `¡Enhorabuena! Queremos contratarte como ${J.title.toLowerCase()}. ¿Empiezas el lunes?`, 0);
  try { SFX.celebrate(0); } catch (e) {}
  await talk([`¡Mira tu móvil! ¡Te han dado el trabajo de ${spoken(J.title)} en ${J.company}! ¡Enhorabuena!`, 'Mi próximo destino: Santiago de Chile. ¡Allí te espera un examen de manejo!'], CAST.lucia);
}

/* ============ 8 · END OF SESSION ============ */
function endSession() {
  stopSpeech(); hideGo();
  const mins = Math.max(1, Math.round((Date.now() - session.started) / 60000)), total = session.missions.reduce((a, m) => a + m.stars, 0), D = session.details;
  const J = SOL.job ? JOB(SOL.job) : null;
  const badges = [
    ['Datos de Barcelona', 'Found all six facts about Barcelona', found.size >= 6],
    ['Buen lector', 'Answered every posting question without a wrong tap', D.ofertas === 0],
    ['Buen oído', 'Matched all four applicants on the first check', D.match === 1],
    ['¡Contratado/a!', 'Interview with every answer right the first time', D.interview && D.interview.issues === 0],
  ];
  const el = $id('summary');
  el.innerHTML = `
    <div><p class="eyebrow">Fin del día · Barcelona</p><h2>¡Adéu, Barcelona!</h2></div>
    <div class="stats">
      <div class="stat"><div class="v">${total}/12</div><div class="k">Estrellas</div></div>
      <div class="stat"><div class="v">${J ? esc(J.title.split(' ')[0].replace(/\/a$/, '')) : '—'}</div><div class="k">Tu trabajo</div></div>
      <div class="stat"><div class="v">${found.size}/6</div><div class="k">Datos de Barcelona</div></div>
      <div class="stat"><div class="v">${mins}</div><div class="k">Minutos</div></div>
    </div>
    <div class="mrows">${session.missions.map(m => `<div class="mrow"><span>${esc(m.title)}</span><span class="stars">${starStr(m.stars)}</span></div>`).join('')}</div>
    <div class="badges">${badges.map(([t, d, on]) => `<span class="badge${on ? '' : ' off'}" title="${esc(d)}">★ ${esc(t)}</span>`).join('')}</div>
    <div><h3 class="lbl">Lo que escribiste</h3><ol class="transcript" style="margin-top:8px">${session.writing.map(w => `<li><b>${esc(w.scene)}:</b> ${esc(w.text)}</li>`).join('')}</ol></div>
    <p class="outcomes">${session.textShown ? 'Text was turned on during this session' + (session.textReason === 'novoice' ? ' (no Spanish voice on this computer).' : session.textReason === 'accommodation' ? ' (accommodation link).' : '.') + ' · ' : 'Played audio-only (postings and sorting phrases are always written). · '}${J ? `Job chosen: ${esc(J.title)} (${esc(J.company)}). ` : ''}Outcomes practised (30-3Y): LC–1.3 a (the world of work) · LC–1.4 b (perfect, preterite, simple future, irregular present conocer and saber) · LC–2.1 a · LC–2.3 a · LC–3.1 a · LC–3.2 a · LC–4.1 b · GC–3.1 b.</p>
    <div class="row"><button class="btn primary" type="button" id="againBtn" data-again>Jugar otra vez</button></div>`;
  el.hidden = false;
  try { SFX.celebrate(0); } catch (e) {}
  $id('againBtn').addEventListener('click', () => { el.hidden = true; $id('pbanner').hidden = true; window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); startGame(); });
  el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  setTask('That’s the end of the day. Your summary and report are below.', 'Fin'); ia('');
}

/* ============ 9 · BOOT ============ */
function syncSpeed() { document.querySelectorAll('[data-speed]').forEach(b => b.classList.toggle('on', b.dataset.speed === SETTINGS.speed)); }
function wireUI() {
  $id('introFace').innerHTML = luciaSVG('happy');
  $id('sceneHost').innerHTML = sceneSVG();
  document.querySelectorAll('.scene .gem').forEach(g => { g.addEventListener('click', () => openGem(g.dataset.gem)); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGem(g.dataset.gem); } }); });
  document.querySelectorAll('#ptabs button').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
  $id('startBtn').addEventListener('click', () => { $id('intro').hidden = true; try { SFX.play('whoosh', { force: true }); } catch (e) {} startGame(); });
  $id('testVoice').addEventListener('click', () => talk(['¡Hola! Bienvenido a Barcelona.'], CAST.lucia, { replay: true }));
  $id('replay').addEventListener('click', replay);
  $id('helpBtn').addEventListener('click', onHelp);
  $id('gemClose').addEventListener('click', () => $id('gemCard').hidden = true);
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
  renderMissions(); renderGems(); renderVocab(); renderSolicitud(); setTab('ofertas'); phoneClock(); setInterval(phoneClock, 5000);
}
wireUI();
window.__barcelona = { get session() { return session; }, APP, SOL, JOBS, APPLICANTS, analyzePerfect, analyzeSC, analyzePast, analyzeFuture, profileCheck, startGame, setText, endSession, setTab, openGem };
