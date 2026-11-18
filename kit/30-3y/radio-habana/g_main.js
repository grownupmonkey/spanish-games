/* ============ 3 · TEXT ANALYSIS: present perfect and direct object pronouns ============ */
const AUX = { he: 'yo', has: 'tu', ha: '3s', hemos: 'nos', habeis: 'vos', han: '3p' };
const AUX_SLIP = { a: 'ha', e: 'he', an: 'han', emos: 'hemos', as: 'has' };
const IRR_PART = { hecho: 'hacer', escrito: 'escribir', visto: 'ver', puesto: 'poner', vuelto: 'volver', dicho: 'decir', roto: 'romper', abierto: 'abrir', muerto: 'morir', cubierto: 'cubrir', descubierto: 'descubrir', compuesto: 'componer', devuelto: 'devolver', resuelto: 'resolver', impuesto: 'imponer' };
const PART_SLIP = { hacido: 'hecho', escribido: 'escrito', vido: 'visto', veido: 'visto', ponido: 'puesto', volvido: 'vuelto', decido: 'dicho', rompido: 'roto', abrido: 'abierto', morido: 'muerto', componido: 'compuesto', devolvido: 'devuelto', descubrido: 'descubierto', resolvido: 'resuelto', cubrido: 'cubierto' };
const ACC_PART = { leido: 'leído', oido: 'oído', traido: 'traído', caido: 'caído', creido: 'creído', reido: 'reído' };
const isPart = k => IRR_PART[k] || PART_SLIP[k] || /^[a-z]+(ado|ido|ada|ida|ados|idos|adas|idas)$/.test(k);
function analyzePerfect(raw) {
  const toks = words(raw), keys = toks.map(keyOf), r = { forms: [], slips: [], person: [], parts: new Set() };
  keys.forEach((k, i) => {
    const nx = keys[i + 1]; if (!nx) return;
    const auxP = AUX[k], auxSlip = AUX_SLIP[k];
    if (!auxP && !auxSlip) return;
    if (!isPart(nx)) return;
    if (auxSlip) { if (k === 'a' && !/(ado|ido|cho|to|sto)$/.test(nx)) return; r.slips.push({ wrote: `${toks[i]} ${toks[i + 1]}`, fix: `${auxSlip} ${toks[i + 1]}`, note: 'The helper verb haber has an h: he, has, ha, hemos, han.' }); }
    let part = nx;
    if (PART_SLIP[nx]) { r.slips.push({ wrote: toks[i + 1], fix: PART_SLIP[nx], note: 'Irregular participle' }); part = PART_SLIP[nx]; }
    else if (/(ada|idos|idas|adas|ados)$/.test(nx) && !/^(nada|todos?)$/.test(nx)) { const fix = nx.replace(/(a|os|as)$/, 'o').replace(/ado$|ido$/, m => m); r.slips.push({ wrote: toks[i + 1], fix: nx.replace(/(ada|adas|ados)$/, 'ado').replace(/(ida|idas|idos)$/, 'ido'), note: 'In the perfect, the participle doesn’t change: ha grabado, han tocado.' }); }
    else if (ACC_PART[nx] && toks[i + 1] === nx) r.slips.push({ wrote: toks[i + 1], fix: ACC_PART[nx], note: 'Accent' });
    const p = auxP || AUX[keyOf(auxSlip)];
    r.forms.push({ aux: toks[i], part, p, text: `${toks[i]} ${toks[i + 1]}` }); r.parts.add(part.replace(/(a|os|as)$/, 'o'));
  });
  r.count = r.forms.length; r.distinct = r.parts.size;
  return r;
}
/* object pronouns: lo / la / los / las before a conjugated verb, or attached to an infinitive or gerund */
const CONJ = new Set('pongo pones pone ponemos ponen pondre pondremos pondra pongamos ponga toco tocamos tocare tocaremos escucho escuchamos escuchas escucha dedico dedicamos busco buscamos encuentro encontramos tengo tenemos quiero queremos puedo podemos voy vamos he has ha hemos han habia pusimos puse pusieron sono toque tocamos escuche dejo dejamos paso pasamos recomiendo recomendamos recomiendas recomendaria adoro adoramos conozco conocemos vi vimos oi oimos encanta encantan pongo programo programamos'.split(' '));
const NOUN_AFTER_ART = /^(cancion|canciones|disco|discos|bolero|boleros|son|sones|musica|banda|orquesta|trompeta|noche|abuela|mama|radio|primera|ultima|misma|grabacion|letra|version|siguiente|otra|otro|que|del|de)$/;
function analyzeDOP(raw) {
  const toks = words(raw), keys = toks.map(keyOf), r = { prons: [], misplaced: [], le: [] };
  keys.forEach((k, i) => {
    const nx = keys[i + 1] || '', pv = keys[i - 1] || '';
    if (/^(lo|la|los|las)$/.test(k)) {
      if (CONJ.has(nx) || (nx === 'ya' && CONJ.has(keys[i + 2] || '')) || (nx === 'he' || nx === 'hemos' || nx === 'ha' || nx === 'han')) r.prons.push({ p: k, how: 'before', at: i });
      else if (CONJ.has(pv) && !NOUN_AFTER_ART.test(nx) && !/^(mejor|primero)$/.test(nx)) r.misplaced.push({ p: k, verb: toks[i - 1], fix: `${k} ${toks[i - 1].toLowerCase()}` });
    }
    const m = k.match(/^([a-z]+(?:ar|er|ir|ando|iendo))(lo|la|los|las)$/);
    if (m && !/^(bola|hola|sola|cola|escuela|abuela|perla|isla|mesa|sala|ola|vela|tela|lola|bella|ella|aquella|calle|carla|marla|darla|habana|cubana|semana|mananas?|ventana|hermana|charla|parla)$/.test(k)) r.prons.push({ p: m[2], how: 'attached', at: i });
    if (k === 'le' && (CONJ.has(nx) || /^(pongo|ponemos|tocamos)$/.test(nx))) r.le.push(toks[i]);
  });
  return r;
}
const NUMW = { dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20, veinticinco: 25, treinta: 30 };
function numsIn(n) { const out = []; n.split(' ').forEach(w => { if (/^\d+$/.test(w)) out.push(+w); else if (NUMW[w]) out.push(NUMW[w]); }); return out; }

