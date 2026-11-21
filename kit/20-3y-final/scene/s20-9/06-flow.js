/* ===================== Game flow ===================== */
const S = { started: false, glos: new Set(), glosNew: new Set(), gems: new Set(), arch: new Set(), cards: [], traits: [], crossed: new Set(), seals: [], stopStars: [] };
const PEOPLE = { lucia: { name: 'Lucía', voice: 'f', color: 'var(--accent)' }, elena: { name: 'Elena (carta)', voice: 'f' } };
const feed = makeFeed({ feed: $('feed'), people: PEOPLE, autoplay: $('autoplay'), clock: () => S.G ? clockText(S.t) : '' });
const setTask = t => { $('task').innerHTML = t; };
function setActions(list) {
  const box = $('actions');
  box.replaceChildren();
  list.forEach(a => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'choice' + (a.cls ? ' ' + a.cls : '');
    b.innerHTML = a.html || `${a.ic ? `<span class="ic">${a.ic}</span>` : ''}${a.label}${a.sub ? `<small>${a.sub}</small>` : ''}`;
    if (a.disabled) b.disabled = true;
    b.addEventListener('click', () => { if (!S.busy) a.on(b); });
    box.appendChild(b);
  });
}
function addPerson(key, w) { if (!PEOPLE[key]) { PEOPLE[key] = { name: w.name, voice: w.look && w.look.fem ? 'f' : 'm' }; CAST[key] = headSVG(w.look); } }
CAST.elena = `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" fill="#EAD3A8"/><path d="M8 10 h24 v20 h-24 z" fill="#F6E7C8" stroke="#B88A4A"/><path d="M11 15 h18 M11 19 h18 M11 23 h12" stroke="#7A3B1A" stroke-width="1.2"/></svg>`;
const luciaSay = (t, o) => feed.say('lucia', t, o);
const cityName = id => cityOf(id).name;
const curId = () => S.G.route[S.i];

/* ---------- side panel ---------- */
function renderClock(delta, why) {
  if (!S.G) { $('clock').textContent = ''; return; }
  const left = hoursLeft();
  $('clock').textContent = `🕰️ ${clockText(S.t)}`;
  $('clock').classList.toggle('low', left <= 24);
  $('timeFill').style.width = (left / T_END * 100) + '%';
  $('timeFill').classList.toggle('low', left <= 24);
  const d = Math.floor(left / 24), h = Math.round(left % 24);
  $('timeLeft').innerHTML = `Te quedan <b>${d ? `${d} d ` : ''}${h} h</b> · hasta el domingo a las 8:00`;
  if (delta && why) {
    const c = document.createElement('div');
    c.className = 'chip appear ' + (delta < 0 ? 'ok' : 'info');
    c.innerHTML = `<b>${delta < 0 ? '+' + (-delta) : '−' + delta} h</b><span class="en">${esc(why)}${S.slept ? ' · You slept until 07:00.' : ''}</span>`;
    $('fbs').prepend(c);
    while ($('fbs').children.length > 3) $('fbs').lastChild.remove();
    S.slept = false;
  }
}
function renderRoute() {
  if (!S.G) { $('missionList').innerHTML = ''; $('medal').innerHTML = ''; $('gemCount').innerHTML = ''; return; }
  const items = S.G.route.map((id, k) => {
    const known = k < S.i || (k === S.i && S.arrived);
    const cls = k < S.i ? 'done' : k === S.i ? 'current' : '';
    const label = k === 7 ? (known ? 'Granada' : 'Granada (el final)') : known ? cityName(id) : '¿…?';
    return `<li class="${cls}"><span class="n">${k + 1}</span><span class="t">${esc(label)}</span>${k < 7 && S.stopStars[k] ? `<span class="stars">${stars(S.stopStars[k])}</span>` : ''}</li>`;
  });
  $('missionList').innerHTML = items.join('');
  $('medal').innerHTML = medalSVG(S.G.route.slice(0, 7).map(id => CITIES[id].sym), S.seals);
  $('gemCount').innerHTML = `Sellos: <b>${S.seals.length}/7</b> · Datos nuevos: <b>${S.gems.size + (S.gemsPrior || 0)}</b>`;
}

