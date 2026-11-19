/* ===================== 2D STAGE (PixiJS 7): sprites from SVG, tweens, particles, hotspots ===================== */
const W = 1600, H = 900;
const PX = { app: null, root: null, layers: {}, ok: false };
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const TS = () => window.__testSpeed || 1;

function initStage(host) {
  if (!window.PIXI) { host.innerHTML = '<p class="nopixi">The graphics library could not load. Check the internet connection and reload the page.</p>'; return false; }
  const app = new PIXI.Application({ backgroundAlpha: 0, antialias: true, resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true, resizeTo: host });
  host.appendChild(app.view);
  const root = new PIXI.Container(); app.stage.addChild(root);
  ['shop', 'picture', 'closeup', 'fx'].forEach(k => { const c = new PIXI.Container(); c.sortableChildren = true; root.addChild(c); PX.layers[k] = c; });
  const mask = new PIXI.Graphics().beginFill(0xffffff).drawRect(0, 0, W, H).endFill(); root.addChild(mask); root.mask = mask;
  const fit = () => { const s = Math.min(host.clientWidth / W, host.clientHeight / H); root.scale.set(s); root.x = (host.clientWidth - W * s) / 2; root.y = (host.clientHeight - H * s) / 2; };
  app.renderer.on('resize', fit); window.addEventListener('resize', fit); fit();
  app.ticker.add(() => stepTweens(app.ticker.deltaMS));
  Object.assign(PX, { app, root, ok: true });
  window.__pixi = PX;
  return true;
}