/* ============ DATA: guests, records, callers, bands ============ */
const GUESTS = [
  { name: 'Ernesto Valdés', fem: false, genre: 'son', inst: 'trompeta', spec: { propR: 'trumpet', pose: 'hold', hat: 'panama', moustache: true, topC: '#F2F2F2' } },
  { name: 'Mayra Hernández', fem: true, genre: 'bolero', inst: 'voz', spec: { skirt: true, propR: 'mic', pose: 'offer', hair: 'bun', topC: '#D8323C', lashes: true } },
  { name: 'Yoandri Pérez', fem: false, genre: 'timba', inst: 'conga', spec: { propBody: 'conga', pose: 'hold', hat: 'cap', hatC: 0x2A6FDB, topC: '#FFD25A' } },
  { name: 'Dayana Castillo', fem: true, genre: 'trova', inst: 'guitarra', spec: { skirt: true, propBody: 'guitar', armL: [.35, .9, 1.5], armR: [.25, .6, 1.7], hair: 'long', topC: '#7A4FD6', lashes: true } },
  { name: 'Lázaro Fuentes', fem: false, genre: 'son', inst: 'tres', spec: { propBody: 'guitar', armL: [.35, .9, 1.5], armR: [.25, .6, 1.7], hat: 'beret', hatC: 0x2E2A45, topC: '#3E8E5E' } },
];
const COUNTRIES = ['México', 'España', 'Japón', 'Francia', 'Colombia', 'Canadá', 'Venezuela', 'Italia'];
const COLLABS = ['la gran sonera Caridad Fuentes', 'el pianista Ramón Ortega', 'la orquesta Charanga del Cerro', 'el trovador Silvio Montes'];
const SONGS_OWN = ['Luna del Malecón', 'Noches de Regla', 'Café con son', 'La guagua de las seis', 'Mi barrio en clave'];
const TOPICS = {
  paises: { en: 'Countries where they’ve played', rx: /\bpais|paises|extranjero|fuera de cuba|viaj|en que ciudades|otros lugares del mundo|donde ha (tocado|cantado|actuado)/ },
  discos: { en: 'Albums recorded', rx: /\bdiscos?\b|\balbum|grabad/ },
  canciones: { en: 'Songs written', rx: /\bcancion|canciones|escrit|compuest|\btemas?\b/ },
  famosos: { en: 'Famous musicians they’ve played with', rx: /famos|con quien|artistas?|musicos|conocid|trabajad|colabor/ },
  premio: { en: 'Prizes won', rx: /premio|ganad/ },
  habana: { en: 'Where they’ve played in Havana', rx: /en (que|cuales) (lugares|sitios|salas|clubs?)|casa de la musica|(tocado|cantado|actuado) en la habana|lugares de la habana|donde (ha )?(tocado|cantado|actuado) en|donde toca en la habana/ },
};
const RECORDS = [
  { title: 'Chan Chan', artist: 'Compay Segundo', ref: 'la canción «Chan Chan»', pr: 'la', bg: '#D8323C', fg: '#FFF4D6' },
  { title: 'Lágrimas negras', artist: 'Trío Matamoros', ref: 'la canción «Lágrimas negras»', pr: 'la', bg: '#17122E', fg: '#FFC27A' },
  { title: 'Dos gardenias', artist: 'Isolina Carrillo', ref: 'la canción «Dos gardenias»', pr: 'la', bg: '#F2E6C9', fg: '#7A3E1E' },
  { title: 'Guantanamera', artist: 'Joseíto Fernández', ref: 'la canción «Guantanamera»', pr: 'la', bg: '#2A6FDB', fg: '#FFFFFF' },
  { title: 'El manisero', artist: 'Moisés Simons', ref: 'el son «El manisero»', pr: 'lo', bg: '#FFD25A', fg: '#17122E' },
  { title: 'Son de la loma', artist: 'Trío Matamoros', ref: 'el son «Son de la loma»', pr: 'lo', bg: '#3E8E5E', fg: '#FFF4D6' },
  { title: 'Veinte años', artist: 'María Teresa Vera', ref: 'el bolero «Veinte años»', pr: 'lo', bg: '#FF7AA8', fg: '#17122E' },
  { title: 'Quizás, quizás, quizás', artist: 'Osvaldo Farrés', ref: 'el bolero «Quizás, quizás, quizás»', pr: 'lo', bg: '#7A4FD6', fg: '#FFE7A8' },
  { title: 'Boleros de siempre', artist: 'Benny Moré', ref: 'los boleros de Benny Moré', pr: 'los', bg: '#2E2A45', fg: '#FFD25A' },
  { title: 'Chachachás', artist: 'Orquesta Aragón', ref: 'los chachachás de la Orquesta Aragón', pr: 'los', bg: '#5FE0C8', fg: '#17122E' },
  { title: 'Canciones de Celia', artist: 'Celia Cruz', ref: 'las canciones de Celia Cruz', pr: 'las', bg: '#FF8A1E', fg: '#17122E' },
  { title: 'Canciones de Omara', artist: 'Omara Portuondo', ref: 'las canciones de Omara Portuondo', pr: 'las', bg: '#BFD8F2', fg: '#17122E' },
];
const CALLERS = [
  { name: 'Juana', from: 'Centro Habana', pitch: .95, rate: .88, ded: 'para mi nieto Alejandro, que cumple quince años', who: /nieto|alejandro/ },
  { name: 'Osmany', from: 'Regla', pitch: .85, ded: 'para mi novia Yaimara, ¡la quiero mucho!', who: /novia|yaimara/ },
  { name: 'Lisandra', from: 'el Vedado', pitch: 1.15, ded: 'para mi mamá, que está en el hospital', who: /mama|madre/ },
  { name: 'Reinaldo', from: 'Habana Vieja', pitch: .8, rate: .9, ded: 'para todos los taxistas de La Habana', who: /taxista/ },
  { name: 'Yuliet', from: 'Miramar', pitch: 1.2, ded: 'para mi abuela Caridad, que baila como nadie', who: /abuela|caridad/ },
];
const BANDS = ['Los Soneros del Malecón', 'Habana Clave', 'La Charanga de Regla', 'Son de Barrio'];

