/* impersonal se (Se cambia la pantalla / Se cambian las piezas) and pronominal se in the report */
const SE_V = 'cambia|cambian|repara|reparan|arregla|arreglan|seca|secan|limpia|limpian|revisa|revisan|abre|abren|pone|ponen|necesita|necesitan|tiene que|tienen que|debe|deben|puede|pueden|tarda|cobra|cobran|cambio|reparo|arreglo|seco|limpio|cambiaron|repararon|secaron|limpiaron';
function analyzeSe(raw) {
  const n = norm(raw), r = { imp: [], slips: [] };
  const re = new RegExp('(?:^| )se (' + SE_V + ')(?=$| )(?: (el|la|los|las|un|una|unos|unas)(?= ))?(?: ([a-z]+))?', 'g'); let m;
  while ((m = re.exec(n))) {
    const v = m[1], det = m[2] || '', noun = m[3] || '', vPl = /(n|n que|aron)$/.test(v) || /^(tienen que|deben|pueden)$/.test(v), nPl = /^(los|las|unos|unas)$/.test(det) || (det && /s$/.test(noun));
    r.imp.push(m[0].trim());
    if (det && vPl !== nPl && !/^(tarda|cobra|puede|debe|tiene que)$/.test(v)) r.slips.push({ wrote: `se ${v} ${det} ${noun}`, fix: `se ${vPl ? v.replace(/n( que)?$/, '$1').replace(/aron$/, 'ó') : v.replace(/^(\w+?)( que)?$/, (a, b, c) => b + 'n' + (c || ''))} ${det} ${noun}`, note: nPl ? 'Plural noun: se cambian las…' : 'Singular noun: se cambia la…' });
  }
  r.pron = (n.match(/(?:^| )se (?:le |me |te |nos |les )?(?:[a-z]+(?:o|aron|ieron|io|a|an))(?= |$)/g) || []).length;
  return r;
}

/* ============ the shop and the pictures (PixiJS) ============ */
let SHOP = null, PIC = null;
const GEMS = [
  { id: 'metrocable', t: 'El Metrocable', pos: [560, 250], es: 'En 2004, Medellín abrió el Metrocable: fue el primer teleférico del mundo usado como transporte público. Conecta los barrios de las montañas con el metro.', en: 'Medellín’s Metrocable (2004) was the first cable car in the world built as everyday public transport, linking hillside neighbourhoods to the metro.' },
  { id: 'comuna13', t: 'La Comuna 13', pos: [250, 440], es: 'La Comuna 13 tiene escaleras eléctricas al aire libre y muchísimos grafitis. Hoy es un barrio lleno de arte, música y turistas.', en: 'Comuna 13 has outdoor escalators up the hillside and walls covered in murals. Once one of the city’s most dangerous areas, it is now known for its street art and hip-hop.' },
  { id: 'primavera', t: 'La eterna primavera', pos: [1420, 573], es: 'A Medellín la llaman «la ciudad de la eterna primavera» porque hace buen tiempo todo el año: más o menos veintidós grados.', en: 'Medellín is called the City of Eternal Spring: it is mild all year, around 22 °C, because of its altitude in the Andes.' },
  { id: 'silleteros', t: 'La Feria de las Flores', pos: [1040, 300], es: 'En agosto se celebra la Feria de las Flores. Los silleteros llevan en la espalda enormes arreglos de flores.', en: 'Every August, the Feria de las Flores: silleteros parade carrying huge flower arrangements on wooden frames on their backs.' },
  { id: 'tinto', t: 'El tinto', pos: [1180, 610], es: 'En Colombia, un «tinto» es un café negro pequeño, ¡no es vino! Se toma a cualquier hora del día.', en: 'In Colombia a tinto is a small black coffee, not red wine. People drink it all day long.' },
  { id: 'parce', t: '¿Qué más, parce?', pos: [300, 745], es: '«¿Qué más, parce?» es un saludo paisa: significa «¿Qué tal, amigo?». Los paisas son la gente de Antioquia y de Medellín.', en: '“¿Qué más, parce?” is a paisa greeting: “How’s it going, mate?”. Paisas are the people of Antioquia, the region around Medellín.' },
];
async function buildShop() {
  clearLayer('shop'); const L = PX.layers.shop;
  await svgSprite('hills', [hillsSVG(700, 400, 2), 700, 400], { ax: 0, ay: 0, x: 110, y: 110, parent: L, z: 1 });
  const cable = new PIXI.Graphics().lineStyle(4, 0x3A3F4C).moveTo(110, 190).lineTo(810, 330); cable.zIndex = 2; L.addChild(cable);
  const cabins = [];
  for (let i = 0; i < 3; i++) { const c = await svgSprite('cab' + i, cabinSVG([PAL.red, PAL.yellow, PAL.blue][i]), { ax: .5, ay: 0, parent: L, z: 2 }); setScale(c, .55); c.__t = i / 3; cabins.push(c); }
  const stopCab = loop(() => { cabins.forEach(c => { c.__t = (c.__t + PX.app.ticker.deltaMS / 26000) % 1; c.x = 110 + c.__t * 700; c.y = 190 + c.__t * 140; }); });
  const wall = await svgSprite('wall', shopWallSVG(), { ax: 0, ay: 0, parent: L, z: 3 }); wall.__stop = stopCab;
  await svgSprite('silletero', posterSilleteroSVG(), { x: 1040, y: 340, parent: L, z: 4 }).then(s => setScale(s, .9));
  await svgSprite('primavera', primaveraSVG(), { x: 1420, y: 585, parent: L, z: 4 }).then(s => setScale(s, .8));
  const cust = new PIXI.Container(); cust.x = 1900; cust.y = 655; cust.zIndex = 10; L.addChild(cust);
  await svgSprite('counter', counterSVG(), { ax: 0, ay: 0, x: 0, y: 610, parent: L, z: 20 });
  await svgSprite('sticker', stickerSVG(), { x: 300, y: 745, parent: L, z: 21 }).then(s => { setScale(s, .9); s.rotation = -.06; });
  await svgSprite('tinto', tintoSVG(), { x: 1180, y: 610, parent: L, z: 21 });
  const phone = await svgSprite('phone-counter', phoneSVG(), { x: 900, y: 650, parent: L, z: 22 }); setScale(phone, .5); phone.rotation = 1.45; phone.alpha = 0;
  const mouths = { open: await svgSprite('mouth-o', mouthSVG(true), { parent: cust }), shut: await svgSprite('mouth-c', mouthSVG(false), { parent: cust }) };
  GEMS.forEach(g => sparkle(L, g.pos[0], g.pos[1], () => openGem(g)));
  SHOP = { L, cust, phone, mouths, bust: null, damageFx: null };
  loop(t => { if (!SHOP.bust) return; const talking = state.speakingCust; SHOP.mouths.open.visible = talking && Math.sin(t * 22) > -.2; SHOP.mouths.shut.visible = !SHOP.mouths.open.visible; SHOP.cust.y = 655 + Math.sin(t * 1.6) * 3; });
}
async function setCustomer(c) {
  if (SHOP.bust) { SHOP.bust.destroy(); SHOP.bust = null; }
  const b = await svgSprite('bust-' + c.id, bustSVG(c), { ax: .5, ay: 1, x: 0, y: 0, parent: SHOP.cust });
  SHOP.cust.addChildAt(b, 0); SHOP.bust = b;
  [SHOP.mouths.open, SHOP.mouths.shut].forEach(m => { m.x = 0; m.y = -560 + 296; SHOP.cust.addChild(m); });
  SHOP.cust.x = 1900; await tween(SHOP.cust, { x: 820 }, 1100, 'out');
}
async function customerLeaves() { await tween(SHOP.cust, { x: -400 }, 1100, 'in'); SHOP.phone.alpha = 0; if (SHOP.damageFx) { SHOP.damageFx.destroy(); SHOP.damageFx = null; } }
function showLayer(name) { ['shop', 'picture', 'closeup'].forEach(k => PX.layers[k].visible = k === name || (name === 'closeup' && k === 'shop')); }

