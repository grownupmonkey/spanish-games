/* ===================== SCENES: the radio studio and a concert on the Malecón ===================== */
/* (shared city helpers are in common.js: facadeTex, block, pavingTex, ground, crowd, person, textPlane) */

LOOKS.studio = { sky: 'dusk', fog: 0x3A2852, near: 60, far: 260, hemi: [0xC9B8F0, 0x5A3A30, .62], sun: [0xFFB27A, 1.1, [-18, 14, -60]], rim: .35 };
LOOKS.concert = { sky: 'night', fog: 0x1A1436, near: 70, far: 300, hemi: [0x6A6FB0, 0x201420, .5], sun: [0xB0B8FF, .25, [40, 60, -30]], rim: .3 };

/* ---------- synthesized son: clave, bass tumbao, piano montuno, bongos (generic patterns, no real songs) ---------- */
const MUSIC = (() => {
  let timer = null, step = 0, nextT = 0, ctx = null, master = null, lead = false, energy = .7;
  const BPM = 104, S16 = 60 / BPM / 4;
  const N = n => 440 * Math.pow(2, (n - 69) / 12);
  const CH = [[60, 64, 67], [65, 69, 72], [67, 71, 74], [65, 69, 72]]; // C F G F
  const LEAD = [79, 0, 76, 0, 77, 79, 0, 81, 79, 0, 77, 76, 0, 74, 72, 0, 74, 0, 76, 77, 0, 79, 0, 0, 77, 0, 76, 0, 74, 0, 72, 0];
  function blip(t, f, d, type, g, attack = .005) {
    const o = ctx.createOscillator(), a = ctx.createGain(); o.type = type; o.frequency.value = f;
    a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(g, t + attack); a.gain.exponentialRampToValueAtTime(.0008, t + d);
    o.connect(a).connect(master); o.start(t); o.stop(t + d + .05);
  }
  function knock(t, f, d, g) { // woodblock / bongo: a sine with a fast pitch drop
    const o = ctx.createOscillator(), a = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f * 1.6, t); o.frequency.exponentialRampToValueAtTime(f, t + .02);
    a.gain.setValueAtTime(g, t); a.gain.exponentialRampToValueAtTime(.0008, t + d); o.connect(a).connect(master); o.start(t); o.stop(t + d + .02);
  }
  function tick() {
    while (nextT < ctx.currentTime + .12) {
      const s = step % 32, bar = Math.floor(step / 16) % 4, ch = CH[bar], nxt = CH[(bar + 1) % 4];
      if ([0, 6, 12, 20, 24].includes(s)) knock(nextT, 1800, .07, .22);                             // son clave 3-2
      const s16 = s % 16;
      if (s16 === 6) blip(nextT, N(ch[2] - 24), .28, 'triangle', .38 * energy);                      // tumbao: fifth on 2&
      if (s16 === 12) blip(nextT, N(nxt[0] - 24), .4, 'triangle', .42 * energy);                     // root of the next chord on 4
      if ([2, 5, 8, 10, 13].includes(s16)) ch.forEach((n, i) => blip(nextT + i * .006, N(n + (s16 === 8 ? 12 : 0)), .16, 'square', .035 * energy)); // montuno stabs
      if (s16 % 2 === 0) knock(nextT, s16 % 4 === 0 ? 420 : 300, .09, .12 * energy);                 // bongo martillo
      if (s16 === 14) knock(nextT, 180, .18, .2 * energy);                                           // conga open tone
      if (lead && LEAD[s]) blip(nextT, N(LEAD[s]), S16 * 1.8, 'sawtooth', .07, .02);                 // trumpet-ish lead for the solo
      nextT += S16; step++;
    }
  }
  return {
    play() {
      if (window.__mute || !sfxOn() || timer) return;
      try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
      master = ctx.createGain(); master.gain.value = .5; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200; master.connect(lp).connect(ctx.destination);
      step = 0; nextT = ctx.currentTime + .05; timer = setInterval(tick, 40);
    },
    stop() { if (timer) clearInterval(timer); timer = null; if (master) { try { master.gain.setTargetAtTime(0, ctx.currentTime, .15); } catch (e) {} } lead = false; },
    solo(on) { lead = on; }, energy(e) { energy = e; },
    get on() { return !!timer; }, beat() { return ctx && timer ? (ctx.currentTime / (S16 * 4)) : performance.now() / 577; },
  };
})();