/* ---------- dossier tabs ---------- */
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => openTab(t.dataset.tab)));
function openTab(name) {
  document.querySelectorAll('.tab').forEach(t => { const on = t.dataset.tab === name; t.classList.toggle('on', on); if (on) t.classList.remove('ping'); });
  document.querySelectorAll('.tabpane').forEach(p => { p.hidden = p.id !== 'tab-' + name; });
  if (name === 'glosario') { S.glosPing = false; renderGlossary(); setTimeout(() => S.glosNew.clear(), 50); }
}
const ping = name => { const t = document.querySelector(`.tab[data-tab="${name}"]`); if (t && !t.classList.contains('on')) t.classList.add('ping'); };
function renderSuspects() {
  const el = $('tab-sospechosos');
  if (!S.G) { el.innerHTML = '<p class="empty">The suspects appear when the game starts.</p>'; return; }
  const known = {}; S.traits.forEach(t => { known[t.k] = t.v; });
  el.innerHTML = `<div class="suspects">${S.G.suspects.map((s, i) => `<div class="sus${S.crossed.has(i) ? ' out' : ''}${S.phase === 'warrant' ? ' pickable' : ''}" data-i="${i}" role="button" tabindex="0" aria-label="${esc(s.name)}">${suspectSVG(s)}<div class="nm">${esc(s.name)}</div><div class="tr">${FEAT_KEYS.map(k => { const v = s.f[k], c = known[k] ? (known[k] === v ? ' match' : ' miss') : ''; return `<span class="${c.trim()}" title="${FEATS[k].label}: ${esc(FEATS[k].vals[v].es)}">${FEATS[k].vals[v].ic}</span>`; }).join('')}</div></div>`).join('')}</div>`
    + `<div class="traits">${S.traits.length ? S.traits.map(t => `<span class="t">${FEATS[t.k].vals[t.v].ic} ${esc(FEATS[t.k].label)}: <b>${esc(FEATS[t.k].vals[t.v].es)}</b></span>`).join('') : '<span class="susnote">No clues about the thief yet. The third witness in each city describes them.</span>'}</div>`
    + `<p class="susnote">${S.phase === 'warrant' ? '<b>Click the thief.</b>' : 'Click a suspect to cross them out (or back in). Highlighted features match what the witnesses said.'}</p>`;
  el.querySelectorAll('.sus').forEach(c => {
    const go = () => { const i = +c.dataset.i; if (S.phase === 'warrant') return accuse(i); S.crossed.has(i) ? S.crossed.delete(i) : S.crossed.add(i); SFX.play('turn'); renderSuspects(); };
    c.addEventListener('click', go); c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
}
function addCard(card) { if (S.cards.some(c => c.id === card.id)) return; S.cards.push(card); renderCards(); ping('pruebas'); }
function renderCards() {
  $('nPruebas').textContent = S.cards.length;
  $('tab-pruebas').innerHTML = S.cards.length ? `<div class="cards">${S.cards.map(c => `<div class="ecard"><span class="e">${c.ic}</span><div class="k">${esc(c.kind)}</div>${gl(c.text)}</div>`).join('')}</div>` : '<p class="empty">Evidence you collect (what witnesses saw, Elena’s letters, notes) goes here. You will need it in Granada.</p>';
}
function renderArchive() {
  const ids = S.G ? S.G.route.filter((id, k) => k < S.i || (k === S.i && S.sealDone) || (id === 'granada' && S.phase === 'end' && S.won)) : [];
  $('nArchivo').textContent = ids.length;
  const el = $('tab-archivo');
  if (!ids.length) { el.innerHTML = '<p class="empty">Each seal opens the Archivo for its city: its history in short Spanish, with more to read if you want it.</p><div class="arch"><h4>La leyenda de las siete ciudades</h4><p>' + gl('Una leyenda muy antigua dice que en el año 711 siete obispos salieron de la península ibérica en barco. Cruzaron el océano y fundaron siete ciudades llenas de oro.') + '</p></div>'; return; }
  el.innerHTML = `<div class="arch"><h4>La leyenda de las siete ciudades</h4><p>${gl('Una leyenda muy antigua dice que en el año 711 siete obispos salieron de la península ibérica en barco. Cruzaron el océano y fundaron siete ciudades llenas de oro.')}</p></div>` + ids.map(id => { const a = CITIES[id].archivo; return `<div class="arch"><h4>${esc(a.title)}</h4><p><span class="yr">${esc(a.year)}</span> · ${gl(a.event)}</p>${a.short.map(l => `<p>${gl(l)}</p>`).join('')}<details data-id="${id}"><summary>Leer más (en español)</summary><p>${gl(a.long)}</p><p class="en">${esc(a.en)}</p></details></div>`; }).join('');
  el.querySelectorAll('details').forEach(d => d.addEventListener('toggle', () => { if (d.open && !S.arch.has(d.dataset.id)) { S.arch.add(d.dataset.id); refreshGlossary(); } }));
}
function renderGlossary() {
  $('nGlos').textContent = S.glos.size;
  const list = [...S.glos].sort((a, b) => keyOf(a.replace(/^(el|la|los|las) /, '')).localeCompare(keyOf(b.replace(/^(el|la|los|las) /, ''))));
  $('tab-glosario').innerHTML = list.length ? `<div class="glos">${list.map(l => `<div class="g${S.glosNew.has(l) ? ' fresh' : ''}" data-l="${esc(l)}" role="button" tabindex="0"><span class="ic">${GLOSS[l].ic}</span><span><b>${esc(l)}</b><span class="en">${esc(GLOSS[l].en)}</span></span></div>`).join('')}</div>` : '<p class="empty">New words light up in the text (dotted underline). Hover or tap them; they collect here.</p>';
  $('tab-glosario').querySelectorAll('.g').forEach(g => g.addEventListener('click', () => speak(g.dataset.l)));
}
function refreshGlossary() { $('nGlos').textContent = S.glos.size; if (S.glosPing) ping('glosario'); if (!$('tab-glosario').hidden) renderGlossary(); }
function renderDossier() { renderSuspects(); renderCards(); renderArchive(); renderGlossary(); }

/* ---------- popups inside the stage ---------- */
function popup(cls, html, buttons = [{ label: 'Cerrar' }]) {
  return new Promise(res => {
    document.querySelector('.gemcard')?.remove();
    const c = document.createElement('div');
    c.className = 'gemcard appear ' + cls;
    c.innerHTML = html + `<div class="row">${buttons.map((b, i) => `<button class="btn ${i === buttons.length - 1 ? 'primary' : 'ghost'} small" type="button" data-b="${i}">${b.label}</button>`).join('')}</div>`;
    $('viewport').appendChild(c);
    c.querySelectorAll('[data-b]').forEach(b => b.addEventListener('click', () => { const bb = buttons[+b.dataset.b]; if (bb.on) { bb.on(); return; } c.remove(); res(+b.dataset.b); }));
    refreshGlossary();
  });
}
function letterHTML(title, paras, sig, en) {
  return `<p class="gtitle">${esc(title)}</p>${paras.map(p => `<p>${gl(p)}</p>`).join('')}${sig ? `<p class="sig">${esc(sig)}</p>` : ''}${en ? `<p class="gen">${esc(en)}</p>` : ''}<div class="mctl"><button class="play" type="button" onclick="this.dispatchEvent(new CustomEvent('say',{bubbles:true}))">▶ Escuchar</button></div>`;
}
document.addEventListener('say', e => { const card = e.target.closest('.gemcard'); if (card) speak([...card.querySelectorAll('p:not(.gtitle):not(.gen):not(.sig)')].map(p => p.textContent).join(' ')); });

function showGem(id) {
  const g = (CITIES[curId()] && CITIES[curId()].gems || []).find(x => x.id === id); if (!g) return;
  const first = !S.gems.has(id);
  S.gems.add(id);
  $('sceneSvg').querySelectorAll(`[data-gem="${id}"]`).forEach(x => x.classList.add('found'));
  popup('', `<p class="gtitle">Dato · ${esc(g.title)}</p><p>${gl(g.es)}</p><p class="gen">${esc(g.en)}</p>`);
  speak(g.es);
  if (first) SFX.play('badge');
  renderRoute();
}

/* ---------- start, resume, restart ---------- */
function freshState(seed) {
  Object.assign(S, {
    started: true, G: makeGame(seed), i: 0, t: 0, phase: 'prologue', stopStars: [], hints: 0, wrong: 0, miss: 0, rem: 0,
    gems: new Set(), gemsPrior: 0, arch: new Set(), archPrior: 0, glos: new Set(), glosNew: new Set(), traits: [], cards: [], seals: [], crossed: new Set(),
    witDone: [], sealDone: false, legWrong: 0, legHints: 0, legMiss: 0, legShown: false, remDone: false, busy: false, finale: {}, won: false, log: [], t0: Date.now(), leg: 0, arrived: false, triedLeg: [], trunkOpen: false, heard: [], puzzleOpen: false
  });
}
function start(resume) {
  closePuzzle();
  $('cine').hidden = true; $('cine').innerHTML = '';
  $('summary').hidden = true;
  $('intro').hidden = true;
  feed.reset(); clearFb(); $('codeBox').hidden = true;
  const seed = resume ? resume.seed : 1 + rand((1 << 20) - 2);
  freshState(seed);
  if (resume) restore(resume);
  renderClock(); renderRoute(); renderDossier(); openTab('sospechosos');
  if (resume) { S.i === 7 ? arriveGranada() : arrive(); }
  else prologue();
}
function restore(f) {
  S.i = f.stop; S.t = f.t; S.rem = f.rem; S.gemsPrior = f.gems; S.hints = f.hints; S.wrong = f.wrong; S.archPrior = f.arch; S.miss = f.miss;
  for (let k = 0; k < 7; k++) if (k < S.i) S.stopStars[k] = f['s' + k] || 1;
  for (let k = 0; k < S.i && k < 7; k++) {
    const id = S.G.route[k];
    S.seals.push(CITIES[id].sym);
    revealTrait(k, true);
    addLetterCard(k, true);
    unlockWords(CITIES[id].letter); CITIES[id].archivo.short.forEach(unlockWords);
  }
  S.cards.unshift(NOTE_CARD, ELENA_CARD);
  S.glosNew.clear();
}
const NOTE_CARD = { id: 'nota', ic: '📝', kind: 'El desván · la nota', text: '«Gracias por la página del mapa. ¡Las siete ciudades de oro van a ser mías!»' };
const ELENA_CARD = { id: 'carta0', ic: '✉️', kind: 'El desván · carta de Elena', text: 'Elena Robles, tu tatarabuela, nació en Granada en 1890. Era cartógrafa. Dejó el medallón a su familia.' };
$('startBtn').addEventListener('click', () => start());
$('resumeBtn').addEventListener('click', () => { $('resumeForm').hidden = false; $('resumeCode').focus(); });
$('resumeForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = resumeDecode($('resumeCode').value);
  if (!f) { $('resumeMsg').textContent = 'That code doesn’t work. Check the letters and numbers.'; SFX.play('wrong'); return; }
  $('resumeMsg').textContent = '';
  start(f);
});
$('restart').addEventListener('click', () => {
  if (S.started && S.phase !== 'end' && !confirm('Start a new game? (Write down your code first if you want to continue later.)')) return;
  try { speechSynthesis.cancel(); } catch (e) {}
  start();
});

/* ---------- prologue: the attic in Lethbridge ---------- */
async function prologue() {
  S.phase = 'prologue'; S.leg = 0; S.arrived = false; S.triedLeg = [];
  $('placeName').textContent = 'El desván · Lethbridge, Alberta';
  drawCity('lethbridge');
  setTask('Your family is clearing out the attic. <b>Click the old trunk.</b>');
  setActions([]);
  await luciaSay('¡Hola! Soy Lucía. Tu mamá dice que encontraste un baúl viejo en el desván. ¡Ábrelo! Yo te ayudo por teléfono.');
}
async function openTrunk() {
  if (S.phase !== 'prologue' || S.trunkOpen) return;
  S.trunkOpen = true; SFX.play('door');
  await popup('letter', letterHTML('Una carta en el baúl', ['Querida familia:', 'Me llamo Elena Robles. Nací en Granada, en España, en 1890. Soy cartógrafa: hago mapas.', 'Toda mi vida busqué las siete ciudades de oro de Cíbola. Viajé por todo el mundo hispano.', 'En siete ciudades dejé un sello. Con los siete sellos, este medallón abre mi caja en Granada.', '¡Buen viaje!'], 'Elena Robles · Granada, 1952', 'Your great-great-grandmother Elena, a map-maker born in Granada, left a seal in seven cities. With all seven, the medallion opens her box in Granada.'), [{ label: 'Seguir leyendo' }]);
  await popup('letter', letterHTML('La leyenda', ['Una leyenda muy antigua dice que en el año 711 siete obispos salieron de la península ibérica en barco, con sus tesoros.', 'Cruzaron el océano y fundaron siete ciudades llenas de oro.', 'Muchos exploradores las buscaron en América… ¿Existen?'], '', 'The legend of the Seven Cities: in 711 seven bishops sailed west with their treasures and founded seven cities of gold. Many explorers looked for them in the Americas.'), [{ label: 'Mirar el medallón' }]);
  addCard(ELENA_CARD);
  SFX.play('wrong');
  await popup('', `<p class="gtitle">¡Falta una página del mapa!</p><p>${gl('En el baúl hay una nota. Alguien robó una página del mapa de Elena.')}</p><p style="font-family:Georgia,serif;font-style:italic;font-size:18px;margin-top:8px">${gl('«Gracias por la página del mapa. ¡Las siete ciudades de oro van a ser mías!»')}</p><p class="gen">Someone has stolen a page of Elena’s map and is following her trail. You have until Sunday at 08:00 to reach Granada with the seven seals.</p>`, [{ label: '¡Vamos!' }]);
  addCard(NOTE_CARD);
  renderRoute();
  await luciaSay('¡Qué horror! Alguien tiene la página del mapa. Pero el ladrón no tiene el medallón: necesita los sellos también.');
  const L = S.G.legs[0];
  await sleep(300);
  await luciaSay('Mi amiga trabaja en el aeropuerto de Calgary. Esta mañana vio a una persona sospechosa con una página vieja. Me dijo dos cosas:');
  await clueMsg('lucia', L.clueA);
  await clueMsg('lucia', L.clueB);
  setTask('Read the two clues. Where did the thief go? <b>Go to the airport</b> and choose a flight.');
  setActions([{ ic: '✈️', label: 'Ir al aeropuerto', sub: 'Choose the next city', on: () => showFlights() }]);
}

/* a clue message: text + pictures + flag, and a Dato tag when it needs an earlier game */
async function clueMsg(who, clue, title) {
  await feed.say(who, clue.es, { name: who === 'elena' ? 'Elena (nota del mapa)' : undefined });
  const last = $('feed').lastElementChild;
  if (last) {
    const extra = document.createElement('div');
    extra.className = 'icons';
    const segs = !clue.ic ? [] : (typeof Intl !== 'undefined' && Intl.Segmenter) ? [...new Intl.Segmenter('es', { granularity: 'grapheme' }).segment(clue.ic)].map(x => x.segment) : Array.from(clue.ic);
    extra.innerHTML = segs.map(e => `<span>${e}</span>`).join('') + (clue.flag ? `<span>${flagHTML(clue.flag)}</span>` : '');
    last.querySelector('.mtext').innerHTML = gl(clue.es) + (clue.ref ? `<span class="datotag" title="Remember the Datos from ${esc(clue.ref)}">Dato · ${esc(clue.ref)}</span>` : '');
    last.querySelector('.mctl').before(extra);
  }
  S.heard = S.heard || [];
  S.heard.push(clue);
  refreshGlossary();
}

/* ---------- flights ---------- */
function legOptions() {
  const L = S.G.legs[S.leg];
  const base = [L.id, ...L.decoys];
  return S.phase === 'wrongcity' ? base.filter(id => id !== S.at && !S.triedLeg.includes(id)) : shuffle(base);
}
function showFlights() {
  const L = S.G.legs[S.leg], from = S.phase === 'wrongcity' ? S.at : L.from;
  S.mapFrom = from;
  const opts = S.flightOpts && S.flightOpts.leg === S.leg && S.flightOpts.from === from ? S.flightOpts.list : legOptions();
  S.flightOpts = { leg: S.leg, from, list: opts };
  S.prevPhase = S.phase; S.phase = 'map';
  $('placeName').textContent = `El aeropuerto · ${cityName(from)}`;
  const visited = ['lethbridge', ...S.G.route.slice(0, S.i)];
  $('sceneSvg').innerHTML = mapSVG({ pins: opts.map(id => ({ id })), at: from, visited, path: visited });
  $('sceneSvg').querySelectorAll('.pin').forEach(p => { const go = () => fly(p.dataset.city); p.addEventListener('click', go); p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); });
  setTask('Choose a flight: click a city on the map or a button. Check your clues in the <b>Conversación</b> first!');
  setActions([...opts.map(id => ({ cls: 'flight', html: `${flagHTML(CITIES[id].flag)}<span><b>${esc(cityName(id))}</b><small>${esc(CITIES[id].country)}</small></span><span class="hrs">${flightHrs(from, id)} h</span>`, on: () => fly(id) })),
    { ic: '↩️', label: 'Volver', sub: 'Back to the city', on: () => backFromMap() }]);
  renderRoute();
}
function backFromMap() {
  S.phase = S.prevPhase || 'city';
  if (S.phase === 'prologue') { $('placeName').textContent = 'El desván · Lethbridge, Alberta'; drawCity('lethbridge'); setActions([{ ic: '✈️', label: 'Ir al aeropuerto', sub: 'Choose the next city', on: () => showFlights() }]); return; }
  if (S.phase === 'wrongcity') { drawWrong(); return; }
  drawCity(curId()); cityActions();
}
async function fly(id) {
  if (S.busy) return;
  S.busy = true;
  const from = S.mapFrom, h = flightHrs(from, id);
  SFX.play('whoosh', { force: true });
  setActions([]); setTask(`Flying to ${esc(cityName(id))}… (${h} h)`);
  await flyAnim(from, id);
  S.busy = false;
  if (advance(h, `Vuelo a ${cityName(id)}`)) return;
  S.flightOpts = null;
  if (id === S.G.legs[S.leg].id) {
    if (S.leg > 0) finishStop();
    S.i = S.leg;
    S.i === 7 ? arriveGranada() : arrive();
  } else {
    S.wrong++; S.legWrong++;
    S.triedLeg.push(id);
    S.at = id;
    wrongCity(id);
  }
}