const applyState = (sp, st) => { sp.x = st.x ?? sp.x; sp.y = st.y ?? sp.y; sp.alpha = st.a ?? 1; sp.rotation = st.r ?? 0; setScale(sp, st.s ?? 1); sp.tint = 0xFFFFFF; };
async function buildPicture(key) {
  clearLayer('picture'); const L = PX.layers.picture, C = CASES[key];
  const root = new PIXI.Container(); root.pivot.set(W / 2, H / 2); root.position.set(W / 2, H / 2); root.sortableChildren = true; L.addChild(root);
  await svgSprite('bg-' + key, C.bg(), { ax: 0, ay: 0, parent: root, z: 0 });
  const S = { root };
  for (const [i, o] of C.objs.entries()) if (o.art) { const sp = await svgSprite('o-' + key + '-' + o.id, o.art(), { ax: .5, ay: o.ay ?? .5, parent: root, z: 5 + i }); S[o.id] = sp; applyState(sp, o.pic); }
  if (C.objs.some(o => o.rain)) {
    const g = new PIXI.Graphics(); g.zIndex = 30; root.addChild(g); S.rain = g;
    const drops = Array.from({ length: 160 }, () => [rnd(0, W), rnd(0, H)]);
    g.__stop = loop(() => { g.clear(); g.lineStyle(3, 0xDDEEFF, .55); drops.forEach(d => { d[1] += 18 * PX.app.ticker.deltaMS / 16; d[0] -= 4; if (d[1] > H) { d[1] = -20; d[0] = rnd(0, W + 200); } g.moveTo(d[0], d[1]).lineTo(d[0] - 6, d[1] + 26); }); });
  }
  const fl = new PIXI.Graphics().beginFill(0xFFFFFF).drawRect(0, 0, W, H).endFill(); fl.alpha = 0; fl.zIndex = 80; root.addChild(fl);
  S.flash = () => { fl.alpha = .85; tween(fl, { alpha: 0 }, 500); };
  const frame = new PIXI.Graphics().lineStyle(18, 0xFFF8EC).drawRoundedRect(9, 9, W - 18, H - 18, 26); frame.zIndex = 90; root.addChild(frame);
  PIC = { key, S, C, root };
  return S;
}
function hotPos(o, S) {
  if (o.abs) return o.abs;
  const base = S[o.on || o.id]; if (!base) return [W / 2, H / 2];
  if (o.hot) return [base.x + o.hot[0], base.y + o.hot[1]];
  const ay = base.anchor.y, ax = base.anchor.x; return [base.x + (.5 - ax) * base.width, base.y + (.5 - ay) * base.height];
}
function resetForStory(S, C) { C.objs.forEach(o => { if (o.art && S[o.id]) applyState(S[o.id], Object.assign({}, o.pic, o.start || {})); }); if (S.rain) S.rain.alpha = C.objs.find(o => o.rain) ? 0 : 1; }
function clearLabels() { PIC && PIC.root.children.filter(c => c.__label || c.__hot).forEach(c => { if (c.__stop) c.__stop(); c.destroy({ children: true }); }); }

