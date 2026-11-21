/* ===================== Granada: the thief, the evidence, the medallion ===================== */
async function arriveGranada() {
  Object.assign(S, { phase: 'granada', arrived: true, leg: 8 });
  S.finale = { accuse: 0, hearts: 3, lockMiss: 0 };
  feed.reset();
  $('placeName').textContent = 'La Alhambra · Granada, España';
  drawCity('granada');
  renderRoute(); renderDossier();
  showCode();
  SFX.play('fanfare');
  setActions([]);
  await luciaSay('¡Estás en Granada! Aquí nació Elena. El ladrón también está aquí, en la Alhambra.');
  await luciaSay('Primero tienes que decir quién es. Mira las pistas en el Expediente: «Sospechosos».');
  S.phase = 'warrant';
  setTask('Who is the thief? Use the clues in <b>Sospechosos</b>, then <b>click the thief</b>. A wrong name costs time.');
  openTab('sospechosos'); renderSuspects();
  $('tab-sospechosos').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
}
async function accuse(i) {
  if (S.phase !== 'warrant' || S.busy) return;
  const sus = S.G.suspects[i];
  S.finale.accuse++;
  if (i !== S.G.culprit) {
    SFX.play('wrong');
    S.crossed.add(i); renderSuspects();
    fb('err', `${sus.name} es inocente.`, 'Compare the highlighted features again.');
    if (advance(4, 'La persona equivocada')) return;
    luciaSay(`¡Ay, no! ${sus.name} es inocente. Mira otra vez las pistas.`);
    return;
  }
  S.busy = true;
  S.phase = 'duel';
  S.finale.warrant = S.finale.accuse === 1 ? 3 : S.finale.accuse === 2 ? 2 : 1;
  SFX.play('perfect');
  renderSuspects();
  await luciaSay(`¡${sus.name}! La policía de la Alhambra ${sus.fem ? 'la' : 'lo'} encontró en el Patio de los Leones.`);
  S.busy = false;
  startDuel();
}