/* ---------- a wrong city ---------- */
async function wrongCity(id) {
  S.phase = 'wrongcity';
  feed.reset();
  drawWrong();
  SFX.play('wrong');
  const w = CITIES[id].wit ? CITIES[id].wit[0] : { name: 'Un guardia', look: { skin: '#C48A66', hairC: '#1E1620', style: 'short', shirtC: '#2B2D42', age: 40 } };
  addPerson('w-' + id, w);
  await feed.say('w-' + id, `${CITIES[id].hola || '¡Hola!'} ¿Una persona con una página vieja? No, aquí no vi a nadie así. Lo siento.`);
  await luciaSay('¡Uy! El ladrón no vino aquí. Lee las pistas otra vez y vuelve al aeropuerto.');
}
function drawWrong() {
  const id = S.at;
  $('placeName').textContent = `${cityName(id)} · ${CITIES[id].country}`;
  startArt();
  const w = CITIES[id].wit ? CITIES[id].wit[0] : null;
  const sc = SCENES[id] ? SCENES[id]() : SCENES.granada();
  $('sceneSvg').innerHTML = defsOut() + sc.back + (w ? personFig(w.look, 380, FEET, 1.7) + nameTag(380, FEET + 22, w.name) : '');
  setTask(`The thief didn’t come to ${esc(cityName(id))}. Read the clues again and choose another flight.`);
  setActions([{ ic: '✈️', label: 'Volver al aeropuerto', sub: 'Choose again', on: () => showFlights() }]);
  renderRoute();
}

