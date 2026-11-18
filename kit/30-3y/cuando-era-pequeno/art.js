/* ===================== ART: scenes, portraits, map (all drawn in SVG, no image files) ===================== */
let __uid = 0;
const uid = p => `${p}${++__uid}`;
function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hashStr = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
function shade(hex, f) {   // f < 0 darkens toward night violet, f > 0 lightens
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255;
  if (f < 0) { const k = -f; r = r * (1 - k) + 24 * k; g = g * (1 - k) + 18 * k; b = b * (1 - k) + 52 * k; }
  else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
  return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}

/* Sky palettes: 0 = golden hour … 4 = night */
const SKY = [
  { top: '#3B2A6B', mid: '#B4577A', hor: '#FFB36B', sun: 400, stars: 0, glow: .55, volc: '#5E3F7C', volcLit: '#9A5C86', dark: .08 },
  { top: '#2E2462', mid: '#8E4D86', hor: '#F08A6A', sun: 455, stars: .15, glow: .72, volc: '#4D3672', volcLit: '#7E4E80', dark: .18 },
  { top: '#231C52', mid: '#5E3D7E', hor: '#C76A78', sun: 520, stars: .45, glow: .86, volc: '#3C2D64', volcLit: '#5E3F74', dark: .3 },
  { top: '#1A1542', mid: '#382B68', hor: '#79497C', sun: 600, stars: .75, glow: 1, volc: '#2F2657', volcLit: '#45346A', dark: .42 },
  { top: '#110E30', mid: '#221B4D', hor: '#47306C', sun: 700, stars: 1, glow: 1, volc: '#251E4A', volcLit: '#32285A', dark: .52 }
];
const FACADE_COLORS = ['#E8B04B', '#D9774B', '#C9506A', '#4E8FB8', '#E6D3A3', '#7FA65A', '#D98FA0', '#F0C987', '#B5654A'];

function skyLayer(t, rng) {
  const P = SKY[t], g = uid('sky'), sg = uid('sun');
  let s = `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.top}"/><stop offset=".55" stop-color="${P.mid}"/><stop offset="1" stop-color="${P.hor}"/></linearGradient>`
    + `<radialGradient id="${sg}"><stop offset="0" stop-color="#FFE7B0"/><stop offset=".4" stop-color="#FFC27A" stop-opacity=".7"/><stop offset="1" stop-color="#FFC27A" stop-opacity="0"/></radialGradient></defs>`
    + `<rect width="1200" height="520" fill="url(#${g})"/>`;
  if (P.stars > 0) {
    s += `<g opacity="${P.stars}">`;
    for (let i = 0; i < 70; i++) s += `<circle class="twinkle" style="animation-delay:${(rng() * 4).toFixed(2)}s" cx="${(rng() * 1200).toFixed(0)}" cy="${(rng() * 300).toFixed(0)}" r="${(rng() * 1.4 + .4).toFixed(1)}" fill="#FFF6E0"/>`;
    s += '</g>';
  }
  if (P.sun < 560) s += `<circle cx="300" cy="${P.sun}" r="170" fill="url(#${sg})"/>`;
  if (t >= 3) s += `<g class="moon"><circle cx="1010" cy="96" r="30" fill="#FFF3D6" opacity=".95"/><circle cx="1022" cy="88" r="27" fill="${P.top}" opacity=".85"/><circle cx="1010" cy="96" r="60" fill="#FFF3D6" opacity=".07"/></g>`;
  s += `<g class="clouds" opacity="${.5 - t * .08}"><ellipse cx="200" cy="140" rx="160" ry="14" fill="${shade(P.hor, .2)}"/><ellipse cx="880" cy="210" rx="210" ry="12" fill="${shade(P.mid, .25)}"/></g>`;
  return s;
}