/* ---------- the face-off: four claims, one piece of evidence each ---------- */
function buildClaims() {
  const G = S.G, sus = G.suspects[G.culprit], claims = [];
  const places = [...Array(7).keys()].filter(k => S.cards.some(c => c.id === 'w' + k));
  const kVisit = pick(places);
  claims.push({ es: `¿Yo? Yo nunca estuve en ${CITIES[G.route[kVisit]].name}. ¡Nunca!`, en: `“I was never in ${CITIES[G.route[kVisit]].name}.”`, ok: c => c.id === 'w' + kVisit, why: `A witness in ${CITIES[G.route[kVisit]].name} saw the thief.` });
  const feats = ['comida', 'hobby', 'acc'].filter(k => S.traits.some(t => t.k === k));
  const fk = feats.length ? pick(feats) : 'pelo', fv = sus.f[fk];
  const lie = { comida: { ceviche: '¡Yo odio el ceviche! Nunca lo como.', arepas: '¡Yo odio las arepas! Nunca las como.', empanadas: '¡Yo odio las empanadas! Nunca las como.', tacos: '¡Yo odio los tacos! Nunca los como.' }[fv],
    hobby: { tango: 'No sé bailar tango. ¡No me gusta la música!', ajedrez: 'No sé jugar al ajedrez.', foto: 'No tengo cámara. Nunca saco fotos.', surf: '¿Surf? ¡No sé nadar!' }[fv],
    acc: { sombrero: 'Nunca llevo sombrero.', gafas: 'Nunca llevo gafas de sol.', bufanda: 'Nunca llevo bufanda.', gorra: 'Nunca llevo gorra.' }[fv],
    pelo: 'Mi pelo es castaño. ¡Mira!' }[fk];
  claims.push({ es: lie, en: 'A claim about themselves.', ok: c => c.feat === fk, why: 'A witness described exactly this.' });
  claims.push({ es: 'Además, este medallón es de mi familia. ¡Mi abuela era cartógrafa!', en: '“The medallion belongs to my family.”', ok: c => c.id === 'carta0', why: 'Elena’s letter says who her family is.' });
  claims.push({ es: '¡Las siete ciudades de oro existen! Coronado las encontró y estaban llenas de oro.', en: '“Coronado found the cities full of gold.”', ok: c => c.id === 'l-mexico' || c.id === 'l-madrid', why: 'Elena read what Coronado found: adobe pueblos, not gold.' });
  return claims;
}
function startDuel() {
  S.finale.claims = buildClaims(); S.finale.ci = 0;
  S.puzzleOpen = true;
  setTask('The thief makes four claims. For each one, <b>present the evidence</b> that proves it false. Wrong evidence costs a heart.');
  setActions([]);
  drawDuel();
  openPuzzleView();
}
function drawDuel(flash) {
  const F = S.finale, sus = S.G.suspects[S.G.culprit], cl = F.claims[F.ci];
  const P = $('puzzle');
  P.innerHTML = `<p class="eyebrow">El Patio de los Leones</p><h3 class="ptitle">${esc(sus.name)}</h3>`
    + `<div class="duel"><div class="rival">${suspectSVG(sus)}</div><div><div class="hearts" aria-label="${F.hearts} hearts">${'♥'.repeat(F.hearts)}${'♡'.repeat(3 - F.hearts)}</div>${flash ? `<p class="objection">¡PROTESTO!</p>` : ''}<div class="claim"><span class="cnum">${F.ci + 1}/4 · </span>${gl(cl.es)}</div><div class="mctl" style="margin-top:6px"><button class="play" type="button">▶ Escuchar</button><button class="slow" type="button">Lento</button></div></div></div>`
    + `<p class="pinstr">Choose the evidence that proves this is a lie:</p><div class="cards">${S.cards.map((c, i) => `<button class="ecard" type="button" data-i="${i}"><span class="e">${c.ic}</span><div class="k">${esc(c.kind)}</div>${gl(c.text)}</button>`).join('')}</div><div class="fbs pfb" aria-live="polite"></div>`;
  P.querySelector('.play').onclick = () => speak(cl.es); P.querySelector('.slow').onclick = () => speak(cl.es, null, true);
  if (!flash) speak(cl.es);
  refreshGlossary();
  P.querySelectorAll('.ecard').forEach(b => b.addEventListener('click', () => present(+b.dataset.i, b)));
}
async function present(i, btn) {
  const F = S.finale, cl = F.claims[F.ci], card = S.cards[i], box = $('puzzle').querySelector('.pfb');
  if (S.busy) return;
  if (cl.ok(card)) {
    S.busy = true;
    SFX.play('perfect');
    drawDuel(true);
    fb('ok', '¡Mentira! Esta prueba lo demuestra.', cl.why, false, $('puzzle').querySelector('.pfb'));
    await sleep(2200);
    F.ci++;
    S.busy = false;
    if (F.ci >= F.claims.length) return confess();
    drawDuel();
  } else {
    SFX.play('wrong');
    btn.disabled = true;
    if (F.hearts > 0) F.hearts--;
    $('puzzle').querySelector('.hearts').textContent = '♥'.repeat(F.hearts) + '♡'.repeat(3 - F.hearts);
    if (F.hearts === 0) {
      const ri = S.cards.findIndex(c => cl.ok(c));
      $('puzzle').querySelector(`.ecard[data-i="${ri}"]`)?.classList.add('pickable');
      $('puzzle').querySelector(`.ecard[data-i="${ri}"]`)?.style.setProperty('border-color', 'var(--sun)');
      fb('warn', 'Lucía: ¡Mira esta prueba!', 'Lucía points to the right card.', false, box);
    } else fb('err', 'Eso no prueba nada. ¡Piensa!', `${cl.en} Which card shows that’s false?`, false, box);
  }
}
async function confess() {
  const sus = S.G.suspects[S.G.culprit];
  S.finale.duel = Math.max(1, S.finale.hearts);
  const P = $('puzzle');
  P.innerHTML = `<p class="eyebrow">El Patio de los Leones</p><h3 class="ptitle">${esc(sus.name)}</h3><div class="duel"><div class="rival">${suspectSVG(sus)}</div><div class="claim">${gl('Está bien… Sí, yo robé la página del mapa. Pero sin los siete sellos, la página no sirve para nada. Toma.')}</div></div>`;
  speak('Está bien… Sí, yo robé la página del mapa. Pero sin los siete sellos, la página no sirve para nada. Toma.');
  SFX.mission(S.finale.duel);
  await sleep(4200);
  addCard({ id: 'pagina', ic: '📄', kind: 'La página robada', text: 'En la página: «La caja está en la fuente. Pon los sellos en orden: del más antiguo al más nuevo.»' });
  await luciaSay('¡Lo lograste! Y mira la página: «Pon los sellos en orden, del más antiguo al más nuevo». ¡Usa el Archivo!');
  startLock();
}