/* ---------- arriving in a city ---------- */
async function arrive() {
  const id = curId(), C = CITIES[id];
  Object.assign(S, { phase: 'city', leg: S.i + 1, arrived: true, witDone: [], sealDone: false, legWrong: 0, legHints: 0, legMiss: 0, legShown: false, remDone: !C.remember, triedLeg: [], heard: [] });
  C.wit.forEach((w, k) => addPerson(`${id}-${k}`, w));
  feed.reset();
  drawCity(id);
  renderRoute(); renderDossier();
  showCode();
  SFX.play('bell');
  const n = S.i + 1;
  await luciaSay(`¡Llegaste a ${C.name}! Es la ciudad número ${numWord(n)}. Habla con la gente, busca el sello de Elena y descubre adónde fue el ladrón.`);
  if (C.remember) await askRemember(C);
  cityActions();
}
function showCode() {
  $('codeBox').hidden = false;
  $('codeBox').innerHTML = `Código para continuar otro día (from ${esc(cityName(curId()))}):<b>${currentCode()}</b>`;
}
function drawCity(id) {
  const wits = id === 'lethbridge' || id === 'granada' ? [] : CITIES[id].wit;
  $('sceneSvg').innerHTML = citySVG(id, { wits, done: S.witDone || [], sealDone: id === 'lethbridge' ? !!S.trunkOpen : S.sealDone, gemsFound: S.gems, showSeal: id !== 'granada' });
  if (id !== 'lethbridge' && id !== 'granada') $('placeName').textContent = `${CITIES[id].name} · ${CITIES[id].country}`;
  const svg = $('sceneSvg');
  const bind = (sel, fn) => svg.querySelectorAll(sel).forEach(g => { g.addEventListener('click', () => fn(g)); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(g); } }); });
  bind('.wit', g => askWitness(+g.dataset.wit));
  bind('.hot.seal', () => id === 'lethbridge' ? openTrunk() : openSeal());
  bind('.gem', g => showGem(g.dataset.gem));
}
function cityActions() {
  if (S.phase !== 'city') return;
  const C = CITIES[curId()];
  const left = [0, 1, 2].filter(k => !S.witDone.includes(k));
  setTask(`${left.length ? `Click a witness to ask a question (<b>−1 h each</b>). ` : ''}${S.sealDone ? '' : 'Find <b>Elena’s seal</b> (it glows). '}${S.sealDone ? 'When you know where the thief went, <b>go to the airport</b>.' : ''}`);
  const acts = C.wit.map((w, k) => ({ ic: S.witDone.includes(k) ? '✔️' : '💬', label: `Hablar con ${w.name}`, sub: w.role, disabled: S.witDone.includes(k), on: () => askWitness(k) }));
  acts.push({ ic: S.sealDone ? '✔️' : '🔏', label: 'El sello de Elena', sub: S.sealDone ? 'You have this seal' : 'Solve the code', disabled: S.sealDone, on: () => openSeal() });
  acts.push({ ic: '✈️', label: 'Ir al aeropuerto', sub: S.sealDone ? 'Choose the next city' : 'Get the seal first', disabled: !S.sealDone, on: () => showFlights() });
  setActions(acts);
}
async function askRemember(C) {
  const R = C.remember, order = shuffle([0, 1, 2]);
  setTask(`<b>¿Te acuerdas?</b> A question about a Dato from <i>${esc(R.ref)}</i>. Right answer: <b>+${BONUS} h</b>. Wrong answer: no penalty.`);
  await luciaSay(R.q);
  return new Promise(res => {
    setActions([...order.map(k => ({ ic: '❔', label: esc(R.opts[k]), on: () => {
      S.remDone = true;
      if (k === 0) { S.rem++; gain(BONUS); fb('ok', '¡Te acuerdas! +2 h', 'Bonus time for remembering the Dato.'); SFX.play('star'); }
      else fb('warn', `No: ${R.opts[0]}.`, `Now you know for next time.`);
      res();
    } })), { ic: '⏭️', label: 'Saltar', sub: 'Skip the question', on: () => { S.remDone = true; res(); } }]);
  });
}

