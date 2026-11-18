/* ---------- shared city pieces ---------- */
const PALETTE = [['#E8C9A0', '#F6EBDD'], ['#D99A72', '#F2DEC8'], ['#F0DDB8', '#FFFFFF'], ['#C9B091', '#EFE3D2'], ['#E7B984', '#FAF0E2'], ['#E9A9A0', '#FBEDE6']];
function facadeTex(base, accent, floors, cols, lit) {
  const wins = [];
  const map = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const fh = h / floors, cw = w / cols;
    for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
      const x = c * cw + cw * .28, y = f * fh + fh * .22, ww = cw * .44, hh = fh * .58, on = lit && f < floors - 1 && Math.random() < .5;
      wins.push([x, y, ww, hh, on, f === floors - 1]);
      g.fillStyle = accent; g.fillRect(x - 3, y - 3, ww + 6, hh + 6);
      g.fillStyle = f === floors - 1 ? '#5B4636' : on ? '#FFD98A' : '#2E3A55'; g.fillRect(x, y, ww, hh);
      g.fillStyle = 'rgba(255,255,255,.16)'; g.fillRect(x, y, ww * .45, hh);
      if (f < floors - 1) { g.fillStyle = '#2B2B33'; g.fillRect(x - 6, y + hh, ww + 12, 4); for (let k = 0; k < 6; k++) g.fillRect(x - 5 + k * (ww + 10) / 5, y + hh - 9, 2, 9); }
    }
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, h - fh * .12, w, fh * .12);
  });
  let emis = null;
  if (lit) emis = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); wins.forEach(([x, y, ww, hh, on, shop]) => { if (on || shop) { g.fillStyle = shop ? '#FFB86A' : '#FFD98A'; g.fillRect(x, y, ww, hh); } }); });
  return { map, emis };
}
function block(parent, x, z, w, d, h, rotY, lit) {
  const [b, a] = pick(PALETTE), floors = Math.max(3, Math.round(h / 3.4)), cols = Math.max(2, Math.round(w / 3.2));
  const { map, emis } = facadeTex(b, a, floors, cols, lit);
  const face = M(0xffffff, { map }); if (lit) { face.emissiveMap = emis; face.emissive = new THREE.Color(0xffffff); face.emissiveIntensity = .9; }
  const side = M(b), roof = M(0xA4553A);
  const m = mesh(new THREE.BoxGeometry(w, h, d), [side, side, roof, side, face, face], x, h / 2, z, parent); m.rotation.y = rotY;
  mesh(new THREE.BoxGeometry(w + .6, .5, d + .6), M(a), 0, h / 2, 0, m).castShadow = false;
  return m;
}
function pavingTex(base = [190, 176, 158], rep = 14) {
  const t = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = `rgb(${base.map(v => v - 20)})`; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 64) { const off = (y / 32) % 2 ? 32 : 0, v = rnd(-12, 12); g.fillStyle = `rgb(${base[0] + v},${base[1] + v},${base[2] + v})`; g.fillRect(x + off + 1, y + 1, 62, 30); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); return t;
}
function ground(parent, size, tex) { const g = mesh(new THREE.PlaneGeometry(size, size), M(0xffffff, { map: tex }), 0, 0, 0, parent); g.rotation.x = -Math.PI / 2; g.castShadow = false; return g; }
const SHIRTS = [0x2A6FDB, 0xF2F2F2, 0x1E1E28, 0xD8323C, 0x5FE0C8, 0xFFC27A, 0x7A4FD6, 0x3E8E5E, 0xE85D9E];
const SKINS = [0xF2C6A0, 0xE0AC85, 0xC68863, 0x8D5A3B, 0xF7D6B8];
function crowd(parent, n, sampler) {
  const bodies = new THREE.InstancedMesh(new THREE.CylinderGeometry(.42, .5, 1.6, 8), M(0xffffff), n);
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(.34, 10, 8), M(0xffffff), n);
  bodies.castShadow = heads.castShadow = true;
  const col = new THREE.Color(), base = []; let guard = 0;
  while (base.length < n && guard++ < n * 30) { const p = sampler(); if (!p) continue; const i = base.length; base.push({ x: p[0], z: p[1], s: rnd(.9, 1.12), ph: Math.random() * 6 }); bodies.setColorAt(i, col.setHex(pick(SHIRTS)).convertSRGBToLinear()); heads.setColorAt(i, col.setHex(pick(SKINS)).convertSRGBToLinear()); }
  bodies.count = heads.count = base.length; parent.add(bodies, heads);
  const d = new THREE.Object3D(), C = { excite: 0 };
  C.update = t => {
    base.forEach((c, i) => {
      const hop = Math.max(0, Math.sin(t * (2 + C.excite * 6) + c.ph)) * (.05 + C.excite * .35);
      d.position.set(c.x, .8 * c.s + hop, c.z); d.scale.setScalar(c.s); d.updateMatrix(); bodies.setMatrixAt(i, d.matrix);
      d.position.y = 1.95 * c.s + hop; d.updateMatrix(); heads.setMatrixAt(i, d.matrix);
    });
    bodies.instanceMatrix.needsUpdate = heads.instanceMatrix.needsUpdate = true;
  };
  C.update(0); return C;
}
function barrierLine(parent, pts) {
  const metal = M(0xB8BEC8, { metalness: .6, roughness: .35 });
  pts.forEach(([x, z, r]) => { const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = r; parent.add(b);
    mesh(new THREE.BoxGeometry(4.4, .12, .12), metal, 0, 1.1, 0, b); mesh(new THREE.BoxGeometry(4.4, .12, .12), metal, 0, .3, 0, b);
    for (let k = -2; k <= 2; k++) mesh(new THREE.BoxGeometry(.06, .8, .06), metal, k, .7, 0, b); });
}
function barrierRing(parent, R, n, cx = 0, cz = 0) { const pts = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; pts.push([cx + Math.cos(a) * R, cz + Math.sin(a) * R, -a + Math.PI / 2]); } barrierLine(parent, pts); }
function person(spec, s = .2) { const n = ninot(randSpec(spec)); n.scale.setScalar(s); return n; }
function textPlane(parent, w, h, draw, x, y, z, ry = 0, cw = 512) {
  const t = canvasTex(cw, Math.round(cw * h / w), draw); const m = mesh(new THREE.PlaneGeometry(w, h), M(0xffffff, { map: t }), x, y, z, parent); m.rotation.y = ry; m.castShadow = false; return m;
}
function burnable(F) { F.traverse(o => { if (o.isMesh) o.material = Array.isArray(o.material) ? o.material.map(m => m.clone()) : o.material.clone(); }); }