/* ============ panels ============ */
let ROUND = null;
const MISSIONS = () => [...(SESSION_CUST || []).map((c, i) => [`c${i}`, `Cliente ${i + 1}: ${c.name}`]), ['informe', 'El informe del día']];
let SESSION_CUST = null;
function renderMissions(cur) { $id('missionList').innerHTML = MISSIONS().map(([id, t]) => { const m = session.missions.find(x => x.id === id); return `<li class="${m ? 'done' : id === cur ? 'cur' : ''}"><span>${esc(t)}</span><span class="stars">${m ? starStr(m.stars) : ''}</span></li>`; }).join('') || '<li>…</li>'; }
function finishMission(id, title, stars) { stars = Math.max(1, Math.min(3, stars)); session.missions.push({ id, title, stars }); renderMissions(); try { SFX.play('mission'); } catch (e) {} }
const BANK = [];
function renderBank() { $id('bankList').innerHTML = BANK.length ? BANK.map(w => `<li class="wb ${w.cat}"><button type="button" class="aplay small" data-w="${esc(w.word)}">▶</button><span>${esc(w.word)}</span></li>`).join('') : '<li class="empty">Words you find in the pictures collect here.</li>'; $id('bankList').querySelectorAll('[data-w]').forEach(b => b.addEventListener('click', () => talk([b.dataset.w], CAST.narr, { replay: true }))); $id('bankCount').textContent = BANK.length; }
const found = new Set();
function renderGems() { $id('gemCount').textContent = `${found.size}/6`; $id('gemList').innerHTML = GEMS.map(g => `<li class="${found.has(g.id) ? 'on' : ''}">${found.has(g.id) ? '✦' : '·'} ${found.has(g.id) ? esc(g.t) : '???'}</li>`).join(''); }
function openGem(g) { found.add(g.id); renderGems(); $id('gemEs').textContent = g.es; $id('gemEn').textContent = g.en; $id('gemCard').hidden = false; talk([g.es], CAST.fabio); try { SFX.play('star'); } catch (e) {} }
function renderOrder(o = {}) {
  const el = $id('orden'); if (!ROUND) { el.innerHTML = '<p class="keyhelp">The work order for each customer appears here.</p>'; return; }
  const row = (k, label, v) => `<div class="orow ${v ? 'ok' : ''}"><span>${label}</span><b>${v ? esc(v) : '—'}</b></div>`;
  el.innerHTML = `<p class="otitle">📋 ${esc(ROUND.cust.name)} · ${esc(CASES[ROUND.key].title)}</p>${row('when', '¿Cuándo pasó?', o.when)}${row('after', '¿Qué hizo después?', o.after)}${row('bought', '¿Cuándo lo compró?', o.bought)}${row('dmg', 'Avería', o.dmg)}${row('fix', 'Reparación', o.fix)}`;
}

/* ============ 6 · THE DAY ============ */
async function startGame() {
  session = newSession(); found.clear(); BANK.length = 0; clearFb(); ia(''); hideGo();
  $id('summary').hidden = true; $id('summary').innerHTML = '';
  const keys = shuffle(Object.keys(CASES)).slice(0, 3); SESSION_CUST = shuffle(CUSTOMERS).slice(0, 3);
  session.rounds = [];
  renderMissions('c0'); renderGems(); renderBank(); ROUND = null; renderOrder();
  showLayer('shop');
  await talk(['¡Hola! Soy Lucía. ¡Saludos desde Medellín!', 'Hoy vas a trabajar en un taller de reparación de celulares, con mi amigo Fabio.', 'Primero mirarás una foto de lo que pasó; después escucharás la historia del cliente, harás preguntas y dirás cómo se repara el celular.'], CAST.lucia);
  await talk(['¡Qué más, parce! Bienvenido al taller. Aquí se reparan celulares de toda la ciudad.', '¡Mire, ahí viene el primer cliente!'], CAST.fabio);
  for (let i = 0; i < 3; i++) await customerRound(i, keys[i]);
  await missionReport();
  showLayer('shop');
  await talk(['¡Qué buen trabajo! Medellín ya es un poco tuya.', 'Mi próximo destino: Barcelona, en España. ¡Allí te espera una feria de trabajo de verano!'], CAST.lucia);
  endSession();
}

async function customerRound(i, key) {
  const C = CASES[key], cust = SESSION_CUST[i], voice = { name: cust.name, pitch: cust.pitch, rate: cust.rate, cust: true };
  ROUND = { i, key, cust, voice, issues: 0, order: {} }; renderOrder(); renderMissions(`c${i}`);
  clearFb(); ia(''); hideGo(); showLayer('shop');
  setTask(`Customer ${i + 1} of 3 is coming in. Listen.`, `Cliente ${i + 1}`);
  await setCustomer(cust);
  SHOP.phone.alpha = 1;
  await talk(['¡Buenas! ¿Qué más?', 'Mire, se me dañó el celular. Le muestro una foto de dónde pasó.'], voice);
  // 1 · PWIM: the picture
  const S = await buildPicture(key); showLayer('picture'); PX.layers.picture.alpha = 0; await tween(PX.layers.picture, { alpha: 1 }, 500);
  await pwimLabel(C, S);
  // 2 · PWIM: sort the words
  await pwimSort(C);
  // 3 · CI: the story over the animated picture
  clearLabels(); ia(''); clearFb();
  setTask(`Now listen to ${esc(cust.name)}’s story. Watch the picture: it shows what happens.`, 'La historia');
  setHelp('Listen for what happened, step by step. The picture moves with the story. Replay with ⟲ Repetir.');
  resetForStory(S, C); await wait(500);
  for (const st of C.story) { await Promise.all([talk([st.es], voice), st.act(S)]); await wait(250); }
  await wait(600);
  // 4 · examine the phone
  showLayer('shop');
  await examine(C);
  // 5 · build the conversation (who said what, in what order)
  await chatBuilder(C, voice);
  await customerLeaves();
  const stars = ROUND.issues <= 1 ? 3 : ROUND.issues <= 3 ? 2 : 1;
  session.rounds.push({ key, cust: cust.name, issues: ROUND.issues, order: ROUND.order });
  finishMission(`c${i}`, `Cliente ${i + 1}: ${cust.name}`, stars);
}