/* ---------- witnesses ---------- */
async function askWitness(k) {
  if (S.phase !== 'city' || S.witDone.includes(k) || S.busy) return;
  S.busy = true;
  const id = curId(), C = CITIES[id], w = C.wit[k], L = S.G.legs[S.i + 1];
  S.witDone.push(k);
  drawCity(id); setActions([]);
  if (advance(COST.ask, `Pregunta a ${w.name}`)) { S.busy = false; return; }
  const key = `${id}-${k}`;
  await feed.say(key, `${C.hola} Soy ${w.name}; ${w.role}.`, { fast: true });
  if (k < 2) {
    const clue = k === 0 ? L.clueA : L.clueB;
    await sleep(200);
    await clueMsg(key, { ...clue, es: `Vi a una persona con una página vieja. ${clue.es}` });
  } else {
    revealTrait(S.i);
    const t = S.traits[S.traits.length - 1], hrs = 4 + rand(8);
    await sleep(200);
    await clueMsg(key, { es: `${FEATS[t.k].vals[t.v].line} Salió de aquí hace unas ${numWord(hrs)} horas.`, ic: FEATS[t.k].vals[t.v].ic + '🕵️' });
    fb('info', `Nueva pista sobre el ladrón: ${FEATS[t.k].vals[t.v].es}`, 'Check the Sospechosos tab to rule people out.');
  }
  S.busy = false;
  cityActions();
}
function revealTrait(stop, silent) {
  const k = S.G.order[stop], v = S.G.suspects[S.G.culprit].f[k], id = S.G.route[stop];
  if (!S.traits.some(t => t.stop === stop)) S.traits.push({ k, v, stop });
  const w = CITIES[id].wit[2];
  const card = { id: 'w' + stop, ic: FEATS[k].vals[v].ic, kind: `${CITIES[id].name} · ${w.name}`, text: `«${FEATS[k].vals[v].line}»`, stop, feat: k };
  if (silent) S.cards.push(card); else { addCard(card); renderSuspects(); ping('sospechosos'); }
}
function addLetterCard(stop, silent) {
  const id = S.G.route[stop];
  const card = { id: 'l-' + id, ic: '✉️', kind: `${CITIES[id].name} · carta de Elena`, text: CITIES[id].letter, city: id };
  if (silent) S.cards.push(card); else addCard(card);
}