/* ---- Montevideo backdrops ---- */
function salvoFacade(cx, base, k, t, tall = 1) {
  const P = SKY[t], c = shade('#E6D3A3', -P.dark * .8), c2 = shade(c, -.12), lit = '#FFC874';
  const parts = [[130, 140], [96, 110], [66, 86]];
  let y = base, s = '';
  parts.forEach(([w, h], i) => {
    const ww = w * k, hh = h * k * tall;
    y -= hh;
    s += `<rect x="${cx - ww / 2}" y="${y}" width="${ww}" height="${hh}" fill="${i % 2 ? c2 : c}"/>`;
    s += `<rect x="${cx - ww / 2 - 5 * k}" y="${y - 6 * k}" width="${ww + 10 * k}" height="${8 * k}" fill="${shade(c, .1)}"/>`;
    const n = Math.max(2, Math.floor(ww / (24 * k)));
    for (let j = 0; j < n; j++) { const wx = cx - ww / 2 + (j + .5) * ww / n - 4 * k; for (let r = 0; r < Math.floor(hh / (38 * k)); r++) s += `<rect x="${wx}" y="${y + 10 * k + r * 38 * k}" width="${8 * k}" height="${18 * k}" fill="${(j + r + i) % 3 ? shade('#2A2152', -.1) : lit}" opacity="${(j + r + i) % 3 ? .85 : (.45 + P.glow * .4).toFixed(2)}"/>`; }
  });
  s += `<path d="M${cx - 30 * k} ${y} Q${cx} ${y - 54 * k} ${cx + 30 * k} ${y} Z" fill="${shade('#C9A15A', -P.dark * .7)}"/><rect x="${cx - 2 * k}" y="${y - 96 * k}" width="${4 * k}" height="${46 * k}" fill="${c2}"/><circle cx="${cx}" cy="${y - 100 * k}" r="${5 * k}" fill="${lit}" class="lanternglow"/>`;
  return s;
}
function cityLayer(t) {
  const P = SKY[t], g = uid('cg');
  let s = `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(P.hor, -.05)}"/><stop offset="1" stop-color="${shade(P.mid, -.35)}"/></linearGradient></defs>`;
  s += `<rect x="-10" y="452" width="1220" height="90" fill="url(#${g})"/>`;
  for (let i = 0; i < 9; i++) s += `<path class="water" d="M${120 + i * 125} ${470 + (i % 3) * 16} h${60 + (i % 4) * 14}" stroke="${shade(P.hor, .25)}" stroke-width="3" opacity=".4"/>`;
  // El Cerro across the bay (left) with its small fortress
  s += `<path d="M-20 470 Q40 420 120 408 Q170 400 230 430 Q290 455 330 470 Z" fill="${shade(P.volc, -.1)}"/><rect x="132" y="388" width="46" height="18" fill="${shade(P.volc, -.2)}"/><rect x="140" y="378" width="8" height="12" fill="${shade(P.volc, -.2)}"/><rect x="162" y="378" width="8" height="12" fill="${shade(P.volc, -.2)}"/>`;
  // skyline + port cranes (right)
  const hs = [58, 90, 66, 120, 76, 98, 60, 84];
  hs.forEach((h, i) => { s += `<rect x="${760 + i * 56}" y="${470 - h}" width="52" height="${h + 6}" fill="${shade(P.volc, -.05 - (i % 2) * .08)}"/>`; });
  s += `<g stroke="${shade(P.volc, -.15)}" stroke-width="5" fill="none"><path d="M560 470 V420 L620 400 M560 420 L520 410"/><path d="M640 470 V430 L690 414"/></g>`;
  s += `<g transform="translate(540 0)">${salvoFacade(0, 474, .42, t, 1.15)}</g>`;
  return s;
}
function building(x, w, top, color, rng, t, opts = {}) {
  const P = SKY[t], c = shade(color, -P.dark), base = 600, tr = shade(c, .14);
  let s = `<rect x="${x}" y="${top}" width="${w}" height="${base - top}" fill="${c}"/>`;
  s += `<rect x="${x - 5}" y="${top - 14}" width="${w + 10}" height="16" fill="${tr}"/><rect x="${x - 5}" y="${top - 30}" width="${w + 10}" height="5" fill="${tr}"/>`;
  for (let k = x; k < x + w - 6; k += 14) s += `<rect x="${k + 2}" y="${top - 25}" width="6" height="11" fill="${tr}"/>`;
  s += `<rect x="${x}" y="${base - 26}" width="${w}" height="26" fill="${shade(c, -.25)}"/>`;
  const n = Math.max(2, Math.floor((w - 20) / 58));
  for (const wy of [top + 22, top + 104]) {
    for (let i = 0; i < n; i++) {
      const wx = x + (i + .5) * w / n - 20, lit = rng() < .4 + t * .13;
      s += `<rect x="${wx - 4}" y="${wy - 4}" width="48" height="72" rx="3" fill="${shade(c, -.2)}"/>`;
      s += `<rect class="${lit ? 'winglow' : ''}" x="${wx}" y="${wy}" width="40" height="64" rx="2" fill="${lit ? '#FFC874' : shade('#2A2152', -.1)}" opacity="${lit ? (.55 + P.glow * .45).toFixed(2) : .9}"/>`;
      if (lit) s += `<rect x="${wx - 14}" y="${wy - 14}" width="68" height="92" fill="#FFC874" opacity="${(.06 * P.glow).toFixed(2)}" rx="16"/>`;
      s += `<line x1="${wx + 20}" y1="${wy}" x2="${wx + 20}" y2="${wy + 64}" stroke="#1E1630" stroke-width="2.4"/><line x1="${wx}" y1="${wy + 24}" x2="${wx + 40}" y2="${wy + 24}" stroke="#1E1630" stroke-width="2"/>`;
      s += `<rect x="${wx - 6}" y="${wy + 62}" width="52" height="5" fill="${shade(c, -.3)}"/><path d="M${wx - 6} ${wy + 67} h52 M${wx - 4} ${wy + 67} v-12 M${wx + 44} ${wy + 67} v-12" stroke="#1E1630" stroke-width="2.4" fill="none"/>`;
    }
  }
  const doorX = x + w / 2 - 28;
  s += `<path d="M${doorX} ${base} V${base - 70} a28 28 0 0 1 56 0 V${base} Z" fill="${shade('#5A3A28', -P.dark)}" stroke="${shade('#3A2418', -P.dark)}" stroke-width="3"/>`;
  if (rng() < .5 + t * .1) s += `<path d="M${doorX + 8} ${base} V${base - 68} a20 20 0 0 1 40 0 V${base} Z" fill="#FFC874" opacity="${(.4 + P.glow * .4).toFixed(2)}"/>`;
  if (opts.awning) {
    const ax = x + 8, aw = w - 16, cols = ['#C9506A', '#F4F0E6'];
    s += `<g>`; for (let k = 0; k < aw; k += 20) s += `<path d="M${ax + k} ${base - 108} h20 l4 22 h-28 z" fill="${shade(cols[(k / 20) % 2], -P.dark * .6)}"/>`; s += `</g>`;
  }
  if (opts.lantern) {
    const lx = rng() < .5 ? doorX - 18 : doorX + 74, ly = base - 110, lg = uid('lg');
    s += `<defs><radialGradient id="${lg}"><stop offset="0" stop-color="#FFD98A" stop-opacity=".9"/><stop offset="1" stop-color="#FFB25A" stop-opacity="0"/></radialGradient></defs>`;
    s += `<circle class="lanternglow" cx="${lx}" cy="${ly + 14}" r="${46 + P.glow * 30}" fill="url(#${lg})" opacity="${(.35 + P.glow * .5).toFixed(2)}"/>`;
    s += `<path d="M${lx} ${ly - 14} v8" stroke="#1E1630" stroke-width="3"/><path d="M${lx - 9} ${ly - 6} h18 l-4 26 h-10 z" fill="#2A2033"/><rect x="${lx - 6}" y="${ly - 2}" width="12" height="18" fill="#FFE2A0"/>`;
  }
  return s;
}
function facadeRows(rng, t, gap = [430, 770]) {
  let s = '', x = -30;
  while (x < gap[0]) {
    const w = 150 + Math.floor(rng() * 110), wEff = Math.min(w, gap[0] - x);
    if (wEff < 90) break;
    s += building(x, wEff, 290 + Math.floor(rng() * 50), pick(FACADE_COLORS), rng, t, { lantern: rng() < .6, awning: rng() < .3 });
    x += wEff;
  }
  x = gap[1];
  while (x < 1230) {
    const w = 150 + Math.floor(rng() * 110);
    s += building(x, w, 290 + Math.floor(rng() * 50), pick(FACADE_COLORS), rng, t, { lantern: rng() < .6, awning: rng() < .3 });
    x += w;
  }
  return s;
}
function distantStreet(t, rng, landmark) {
  const P = SKY[t];
  let s = '';
  for (let i = 0; i < 4; i++) {
    const x = 440 + i * 82, h = 40 + rng() * 30;
    s += `<rect x="${x}" y="${470 - h}" width="80" height="${h + 20}" fill="${shade(pick(FACADE_COLORS), -P.dark - .25)}"/>`;
    if (rng() < .6) s += `<rect x="${x + 30}" y="${470 - h + 12}" width="12" height="16" fill="#FFC874" opacity="${(.4 + P.glow * .4).toFixed(2)}"/>`;
  }
  if (landmark === 'salvo') s += salvoFacade(600, 470, .62, t, 1);
  s += `<path d="M300 675 L540 470 L660 470 L900 675 Z" fill="${shade('#5A4A66', -P.dark)}"/>`;
  for (let r = 0; r < 9; r++) {   // square paving (panot) lines
    const y = 480 + r * r * 2.4;
    s += `<line x1="${540 - (y - 470) * 1.17}" y1="${y.toFixed(0)}" x2="${660 + (y - 470) * 1.17}" y2="${y.toFixed(0)}" stroke="${shade('#7A6A86', -P.dark)}" stroke-width="2" opacity=".35"/>`;
  }
  return s;
}
function streetFront(t) {
  const P = SKY[t];
  return `<rect x="0" y="596" width="1200" height="10" fill="${shade('#8A7A70', -P.dark)}"/><rect x="0" y="606" width="1200" height="70" fill="${shade('#4E4058', -P.dark)}"/>`;
}
function tree(x, y, r, t, col = '#2E5A40') {
  const P = SKY[t];
  return `<rect x="${x - 6}" y="${y}" width="12" height="${600 - y}" fill="${shade('#4A3426', -P.dark)}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${shade(col, -P.dark)}"/><circle cx="${x - r * .4}" cy="${y - r * .3}" r="${r * .62}" fill="${shade(col, .08 - P.dark)}" opacity=".7"/>`;
}
function lamp(x, y, t) {
  const P = SKY[t], g = uid('lp');
  return `<defs><radialGradient id="${g}"><stop offset="0" stop-color="#FFD98A" stop-opacity=".9"/><stop offset="1" stop-color="#FFB25A" stop-opacity="0"/></radialGradient></defs><rect x="${x - 3}" y="${y}" width="6" height="${600 - y}" fill="#14102A"/><circle class="lanternglow" cx="${x}" cy="${y}" r="${44 + P.glow * 30}" fill="url(#${g})" opacity="${(.35 + P.glow * .5).toFixed(2)}"/><circle cx="${x}" cy="${y}" r="10" fill="#FFE7A8"/>`;
}
function bench(x, y, t) {
  const P = SKY[t];
  return `<rect x="${x}" y="${y - 30}" width="120" height="9" rx="3" fill="${shade('#7A5236', -P.dark)}"/><rect x="${x}" y="${y}" width="120" height="9" rx="3" fill="${shade('#7A5236', -P.dark)}"/><rect x="${x + 8}" y="${y + 9}" width="8" height="30" fill="#2A1810"/><rect x="${x + 104}" y="${y + 9}" width="8" height="30" fill="#2A1810"/><rect x="${x + 8}" y="${y - 30}" width="8" height="30" fill="#2A1810"/><rect x="${x + 104}" y="${y - 30}" width="8" height="30" fill="#2A1810"/>`;
}