/* ---- PWIM step 1: find and label the words in the picture ---- */
function pwimLabel(C, S) {
  const words = C.objs.filter(o => o.word); let n = 0; const placed = [];
  setTask(`Picture study. Find the <b>${words.length} things</b> in the picture: click on people, things, places and actions. You’ll hear each word and see its label. <span class="cnt" id="pwCnt">0/${words.length}</span>`, 'La foto · Palabras');
  setHelp(() => { const left = words.filter(o => !o.__done); if (!left.length) return 'All found!'; const o = left[0], [x, y] = hotPos(o, S); const rg = ring(S.root, x, y, 50); rg.__label = true; setTimeout(() => { if (!rg.destroyed) { rg.__stop(); rg.destroy(); } }, 4000); return 'Look where the ring is pulsing.'; });
  return new Promise(resolve => {
    words.forEach(o => {
      o.__done = false; const [x, y] = hotPos(o, S);
      const h = hotCircle(S.root, x, y, o.r || 55, async () => {
        if (o.__done) { talk([o.word], CAST.narr, { replay: true }); return; }
        o.__done = true; n++; const lb = labelBox(o.word, { accent: o.cat === 'acciones' ? 0xFF7AA8 : o.cat === 'lugares' ? 0xFFC27A : 0x5FE0C8 }); lb.__label = true; lb.x = x; lb.y = Math.max(50, y - (o.labelDy || 70));
        const bw = lb.width + 16, bh = lb.height + 10, hit = () => placed.some(q => Math.abs(q.x - lb.x) < (q.w + bw) / 2 && Math.abs(q.y - lb.y) < (q.h + bh) / 2);
        for (let k = 0; k < 12 && hit(); k++) { lb.y -= bh * .9; if (lb.y < 50) { lb.y = y + 60 + k * 20; lb.x += (k % 2 ? -1 : 1) * bw * .6; } }
        placed.push({ x: lb.x, y: lb.y, w: bw, h: bh });
        if (Math.abs(lb.y - y) > 110) { const ln = new PIXI.Graphics().lineStyle(3, 0xFFF8EC, .9).moveTo(x, y).lineTo(lb.x, lb.y); ln.zIndex = 58; ln.__label = true; S.root.addChild(ln); }
        lb.scale.set(0); S.root.addChild(lb); tween(lb, { s: 1 }, 400, 'back');
        const dot = new PIXI.Graphics().beginFill(0xFFFFFF).lineStyle(4, 0x17122E).drawCircle(0, 0, 9).endFill(); dot.x = x; dot.y = y; dot.zIndex = 59; dot.__label = true; S.root.addChild(dot);
        try { SFX.play('correct'); } catch (e) {}
        if (!BANK.some(b => b.word === o.word)) { BANK.push({ word: o.word, cat: o.cat }); renderBank(); }
        const c = $id('pwCnt'); if (c) c.textContent = `${n}/${words.length}`;
        talk([o.word], CAST.narr);
        if (n === words.length) { await wait(900); resolve(); }
      });
      h.__hot = true;
    });
    window.__pw = { words, S, hotPos };
  });
}
/* ---- PWIM step 2: sort the words into groups ---- */
function pwimSort(C) {
  const words = shuffle(C.objs.filter(o => o.word)); const place = {}; let sel = null, errors = 0;
  setTask('Sort the words into groups: <b>people and things</b>, <b>places</b>, <b>actions</b>. Click a word, then click its group. Press ▶ to hear a word again.', 'La foto · Clasificar');
  setHelp('Places answer “¿dónde?”. Actions are verbs: what happened (se cayó, corrió, mordió…). Everything else is a person or a thing.');
  return new Promise(resolve => {
    const draw = () => {
      const pool = words.filter(o => !place[o.id]);
      ia(`<div class="sortpool">${pool.map(o => `<button type="button" class="wchip${sel === o.id ? ' sel' : ''}" data-id="${o.id}">${esc(o.word)}</button>`).join('') || '<span class="keyhelp">All placed. Check your groups.</span>'}</div>
        <div class="buckets">${Object.entries(CATS).map(([k, t]) => `<div class="bucket" data-cat="${k}"><h4>${t}</h4>${words.filter(o => place[o.id] === k).map(o => `<button type="button" class="wchip in" data-id="${o.id}">${esc(o.word)}</button>`).join('')}</div>`).join('')}</div>
        <div class="row"><button class="btn primary" type="button" id="checkSort"${pool.length ? ' disabled' : ''}>Comprobar</button></div>`);
      $id('ia').querySelectorAll('.sortpool .wchip').forEach(b => b.addEventListener('click', () => { sel = b.dataset.id; talk([words.find(o => o.id === sel).word], CAST.narr, { replay: true }); draw(); }));
      $id('ia').querySelectorAll('.bucket .wchip').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); delete place[b.dataset.id]; draw(); }));
      $id('ia').querySelectorAll('.bucket').forEach(bk => bk.addEventListener('click', () => { if (!sel) return; place[sel] = bk.dataset.cat; sel = words.find(o => !place[o.id])?.id || null; try { SFX.play('soft'); } catch (e) {} draw(); }));
      const cb = $id('checkSort'); if (cb) cb.addEventListener('click', () => {
        const wrong = words.filter(o => place[o.id] !== o.cat);
        if (!wrong.length) { fb('ok', '¡Perfecto!', errors ? `All sorted (${errors} moved back).` : 'All sorted, first try!'); ROUND.issues += errors > 2 ? 1 : 0; session.stats.misses += errors; ia(''); resolve(errors); return; }
        errors += wrong.length; try { SFX.play('wrong'); } catch (e) {}
        fb('warn', `${words.length - wrong.length}/${words.length}`, 'The words that went back are in the wrong group. Try again.');
        wrong.forEach(o => delete place[o.id]); draw();
      });
    };
    draw();
  });
}