/* ============ 4b · panels ============ */
const MISSIONS = [['entrevista', 'La entrevista'], ['resumen', 'El resumen para los oyentes'], ['peticiones', 'Las peticiones'], ['resena', 'La reseña del concierto']];
function renderMissions(cur) { $id('missionList').innerHTML = MISSIONS.map(([id, t]) => { const m = session.missions.find(x => x.id === id); return `<li class="${m ? 'done' : id === cur ? 'cur' : ''}"><span>${esc(t)}</span><span class="stars">${m ? starStr(m.stars) : ''}</span></li>`; }).join(''); }
function finishMission(id, stars) { stars = Math.max(1, Math.min(3, stars)); session.missions.push({ id, title: MISSIONS.find(m => m[0] === id)[1], stars }); renderMissions(); try { SFX.play('mission'); } catch (e) {} }
const GEM_LIST = [{ id: 'son', t: 'El son cubano' }, { id: 'quebola', t: '¿Qué bolá?' }, { id: 'almendrones', t: 'Los almendrones' }, { id: 'malecon', t: 'El Malecón' }, { id: 'morro', t: 'El Morro' }, { id: 'canonazo', t: 'El cañonazo de las nueve' }];
function renderGems() { $id('gemCount').textContent = `${found.size}/6`; $id('gemList').innerHTML = GEM_LIST.map(g => `<li class="${found.has(g.id) ? 'on' : ''}">${found.has(g.id) ? '✦' : '·'} ${found.has(g.id) ? esc(g.t) : '???'}</li>`).join(''); }
window.onGem = gem => { renderGems(); talk([gem.es], CAST.yanelis); try { SFX.play('star'); } catch (e) {} };
function renderGuion(asked = {}) {
  const el = $id('guion'); if (!SHOW) { el.innerHTML = '<p class="keyhelp">The run sheet for tonight’s show will appear here.</p>'; return; }
  el.innerHTML = `<p class="gtitle">🎙️ <b>${esc(SHOW.guest.name)}</b> · ${esc(SHOW.guest.genre)} · ${esc(SHOW.guest.inst)}</p><ul class="glist">${Object.entries(TOPICS).map(([k, t]) => `<li class="${asked[k] ? (asked[k] === 'ok' ? 'ok' : 'half') : ''}">${asked[k] === 'ok' ? '✓' : asked[k] ? '~' : '○'} ${esc(t.en)}</li>`).join('')}</ul>`;
}
function renderCalls() {
  const ul = $id('callList'); if (!SHOW || !SHOW.log.length) { ul.innerHTML = '<li class="empty">Calls and songs played tonight will appear here.</li>'; return; }
  ul.innerHTML = SHOW.log.map(l => `<li><span>${l.icon}</span><div><b>${esc(l.t)}</b><span>${esc(l.s)}</span></div></li>`).join('');
}

/* ============ 6 · THE SHOW ============ */
let SHOW = null;
const who = (name, pitch = 1, rate = 1) => ({ name, pitch, rate });
async function startGame() {
  session = newSession(); found.clear(); clearFb(); ia(''); hideGo();
  $id('summary').hidden = true; $id('summary').innerHTML = '';
  rebuild(Object.keys(BUILT));
  const g = pick(GUESTS), cs = shuffle(COUNTRIES).slice(0, 2);
  SHOW = {
    guest: Object.assign({}, g, { countries: cs, discos: 2 + Math.floor(Math.random() * 4), canciones: pick([12, 15, 20, 25, 30]), fav: pick(SONGS_OWN), collab: pick(COLLABS), premio: Math.random() < .6 }),
    records: shuffle(RECORDS), log: [], band: pick(BANDS),
  };
  SHOW.guest.voice = who(g.name, g.fem ? 1.12 : .86, .95);
  renderMissions('entrevista'); renderGems(); renderGuion(); renderCalls();
  const api = enterScene('estudio', { place: '<b>Radio Malecón 99.5 FM</b> · Centro Habana · 19:55' });
  SHOW.covers = api.setRecords(SHOW.records); api.setGuest(g.spec);
  await talk(['¡Hola! Soy Lucía. ¡Bienvenidos a La Habana!', 'Esta semana trabajas en una radio comunitaria: Radio Malecón. ¡Desde aquí se ve el mar!', 'Esta noche harás una entrevista, contestarás las llamadas de los oyentes y, después, irás a un concierto en el Malecón.', '¡Escucha bien y disfruta de la música cubana!'], CAST.lucia);
  await missionInterview(api);
  await missionSummary(api);
  await missionRequests(api);
  await missionReview();
  enterScene('malecon', { place: '<b>El Malecón</b> · 23:30' });
  await talk(['¡Qué noche tan bonita! Ya conoces La Habana y su música.', 'Mi próximo destino: Medellín, en Colombia. ¡Nos vemos allí!'], CAST.lucia);
  endSession();
}