/* ---------- small builders ---------- */
function car(parent, color, x, y, z, ry = 0) {
  const c = new THREE.Group(); c.position.set(x, y, z); c.rotation.y = ry; parent.add(c);
  const body = M(color, { roughness: .35, metalness: .25 }), chrome = M(0xE6E9EE, { metalness: .9, roughness: .2 }), dark = M(0x1E1E28);
  mesh(new THREE.BoxGeometry(4.6, .7, 1.9), body, 0, .65, 0, c);
  mesh(new THREE.BoxGeometry(2.3, .65, 1.7), body, -.2, 1.3, 0, c);
  mesh(new THREE.BoxGeometry(2.1, .5, 1.72), M(0x9FC6E8, { roughness: .1, metalness: .3 }), -.2, 1.3, 0, c);
  mesh(new THREE.BoxGeometry(2.4, .08, 1.8), M(0xF2F2F2), -.2, 1.66, 0, c);
  [-2.35, 2.35].forEach(xx => mesh(new THREE.BoxGeometry(.12, .25, 2), chrome, xx, .45, 0, c));
  [[-2.1, .8], [2.1, .8]].forEach(([xx]) => [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(.5, .2, .06), M(0xF2F2F2), xx, .78, s * .96, c)));
  [-1.5, 1.5].forEach(xx => [-1, 1].forEach(s => mesh(new THREE.CylinderGeometry(.42, .42, .3, 16), dark, xx, .42, s * .9, c).rotation.x = Math.PI / 2));
  [-1, 1].forEach(s => { const f = mesh(new THREE.BoxGeometry(.9, .25, .1), body, 2.0, 1.05, s * .9, c); f.rotation.z = -.35; });
  [-1, 1].forEach(s => mesh(new THREE.CylinderGeometry(.14, .14, .06, 12), new THREE.MeshBasicMaterial({ color: 0xFFF2C0 }), 2.32, .75, s * .65, c).rotation.z = Math.PI / 2);
  return c;
}
const CAR_COLS = [0xFF7AA8, 0x5FE0C8, 0xD8323C, 0xFFD25A, 0x6FA8FF, 0xF2F2F2, 0x7CE0A3, 0xB98CFF];
function seaTex() {
  const t = canvasTex(256, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1B5C8C'); gr.addColorStop(1, '#2B7FB0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 2;
    for (let y = 8; y < h; y += 14) { g.beginPath(); for (let x = 0; x <= w; x += 8) g.lineTo(x, y + Math.sin(x * .09 + y) * 3); g.stroke(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(30, 30); return t;
}
function palm(parent, x, z, y = 0, h = 6) {
  const p = new THREE.Group(); p.position.set(x, y, z); parent.add(p);
  for (let i = 0; i < 6; i++) mesh(new THREE.CylinderGeometry(.22 - i * .015, .25 - i * .015, h / 6, 8), M(0x8A6A4A), Math.sin(i * .5) * .25, h / 12 + i * h / 6, 0, p);
  for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2, l = mesh(new THREE.SphereGeometry(1.4, 10, 6), M(0x3E8E5E), Math.cos(a) * 1.3, h, Math.sin(a) * 1.3, p); l.scale.set(1.3, .12, .45); l.rotation.y = -a; l.rotation.z = -.4; }
  return p;
}
function morro(parent, x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); parent.add(g);
  mesh(blob(9, .2, 2, 3), M(0x6B5A4A), 0, -3, 0, g).scale.set(1.6, .7, 1.1);
  mesh(new THREE.BoxGeometry(16, 4, 9), M(0xC9AE88), 2, 3, 0, g);
  for (let i = -3; i <= 4; i++) mesh(new THREE.BoxGeometry(1, 1, 9.2), M(0xC9AE88), i * 2, 5.5, 0, g);
  mesh(new THREE.CylinderGeometry(1.1, 1.5, 14, 12), M(0xEDE3D0), -4, 10, 0, g);
  mesh(new THREE.CylinderGeometry(1.4, 1.4, 1, 12), M(0x8A7A6A), -4, 17.5, 0, g);
  const lamp = mesh(new THREE.SphereGeometry(.8, 12, 10), new THREE.MeshBasicMaterial({ color: 0xFFF2B0 }), -4, 18.5, 0, g);
  const beam = new THREE.Mesh(new THREE.ConeGeometry(4, 40, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFF2B0, transparent: true, opacity: .12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  beam.geometry.translate(0, -20, 0); beam.rotation.z = Math.PI / 2; const piv = new THREE.Group(); piv.position.set(-4, 18.5, 0); piv.add(beam); g.add(piv);
  return { g, piv, lamp };
}

/* =========================================================================================
   1 · EL ESTUDIO · Radio Malecón 99.5 (sunset through the window)
   ========================================================================================= */
defineScene('estudio', {
  place: '<b>Radio Malecón 99.5 FM</b> · Centro Habana', look: 'studio',
  cam: { th: .05, ph: 1.28, r: 9.5, target: [0, 1.5, -.2], minR: 4, maxR: 13, minPh: .95, maxPh: 1.48, thMin: -.85, thMax: .85, drift: .015 },
  build(g) {
    const W = 12, D = 9, H = 3.6;
    // floor and walls (single-sided, facing in: the room is a dollhouse seen from outside the front wall)
    const planks = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#7A5A3C'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 128) { const v = 120 + Math.random() * 30; c.fillStyle = `rgb(${v + 40},${v},${v - 40})`; c.fillRect((x + ((y / 32) % 2) * 64) % w, y, 126, 30); if ((y / 32) % 2) c.fillRect(-64, y, 126, 30); } });
    planks.wrapS = planks.wrapT = THREE.RepeatWrapping; planks.repeat.set(4, 3);
    const fl = mesh(new THREE.PlaneGeometry(W, D), M(0xffffff, { map: planks }), 0, 0, 0, g); fl.rotation.x = -Math.PI / 2; fl.castShadow = false;
    const foam = canvasTex(256, 256, (c, w, h) => { for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) { const gr = c.createLinearGradient(x, y, x + 32, y + 32); gr.addColorStop(0, '#3A2F5E'); gr.addColorStop(1, '#221B44'); c.fillStyle = gr; c.fillRect(x, y, 32, 32); c.strokeStyle = '#1A1436'; c.strokeRect(x, y, 32, 32); } });
    foam.wrapS = foam.wrapT = THREE.RepeatWrapping; foam.repeat.set(3, 1);
    const wallM = M(0x2BA39A), wallL = M(0xffffff, { map: foam });
    const left = mesh(new THREE.PlaneGeometry(D, H), wallL, -W / 2, H / 2, 0, g); left.rotation.y = Math.PI / 2; left.castShadow = false;
    const right = mesh(new THREE.PlaneGeometry(D, H), M(0xE9A23B), W / 2, H / 2, 0, g); right.rotation.y = -Math.PI / 2; right.castShadow = false;
    const front = mesh(new THREE.PlaneGeometry(W, H), wallM, 0, H / 2, D / 2, g); front.rotation.y = Math.PI; front.castShadow = false;
    const ceil = mesh(new THREE.PlaneGeometry(W, D), M(0x2E2A45), 0, H, 0, g); ceil.rotation.x = Math.PI / 2; ceil.castShadow = false;
    // back wall with the big window onto the Malecón
    const wx0 = -3.6, wx1 = 3.6, wy0 = .95, wy1 = 3.05;
    [[(-W / 2 + wx0) / 2, H / 2, wx0 + W / 2, H], [(W / 2 + wx1) / 2, H / 2, W / 2 - wx1, H], [0, wy0 / 2, wx1 - wx0, wy0], [0, (H + wy1) / 2, wx1 - wx0, H - wy1]].forEach(([x, y, w, h]) => { const p = mesh(new THREE.PlaneGeometry(w, h), wallM, x, y, -D / 2, g); p.castShadow = false; });
    const frameM = M(0xF2F2F2);
    [[0, wy0, wx1 - wx0 + .2, .12], [0, wy1, wx1 - wx0 + .2, .12], [wx0, (wy0 + wy1) / 2, .12, wy1 - wy0], [wx1, (wy0 + wy1) / 2, .12, wy1 - wy0], [0, (wy0 + wy1) / 2, .08, wy1 - wy0]].forEach(([x, y, w, h]) => mesh(new THREE.BoxGeometry(w, h, .14), frameM, x, y, -D / 2, g));
    const glass = mesh(new THREE.PlaneGeometry(wx1 - wx0, wy1 - wy0), new THREE.MeshPhysicalMaterial({ color: 0xBFE6FF, transparent: true, opacity: .1, roughness: .05, depthWrite: false }), 0, (wy0 + wy1) / 2, -D / 2 + .01, g); glass.castShadow = false;
    // ---- outside: the Malecón at sunset ----
    const out = new THREE.Group(); out.position.set(0, -4, 0); g.add(out);
    const road = mesh(new THREE.PlaneGeometry(400, 10), M(0x3A3742), 0, 0, -11, out); road.rotation.x = -Math.PI / 2; road.castShadow = false;
    const walk = mesh(new THREE.PlaneGeometry(400, 4), M(0xBDB2A2), 0, .05, -17.5, out); walk.rotation.x = -Math.PI / 2; walk.castShadow = false;
    mesh(new THREE.BoxGeometry(400, 1.2, .9), M(0xD9CFC0), 0, .6, -19.8, out);
    const sea = mesh(new THREE.PlaneGeometry(900, 500), M(0xffffff, { map: seaTex(), roughness: .25, metalness: .1 }), 0, -.6, -270, out); sea.rotation.x = -Math.PI / 2; sea.castShadow = false;
    const sun = mesh(new THREE.SphereGeometry(10, 24, 16), new THREE.MeshBasicMaterial({ color: 0xFFB070, fog: false }), -60, 8, -330, out);
    const M2 = morro(out, -120, -170, .9);
    for (let i = 0; i < 10; i++) { const l = new THREE.Group(); l.position.set(-60 + i * 13, 0, -18.6); out.add(l); mesh(new THREE.CylinderGeometry(.08, .1, 4.5, 8), M(0x2B2B33), 0, 2.25, 0, l); mesh(new THREE.SphereGeometry(.28, 10, 8), new THREE.MeshBasicMaterial({ color: 0xFFE7A8 }), 0, 4.6, 0, l); }
    for (let i = 0; i < 4; i++) palm(out, -36 + i * 24, -16.5);
    const cars = [];
    for (let i = 0; i < 6; i++) { const lane = i % 2, c = car(out, CAR_COLS[i % CAR_COLS.length], -70 + i * 24, 0, lane ? -9 : -13, lane ? Math.PI : 0); cars.push({ c, v: (lane ? -1 : 1) * rnd(5, 9) }); }
    // ---- the desk, mics, turntable, phone and screens ----
    const desk = new THREE.Group(); desk.position.set(0, 0, .2); g.add(desk);
    mesh(new THREE.BoxGeometry(5.4, .95, 1.3), M(0x2E2A45), 0, .475, 0, desk);
    const top = mesh(new THREE.BoxGeometry(5.6, .08, 1.5), M(0x3C365E, { roughness: .4 }), 0, .99, 0, desk);
    const console = new THREE.Group(); console.position.set(-.1, 1.04, .05); console.rotation.x = -.18; desk.add(console);
    mesh(new THREE.BoxGeometry(2.4, .08, .9), M(0x1E1E28), 0, 0, 0, console);
    const vus = [];
    for (let i = 0; i < 12; i++) { mesh(new THREE.BoxGeometry(.06, .03, .5), M(0x0E0E14), -1.05 + i * .19, .05, .1, console); mesh(new THREE.BoxGeometry(.12, .07, .1), M([0xF2F2F2, 0xD8323C, 0x5FE0C8][i % 3]), -1.05 + i * .19, .08, .05 + Math.sin(i) * .15, console); for (let k = 0; k < 2; k++) mesh(new THREE.CylinderGeometry(.04, .04, .06, 10), M(0xC9CED8, { metalness: .6 }), -1.05 + i * .19, .07, -.28 - k * .1, console); }
    for (let i = 0; i < 8; i++) { const v = mesh(new THREE.BoxGeometry(.08, .3, .02), new THREE.MeshBasicMaterial({ color: i < 6 ? 0x5FE0C8 : 0xFF5A5A }), .2 + i * .11, .25, -.43, console); v.geometry.translate(0, .15, 0); v.position.y = .05; vus.push(v); }
    const screenT = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#0B1A2A'; c.fillRect(0, 0, w, h); c.strokeStyle = '#5FE0C8'; c.lineWidth = 2; c.beginPath(); for (let x = 0; x < w; x++) c.lineTo(x, h / 2 + Math.sin(x * .2) * Math.sin(x * .03) * 30); c.stroke(); c.fillStyle = '#FFC27A'; c.font = '700 18px Manrope, sans-serif'; c.fillText('99.5 FM · EN VIVO', 10, 22); });
    [-1.6, 1.4].forEach((x, i) => { const sc = mesh(new THREE.BoxGeometry(1.1, .7, .06), M(0x1E1E28), x, 1.45, -.45, desk); sc.rotation.x = -.15; const pl = mesh(new THREE.PlaneGeometry(1, .6), new THREE.MeshBasicMaterial({ map: screenT }), 0, 0, .035, sc); pl.castShadow = false; mesh(new THREE.BoxGeometry(.08, .45, .08), M(0x1E1E28), 0, -.5, -.05, sc); });
    const mics = [];
    [-1.15, 1.35].forEach(x => { const arm = new THREE.Group(); arm.position.set(x, 1.0, .35); desk.add(arm); mesh(new THREE.CylinderGeometry(.03, .03, .9, 6), M(0x2B2B33), 0, .45, 0, arm); const a2 = mesh(new THREE.CylinderGeometry(.025, .025, .7, 6), M(0x2B2B33), 0, .95, -.3, arm); a2.rotation.x = .9; const mic = mesh(new THREE.CylinderGeometry(.09, .08, .28, 14), M(0x1E1E28), 0, 1.15, -.62, arm); mic.rotation.x = 1.2; mesh(new THREE.SphereGeometry(.1, 12, 10), M(0xC9CED8, { metalness: .7, roughness: .3 }), 0, 1.2, -.7, arm); mics.push(arm); });
    // turntable
    const tt = new THREE.Group(); tt.position.set(2.15, 1.03, .1); desk.add(tt);
    mesh(new THREE.BoxGeometry(.9, .1, .75), M(0xB98A52), 0, 0, 0, tt);
    const platter = new THREE.Group(); platter.position.set(-.08, .08, 0); tt.add(platter);
    mesh(new THREE.CylinderGeometry(.32, .32, .03, 32), M(0x14121E, { roughness: .3 }), 0, 0, 0, platter);
    const label = mesh(new THREE.CylinderGeometry(.1, .1, .032, 20), M(0xD8323C), 0, .002, 0, platter);
    mesh(new THREE.BoxGeometry(.04, .02, .4), M(0xC9CED8, { metalness: .7 }), .32, .1, .02, tt).rotation.y = .4;
    // retro phone with a ring light
    const phone = new THREE.Group(); phone.position.set(-2.35, 1.03, .2); desk.add(phone);
    mesh(new THREE.BoxGeometry(.5, .16, .4), M(0xD8323C, { roughness: .4 }), 0, .08, 0, phone);
    const hand = mesh(new THREE.BoxGeometry(.55, .1, .14), M(0xD8323C, { roughness: .4 }), 0, .22, -.08, phone);
    const ringL = mesh(new THREE.SphereGeometry(.05, 10, 8), new THREE.MeshBasicMaterial({ color: 0x441111 }), .18, .17, .16, phone);
    // ON AIR sign
    const onAirOff = canvasTex(512, 128, c => { c.fillStyle = '#2A1416'; c.fillRect(0, 0, 512, 128); c.fillStyle = '#5A2A2E'; c.font = '800 70px Unbounded, Manrope, sans-serif'; c.textAlign = 'center'; c.fillText('EN EL AIRE', 256, 92); });
    const onAirOn = canvasTex(512, 128, c => { c.fillStyle = '#B5121B'; c.fillRect(0, 0, 512, 128); c.fillStyle = '#FFF4F0'; c.font = '800 70px Unbounded, Manrope, sans-serif'; c.textAlign = 'center'; c.fillText('EN EL AIRE', 256, 92); });
    const signM = new THREE.MeshBasicMaterial({ map: onAirOff });
    mesh(new THREE.BoxGeometry(1.9, .5, .1), M(0x1E1E28), 0, 3.3, -D / 2 + .08, g);
    const sign = mesh(new THREE.PlaneGeometry(1.8, .42), signM, 0, 3.3, -D / 2 + .14, g); sign.castShadow = false;
    const onAirLight = new THREE.PointLight(0xFF3030, 0, 6); onAirLight.position.set(0, 3, -3.6); g.add(onAirLight);
    // station logo and posters
    textPlane(g, 3, .8, (c, w, h) => { c.fillStyle = '#17122E'; c.fillRect(0, 0, w, h); c.fillStyle = '#5FE0C8'; c.font = '800 64px Unbounded, Manrope, sans-serif'; c.fillText('Radio Malecón', 24, 82); c.fillStyle = '#FFC27A'; c.font = '800 46px Manrope, sans-serif'; c.fillText('99.5 FM · La Habana', 26, 128); }, -4.75, 2.6, -D / 2 + .03, 0);
    const poster = textPlane(g, 1.3, 1.8, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#FF7AA8'); gr.addColorStop(1, '#FFC27A'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = '#17122E'; c.font = '800 64px Unbounded, Manrope, sans-serif'; c.textAlign = 'center'; c.fillText('FESTIVAL', w / 2, 120); c.fillText('DEL SON', w / 2, 196); c.font = '700 40px Manrope, sans-serif'; c.fillText('Santiago · La Habana', w / 2, 290); for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(80 + i * 88, 420, 26, 0, 7); c.fillStyle = i === 2 ? '#17122E' : 'rgba(23,18,46,.35)'; c.fill(); } c.font = '700 34px Manrope, sans-serif'; c.fillText('la clave 3-2', w / 2, 520); }, 4.6, 2.0, -D / 2 + .03, 0);
    // record shelves on the right wall
    const shelf = new THREE.Group(); shelf.position.set(W / 2 - .35, 0, -.6); shelf.rotation.y = -Math.PI / 2; g.add(shelf);
    for (let r = 0; r < 4; r++) mesh(new THREE.BoxGeometry(4.2, .06, .5), M(0x8A5A32), 0, .45 + r * .72, 0, shelf);
    [-2.1, 2.1].forEach(x => mesh(new THREE.BoxGeometry(.08, 2.9, .5), M(0x8A5A32), x, 1.45, 0, shelf));
    for (let k = 0; k < 40; k++) { const r = k % 4, sp = mesh(new THREE.BoxGeometry(.04, .58, .5), M(pick([0x2E2A45, 0xD8323C, 0x5FE0C8, 0xFFD25A, 0x7A4FD6, 0xF2F2F2])), -2 + (k * .1) % 4, .78 + r * .72, -.02, shelf); sp.castShadow = false; }
    let covers = [];
    const setRecords = list => {
      covers.forEach(c => shelf.remove(c.obj)); covers = [];
      list.forEach((rec, i) => {
        const col = i % 4, row = Math.floor(i / 4), t = canvasTex(256, 256, (c, w, h) => {
          c.fillStyle = rec.bg; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.arc(w * .7, h * .3, 70, 0, 7); c.fill();
          c.fillStyle = rec.fg; c.font = '800 30px Unbounded, Manrope, sans-serif'; c.textAlign = 'left';
          const wrap = (s, y, f) => { c.font = f; const ws = s.split(' '); let line = '', yy = y; ws.forEach(wd => { if (c.measureText(line + wd).width > 220) { c.fillText(line, 16, yy); line = ''; yy += parseInt(f.match(/\d+px/)[0]) + 6; } line += wd + ' '; }); c.fillText(line, 16, yy); };
          wrap(rec.title, 150, '800 30px Unbounded, Manrope, sans-serif'); c.font = '600 22px Manrope, sans-serif'; c.fillText(rec.artist, 16, 238);
        });
        const cv = mesh(new THREE.BoxGeometry(.7, .7, .03), [M(0x111111), M(0x111111), M(0x111111), M(0x111111), M(0xffffff, { map: t }), M(0x111111)], -1.45 + col * .97, .84 + row * .72, .27, shelf);
        cv.rotation.x = -.12; covers.push({ obj: cv, id: i });
      });
      return covers;
    };
    const focus = where => {
      if (where === 'shelf') { orbit.thMin = -1.45; orbit.target.set(5.3, 1.55, -.6); orbit.tR = 3.8; orbit.tPh = 1.38; orbit.tTh = -1.15; orbit.drift = 0; }
      else { orbit.target.set(0, 1.5, -.2); orbit.tR = 9.5; orbit.tPh = 1.28; orbit.tTh = .05; orbit.drift = .015; setTimeout(() => { orbit.thMin = -.85; }, 1500); }
    };
    // people
    const host = person({ skirt: true, hair: 'curly', hairC: 0x1A1210, skin: 0x8D5A3B, hat: 'headphones', pattern: 'floral', topC: '#5FE0C8', patC: '#FFD25A', pose: 'hold', mouth: 'smile', lashes: true, bigEyes: true }, .2);
    host.position.set(-1.15, 0, -.65); g.add(host);
    const prod = person({ skirt: false, skin: 0xC68863, hair: 'short', hairC: 0x2B1D16, hat: 'headphones', topC: '#2E2A45', pose: 'point', mouth: 'smile', shades: false }, .2);
    prod.position.set(-4.6, 0, -2.6); prod.rotation.y = .5; g.add(prod);
    mesh(new THREE.BoxGeometry(1.6, .9, .7), M(0x2E2A45), -4.6, .45, -2, g);
    let guest = null;
    const setGuest = spec => { if (guest) g.remove(guest); guest = person(spec, .2); guest.position.set(1.35, 0, -.65); g.add(guest); return guest; };
    let air = false, ringing = false, spinning = false;
    const anims = [(t, dt) => {
      cars.forEach(o => { o.c.position.x += o.v * dt; if (o.c.position.x > 80) o.c.position.x = -80; if (o.c.position.x < -80) o.c.position.x = 80; });
      sea.material.map.offset.y = t * .01; sea.material.map.offset.x = Math.sin(t * .2) * .01;
      M2.piv.rotation.y = t * .8;
      const beat = MUSIC.beat();
      vus.forEach((v, i) => { const lvl = air ? (spinning ? .4 + .6 * Math.abs(Math.sin(beat * Math.PI + i * .7)) : .2 + .3 * Math.abs(Math.sin(t * 7 + i))) : .05; v.scale.y = lvl; });
      if (spinning) { platter.rotation.y -= dt * 3.5; }
      ringL.material.color.setHex(ringing && Math.sin(t * 14) > 0 ? 0xFF3030 : 0x441111);
      if (ringing) phone.position.y = 1.03 + (Math.sin(t * 40) > .6 ? .01 : 0);
      if (guest && spinning) guest.position.y = Math.abs(Math.sin(beat * Math.PI)) * .03;
      host.rotation.y = Math.sin(t * .5) * .08;
    }];
    const setAir = on => { air = on; signM.map = on ? onAirOn : onAirOff; signM.needsUpdate = true; onAirLight.intensity = on ? 1.2 : 0; };
    const setRing = on => { ringing = on; };
    const spin = (on, color) => { spinning = on; if (color != null) label.material.color.setHex(color); if (on) MUSIC.play(); else MUSIC.stop(); };
    setAir(false);
    return { anims, api: { setRecords, focus, setGuest, setAir, setRing, spin, host }, onExit() { MUSIC.stop(); },
      gems: [
        { id: 'son', pos: new THREE.Vector3(4.6, 2.9, -D / 2 + .3), es: 'El son cubano nació en el oriente de Cuba. Mezcla la guitarra y la melodía de España con los tambores y los ritmos de África. La clave marca el ritmo: tres golpes y dos golpes.', en: 'Son was born in eastern Cuba, mixing Spanish guitar and song with African drums and rhythm. The clave (3-2) holds it together, and son is one of the roots of salsa.' },
        { id: 'quebola', pos: new THREE.Vector3(-2.35, 1.7, .5), es: '«¿Qué bolá?» es un saludo muy cubano: significa «¿Qué tal?». En Cuba, como en toda América Latina, se dice «ustedes» y no «vosotros».', en: '“¿Qué bolá?” is a very Cuban greeting, like “What’s up?”. In Cuba, as in all of Latin America, people say ustedes, not vosotros.' },
        { id: 'almendrones', pos: new THREE.Vector3(1.8, 1.5, -12), es: 'En La Habana circulan muchos coches americanos de los años cincuenta. Se llaman «almendrones» y muchos son taxis colectivos.', en: 'Havana is full of 1950s American cars. Cubans call them almendrones (big almonds), and many work as shared taxis on fixed routes.' },
      ] };
  },
});

/* =========================================================================================
   2 · EL MALECÓN · a concert by the sea (night, 20:50)
   ========================================================================================= */
defineScene('malecon', {
  place: '<b>El Malecón</b> · Concierto · 20:50', look: 'concert',
  cam: { th: 1.2, ph: 1.3, r: 34, target: [-4, 3, 2], minR: 14, maxR: 60, maxPh: 1.48, drift: .01, thMin: .4, thMax: 2.2 },
  build(g) {
    const land = mesh(new THREE.PlaneGeometry(400, 210), M(0xffffff, { map: pavingTex([120, 116, 124], 30) }), 0, 0, 98, g); land.rotation.x = -Math.PI / 2; land.castShadow = false;
    const walk = mesh(new THREE.PlaneGeometry(400, 6), M(0xCFC4B2), 0, .02, -4, g); walk.rotation.x = -Math.PI / 2; walk.castShadow = false;
    mesh(new THREE.BoxGeometry(400, 1.1, 1), M(0xE3D9C9), 0, .55, -7.5, g);
    const sea = mesh(new THREE.PlaneGeometry(900, 500), M(0xffffff, { map: seaTex(), roughness: .2, metalness: .15 }), 0, -1, -258, g); sea.rotation.x = -Math.PI / 2; sea.castShadow = false;
    const M2 = morro(g, -150, -90, 1.1);
    const cab = new THREE.Group(); cab.position.set(-110, 0, -120); g.add(cab);
    mesh(new THREE.BoxGeometry(40, 5, 8), M(0xBFA47E), 0, 2.5, 0, cab); for (let i = -9; i <= 9; i++) mesh(new THREE.BoxGeometry(1.2, 1, 8.2), M(0xBFA47E), i * 2.1, 5.5, 0, cab);
    const canonFlash = new THREE.PointLight(0xFFD080, 0, 120); canonFlash.position.set(-110, 8, -112); g.add(canonFlash);
    // Centro Habana façades with arcades
    for (let x = -90; x < 90; x += rnd(13, 16)) {
      const b = block(g, x, 24, rnd(12, 15), 10, rnd(12, 19), Math.PI, true);
      for (let k = -2; k <= 2; k++) mesh(new THREE.CylinderGeometry(.3, .35, 4, 10), M(0xF2EADC), x + k * 2.6, 2, 18.6, g);
      mesh(new THREE.BoxGeometry(13, .5, 2.4), M(0xF2EADC), x, 4.2, 19.2, g);
    }
    for (let i = 0; i < 14; i++) { const l = new THREE.Group(); l.position.set(-90 + i * 14, 0, -6.8); g.add(l); mesh(new THREE.CylinderGeometry(.1, .12, 5, 8), M(0x2B2B33), 0, 2.5, 0, l); mesh(new THREE.SphereGeometry(.32, 10, 8), new THREE.MeshBasicMaterial({ color: 0xFFE7A8 }), 0, 5.1, 0, l); }
    [[22, 10, 0], [30, 11, 0], [38, 10, 0], [-30, 12, .1], [46, 11.5, 0]].forEach(([x, z, r], i) => car(g, CAR_COLS[(i + 2) % CAR_COLS.length], x, 0, z, r));
    for (let i = 0; i < 5; i++) palm(g, -70 + i * 35, -5.5);
    // the stage
    const st = new THREE.Group(); st.position.set(-16, 0, 4); st.rotation.y = Math.PI / 2; g.add(st);
    mesh(new THREE.BoxGeometry(14, 1.2, 7), M(0x2E2A45), 0, .6, 0, st);
    [[-7, -3.5], [7, -3.5], [-7, 3.5], [7, 3.5]].forEach(([x, z]) => mesh(new THREE.BoxGeometry(.3, 7.5, .3), M(0xC9CED8, { metalness: .6 }), x, 4.95, z, st));
    mesh(new THREE.BoxGeometry(14.3, .4, .4), M(0xC9CED8, { metalness: .6 }), 0, 8.7, -3.5, st); mesh(new THREE.BoxGeometry(14.3, .4, .4), M(0xC9CED8, { metalness: .6 }), 0, 8.7, 3.5, st);
    let banner = null;
    const setBanner = name => { if (banner) st.remove(banner); banner = textPlane(st, 12, 2, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#7A4FD6'); gr.addColorStop(1, '#FF7AA8'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = '#FFF4D6'; c.font = '800 54px Unbounded, Manrope, sans-serif'; c.textAlign = 'center'; c.fillText(name, w / 2, 58); c.font = '700 28px Manrope, sans-serif'; c.fillText('Radio Malecón 99.5 presenta · Concierto en el Malecón', w / 2, 76); }, 0, 7.3, -3.4, 0, 1024); };
    [-6, 6].forEach(x => { mesh(new THREE.BoxGeometry(1.3, 2.4, 1.1), M(0x1E1E28), x, 2.4, 2.5, st); [1.8, 2.9].forEach(y => mesh(new THREE.CylinderGeometry(.35, .35, .05, 16), M(0x3A3742), x, y, 3.06, st).rotation.x = Math.PI / 2); });
    const spots = [0xFF7AA8, 0x5FE0C8, 0xFFD25A, 0xB98CFF].map((c, i) => {
      const sp = new THREE.SpotLight(c, 0, 30, .5, .5); sp.position.set(-5 + i * 3.3, 8.5, 3); st.add(sp); sp.target.position.set(-5 + i * 3.3, 1, 0); st.add(sp.target);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 7.5, 16, 1, true), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      cone.position.set(-5 + i * 3.3, 4.8, 1.8); st.add(cone); return { sp, cone };
    });
    let band = [];
    const setBand = specs => {
      band.forEach(b => st.remove(b.n)); band = [];
      specs.forEach((sp, i) => { const n = person(sp, .22); const x = -5 + i * 2.5; n.position.set(x, 1.2, sp.front ? 1.2 : -.6); n.rotation.y = 0; st.add(n); band.push({ n, x, role: sp.role, base: n.position.clone() }); });
    };
    // the audience, with a few dancing couples
    const cr = crowd(g, 360, () => { const x = rnd(-8, 20), z = rnd(-2.5, 12); return Math.hypot(x + 16, z - 4) < 9 ? null : [x, z]; });
    const couples = [];
    for (let i = 0; i < 4; i++) { const c = new THREE.Group(); c.position.set(rnd(-4, 10), 0, rnd(0, 9)); g.add(c); const a = person({ skirt: true, pose: 'cheer' }, .2), b = person({ skirt: false, pose: 'cheer' }, .2); a.position.x = -.6; b.position.x = .6; b.rotation.y = Math.PI; c.add(a, b); couples.push(c); }
    let playing = false, soloOn = false, coro = false;
    const anims = [(t, dt) => {
      sea.material.map.offset.y = t * .012; M2.piv.rotation.y = t * .8; canonFlash.intensity *= .9;
      const beat = MUSIC.beat(), b = Math.abs(Math.sin(beat * Math.PI));
      cr.excite = playing ? (coro ? 1 : .55) : .05; cr.update(t);
      band.forEach((m, i) => { m.n.position.y = m.base.y + (playing ? b * .12 : 0); m.n.rotation.y = playing ? Math.sin(beat * Math.PI * .5 + i) * .25 : 0; if (m.role === 'trumpet') m.n.position.z = m.base.z + (soloOn ? 2 : 0); });
      couples.forEach((c, i) => { c.rotation.y = playing ? t * (1.4 + i * .2) : 0; c.position.y = playing ? b * .08 : 0; });
      spots.forEach((s, i) => { const on = playing ? .5 + .5 * Math.sin(t * 2 + i * 1.7) : 0; s.sp.intensity = (soloOn && i === 1 ? 6 : on * 3); s.cone.material.opacity = (soloOn && i === 1 ? .22 : on * .12); });
    }];
    const api = {
      setBanner, setBand,
      start() { playing = true; MUSIC.energy(.8); MUSIC.play(); },
      stop() { playing = false; MUSIC.stop(); },
      solo(on) { soloOn = on; MUSIC.solo(on); },
      coro(on) { coro = on; if (on) for (let k = 0; k < 6; k++) setTimeout(() => noiseHit({ gain: .12, freq: 900, decay: 1, len: 1.2, type: 'bandpass' }), k * 300); },
      canon() { canonFlash.intensity = 14; for (let k = 0; k < 10; k++) puff(g, -110 + rnd(-3, 3), 8 + rnd(0, 3), -112, 3, 0xCFC8C0, .5); setTimeout(() => { bang(.9, true); shake = .3; }, 400); },
    };
    return { anims, api, onExit() { MUSIC.stop(); },
      gems: [
        { id: 'malecon', pos: new THREE.Vector3(10, 2.4, -7.5), es: 'El Malecón tiene unos ocho kilómetros. Los habaneros lo llaman «el sofá más largo del mundo»: aquí se sientan a hablar, a pescar y a ver el mar.', en: 'The Malecón seawall runs about eight kilometres along the city. Habaneros call it the longest sofa in the world: people sit here to talk, fish, play music and watch the sea.' },
        { id: 'morro', pos: new THREE.Vector3(-150, 26, -90), es: 'El castillo del Morro protege la entrada de la bahía desde hace más de cuatrocientos años. Su faro ilumina el mar cada noche.', en: 'El Morro castle has guarded the entrance to Havana Bay for over 400 years; its lighthouse sweeps the sea every night.' },
        { id: 'canonazo', pos: new THREE.Vector3(-110, 12, -120), es: 'Cada noche, a las nueve, se dispara un cañón en la fortaleza de La Cabaña: es el «cañonazo de las nueve». Es una tradición de la época colonial.', en: 'Every night at 9 p.m. a cannon is fired from La Cabaña fortress across the bay, the cañonazo de las nueve, a ceremony dating from colonial times, when it signalled the closing of the city gates.' },
      ] };
  },
});
