/* ===================== Puzzles: one engine per kind, re-randomized every time ===================== */
function puzzleShell(title, enInstr, esLines, speakText) {
  const P = $('puzzle');
  P.innerHTML = `<p class="eyebrow">El código de Elena</p><h3 class="ptitle">${esc(title)}</h3><p class="pinstr">${esc(enInstr)}</p>`
    + (esLines.length ? `<div class="pbox">${esLines.map(l => `<p>${gl(l)}</p>`).join('')}<div class="mctl"><button class="play" type="button">▶ Escuchar</button><button class="slow" type="button">Lento</button></div></div>` : '')
    + `<div class="parea"></div><div class="fbs pfb" aria-live="polite"></div><div class="prow"><button class="btn ghost small pback" type="button">Volver a la escena</button></div>`;
  const say = speakText || esLines.join(' ');
  P.querySelector('.play')?.addEventListener('click', () => speak(say));
  P.querySelector('.slow')?.addEventListener('click', () => speak(say, null, true));
  P.querySelector('.pback').addEventListener('click', () => closePuzzle());
  return { area: P.querySelector('.parea'), box: P.querySelector('.pfb') };
}
function openPuzzleView() { $('sceneSvg').style.display = 'none'; $('puzzle').hidden = false; refreshGlossary(); }
function closePuzzle() { $('puzzle').hidden = true; $('sceneSvg').style.display = ''; S.puzzleOpen = false; }

/* the shared rhythm: a mistake costs an hour; three mistakes and Elena's notes give the answer */
function makeJudge(box, onDone, revealFn) {
  const J = { miss: 0, shown: false, over: false };
  J.wrong = (es, en) => {
    if (J.over) return;
    J.miss++; S.miss++;
    fb('err', es, `${en ? en + ' ' : ''}(−${COST.miss} h)`, false, box);
    if (advance(COST.miss, 'error')) return;
    if (J.miss >= 3) { J.shown = true; J.over = true; revealFn(); fb('info', 'Las notas de Elena tienen la respuesta.', 'Elena’s notes give the answer this time.', true, box); setTimeout(() => onDone(J), 2600 * SPEED); }
  };
  J.right = (es, en) => { if (J.over) return; J.over = true; fb('ok', es, en, false, box); SFX.play('perfect'); setTimeout(() => onDone(J), 1500 * SPEED); };
  return J;
}

function runPuzzle(id) {
  return new Promise(resolve => {
    S.puzzleOpen = true;
    const kind = CITIES[id].puzzle;
    const done = J => { closePuzzle(); resolve({ miss: J.miss, shown: J.shown }); };
    ({ glyph: pzGlyph, route: pzRoute, timeline: pzTimeline, pick: pzPick, grid: pzGrid, quipu: pzQuipu })[kind](id, done);
    openPuzzleView();
  });
}