/* ---- Mission 1: the live interview (perfect tense, usted) ---- */
function guestAnswer(topic) {
  const G = SHOW.guest;
  return {
    paises: [`Sí, he tocado en muchos países. Los últimos años he viajado a ${G.countries[0]} y a ${G.countries[1]}.`],
    discos: [`He grabado ${NUM_ES_P[G.discos]} discos. El último lo he grabado aquí en La Habana.`],
    canciones: [`He escrito unas ${NUM_ES_P[G.canciones]} canciones. Mi favorita es «${G.fav}».`],
    famosos: [`He tocado con muchos artistas, pero el más especial ha sido ${G.collab}.`],
    premio: G.premio ? ['Sí, he ganado el premio Cubadisco. ¡Ha sido el mejor día de mi vida!'] : ['No, nunca he ganado un premio… ¡pero ya llegará!'],
    habana: ['He tocado en la Casa de la Música, en el Malecón y en muchos patios de Centro Habana.'],
  }[topic];
}
const NUM_ES_P = { 2: 'dos', 3: 'tres', 4: 'cuatro', 5: 'cinco', 12: 'doce', 15: 'quince', 20: 'veinte', 25: 'veinticinco', 30: 'treinta' };
async function missionInterview(api) {
  renderMissions('entrevista');
  const G = SHOW.guest;
  setTask(`You’re on air! Interview <b>${esc(G.name)}</b>. Ask about <b>four</b> of the topics on the run sheet (<b>El guion</b>, right), using the <b>present perfect</b> and <b>usted</b>: <i>¿Ha tocado en otros países? ¿Cuántos discos ha grabado? ¿Ha ganado algún premio?</i>`, 'Misión 1 · La entrevista');
  await talk(['¡Bienvenido a la radio! Yo soy Yanelis. Esta noche me ayudas con el programa.', `${G.fem ? 'Nuestra invitada' : 'Nuestro invitado'} de hoy es ${G.fem ? 'la artista' : 'el músico'} ${G.name}.`], CAST.yanelis);
  await talk(['Treinta segundos para salir al aire… ¡Tres, dos, uno!'], CAST.raul);
  api.setAir(true);
  await talk([`¡Buenas noches, Habana! Esto es Radio Malecón. Hoy está con nosotros ${G.name}. ¡Pregúntale tú!`], CAST.yanelis);
  await talk([`¡Buenas noches! ¡Qué bolá, Habana! Encantad${G.fem ? 'a' : 'o'} de estar aquí.`], G.voice);
  renderGuion({});
  setHelp(lvl => ['Use usted with the guest: ha + participle. “¿Ha tocado en otros países?”', 'Participles: tocado, grabado, ganado, viajado, conocido; irregular: escrito, hecho, visto, puesto.', 'Examples: “¿Cuántos discos ha grabado?” “¿Cuántas canciones ha escrito?” “¿Con qué artistas famosos ha tocado?”'][Math.min(lvl, 2)]);
  composer({ placeholder: '¿Ha tocado usted en otros países?' });
  const asked = {}; let perfectQs = 0, tuSlips = 0, slips = 0, tries = 0;
  await waitSubmit(async raw => {
    youSaid(raw); session.stats.messages++; logLine('Tú', raw); tries++;
    const n = norm(raw);
    if (looksEnglish(n)) { fb('warn', 'En español, por favor', 'Ask in Spanish.'); return false; }
    const topic = Object.keys(TOPICS).find(k => TOPICS[k].rx.test(n));
    const p = analyzePerfect(raw);
    p.slips.slice(0, 2).forEach(s => { slips++; fb('err', `<span class="fix"><s>${esc(s.wrote)}</s> → ${esc(s.fix)}</span>`, s.note); });
    const tu = /(?:^| )(has|tienes|puedes|eres|tu|te|tus|vas)(?= |$)/.test(n) && !/\bha\b/.test(n);
    if (tu) { tuSlips++; fb('warn', 'Usted', 'On air, use usted with the guest: ¿Ha…?, not ¿Has…?'); }
    accentTips(raw);
    if (!topic) { await talk([pick(['¿Perdón? No he entendido la pregunta.', 'Mmm… ¿me lo puede repetir de otra manera?'])], G.voice); fb('info', '', 'Ask about one of the topics on the run sheet.'); return false; }
    if (asked[topic] === 'ok') { await talk(['¡Eso ya me lo ha preguntado! Pregúnteme otra cosa.'], G.voice); return false; }
    const perfect = p.count > 0;
    if (perfect) { perfectQs++; fb('ok', p.forms[0].text, TOPICS[topic].en); } else fb('warn', TOPICS[topic].en, 'Good question! Next time ask it with the perfect: ¿Ha + participle…?');
    asked[topic] = perfect ? 'ok' : 'half'; renderGuion(asked);
    SHOW.log.push({ icon: '🎙️', t: TOPICS[topic].en, s: raw }); renderCalls();
    await talk(guestAnswer(topic), G.voice);
    const done = Object.keys(asked).length;
    if (done >= 4) return raw;
    return false;
  });
  ia('');
  await talk([`¡Muchas gracias, ${G.name}! Ahora, un poco de música.`], CAST.yanelis);
  api.spin(true, 0xFFD25A); await sleep(3500); api.spin(false);
  session.details.interview = { perfectQs, tuSlips, slips };
  finishMission('entrevista', perfectQs >= 4 && !tuSlips && !slips ? 3 : perfectQs >= 2 ? 2 : 1);
}