/* ---- SVG → texture (cached) ---- */
const svgDoc = (w, h, inner, defs = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${inner}</svg>`;
const TEXC = new Map();
function svgTex(key, svg, w, h, res = 2) {
  if (TEXC.has(key)) return TEXC.get(key);
  const p = new Promise(resolve => {
    const img = new Image();
    img.onload = () => { const c = document.createElement('canvas'); c.width = Math.round(w * res); c.height = Math.round(h * res); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); const t = PIXI.Texture.from(c); t.__res = res; resolve(t); };
    img.onerror = () => { console.warn('svg failed', key); resolve(PIXI.Texture.WHITE); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
  TEXC.set(key, p); return p;
}
async function svgSprite(key, art, opts = {}) {
  const [svg, w, h] = typeof art === 'function' ? art() : art;
  const t = await svgTex(key, svg, w, h, opts.res || 2);
  const s = new PIXI.Sprite(t); s.scale.set(1 / (t.__res || 1)); s.__base = 1 / (t.__res || 1);
  s.anchor.set(opts.ax ?? .5, opts.ay ?? .5); s.x = opts.x || 0; s.y = opts.y || 0; if (opts.z != null) s.zIndex = opts.z;
  if (opts.parent) opts.parent.addChild(s);
  return s;
}
const setScale = (s, k) => s.scale.set((s.__base || 1) * k);

/* ---- tweens ---- */
const EASE = { lin: t => t, out: t => 1 - Math.pow(1 - t, 3), in: t => t * t * t, inOut: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, back: t => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }, bounce: t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; } };
let TW = [];
const ALIAS = { a: 'alpha', r: 'rotation' };
const getP = (o, k) => ALIAS[k] ? o[ALIAS[k]] : k === 's' ? o.scale.x / (o.__base || 1) : k === 'sx' ? o.scale.x / (o.__base || 1) : k === 'sy' ? o.scale.y / (o.__base || 1) : o[k];
const setP = (o, k, v) => { if (ALIAS[k]) o[ALIAS[k]] = v; else if (k === 's') o.scale.set((o.__base || 1) * v); else if (k === 'sx') o.scale.x = (o.__base || 1) * v; else if (k === 'sy') o.scale.y = (o.__base || 1) * v; else o[k] = v; };
function tween(o, to, dur = 600, ease = 'out', delay = 0) {
  return new Promise(r => { const from = {}; for (const k in to) from[k] = getP(o, k); TW.push({ o, from, to, t: -delay * TS(), dur: Math.max(1, dur * TS()), ease: EASE[ease] || EASE.out, r }); });
}
function stepTweens(ms) {
  for (let i = TW.length - 1; i >= 0; i--) {
    const tw = TW[i]; tw.t += ms; if (tw.t < 0) continue;
    const k = Math.min(1, tw.t / tw.dur), e = tw.ease(k);
    if (tw.o.destroyed) { TW.splice(i, 1); tw.r(); continue; }
    for (const p in tw.to) setP(tw.o, p, tw.from[p] + (tw.to[p] - tw.from[p]) * e);
    if (k >= 1) { TW.splice(i, 1); tw.r(); }
  }
}
const wait = ms => new Promise(r => setTimeout(r, ms * TS()));
function loop(fn) { const f = () => { try { fn(performance.now() / 1000); } catch (e) { PX.app.ticker.remove(f); } }; PX.app.ticker.add(f); return () => PX.app.ticker.remove(f); }

/* ---- particles ---- */
function burst(parent, x, y, { n = 14, color = 0xffffff, r = 5, speed = 6, life = 700, grav = .25, spread = Math.PI * 2, dir = -Math.PI / 2 } = {}) {
  for (let i = 0; i < n; i++) {
    const g = new PIXI.Graphics().beginFill(color).drawCircle(0, 0, r * rnd(.5, 1.2)).endFill(); g.x = x; g.y = y; g.zIndex = 50; parent.addChild(g);
    const a = dir + rnd(-spread / 2, spread / 2), v = speed * rnd(.5, 1.2); let vx = Math.cos(a) * v, vy = Math.sin(a) * v, t = 0;
    const stop = loop(() => { const d = PX.app.ticker.deltaMS / 16.7; t += PX.app.ticker.deltaMS / TS(); vy += grav * d; g.x += vx * d; g.y += vy * d; g.alpha = Math.max(0, 1 - t / life); if (t > life) { stop(); g.destroy(); } });
  }
}
function crack(parent, x, y, size = 120, color = 0xffffff) {
  const g = new PIXI.Graphics(); g.zIndex = 40; g.x = x; g.y = y; parent.addChild(g);
  g.lineStyle(3, color, .95);
  for (let i = 0; i < 9; i++) { let a = i / 9 * Math.PI * 2 + rnd(-.2, .2), px = 0, py = 0, len = size * rnd(.5, 1); g.moveTo(0, 0); for (let k = 1; k <= 4; k++) { a += rnd(-.35, .35); px += Math.cos(a) * len / 4; py += Math.sin(a) * len / 4; g.lineTo(px, py); } }
  g.lineStyle(2, color, .7); for (let k = 1; k <= 2; k++) g.drawCircle(0, 0, size * .25 * k);
  g.alpha = 0; tween(g, { alpha: 1 }, 120, 'lin');
  return g;
}
function shakeNode(o, amt = 10, ms = 400) { const x0 = o.x, y0 = o.y; let t = 0; const stop = loop(() => { t += PX.app.ticker.deltaMS / TS(); const k = Math.max(0, 1 - t / ms); o.x = x0 + rnd(-amt, amt) * k; o.y = y0 + rnd(-amt, amt) * k; if (t > ms) { stop(); o.x = x0; o.y = y0; } }); }

/* ---- labels and hotspots ---- */
function labelBox(text, { size = 30, fill = 0xFFF8EC, ink = '#17122E', accent = 0x5FE0C8 } = {}) {
  const c = new PIXI.Container(); c.zIndex = 60;
  const t = new PIXI.Text(text, { fontFamily: 'Manrope, Arial, sans-serif', fontSize: size, fontWeight: '800', fill: ink });
  const padX = 18, padY = 10, w = t.width + padX * 2, h = t.height + padY * 2;
  const g = new PIXI.Graphics(); g.beginFill(0x17122E, .25).drawRoundedRect(4, 6, w, h, h / 2).endFill(); g.beginFill(fill).lineStyle(4, accent).drawRoundedRect(0, 0, w, h, h / 2).endFill();
  t.x = padX; t.y = padY; c.addChild(g, t); c.pivot.set(w / 2, h / 2); c.__w = w; c.__h = h;
  return c;
}
function ring(parent, x, y, r = 46, color = 0xFFC27A) {
  const g = new PIXI.Graphics(); g.zIndex = 55; g.x = x; g.y = y; parent.addChild(g);
  const stop = loop(t => { const k = (t * 1.6) % 1; g.clear(); g.lineStyle(5, color, 1 - k).drawCircle(0, 0, r * (.6 + k * .8)); g.lineStyle(3, color, .8).drawCircle(0, 0, r * .45); });
  g.__stop = stop; return g;
}
function makeHot(sprite, onTap) { sprite.eventMode = 'static'; sprite.cursor = 'pointer'; sprite.on('pointertap', onTap); }
/* an invisible circular hit area for things that are part of a background */
function hotCircle(parent, x, y, r, onTap) { const g = new PIXI.Graphics().beginFill(0xffffff, .001).drawCircle(0, 0, r).endFill(); g.x = x; g.y = y; g.zIndex = 58; parent.addChild(g); makeHot(g, onTap); return g; }
/* glowing sparkle for the "Datos" gems */
function sparkle(parent, x, y, onTap) {
  const c = new PIXI.Container(); c.x = x; c.y = y; c.zIndex = 70; parent.addChild(c);
  const g = new PIXI.Graphics(); c.addChild(g);
  const draw = (k) => { g.clear(); g.beginFill(0xFFE7A8, .35 * k).drawCircle(0, 0, 26).endFill(); g.beginFill(0xFFFFFF, .95).drawPolygon([0, -24, 5, -5, 24, 0, 5, 5, 0, 24, -5, 5, -24, 0, -5, -5]).endFill(); };
  const stop = loop(t => { const k = .7 + .3 * Math.sin(t * 4 + x); draw(k); c.scale.set(.85 + .15 * k); });
  c.eventMode = 'static'; c.cursor = 'pointer'; c.hitArea = new PIXI.Circle(0, 0, 34); c.on('pointertap', () => onTap(c));
  c.__stop = stop; return c;
}
function stopAll(o) { if (o.__stop) o.__stop(); (o.children || []).forEach(stopAll); }
function clearLayer(name) { const L = PX.layers[name]; L.children.slice().forEach(ch => { stopAll(ch); ch.destroy({ children: true }); }); }