/* ---------- the medallion: seals in order of their years ---------- */
const yearNum = y => /a\.\s*C\./.test(y) ? -parseInt(y, 10) : parseInt(y, 10);
function startLock() {
  S.phase = 'lock';
  const ids = S.G.route.slice(0, 7);
  const slots = ids.map(id => ({ id, y: CITIES[id].archivo.year })).sort((a, b) => yearNum(a.y) - yearNum(b.y));
  S.finale.slots = slots; S.finale.placed = {}; S.finale.sel = null;
  setTask('Put each seal in the slot with its year, from the oldest to the newest. The <b>Archivo</b> tab has every year. Each mistake costs an hour.');
  openTab('archivo');
  drawLock();
}
function drawLock() {
  const F = S.finale, P = $('puzzle');
  const used = new Set(Object.values(F.placed));
  P.innerHTML = `<p class="eyebrow">La fuente de los leones</p><h3 class="ptitle">El medallón de Elena</h3><p class="pinstr">${gl('Pon los sellos en orden: del más antiguo al más nuevo.')} Click a seal, then the slot with its year. The Archivo (below) tells you which event belongs to each city.</p>`
    + `<div class="slots">${F.slots.map((s, k) => { const pid = F.placed[k]; return `<button class="slot${pid ? ' good' : ''}" type="button" data-k="${k}"><span class="yr">${esc(s.y)}</span>${pid ? sealSVG(CITIES[pid].sym, true, 56) + `<small>${esc(CITIES[pid].name)}</small>` : '<span style="opacity:.5">?</span>'}</button>`; }).join('')}</div>`
    + `<p class="pinstr" style="margin-top:6px">Los sellos:</p><div class="sealtray">${S.G.route.slice(0, 7).map(id => `<button class="sealbtn${F.sel === id ? ' sel' : ''}" type="button" data-id="${id}"${used.has(id) ? ' disabled' : ''}>${sealSVG(CITIES[id].sym, true, 48)}${esc(CITIES[id].name)}</button>`).join('')}</div><div class="fbs pfb" aria-live="polite"></div>`;
  P.querySelectorAll('.sealbtn').forEach(b => b.addEventListener('click', () => { F.sel = b.dataset.id; SFX.play('tap'); drawLock(); }));
  P.querySelectorAll('.slot').forEach(b => b.addEventListener('click', () => placeSeal(+b.dataset.k)));
}
async function placeSeal(k) {
  const F = S.finale, box = () => $('puzzle').querySelector('.pfb');
  if (!F.sel || F.placed[k] || S.busy) return;
  const id = F.sel, want = F.slots[k];
  if (yearNum(CITIES[id].archivo.year) === yearNum(want.y)) {
    F.placed[k] = id; F.sel = null; SFX.play('correct'); drawLock();
    fb('ok', `${CITIES[id].archivo.year}: ${CITIES[id].archivo.event}`, '', false, box());
    if (Object.keys(F.placed).length === 7) { S.busy = true; await sleep(1200); S.busy = false; return openBox(); }
  } else {
    F.lockMiss++; S.miss++;
    SFX.play('wrong');
    F.sel = null; drawLock();
    fb('err', `El sello de ${CITIES[id].name} no es de ${want.y}.`, `Look up ${CITIES[id].name} in the Archivo. (−1 h)`, false, box());
    if (advance(1, 'Error en el medallón')) return;
    if (F.lockMiss >= 6) { // help: place the next one
      const nk = F.slots.findIndex((s, j) => !F.placed[j]); F.placed[nk] = F.slots[nk].id; drawLock();
      fb('info', 'Lucía te ayuda con un sello.', 'Lucía places one seal for you.', false, box());
      if (Object.keys(F.placed).length === 7) return openBox();
    }
  }
}