/* ---- Mission 2: tell the listeners what the guest has done (3rd person perfect) ---- */
function summaryFacts(raw) {
  const G = SHOW.guest, n = norm(raw), nums = numsIn(n), out = { ok: [], wrong: [] };
  if (/discos?|album/.test(n)) { if (nums.includes(G.discos)) out.ok.push('discos'); else if (nums.length) out.wrong.push(`Discos: ${NUM_ES_P[G.discos]}`); }
  if (/cancion|canciones|escrit/.test(n)) { if (nums.includes(G.canciones) || norm(G.fav).split(' ').every(w => n.includes(w))) out.ok.push('canciones'); else if (nums.length) out.wrong.push(`Canciones: ${NUM_ES_P[G.canciones]}`); }
  const cn = G.countries.filter(c => n.includes(norm(c))); if (cn.length) out.ok.push('paises');
  const badC = COUNTRIES.filter(c => !G.countries.includes(c) && n.includes(norm(c))); if (badC.length) out.wrong.push(`Países: ${G.countries.join(' y ')}`);
  if (/premio/.test(n)) { const neg = /\bno\b|nunca/.test(n); if (neg !== G.premio) out.ok.push('premio'); else out.wrong.push(G.premio ? 'Ha ganado el premio Cubadisco.' : 'No ha ganado ningún premio.'); }
  const collabKey = norm(G.collab).split(' ').slice(-2).join(' '); if (n.includes(collabKey)) out.ok.push('famosos');
  if (/casa de la musica/.test(n)) out.ok.push('habana');
  return out;
}
async function missionSummary(api) {
  renderMissions('resumen'); clearFb();
  const G = SHOW.guest, el = G.fem ? 'ella' : 'él';
  setTask(`New listeners have just tuned in. Tell them in <b>three or more sentences</b> what ${esc(G.name)} has done, in the <b>present perfect</b> (<i>${G.fem ? 'Ella' : 'Él'} ha grabado…, ha tocado en…, ha escrito…</i>). Use what you heard in the interview.`, 'Misión 2 · El resumen');
  await talk(['¡Bienvenidos a los oyentes que acaban de conectarse!', `Cuéntales tú: ¿qué ha hecho ${G.name}?`], CAST.yanelis);
  setHelp(lvl => [`Third person: ha + participle. “${G.name} ha grabado… y ha tocado en…”`, 'Use the numbers and places you heard: discos, canciones, países, premio.'][Math.min(lvl, 1)]);
  composer({ multiline: true, rows: 4, placeholder: `${G.name} ha grabado…` });
  let tries = 0;
  await waitSubmit(async raw => {
    youSaid(raw); session.stats.messages++; logLine('Tú', raw); tries++;
    if (looksEnglish(norm(raw))) { fb('warn', 'En español, por favor', ''); return false; }
    const p = analyzePerfect(raw), f = summaryFacts(raw);
    p.slips.slice(0, 3).forEach(s => fb('err', `<span class="fix"><s>${esc(s.wrote)}</s> → ${esc(s.fix)}</span>`, s.note));
    const wrongPerson = p.forms.filter(x => x.p === 'yo' || x.p === 'tu');
    if (wrongPerson.length) fb('warn', wrongPerson[0].text, `You’re talking about ${G.name}: use ha (third person), not he/has.`);
    f.wrong.slice(0, 2).forEach(w => fb('err', '¿Seguro?', w));
    accentTips(raw);
    const third = p.forms.filter(x => x.p === '3s' || x.p === '3p').length, okFacts = new Set(f.ok).size;
    fb(third >= 3 ? 'ok' : 'warn', `Pretérito perfecto: ${third}`, third >= 3 ? 'ha + participle ✓' : 'Use three or more: ha grabado, ha tocado, ha escrito…');
    fb(okFacts >= 3 ? 'ok' : 'warn', `Datos: ${okFacts}`, okFacts >= 3 ? 'Accurate facts from the interview.' : 'Include at least three facts from the interview (albums, songs, countries, prize…).');
    const met = third >= 3 && okFacts >= 3 && !f.wrong.length;
    if (met || tries >= 3) {
      session.writing.push({ scene: 'Resumen para los oyentes', text: raw });
      finishMission('resumen', met ? (p.slips.length ? 2 : 3) : 1); ia('');
      await talk(met ? [`¡Perfecto! Así es. ${G.name} es ${G.fem ? 'una artista' : 'un artista'} increíble.`] : ['Bueno… ¡casi! Gracias, compañero.'], CAST.yanelis);
      return raw;
    }
    await talk([f.wrong.length ? '¡Uy! Creo que eso no es exactamente lo que ha dicho.' : '¿Y qué más ha hecho? Cuéntales más.'], CAST.yanelis);
    return false;
  });
}

