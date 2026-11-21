/* ===================== City scenes ===================== */
/* Each returns { back, front, seal: [cx, cy, r, svg], gems: { id: [cx, cy, r, svg] } } in a 760 × 420 view. */
const DUSK = ['#241D4D', '#6A3F7E', '#E7896A'];
const WIT_X = [160, 340, 520], FEET = 388;

function sunStone(cx, cy, r) {
  let s = shadowE(cx, cy + r + 18, r * 0.9, 6) + `<rect x="${cx - r * 0.35}" y="${cy + r * 0.6}" width="${r * 0.7}" height="${r * 0.55}" fill="${G('#5A4A44')}"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${RG('#9A8C80', [0.25, -0.35])}"/>`;
  [0.86, 0.66, 0.42, 0.2].forEach(k => { s += `<circle cx="${cx}" cy="${cy}" r="${r * k}" fill="none" stroke="#5E5048" stroke-width="2"/>`; });
  for (let i = 0; i < 20; i++) { const a = i * Math.PI / 10; s += `<circle cx="${cx + Math.cos(a) * r * 0.76}" cy="${cy + Math.sin(a) * r * 0.76}" r="${r * 0.05}" fill="#5E5048"/>`; }
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; s += `<path d="M${cx + Math.cos(a) * r * 0.44} ${cy + Math.sin(a) * r * 0.44} L${cx + Math.cos(a + 0.18) * r * 0.64} ${cy + Math.sin(a + 0.18) * r * 0.64} L${cx + Math.cos(a - 0.18) * r * 0.64} ${cy + Math.sin(a - 0.18) * r * 0.64} Z" fill="#6E6058"/>`; }
  return s + `<circle cx="${cx}" cy="${cy}" r="${r * 0.15}" fill="#6E6058"/><circle class="seal-glow" cx="${cx}" cy="${cy}" r="${r * 0.15}" fill="#FFC27A" opacity=".7"/>`;
}
function board(cx, cy, w, h, title, inner = '') { // an information board on two legs
  return shadowE(cx, cy + h / 2 + 46, w * 0.5, 5) + `<rect x="${cx - w * 0.4}" y="${cy + h / 2 - 4}" width="5" height="50" fill="${G('#5A3A22')}"/><rect x="${cx + w * 0.4 - 5}" y="${cy + h / 2 - 4}" width="5" height="50" fill="${G('#5A3A22')}"/>`
    + `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="5" fill="${G('#7A4A22')}"/><rect x="${cx - w / 2 + 5}" y="${cy - h / 2 + 5}" width="${w - 10}" height="${h - 10}" rx="3" fill="#F2E2C0"/>`
    + `<text x="${cx}" y="${cy - h / 2 + 17}" text-anchor="middle" font-size="7.5" font-weight="800" fill="#7A3B1A" font-family="Manrope, sans-serif">${title}</text>${inner}<circle class="seal-glow" cx="${cx + w / 2 - 10}" cy="${cy - h / 2 + 10}" r="5" fill="#FFC27A"/>`;
}
function stall(x, y, w, c) { // a market stall: counter, awning, posts
  return shadowE(x + w / 2, y + 44, w * 0.55, 5) + `<rect x="${x}" y="${y - 70}" width="4" height="70" fill="#5A3A22"/><rect x="${x + w - 4}" y="${y - 70}" width="4" height="70" fill="#5A3A22"/>`
    + `<path d="M${x - 8} ${y - 70} H${x + w + 8} L${x + w} ${y - 52} H${x} Z" fill="${G(c)}"/>` + Array.from({ length: Math.floor(w / 16) }, (_, i) => `<path d="M${x + i * 16} ${y - 52} q8 8 16 0" fill="${shade(c, -0.25)}"/>`).join('')
    + `<rect x="${x}" y="${y}" width="${w}" height="10" fill="${G('#C08A55', 'v')}"/><rect x="${x + 4}" y="${y + 10}" width="${w - 8}" height="34" fill="${G('#8A5A30')}"/>`;
}
function car50(x, y, c) { // a 1950s car, side view
  return shadowE(x + 70, y + 2, 78, 6) + `<path d="M${x} ${y - 14} Q${x} ${y - 30} ${x + 24} ${y - 32} L${x + 44} ${y - 50} Q${x + 72} ${y - 58} ${x + 98} ${y - 48} L${x + 116} ${y - 32} Q${x + 140} ${y - 30} ${x + 142} ${y - 16} L${x + 142} ${y - 6} L${x} ${y - 6} Z" fill="${G(c, 'v', [0.25, -0.25])}"/>`
    + `<path d="M${x + 50} ${y - 46} Q${x + 72} ${y - 53} ${x + 92} ${y - 45} L${x + 104} ${y - 33} L${x + 46} ${y - 33} Z" fill="#9FD4E8" opacity=".85"/><path d="M${x + 74} ${y - 50} V${y - 33}" stroke="${shade(c, -0.3)}" stroke-width="3"/>`
    + `<rect x="${x - 2}" y="${y - 12}" width="146" height="5" rx="2.5" fill="#E8E8F0"/><circle cx="${x + 30}" cy="${y - 4}" r="12" fill="#17131F"/><circle cx="${x + 30}" cy="${y - 4}" r="5" fill="#C9C3D3"/><circle cx="${x + 112}" cy="${y - 4}" r="12" fill="#17131F"/><circle cx="${x + 112}" cy="${y - 4}" r="5" fill="#C9C3D3"/>`
    + `<path d="M${x + 14} ${y - 28} Q${x + 70} ${y - 34} ${x + 130} ${y - 28}" stroke="#fff" stroke-width="1.6" opacity=".45" fill="none"/>`;
}