/* ---------- the seal ---------- */
async function openSeal() {
  if (S.phase !== 'city' || S.sealDone || S.busy) return;
  const id = curId(), C = CITIES[id];
  setTask('Solve Elena’s code. Each mistake costs an hour.');
  setActions([{ ic: '↩️', label: 'Volver a la escena', on: () => { closePuzzle(); cityActions(); } }]);
  const r = await runPuzzle(id);
  if (S.phase !== 'city') return;
  S.legMiss = r.miss; S.legShown = r.shown;
  S.sealDone = true;
  S.seals.push(C.sym);
  SFX.mission(r.miss ? 1 : 3);
  drawCity(id); renderRoute();
  const k = S.i, fam = S.G.fam[k], stay = S.G.stayed[k];
  await popup('letter', `<div style="display:flex;gap:12px;align-items:center">${sealSVG(C.sym, true, 64)}<p class="gtitle" style="margin:0">${esc(capFirst(C.symName))}</p></div>` + letterHTML('', ['Querida familia:', C.letter, `${capFirst(fam.who)} ${stay}`], `Elena`, `A seal for the medallion, and another letter from Elena. The Archivo for ${C.name} is open in your Expediente.`).replace('<p class="gtitle"></p>', ''), [{ label: 'Guardar el sello' }]);
  addLetterCard(k);
  renderArchive(); ping('archivo');
  cityActions();
}