/* ---- Mission 3: listener requests (direct object pronouns; ya la hemos puesto) ---- */
async function missionRequests(api) {
  renderMissions('peticiones'); clearFb(); ia('');
  const recs = SHOW.records, played = [recs[0], recs.find(r => r.pr !== recs[0].pr && r !== recs[0])];
  const pool = recs.filter(r => !played.includes(r));
  // four calls: three new requests with different pronouns where possible, one already played
  const byPr = pr => pool.filter(r => r.pr === pr);
  const reqs = []; ['la', 'lo', pick(['los', 'las'])].forEach(pr => { const c = byPr(pr).find(r => !reqs.includes(r)) || pool.find(r => !reqs.includes(r)); reqs.push(c); });
  const calls = shuffle(reqs.map(r => ({ rec: r, played: false }))); calls.splice(1 + Math.floor(Math.random() * 3), 0, { rec: played[0], played: true });
  SHOW.calls = calls; const callers = shuffle(CALLERS);
  played.forEach(r => SHOW.log.push({ icon: '💿', t: r.title, s: `${r.artist} · ya sonó` })); renderCalls();
  setTask('The phones are open! For each call: <b>listen</b> to the request, <b>answer on air</b> with an object pronoun (<i>Sí, la pongo ahora · Claro, lo ponemos enseguida · Vamos a ponerlas</i>), then find the record on the shelf. Careful: Raúl will tell you what has already been played tonight.', 'Misión 3 · Las peticiones');
  await talk(['¡Abrimos los teléfonos! Llamen y pidan su canción favorita.'], CAST.yanelis);
  await talk([`Atención: esta noche ya hemos puesto ${played[0].ref} y ${played[1].ref}. ¡No los repitas!`], CAST.raul);
  setHelp(lvl => ['Match the pronoun to what they asked for: la canción → la; el bolero / el son → lo; los boleros → los; las canciones → las. It goes before the verb (la pongo) or on the end of an infinitive (ponerla).', 'If it has already been played: “Lo siento, ya la hemos puesto esta noche.”'][Math.min(lvl, 1)]);
  let misses = 0, dopErr = 0, dedications = 0;
  for (let i = 0; i < calls.length; i++) {
    const C = calls[i], R = C.rec, P = callers[i % callers.length], cv = who(`${P.name} (${P.from})`, P.pitch, P.rate || 1);
    clearFb(); ia(''); api.setRing(true); try { SFX.play('bell'); } catch (e) {}
    await sleep(900); api.setRing(false);
    await talk([`¡Radio Malecón, buenas noches! ¿Quién llama?`], CAST.yanelis);
    await talk([`¡Hola! Soy ${P.name}, de ${P.from}.`, `¿Me pones ${R.ref}? Es ${P.ded}.`], cv);
    window.__call = { pr: R.pr, played: C.played, id: i }; composer({ placeholder: C.played ? 'Lo siento, ya…' : 'Sí, claro, la pongo ahora…' });
    let replied = false;
    await waitSubmit(async raw => {
      youSaid(raw); session.stats.messages++; logLine('Tú', raw);
      const n = norm(raw), d = analyzeDOP(raw), p = analyzePerfect(raw);
      const saysPlayed = /\bya\b/.test(n) && (p.count > 0 || /sono|pusimos|puse/.test(n));
      d.le.forEach(w => { dopErr++; fb('err', `<span class="fix"><s>${esc(w)}</s> → ${R.pr}</span>`, `For a thing, use ${R.pr}, not le.`); });
      d.misplaced.forEach(m => { dopErr++; fb('err', `<span class="fix"><s>${esc(m.verb)} ${m.p}</s> → ${esc(m.fix)}</span>`, 'The pronoun goes before the conjugated verb.'); });
      const good = d.prons.filter(x => x.p === R.pr), bad = d.prons.filter(x => x.p !== R.pr);
      bad.forEach(b => { dopErr++; fb('err', `<span class="fix"><s>${b.p}</s> → ${R.pr}</span>`, `They asked for ${R.ref}: ${R.pr}.`); });
      accentTips(raw);
      if (C.played && !saysPlayed) { misses++; await talk([`¡Psst! ¡Espera! Ya ${R.pr} hemos puesto hace un rato. Díselo.`], CAST.raul); fb('warn', 'Ya sonó', 'Raúl says it has already been played tonight. Tell the caller.'); return false; }
      if (!C.played && saysPlayed) { misses++; await talk([`No, no, ${R.pr === 'la' || R.pr === 'las' ? 'esa' : 'ese'} todavía no ${R.pr} hemos puesto. ¡Ponl${R.pr.slice(1)}!`], CAST.raul); return false; }
      if (!good.length) { C.tries = (C.tries || 0) + 1; dopErr++; if (!bad.length) fb('warn', 'Pronombre', `Answer with a pronoun: ${C.played ? `ya ${R.pr} hemos puesto` : `${R.pr} pongo ahora / vamos a poner${R.pr}`}.`); if (C.tries < 2) { await talk(['¿Entonces? ¿Qué le dices?'], CAST.yanelis); return false; } }
      if (good.length) fb('ok', good[0].how === 'attached' ? `…${good[0].p}` : `${good[0].p} …`, C.played ? 'Ya + perfect + pronoun ✓' : 'Right pronoun, right place ✓');
      if (C.played && p.count && good.length) fb('ok', 'Pretérito perfecto', p.forms[0].text);
      if (P.who.test(n)) { dedications++; fb('ok', '¡Qué detalle!', 'You mentioned the dedication.'); }
      replied = true; return raw;
    });
    ia('');
    if (C.played) {
      await talk([pick(['¡Ay, me la perdí! Bueno, pon lo que quieras. ¡Gracias!', '¡Qué pena! Bueno, otra vez será. ¡Un beso!'])], cv);
      SHOW.log.push({ icon: '☎️', t: `${P.name}: ${R.title}`, s: 'ya sonó' }); renderCalls(); continue;
    }
    await talk(['¡Gracias, mi amor! ¡Un beso!'], cv);
    setTask(`Now find <b>${esc(R.title)}</b> (the one ${esc(P.name)} asked for) on the shelf and click it.`, 'Misión 3 · Las peticiones');
    api.focus('shelf'); window.__expect = recs.indexOf(R);
    while (true) {
      const id = await pick3D(SHOW.covers);
      if (id === recs.indexOf(R)) break;
      misses++; session.stats.misses++; try { SFX.play('wrong'); } catch (e) {}
      if (misses % 2 === 0) fb('info', R.title, R.artist);
      await talk([`Ese no es. Buscamos ${R.ref}.`], CAST.raul);
    }
    setPick(null); api.focus('desk');
    fb('ok', R.title, R.artist);
    await talk([`Para ${P.ded.replace(/^para /, '')}: ¡${R.title}!`], CAST.yanelis);
    api.spin(true, parseInt(R.bg.slice(1), 16)); await sleep(4000); api.spin(false);
    SHOW.log.push({ icon: '💿', t: `${R.title} · ${R.artist}`, s: `para ${P.name}` }); renderCalls();
    setTask('The phones are open! Listen to the next caller.', 'Misión 3 · Las peticiones');
  }
  api.setAir(false);
  await talk(['¡Y esto ha sido todo por hoy! Gracias por escucharnos.', 'Ahora vamos al Malecón: ¡hay un concierto y tú escribirás la reseña para la web de la radio!'], CAST.yanelis);
  session.details.requests = { misses, dopErr, dedications };
  finishMission('peticiones', misses === 0 && dopErr === 0 ? 3 : misses + dopErr <= 3 ? 2 : 1);
}