/* ---------- Mexico City: the twenty day signs on the Piedra del Sol ---------- */
const DAYSIGNS = [['cocodrilo', '🐊'], ['viento', '🌬️'], ['casa', '🏠'], ['lagartija', '🦎'], ['serpiente', '🐍'], ['muerte', '💀'], ['venado', '🦌'], ['conejo', '🐇'], ['agua', '💧'], ['perro', '🐕'], ['mono', '🐒'], ['hierba', '🌿'], ['caña', '🎋'], ['jaguar', '🐆'], ['águila', '🦅'], ['zopilote', '🪶'], ['movimiento', '🌀'], ['pedernal', '🔪'], ['lluvia', '🌧️'], ['flor', '🌸']];
const SIGN_DESC = {
  cocodrilo: 'Es un animal que vive en el río y tiene muchos dientes.', lagartija: 'Es un animal pequeño y verde. Toma el sol en las piedras.',
  serpiente: 'Es un animal largo. No tiene patas.', venado: 'Es un animal que corre en el bosque. Tiene cuernos.',
  conejo: 'Es un animal pequeño con orejas muy largas.', perro: 'Es el mejor amigo de las personas.',
  mono: 'Es un animal que vive en los árboles y come fruta.', jaguar: 'Es un gato enorme con manchas negras.',
  'águila': 'Es un pájaro grande que vuela muy alto. ¡Está en la bandera de México!', casa: 'Es el lugar donde vive una familia.',
  agua: 'La bebemos todos los días.', flor: 'Es bonita, de colores, y huele bien.', lluvia: 'Cae del cielo cuando hay nubes.'
};
function pzGlyph(id, done) {
  const starts = Object.keys(SIGN_DESC), start = pick(starts), si = DAYSIGNS.findIndex(d => d[0] === start);
  const n = 3 + rand(5), dir = pick(['derecha', 'izquierda']);
  const ans = (si + (dir === 'derecha' ? n : 20 - n)) % 20;
  const lines = ['El sello está en la Piedra del Sol. Tiene los veinte signos de los días.', `Busca este signo: ${SIGN_DESC[start]}`, `Desde ese signo, cuenta ${numWord(n)} signos a la ${dir}. No cuentes el primero.`, 'Toca el signo donde terminas.'];
  const { area, box } = puzzleShell('La Piedra del Sol', 'Find the first sign from its description, then count around the stone. “A la derecha” follows the gold arrow (clockwise).', lines);
  startArt();
  let s = `<circle cx="210" cy="210" r="200" fill="${RG('#9A8C80', [0.25, -0.35])}"/><circle cx="210" cy="210" r="196" fill="none" stroke="#5E5048" stroke-width="3"/><circle cx="210" cy="210" r="122" fill="none" stroke="#5E5048" stroke-width="3"/><circle cx="210" cy="210" r="70" fill="${RG('#A89A8E')}" stroke="#5E5048" stroke-width="3"/><text x="210" y="226" text-anchor="middle" font-size="44">☀️</text>`;
  s += `<path d="M150 30 A182 182 0 0 1 270 30" fill="none" stroke="#F2C46D" stroke-width="4" marker-end="url(#arr)"/><text x="210" y="20" text-anchor="middle" font-size="13" font-weight="800" fill="#FFF1D6" stroke="#17122E" stroke-width="3" paint-order="stroke" font-family="Manrope, sans-serif">a la derecha →</text>`;
  _defs.push('<marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#F2C46D"/></marker>');
  DAYSIGNS.forEach(([nm, em], i) => {
    const a = -Math.PI / 2 + i * Math.PI / 10, x = 210 + Math.cos(a) * 160, y = 210 + Math.sin(a) * 160;
    s += `<g class="zone" data-i="${i}" tabindex="0" role="button" aria-label="${nm}"><circle class="zr" cx="${x}" cy="${y}" r="27"/><circle cx="${x}" cy="${y}" r="23" fill="${RG('#B0A296')}" stroke="#5E5048" stroke-width="1.5"/><text x="${x}" y="${y + 9}" text-anchor="middle" font-size="25" class="ico">${em}</text></g>`;
  });
  area.innerHTML = `<svg class="pz" viewBox="0 0 420 420" style="max-width:440px;margin:0 auto">${defsOut()}${s}</svg>`;
  const J = makeJudge(box, done, () => area.querySelector(`.zone[data-i="${ans}"]`).classList.add('good'));
  window.__pzSolve = () => area.querySelector(`.zone[data-i="${ans}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true }));
  area.querySelectorAll('.zone').forEach(z => {
    const go = () => {
      if (J.over) return;
      const i = +z.dataset.i;
      if (i === ans) { z.classList.add('good'); J.right(`¡Sí! El signo ${DAYSIGNS[ans][0]}. La piedra se abre…`, 'The seal is behind the sign.'); }
      else if (i === si) { z.classList.add('bad'); setTimeout(() => z.classList.remove('bad'), 900); J.wrong(`Ese es el primer signo: ${DAYSIGNS[i][0]}. Ahora cuenta ${numWord(n)} signos a la ${dir}.`, 'That’s the starting sign; now count.'); }
      else { z.classList.add('bad'); setTimeout(() => z.classList.remove('bad'), 900); J.wrong(`No: es el signo ${DAYSIGNS[i][0]}. ¿Empezaste en el signo correcto?`, 'Check the starting sign and the direction.'); }
    };
    z.addEventListener('click', go); z.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
}

/* ---------- Miami and Havana: follow a historical route on a map ---------- */
const ROUTES = {
  vaca: {
    title: 'El diario de Cabeza de Vaca', box: [-113, -78, 34, 16],
    en: 'Read each diary entry and tap the place on the map, in order. The names appear once you find them.',
    steps: [
      { p: 'Florida', ll: [-82.5, 27.8], ic: '🌴', es: '1528. Llegamos a una península verde, con muchas palmeras. Somos trescientos hombres.' },
      { p: 'Isla de Malhado', ll: [-94.8, 29.3], ic: '🏝️', es: 'Perdimos los barcos. Hicimos balsas, y el mar nos llevó a una isla pequeña. Hace frío y no hay comida.' },
      { p: 'El desierto', ll: [-104.5, 29.5], ic: '🌵', es: 'Caminamos años y años por el desierto. Hay cactus y muy poca agua. Los pueblos indígenas nos ayudan.' },
      { p: 'Culiacán', ll: [-107.4, 24.8], ic: '🏘️', es: '1536. Por fin encontramos soldados españoles en un pueblo cerca del océano Pacífico.' },
      { p: 'Ciudad de México', ll: [-99.1, 19.4], ic: '🏙️', es: 'Llegamos a la capital, en un valle con un lago. Contamos la historia de siete ciudades ricas en el norte.' }
    ],
    decoys: [{ p: 'La Habana', ll: [-82.4, 23.1], ic: '⚓' }, { p: 'Veracruz', ll: [-96.1, 19.2], ic: '⛵' }, { p: 'Mérida', ll: [-89.6, 21], ic: '🛕' }, { p: 'Nueva Orleans', ll: [-90.1, 30], ic: '🎺' }]
  },
  flota: {
    title: 'La ruta de la Flota de Indias', box: [-100, -2, 42, 5],
    en: 'Read each line of the old map and tap the port, in order. The names appear once you find them.',
    steps: [
      { p: 'Veracruz', ll: [-96.1, 19.2], ic: '🥈', es: 'La flota de Nueva España sale de un puerto de México con plata de las minas.' },
      { p: 'Cartagena', ll: [-75.5, 10.4], ic: '🏰', es: 'La flota de Tierra Firme sale de una ciudad con murallas, en la costa de Colombia.' },
      { p: 'Portobelo', ll: [-79.65, 9.55], ic: '🦙', es: 'Pasa por Panamá. Allí recibe la plata que llega de Perú.' },
      { p: 'La Habana', ll: [-82.4, 23.1], ic: '⚓', es: 'Todos los barcos se juntan en la gran bahía de una isla del Caribe.' },
      { p: 'Sevilla', ll: [-6, 37.4], ic: '🇪🇸', es: 'Juntos cruzan el océano Atlántico hasta un puerto con un río, en el sur de España.' }
    ],
    decoys: [{ p: 'San Juan', ll: [-66.1, 18.5], ic: '🏝️' }, { p: 'Santo Domingo', ll: [-69.9, 18.5], ic: '⛪' }, { p: 'Lisboa', ll: [-9.1, 38.7], ic: '⛵' }, { p: 'Caracas', ll: [-66.9, 10.5], ic: '⛰️' }]
  }
};
function pzRoute(id, done) {
  const R = ROUTES[CITIES[id].route], [lo0, lo1, la0, la1] = R.box, W = 640, H = Math.round(640 * (la0 - la1) / (lo1 - lo0) * 1.12);
  const pj = ([lo, la]) => [(lo - lo0) / (lo1 - lo0) * W, (la0 - la) / (la0 - la1) * H];
  const places = shuffle([...R.steps.map((s, i) => ({ ...s, step: i })), ...shuffle(R.decoys).slice(0, 2).map(d => ({ ...d, step: -1 }))]);
  let k = 0;
  const { area, box } = puzzleShell(R.title, R.en, []);
  startArt();
  let s = `<rect width="${W}" height="${H}" fill="#1D2A5C"/>`;
  const land = Object.values(LAND).map(pts => 'M' + pts.map(p => pj(p).map(v => v.toFixed(1)).join(' ')).join(' L') + ' Z').join(' ');
  s += `<path d="${land}" fill="#05030F" opacity=".4" transform="translate(4 5)"/><path d="${land}" fill="${G('#4E7060', 'd')}" stroke="#86AE9A" stroke-width="1.2" stroke-linejoin="round"/><g id="rtrail"></g>`;
  places.forEach((p, i) => {
    const [x, y] = pj(p.ll);
    s += `<g class="zone" data-i="${i}" tabindex="0" role="button" aria-label="${p.ic}"><circle class="zr" cx="${x}" cy="${y}" r="20"/><circle cx="${x}" cy="${y}" r="15" fill="${RG('#FFF1D6')}" stroke="#17122E" stroke-width="1.4"/><text x="${x}" y="${y + 6}" text-anchor="middle" font-size="16" class="ico">${p.ic}</text><text class="pname" x="${x}" y="${y + 30}" text-anchor="middle" font-size="12" font-weight="800" fill="#FFF1D6" stroke="#17122E" stroke-width="3" paint-order="stroke" font-family="Manrope, sans-serif" opacity="0">${esc(p.p)}</text></g>`;
  });
  area.innerHTML = `<div class="pbox" id="rEntry"></div><svg class="pz" viewBox="0 0 ${W} ${H}">${defsOut()}${s}</svg>`;
  const showEntry = () => {
    const st = R.steps[k];
    $('rEntry').innerHTML = `<p><b>${k + 1}/${R.steps.length}.</b> ${gl(st.es)}</p><div class="mctl"><button class="play" type="button">▶ Escuchar</button><button class="slow" type="button">Lento</button></div>`;
    $('rEntry').querySelector('.play').onclick = () => speak(st.es); $('rEntry').querySelector('.slow').onclick = () => speak(st.es, null, true);
    if ($('autoplay') && $('autoplay').checked) speak(st.es);
    refreshGlossary();
  };
  const trail = () => { const pts = R.steps.slice(0, k).map(st => pj(st.ll)); $('rtrail').innerHTML = pts.length > 1 ? `<path d="M${pts.map(p => p.join(' ')).join(' L')}" fill="none" stroke="#FFC27A" stroke-width="3" stroke-dasharray="4 6" stroke-linecap="round"/>` : ''; };
  const J = makeJudge(box, done, () => { area.querySelectorAll('.zone').forEach(z => { const p = places[+z.dataset.i]; if (p.step >= 0) { z.classList.add('good'); z.querySelector('.pname').setAttribute('opacity', '1'); } }); k = R.steps.length; trail(); });
  showEntry();
  window.__pzSolve = () => R.steps.forEach((_, st) => area.querySelector(`.zone[data-i="${places.findIndex(p => p.step === st)}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true })));
  area.querySelectorAll('.zone').forEach(z => {
    const go = () => {
      if (J.over) return;
      const p = places[+z.dataset.i];
      if (p.step === k) {
        z.classList.add('good'); z.querySelector('.pname').setAttribute('opacity', '1'); SFX.play('correct'); k++; trail();
        if (k === R.steps.length) J.right('¡La ruta completa! Detrás del mapa hay un sello.', 'You traced the whole route.');
        else showEntry();
      } else if (p.step >= 0 && p.step < k) { /* already found */ }
      else { z.classList.add('bad'); setTimeout(() => z.classList.remove('bad'), 900); J.wrong('No es ese lugar. Lee otra vez la pista.', 'Look for the place the entry describes.'); }
    };
    z.addEventListener('click', go); z.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
}

/* ---------- San Juan and Puerto Viejo: put the history in order ---------- */
const TIMELINES = {
  sanjuan: { title: 'La placa de El Morro', place: 'una placa al lado de la garita', events: [
    { ic: '🛶', plaque: 'los taínos vivían en la isla y la llamaban Borikén', card: 'Los taínos llaman a la isla «Borikén».' },
    { ic: '🏘️', plaque: 'Juan Ponce de León fundó Caparra, el primer pueblo español', card: 'Nace Caparra, un pueblo español.' },
    { ic: '🏝️', plaque: 'la ciudad se mudó a la pequeña isla de San Juan', card: 'La ciudad cambia de lugar: va a la isla de San Juan.' },
    { ic: '🏰', plaque: 'empezaron a construir El Morro para proteger la bahía', card: 'Construyen un fuerte enorme al lado del mar.' },
    { ic: '🏛️', plaque: 'la UNESCO nombró al Viejo San Juan Patrimonio de la Humanidad', card: 'El Viejo San Juan es Patrimonio de la Humanidad.' }] },
  puertoviejo: { title: 'El tablero de las tortugas', place: 'el tablero de la playa', events: [
    { ic: '🌿', plaque: 'los bribris y los cabécares ya vivían en estas montañas y costas', card: 'Los bribris viven en Talamanca.' },
    { ic: '⛵', plaque: 'Cristóbal Colón llegó a esta costa en su cuarto viaje', card: 'Llegan barcos españoles con Colón.' },
    { ic: '🚂', plaque: 'familias de Jamaica llegaron para construir el tren', card: 'Construyen el tren al Atlántico.' },
    { ic: '🕊️', plaque: 'Costa Rica dijo adiós a su ejército', card: 'El país ya no tiene soldados.' },
    { ic: '🐢', plaque: 'los voluntarios empezaron a proteger los nidos de tortugas', card: 'Voluntarios cuidan los nidos en la playa.' }] }
};
function pzTimeline(id, done) {
  const T = TIMELINES[CITIES[id].timeline];
  const drop = rand(5), ev = T.events.filter((_, i) => i !== drop);
  const words = ['Primero', 'Después', 'Luego', 'Por último'];
  const plaque = ev.map((e, i) => `${words[i]}, ${e.plaque}.`);
  const { area, box } = puzzleShell(T.title, `Read ${T.place === 'el tablero de la playa' ? 'the board' : 'the plaque'} (primero, después, luego, por último), then put the cards in the same order. The seal opens when the order is right.`, plaque);
  let order = shuffle(ev.map((_, i) => i));
  while (order.every((v, i) => v === i)) order = shuffle(order);
  const draw = (marks) => {
    area.innerHTML = `<div class="tl">${order.map((ei, pos) => `<div class="tlcard${marks ? (ei === pos ? ' good' : ' bad') : ''}"><span class="num">${pos + 1}</span><span class="pic">${ev[ei].ic}</span><span>${gl(ev[ei].card)}</span><span class="mv"><button type="button" data-up="${pos}" aria-label="Subir"${pos === 0 ? ' disabled' : ''}>▲</button><button type="button" data-dn="${pos}" aria-label="Bajar"${pos === order.length - 1 ? ' disabled' : ''}>▼</button></span></div>`).join('')}</div><div class="prow"><button class="btn primary" type="button" id="tlCheck">Comprobar</button></div>`;
    area.querySelectorAll('[data-up]').forEach(b => b.onclick = () => { const p = +b.dataset.up; [order[p - 1], order[p]] = [order[p], order[p - 1]]; SFX.play('turn'); draw(); });
    area.querySelectorAll('[data-dn]').forEach(b => b.onclick = () => { const p = +b.dataset.dn; [order[p + 1], order[p]] = [order[p], order[p + 1]]; SFX.play('turn'); draw(); });
    $('tlCheck').onclick = () => {
      if (J.over) return;
      const right = order.filter((v, i) => v === i).length;
      if (right === order.length) { draw(true); J.right('¡Perfecto! El orden es correcto.', 'The seal clicks open.'); }
      else { draw(true); J.wrong(`${capFirst(numWord(right))} de ${numWord(order.length)} en su lugar.`, 'Green cards are in the right place.'); }
    };
    refreshGlossary();
  };
  const J = makeJudge(box, done, () => { order = ev.map((_, i) => i); draw(true); });
  draw();
  window.__pzSolve = () => { order = ev.map((_, i) => i); draw(); $('tlCheck').click(); };
}

/* ---------- Bogotá, Oaxaca, Buenos Aires: find the one that matches the description ---------- */
const PICKS = {
  balsa: {
    title: 'La balsa de oro', who: 1, en: 'Mariana describes the raft that hides the seal. Four rafts look alike: only one matches every detail.',
    attrs: { n: [4, 6, 8], hat: ['alto', 'redondo'], tail: ['larga', 'corta'] },
    say: a => [`En la vitrina hay cuatro balsas de oro, pero solo una es la de Elena.`, `En la balsa de Elena hay ${numWord(a.n)} personas alrededor del cacique.`, `El cacique es más grande que las otras personas y tiene un sombrero ${a.hat}.`, `La balsa es ${a.tail === 'larga' ? 'larga, con una cola atrás' : 'corta, sin cola'}.`],
    draw: a => { let s = `<rect width="200" height="130" fill="#2A2152"/><ellipse cx="100" cy="112" rx="80" ry="8" fill="#000" opacity=".3"/>`;
      const L = a.tail === 'larga' ? 176 : 140, x0 = 100 - L / 2;
      s += `<path d="M${x0} 92 H${x0 + L} L${x0 + L - 8} 106 H${x0 + 8} Z" fill="${G('#E9A93A', 'v', [0.3, -0.35])}"/>` + (a.tail === 'larga' ? `<path d="M${x0 + L - 10} 92 L${x0 + L + 4} 74 L${x0 + L} 92 Z" fill="#E9A93A"/>` : '');
      s += `<rect x="92" y="50" width="16" height="42" rx="4" fill="${G('#F2C46D')}"/><circle cx="100" cy="44" r="8" fill="${RG('#F2C46D')}"/>` + (a.hat === 'alto' ? `<path d="M92 38 L95 16 H105 L108 38 Z" fill="#E9A93A"/>` : `<ellipse cx="100" cy="36" rx="13" ry="5" fill="#E9A93A"/>`);
      for (let i = 0; i < a.n; i++) { const side = i % 2 ? 1 : -1, j = Math.floor(i / 2), x = 100 + side * (24 + j * 16); s += `<rect x="${x - 3.5}" y="70" width="7" height="22" rx="2" fill="${G('#E9A93A')}"/><circle cx="${x}" cy="66" r="4.5" fill="${RG('#F2C46D')}"/>`; }
      return s; }
  },
  mole: {
    title: 'El mole de Elena', who: 0, en: 'Abuela Chayo remembers the mole Elena always ordered. Find the plate that matches every detail.',
    attrs: { color: ['negro', 'rojo', 'amarillo', 'verde'], top: ['ajonjolí', 'cebolla'], side: ['arroz', 'tortillas'] },
    say: a => ['Elena venía aquí a comer todos los domingos. ¡Me acuerdo muy bien!', `Siempre comía mole ${a.color}.`, `Le gustaba con ${a.top} encima.`, `Y siempre lo comía con ${a.side}.`],
    draw: a => { const c = { negro: '#2A1810', rojo: '#9A2A1A', amarillo: '#D8A030', verde: '#5A8A3A' }[a.color];
      let s = `<rect width="200" height="130" fill="#2A2152"/><ellipse cx="96" cy="104" rx="74" ry="14" fill="#000" opacity=".3"/><ellipse cx="96" cy="88" rx="74" ry="26" fill="${G('#B5643A', 'v')}"/><ellipse cx="96" cy="84" rx="62" ry="20" fill="${c}"/><ellipse cx="80" cy="78" rx="18" ry="5" fill="#fff" opacity=".15"/>`;
      s += a.top === 'ajonjolí' ? Array.from({ length: 22 }, (_, i) => `<ellipse cx="${60 + (i * 37) % 72}" cy="${74 + (i * 13) % 18}" rx="2" ry="1.1" fill="#F4E2C0"/>`).join('') : [[70, 80], [92, 74], [112, 84], [84, 90], [104, 72]].map(([x, y]) => `<path d="M${x - 6} ${y} q6 -6 12 0" stroke="#F4F1EA" stroke-width="2.4" fill="none"/>`).join('');
      s += a.side === 'arroz' ? `<ellipse cx="166" cy="96" rx="26" ry="12" fill="${RG('#F4F1EA')}"/>` + Array.from({ length: 10 }, (_, i) => `<ellipse cx="${150 + (i * 7) % 30}" cy="${90 + (i * 5) % 10}" rx="2" ry="1" fill="#D8D0C0"/>`).join('') : `<ellipse cx="168" cy="102" rx="24" ry="8" fill="#E8C890"/><ellipse cx="168" cy="96" rx="24" ry="8" fill="#F0D4A0"/><ellipse cx="168" cy="90" rx="24" ry="8" fill="${G('#F4DEB0', 'v')}"/>`;
      return s; }
  },
  colectivo: {
    title: 'El colectivo correcto', who: 0, en: 'Martina tells you which bus Elena’s seal is on (people in Buenos Aires use vos: tomá = toma). Only one bus matches every detail.',
    attrs: { num: [29, 39, 64, 86], col: ['azul y amarillo', 'rojo y blanco', 'verde y amarillo', 'celeste y blanco'], dest: ['La Boca', 'Retiro', 'Palermo'] },
    say: a => ['¡Che! El sello de Elena está en un colectivo viejo.', `Tomá el colectivo número ${numWord(a.num)}.`, `Es ${a.col}.`, `Y va a ${a.dest}. ¡No te equivoqués!`],
    draw: a => { const [c1, c2] = { 'azul y amarillo': ['#2F5DA8', '#F2C230'], 'rojo y blanco': ['#C0283C', '#F4F1EA'], 'verde y amarillo': ['#2E8B57', '#F2C230'], 'celeste y blanco': ['#74ACDF', '#F4F1EA'] }[a.col];
      return `<rect width="200" height="130" fill="#2A2152"/><ellipse cx="100" cy="112" rx="86" ry="8" fill="#000" opacity=".3"/><rect x="14" y="36" width="172" height="66" rx="10" fill="${G(c1, 'v', [0.2, -0.25])}"/><rect x="14" y="72" width="172" height="16" fill="${c2}"/>`
        + Array.from({ length: 5 }, (_, i) => `<rect x="${44 + i * 27}" y="46" width="20" height="20" rx="3" fill="#9FD4E8" opacity=".85"/>`).join('') + `<rect x="18" y="46" width="20" height="40" rx="3" fill="#9FD4E8" opacity=".85"/>`
        + `<rect x="22" y="40" width="46" height="4" fill="#17122E" opacity=".25"/><text x="30" y="61" font-size="13" font-weight="800" fill="#17122E" font-family="Manrope, sans-serif" text-anchor="middle">${a.num}</text>`
        + `<rect x="84" y="24" width="96" height="14" rx="3" fill="#17122E"/><text x="132" y="35" font-size="10" font-weight="800" fill="#FFC27A" text-anchor="middle" font-family="Manrope, sans-serif">${a.dest.toUpperCase()}</text>`
        + `<path d="M120 94 q10 -8 20 0 q10 8 20 0" stroke="#F2C230" stroke-width="2" fill="none"/><circle cx="50" cy="104" r="10" fill="#17131F"/><circle cx="50" cy="104" r="4" fill="#C9C3D3"/><circle cx="152" cy="104" r="10" fill="#17131F"/><circle cx="152" cy="104" r="4" fill="#C9C3D3"/>`; }
  }
};
function pzPick(id, done) {
  const K = PICKS[CITIES[id].pick], keys = Object.keys(K.attrs);
  const target = Object.fromEntries(keys.map(k => [k, pick(K.attrs[k])]));
  const opts = [target];
  keys.forEach(k => { const alt = { ...target }; alt[k] = pick(K.attrs[k].filter(v => v !== target[k])); opts.push(alt); });
  const shown = shuffle(opts.slice(0, 4));
  const w = CITIES[id].wit[K.who];
  const lines = K.say(target);
  const { area, box } = puzzleShell(K.title, K.en, lines.map((l, i) => i === 0 ? `${w.name}: ${l}` : l), lines.join(' '));
  area.innerHTML = `<div class="opts">${shown.map((o, i) => { startArt(); const inner = K.draw(o); return `<button class="opt" type="button" data-i="${i}"><svg viewBox="0 0 200 130">${defsOut()}${inner}</svg><div class="cap">${String.fromCharCode(65 + i)}</div></button>`; }).join('')}</div>`;
  const ti = shown.indexOf(target);
  const J = makeJudge(box, done, () => area.querySelector(`.opt[data-i="${ti}"]`).classList.add('good'));
  window.__pzSolve = () => area.querySelector(`.opt[data-i="${ti}"]`).click();
  area.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
    if (J.over || b.classList.contains('bad')) return;
    const o = shown[+b.dataset.i];
    if (o === target) { b.classList.add('good'); J.right('¡Esa es! Dentro está el sello de Elena.', 'Every detail matches.'); }
    else { b.classList.add('bad'); const k = keys.find(k => o[k] !== target[k]); J.wrong('Casi, pero hay un detalle diferente.', `Look again at the ${({ n: 'number of people', hat: 'hat', tail: 'shape of the raft', color: 'colour', top: 'topping', side: 'side dish', num: 'number', col: 'colours', dest: 'destination' })[k]}.`); }
  }));
}

/* ---------- Madrid and Antigua: follow directions on a street map ---------- */
const GRIDS = {
  madrid: { title: 'El plano de Madrid', cols: 6, rows: 5, start: 'sol', who: 1,
    marks: { sol: [2, 2, '☀️', 'Puerta del Sol', 'la Puerta del Sol'], palacio: [0, 2, '🏰', 'Palacio Real'], mayor: [1, 3, '🏛️', 'Plaza Mayor'], granvia: [2, 0, '🛍️', 'Gran Vía'], prado: [4, 3, '🖼️', 'Museo del Prado'], retiro: [5, 2, '🌳', 'El Retiro'], rastro: [2, 4, '🧺', 'El Rastro'] },
    intro: 'Mi abuela Carmen conocía a Elena. Elena dejó el sello en una plaza pequeña. Mira el plano.' },
  antigua: { title: 'Las calles de Antigua', cols: 6, rows: 5, start: 'parque', who: 0,
    marks: { parque: [2, 2, '⛲', 'Parque Central', 'el Parque Central'], arco: [2, 1, '🟨', 'El Arco'], cerro: [3, 0, '✝️', 'Cerro de la Cruz'], merced: [2, 0, '⛪', 'La Merced'], mercado: [0, 2, '🧺', 'El Mercado'], catedral: [3, 2, '⛪', 'La Catedral'], tanque: [4, 3, '💧', 'Tanque de la Unión'] },
    intro: 'Te voy a contar dónde está el sello. Pon atención. El Volcán de Agua está al sur.' }
};
const DIRS = { norte: [0, -1], sur: [0, 1], este: [1, 0], oeste: [-1, 0] };
function pzGrid(id, done) {
  const M = GRIDS[CITIES[id].grid], occupied = new Set(Object.values(M.marks).map(([c, r]) => c + ',' + r));
  const [sc, sr] = M.marks[M.start];
  let plan = null;
  for (let t = 0; t < 400 && !plan; t++) {
    const d1 = pick(Object.keys(DIRS)), d2 = pick(Object.keys(DIRS).filter(d => (DIRS[d][0] === 0) !== (DIRS[d1][0] === 0)));
    const n1 = 1 + rand(3), n2 = 1 + rand(2);
    const c = sc + DIRS[d1][0] * n1 + DIRS[d2][0] * n2, r = sr + DIRS[d1][1] * n1 + DIRS[d2][1] * n2;
    if (c < 0 || r < 0 || c >= M.cols || r >= M.rows || occupied.has(c + ',' + r)) continue;
    plan = { d1, d2, n1, n2, c, r };
  }
  const cu = n => n === 1 ? 'una cuadra' : `${numWord(n)} cuadras`;
  const startName = M.marks[M.start][4];
  const lines = [M.intro, `Empieza en ${startName}.`, `Camina ${cu(plan.n1)} al ${plan.d1}.`, `Después, camina ${cu(plan.n2)} al ${plan.d2}.`, 'El sello está allí, en la cuadra donde terminas.'];
  const w = CITIES[id].wit[M.who];
  const { area, box } = puzzleShell(M.title, 'Follow the directions block by block (norte = up, sur = down, este = right, oeste = left). Tap the block where you end up.', lines.map((l, i) => i === 0 ? `${w.name}: ${l}` : l), lines.join(' '));
  const cw = 100, ch = 70, W = M.cols * cw + 80, H = M.rows * ch + 40;
  startArt();
  let s = `<rect width="${W}" height="${H}" fill="#3A3168"/>`;
  for (let r = 0; r < M.rows; r++) for (let c = 0; c < M.cols; c++) {
    const x = 20 + c * cw + 8, y = 20 + r * ch + 8, m = Object.values(M.marks).find(([mc, mr]) => mc === c && mr === r);
    s += `<g class="zone" data-c="${c}" data-r="${r}" tabindex="0" role="button" aria-label="${m ? esc(m[3]) : 'cuadra'}"><rect class="zr" x="${x - 4}" y="${y - 4}" width="${cw - 8}" height="${ch - 8}" rx="8"/><rect x="${x}" y="${y}" width="${cw - 16}" height="${ch - 16}" rx="5" fill="${m ? G('#5E4F96') : G('#4B4185')}"/>`
      + (m ? `<text x="${x + (cw - 16) / 2}" y="${y + 26}" text-anchor="middle" font-size="22" class="ico">${m[2]}</text><text x="${x + (cw - 16) / 2}" y="${y + 47}" text-anchor="middle" font-size="10" font-weight="800" fill="#FFF1D6" font-family="Manrope, sans-serif">${esc(m[3])}</text>` : '') + `</g>`;
  }
  const cx = W - 34, cy = 50;
  s += `<g><circle cx="${cx}" cy="${cy}" r="26" fill="#2A2152" stroke="#FFC27A" stroke-width="1.5"/><path d="M${cx} ${cy - 20} L${cx + 5} ${cy} L${cx} ${cy + 20} L${cx - 5} ${cy} Z" fill="#FFC27A"/><path d="M${cx - 20} ${cy} L${cx} ${cy - 5} L${cx + 20} ${cy} L${cx} ${cy + 5} Z" fill="#C9C3D3" opacity=".6"/>${[['N', 0, -32], ['S', 0, 38], ['E', 34, 4], ['O', -34, 4]].map(([t, dx, dy]) => `<text x="${cx + dx}" y="${cy + dy}" text-anchor="middle" font-size="11" font-weight="800" fill="#FFF1D6" font-family="Manrope, sans-serif">${t}</text>`).join('')}</g>`;
  if (CITIES[id].grid === 'antigua') s += `<text x="${W - 34}" y="${H - 14}" text-anchor="middle" font-size="22" class="ico">🌋</text>`;
  area.innerHTML = `<svg class="pz" viewBox="0 0 ${W} ${H}">${defsOut()}${s}</svg>`;
  if ($('autoplay') && $('autoplay').checked) speak(lines.join(' '));
  const J = makeJudge(box, done, () => area.querySelector(`.zone[data-c="${plan.c}"][data-r="${plan.r}"]`).classList.add('good'));
  window.__pzSolve = () => area.querySelector(`.zone[data-c="${plan.c}"][data-r="${plan.r}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true }));
  area.querySelectorAll('.zone').forEach(z => {
    const go = () => {
      if (J.over) return;
      const c = +z.dataset.c, r = +z.dataset.r;
      if (c === plan.c && r === plan.r) { z.classList.add('good'); J.right('¡Aquí está! Debajo de una piedra hay un sello.', 'You followed the directions perfectly.'); }
      else { z.classList.add('bad'); setTimeout(() => z.classList.remove('bad'), 900); J.wrong('Aquí no hay nada. Empieza otra vez desde ' + startName + '.', 'Count the blocks again from the start.'); }
    };
    z.addEventListener('click', go); z.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
}

/* ---------- Cusco: read a quipu ---------- */
function pzQuipu(id, done) {
  const cords = shuffle([['roja', '#C0283C', '¿Cuántas llamas hay en el pueblo?'], ['amarilla', '#F2C230', '¿Cuántos sacos de papas hay?'], ['verde', '#3E8E4E', '¿Cuántas casas hay en el pueblo?'], ['azul', '#3E6E9E', '¿Cuántas personas viven en el pueblo?']]);
  const vals = cords.map(() => (1 + rand(3)) * 100 + rand(10) * 10 + 1 + rand(9));
  const qi = shuffle([0, 1, 2, 3]).slice(0, 2);
  let step = 0;
  const lines = ['Wayra: Los incas contaban con quipus. Mira esta cuerda.', 'Arriba, cada nudo vale cien.', 'En el medio, cada nudo vale diez.', 'Abajo, cada nudo vale uno.'];
  const { area, box } = puzzleShell('El quipu', 'Count the knots on the cord Wayra asks about: top knots are hundreds, middle knots tens, bottom knots ones. Type the number.', lines);
  startArt();
  let s = `<rect width="520" height="330" fill="#3A2C2A"/><rect x="40" y="36" width="440" height="10" rx="5" fill="${G('#C8A878', 'v')}"/>`;
  s += [['× 100', 100], ['× 10', 180], ['× 1', 260]].map(([t, y]) => `<path d="M30 ${y} H490" stroke="#FFF1D6" stroke-width="1" stroke-dasharray="3 6" opacity=".25"/><text x="500" y="${y + 4}" font-size="11" font-weight="800" fill="#FFC27A" font-family="Manrope, sans-serif">${t}</text>`).join('');
  cords.forEach(([nm, col], i) => {
    const x = 90 + i * 110, v = vals[i], h = Math.floor(v / 100), t = Math.floor(v / 10) % 10, u = v % 10;
    s += `<path d="M${x} 44 Q${x + 4} 180 ${x - 2} 316" stroke="${col}" stroke-width="5" fill="none"/>`;
    const knots = (n, y0) => Array.from({ length: n }, (_, k) => `<ellipse cx="${x + 1}" cy="${y0 - (n - 1) * 7 + k * 14}" rx="7.5" ry="6" fill="${RG(col, [0.25, -0.35])}" stroke="${shade(col, -0.4)}" stroke-width="1"/>`).join('');
    s += knots(h, 100) + knots(t, 180) + knots(u, 268);
  });
  area.innerHTML = `<svg class="pz" viewBox="0 0 520 330">${defsOut()}${s}</svg><div class="pbox" id="qAsk"></div><form class="prow" id="qForm" autocomplete="off"><input type="text" class="num-in" id="qIn" inputmode="numeric" placeholder="123" aria-label="Number"><button class="btn primary" type="submit">Decir</button></form>`;
  const showQ = () => {
    const [nm, , question] = cords[qi[step]];
    const q = `Wayra: ${question} Lee la cuerda ${nm}.`;
    $('qAsk').innerHTML = `<p><b>${step + 1}/2.</b> ${gl(q)}</p><div class="mctl"><button class="play" type="button">▶ Escuchar</button><button class="slow" type="button">Lento</button></div>`;
    $('qAsk').querySelector('.play').onclick = () => speak(q.replace('Wayra: ', '')); $('qAsk').querySelector('.slow').onclick = () => speak(q.replace('Wayra: ', ''), null, true);
    $('qIn').value = ''; $('qIn').focus({ preventScroll: true });
    refreshGlossary();
  };
  const J = makeJudge(box, done, () => { $('qAsk').innerHTML = qi.map(i => `<p>La cuerda ${cords[i][0]}: <b>${vals[i]}</b></p>`).join(''); });
  showQ();
  window.__pzSolve = () => { [0, 1].forEach(st => { $('qIn').value = String(vals[qi[step]]); $('qForm').requestSubmit(); }); };
  $('qForm').addEventListener('submit', e => {
    e.preventDefault();
    if (J.over) return;
    const raw = $('qIn').value.trim(); if (!raw) return;
    const n = parseInt(raw.replace(/\D/g, ''), 10), want = vals[qi[step]];
    if (n === want) {
      SFX.play('correct');
      if (step === 1) J.right(`¡Sí, ${want}! Wayra sonríe: «Eres un quipucamayoc».`, 'A quipu reader!');
      else { fb('ok', `¡Correcto: ${want}!`, '', false, box); step++; showQ(); }
    } else {
      const h = Math.floor(want / 100), t = Math.floor(want / 10) % 10;
      J.wrong('No es ese número. Cuenta otra vez los nudos.', Math.floor(n / 100) !== h ? 'Check the top knots (hundreds).' : Math.floor(n / 10) % 10 !== t ? 'Check the middle knots (tens).' : 'Check the bottom knots (ones).');
    }
  });
}