/* ---- props ---- */
function propBus(t) {
  const P = SKY[t];
  const body = shade('#2F8F8A', -P.dark * .6), band = shade('#F4F0E6', -P.dark * .5);
  let s = `<g class="bob"><ellipse cx="820" cy="646" rx="230" ry="12" fill="#000" opacity=".3"/>`;
  s += `<rect x="590" y="430" width="470" height="180" rx="22" fill="${body}"/><rect x="590" y="520" width="470" height="26" fill="${band}"/><rect x="590" y="560" width="470" height="14" fill="${shade(body, -.25)}"/>`;
  for (let i = 0; i < 5; i++) s += `<rect x="${612 + i * 78}" y="452" width="64" height="58" rx="6" fill="#1E1630" opacity=".78"/><rect x="${618 + i * 78}" y="458" width="26" height="46" fill="#9FC7E6" opacity=".22"/>`;
  s += `<rect x="974" y="452" width="68" height="100" rx="6" fill="#1E1630" opacity=".85"/><line x1="1008" y1="452" x2="1008" y2="552" stroke="${body}" stroke-width="3"/>`;
  s += `<rect x="1000" y="414" width="60" height="22" rx="4" fill="#14102A"/><text x="1030" y="431" text-anchor="middle" font-family="Unbounded, sans-serif" font-weight="700" font-size="16" fill="#FFB347">1·7</text>`;
  s += `<circle cx="604" cy="592" r="10" fill="#FF6A3D" opacity=".9"/><circle cx="1050" cy="590" r="10" fill="#FFE7A8"/><circle cx="1050" cy="590" r="${44 + P.glow * 30}" fill="#FFE7A8" opacity="${(.12 + P.glow * .1).toFixed(2)}"/>`;
  s += [[690, 620], [960, 620]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="28" fill="#14102A"/><circle cx="${a}" cy="${b}" r="11" fill="#8A8295"/>`).join('') + `</g>`;
  s += `<rect x="470" y="420" width="8" height="186" fill="#14102A"/><rect x="440" y="400" width="68" height="34" rx="5" fill="#C9A15A"/><text x="474" y="423" text-anchor="middle" font-family="Unbounded, sans-serif" font-weight="700" font-size="12" fill="#17122E">PARADA</text>`;
  return s;
}
function propPlaza(t) {
  const P = SKY[t];
  let s = `<rect x="0" y="560" width="1200" height="120" fill="${shade('#8A7A86', -P.dark)}"/>`;
  for (let r = 0; r < 5; r++) s += `<line x1="0" y1="${560 + r * r * 5 + 8}" x2="1200" y2="${560 + r * r * 5 + 8}" stroke="${shade('#6A5A76', -P.dark)}" stroke-width="2" opacity=".5"/>`;
  s += tree(110, 400, 100, t) + tree(1090, 390, 110, t) + lamp(330, 440, t) + lamp(900, 440, t) + bench(120, 560, t);
  // chalk hopscotch on the pavement
  const cell = [[1, 0, 0], [2, -1, 1], [3, 1, 1], [4, 0, 2], [5, -1, 3], [6, 1, 3], [7, 0, 4], [8, -1, 5], [9, 1, 5], [10, 0, 6]];
  s += `<g stroke="#F4F0E6" stroke-width="3" fill="rgba(244,240,230,.08)" opacity=".85">`;
  cell.forEach(([n, dx, dy]) => { const y = 668 - (dy + 1) * 14 - dy * 2, w = 46 - dy * 2, x = 760 + dx * w - w / 2 + (dy > 5 ? 0 : 0); s += `<rect x="${x}" y="${y}" width="${w}" height="14" rx="1"/>`; });
  s += `</g>`;
  return s;
}
function propPark(t) {
  const P = SKY[t];
  let s = `<rect x="0" y="560" width="1200" height="120" fill="${shade('#3E7A4A', -P.dark)}"/>`;
  // ferris wheel (Parque Rodó)
  const cx = 900, cy = 360, R = 120;
  s += `<g opacity=".95"><circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${shade('#9A92A8', -P.dark)}" stroke-width="5"/><circle cx="${cx}" cy="${cy}" r="${R * .55}" fill="none" stroke="${shade('#9A92A8', -P.dark)}" stroke-width="3"/>`;
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a); s += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(0)}" y2="${y.toFixed(0)}" stroke="${shade('#9A92A8', -P.dark)}" stroke-width="3"/><rect class="winglow" x="${(x - 8).toFixed(0)}" y="${(y - 6).toFixed(0)}" width="16" height="14" rx="3" fill="${['#FF9A6B', '#5FE0C8', '#F28FAD', '#F2C14E'][i % 4]}"/>`; }
  s += `<path d="M${cx - 60} 600 L${cx} ${cy} L${cx + 60} 600" stroke="${shade('#9A92A8', -P.dark)}" stroke-width="6" fill="none"/></g>`;
  s += tree(120, 410, 120, t) + tree(430, 440, 86, t) + tree(1100, 420, 110, t) + lamp(560, 450, t) + bench(200, 575, t);
  s += `<ellipse cx="700" cy="610" rx="150" ry="22" fill="${shade('#6A6280', -P.dark)}"/><ellipse cx="700" cy="602" rx="142" ry="18" fill="${shade('#3E6E9E', -P.dark)}" opacity=".9"/><rect x="688" y="530" width="24" height="76" fill="${shade('#9A92A8', -P.dark)}"/><g class="water"><path d="M700 520 q-24 24 -48 50 M700 520 q24 24 48 50" stroke="#9FD3F0" stroke-width="3" fill="none" opacity=".6"/></g>`;
  return s;
}
function propKiosco(t) {
  const P = SKY[t];
  let s = `<rect x="0" y="596" width="1200" height="80" fill="${shade('#4E4058', -P.dark)}"/>`;
  s += lamp(210, 430, t);
  s += `<rect x="420" y="330" width="600" height="270" fill="${shade('#2F6C8A', -P.dark * .6)}"/>`;
  for (let k = 0; k < 600; k += 40) s += `<path d="M${420 + k} 330 h40 l6 34 h-52 z" fill="${shade(k % 80 ? '#F4F0E6' : '#D8433E', -P.dark * .6)}"/>`;
  s += `<rect x="440" y="380" width="560" height="140" fill="${shade('#1E1630', 0)}" opacity=".78"/>`;
  const cols = ['#D8433E', '#3E7BD8', '#F2C14E', '#3FA36B', '#8A4FC7', '#E07A2F'];
  for (let r = 0; r < 3; r++) for (let i = 0; i < 12; i++) s += `<rect x="${458 + i * 45}" y="${392 + r * 40}" width="36" height="32" rx="3" fill="${shade(cols[(i + r * 2) % 6], -P.dark * .5)}"/><circle cx="${476 + i * 45}" cy="${402 + r * 40}" r="6" fill="#F4F0E6" opacity=".8"/>`;
  s += `<rect x="410" y="520" width="620" height="22" fill="#7A5236"/><rect x="420" y="542" width="600" height="58" fill="${shade('#2F6C8A', -P.dark * .7)}"/>`;
  s += `<rect x="540" y="498" width="70" height="22" rx="3" fill="#F4F0E6"/><rect x="560" y="480" width="70" height="18" fill="#E8B83A"/>`;
  return s;
}
function propCandombe(t) {
  const P = SKY[t];
  let s = '';
  const flags = ['#D8433E', '#F2C14E', '#3E7BD8', '#3FA36B', '#F28FAD'];
  for (let i = 0; i < 20; i++) { const x = i * 62, y = 120 + Math.sin(i * .6) * 14; s += `<path d="M${x} ${y} l22 0 l-11 30 z" fill="${shade(flags[i % 5], -P.dark * .5)}" class="sway" style="animation-delay:${i * .12}s"/>`; }
  s += `<path d="M-10 118 Q600 164 1210 118" stroke="#14102A" stroke-width="2" fill="none"/>`;
  s += `<rect x="0" y="596" width="1200" height="80" fill="${shade('#4E4058', -P.dark)}"/>`;
  const drums = [[470, 590], [620, 600], [770, 590]];
  drums.forEach(([x, y], i) => {
    const h = 110 - i % 2 * 14, w = 66 + (i === 1 ? 14 : 0);
    s += `<g class="bob" style="animation-delay:${i * .3}s"><ellipse cx="${x}" cy="${y + 28}" rx="${w}" ry="8" fill="#000" opacity=".3"/><path d="M${x - w / 2} ${y - h} h${w} l-6 ${h} h-${w - 12} z" fill="${shade(['#7A3B2A', '#9A5A32', '#6A2F3A'][i], -P.dark * .5)}"/><ellipse cx="${x}" cy="${y - h}" rx="${w / 2}" ry="9" fill="#E6D3A3"/>`;
    for (let k = 0; k < 5; k++) s += `<path d="M${x - w / 2 + 6 + k * (w - 12) / 4} ${y - h + 8} l${(k % 2 ? 6 : -6)} ${h - 10}" stroke="#E6D3A3" stroke-width="2" opacity=".7"/>`;
    s += `</g>`;
  });
  // dancers
  [[260, 480, '#F28FAD'], [330, 500, '#F2C14E'], [920, 490, '#5FE0C8'], [1000, 480, '#D8433E']].forEach(([x, y, c], i) => { s += `<g class="sway" style="animation-delay:${i * .25}s"><circle cx="${x}" cy="${y - 56}" r="13" fill="${shade('#8E5A44', -P.dark * .5)}"/><path d="M${x - 30} ${y + 60} Q${x} ${y - 40} ${x + 30} ${y + 60} Z" fill="${shade(c, -P.dark * .5)}"/><rect x="${x - 12}" y="${y - 44}" width="24" height="40" rx="8" fill="${shade(c, -P.dark * .5)}"/></g>`; });
  return s;
}
function propEscuela(t) {
  const P = SKY[t];
  let s = `<rect x="0" y="560" width="1200" height="120" fill="${shade('#8A7A86', -P.dark)}"/>`;
  s += `<rect x="300" y="300" width="760" height="262" fill="${shade('#F4F0E6', -P.dark * .8)}"/><rect x="290" y="286" width="780" height="18" fill="${shade('#3E7BD8', -P.dark * .7)}"/><path d="M570 286 L680 236 L790 286 Z" fill="${shade('#3E7BD8', -P.dark * .7)}"/>`;
  for (let i = 0; i < 7; i++) { if (i === 3) continue; const x = 330 + i * 100, lit = (i % 3) !== 1; s += `<rect x="${x}" y="350" width="56" height="86" rx="4" fill="${lit ? '#FFC874' : '#2A2152'}" opacity="${lit ? (.5 + P.glow * .4).toFixed(2) : .9}"/><line x1="${x + 28}" y1="350" x2="${x + 28}" y2="436" stroke="#1E1630" stroke-width="3"/>`; }
  s += `<path d="M640 562 V470 a40 40 0 0 1 80 0 V562 Z" fill="${shade('#3A2418', -P.dark * .3)}"/><rect x="600" y="520" width="160" height="10" fill="#3E7BD8" opacity=".5"/>`;
  // flag
  s += `<rect x="200" y="170" width="7" height="392" fill="#C9C4D6"/>`;
  for (let i = 0; i < 9; i++) s += `<rect class="sway" x="207" y="${176 + i * 9}" width="90" height="9" fill="${i % 2 ? '#3E7BD8' : '#F4F0E6'}"/>`;
  s += `<rect x="207" y="176" width="40" height="45" fill="#F4F0E6"/><circle cx="227" cy="198" r="11" fill="#F2C14E"/>`;
  s += tree(1120, 430, 100, t) + tree(110, 450, 80, t);
  s += `<g stroke="#2A2033" stroke-width="3">`; for (let x = 260; x < 1100; x += 40) s += `<line x1="${x}" y1="520" x2="${x}" y2="590"/>`; s += `<line x1="260" y1="540" x2="1060" y2="540"/></g>`;
  return s;
}
function propCasa(t) {
  const P = SKY[t];
  let s = `<rect x="0" y="0" width="1200" height="610" fill="${shade('#E8C99A', -P.dark * .9)}"/>`;
  s += `<rect x="70" y="90" width="300" height="360" rx="150" ry="150" fill="#14102A"/>`;
  s += `<svg x="78" y="98" width="284" height="344" viewBox="400 120 520 640" preserveAspectRatio="xMidYMid slice">${skyLayer(t, mulberry(5))}${cityLayer(t)}</svg>`;
  s += `<path d="M70 450 V240 a150 150 0 0 1 300 0 V450" stroke="#7A5236" stroke-width="12" fill="none"/><path d="M220 90 V450 M70 270 H370" stroke="#7A5236" stroke-width="7"/>`;
  [[620, 120], [740, 100], [860, 130]].forEach(([x, y], i) => { s += `<rect x="${x}" y="${y}" width="84" height="104" fill="#7A5236"/><rect x="${x + 8}" y="${y + 8}" width="68" height="88" fill="${['#C9A15A', '#B8B4C4', '#8A5A3A'][i]}"/>`; });
  [[420, 40], [1050, 36]].forEach(([x, y], i) => { s += `<line x1="${x}" y1="0" x2="${x}" y2="${y + 20}" stroke="#14102A" stroke-width="2"/><circle class="bulb" style="animation-delay:${i * .5}s" cx="${x}" cy="${y + 28}" r="16" fill="#FFE7A8" opacity="${(.5 + P.glow * .4).toFixed(2)}"/>`; });
  s += `<rect x="0" y="520" width="1200" height="160" fill="#7A5236"/>`;
  s += `<rect x="360" y="440" width="640" height="26" fill="#C9506A"/><path d="M360 466 h640 v14 h-640z" fill="#F4F0E6"/>`;
  for (let i = 0; i < 16; i++) s += `<rect x="${360 + i * 40}" y="440" width="20" height="26" fill="#F4F0E6" opacity=".55"/>`;
  s += `<rect x="380" y="466" width="14" height="100" fill="#3A2418"/><rect x="966" y="466" width="14" height="100" fill="#3A2418"/>`;
  // thermos + mate + plate of tortas fritas
  s += `<rect x="560" y="360" width="34" height="80" rx="9" fill="#B8B4C4"/><rect x="560" y="372" width="34" height="14" fill="#3E7BD8"/><path d="M640 412 q-6 -34 28 -34 q34 0 28 34 z" fill="#8A5A3A"/><rect x="662" y="352" width="5" height="34" fill="#C0C0C0"/>`;
  s += `<ellipse cx="800" cy="440" rx="80" ry="14" fill="#F4F0E6"/>`;
  for (let i = 0; i < 6; i++) s += `<circle cx="${760 + (i % 3) * 34}" cy="${430 - Math.floor(i / 3) * 10}" r="16" fill="#E0A04A"/>`;
  s += `<g class="steam"><path d="M577 350 q-8 -18 0 -36 q8 -18 0 -36" stroke="#F4F0E6" stroke-width="3" fill="none" opacity=".35"/></g>`;
  return s;
}
function propCafe(t) {
  const P = SKY[t];
  let s = `<rect x="0" y="0" width="1200" height="610" fill="#3A2633"/>`;
  s += `<rect x="560" y="60" width="560" height="380" rx="10" fill="#14102A"/>`;
  s += `<g clip-path="inset(0)"><svg x="566" y="66" width="548" height="368" viewBox="380 120 800 520" preserveAspectRatio="xMidYMid slice">${skyLayer(t, mulberry(7))}${cityLayer(t)}</svg></g>`;
  s += `<path d="M840 60 V440 M560 250 H1120" stroke="#3A2633" stroke-width="10"/>`;
  s += `<rect x="60" y="250" width="420" height="190" rx="8" fill="#2A1A24" stroke="#7A5236" stroke-width="8"/>`;
  const cols = ['#E0A04A', '#C9506A', '#F4F0E6', '#8A5A3A'];
  for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) s += `<ellipse cx="${100 + i * 62}" cy="${290 + r * 52}" rx="24" ry="${r === 1 ? 14 : 18}" fill="${cols[(i + r) % 4]}" opacity=".95"/>`;
  s += `<rect x="70" y="100" width="400" height="20" fill="#5A3A28"/>`;
  for (let i = 0; i < 7; i++) s += `<rect x="${86 + i * 54}" y="58" width="40" height="42" rx="6" fill="${['#C9A15A', '#8A5A3A', '#E6D3A3'][i % 3]}"/>`;
  [200, 520, 840, 1100].forEach((x, i) => { s += `<line x1="${x}" y1="0" x2="${x}" y2="${60 + i % 2 * 20}" stroke="#14102A" stroke-width="2"/><circle class="bulb" style="animation-delay:${i * .5}s" cx="${x}" cy="${72 + i % 2 * 20}" r="16" fill="#FFE7A8" opacity="${(.5 + P.glow * .4).toFixed(2)}"/>`; });
  s += `<rect x="0" y="520" width="1200" height="160" fill="#5A3A28"/><rect x="0" y="508" width="1200" height="18" fill="#7A5236"/>`;
  s += `<rect x="700" y="420" width="150" height="90" rx="10" fill="#B8B4C4"/><rect x="716" y="436" width="118" height="20" rx="4" fill="#5A5468"/>`;
  s += `<g class="steam"><path d="M960 470 q-8 -18 0 -36 q8 -18 0 -36" stroke="#F4F0E6" stroke-width="3" fill="none" opacity=".35"/></g><path d="M940 476 h44 v28 a12 12 0 0 1 -12 12 h-20 a12 12 0 0 1 -12 -12 z" fill="#F4F0E6"/>`;
  return s;
}