/* ---- Mission 4: the concert and the review ---- */
async function missionReview() {
  renderMissions('resena'); clearFb(); ia(''); hideGo();
  const tc = $id('titleCard'); if (tc) { $id('tcEyebrow').textContent = 'Esa noche · 20:50'; $id('tcTitle').textContent = 'Concierto en el Malecón'; $id('tcSub').textContent = SHOW.band; tc.hidden = false; tc.classList.remove('out'); await sleep(1800); tc.classList.add('out'); await sleep(450); tc.hidden = true; }
  const api = enterScene('malecon', { place: '<b>El Malecón</b> · Concierto · 20:50' });
  const covers = shuffle(SHOW.records.filter(r => r.pr === 'la' || r.pr === 'lo')).slice(0, 2), own = pick(SONGS_OWN.filter(s => s !== SHOW.guest.fav));
  const extra = pick(['solo', 'coro']);
  const BAND = [{ role: 'singer', front: true, pose: 'cheer', propR: 'mic', skirt: Math.random() < .5 }, { role: 'trumpet', pose: 'hold', propR: 'trumpet', hat: 'panama' }, { role: 'guitar', propBody: 'guitar', armL: [.35, .9, 1.5], armR: [.25, .6, 1.7] }, { role: 'conga', propBody: 'conga', pose: 'hold' }, { role: 'bass', propBody: 'bass', pose: 'hold' }];
  api.setBanner(SHOW.band); api.setBand(BAND);
  const trumpeter = pick(['Pedrito', 'Yosvany', 'Maikel', 'Adonis']);
  SHOW.concert = { band: SHOW.band, songs: [covers[0].title, own, covers[1].title], extra, trumpeter };
  setTask('You’re at the concert for the station’s website. <b>Listen and remember</b>: the name of the band, the songs they play, and what happens. You’ll write the review afterwards. Press the button when you’re ready.', 'Misión 4 · El concierto');
  setHelp('Listen for: the band’s name (Somos…), the song titles (Vamos a empezar con… / Ahora… / Para terminar…), and anything special.');
  await goButton('▶ Empieza el concierto'); hideGo();
  const singer = who('Cantante', BAND[0].skirt ? 1.15 : .9, 1);
  api.start();
  await talk([`¡Buenas noches, Habana! ¡Somos ${SHOW.band}!`, `Vamos a empezar con un clásico: «${covers[0].title}», de ${covers[0].artist}.`], singer);
  await sleep(6000);
  await talk([`¡Gracias! Ahora una canción nuestra. Se llama «${own}».`], singer);
  await sleep(5000);
  api.canon();
  await sleep(800);
  await talk(['¡Escuchen! ¡Es el cañonazo de las nueve! ¡Ya son las nueve en punto!'], singer);
  await sleep(2500);
  if (extra === 'solo') { await talk([`¡Un aplauso para nuestro trompetista, ${trumpeter}!`], singer); api.solo(true); await sleep(6000); api.solo(false); }
  else { await talk(['¡Ahora todos juntos! ¡Cántenlo conmigo, Habana!'], singer); api.coro(true); await sleep(6000); api.coro(false); }
  await talk([`Para terminar: «${covers[1].title}». ¡Gracias, Habana! ¡Los queremos!`], singer);
  await sleep(6000);
  api.stop();
  await talk(['¡Qué concierto! Ahora escribe la reseña para nuestra página web.'], CAST.yanelis);
  setTask(`Write the <b>review</b> for the station’s website:
    <ul class="checklist"><li>The band’s name and at least one song</li><li>Something special that happened</li><li>The <b>present perfect</b> three times or more: <i>he visto, han tocado, me ha gustado, nunca he escuchado…</i></li><li>An object pronoun: <i>los recomiendo, la he escuchado mil veces, hay que verlos</i></li><li>Your opinion (four sentences or more)</li></ul>`, 'Misión 4 · La reseña');
  setHelp(lvl => ['Start: “Esta noche he visto a … en el Malecón.” Then: “Han tocado «…» y …”.', 'Object pronouns: “Los recomiendo.” “La canción «…» la he escuchado muchas veces, pero nunca en vivo.” “¡Tienen que verlos!”', 'Mention a moment: the cañonazo de las nueve, the trumpet solo, the whole crowd singing.'][Math.min(lvl, 2)]);
  composer({ multiline: true, rows: 7, placeholder: 'Esta noche he visto a…' });
  let tries = 0;
  await waitSubmit(async raw => {
    youSaid(raw); session.stats.messages++; logLine('Tú', raw); tries++;
    const n = norm(raw);
    if (looksEnglish(n)) { fb('warn', 'En español, por favor', ''); return false; }
    const p = analyzePerfect(raw), d = analyzeDOP(raw), wc = words(raw).length;
    p.slips.slice(0, 3).forEach(s => fb('err', `<span class="fix"><s>${esc(s.wrote)}</s> → ${esc(s.fix)}</span>`, s.note));
    d.misplaced.forEach(m => fb('err', `<span class="fix"><s>${esc(m.verb)} ${m.p}</s> → ${esc(m.fix)}</span>`, 'The pronoun goes before the conjugated verb.'));
    accentTips(raw);
    const bandOk = norm(SHOW.band).split(' ').filter(w => w.length > 3).every(w => n.includes(w));
    const songs = SHOW.concert.songs.filter(s => norm(s).split(' ').filter(w => w.length > 2).every(w => n.includes(w)));
    const moment = /canonazo|canon|nueve/.test(n) || (extra === 'solo' && /solo|trompet/.test(n)) || (extra === 'coro' && /cant(amos|aron|o|ado)|todos juntos|coro|publico/.test(n));
    const opinion = /gust|encant|recomiend|increibl|genial|fantastic|maravill|bonit|mejor|aburrid|precios|espectacular|buenisim/.test(n);
    fb(bandOk ? 'ok' : 'warn', 'La banda', bandOk ? SHOW.band : 'Name the band.');
    fb(songs.length ? 'ok' : 'warn', 'Las canciones', songs.length ? songs.join(', ') : 'Name at least one song they played.');
    fb(moment ? 'ok' : 'warn', 'Un momento especial', moment ? '✓' : 'What special thing happened during the concert?');
    fb(p.count >= 3 ? 'ok' : 'warn', `Pretérito perfecto: ${p.count}`, p.count >= 3 ? [...p.parts].join(', ') : 'Use the perfect three times or more (he visto, han tocado, me ha gustado…).');
    fb(d.prons.length ? 'ok' : 'warn', 'Pronombre', d.prons.length ? `${d.prons[0].p} ✓` : 'Add an object pronoun: los recomiendo, la he escuchado…');
    if (!opinion) fb('info', 'Tu opinión', 'Did you like it? Would you recommend it?');
    if (wc < 35) fb('warn', 'Más, por favor', `A little longer: four sentences or more (${wc} words).`);
    const met = bandOk && songs.length && moment && p.count >= 3 && d.prons.length && wc >= 35;
    if (met || tries >= 3) {
      session.writing.push({ scene: 'La reseña', text: raw });
      session.details.review = { bandOk, songs: songs.length, moment, perfect: p.count, dop: d.prons.length };
      finishMission('resena', met ? (opinion && !p.slips.length ? 3 : 2) : 1); ia('');
      await talk(met ? ['¡Qué reseña tan buena! La publicamos ahora mismo en la web.'] : ['¡Gracias! La revisamos mañana y la publicamos.'], CAST.yanelis);
      return raw;
    }
    await talk([!songs.length || !bandOk ? '¿Cómo se llamaba la banda? ¿Y qué canciones han tocado?' : '¡Me gusta! Cuéntanos un poco más.'], CAST.yanelis);
    return false;
  });
}

