/* ============ 2b · ART: flat SVG illustrations (DOM, no canvas) ============ */
const lg = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
let SEED = 7; const srnd = () => { SEED = (SEED * 16807) % 2147483647; return SEED / 2147483647; };

/* ---- the terrace above Barcelona at golden hour; gems are clickable groups inside the SVG ---- */
function sparkleG(id, x, y) {
  return `<g class="gem" data-gem="${id}" transform="translate(${x} ${y})" tabindex="0" role="button" aria-label="Dato de Barcelona">
    <circle r="34" fill="#fff" opacity=".001"/><circle class="halo" r="22" fill="#FFF6D8" opacity=".35"/>
    <path class="star" d="M0 -20 L5 -5 L20 0 L5 5 L0 20 L-5 5 L-20 0 L-5 -5Z" fill="#FFFDF4"/></g>`;
}
function sceneSVG() {
  const W = 1600, H = 900; SEED = 41;
  let s = `<defs>${lg('bsky', [[0, '#5E8FD0'], [.55, '#F7B98B'], [1, '#FFE2B0']])}${lg('bsea', [[0, '#3E86C2'], [1, '#2D6FA6']])}${lg('bwall', [[0, '#E9C9A0'], [1, '#D9B286']])}</defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#bsky)"/>`;
  s += `<circle cx="1180" cy="330" r="70" fill="#FFF1C6" opacity=".9"/><circle cx="1180" cy="330" r="120" fill="#FFF1C6" opacity=".18"/>`;
  // Montjuïc hill and Collserola ridge
  s += `<path d="M0 470 Q 160 390 320 430 T 640 450 L 640 560 L 0 560Z" fill="#8FA7A0" opacity=".75"/><path d="M0 500 Q 120 455 250 470 Q 330 440 420 485 L 420 560 L0 560Z" fill="#7C9A8E"/>`;
  // sea and beach on the right
  s += `<rect x="900" y="470" width="700" height="80" fill="url(#bsea)"/><path d="M900 470 h700" stroke="#FFE7C2" stroke-width="3" opacity=".7"/>`;
  s += `<path d="M960 548 Q 1200 528 1600 540 L1600 575 L 940 575Z" fill="#F3D8A5"/>`;
  for (let i = 0; i < 9; i++) s += `<path d="M${1000 + i * 66} ${505 + (i % 3) * 9} q 10 -6 20 0" stroke="#fff" stroke-width="3" fill="none" opacity=".5"/>`;
  // city blocks (Eixample): rows of buildings with small windows
  const cols = ['#E7C9A6', '#DDB894', '#EBD3B6', '#D7AE88', '#E4BE9C', '#CFA27E'];
  for (let row = 0; row < 2; row++) for (let x = -20; x < W; x += 52 + srnd() * 40) {
    if (row === 0 && x > 930) continue;
    const bw = 46 + srnd() * 44, bh = row ? 70 + srnd() * 50 : 50 + srnd() * 60, y = (row ? 640 : 560) - bh;
    s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh + 100}" fill="${cols[Math.floor(srnd() * cols.length)]}"/>`;
    for (let wy = y + 12; wy < y + bh + 60; wy += 18) for (let wx = x + 7; wx < x + bw - 8; wx += 13) s += `<rect x="${wx}" y="${wy}" width="6" height="9" fill="#8C6A52" opacity=".55"/>`;
    if (srnd() > .6) s += `<rect x="${x}" y="${y - 4}" width="${bw}" height="6" fill="#B8664A"/>`;
  }
  // Sagrada Família: a cluster of tall tapering spires
  const sg = (x, h, w) => `<path d="M${x - w} 560 L${x - w} ${560 - h * .78} Q ${x - w} ${560 - h * .92} ${x} ${560 - h} Q ${x + w} ${560 - h * .92} ${x + w} ${560 - h * .78} L ${x + w} 560Z" fill="#C7A27A"/><circle cx="${x}" cy="${560 - h - 6}" r="${w * .45}" fill="#E8C66A"/>${Array.from({ length: Math.floor(h / 26) }, (_, k) => `<rect x="${x - w * .35}" y="${560 - h * .72 + k * 22}" width="${w * .7}" height="6" fill="#9E7A58" opacity=".6"/>`).join('')}`;
  s += `<g transform="translate(-300 0)">${sg(520, 330, 15)}${sg(556, 360, 16)}${sg(594, 360, 16)}${sg(630, 330, 15)}${sg(575, 410, 20)}${sg(470, 250, 13)}${sg(680, 250, 13)}<rect x="440" y="430" width="270" height="140" fill="#C7A27A"/><path d="M500 560 v-70 q 30 -40 60 0 v70z M590 560 v-70 q 30 -40 60 0 v70z" fill="#9E7A58"/></g>`;
  // terrace: wall, tiles, railing
  s += `<rect x="0" y="690" width="${W}" height="210" fill="url(#bwall)"/>`;
  for (let x = 0; x < W; x += 60) s += `<path d="M${x} 690 v210" stroke="#C99E72" stroke-width="2" opacity=".5"/>`;
  s += `<rect x="0" y="680" width="${W}" height="18" fill="#B8664A"/>`;
  s += `<g stroke="#2E2A45" stroke-width="5" fill="none" opacity=".85"><path d="M0 610 H${W}"/>${Array.from({ length: 41 }, (_, i) => `<path d="M${i * 40} 610 V680"/>`).join('')}${Array.from({ length: 20 }, (_, i) => `<path d="M${i * 80 + 20} 640 q 20 -22 40 0 q -20 22 -40 0"/>`).join('')}</g>`;
  // bougainvillea in a pot (left) and a lemon tree pot (right)
  s += `<rect x="40" y="740" width="110" height="110" rx="10" fill="#C26A44"/><g fill="#E0408A">${Array.from({ length: 26 }, () => `<circle cx="${20 + srnd() * 160}" cy="${560 + srnd() * 190}" r="${10 + srnd() * 12}"/>`).join('')}</g><g fill="#3E8E5E" opacity=".7">${Array.from({ length: 14 }, () => `<circle cx="${30 + srnd() * 140}" cy="${600 + srnd() * 150}" r="${8 + srnd() * 8}"/>`).join('')}</g>`;
  // left table: book + rose (Sant Jordi) and a mug "Bon dia!"
  s += `<ellipse cx="300" cy="800" rx="170" ry="30" fill="#17122E" opacity=".2"/><rect x="140" y="760" width="320" height="18" rx="9" fill="#F4EBDD"/><rect x="290" y="778" width="16" height="110" fill="#8C7A68"/>`;
  s += `<g transform="translate(170 715) rotate(-6)"><rect width="120" height="40" rx="4" fill="#3D7BE0"/><rect y="30" width="120" height="10" fill="#F4EBDD"/><rect x="10" y="8" width="70" height="6" fill="#fff" opacity=".7"/></g>`;
  s += `<path d="M300 760 q 30 -40 70 -52" stroke="#2B8A4A" stroke-width="5" fill="none"/><path d="M330 735 q 14 -16 22 0z" fill="#2B8A4A"/><g transform="translate(372 704)"><circle r="16" fill="#D7263D"/><path d="M-10 -4 q 10 -12 20 0 q -10 10 -20 0" fill="#A8102A"/></g>`;
  s += `<g transform="translate(395 702)"><rect width="56" height="58" rx="8" fill="#FFF8EC"/><path d="M56 16 q 22 0 22 18 q 0 18 -22 16" stroke="#FFF8EC" stroke-width="8" fill="none"/><text x="28" y="34" font-family="Arial Black,Arial" font-size="12" fill="#E2483D" text-anchor="middle">Bon</text><text x="28" y="48" font-family="Arial Black,Arial" font-size="12" fill="#E2483D" text-anchor="middle">dia!</text></g>`;
  // right: market bag (La Boqueria) and a wall clock
  s += `<g transform="translate(1300 720)"><path d="M30 20 q 50 -60 100 0" stroke="#7A5A3A" stroke-width="8" fill="none"/><path d="M0 20 h160 l-14 130 h-132z" fill="#E7D2A8"/><path d="M10 50 h140" stroke="#C9AE7E" stroke-width="4"/><circle cx="50" cy="16" r="22" fill="#FF9F1C"/><circle cx="92" cy="10" r="20" fill="#E2483D"/><circle cx="120" cy="20" r="18" fill="#7CC243"/><path d="M90 -10 q 6 -10 14 -8" stroke="#2B8A4A" stroke-width="5" fill="none"/></g>`;
  s += `<g transform="translate(1500 640)"><circle r="46" fill="#FFF8EC" stroke="#2E2A45" stroke-width="7"/>${Array.from({ length: 12 }, (_, i) => `<rect x="-2" y="-40" width="4" height="9" fill="#2E2A45" transform="rotate(${i * 30})"/>`).join('')}<path d="M0 0 L0 -26" stroke="#2E2A45" stroke-width="6" stroke-linecap="round" transform="rotate(75)"/><path d="M0 0 L0 -34" stroke="#2E2A45" stroke-width="4" stroke-linecap="round" transform="rotate(180)"/><circle r="5" fill="#E2483D"/></g>`;
  // the gems
  s += sparkleG('sagrada', 275, 250) + sparkleG('catalan', 424, 690) + sparkleG('playa', 1300, 552) + sparkleG('boqueria', 1380, 700) + sparkleG('horario', 1500, 572) + sparkleG('santjordi', 230, 712);
  return `<svg class="scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

/* ---- people: head-and-shoulders portraits with a talking mouth ---- */
function bustSVG(c, cls = '') {
  const sk = c.skin, hr = c.hair;
  let back = '', front = '';
  if (c.style === 'long') back = `<path d="M128 170 q-34 210 8 320 h188 q42 -110 8 -320z" fill="${hr}"/>`;
  if (c.style === 'ponytail') back = `<path d="M318 140 q80 40 46 220 q-30 -46 -54 -70z" fill="${hr}"/>`;
  if (c.style === 'bun') back = `<circle cx="230" cy="90" r="46" fill="${hr}"/>`;
  if (c.style === 'bald') front = `<path d="M134 214 q-6 -46 26 -70 M326 214 q6 -46 -26 -70" stroke="${hr}" stroke-width="22" fill="none" stroke-linecap="round"/>`;
  else if (c.style === 'curly') front = Array.from({ length: 15 }, (_, i) => { const a = Math.PI * 1.02 + i / 14 * Math.PI * .96; return `<circle cx="${230 + Math.cos(a) * 104}" cy="${212 + Math.sin(a) * 100}" r="34" fill="${hr}"/>`; }).join('');
  else front = `<path d="M124 226 q-8 -128 106 -134 q114 6 106 134 q-30 -74 -106 -80 q-76 6 -106 80z" fill="${hr}"/>`;
  const brow = c.style === 'bald' ? '#8A8A90' : hr;
  const eyes = `<ellipse cx="190" cy="236" rx="12" ry="15" fill="#17122E"/><ellipse cx="270" cy="236" rx="12" ry="15" fill="#17122E"/><circle cx="194" cy="230" r="4" fill="#fff"/><circle cx="274" cy="230" r="4" fill="#fff"/><path d="M172 206 q18 -10 36 -2 M252 204 q18 -8 36 2" stroke="${brow}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  const glasses = c.glasses ? `<g fill="none" stroke="#2E2A45" stroke-width="6"><circle cx="190" cy="236" r="30"/><circle cx="270" cy="236" r="30"/><path d="M220 236 h20"/></g>` : '';
  const ear = c.earrings ? `<circle cx="128" cy="276" r="9" fill="#FFD25A"/><circle cx="332" cy="276" r="9" fill="#FFD25A"/>` : '';
  const beard = c.beard ? `<path d="M134 234 q-4 140 96 146 q100 -6 96 -146 q-8 40 -26 62 q-70 26 -140 0 q-18 -22 -26 -62z" fill="${hr}" opacity=".92"/>` : '';
  const mouth = `<g class="mouth"><path class="m-shut" d="M206 310 q24 18 48 0" stroke="#7A2E3A" stroke-width="7" fill="none" stroke-linecap="round"/><g class="m-open"><ellipse cx="230" cy="314" rx="22" ry="15" fill="#5A1E2C"/><ellipse cx="230" cy="322" rx="12" ry="5" fill="#E8586E"/><rect x="214" y="301" width="32" height="6" rx="3" fill="#fff"/></g></g>`;
  const s = `${back}<path d="M50 560 q10 -170 180 -180 q170 10 180 180z" fill="${c.top}"/><path d="M182 392 q48 40 96 0 l-10 -40 h-76z" fill="${sk}"/><rect x="198" y="300" width="64" height="84" fill="${sk}"/>
    <ellipse cx="230" cy="240" rx="104" ry="118" fill="${sk}"/><ellipse cx="128" cy="248" rx="16" ry="26" fill="${sk}"/><ellipse cx="332" cy="248" rx="16" ry="26" fill="${sk}"/>
    <ellipse cx="166" cy="280" rx="20" ry="12" fill="#FF6F8A" opacity=".25"/><ellipse cx="294" cy="280" rx="20" ry="12" fill="#FF6F8A" opacity=".25"/>
    <path d="M226 250 q-10 34 4 40" stroke="#17122E" stroke-width="4" fill="none" opacity=".35"/>${front}${eyes}${glasses}${ear}${beard}${mouth}`;
  return `<svg class="bust ${cls}" viewBox="0 0 460 560" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}
const appStyle = a => Object.assign({ style: a.fem ? (a.id === 'nuria' ? 'long' : a.id === 'valeria' ? 'ponytail' : 'long') : (a.id === 'lucas' ? 'curly' : 'short'), top: { aina: '#FF9F43', marc: '#E2483D', lucas: '#2BB673', valeria: '#3D7BE0', nuria: '#9B5DE5', omar: '#E05297' }[a.id] || '#3D7BE0', beard: a.id === 'omar' }, a);

/* ---- small job icons ---- */
const ICONS = {
  campamento: '<path d="M8 40 L24 10 L40 40Z" fill="#fff"/><path d="M24 10 L24 40" stroke="#2BB673" stroke-width="3"/><path d="M19 40 L24 30 L29 40Z" fill="#2BB673"/>',
  socorrista: '<circle cx="24" cy="24" r="15" fill="none" stroke="#fff" stroke-width="7"/><path d="M24 9 v6 M24 33 v6 M9 24 h6 M33 24 h6" stroke="#E2483D" stroke-width="7"/>',
  chiringuito: '<path d="M12 10 h24 l-4 28 h-16z" fill="#fff"/><path d="M14 18 h20" stroke="#FF9F43" stroke-width="4"/><path d="M30 6 l-6 16" stroke="#fff" stroke-width="3"/>',
  bici: '<circle cx="13" cy="30" r="8" fill="none" stroke="#fff" stroke-width="4"/><circle cx="35" cy="30" r="8" fill="none" stroke="#fff" stroke-width="4"/><path d="M13 30 l8 -14 h10 l4 14 M21 16 l6 14" stroke="#fff" stroke-width="3.5" fill="none" stroke-linejoin="round"/>',
  tienda: '<path d="M10 18 h28 l-3 22 h-22z" fill="#fff"/><path d="M17 18 q0 -10 7 -10 q7 0 7 10" stroke="#fff" stroke-width="4" fill="none"/>',
  cocina: '<path d="M8 22 h26 a0 0 0 0 1 0 0 v6 q0 8 -8 8 h-10 q-8 0 -8 -8z" fill="#fff"/><path d="M34 24 h8" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M16 16 q-3 -5 0 -9 M24 16 q-3 -5 0 -9" stroke="#fff" stroke-width="3" fill="none"/>',
};
const iconSVG = (id, size = 40) => `<svg class="jicon" viewBox="0 0 48 48" width="${size}" height="${size}" style="background:${JOB(id).color}">${ICONS[id]}</svg>`;