/* Full scene: cfg = { props, landmark }, t = 0..4 */
function sceneSVG(cfg, t, seed) {
  const rng = mulberry(seed || 1);
  const pr = cfg.props;
  let back = `<g class="plx" data-depth="4">${skyLayer(t, rng)}</g><g class="plx" data-depth="9">${cityLayer(t)}</g>`;
  let mid = '', front = '';
  if (pr === 'confiteria') { front = propCafe(t); back = ''; }
  else if (pr === 'casa') { front = propCasa(t); back = ''; }
  else {
    mid = `<g class="plx" data-depth="16">${distantStreet(t, rng, cfg.landmark)}</g>`;
    if (pr === 'park') front = propPark(t);
    else if (pr === 'escuela') front = propEscuela(t);
    else if (pr === 'plaza') front = facadeRows(rng, t) + propPlaza(t);
    else {
      front = facadeRows(rng, t) + streetFront(t);
      if (pr === 'bus') front += propBus(t);
      if (pr === 'kiosco') front = facadeRows(rng, t, [330, 1100]) + propKiosco(t);
      if (pr === 'candombe') front = facadeRows(rng, t) + propCandombe(t);
    }
  }
  const vg = uid('vig');
  return `<svg class="scene" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><radialGradient id="${vg}" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0A0720" stop-opacity=".55"/></radialGradient></defs>`
    + back + mid + `<g class="plx" data-depth="26">${front}</g><rect width="1200" height="675" fill="url(#${vg})" pointer-events="none"/></svg>`;
}