/* ============ 7 · END OF SESSION ============ */
function endSession() {
  stopSpeech(); hideGo();
  const mins = Math.max(1, Math.round((Date.now() - session.started) / 60000));
  const total = session.missions.reduce((a, m) => a + m.stars, 0), D = session.details;
  const I = D.interview || {}, Q = D.requests || {}, V = D.review || {};
  const badges = [
    ['Datos de La Habana', 'Found all six facts about Havana', found.size >= 6],
    ['Usted en antena', 'Four perfect-tense questions with usted and no slips', I.perfectQs >= 4 && !I.tuSlips && !I.slips],
    ['Buen oído', 'Every request answered and found with no mistakes', Q.misses === 0 && Q.dopErr === 0],
    ['Crítico musical', 'Review with the band, a song, a moment and an object pronoun', !!(V.bandOk && V.songs && V.moment && V.dop)],
  ];
  const el = $id('summary');
  el.innerHTML = `
    <div><p class="eyebrow">Fin del programa · La Habana</p><h2>¡Hasta luego, Habana!</h2></div>
    <div class="stats">
      <div class="stat"><div class="v">${total}/12</div><div class="k">Estrellas</div></div>
      <div class="stat"><div class="v">${found.size}/6</div><div class="k">Datos de La Habana</div></div>
      <div class="stat"><div class="v">${session.stats.replays}</div><div class="k">Repeticiones</div></div>
      <div class="stat"><div class="v">${mins}</div><div class="k">Minutos</div></div>
    </div>
    <div class="mrows">${session.missions.map(m => `<div class="mrow"><span>${esc(m.title)}</span><span class="stars">${starStr(m.stars)}</span></div>`).join('')}</div>
    <div class="badges">${badges.map(([t, d, on]) => `<span class="badge${on ? '' : ' off'}" title="${esc(d)}">★ ${esc(t)}</span>`).join('')}</div>
    <div><h3 class="lbl">Lo que escribiste</h3><ol class="transcript" style="margin-top:8px">${session.writing.map(w => `<li><b>${esc(w.scene)}:</b> ${esc(w.text)}</li>`).join('')}</ol></div>
    <p class="outcomes">${session.textShown ? 'Text was turned on during this session' + (session.textReason === 'novoice' ? ' (no Spanish voice on this computer).' : session.textReason === 'accommodation' ? ' (accommodation link).' : '.') + ' · ' : 'Played audio-only. · '}Guest: ${esc(SHOW.guest.name)} (${esc(SHOW.guest.genre)}). Band: ${esc(SHOW.band)}. Outcomes practised (30-3Y): LC–1.3 a (music; arts and entertainment) · LC–1.4 b (perfect tense, direct object pronouns) · LC–4.1 b · GC–1.5 a · A–3.2 a · A–4.3 a, b · A–4.4 a · LC–2.1 a · LC–2.3 a · LC–5.1 a · LC–5.2 a.</p>
    <div class="row"><button class="btn primary" type="button" id="againBtn" data-again>Jugar otra vez</button></div>`;
  el.hidden = false;
  try { SFX.celebrate(0); } catch (e) {}
  $id('againBtn').addEventListener('click', () => { el.hidden = true; window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); startGame(); });
  el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  setTask('That’s the end of the show. Your summary and report are below.', 'Fin'); ia('');
}

/* ============ 8 · BOOT ============ */
function syncSpeed() { document.querySelectorAll('[data-speed]').forEach(b => b.classList.toggle('on', b.dataset.speed === SETTINGS.speed)); }
function wireUI() {
  $id('introFace').innerHTML = luciaSVG('happy');
  $id('startBtn').addEventListener('click', () => { $id('intro').hidden = true; try { SFX.play('whoosh', { force: true }); } catch (e) {} startGame(); });
  $id('testVoice').addEventListener('click', () => talk(['¡Hola! Bienvenido a La Habana.'], CAST.lucia, { replay: true }));
  $id('replay').addEventListener('click', replay);
  $id('helpBtn').addEventListener('click', onHelp);
  document.querySelectorAll('[data-speed]').forEach(b => b.addEventListener('click', () => { SETTINGS.speed = b.dataset.speed; saveSettings(); syncSpeed(); }));
  $id('slow').addEventListener('click', () => { if (!lastSpoken) return; const sp = SETTINGS.speed; SETTINGS.speed = 'lento'; session && session.stats.slow++; talk(lastSpoken.lines, lastSpoken.who, { replay: true }).then(() => { SETTINGS.speed = sp; }); });
  syncSpeed();
  $id('settingsBtn').addEventListener('click', () => { const d = $id('settingsDlg'); if (d.showModal) d.showModal(); else d.setAttribute('open', ''); });
  $id('closeSettings').addEventListener('click', () => { const d = $id('settingsDlg'); if (d.close) d.close(); else d.removeAttribute('open'); });
  $id('optText').addEventListener('change', e => setText(e.target.checked, 'student'));
  $id('voiceSel').addEventListener('change', e => { SETTINGS.voice = e.target.value; saveSettings(); loadVoices(); talk(['Esta es mi voz.'], CAST.lucia, { replay: true }); });
  const setMute = m => { try { SFX.setMuted(m); } catch (e) {} $id('sfxOn').checked = !m; $id('optSfx').checked = !m; if (m) MUSIC.stop(); };
  try { setMute(SFX.muted()); } catch (e) {}
  $id('sfxOn').addEventListener('change', e => setMute(!e.target.checked));
  $id('optSfx').addEventListener('change', e => setMute(!e.target.checked));
  document.querySelectorAll('.libtabs button').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('.libtabs button').forEach(x => x.classList.toggle('on', x === b)); document.querySelectorAll('.libpane').forEach(p => p.hidden = p.id !== b.dataset.pane); }));
  document.addEventListener('keydown', e => { if (e.key === 'r' && e.altKey) replay(); });
  initVoices();
  session = newSession();
  if (ACCOMMODATION) setText(true, 'accommodation');
  renderMissions(); renderGems(); renderGuion(); renderCalls();
  const api = enterScene('estudio', { place: '<b>Radio Malecón 99.5 FM</b> · Centro Habana' });
  api.setRecords(RECORDS); api.setGuest(GUESTS[0].spec);
  frame();
}
wireUI();
window.__radio = { get session() { return session; }, get SHOW() { return SHOW; }, analyzePerfect, analyzeDOP, summaryFacts, startGame, setText, BUILT, orbit, state, missionReview, endSession, finishMission };