/* ---- examine the phone on the counter ---- */
async function examine(C) {
  setTask('Now <b>click the phone</b> on the counter to examine it.', 'La avería');
  setHelp('The phone is lying on the counter, in front of the customer.');
  window.__examine = true;
  const D = DAMAGE[C.damage];
  await new Promise(resolve => { const ph = SHOP.phone; const ring1 = ring(SHOP.L, ph.x, ph.y, 70); ring1.zIndex = 25; makeHot(ph, () => { ph.removeAllListeners(); ph.eventMode = 'none'; ring1.__stop(); ring1.destroy(); resolve(); }); window.__tapPhone = () => ph.emit('pointertap'); });
  window.__examine = false;
  const L = PX.layers.closeup; clearLayer('closeup'); PX.layers.closeup.visible = true;
  const dim = new PIXI.Graphics().beginFill(0x17122E, .78).drawRect(0, 0, W, H).endFill(); L.addChild(dim);
  const big = await svgSprite('close-' + C.damage, phoneCloseSVG(C.damage), { x: W / 2, y: H / 2 + 20, parent: L }); setScale(big, .1); await tween(big, { s: 1.0 }, 500, 'back');
  if (C.damage === 'crack') { const g = crack(L, W / 2 + 20, H / 2 - 40, 160); }
  const lb = labelBox(D.label, { size: 34, accent: 0xFF7AA8 }); lb.x = W / 2; lb.y = 70; L.addChild(lb);
  try { SFX.play('hint'); } catch (e) {}
  ROUND.order.dmg = D.label; renderOrder(ROUND.order);
  await talk([`Mmm… ${D.label}.`], CAST.fabio);
  await goButton('Cerrar ✕'); hideGo();
  await tween(L, { alpha: 0 }, 300); clearLayer('closeup'); L.alpha = 1; PX.layers.closeup.visible = false;
}
/* ---- build the conversation: sort each message to a side (customer left, technician right) and order it ---- */
function chatLines(C) {
  const D = DAMAGE[C.damage], st = C.story, [a, b, c] = C.chat || [0, 4, 5];
  const fix = C.damage === 'water' ? 'Mire, se seca el celular y se cambia la batería. Lo tiene listo mañana.' : C.damage === 'coffee' ? 'Mire, se limpia el parlante. Lo tiene listo mañana.' : `Mire, se cambia ${D.part}. Lo tiene listo mañana.`;
  return [
    ['c', '¡Buenas! Mire, se me dañó el celular.'], ['t', '¡Buenas! ¿Qué le pasó?'],
    ['c', st[a].es], ['c', st[b].es], ['c', st[c].es],
    ['t', '¡Uy, qué pesar! Primero, ¿cuándo pasó?'], ['c', ROUND.ans.when],
    ['t', '¿Y qué hizo después?'], ['c', C.after],
    ['t', 'Una última pregunta: ¿cuándo lo compró?'], ['c', ROUND.ans.bought],
    ['t', fix], ['c', '¡Qué bien! Muchas gracias.'],
  ].map(([side, es], idx) => ({ side, es, idx }));
}
function chatBuilder(C, voice) {
  ROUND.ans = { when: pick(WHEN), bought: pick(BOUGHT) };
  const lines = chatLines(C), N = lines.length, name = ROUND.cust.name, place = Array(N).fill(null), bad = new Set(), ok = new Set();
  const order = shuffle(lines.map(l => l.idx)); let checks = 0, sel = null;
  const whoOf = side => side === 'c' ? voice : CAST.fabio;
  setTask(`Rebuild the conversation between <b>${esc(name)}</b> and the technician. Drag each message into the chat: <b>left</b> if ${esc(name)} says it, <b>right</b> if the technician says it, in the order it happened. Press ▶ to hear a message. Then <b>Comprobar</b>.`, 'La conversación');
  setHelp(lvl => [`It starts with ${name} saying what’s wrong. The technician asks questions (¿…?), ${name} answers each one right after it.`, 'Look for clues: “Primero…”, “¿Y qué hizo después?”, “Una última pregunta…”. The story lines go in the order they happened. The repair comes near the end.'][Math.min(lvl, 1)]);
  return new Promise(resolve => {
    const bubble = (l, where, side) => `<div class="cb ${side ? (side === 'c' ? 'cust' : 'tech') : 'neutral'}${ok.has(l.idx) ? ' locked' : ''}${sel === l.idx ? ' sel' : ''}" data-idx="${l.idx}"><button class="cplay" type="button" data-p="${l.idx}" aria-label="Escuchar">▶</button><span>${esc(l.es)}</span></div>`;
    const draw = () => {
      const placed = new Set(place.filter(Boolean).map(p => p.idx));
      ia(`<div class="chatb">
        <div class="cpool" data-pool="1"><h4>Mensajes</h4>${order.filter(i => !placed.has(i)).map(i => bubble(lines[i])).join('') || '<p class="keyhelp">All placed. Press Comprobar.</p>'}</div>
        <div class="cphone"><div class="chead"><span class="cav">${esc(name[0])}</span><span><b>${esc(name)}</b><small>izquierda</small></span><span class="cright"><b>Técnico</b><small>derecha</small></span></div>
          <ol class="cthread">${place.map((p, r) => `<li class="crow${p && bad.has(r) ? ' bad' : ''}${p && ok.has(p.idx) ? ' good' : ''}" data-row="${r}"><div class="cz" data-row="${r}" data-side="c">${p && p.side === 'c' ? bubble(lines[p.idx], 'row', 'c') : ''}</div><div class="cz" data-row="${r}" data-side="t">${p && p.side === 't' ? bubble(lines[p.idx], 'row', 't') : ''}</div></li>`).join('')}</ol></div>
      </div><div class="row"><button class="btn primary" type="button" id="checkChat"${place.includes(null) ? ' disabled' : ''}>Comprobar</button><span class="keyhelp">Click a message, then click a spot, or drag it.</span></div>`);
      wire();
    };
    const findPlace = idx => place.findIndex(p => p && p.idx === idx);
    const drop = (idx, row, side) => {
      if (ok.has(idx)) return; const from = findPlace(idx);
      if (row == null) { if (from >= 0) { place[from] = null; bad.delete(from); } }
      else { const occ = place[row]; if (occ && ok.has(occ.idx)) return;
        if (from >= 0) { place[from] = occ && occ.idx !== idx ? { idx: occ.idx, side: occ.side } : null; bad.delete(from); }
        place[row] = { idx, side }; bad.delete(row); }
      sel = null; try { SFX.play('soft'); } catch (e) {} draw();
    };
    window.__chat = { lines, drop, get place() { return place; } };
    const wire = () => {
      const root = $id('ia');
      root.querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const l = lines[+b.dataset.p]; talk([l.es], whoOf(l.side), { replay: true }); }));
      root.querySelectorAll('.cz').forEach(z => z.addEventListener('click', () => { if (sel != null) drop(sel, +z.dataset.row, z.dataset.side); }));
      root.querySelector('.cpool').addEventListener('click', e => { if (sel != null && !e.target.closest('.cb')) drop(sel, null); });
      root.querySelectorAll('.cb:not(.locked)').forEach(el => el.addEventListener('pointerdown', e => {
        if (e.target.closest('[data-p]') || e.button > 0) return;
        e.preventDefault(); const idx = +el.dataset.idx, x0 = e.clientX, y0 = e.clientY, r0 = el.getBoundingClientRect(); let ghost = null, over = null, lastY = y0, scr = 0;
        const edge = () => { const v = window.innerHeight, d = lastY < 70 ? -14 : lastY > v - 70 ? 14 : 0; if (d) window.scrollBy(0, d); if (ghost) scr = requestAnimationFrame(edge); };
        const zoneAt = (x, y) => { const t = document.elementFromPoint(x, y); return t && (t.closest('.cz') || t.closest('.cpool')); };
        const mv = ev => {
          if (!ghost && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 6) return;
          lastY = ev.clientY;
          if (!ghost) { ghost = el.cloneNode(true); scr = requestAnimationFrame(edge); ghost.classList.add('ghost'); ghost.style.width = r0.width + 'px'; document.body.appendChild(ghost); el.classList.add('dragging'); }
          ghost.style.left = (ev.clientX - (x0 - r0.left)) + 'px'; ghost.style.top = (ev.clientY - (y0 - r0.top)) + 'px';
          const z = zoneAt(ev.clientX, ev.clientY); if (z !== over) { over && over.classList.remove('over'); over = z; over && over.classList.add('over'); }
          if (z && z.classList.contains('cz')) { ghost.classList.toggle('cust', z.dataset.side === 'c'); ghost.classList.toggle('tech', z.dataset.side === 't'); ghost.classList.remove('neutral'); }
          else { ghost.classList.remove('cust', 'tech'); ghost.classList.add('neutral'); }
        };
        const up = ev => {
          window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up);
          if (!ghost) { sel = sel === idx ? null : idx; draw(); return; }
          cancelAnimationFrame(scr); ghost.remove(); ghost = null; el.classList.remove('dragging'); over && over.classList.remove('over');
          const z = zoneAt(ev.clientX, ev.clientY);
          if (z && z.classList.contains('cz')) drop(idx, +z.dataset.row, z.dataset.side); else if (z) drop(idx, null); else draw();
        };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
      }));
      const cb = $id('checkChat'); if (cb) cb.addEventListener('click', async () => {
        checks++; bad.clear();
        place.forEach((p, r) => { if (p.idx === r && p.side === lines[r].side) ok.add(p.idx); else bad.add(r); });
        if (!bad.size) {
          fb('ok', '¡Perfecto!', checks === 1 ? 'Every message in the right place, first try.' : `All correct after ${checks} tries.`);
          ROUND.issues += Math.min(2, checks - 1); draw(); $id('checkChat').disabled = true; await finishChat(); resolve(); return;
        }
        try { SFX.play('wrong'); } catch (e) {}
        const wrongSide = [...bad].filter(r => place[r].side !== lines[place[r].idx].side).length;
        if (checks >= 3) {
          lines.forEach(l => { place[l.idx] = { idx: l.idx, side: l.side }; ok.add(l.idx); }); bad.clear(); ROUND.issues += 2; draw(); $id('checkChat').disabled = true;
          fb('info', 'La conversación correcta', 'Here is the conversation in order. Listen to it once.'); await finishChat(); resolve(); return;
        }
        fb('warn', `${N - bad.size}/${N}`, `The glowing messages are in the wrong place${wrongSide ? ` (${wrongSide} on the wrong side: who says it?)` : ''}. Green ones are locked in. Move the others and check again.`);
        draw();
      });
    };
    const finishChat = async () => {
      Object.assign(ROUND.order, { when: ROUND.ans.when.replace(/\.$/, ''), after: C.after.replace(/\.$/, ''), bought: ROUND.ans.bought.replace(/\.$/, ''), fix: lines[11].es.replace(/^Mire, /, '') }); renderOrder(ROUND.order);
      await wait(400);
      for (const l of lines) { const el = $id('ia').querySelector(`.cthread .cb[data-idx="${l.idx}"]`); el && el.classList.add('speaking'); el && el.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' }); await talk([l.es], whoOf(l.side)); el && el.classList.remove('speaking'); }
      await goButton('Siguiente →'); hideGo(); ia('');
    };
    draw();
  });
}