/* ---------- a finished stop ---------- */
function stopStarsNow() {
  let s = 3;
  if (S.legWrong) s--;
  if (S.legMiss >= 2 || S.legShown) s--;
  if (S.legHints >= 2) s--;
  return Math.max(1, s);
}
function finishStop() {
  const k = S.i;
  S.stopStars[k] = stopStarsNow();
  S.log.push({ id: S.G.route[k], stars: S.stopStars[k] });
}

/* ---------- hints ---------- */
$('hintBtn').addEventListener('click', () => {
  if (!S.started || S.busy || S.phase === 'end') return;
  if (S.phase === 'prologue' && !S.trunkOpen) { fb('info', 'Haz clic en el baúl.', 'Click the trunk in the middle of the attic (free).'); return; }
  if (S.phase === 'warrant' || S.phase === 'duel' || S.phase === 'lock') return finaleHint();
  if (S.puzzleOpen) { fb('info', 'Lee el texto con calma. Usa el Glosario para las palabras nuevas.', 'Puzzles give you three tries; after that, Elena’s notes show the answer.'); return; }
  const L = S.G.legs[S.leg];
  if (!L) return;
  S.hints++; S.legHints++;
  if (advance(COST.hint, 'Pista')) return;
  const dato = (S.heard || []).find(c => c.ref && !c.hinted);
  if (dato) { dato.hinted = true; fb('info', `Dato: ${dato.es}`, dato.en); return; }
  if (!(S.heard || []).length) { fb('info', 'Primero habla con los testigos.', 'Talk to the first two witnesses: they describe where the thief went.'); return; }
  fb('info', `El ladrón fue a ${CITIES[L.id].country}.`, `The thief went to a city in ${CITIES[L.id].country}.`);
});

/* ---------- time runs out ---------- */
function timeUp() {
  if (S.phase === 'end') return;
  S.phase = 'end'; S.busy = false; S.won = false;
  closePuzzle(); document.querySelector('.gemcard')?.remove();
  setActions([]); setTask('Time is up.');
  luciaSay('¡Oh, no! Es domingo a las ocho de la mañana. El ladrón llegó a Granada antes que tú… y desapareció.');
  setTimeout(() => endGame(false), 1800 * SPEED);
}

/* initial screen */
renderClock(); renderRoute(); renderDossier();
$('sceneSvg').innerHTML = mapSVG({ pins: [], at: 'lethbridge' });