/* ---- portraits ---- */
function bustSVG(L = {}) {
  const skin = L.skin || '#A86E50', hair = L.hair || '#1E1612', col = L.color || '#3E7BD8', acc = L.accent || '#F2C14E';
  const st = L.style || 'short', old = L.age === 'old', clip = uid('tc'), bg = uid('pb');
  let s = `<svg viewBox="0 0 200 220" aria-hidden="true"><defs><radialGradient id="${bg}" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="#7B4A80"/><stop offset="1" stop-color="#2A2152"/></radialGradient>`
    + `<clipPath id="${clip}"><path d="M18 222 C 20 168 54 146 100 146 C 146 146 180 168 182 222 Z"/></clipPath></defs><rect width="200" height="220" fill="url(#${bg})"/>`;
  if (st === 'long') s += `<path d="M56 86 C 44 150 52 196 64 214 L 136 214 C 148 196 156 150 144 86 Z" fill="${hair}"/>`;
  s += `<path d="M18 222 C 20 168 54 146 100 146 C 146 146 180 168 182 222 Z" fill="${col}"/>`;
  if (L.outfit === 'huipil') {
    s += `<g clip-path="url(#${clip})">`;
    for (let r = 0; r < 4; r++) s += `<path d="M0 ${170 + r * 14} l10 -7 l10 7 l10 -7 l10 7 l10 -7 l10 7 l10 -7 l10 7 l10 -7 l10 7 l10 -7 l10 7 l10 -7 l10 7 l10 -7 l10 7 l10 -7 l10 7 l10 -7 l10 7" stroke="${r % 2 ? acc : '#F4F0E6'}" stroke-width="3.5" fill="none"/>`;
    s += `</g><path d="M80 150 L100 172 L120 150" fill="${acc}"/>`;
  } else if (L.outfit === 'uniform') {
    s += `<path d="M78 150 L100 176 L122 150 L112 148 L100 162 L88 148 Z" fill="#E8E4F0"/><path d="M100 176 L96 222 H104 Z" fill="#14102A"/><path d="M128 178 l8 -4 l8 4 v10 l-8 6 l-8 -6 z" fill="#E8B83A"/>`;
  } else if (L.outfit === 'apron') {
    s += `<path d="M66 176 Q100 168 134 176 L138 222 H62 Z" fill="${acc}"/><path d="M76 176 L86 150 M124 176 L114 150" stroke="${acc}" stroke-width="5"/>`;
  } else if (L.outfit === 'jacket') {
    s += `<path d="M84 148 L100 190 L116 148 Z" fill="#E8E4F0"/><path d="M84 148 L70 200 L100 190 Z M116 148 L130 200 L100 190 Z" fill="${shade(col, -.25)}"/>`;
  } else {
    s += `<path d="M84 148 L100 168 L116 148 Z" fill="${shade(col, -.2)}"/>`;
  }
  s += `<rect x="86" y="118" width="28" height="36" rx="11" fill="${shade(skin, -.12)}"/>`;
  s += `<ellipse cx="62" cy="92" rx="7" ry="10" fill="${shade(skin, -.06)}"/><ellipse cx="138" cy="92" rx="7" ry="10" fill="${shade(skin, -.06)}"/>`;
  s += `<ellipse cx="100" cy="88" rx="38" ry="43" fill="${skin}"/>`;
  if (st === 'short') s += `<path d="M62 84 C 60 52 80 42 100 42 C 124 42 142 54 138 84 C 132 70 120 62 100 62 C 82 62 70 70 62 84 Z" fill="${hair}"/>`;
  if (st === 'curly') { s += `<g fill="${hair}">`; [[70, 60], [84, 48], [100, 44], [116, 48], [130, 60], [64, 76], [136, 76]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="13"/>`; }); s += '</g>'; }
  if (st === 'long' || st === 'braid' || st === 'bun') s += `<path d="M60 92 C 58 50 82 40 100 40 C 120 40 142 50 140 92 C 132 70 118 58 100 60 C 84 58 70 70 60 92 Z" fill="${hair}"/><path d="M100 42 V60" stroke="${shade(hair, .15)}" stroke-width="2"/>`;
  if (st === 'bun') s += `<circle cx="100" cy="36" r="15" fill="${hair}"/>`;
  if (st === 'braid') s += `<g fill="${hair}"><ellipse cx="146" cy="130" rx="9" ry="13"/><ellipse cx="148" cy="152" rx="8" ry="12"/><ellipse cx="149" cy="172" rx="7" ry="11"/></g><path d="M142 104 q8 10 4 26" stroke="${hair}" stroke-width="10" fill="none"/><circle cx="149" cy="186" r="5" fill="${acc}"/>`;
  if (st === 'bald') s += `<path d="M62 92 C 60 76 64 66 70 62 L72 92 Z M138 92 C 140 76 136 66 130 62 L128 92 Z" fill="${hair}"/>`;
  s += `<path d="M78 80 q9 -5 18 0 M104 80 q9 -5 18 0" stroke="${shade(hair, -.1)}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  s += `<ellipse cx="87" cy="92" rx="4.2" ry="5" fill="#1C1733"/><ellipse cx="113" cy="92" rx="4.2" ry="5" fill="#1C1733"/><circle cx="88.5" cy="90" r="1.4" fill="#FFE7A8"/><circle cx="114.5" cy="90" r="1.4" fill="#FFE7A8"/>`;
  s += `<path d="M100 96 q-4 10 0 14" stroke="${shade(skin, -.25)}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  s += `<circle cx="78" cy="106" r="7" fill="#E06F7A" opacity=".22"/><circle cx="122" cy="106" r="7" fill="#E06F7A" opacity=".22"/>`;
  if (old) s += `<path d="M74 100 q-4 4 -2 8 M126 100 q4 4 2 8 M90 70 q10 -3 20 0" stroke="${shade(skin, -.25)}" stroke-width="1.6" fill="none"/>`;
  if (L.beard) s += `<path d="M66 100 C 70 136 90 140 100 140 C 110 140 130 136 134 100 C 128 118 116 126 100 126 C 84 126 72 118 66 100 Z" fill="${hair}"/>`;
  if (L.mustache) s += `<path d="M86 116 C 92 110 98 112 100 115 C 102 112 108 110 114 116 C 108 118 104 118 100 117 C 96 118 92 118 86 116 Z" fill="${hair}"/>`;
  s += `<path d="M90 122 Q100 129 110 122" stroke="#4A2030" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  if (L.glasses) s += `<g fill="none" stroke="#1C1733" stroke-width="2.4"><circle cx="87" cy="92" r="10"/><circle cx="113" cy="92" r="10"/><path d="M97 92 h6"/></g>`;
  if (L.hat === 'sombrero') s += `<ellipse cx="100" cy="56" rx="72" ry="13" fill="#D9B36A"/><path d="M68 56 C 70 26 84 18 100 18 C 116 18 130 26 132 56 Z" fill="#E6C37A"/><rect x="69" y="44" width="62" height="8" fill="#7A3B2A"/>`;
  if (L.hat === 'cap') s += `<path d="M62 70 C 62 40 80 34 100 34 C 122 34 138 42 138 70 Z" fill="${L.outfit === 'uniform' ? '#1E2A4A' : shade(col, -.2)}"/><path d="M62 68 Q50 72 46 78 L100 74 Z" fill="${L.outfit === 'uniform' ? '#14102A' : shade(col, -.4)}"/>${L.outfit === 'uniform' ? '<circle cx="100" cy="52" r="6" fill="#E8B83A"/>' : ''}`;
  return s + '</svg>';
}


/* ---- map of Montevideo (schematic grid; Ciudad Vieja west, the Rambla along the south coast) ---- */
const MAP = { x0: 190, dx: 130, y0: 90, dy: 92, cols: 7, rows: 6 };
const nodeXY = (c, r) => [MAP.x0 + (c - 1) * MAP.dx, MAP.y0 + (r - 1) * MAP.dy];
function glyphSVG(kind, x, y, color) {
  const G = {
    statue: `<rect x="-10" y="2" width="20" height="8" fill="${color}"/><rect x="-3" y="-12" width="6" height="14" fill="${color}"/><path d="M-9 -12 q9 -14 18 0z" fill="#CFC6EC"/>`,
    tower: `<rect x="-8" y="-4" width="16" height="14" fill="${color}"/><rect x="-5" y="-16" width="10" height="12" fill="${color}"/><rect x="-3" y="-24" width="6" height="8" fill="${color}"/><path d="M0 -32 V-24" stroke="${color}" stroke-width="2"/>`,
    theater: `<path d="M-16 8 V-4 L0 -14 L16 -4 V8 Z" fill="${color}"/><path d="M-10 8 V0 M-3 8 V0 M4 8 V0 M11 8 V0" stroke="#2A2033" stroke-width="3"/>`,
    stall: `<path d="M-16 -4 L0 -16 L16 -4 Z" fill="${color}"/><rect x="-12" y="-4" width="24" height="12" fill="#5A3A28"/>`,
    drum: `<path d="M-9 -10 h18 l-3 20 h-12 z" fill="${color}"/><ellipse cx="0" cy="-10" rx="9" ry="3" fill="#E6D3A3"/><path d="M-6 -8 l2 16 M0 -8 v16 M6 -8 l-2 16" stroke="#E6D3A3" stroke-width="1.5" opacity=".7"/>`,
    ferris: `<circle cx="0" cy="-4" r="14" fill="none" stroke="${color}" stroke-width="3"/><path d="M0 -18 V10 M-14 -4 H14 M-10 -14 L10 6 M10 -14 L-10 6" stroke="${color}" stroke-width="1.6"/><path d="M-8 10 L0 -4 L8 10" stroke="${color}" stroke-width="3" fill="none"/>`,
    stadium: `<ellipse cx="0" cy="2" rx="18" ry="10" fill="${color}"/><ellipse cx="0" cy="2" rx="10" ry="5" fill="#2E5A40"/>`,
    wave: `<path d="M-16 4 q4 -10 8 0 t8 0 t8 0 t8 0" stroke="${color}" stroke-width="4" fill="none"/><path d="M-16 -4 q4 -10 8 0 t8 0 t8 0 t8 0" stroke="${color}" stroke-width="3" fill="none" opacity=".6"/>`,
    door: `<circle r="18" fill="#FFC27A" opacity=".18"/><path d="M-9 9 V-4 a9 9 0 0 1 18 0 V9 Z" fill="#FFC27A"/><circle cx="4" cy="2" r="1.6" fill="#17122E"/>`,
    bed: `<path d="M-12 8 V-6 h24 V8 M-12 2 h24" stroke="${color}" stroke-width="3" fill="none"/><rect x="-14" y="-8" width="28" height="6" rx="2" fill="${color}" opacity=".6"/>`
  };
  return G[kind] ? `<g transform="translate(${x} ${y})">${G[kind]}</g>` : `<circle cx="${x}" cy="${y}" r="8" fill="${color}"/>`;
}
function mapBaseSVG(t, rng) {
  const P = SKY[Math.min(t, 4)];
  const W = 1200, H = 675, g = uid('mg');
  let s = `<defs><radialGradient id="${g}" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#2C2454"/><stop offset="1" stop-color="#140F30"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#${g})"/>`;
  // Río de la Plata along the south edge
  s += `<path d="M0 596 Q300 570 600 592 T1200 580 V675 H0 Z" fill="#26397E"/><path d="M0 622 Q300 600 600 620 T1200 610" stroke="#4B66B8" stroke-width="2" fill="none" opacity=".5"/><path d="M0 648 Q300 630 600 646 T1200 640" stroke="#4B66B8" stroke-width="2" fill="none" opacity=".35"/>`;
  s += `<text class="mlbl" x="600" y="660" text-anchor="middle" opacity=".7">Río de la Plata</text>`;
  // El Cerro, across the bay (bottom-left corner)
  s += `<path d="M0 596 Q40 546 100 540 Q150 538 190 570 L210 596 Z" fill="${P.volcLit}" opacity=".9"/><rect x="88" y="522" width="26" height="14" fill="${P.volc}"/><text class="mlbl" x="104" y="516" text-anchor="middle" opacity=".7">El Cerro</text>`;
  // blocks
  for (let c = 1; c < MAP.cols; c++) for (let r = 1; r < MAP.rows; r++) {
    const [x, y] = nodeXY(c, r);
    if (c === 5 && r === 4) { s += `<rect x="${x + 9}" y="${y + 9}" width="${MAP.dx - 18}" height="${MAP.dy - 18}" rx="10" fill="#22503F"/><circle cx="${x + MAP.dx / 2 + 22}" cy="${y + MAP.dy / 2 + 14}" r="12" fill="#3E6E9E"/>`; continue; }
    if (c === 6 && r === 1) { s += `<rect x="${x + 9}" y="${y + 9}" width="${MAP.dx - 18}" height="${MAP.dy - 18}" rx="14" fill="#22503F"/>`; continue; }
    const col = shade(pick(FACADE_COLORS), -.62);
    s += `<rect x="${x + 9}" y="${y + 9}" width="${MAP.dx - 18}" height="${MAP.dy - 18}" rx="8" fill="${col}"/>`;
    s += `<rect x="${x + 22}" y="${y + 22}" width="${MAP.dx - 44}" height="${MAP.dy - 44}" rx="4" fill="${shade(col, -.25)}"/>`;
    for (let k = 0; k < 3; k++) if (rng() < .6) s += `<rect class="winglow" x="${(x + 14 + rng() * (MAP.dx - 34)).toFixed(0)}" y="${(y + 12 + rng() * (MAP.dy - 28)).toFixed(0)}" width="4" height="4" fill="#FFC874" opacity="${(.4 + rng() * .5).toFixed(2)}"/>`;
  }
  // streets (Av. 18 de Julio runs along row 2; the Rambla is the last row)
  for (let c = 1; c <= MAP.cols; c++) { const [x] = nodeXY(c, 1); s += `<line x1="${x}" y1="${MAP.y0 - 30}" x2="${x}" y2="${nodeXY(1, MAP.rows)[1]}" stroke="#4B4185" stroke-width="3" opacity=".9"/>`; }
  for (let r = 1; r <= MAP.rows; r++) { const [, y] = nodeXY(1, r); s += `<line x1="${MAP.x0 - 40}" y1="${y}" x2="${nodeXY(MAP.cols, 1)[0] + 40}" y2="${y}" stroke="${r === 2 ? '#6B5FB8' : r === MAP.rows ? '#7A6BC8' : '#4B4185'}" stroke-width="${r === 2 ? 6 : r === MAP.rows ? 7 : 3}" opacity=".9"/>`; }
  s += `<text class="mlbl street" x="${nodeXY(4, 2)[0]}" y="${nodeXY(1, 2)[1] - 12}" text-anchor="middle">${esc(STREETS.avenue)}</text>`;
  s += `<text class="mlbl street" x="${nodeXY(4, MAP.rows)[0]}" y="${nodeXY(1, MAP.rows)[1] + 22}" text-anchor="middle">${esc(STREETS.rambla)}</text>`;
  s += `<g transform="translate(1150 90)"><circle r="20" fill="none" stroke="#5FE0C8" stroke-width="2" opacity=".6"/><path d="M0 -16 L6 4 L0 0 L-6 4 Z" fill="#5FE0C8"/><text class="mlbl" y="34" text-anchor="middle">N</text></g>`;
  // landmarks
  for (const [k, L] of Object.entries(LANDMARKS)) {
    const [x, y] = nodeXY(L.col, L.row);
    s += `<g class="lm" data-lm="${k}">${glyphSVG(L.glyph, x, y - 20, L.color)}<text class="mlbl lmname" x="${x}" y="${y + 30}" text-anchor="middle">${esc(capFirst(L.name.replace(/^(el|la) /, '')))}</text></g>`;
  }
  return s;
}