/* ---- the day's report: write from the word bank (PWIM: from words to sentences) ---- */
async function missionReport() {
  renderMissions('informe'); clearFb(); ia(''); hideGo(); showLayer('shop'); ROUND = null; renderOrder();
  await talk(['¡Qué día! Antes de cerrar, escribe el informe del día para el cuaderno del taller.', '¿Qué les pasó a los clientes? ¿Cómo se repararon los celulares?'], CAST.fabio);
  const names = SESSION_CUST.map(c => c.name);
  setTask(`Write the <b>day’s report</b> for the shop’s notebook, in the <b>preterite</b>. Use words from your <b>word bank</b> (click a word to add it).
    <ul class="checklist"><li>At least two of today’s customers (${names.map(esc).join(', ')})</li><li>What happened to their phones and how they were repaired</li><li>Five or more preterite verbs, and <b>se</b> at least twice (<i>se le cayó, se rompió, se cambió…</i>)</li><li>Six or more words from the word bank</li></ul>`, 'El informe del día');
  setHelp(lvl => [`Start: “A ${names[0]} se le cayó el celular en… La pantalla se rompió. Se cambió la pantalla.”`, 'Preterite, 3rd person: se le cayó, se mojó, se rompió, fue, dejó, puso, tropezó, mordió, se cambió, se secó, se limpió.'][Math.min(lvl, 1)]);
  composer({ multiline: true, rows: 7, placeholder: `A ${names[0]} se le cayó el celular…` });
  const inp = $id('inp'), chips = document.createElement('div'); chips.className = 'bankchips';
  chips.innerHTML = BANK.map(w => `<button type="button" class="wchip ${w.cat}">${esc(w.word)}</button>`).join('');
  $id('ia').querySelector('.composer').prepend(chips);
  chips.querySelectorAll('.wchip').forEach(b => b.addEventListener('click', () => { const s = inp.selectionStart ?? inp.value.length; const t = (s && !/\s$/.test(inp.value.slice(0, s)) ? ' ' : '') + b.textContent + ' '; inp.value = inp.value.slice(0, s) + t + inp.value.slice(s); inp.focus(); inp.setSelectionRange(s + t.length, s + t.length); b.classList.add('used'); }));
  let tries = 0;
  await waitSubmit(async raw => {
    youSaid(raw); session.stats.messages++; logLine('Tú', raw); tries++;
    const n = norm(raw);
    if (looksEnglish(n)) { fb('warn', 'En español, por favor', ''); return false; }
    const a = analyzePast(raw), se = analyzeSe(raw), wc = words(raw).length;
    const used = BANK.filter(w => n.includes(norm(w.word).replace(/^(el|la|los|las) /, ''))).length;
    const named = names.filter(nm => n.includes(norm(nm.replace(/^(Doña|Don) /, '')))).length;
    a.slips.slice(0, 3).forEach(s => fb('err', `<span class="fix"><s>${esc(s.wrote)}</s> → ${esc(s.fix)}</span>`, 'Preterite form'));
    a.accents.slice(0, 2).forEach(s => fb('warn', `<span class="fix"><s>${esc(s.wrote)}</s> → ${esc(s.fix)}</span>`, s.note || 'Accent'));
    accentTips(raw);
    const seCount = se.pron + se.imp.length;
    fb(a.pret.length >= 5 ? 'ok' : 'warn', `Pretérito: ${a.pret.length}`, a.pret.length >= 5 ? `${a.distinct} different verbs` : 'Use five or more preterite verbs.');
    fb(seCount >= 2 ? 'ok' : 'warn', `Se: ${seCount}`, seCount >= 2 ? '✓' : 'Use se at least twice: se le cayó, se rompió, se cambió…');
    fb(used >= 6 ? 'ok' : 'warn', `Banco de palabras: ${used}`, used >= 6 ? '✓' : 'Use six or more words from your word bank.');
    fb(named >= 2 ? 'ok' : 'warn', `Clientes: ${named}`, named >= 2 ? '✓' : `Write about at least two customers: ${names.join(', ')}.`);
    const met = a.pret.length >= 5 && seCount >= 2 && used >= 6 && named >= 2 && wc >= 35;
    if (wc < 35) fb('warn', 'Más, por favor', `A little longer (${wc} words).`);
    if (met || tries >= 3) {
      session.writing.push({ scene: 'El informe del día', text: raw }); session.details.report = { pret: a.pret.length, se: seCount, used, named };
      finishMission('informe', 'El informe del día', met ? (a.slips.length <= 1 ? 3 : 2) : 1); ia('');
      await talk(met ? ['¡Excelente informe, parce! Así da gusto.'] : ['Bueno, gracias. Mañana lo terminamos.'], CAST.fabio);
      return raw;
    }
    await talk(['¿Y qué más pasó? Cuénteme un poco más.'], CAST.fabio);
    return false;
  });
}