const SCENES = {
  lethbridge() { // the attic (prologue)
    let b = `<rect width="760" height="420" fill="${G('#4A3424', 'v', [0.05, -0.35])}"/>`;
    b += `<path d="M0 0 L380 -40 L760 0 V60 L380 20 L0 60 Z" fill="#2E1E14"/>`;
    for (let i = 0; i < 9; i++) b += `<rect x="${i * 95 - 10}" y="0" width="16" height="300" fill="${G('#5E4030')}"/>`;
    b += `<rect x="0" y="40" width="760" height="18" fill="${G('#6A4A34', 'v')}"/>`;
    // round window with Lethbridge at dusk: the viaduct
    b += `<circle cx="560" cy="150" r="78" fill="#2E1E14"/><clipPath id="win"><circle cx="560" cy="150" r="68"/></clipPath><g clip-path="url(#win)"><rect x="480" y="70" width="160" height="160" fill="url(#bandSky)"/><rect x="480" y="190" width="160" height="40" fill="#3A2D55"/><path d="M480 168 H640" stroke="#2A2152" stroke-width="4"/>${Array.from({ length: 11 }, (_, i) => `<path d="M${484 + i * 15} 168 L${480 + i * 15} 212 M${484 + i * 15} 168 L${488 + i * 15} 212" stroke="#2A2152" stroke-width="1.6"/>`).join('')}</g>`;
    b += `<circle cx="560" cy="150" r="68" fill="none" stroke="${G('#8A6A4A')}" stroke-width="8"/><path d="M560 82 V218 M492 150 H628" stroke="#6A4A34" stroke-width="5"/>`;
    b += `<rect x="0" y="300" width="760" height="120" fill="${G('#6E4A30', 'v', [0.1, -0.3])}"/>` + Array.from({ length: 8 }, (_, i) => `<path d="M0 ${305 + i * 15} H760" stroke="#4A3020" stroke-width="1.5" opacity=".6"/>`).join('');
    // boxes and a lamp
    b += shadowE(110, 330, 70, 7) + `<rect x="50" y="250" width="110" height="80" fill="${G('#B58A5A')}"/><rect x="70" y="200" width="80" height="52" fill="${G('#C49A6A')}"/><path d="M50 290 H160 M110 200 V252" stroke="#8A6A40" stroke-width="2"/>`;
    b += shadowE(690, 330, 30, 5) + `<rect x="684" y="250" width="12" height="80" fill="${G('#3A2A20')}"/><path d="M660 250 L720 250 L708 210 L672 210 Z" fill="${G('#E8C38A')}"/><circle cx="690" cy="240" r="40" fill="#FFC77A" opacity=".18" filter="url(#soft)"/>`;
    const seal = [380, 300, 92, shadowE(380, 360, 120, 10, 0.35)
      + `<rect x="270" y="270" width="220" height="90" rx="8" fill="${G('#6A3A1E')}"/><path d="M262 272 Q380 196 498 272 Z" fill="${G('#7E4A26', 'v')}"/>`
      + `<rect x="270" y="266" width="220" height="10" fill="#3A2010"/><rect x="290" y="276" width="10" height="84" fill="#C9A15A"/><rect x="460" y="276" width="10" height="84" fill="#C9A15A"/>`
      + `<rect x="366" y="268" width="28" height="30" rx="4" fill="${G('#E9A93A')}"/><circle cx="380" cy="282" r="4" fill="#3A2010"/>`
      + `<text x="380" y="330" text-anchor="middle" font-size="14" font-weight="700" fill="#E8C38A" font-family="Georgia, serif" opacity=".8">E. R. · 1890</text>`];
    return { back: b, front: '', seal, gems: {} };
  },

  mexico() {
    let b = sky('#2A2160', '#7A4A86', '#F0A070');
    b += mountain('560 300 L640 200 L660 196 L740 300 Z', '#5A4F8A') + `<path d="M630 212 L640 200 L660 196 L672 210 Q655 206 646 214 Z" fill="#F4F1FF" opacity=".9"/>`;
    // Catedral Metropolitana
    b += shadowE(560, 300, 160, 8) + `<rect x="420" y="170" width="280" height="130" fill="${G('#B89878')}"/>`;
    [430, 640].forEach(x => { b += `<rect x="${x}" y="110" width="50" height="190" fill="${G('#C4A486')}"/><path d="M${x - 4} 110 H${x + 54} L${x + 46} 96 H${x + 4} Z" fill="#9A7A5E"/><path d="M${x + 10} 96 Q${x + 25} 70 ${x + 40} 96 Z" fill="${G('#A88A6A')}"/><rect x="${x + 15}" y="125" width="20" height="28" rx="10" fill="#2A2152"/>`; });
    b += `<path d="M520 170 Q560 120 600 170 Z" fill="${G('#A88A6A')}"/><rect x="540" y="230" width="40" height="70" rx="20" fill="#3A2A44"/><circle cx="560" cy="200" r="12" fill="#FFC77A" opacity=".8"/>`;
    // Templo Mayor ruins
    b += shadowE(140, 300, 140, 8);
    [[20, 260, 240], [45, 236, 190], [70, 214, 140]].forEach(([x, y, w]) => { b += `<rect x="${x}" y="${y}" width="${w}" height="${300 - y}" fill="${G('#8A7A6E')}"/><rect x="${x}" y="${y}" width="${w}" height="4" fill="#B0A090"/>`; });
    b += `<path d="M110 214 L130 300 H170 L190 214 Z" fill="${G('#7A6A5E')}"/>` + Array.from({ length: 8 }, (_, i) => `<path d="M${112 + i * 1.2} ${222 + i * 10} H${188 - i * 1.2}" stroke="#5E5048" stroke-width="1.5"/>`).join('');
    // flag pole and a huge flag
    b += `<rect x="326" y="80" width="6" height="220" fill="${G('#C9C3D3')}"/><path d="M332 86 Q370 76 400 90 Q430 102 460 92 V152 Q430 162 400 150 Q370 136 332 146 Z" fill="#006847"/><path d="M374 80 Q390 82 400 90 Q414 98 418 99 V157 Q410 156 400 150 Q388 141 374 140 Z" fill="#F4F1EA"/><path d="M418 99 Q440 102 460 92 V152 Q440 162 418 157 Z" fill="#CE1126"/><circle cx="396" cy="118" r="7" fill="#8C5A2B"/>`;
    b += ground('#8A7468', '#6E5A50');
    const seal = [670, 296, 52, sunStone(670, 290, 44)];
    const gems = {
      esquites: [238, 330, 26, shadowE(238, 352, 26, 4) + `<rect x="216" y="312" width="44" height="30" rx="4" fill="${G('#E8505B')}"/><circle cx="224" cy="346" r="6" fill="#17131F"/><circle cx="252" cy="346" r="6" fill="#17131F"/><ellipse cx="238" cy="310" rx="18" ry="5" fill="#F2C230"/><path d="M226 300 h24 v10 h-24 z" fill="#C9C3D3"/>`],
      coyolxauhqui: [160, 270, 24, `<ellipse cx="160" cy="272" rx="28" ry="9" fill="${RG('#A89080')}"/><ellipse cx="160" cy="272" rx="20" ry="6" fill="none" stroke="#6E5A50" stroke-width="1.5"/><path d="M148 270 q12 -6 24 0" stroke="#6E5A50" stroke-width="1.5" fill="none"/>`]
    };
    return { back: b, front: '', seal, gems };
  },

  miami() {
    let b = sky('#2A2A6A', '#B0608E', '#FFB08A');
    b += `<rect x="440" y="250" width="320" height="50" fill="${G('#3FA8B8', 'v')}"/><path d="M440 262 H760 M460 276 H760" stroke="#9FE4EC" stroke-width="1.5" opacity=".5"/>`;
    // Freedom Tower
    b += shadowE(450, 300, 40, 6) + `<rect x="424" y="110" width="52" height="190" fill="${G('#F2D27A')}"/><rect x="430" y="80" width="40" height="32" fill="${G('#F6DE92')}"/><path d="M432 80 Q450 50 468 80 Z" fill="${G('#E8C060')}"/><rect x="448" y="38" width="4" height="22" fill="#C9A15A"/>` + Array.from({ length: 8 }, (_, i) => `<rect x="434" y="${124 + i * 20}" width="10" height="12" fill="#FFC77A" opacity=".8"/><rect x="456" y="${124 + i * 20}" width="10" height="12" fill="#FFC77A" opacity=".8"/>`).join('');
    // art deco hotels
    [[0, 150, 140, '#F4A6B8'], [140, 180, 130, '#7FD6C8'], [270, 200, 130, '#FBD98C']].forEach(([x, y, w, c]) => {
      b += building(x, y, w, 300 - y, c, { win: 'rect', rows: 3, cols: 4, trim: '#FFF6F0' });
      b += `<rect x="${x + w / 2 - 22}" y="${y - 28}" width="44" height="30" fill="${G(c)}"/><path d="M${x + w / 2 - 22} ${y - 28} H${x + w / 2 + 22}" stroke="#FFF6F0" stroke-width="3"/><path d="M${x + 8} ${y + 30} H${x + w - 8}" stroke="#5FE0C8" stroke-width="2" opacity=".9"/>`;
    });
    b += palm(380, 300, 150, 14) + palm(700, 300, 130, -10);
    b += ground('#C9B08A', '#A8906A');
    // café ventanita
    b += shadowE(640, 340, 120, 7) + `<rect x="540" y="200" width="200" height="140" fill="${G('#E8ECEF')}"/><path d="M530 200 H750 L738 178 H542 Z" fill="${G('#2F6F7A')}"/>` + Array.from({ length: 12 }, (_, i) => `<path d="M${542 + i * 17} 200 q8 9 17 0" fill="#245A63"/>`).join('') + `<rect x="566" y="226" width="64" height="44" rx="4" fill="#3A2A44"/><rect x="566" y="270" width="64" height="8" fill="${G('#C08A55', 'v')}"/><text x="598" y="250" text-anchor="middle" font-size="10" font-weight="800" fill="#FFC77A" font-family="Manrope, sans-serif">CAFECITO</text>`;
    const seal = [690, 252, 40, `<rect x="652" y="222" width="76" height="60" rx="3" fill="${G('#7A4A22')}"/><rect x="657" y="227" width="66" height="50" fill="#F2E2C0"/><path d="M664 250 q10 -16 22 -6 q10 8 22 -4 q8 -6 10 6" stroke="#7A4A22" stroke-width="1.6" fill="none"/><path d="M670 262 l6 -4 M690 258 l4 6 M708 254 l4 -2" stroke="#B5482B" stroke-width="2" stroke-linecap="round"/><text x="690" y="238" text-anchor="middle" font-size="7" font-weight="800" fill="#7A3B1A" font-family="Manrope, sans-serif">MAPA · 1528</text><circle class="seal-glow" cx="722" cy="230" r="5" fill="#FFC27A"/>`];
    const gems = {
      domino: [250, 336, 30, shadowE(250, 360, 40, 5) + `<rect x="246" y="330" width="8" height="28" fill="#5A3A22"/><ellipse cx="250" cy="330" rx="40" ry="10" fill="${RG('#2E7D5B')}"/>` + [[236, 328], [248, 326], [260, 330], [242, 333]].map(([x, y]) => `<rect x="${x}" y="${y}" width="10" height="5" rx="1" fill="#F4F1EA" stroke="#17122E" stroke-width=".6"/>`).join('')],
      freedom: [450, 130, 40, '']
    };
    return { back: b, front: '', seal, gems };
  },

  bogota() {
    let b = sky('#2A2350', '#5A4A86', '#D88A78');
    b += mountain('300 300 L380 150 Q470 90 540 110 Q610 140 700 300 Z', '#3E5A4E');
    b += `<rect x="508" y="88" width="34" height="22" fill="${G('#F4F1EA')}"/><path d="M506 88 L525 74 L544 88 Z" fill="#B5482B"/><rect x="518" y="66" width="6" height="14" fill="#F4F1EA"/><path d="M400 262 L514 104" stroke="#17122E" stroke-width="1.4" opacity=".6"/><rect x="452" y="180" width="12" height="9" rx="2" fill="#E8505B"/>`;
    [[0, 190, 150, '#F4EEE2'], [150, 210, 130, '#E8DCC8'], [520, 200, 120, '#F4EEE2'], [640, 180, 120, '#EAD8C0']].forEach(([x, y, w, c]) => {
      b += building(x, y, w, 300 - y, c, { roof: 18, rows: 2, cols: 3, trim: '#3E7A4E' });
      b += `<rect x="${x + 8}" y="${y + (300 - y) * 0.45}" width="${w - 16}" height="6" fill="#3E7A4E"/>` + Array.from({ length: Math.floor((w - 16) / 8) }, (_, i) => `<rect x="${x + 10 + i * 8}" y="${y + (300 - y) * 0.45 + 6}" width="2" height="14" fill="#3E7A4E"/>`).join('');
    });
    b += ground('#7A6A70', '#5A4A50');
    const seal = [670, 306, 46, shadowE(670, 362, 50, 6) + `<rect x="630" y="320" width="80" height="40" fill="${G('#3A2A44')}"/><rect x="626" y="262" width="88" height="60" rx="4" fill="#BFE6F0" opacity=".35" stroke="#E8F4FF" stroke-width="1.5"/><path d="M640 306 L700 306 L694 314 L646 314 Z" fill="${G('#E9A93A')}"/><rect x="666" y="284" width="8" height="22" fill="#E9A93A"/><circle cx="670" cy="282" r="4" fill="#F2C46D"/>${[648, 656, 684, 692].map(x => `<rect x="${x - 2}" y="296" width="4" height="10" fill="#E9A93A"/>`).join('')}<path d="M632 268 L650 266" stroke="#fff" stroke-width="2" opacity=".6"/><circle class="seal-glow" cx="708" cy="268" r="5" fill="#FFC27A"/>`];
    const gems = {
      esmeralda: [70, 330, 26, shadowE(70, 356, 24, 4) + `<rect x="54" y="330" width="32" height="24" fill="${G('#5A3A22')}"/><path d="M58 330 L70 312 L82 330 Z" fill="${G('#2ECC8A')}"/><path d="M64 324 L70 316 L74 322" stroke="#BFFFE0" stroke-width="1.4" fill="none"/>`],
      ciclovia: [252, 344, 30, shadowE(252, 366, 34, 4) + `<circle cx="232" cy="352" r="13" fill="none" stroke="#17131F" stroke-width="3"/><circle cx="272" cy="352" r="13" fill="none" stroke="#17131F" stroke-width="3"/><path d="M232 352 L248 330 L266 330 L272 352 M248 330 L256 352 L232 352 M264 324 h8" stroke="#E8505B" stroke-width="3" fill="none" stroke-linejoin="round"/>`]
    };
    return { back: b, front: '', seal, gems };
  },

  sanjuan() {
    let b = sky('#22285E', '#5A5A9A', '#F09A80');
    b += `<rect x="0" y="230" width="760" height="70" fill="${G('#2E8AB0', 'v')}"/><path d="M0 246 H760 M0 264 H760" stroke="#9FE4EC" stroke-width="1.2" opacity=".35"/>`;
    // El Morro walls
    b += shadowE(560, 290, 220, 8) + `<path d="M330 300 L360 236 H760 V300 Z" fill="${G('#C49A62')}"/><path d="M360 236 H760" stroke="#E8C88A" stroke-width="3"/>` + Array.from({ length: 10 }, (_, i) => `<rect x="${370 + i * 40}" y="226" width="22" height="12" fill="${G('#B88A52')}"/>`).join('');
    // kites (chiringas)
    [[150, 90, '#E8505B'], [260, 60, '#F2C230'], [420, 100, '#5FE0C8']].forEach(([x, y, c]) => { b += `<path d="M${x} ${y - 14} L${x + 10} ${y} L${x} ${y + 16} L${x - 10} ${y} Z" fill="${G(c)}"/><path d="M${x} ${y + 16} q10 30 -4 60" stroke="#F4F1EA" stroke-width="1" fill="none" opacity=".7"/>`; });
    // colourful houses
    [[0, 170, 110, '#5FA8D3'], [110, 190, 100, '#F4A6B8'], [210, 180, 110, '#FBD98C']].forEach(([x, y, w, c]) => { b += building(x, y, w, 300 - y, c, { rows: 2, cols: 2, trim: '#FFF6F0' }); });
    b += ground('#4C6A9A', '#36507A');
    const seal = [650, 238, 46, shadowE(650, 300, 40, 5) + `<path d="M624 300 V238 H676 V300 Z" fill="${G('#D8B07A')}"/><path d="M618 238 Q650 196 682 238 Z" fill="${G('#C49A62', 'v')}"/><circle cx="650" cy="202" r="5" fill="#C49A62"/><rect x="642" y="252" width="16" height="22" rx="8" fill="#2A2152"/><path d="M618 238 H682" stroke="#E8C88A" stroke-width="3"/><circle class="seal-glow" cx="650" cy="263" r="5" fill="#FFC27A"/>`];
    const gems = {
      taino: [70, 336, 28, shadowE(70, 358, 30, 5) + `<path d="M44 356 Q40 322 70 316 Q100 320 96 356 Z" fill="${RG('#8A8295')}"/><circle cx="62" cy="334" r="4" fill="none" stroke="#4A4458" stroke-width="2"/><circle cx="78" cy="334" r="4" fill="none" stroke="#4A4458" stroke-width="2"/><path d="M62 346 q8 6 16 0 M70 320 v-0" stroke="#4A4458" stroke-width="2" fill="none"/>`],
      mofongo: [252, 330, 26, shadowE(252, 352, 30, 4) + `<rect x="248" y="330" width="8" height="22" fill="#5A3A22"/><ellipse cx="252" cy="330" rx="30" ry="8" fill="${G('#C08A55', 'v')}"/><path d="M238 326 Q252 304 266 326 Z" fill="${G('#8A5A2A')}"/><ellipse cx="252" cy="327" rx="17" ry="4" fill="#C49A62" opacity=".6"/>`]
    };
    return { back: b, front: '', seal, gems };
  },

  oaxaca() {
    let b = sky('#2A2152', '#7A4A7E', '#F0A070');
    b += mountain('0 300 L120 190 L220 230 L330 170 L470 240 L560 180 L760 300 Z', '#4E5A7A');
    b += `<path d="M300 178 h60 v-8 h-60 z M310 170 h40 v-6 h-40 z" fill="#3E4A6A"/>`;
    // Santo Domingo (green cantera)
    b += shadowE(420, 300, 130, 8) + `<rect x="320" y="160" width="200" height="140" fill="${G('#8AA88A')}"/>`;
    [300, 500].forEach(x => { b += `<rect x="${x}" y="120" width="40" height="180" fill="${G('#9AB89A')}"/><path d="M${x + 4} 120 Q${x + 20} 92 ${x + 36} 120 Z" fill="${G('#7A987A')}"/><rect x="${x + 12}" y="134" width="16" height="22" rx="8" fill="#2A2152"/>`; });
    b += `<path d="M380 160 Q420 126 460 160 Z" fill="${G('#7A987A')}"/><rect x="402" y="230" width="36" height="70" rx="18" fill="#3A2A44"/>`;
    // papel picado
    b += `<path d="M0 40 Q380 90 760 40" stroke="#17122E" stroke-width="1" fill="none"/>` + Array.from({ length: 16 }, (_, i) => { const x = 20 + i * 47, y = 40 + Math.sin(i / 15 * Math.PI) * 26; return `<path d="M${x} ${y} h26 v22 l-4 4 l-4 -4 l-4 4 l-4 -4 l-4 4 l-4 -4 l-2 2 z" fill="${['#E8505B', '#F2C230', '#5FE0C8', '#B57AE0', '#F48AA8'][i % 5]}" opacity=".9"/>`; }).join('');
    b += stall(20, 270, 140, '#E8505B');
    b += ground('#8A6E5A', '#6A5040');
    const seal = [670, 306, 48, shadowE(670, 360, 60, 6) + `<rect x="616" y="320" width="108" height="38" fill="${G('#8A5A30')}"/><rect x="612" y="312" width="116" height="10" fill="${G('#C08A55', 'v')}"/>${[[640, '#3A1A10'], [670, '#B5402A'], [700, '#E9A93A']].map(([x, c]) => `<path d="M${x - 14} 312 Q${x - 16} 286 ${x} 284 Q${x + 16} 286 ${x + 14} 312 Z" fill="${G('#A0522D')}"/><ellipse cx="${x}" cy="286" rx="13" ry="4" fill="${c}"/>`).join('')}<path d="M650 272 q4 -8 0 -16 M672 270 q4 -8 0 -16" stroke="#FFF1D6" stroke-width="1.6" opacity=".5" fill="none"/><circle class="seal-glow" cx="724" cy="300" r="5" fill="#FFC27A"/>`];
    const gems = {
      danzantes: [70, 340, 26, shadowE(72, 362, 26, 4) + `<rect x="50" y="314" width="44" height="48" rx="4" fill="${RG('#8A8295')}"/><circle cx="66" cy="328" r="5" fill="none" stroke="#4A4458" stroke-width="2"/><path d="M66 334 l-4 14 M66 340 l10 -4 M66 340 l-10 2 M62 348 l-6 8 M62 348 l8 6" stroke="#4A4458" stroke-width="2" fill="none" stroke-linecap="round"/>`],
      guelaguetza: [240, 210, 26, `<rect x="216" y="186" width="48" height="56" rx="3" fill="${G('#F4E2C0')}"/><path d="M240 196 q-14 16 -10 34 h20 q4 -18 -10 -34 z" fill="#E8505B"/><circle cx="240" cy="198" r="5" fill="#8E5A44"/><path d="M226 230 Q240 222 254 230" stroke="#F2C230" stroke-width="3" fill="none"/>`]
    };
    return { back: b, front: '', seal, gems };
  },

  madrid() {
    let b = sky('#22285E', '#6A4A86', '#F0A070');
    [[0, 160, 150, '#E8D8C0'], [600, 170, 160, '#E0CDB2']].forEach(([x, y, w, c]) => { b += building(x, y, w, 300 - y, c, { win: 'rect', rows: 3, cols: 4, trim: '#5A3A22' }); });
    // Casa de Correos with its clock tower
    b += shadowE(380, 300, 200, 9) + `<rect x="170" y="170" width="420" height="130" fill="${G('#C4704E')}"/>` + Array.from({ length: 8 }, (_, i) => `<rect x="${190 + i * 50}" y="190" width="22" height="34" fill="#F4F1EA"/><rect x="${193 + i * 50}" y="193" width="16" height="28" fill="#FFC77A" opacity=".8"/><rect x="${190 + i * 50}" y="244" width="22" height="34" fill="#F4F1EA"/><rect x="${193 + i * 50}" y="247" width="16" height="28" fill="#2A2152"/>`).join('');
    b += `<rect x="340" y="110" width="80" height="62" fill="${G('#E8DCC8')}"/><circle cx="380" cy="140" r="20" fill="${RG('#F4F1EA')}" stroke="#2A2152" stroke-width="2"/><path d="M380 140 V126 M380 140 L390 146" stroke="#17122E" stroke-width="2.2" stroke-linecap="round"/><path d="M350 110 Q380 70 410 110 Z" fill="${G('#3A3550')}"/><circle cx="380" cy="70" r="7" fill="${RG('#E9A93A')}"/><rect x="379" y="54" width="2" height="12" fill="#C9C3D3"/>`;
    // street lamps
    [130, 630].forEach(x => { b += shadowE(x, 300, 14, 3) + `<rect x="${x - 2}" y="200" width="4" height="100" fill="#2B2D42"/><path d="M${x - 10} 200 h20 l-4 -18 h-12 z" fill="#2B2D42"/><circle cx="${x}" cy="194" r="16" fill="#FFC77A" opacity=".25" filter="url(#soft)"/>`; });
    b += ground('#9A8A80', '#7A6A60');
    // el oso y el madroño
    b += shadowE(70, 330, 40, 6) + `<rect x="40" y="300" width="60" height="30" fill="${G('#C9C3D3')}"/><path d="M84 300 Q90 250 80 220" stroke="#4A3A2A" stroke-width="6" fill="none"/><circle cx="80" cy="212" r="22" fill="${RG('#3E6A3A')}"/>${[[72, 206], [86, 214], [80, 200]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#E8505B"/>`).join('')}<path d="M48 300 Q46 272 58 262 Q60 246 70 248 Q80 250 76 266 Q84 276 80 300 Z" fill="${G('#6E5A4A')}"/>`;
    const seal = [670, 272, 46, board(670, 266, 88, 64, 'PLANO DE MADRID', `<path d="M636 270 h68 M652 254 v32 M688 254 v32 M636 284 h68" stroke="#7A4A22" stroke-width="2"/><circle cx="670" cy="270" r="4" fill="#E8505B"/>`)];
    const gems = {
      kmcero: [250, 382, 24, `<path d="M226 376 L274 376 L280 388 L220 388 Z" fill="${G('#C9C3D3')}"/><text x="250" y="386" text-anchor="middle" font-size="7" font-weight="800" fill="#2A2152" font-family="Manrope, sans-serif">KM 0</text>`],
      uvas: [380, 140, 26, '']
    };
    return { back: b, front: '', seal, gems };
  },

  buenosaires() {
    let b = sky('#22285E', '#4A5AA0', '#E8A080');
    // Caminito houses (corrugated, bright)
    [[0, 180, 90, '#E8505B'], [90, 200, 80, '#F2C230'], [170, 186, 90, '#3E8ED0'], [260, 206, 70, '#3EA86A']].forEach(([x, y, w, c]) => {
      b += building(x, y, w, 300 - y, c, { win: 'rect', rows: 2, cols: 2, trim: '#F4F1EA' }) + Array.from({ length: Math.floor(w / 6) }, (_, i) => `<path d="M${x + i * 6} ${y + 6} V300" stroke="#000" stroke-width="1" opacity=".08"/>`).join('');
    });
    // Obelisco
    b += shadowE(460, 300, 30, 5) + `<path d="M446 300 L452 70 L460 52 L468 70 L474 300 Z" fill="${G('#F4F1EA')}"/><rect x="455" y="96" width="10" height="8" fill="#2A2152"/>`;
    [[540, 190, 100, '#C8B8A8'], [640, 170, 120, '#B8A898']].forEach(([x, y, w, c]) => { b += building(x, y, w, 300 - y, c, { win: 'rect', rows: 3, cols: 3 }); });
    b += ground('#5A5A6A', '#44445A') + `<path d="M330 300 L280 420 M590 300 L640 420" stroke="#F4F1EA" stroke-width="3" opacity=".25"/>`;
    const seal = [670, 262, 44, shadowE(670, 352, 20, 4) + `<rect x="667" y="260" width="6" height="92" fill="${G('#C9C3D3')}"/><rect x="640" y="226" width="60" height="44" rx="6" fill="${G('#2F5DA8')}"/><text x="670" y="244" text-anchor="middle" font-size="9" font-weight="800" fill="#fff" font-family="Manrope, sans-serif">PARADA</text><text x="670" y="261" text-anchor="middle" font-size="13" font-weight="800" fill="#FFC27A" font-family="Unbounded, Manrope, sans-serif">🚌</text><circle class="seal-glow" cx="698" cy="230" r="5" fill="#FFC27A"/>`];
    const gems = {
      colon: [70, 250, 28, `<rect x="44" y="222" width="52" height="64" rx="3" fill="${G('#F4E2C0')}"/><path d="M52 270 Q70 240 88 270 Z" fill="#B5402A"/><text x="70" y="236" text-anchor="middle" font-size="7" font-weight="800" fill="#7A3B1A" font-family="Manrope, sans-serif">TEATRO COLÓN</text><text x="70" y="280" text-anchor="middle" font-size="6" fill="#7A3B1A" font-family="Manrope, sans-serif">1908</text>`],
      plata: [570, 330, 24, shadowE(570, 352, 20, 4) + `<rect x="567" y="306" width="5" height="46" fill="#5A3A22"/><path d="M548 304 H596 L604 312 L596 320 H548 Z" fill="${G('#C9C3D3')}"/><text x="572" y="315" text-anchor="middle" font-size="6.5" font-weight="800" fill="#2A2152" font-family="Manrope, sans-serif">RÍO DE LA PLATA</text>`]
    };
    return { back: b, front: '', seal, gems };
  },

  cusco() {
    let b = sky('#22285E', '#5A4A8A', '#E89A7A');
    b += mountain('0 300 L100 150 L180 210 L290 120 L400 220 L520 140 L640 200 L760 120 V300 Z', '#4A5A7A') + `<path d="M270 136 L290 120 L310 140 Q290 134 270 136 Z M500 156 L520 140 L540 158 Q520 152 500 156 Z" fill="#F4F1FF" opacity=".8"/>`;
    // cathedral
    b += shadowE(360, 300, 140, 8) + `<rect x="240" y="180" width="240" height="120" fill="${G('#9A8A7E')}"/>`;
    [230, 450].forEach(x => { b += `<rect x="${x}" y="140" width="40" height="160" fill="${G('#A89A8E')}"/><path d="M${x + 4} 140 Q${x + 20} 112 ${x + 36} 140 Z" fill="${G('#8A7A6E')}"/>`; });
    b += `<rect x="340" y="230" width="40" height="70" rx="20" fill="#3A2A44"/>`;
    // Coricancha: Inca curved wall + convent on top
    b += shadowE(620, 300, 90, 6) + `<path d="M540 300 Q560 236 640 232 Q720 236 740 300 Z" fill="${G('#A8987A')}"/>` + Array.from({ length: 6 }, (_, i) => `<path d="M${548 + i * 4} ${290 - i * 10} Q640 ${238 - i * 1} ${732 - i * 4} ${290 - i * 10}" stroke="#7A6A5A" stroke-width="1.2" fill="none"/>`).join('') + `<rect x="570" y="186" width="140" height="50" fill="${G('#E8DCC8')}"/><path d="M566 186 H714 L700 172 H580 Z" fill="#B5482B"/>`;
    // Inca wall band
    b += `<rect x="0" y="282" width="230" height="22" fill="${G('#8A8070')}"/>` + Array.from({ length: 10 }, (_, i) => `<path d="M${i * 23} 282 l6 10 l-4 12 M${i * 23 + 12} 282 l-3 22" stroke="#5A5048" stroke-width="1.4" fill="none"/>`).join('');
    b += ground('#7A6E6A', '#5A5050');
    const seal = [670, 330, 48, shadowE(670, 382, 40, 5) + `<rect x="626" y="290" width="6" height="92" fill="${G('#6A4A30')}"/><rect x="708" y="290" width="6" height="92" fill="${G('#6A4A30')}"/><rect x="620" y="288" width="100" height="7" rx="3" fill="${G('#8A5A30', 'v')}"/>${['#C0283C', '#F2C230', '#3E8E4E', '#3E6E9E', '#F4F1EA'].map((c, i) => `<path d="M${640 + i * 15} 295 q2 30 -1 60" stroke="${c}" stroke-width="3" fill="none"/>${Array.from({ length: (i % 3) + 1 }, (_, k) => `<circle cx="${640 + i * 15}" cy="${312 + k * 12}" r="3.4" fill="${shade(c, -0.25)}"/>`).join('')}`).join('')}<circle class="seal-glow" cx="714" cy="284" r="5" fill="#FFC27A"/>`];
    const gems = {
      chasqui: [70, 340, 26, shadowE(72, 364, 20, 4) + `<path d="M58 300 q-6 -18 14 -20 q16 0 12 18" fill="#F4F1EA"/><path d="M60 306 L62 296 Q70 290 80 296 L86 304 Z" fill="#E9A93A"/><path d="M62 304 L52 330 M80 304 L92 324 M66 324 L56 362 M76 324 L90 358 M60 304 L80 304 L76 326 L66 326 Z" stroke="#8E5A44" stroke-width="5" stroke-linecap="round" fill="#C0283C"/><circle cx="71" cy="290" r="7" fill="#8E5A44"/>`],
      coricancha: [640, 210, 32, '']
    };
    return { back: b, front: '', seal, gems };
  },

  antigua() {
    let b = sky('#22285E', '#5A4A8A', '#E8907A');
    b += mountain('180 300 L340 110 L420 110 L580 300 Z', '#4A5A86') + `<path d="M330 122 L340 110 L420 110 L432 124 Q380 116 330 122 Z" fill="#6A7AA6"/>`;
    b += mountain('0 300 L60 200 L120 300 Z', '#3A4A6E') + mountain('620 300 L700 180 L760 260 V300 Z', '#3A4A6E') + `<path d="M696 184 q6 -14 -2 -26 q10 6 8 20" fill="#C9C3D3" opacity=".5"/>`;
    [[0, 200, 130, '#F2C230'], [130, 220, 100, '#E87A5A'], [530, 210, 110, '#5FA8D3'], [640, 196, 120, '#F4A6B8']].forEach(([x, y, w, c]) => { b += building(x, y, w, 300 - y, c, { rows: 1, cols: 2, trim: '#F4F1EA' }); });
    // Arco de Santa Catalina
    b += shadowE(380, 300, 150, 8) + `<path d="M240 300 V190 H520 V300 H450 V250 A70 70 0 0 0 310 250 V300 Z" fill="${G('#F2C230')}"/><rect x="236" y="182" width="288" height="12" fill="#F4F1EA"/><rect x="350" y="140" width="60" height="44" fill="${G('#F2C230')}"/><path d="M346 140 H414 L380 120 Z" fill="${G('#E8505B')}"/><circle cx="380" cy="160" r="12" fill="${RG('#F4F1EA')}" stroke="#2A2152" stroke-width="1.5"/><path d="M380 160 v-8 M380 160 l6 3" stroke="#17122E" stroke-width="1.6"/>`;
    b += ground('#7A6A62', '#5A4A44');
    const seal = [670, 330, 46, shadowE(670, 372, 50, 6) + `<path d="M626 370 L630 300 Q670 290 710 300 L714 370 Z" fill="${G('#8A8295')}"/><path d="M640 312 h60 M640 326 h60 M640 340 h60 M656 306 v52 M684 306 v52" stroke="#4A4458" stroke-width="1.6"/><path d="M646 352 L660 318 L674 318 L688 352" stroke="#B5482B" stroke-width="2" fill="none"/><circle class="seal-glow" cx="706" cy="302" r="5" fill="#FFC27A"/>`];
    const gems = {
      quetzal: [80, 180, 26, `<path d="M64 196 Q84 168 100 186" stroke="#5A3A22" stroke-width="4" fill="none"/><ellipse cx="82" cy="176" rx="10" ry="12" fill="${RG('#2EAA6A')}"/><path d="M80 186 Q74 220 66 236 M84 186 Q82 222 78 240" stroke="#2EAA6A" stroke-width="3" fill="none"/><path d="M78 182 q4 6 10 4" fill="#C0283C" stroke="#C0283C" stroke-width="3"/><circle cx="84" cy="170" r="2" fill="#17131F"/><path d="M90 172 l5 1" stroke="#F2C230" stroke-width="2"/>`],
      alfombras: [250, 380, 26, `<path d="M214 372 L286 372 L298 390 L202 390 Z" fill="#B57AE0"/><path d="M222 375 L278 375 L286 387 L214 387 Z" fill="#F2C230"/><path d="M236 381 q14 -5 28 0 q-14 6 -28 0" fill="#E8505B"/><circle cx="226" cy="382" r="2.6" fill="#3EA86A"/><circle cx="274" cy="382" r="2.6" fill="#3EA86A"/>`]
    };
    return { back: b, front: '', seal, gems };
  },

  puertoviejo() {
    let b = sky('#20306A', '#6A5AA0', '#FFB08A');
    b += `<rect x="0" y="232" width="760" height="78" fill="${G('#2FA0B0', 'v')}"/><path d="M0 250 H760 M0 272 H760 M0 292 H760" stroke="#BFF4F0" stroke-width="1.2" opacity=".3"/>`;
    b += `<path d="M420 244 Q440 230 462 242 Z" fill="#2E5A4A"/><path d="M432 236 q4 -10 10 -12" stroke="#2E5A4A" stroke-width="2" fill="none"/>`;
    // wooden Caribbean house on stilts
    b += shadowE(110, 304, 100, 6) + [40, 90, 140, 180].map(x => `<rect x="${x}" y="250" width="6" height="56" fill="#5A3A22"/>`).join('') + `<rect x="30" y="170" width="160" height="84" fill="${G('#5FC8B8')}"/>` + Array.from({ length: 10 }, (_, i) => `<path d="M30 ${176 + i * 8} H190" stroke="#3E9A8A" stroke-width="1"/>`).join('') + `<path d="M20 172 L110 120 L200 172 Z" fill="${G('#E8505B')}"/><rect x="60" y="196" width="26" height="30" fill="#FFC77A" opacity=".85"/><rect x="128" y="196" width="26" height="30" fill="#2A2152"/>`;
    b += palm(300, 330, 160, 18) + palm(560, 320, 140, -14);
    // a sloth hanging in the palm
    b += `<path d="M300 190 q-6 6 -8 18" stroke="#8A6A4A" stroke-width="3" fill="none"/><ellipse cx="288" cy="214" rx="12" ry="9" fill="${RG('#A0886A')}"/><ellipse cx="284" cy="214" rx="5" ry="3.5" fill="#F4E2C0"/><path d="M281 213 l2 0 M286 213 l2 0" stroke="#17131F" stroke-width="1.6"/>`;
    b += `<rect x="0" y="300" width="760" height="120" fill="${G('#E8C890', 'v', [0.1, -0.25])}"/><path d="M0 306 Q380 290 760 306" stroke="#F4F1EA" stroke-width="3" opacity=".6" fill="none"/>`;
    const seal = [670, 282, 46, board(670, 274, 92, 66, 'PROTEGE LAS TORTUGAS', `<ellipse cx="670" cy="296" rx="18" ry="11" fill="${G('#3E8E4E')}"/><circle cx="692" cy="294" r="5" fill="#3E8E4E"/><path d="M660 292 h20 M670 287 v18" stroke="#2E6E3A" stroke-width="1.4"/>`)];
    const gems = {
      tren: [70, 250, 26, `<rect x="66" y="250" width="5" height="56" fill="#5A3A22"/><rect x="38" y="226" width="62" height="34" rx="3" fill="${G('#F4E2C0')}"/><rect x="48" y="238" width="30" height="14" fill="#2B2D42"/><rect x="74" y="232" width="10" height="20" fill="#2B2D42"/><circle cx="54" cy="254" r="4" fill="#17131F"/><circle cx="72" cy="254" r="4" fill="#17131F"/><path d="M78 230 q2 -6 6 -8" stroke="#C9C3D3" stroke-width="2" fill="none"/>`],
      uvita: [442, 238, 22, '']
    };
    return { back: b, front: '', seal, gems };
  },

  habana() {
    let b = sky('#22285E', '#7A4A86', '#F4A078');
    b += `<rect x="300" y="236" width="460" height="64" fill="${G('#2E7AB0', 'v')}"/><path d="M300 254 H760 M300 276 H760" stroke="#9FE4EC" stroke-width="1.2" opacity=".35"/>`;
    // El Morro + lighthouse across the bay
    b += `<path d="M560 240 L590 210 H700 L730 240 Z" fill="${G('#B89A72')}"/><rect x="640" y="150" width="18" height="62" fill="${G('#E8DCC8')}"/><rect x="636" y="140" width="26" height="12" fill="#5A4A44"/><circle cx="649" cy="136" r="22" fill="#FFE7A8" opacity=".3" filter="url(#soft)"/>`;
    // colonial buildings with balconies
    [[0, 160, 110, '#F4A6B8'], [110, 176, 100, '#7FD6C8'], [210, 166, 100, '#FBD98C']].forEach(([x, y, w, c]) => {
      b += building(x, y, w, 300 - y, c, { rows: 3, cols: 2, trim: '#F4F1EA' }) + `<rect x="${x + 8}" y="${y + 70}" width="${w - 16}" height="4" fill="#2B2D42"/>` + Array.from({ length: Math.floor((w - 16) / 7) }, (_, i) => `<rect x="${x + 10 + i * 7}" y="${y + 74}" width="1.6" height="12" fill="#2B2D42"/>`).join('');
    });
    // the Malecón wall
    b += `<rect x="300" y="290" width="460" height="16" fill="${G('#C9C3B8', 'v')}"/>`;
    b += ground('#8A7E78', '#6A5E58', 306);
    b += car50(130, 360, '#E8505B');
    const seal = [670, 320, 46, shadowE(670, 372, 52, 6) + `<rect x="624" y="330" width="6" height="40" fill="#5A3A22"/><rect x="710" y="330" width="6" height="40" fill="#5A3A22"/><path d="M614 316 L726 316 L716 334 L624 334 Z" fill="${G('#C08A55', 'v')}"/><path d="M630 318 L712 318 L706 330 L636 330 Z" fill="#F2E2C0"/><path d="M640 326 q14 -8 28 -2 q14 6 30 -2" stroke="#7A4A22" stroke-width="1.4" fill="none"/><circle cx="650" cy="324" r="2" fill="#B5482B"/><circle cx="696" cy="322" r="2" fill="#B5482B"/><circle class="seal-glow" cx="716" cy="312" r="5" fill="#FFC27A"/>`];
    const gems = {
      canonazo: [480, 282, 24, shadowE(480, 292, 24, 3) + `<path d="M460 286 L498 276 L500 282 L462 292 Z" fill="${G('#2B2D42', 'v')}"/><circle cx="470" cy="290" r="7" fill="#5A3A22"/><circle cx="470" cy="290" r="3" fill="#C9A15A"/>`],
      son: [252, 330, 26, shadowE(252, 356, 22, 4) + `<path d="M246 300 L250 336" stroke="#5A3A22" stroke-width="3"/><ellipse cx="252" cy="342" rx="12" ry="14" fill="${RG('#C08A55')}"/><circle cx="252" cy="340" r="4" fill="#3A2010"/><rect x="244" y="296" width="8" height="8" fill="#3A2010"/>`]
    };
    return { back: b, front: '', seal, gems };
  },

  granada() { // the Patio de los Leones (finale)
    let b = sky('#1E1A4A', '#5A3A7E', '#E0806A');
    b += mountain('0 210 L120 140 L220 180 L330 120 L460 170 L580 110 L760 180 V240 H0 Z', '#4A4A7A') + `<path d="M300 140 L330 120 L362 140 Q330 132 300 140 Z M550 128 L580 110 L612 130 Q580 124 550 128 Z M100 152 L120 140 L140 154 Q120 148 100 152 Z" fill="#F4F1FF" opacity=".85"/>`;
    // arcade: slender columns, stilted arches with lace
    b += `<rect x="0" y="120" width="760" height="40" fill="${G('#D8B48A', 'v')}"/>` + Array.from({ length: 38 }, (_, i) => `<rect x="${i * 20 + 4}" y="126" width="12" height="8" fill="#B88A5E" opacity=".6"/>`).join('');
    for (let i = 0; i < 9; i++) {
      const x = i * 90 - 10;
      b += `<path d="M${x} 300 V196 Q${x} 160 ${x + 45} 160 Q${x + 90} 160 ${x + 90} 196 V300 Z" fill="#2A2152" opacity=".55"/>`;
      b += `<path d="M${x + 4} 196 Q${x + 4} 166 ${x + 45} 166 Q${x + 86} 166 ${x + 86} 196" stroke="#E8C89A" stroke-width="3" fill="none" stroke-dasharray="3 3"/>`;
      b += `<rect x="${x - 3}" y="160" width="8" height="140" fill="${G('#F0DCC0')}"/><rect x="${x - 6}" y="160" width="14" height="8" fill="#E8C89A"/>`;
    }
    b += `<rect x="0" y="300" width="760" height="120" fill="${G('#C8B090', 'v', [0.1, -0.3])}"/>` + Array.from({ length: 7 }, (_, i) => `<path d="M0 ${308 + i * i * 3} H760" stroke="#A89070" stroke-width="1" opacity=".5"/>`).join('');
    // the fountain with twelve lions
    b += shadowE(380, 372, 130, 12, 0.35) + `<ellipse cx="380" cy="352" rx="124" ry="22" fill="${G('#E8DCC8', 'v')}"/><ellipse cx="380" cy="348" rx="110" ry="17" fill="#5FA8D3" opacity=".85"/>`;
    for (let i = 0; i < 12; i++) { const a = Math.PI + i * Math.PI / 11, x = 380 + Math.cos(a) * 92; if (Math.sin(a) > 0.1) continue; b += `<g transform="translate(${x} ${344})"><path d="M-9 8 V-4 Q-9 -12 0 -12 Q9 -12 9 -4 V8 Z" fill="${G('#E8DCC8')}"/><circle cx="0" cy="-12" r="6" fill="${RG('#F0E4D0')}"/></g>`; }
    b += `<path d="M350 340 Q380 300 410 340 Z" fill="${G('#F0E4D0', 'v')}"/><ellipse cx="380" cy="300" rx="44" ry="8" fill="${G('#E8DCC8', 'v')}"/><path d="M380 296 Q370 270 380 254 Q390 270 380 296" fill="#BFE6F0" opacity=".8"/>`;
    return { back: b, front: '', seal: null, gems: {} };
  }
};

/* the full city scene: backdrop, gems, the seal spot, three witnesses */
function citySVG(id, { wits = [], done = [], sealDone = false, gemsFound = new Set(), showSeal = true, sealOpen = false } = {}) {
  startArt();
  const sc = SCENES[id]();
  let s = sc.back;
  for (const [gid, [cx, cy, r, inner]] of Object.entries(sc.gems)) {
    const g = (CITIES[id] && CITIES[id].gems || []).find(x => x.id === gid);
    if (g) s += gemG(gid, g.title, cx, cy, r, inner).replace('class="gem"', `class="gem${gemsFound.has(gid) ? ' found' : ''}"`);
  }
  if (sc.seal && showSeal) {
    const [cx, cy, r, inner] = sc.seal;
    s += hotG('seal' + (sealDone ? ' done' : ''), 'data-seal="1"', sealDone ? 'El sello' : 'El sello de Elena', cx, cy, r, inner, sealDone ? '' : nameTag(cx, id === 'lethbridge' ? cy + r + 18 : FEET + 22, id === 'lethbridge' ? 'el baúl' : 'el sello'));
  }
  wits.forEach((w, i) => {
    const x = WIT_X[i];
    s += hotG('wit' + (done.includes(i) ? ' done' : ''), `data-wit="${i}"`, w.name, x, FEET - 70, 52, personFig(w.look, x, FEET, 1.7) + bubble(x + 18, FEET - 150), nameTag(x, FEET + 22, w.name));
  });
  s += sc.front;
  return defsOut() + s;
}