/* ---------- Elena's box ---------- */
async function openBox() {
  S.finale.lock = S.finale.lockMiss <= 1 ? 3 : S.finale.lockMiss <= 3 ? 2 : 1;
  closePuzzle();
  SFX.play('fanfare');
  S.won = true;
  renderArchive();
  const G = S.G, lines = G.route.slice(0, 7).map((id, k) => `${G.fam[k].was} se quedó en ${CITIES[id].name}.`);
  await popup('letter', letterHTML('La última carta de Elena', ['Querida familia:', 'Si lees esta carta, tienes los siete sellos. ¡Felicidades!', 'Busqué las siete ciudades de oro toda mi vida. Nunca encontré oro.', 'Pero encontré algo mejor. En siete ciudades se quedaron mis hijos y mis nietos:', ...lines, 'Y mi nieta Clara se fue a Canadá, a una ciudad con un puente muy largo: Lethbridge.', 'Esas son mis siete ciudades de oro. Y la octava eres tú.'], 'Elena Robles · Granada, 1952', 'Elena never found gold. Her “seven cities of gold” were the seven cities where her children and grandchildren settled, and the eighth is you, in Lethbridge.'), [{ label: 'Seguir' }]);
  const cousins = G.route.slice(0, 7).map((id, k) => `${CITIES[id].wit[1].name} (${CITIES[id].name})`);
  await popup('', `<p class="gtitle">¡Sorpresa!</p><p>${gl('¿Te acuerdas de las personas que te ayudaron? Algunas son de tu familia: son nietos y bisnietos de los hijos de Elena.')}</p><p style="margin-top:8px"><b>${cousins.map(esc).join(' · ')}</b></p><p class="gen">The second witness you met in each city was a distant cousin all along.</p>`, [{ label: 'Ver el final' }]);
  playCinematic().then(() => endGame(true));
}