/* ============ 7 · END OF SESSION ============ */
function endSession() {
  stopSpeech(); hideGo();
  const mins = Math.max(1, Math.round((Date.now() - session.started) / 60000)), total = session.missions.reduce((a, m) => a + m.stars, 0), R = session.details.report || {};
  const badges = [
    ['Datos de Medellín', 'Found all six facts about Medellín', found.size >= 6],
    ['Ojo de técnico', 'All three customers with at most one slip each', session.rounds.every(r => r.issues <= 1)],
    ['Banco de palabras', 'Found every word in all three pictures', BANK.length >= new Set(session.rounds.flatMap(r => CASES[r.key].objs.filter(o => o.word).map(o => o.word))).size],
    ['Informe impecable', 'Report with 5+ preterite verbs, se twice and 6+ bank words', R.pret >= 5 && R.se >= 2 && R.used >= 6],
  ];
  const el = $id('summary');
  el.innerHTML = `
    <div><p class="eyebrow">Fin de la jornada · Medellín</p><h2>¡Chao, Medellín!</h2></div>
    <div class="stats">
      <div class="stat"><div class="v">${total}/12</div><div class="k">Estrellas</div></div>
      <div class="stat"><div class="v">${BANK.length}</div><div class="k">Palabras</div></div>
      <div class="stat"><div class="v">${found.size}/6</div><div class="k">Datos de Medellín</div></div>
      <div class="stat"><div class="v">${mins}</div><div class="k">Minutos</div></div>
    </div>
    <div class="mrows">${session.missions.map(m => `<div class="mrow"><span>${esc(m.title)}</span><span class="stars">${starStr(m.stars)}</span></div>`).join('')}</div>
    <div class="badges">${badges.map(([t, d, on]) => `<span class="badge${on ? '' : ' off'}" title="${esc(d)}">★ ${esc(t)}</span>`).join('')}</div>
    <div><h3 class="lbl">Lo que escribiste</h3><ol class="transcript" style="margin-top:8px">${session.writing.map(w => `<li><b>${esc(w.scene)}:</b> ${esc(w.text)}</li>`).join('')}</ol></div>
    <p class="outcomes">${session.textShown ? 'Text was turned on during this session' + (session.textReason === 'novoice' ? ' (no Spanish voice on this computer).' : session.textReason === 'accommodation' ? ' (accommodation link).' : '.') + ' · ' : 'Played audio-only (picture labels are always shown). · '}Cases: ${session.rounds.map(r => esc(CASES[r.key].title)).join(', ')}. Outcomes practised (30-3Y): LC–1.3 a (technology) · LC–1.4 b (preterite, direct object pronouns, impersonal se) · LC–4.1 b · A–3.2 a · A–4.3 a, b · A–4.4 a · LC–2.1 a · LC–2.3 a · LC–5.1 a · LC–5.2 a.</p>
    <div class="row"><button class="btn primary" type="button" id="againBtn" data-again>Jugar otra vez</button></div>`;
  el.hidden = false;
  try { SFX.celebrate(0); } catch (e) {}
  $id('againBtn').addEventListener('click', () => { el.hidden = true; window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); startGame(); });
  el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  setTask('That’s the end of the day. Your summary and report are below.', 'Fin'); ia('');
}

/* ============ 8 · BOOT ============ */
function syncSpeed() { document.querySelectorAll('[data-speed]').forEach(b => b.classList.toggle('on', b.dataset.speed === SETTINGS.speed)); }
async function wireUI() {
  $id('introFace').innerHTML = luciaSVG('happy');
  const ok = initStage($id('view3d'));
  $id('startBtn').addEventListener('click', () => { if (!ok) return; $id('intro').hidden = true; try { SFX.play('whoosh', { force: true }); } catch (e) {} startGame(); });
  $id('testVoice').addEventListener('click', () => talk(['¡Hola! Bienvenido a Medellín.'], CAST.lucia, { replay: true }));
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
  SESSION_CUST = null; renderMissions(); renderGems(); renderBank(); renderOrder();
  if (ok) { await buildShop(); showLayer('shop'); }
}
wireUI();
window.__medellin = { CUSTOMERS, DAMAGE, pwimLabel, setCustomer, SHOP: () => SHOP, get session() { return session; }, get ROUND() { return ROUND; }, BANK, analyzePast, analyzeSe, analyzeDOP, CASES, startGame, setText, buildPicture, showLayer, PX, endSession, missionReport, finishMission };