/* ---------- the 3D ending (three.js r128), with a 2D fallback ---------- */
function loadThree() {
  if (window.THREE) return Promise.resolve(true);
  return new Promise(res => {
    const sc = document.createElement('script');
    sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    const to = setTimeout(() => res(false), 7000);
    sc.onload = () => { clearTimeout(to); res(!!window.THREE); };
    sc.onerror = () => { clearTimeout(to); res(false); };
    document.head.appendChild(sc);
  });
}
function cineLines() {
  const G = S.G, names = G.route.slice(0, 7).map(id => CITIES[id].name);
  return [
    ['Granada, 1492. Aquí terminó Al-Ándalus, y aquí empezó el viaje de Colón.', 'Granada, 1492: the end of Al-Andalus and the start of Columbus’s voyage.'],
    ['Durante siglos, muchas personas buscaron ciudades de oro: Cíbola, El Dorado, Paititi.', 'For centuries people searched for cities of gold: Cíbola, El Dorado, Paititi.'],
    ['Nadie las encontró.', 'No one ever found them.'],
    ['Elena Robles las buscó toda su vida… y encontró otra cosa.', 'Elena Robles searched all her life… and found something else.'],
    [`Una familia en siete ciudades: ${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}.`, 'A family in seven cities.'],
    ['Y una octava ciudad, muy lejos, con un puente muy largo: Lethbridge.', 'And an eighth city, far away, with a very long bridge: Lethbridge.'],
    ['Las siete ciudades de oro eran su familia. Y la octava eres tú.', 'The seven cities of gold were her family. And the eighth is you.']
  ];
}
async function playCinematic() {
  const C = $('cine');
  $('sceneSvg').style.display = 'none'; $('puzzle').hidden = true;
  C.hidden = false;
  C.innerHTML = `<div class="subs" id="subs">…</div><button class="btn ghost small skip" type="button" id="skipCine">Saltar ⏭</button>`;
  let skip = false; const skipP = new Promise(r => $('skipCine').addEventListener('click', () => { skip = true; r(); }));
  const ok = SPEED < 0.1 ? false : await loadThree();
  const stage = ok ? threeScene(C) : svgScene(C);
  const lines = cineLines();
  const run = (async () => {
    for (let k = 0; k < lines.length && !skip; k++) {
      const [es, en] = lines[k];
      $('subs').innerHTML = `${esc(es)}<span class="en">${esc(en)}</span>`;
      stage.beat(k, lines.length);
      speak(es);
      await sleep(Math.max(4200, es.length * 85));
    }
  })();
  await Promise.race([run, skipP]);
  try { speechSynthesis.cancel(); } catch (e) {}
  stage.stop();
  C.hidden = true; C.innerHTML = ''; $('sceneSvg').style.display = '';
}
function svgScene(C) {
  startArt();
  const pts = [...S.G.route.slice(0, 7), 'lethbridge'].map(id => proj(cityOf(id).ll));
  const svg = document.createElement('div');
  svg.innerHTML = `<svg class="fallback" viewBox="0 0 760 428">${defsOut()}${SCENES.granada().back}<g id="cmap" opacity="0">${pts.map(([x, y], k) => `<circle cx="${x}" cy="${y * 0.55 + 20}" r="${k === 7 ? 9 : 6}" fill="#FFE7A8"><animate attributeName="r" values="${k === 7 ? '8;12;8' : '5;8;5'}" dur="2s" repeatCount="indefinite"/></circle>`).join('')}<path d="M${pts.map(([x, y]) => `${x} ${y * 0.55 + 20}`).join(' L')}" fill="none" stroke="#FFC27A" stroke-width="2" stroke-dasharray="4 6"/></g></svg>`;
  C.prepend(svg.firstChild);
  return { beat(k) { if (k >= 4) C.querySelector('#cmap').setAttribute('opacity', '1'); }, stop() {} };
}
function threeScene(C) {
  const T = window.THREE;
  const canvas = document.createElement('canvas'); C.prepend(canvas);
  const W = C.clientWidth || 760, H = Math.round(W * 9 / 16);
  const R = new T.WebGLRenderer({ canvas, antialias: true });
  R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); R.setSize(W, H, false);
  R.outputEncoding = T.sRGBEncoding; R.shadowMap.enabled = true;
  const scene = new T.Scene();
  scene.fog = new T.Fog(0x2A1E4A, 30, 90);
  const cam = new T.PerspectiveCamera(50, 16 / 9, 0.1, 200);
  // sky dome with a dusk gradient
  const sk = document.createElement('canvas'); sk.width = 4; sk.height = 256; const sg = sk.getContext('2d'), gr = sg.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#0E0A2A'); gr.addColorStop(0.38, '#3A2A6E'); gr.addColorStop(0.5, '#B0608E'); gr.addColorStop(0.56, '#F0A070'); gr.addColorStop(1, '#2A1E4A'); sg.fillStyle = gr; sg.fillRect(0, 0, 4, 256);
  scene.add(new T.Mesh(new T.SphereGeometry(120, 32, 16), new T.MeshBasicMaterial({ map: new T.CanvasTexture(sk), side: T.BackSide, fog: false })));
  scene.add(new T.HemisphereLight(0xFFD9B0, 0x2A1E4A, 0.55));
  const sun = new T.DirectionalLight(0xFFC27A, 1.0); sun.position.set(-20, 30, 15); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30 }); scene.add(sun);
  const marble = new T.MeshStandardMaterial({ color: 0xE8D8BE, roughness: 0.55 });
  const floor = new T.Mesh(new T.PlaneGeometry(80, 80), new T.MeshStandardMaterial({ color: 0xC8B090, roughness: 0.8 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  // the pool channels (cross) like the Patio de los Leones
  const water = new T.MeshStandardMaterial({ color: 0x3E8EB8, roughness: 0.1, metalness: 0.3, emissive: 0x0A2A44 });
  [[0.8, 36], [36, 0.8]].forEach(([w, d]) => { const m = new T.Mesh(new T.BoxGeometry(w, 0.06, d), water); m.position.y = 0.02; scene.add(m); });
  // arcades on four sides: slender columns with arches
  const arch = new T.Group();
  const colG = new T.CylinderGeometry(0.17, 0.2, 4.2, 14), capG = new T.BoxGeometry(0.5, 0.3, 0.5), arcG = new T.TorusGeometry(0.8, 0.13, 8, 28, Math.PI);
  const glowM = new T.MeshBasicMaterial({ color: 0xFFC77A });
  const sides = [[0, -14, 0], [0, 14, Math.PI], [-14, 0, Math.PI / 2], [14, 0, -Math.PI / 2]];
  sides.forEach(([x, z, ry]) => {
    const side = new T.Group(); side.position.set(x, 0, z); side.rotation.y = ry;
    for (let k = -7; k <= 7; k++) {
      const c = new T.Mesh(colG, marble); c.position.set(k * 1.9, 2.1, 0); c.castShadow = true; side.add(c);
      const cp = new T.Mesh(capG, marble); cp.position.set(k * 1.9, 4.3, 0); side.add(cp);
      if (k < 7) { const a = new T.Mesh(arcG, marble); a.position.set(k * 1.9 + 0.95, 4.3, 0); side.add(a); }
      if (k % 2 === 0 && k < 7) { const w = new T.Mesh(new T.PlaneGeometry(0.5, 1.1), glowM); w.position.set(k * 1.9 + 0.95, 2.4, -2.15); side.add(w); }
    }
    const wall = new T.Mesh(new T.BoxGeometry(30, 2.6, 0.6), new T.MeshStandardMaterial({ color: 0xD8B48A, roughness: 0.7 })); wall.position.set(0, 6.45, 0); side.add(wall);
    const roof = new T.Mesh(new T.BoxGeometry(30, 0.3, 3.4), new T.MeshStandardMaterial({ color: 0x8A4A2A, roughness: 0.8 })); roof.position.set(0, 7.85, -1.2); side.add(roof);
    const back = new T.Mesh(new T.BoxGeometry(30, 6, 0.4), new T.MeshStandardMaterial({ color: 0x4A3060, roughness: 0.9 })); back.position.set(0, 3, -2.4); side.add(back);
    arch.add(side);
  });
  scene.add(arch);
  // the fountain: twelve lions, a basin, a bowl
  const lionM = new T.MeshStandardMaterial({ color: 0xEADFCB, roughness: 0.6 });
  for (let k = 0; k < 12; k++) {
    const a = k * Math.PI / 6, g = new T.Group();
    const body = new T.Mesh(new T.BoxGeometry(0.5, 0.6, 0.9), lionM); body.position.y = 0.3; body.castShadow = true; g.add(body);
    const head = new T.Mesh(new T.SphereGeometry(0.3, 16, 12), lionM); head.position.set(0, 0.75, 0.35); g.add(head);
    g.position.set(Math.cos(a) * 1.6, 0, Math.sin(a) * 1.6); g.rotation.y = -a + Math.PI / 2; scene.add(g);
  }
  const basin = new T.Mesh(new T.CylinderGeometry(2.2, 2.4, 0.4, 40), marble); basin.position.y = 1.1; basin.castShadow = true; scene.add(basin);
  const bowl = new T.Mesh(new T.CylinderGeometry(1.0, 0.3, 0.5, 32), marble); bowl.position.y = 1.9; scene.add(bowl);
  // Elena's medallion
  const goldM = new T.MeshStandardMaterial({ color: 0xE9A93A, metalness: 0.9, roughness: 0.25, emissive: 0x3A2000 });
  const medal = new T.Group();
  const disc = new T.Mesh(new T.CylinderGeometry(0.7, 0.7, 0.08, 48), goldM); disc.rotation.x = Math.PI / 2; medal.add(disc);
  for (let k = 0; k < 7; k++) { const a = k * 2 * Math.PI / 7, s = new T.Mesh(new T.CylinderGeometry(0.13, 0.13, 0.1, 20), new T.MeshStandardMaterial({ color: 0xFBD98C, metalness: 0.7, roughness: 0.3, emissive: 0x553300 })); s.rotation.x = Math.PI / 2; s.position.set(Math.cos(a) * 0.45, Math.sin(a) * 0.45, 0.05); medal.add(s); }
  medal.position.set(0, 2.3, 0); scene.add(medal);
  const glow = new T.PointLight(0xFFC27A, 0, 12); glow.position.set(0, 2.6, 0.6); scene.add(glow);
  // the family map: eight stars over the fountain
  const ids = [...S.G.route.slice(0, 7), 'lethbridge'];
  const starM = new T.MeshBasicMaterial({ color: 0xFFE7A8 });
  const raw = ids.map(id => proj(cityOf(id).ll)), xs = raw.map(p => p[0]), ys = raw.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), sc3 = 11 / Math.max(1, x1 - x0, (y1 - y0) * 1.6);
  const targets = raw.map(([x, y]) => new T.Vector3((x - (x0 + x1) / 2) * sc3, 6.4 - (y - (y0 + y1) / 2) * sc3, -1));
  const stars3 = ids.map((id, k) => { const m = new T.Mesh(new T.SphereGeometry(k === 7 ? 0.28 : 0.18, 16, 12), starM); m.position.copy(medal.position); m.visible = false; scene.add(m); return m; });
  const lineGeo = new T.BufferGeometry().setFromPoints(targets); const line = new T.Line(lineGeo, new T.LineBasicMaterial({ color: 0xFFC27A, transparent: true, opacity: 0 })); scene.add(line);
  let beat = 0, t0 = performance.now(), alive = true, beatT = t0;
  const camPath = [[0, 2.6, 12.5, 0, 3.4, 0], [7, 3.4, 9, 0, 2, 0], [3, 2.6, 5.5, 0, 2.3, 0], [0, 2.8, 4.2, 0, 2.6, 0], [0, 4.6, 11, 0, 5.4, -1], [0, 5, 12, 0, 6, -1], [0, 5.4, 12.5, 0, 6.2, -1]];
  const cur = new T.Vector3(...camPath[0].slice(0, 3)), look = new T.Vector3(...camPath[0].slice(3)), lk = look.clone();
  const loop = now => {
    if (!alive) return;
    const p = camPath[Math.min(beat, camPath.length - 1)];
    cur.lerp(new T.Vector3(p[0], p[1], p[2]), 0.012); lk.lerp(new T.Vector3(p[3], p[4], p[5]), 0.02);
    cam.position.copy(cur); cam.lookAt(lk);
    const t = (now - t0) / 1000;
    medal.rotation.y = t * 0.6;
    if (beat >= 3) { medal.position.y += (3.2 - medal.position.y) * 0.02; glow.intensity += (2.2 - glow.intensity) * 0.03; }
    if (beat >= 4) {
      const k0 = (now - beatT) / 1000;
      stars3.forEach((m, k) => { const show = k < 7 ? k0 > k * 0.5 : beat >= 5; if (show) { m.visible = true; m.position.lerp(targets[k], 0.04); m.scale.setScalar(1 + Math.sin(t * 3 + k) * 0.15); } });
      line.material.opacity += ((beat >= 5 ? 0.9 : 0.4) - line.material.opacity) * 0.03;
    }
    R.render(scene, cam);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  return { beat(k) { beat = k; beatT = performance.now(); if (k === 4 || k === 6) SFX.play('star'); }, stop() { alive = false; R.dispose(); } };
}

/* ---------- hints in Granada ---------- */
function finaleHint() {
  S.hints++;
  if (S.phase === 'warrant') {
    const known = S.traits.map(t => t.k), left = S.G.suspects.filter(s => S.traits.every(t => s.f[t.k] === t.v)).length;
    fb('info', 'Compara las pistas con los sospechosos.', `${left === 1 ? 'Only one suspect matches every clue.' : `${left} suspects match the clues you have.`} Features you know: ${known.map(k => FEATS[k].label.toLowerCase()).join(', ')}.`);
  } else if (S.phase === 'duel') fb('info', 'Lee la frase con atención: ¿qué prueba dice lo contrario?', 'Find the card that shows the claim is false: a witness, a letter, or the Archivo.');
  else fb('info', 'Abre el Archivo: cada ciudad tiene un año.', 'Each city in the Archivo has a year next to its event. Match the seal to the year.');
}

/* ---------- the end ---------- */
function endGame(won) {
  S.phase = 'end'; S.busy = false;
  closePuzzle(); document.querySelector('.gemcard')?.remove();
  setActions([]); $('codeBox').hidden = true;
  setTask(won ? '¡Felicidades! Your results are below.' : 'The thief got away this time. Your results are below.');
  const G = S.G, F = S.finale || {};
  const rows = G.route.slice(0, 7).map((id, k) => [k < S.i || (k === S.i && S.stopStars[k]) ? `${k + 1}. ${CITIES[id].name}` : `${k + 1}. ¿…?`, S.stopStars[k] || 0]);
  rows.push(['Granada: el ladrón', won ? F.warrant || 1 : 0], ['Granada: las pruebas', won ? F.duel || 1 : 0], ['Granada: el medallón', won ? F.lock || 1 : 0]);
  const gems = S.gems.size + (S.gemsPrior || 0), arch = S.arch.size + (S.archPrior || 0), left = hoursLeft();
  const badges = [
    ['Detective', 'Named the thief on the first try', won && F.accuse === 1],
    ['Memoria de elefante', 'Answered three ¿Te acuerdas? questions correctly', S.rem >= 3],
    ['Cazador de datos', 'Found ten new Datos in the cities', gems >= 10],
    ['Archivista', 'Read the long Archivo text for five cities', arch >= 5],
    ['Sin escalas', 'Never took a wrong flight', won && S.wrong === 0],
    ['Contrarreloj', 'Reached the end with a day or more to spare', won && left >= 24]
  ];
  const list = G.route.slice(0, 7).map((id, k) => k < S.i || (won && k < 7) ? `<b>${esc(CITIES[id].name)}</b> · ${esc(CITIES[id].symName)} · <i>${esc(CITIES[id].archivo.year)}: ${esc(CITIES[id].archivo.event)}</i>` : null).filter(Boolean);
  if (won) list.push(`<b>Granada</b> · ${esc(G.suspects[G.culprit].name)} · Elena’s seven cities of gold were her family.`);
  renderSummary($('summary'), {
    eyebrow: 'Español 20-3Y · Las siete ciudades de oro', title: won ? '¡Encontraste las siete ciudades!' : 'El ladrón escapó…',
    stats: [[`${Math.floor(left)} h`, 'Horas de sobra'], [`${S.seals.length}/7`, 'Sellos'], [gems, 'Datos nuevos'], [S.glos.size, 'Palabras del glosario']],
    rows, badges, listTitle: 'Tu viaje', list,
    outcomes: OUTCOMES,
    onAgain: () => start()
  });
}
const OUTCOMES = 'Outcomes practised (20-3Y): LC–2.1 a (understand short, simple oral texts) · LC–3.1 a (main point and supporting details of written texts) · LC–3.3 a (meaning from visual elements) · LC–4.3 a (regional variation: greetings, voseo, local words) · A–4.1 c (discover relationships and patterns) · A–4.2 b (compare and contrast in simple ways) · A–4.3 a, b (describe a problem, use the steps of problem solving) · A–5.3 a (personal enjoyment: games) · GC–1.1 b (connections with their own culture) · GC–1.2 b (explore elements of Spanish-speaking cultures) · GC–1.4 a (diversity between groups within Spanish-speaking cultures) · GC–2.1 b (English words borrowed from Spanish) · GC–2.2 a (different words for the same thing) · GC–2.4 a (speakers of one language from different cultural backgrounds).';
window.citySVGtest = id => citySVG(id, { wits: (CITIES[id] && CITIES[id].wit) || [] });
window.__scene = { S, makeGame, suspectsOk, resumeEncode, resumeDecode, currentCode, start, CITIES, POOL, flightHrs, advance, clockText, gl, GFORM, runPuzzle, buildClaims, accuse, endGame, timeUp, playCinematic };
