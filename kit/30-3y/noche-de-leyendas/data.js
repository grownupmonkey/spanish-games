/* =====================================================================
   NOCHE DE LEYENDAS · DATA
   Everything a content editor might want to change lives in this block.
   The game engine (bottom of the file) reads these objects and never
   hard-codes Spanish content.

   QUICK GUIDE FOR EDITORS
   • Spoken lines ("LineSpecs") are strings or arrays of strings.
       "Hola."                       → always this line
       ["Hola.", "Buenas."]           → one of these, chosen at random
       "((Buenas noches|Buenas)), joven." → inline variants, chosen at random
   • {name} inserts a variable, {posada.name} a field, {menu|list} a list
     ("pepián, jocón y kak’ik"). Variables come from each scenario's `vars`.
   • Regular expressions ("re") are matched against what the student types,
     after it is lower-cased and stripped of accents and punctuation.
     So write them WITHOUT accents: "pepian", not "pepián".
   • VarSpecs (in `vars` and `set`):
       25                          a fixed value
       { oneOf: [25, 30, 35] }     one of these
       { range: [40, 60], step: 5} a number in the range
       { from: "DRINKS" }          one item from a LISTS entry
       { from: "DISHES", count: 3} several different items
       { from: "DRINKS", exclude: "drink" }  any item except var `drink`
       { pick: "menu" }            one item from an array variable
       { calc: "price - 10" }      arithmetic with other number variables
   ===================================================================== */

/* ---------- GAME: identity, voice and look ---------- */
const GAME = {
  id: 'noche-de-leyendas',
  title: 'Noche de leyendas',
  course: 'Español 30-3Y',
  city: 'Antigua Guatemala',
  nextCity: 'Montevideo',                     // Lucía names this at the very end
  // Speech: the first Spanish voice that matches wins (Guatemala → nearby → any Latin American → any Spanish)
  voicePrefs: ['es-GT', 'es-MX', 'es-US', 'es-419', 'es-HN', 'es-SV', 'es-CO', 'es-CR', 'es-ES'],
  // Story clock: one entry per stage (arrival, three scenes, finale)
  clock: ['17:35', '18:20', '19:05', '19:50', '20:30'],
  scenesPerRun: 3,      // city scenarios after the tuk-tuk (drawn from SCENARIOS)
  sidesPerRun: 2,       // optional side encounters shown on the map
  gemsPerRun: 6         // hidden "Datos de Antigua" placed per run
};

/* ---------- LANDMARKS (map grid: col 1 = west … 7 = east, row 1 = north … 8 = south) ---------- */
/* Antigua's avenidas run north–south (1a Avenida is the easternmost), calles run east–west (1a Calle is the northernmost). */
const LANDMARKS = {
  merced:      { name: 'La Merced',              col: 2, row: 1, glyph: 'church', color: '#F2C14E' },
  arco:        { name: 'el Arco de Santa Catalina', col: 3, row: 2, glyph: 'arch',   color: '#F4B740' },
  capuchinas:  { name: 'Capuchinas',             col: 6, row: 2, glyph: 'cloister', color: '#C9A27A' },
  parque:      { name: 'el Parque Central',      col: 3, row: 4, glyph: 'fountain', color: '#5FE0C8' },
  catedral:    { name: 'la Catedral',            col: 4, row: 4, glyph: 'church', color: '#EADBC4' },
  mercado:     { name: 'el Mercado',             col: 1, row: 4, glyph: 'stall',  color: '#FF9A6B' },
  tanque:      { name: 'el Tanque de la Unión',  col: 6, row: 5, glyph: 'tank',   color: '#7FB8E0' },
  sanfrancisco:{ name: 'San Francisco',          col: 7, row: 7, glyph: 'church', color: '#E8C3A0' }
};
const STREETS = {   // labels drawn on the map
  avenidas: ['7a Av.', '6a Av.', '5a Av. · Calle del Arco', '4a Av.', '3a Av.', '2a Av.', '1a Av.'],  // col 1..7
  calles: ['1a Calle', '2a Calle', '3a Calle', '4a Calle', '5a Calle', '6a Calle', '7a Calle', '8a Calle'] // row 1..8
};

/* ---------- LISTS: pools that scenarios draw from ---------- */
const LISTS = {
  POSADAS: [
    { name: 'Posada Santa Lucía', re: 'santa lucia' },
    { name: 'Posada El Quetzal', re: 'quetzal' },
    { name: 'Hostal Las Buganvilias', re: 'buganvilia|bugambilia|buganbilia' },
    { name: 'Casa Jacaranda', re: 'jacaranda' },
    { name: 'Posada Los Faroles', re: 'farol' },
    { name: 'Hostal La Ceiba', re: 'ceiba' }
  ],
  DISHES: [
    { name: 'pepián', the: 'el pepián', is: 'es', re: 'pepian|pipian', desc: 'un recado espeso de pollo con semillas y chiles tostados', price: 55 },
    { name: 'jocón', the: 'el jocón', is: 'es', re: 'jocon', desc: 'pollo en salsa verde de miltomate y cilantro', price: 50 },
    { name: 'kak’ik', the: 'el kak’ik', is: 'es', re: 'kak ?ik|kaq ?ik|kakik|caquic|kaquik|kakic', desc: 'un caldo rojo de chompipe, que es como decir pavo', price: 60 },
    { name: 'hilachas', the: 'las hilachas', is: 'son', re: 'hilacha', desc: 'carne deshebrada en salsa de tomate con papas', price: 45 },
    { name: 'chiles rellenos', the: 'los chiles rellenos', is: 'son', re: 'chiles? rellenos?', desc: 'chiles pimientos rellenos de carne y verduras', price: 45 },
    { name: 'subanik', the: 'el subanik', is: 'es', re: 'subanik|subanic|suban ik', desc: 'tres carnes cocidas en hoja de maxán', price: 60 }
  ],
  DRINKS: [
    { name: 'horchata', the: 'la horchata', re: 'horchata|orchata', price: 12 },
    { name: 'rosa de jamaica', the: 'la rosa de jamaica', re: 'jamaica', price: 12 },
    { name: 'atol de elote', the: 'el atol de elote', re: 'atol', price: 10 },
    { name: 'café', the: 'el café', re: 'cafe', price: 10 },
    { name: 'licuado de banano', the: 'el licuado de banano', re: 'licuado|banano|platano', price: 15 },
    { name: 'limonada', the: 'la limonada', re: 'limonada', price: 12 }
  ],
  CAFE_ITEMS: [
    { name: 'un capuchino', re: 'capuchino|cappuccino', price: 22 },
    { name: 'un chocolate caliente', re: 'chocolate', price: 20 },
    { name: 'un café de olla', re: 'cafe', price: 15 },
    { name: 'un pastel de banano', re: 'pastel|queque|banano', price: 18 },
    { name: 'unos rellenitos', re: 'rellenito', price: 16 },
    { name: 'un pan con frijol', re: 'pan', price: 12 }
  ],
  GIFTS: [
    { name: 'huipil', g: 'm', a: 'un', o: 'o', re: 'huipil|guipil|wipil' },
    { name: 'bufanda', g: 'f', a: 'una', o: 'a', re: 'bufanda' },
    { name: 'morral', g: 'm', a: 'un', o: 'o', re: 'morral|bolsa|bolso' },
    { name: 'faja', g: 'f', a: 'una', o: 'a', re: 'faja|cinturon' }
  ],
  COLORS: [
    { m: 'azul', f: 'azul', re: 'azul', hex: '#3E7BD8' },
    { m: 'rojo', f: 'roja', re: 'roj[oa]', hex: '#D8433E' },
    { m: 'morado', f: 'morada', re: 'morad[oa]|violeta|lila', hex: '#8A4FC7' },
    { m: 'verde', f: 'verde', re: 'verde', hex: '#3FA36B' },
    { m: 'amarillo', f: 'amarilla', re: 'amarill[oa]', hex: '#E8B83A' },
    { m: 'negro', f: 'negra', re: 'negr[oa]', hex: '#2A2433' }
  ],
  WEAVE_TOWNS: ['San Antonio Aguas Calientes', 'Santa Catarina Palopó', 'San Juan La Laguna', 'Nahualá'],
  BUSES: [
    { name: 'Ciudad Vieja', shout: '¡Ciudad Vieja, Ciudad Vieja! ¡San Miguel Dueñas!', paint: ['#D8433E', '#F2C14E'] },
    { name: 'Chimaltenango', shout: '¡Chimal, Chimal, Chimaltenango! ¡Suba, suba!', paint: ['#3E7BD8', '#F4F0E6'] },
    { name: 'la capital', shout: '¡Guate, Guate, Guate! ¡Directo a la capital!', paint: ['#3FA36B', '#F2C14E'] },
    { name: 'Jocotenango', shout: '¡Joco, Joco, Jocotenango! ¡Hay lugar!', paint: ['#8A4FC7', '#F4F0E6'] },
    { name: 'San Antonio Aguas Calientes', shout: '¡San Antonio, San Antonio Aguas Calientes!', paint: ['#E07A2F', '#3E7BD8'] },
    { name: 'Santa María de Jesús', shout: '¡Santa María, Santa María de Jesús! ¡Ya nos vamos!', paint: ['#F2C14E', '#D8433E'] }
  ],
  NEEDS: [   // directions scenario: what the student is looking for
    { en: 'You need cash. Ask where you can find an ATM.', re: 'cajero|banco|sacar (dinero|pisto|plata)|retirar', thing: 'un cajero automático', it: 'el cajero' },
    { en: 'You have a headache. Ask where there is a pharmacy.', re: 'farmacia|medicina|pastilla|aspirina|dolor', thing: 'una farmacia de turno', it: 'la farmacia' },
    { en: 'Your phone is almost dead. Ask where you can buy a charger.', re: 'cargador|celular|telefono|bateria|tienda', thing: 'una tienda de celulares', it: 'la tienda' },
    { en: 'You want to mail postcards home. Ask where the post office is.', re: 'correo|postal|sello|estampilla|carta', thing: 'el correo', it: 'el correo' },
    { en: 'You are hungry for a late snack. Ask where you can buy shucos (Guatemalan hot dogs).', re: 'shuco|chuco|comer|comida|hot ?dog|hambre', thing: 'una carreta de shucos', it: 'la carreta' }
  ],
  LOST_ITEMS: [
    { name: 'cartera', the: 'la cartera', a: 'una cartera', g: 'f', o: 'a', re: 'cartera|billetera', en: 'wallet' },
    { name: 'celular', the: 'el celular', a: 'un celular', g: 'm', o: 'o', re: 'celular|telefono|movil', en: 'phone' },
    { name: 'cámara', the: 'la cámara', a: 'una cámara', g: 'f', o: 'a', re: 'camara', en: 'camera' },
    { name: 'mochila', the: 'la mochila', a: 'una mochila', g: 'f', o: 'a', re: 'mochila|bolsa', en: 'small backpack' }
  ],
  FOUND_AT: [{ name: 'una tienda de barrio', it: 'la tienda' }, { name: 'una panadería', it: 'la panadería' }, { name: 'una farmacia', it: 'la farmacia' }, { name: 'la oficina de turismo', it: 'la oficina' }, { name: 'un café', it: 'el café' }],
  TIMES: [   // bus times for tomorrow
    { say: 'las seis y media', digits: '6:30' }, { say: 'las siete', digits: '7:00' }, { say: 'las siete y cuarto', digits: '7:15' },
    { say: 'las ocho menos cuarto', digits: '7:45' }, { say: 'las ocho y media', digits: '8:30' }
  ]
};

/* ---------- CAST: people who can appear (looks feed the portrait drawer) ---------- */
/* look: skin, hair, style (short|long|bun|braid|bald|curly), outfit (huipil|shirt|uniform|apron|jacket),
   color, accent, hat (sombrero|cap|null), age (young|adult|old), beard, mustache, glasses.  pitch/rate tune the voice. */
const CAST = {
  lucia: { name: 'Lucía', guide: true, pitch: 1.12, rate: 1 },
  DRIVERS: [
    { name: 'Don Neto', look: { skin: '#A86E50', hair: '#2A1F1A', style: 'short', outfit: 'jacket', color: '#2F5D8A', hat: 'cap', age: 'adult', mustache: true }, pitch: 0.85 },
    { name: 'Byron', look: { skin: '#B57A55', hair: '#1E1612', style: 'short', outfit: 'shirt', color: '#C8553D', hat: null, age: 'young' }, pitch: 1.0 },
    { name: 'Don Chus', look: { skin: '#9C6447', hair: '#8F8A9E', style: 'bald', outfit: 'shirt', color: '#3FA36B', hat: 'sombrero', age: 'old', mustache: true }, pitch: 0.78 }
  ],
  COOKS: [
    { name: 'Doña Chabelita', look: { skin: '#A8714F', hair: '#2A1F1A', style: 'braid', outfit: 'huipil', color: '#B83B5E', accent: '#F2C14E', age: 'adult' }, pitch: 1.1 },
    { name: 'Doña Rosario', look: { skin: '#9E6A4C', hair: '#C9C3D6', style: 'bun', outfit: 'apron', color: '#3E7BD8', accent: '#F4F0E6', age: 'old', glasses: true }, pitch: 1.0 },
    { name: 'Seño Mayra', look: { skin: '#B98263', hair: '#1E1612', style: 'long', outfit: 'apron', color: '#8A4FC7', accent: '#F4F0E6', age: 'young' }, pitch: 1.18 }
  ],
  VENDORS: [
    { name: 'Doña Juana', look: { skin: '#8E5A40', hair: '#1E1612', style: 'braid', outfit: 'huipil', color: '#D8433E', accent: '#3E7BD8', age: 'adult' }, pitch: 1.05 },
    { name: 'Ixchel', look: { skin: '#9A6248', hair: '#1E1612', style: 'braid', outfit: 'huipil', color: '#8A4FC7', accent: '#F2C14E', age: 'young' }, pitch: 1.2 },
    { name: 'Don Tono', look: { skin: '#A26A4C', hair: '#3A2A26', style: 'short', outfit: 'shirt', color: '#E07A2F', hat: 'sombrero', age: 'adult', mustache: true }, pitch: 0.82 }
  ],
  OFFICERS: [
    { name: 'Agente Morales', look: { skin: '#A26A4C', hair: '#1E1612', style: 'short', outfit: 'uniform', color: '#2B3A67', hat: 'cap', age: 'adult' }, pitch: 0.9 },
    { name: 'Agente López', look: { skin: '#B07656', hair: '#1E1612', style: 'bun', outfit: 'uniform', color: '#2B3A67', hat: 'cap', age: 'young' }, pitch: 1.12 }
  ],
  AYUDANTES: [
    { name: 'Kevin, el ayudante', look: { skin: '#A86E50', hair: '#1E1612', style: 'short', outfit: 'shirt', color: '#F2C14E', hat: 'cap', age: 'young' }, pitch: 1.0 },
    { name: 'Don Beto', look: { skin: '#94603F', hair: '#3A2A26', style: 'short', outfit: 'jacket', color: '#7A3B2A', hat: null, age: 'adult', mustache: true }, pitch: 0.84 }
  ],
  ELDERS: [
    { name: 'Doña Toñita', look: { skin: '#9E6A4C', hair: '#D7D0E3', style: 'bun', outfit: 'huipil', color: '#3FA36B', accent: '#D8433E', age: 'old', glasses: true }, pitch: 0.98 },
    { name: 'Don Lencho', look: { skin: '#8E5A44', hair: '#D7D0E3', style: 'bald', outfit: 'jacket', color: '#5B4A7A', hat: 'sombrero', age: 'old', mustache: true }, pitch: 0.74 }
  ],
  CLERKS: [
    { name: 'Doña Marlen', look: { skin: '#B07656', hair: '#2A1F1A', style: 'long', outfit: 'shirt', color: '#5FB0A0', age: 'adult', glasses: true }, pitch: 1.08 },
    { name: 'Gerson', look: { skin: '#A26A4C', hair: '#1E1612', style: 'curly', outfit: 'shirt', color: '#3E7BD8', age: 'young' }, pitch: 0.95 }
  ],
  BARISTAS: [
    { name: 'Sofía', look: { skin: '#B98263', hair: '#3A2A26', style: 'bun', outfit: 'apron', color: '#5B3A2A', accent: '#F4F0E6', age: 'young' }, pitch: 1.15 },
    { name: 'Diego', look: { skin: '#A86E50', hair: '#1E1612', style: 'short', outfit: 'apron', color: '#2F5D4A', accent: '#F4F0E6', age: 'young', beard: true }, pitch: 0.92 }
  ],
  storyteller: { name: 'Don Chepe', look: { skin: '#94603F', hair: '#E6E1EE', style: 'bald', outfit: 'jacket', color: '#3A2A55', hat: 'sombrero', age: 'old', mustache: true, beard: true }, pitch: 0.76, rate: 0.95 }
};

/* ---------- LEGENDS: fragments for the city, full tellings for the finale ---------- */
/* fragment + q: told by a local in a city scene, then one listening question.
   story: what Don Chepe tells (stops before the ending).
   events: five events in the right order (the ordering task shuffles them).
   why: a question about characters' motives.  ending: the real ending.
   endKeys: ideas Don Chepe recognizes in the student's ending (re + English note). */
const LEGENDS = [
  {
    id: 'sombreron', title: 'El Sombrerón', en: 'The Sombrerón', icon: 'hat',
    fragment: 'Dicen que por las noches anda por Antigua un hombrecito muy pequeño, con un sombrero enorme y una guitarra. Le gustaba trenzarles las crines a los caballos y a las mulas. Y cuando veía a una muchacha de pelo largo, se enamoraba de ella y le cantaba serenatas debajo de la ventana.',
    q: { ask: 'In the story, what did the Sombrerón like to do to horses?', options: ['Braid their manes', 'Steal them at night', 'Ride them up the volcano'] },
    story: [
      'Hace muchos años, en un barrio de Antigua, vivía una muchacha que se llamaba Celestina.',
      'Era muy bonita. Tenía los ojos grandes y un pelo larguísimo, negro y brillante.',
      'Una noche, mientras ella dormía, se oyó una guitarra debajo de su ventana.',
      'Era el Sombrerón: un hombrecito con un sombrero enorme, que cantaba canciones de amor.',
      'Desde esa noche, Celestina ya no quería comer. Solo pensaba en la música y pasaba las noches en la ventana.',
      'Su mamá estaba muy preocupada. Una mañana encontró trenzas en el pelo de su hija, iguales a las trenzas de los caballos.',
      'Entonces la familia decidió cortarle el pelo y llevarla a un convento, lejos del Sombrerón.'
    ],
    events: [
      'Celestina vivía en Antigua y tenía el pelo muy largo.',
      'El Sombrerón le cantó una serenata debajo de la ventana.',
      'Celestina dejó de comer y solo pensaba en la música.',
      'La mamá encontró trenzas en el pelo de su hija.',
      'La familia llevó a Celestina a un convento.'
    ],
    why: { ask: 'Why did the family cut Celestina’s hair and send her away?', options: ['To protect her from the Sombrerón', 'Because she wanted to become a nun', 'Because she had a fever'] },
    ending: 'Pero Celestina estaba tan triste que se enfermó, y unos días después murió. Durante el velorio, todos oyeron una guitarra en la calle: era el Sombrerón, que lloraba como un niño. Dicen que sus lágrimas cayeron como lluvia sobre Antigua. Y por eso, todavía hoy, algunas mamás les cortan el pelo a sus hijas… por si acaso.',
    endKeys: [
      { re: 'muri|muere|muerta|enferm|triste', en: 'Celestina became ill with sadness' },
      { re: 'llor|lagrim', en: 'the Sombrerón cried' },
      { re: 'guitarr|cant|serenat|music', en: 'the guitar came back' },
      { re: 'volvi|regres|busc|encontr|escap', en: 'someone came back or escaped' }
    ]
  },
  {
    id: 'tatuana', title: 'La Tatuana', en: 'La Tatuana', icon: 'boat',
    fragment: 'Mi abuela contaba que hace mucho tiempo, cuando Antigua todavía se llamaba Santiago de los Caballeros, encerraron a una mujer en la cárcel porque decían que era bruja. La llamaban la Tatuana. Y la noche antes de su castigo, desapareció de la celda sin abrir la puerta.',
    q: { ask: 'Why was the Tatuana locked up?', options: ['People said she was a witch', 'She stole gold from a church', 'She refused to pay her taxes'] },
    story: [
      'Hace más de trescientos años, en Santiago de los Caballeros, vivía una mujer joven a la que todos llamaban la Tatuana.',
      'Conocía las plantas que curaban y ayudaba a la gente pobre del barrio.',
      'Un comerciante muy rico quería casarse con ella, pero ella le dijo que no.',
      'El comerciante se enojó tanto que fue a la Inquisición y dijo que la Tatuana era bruja.',
      'Los guardias la buscaron, la encontraron y la encerraron en una celda oscura.',
      'La iban a castigar en la plaza al día siguiente. Esa noche, la Tatuana le pidió al carcelero un pedacito de carbón.',
      'Con el carbón, empezó a dibujar algo en la pared de la celda: un barquito.'
    ],
    events: [
      'La Tatuana ayudaba a la gente con plantas que curaban.',
      'Ella no quiso casarse con el comerciante.',
      'El comerciante dijo que ella era bruja.',
      'Los guardias la encerraron en una celda.',
      'Ella dibujó un barquito en la pared con carbón.'
    ],
    why: { ask: 'Why did the merchant accuse her of witchcraft?', options: ['He was angry because she turned him down', 'She had cured his enemy', 'She owed him money'] },
    ending: 'Cuando terminó el dibujo, la Tatuana le preguntó al carcelero: «¿Qué le falta a mi barquito?». El carcelero se rio y le contestó: «Solo le falta navegar». Entonces ella subió al barquito, y el barquito empezó a moverse por la pared… y desapareció. A la mañana siguiente, los guardias abrieron la celda y solo encontraron un dibujo en la pared y un olor a mar.',
    endKeys: [
      { re: 'barc|lancha|naveg|subi', en: 'she got into the boat' },
      { re: 'desaparec|escap|huy|se fue|libre|salio', en: 'she escaped' },
      { re: 'dibuj|pared|carbon', en: 'the drawing on the wall' },
      { re: 'mar|agua|olas', en: 'the sea' }
    ]
  },
  {
    id: 'cadejo', title: 'El Cadejo', en: 'El Cadejo (the spirit dogs)', icon: 'dog',
    fragment: 'Cuando yo era patojo, mi abuelo me contaba que de noche salen dos perros: el Cadejo blanco y el Cadejo negro. El blanco cuidaba a la gente que caminaba sola por la calle. Pero el negro… ese tenía los ojos rojos como brasas y buscaba a los que andaban en malos pasos.',
    q: { ask: 'What did the white Cadejo do?', options: ['It protected people walking alone at night', 'It chased the cats out of the market', 'It rang the church bells'] },
    story: [
      'Una noche de lluvia, un muchacho que se llamaba Chepe regresaba solo de una fiesta en Jocotenango.',
      'Las calles estaban vacías y no había luz. Solo se oía el agua que corría por las piedras.',
      'De repente, Chepe oyó pasos detrás de él. Se volteó, pero no vio a nadie.',
      'Siguió caminando más rápido. Cuando llegó a la esquina de la Calle del Arco, vio a un perro negro enorme.',
      'El perro tenía los ojos rojos como brasas, y le sonaban cadenas en las patas.',
      'Chepe quería correr, pero las piernas no le respondían. El perro negro se acercaba despacio.',
      'En ese momento, por la otra calle, apareció un perro blanco, grande y tranquilo.'
    ],
    events: [
      'Chepe regresaba solo de una fiesta.',
      'Oyó pasos, pero no vio a nadie.',
      'En la esquina vio a un perro negro con ojos rojos.',
      'Chepe quería correr, pero no podía.',
      'Apareció un perro blanco.'
    ],
    why: { ask: 'Why didn’t Chepe run away from the black dog?', options: ['He was frozen with fear', 'He had hurt his foot at the party', 'The street was flooded'] },
    ending: 'Los dos perros se miraron y empezaron a pelear en medio de la calle. El Cadejo blanco ganó, y el negro desapareció entre la neblina. Después, el perro blanco acompañó a Chepe hasta la puerta de su casa, sin hacer ruido. A la mañana siguiente, Chepe encontró pelos blancos en la puerta. Desde ese día, nunca volvió a caminar solo de noche.',
    endKeys: [
      { re: 'pele|lucha|atac|mord', en: 'the dogs fought' },
      { re: 'acompan|cuid|proteg|salv|ayud|defend', en: 'the white dog protected him' },
      { re: 'casa|puerta', en: 'he got home' },
      { re: 'desaparec|huy|se fue|corrio', en: 'the black dog disappeared' }
    ]
  },
  {
    id: 'llorona', title: 'La Llorona', en: 'La Llorona (the Weeping Woman)', icon: 'drop',
    fragment: 'En el Tanque de la Unión, donde antes las señoras lavaban la ropa, dicen que algunas noches se oye a una mujer que llora. Va vestida de blanco y tiene el pelo largo. Y grita: «¡Ay, mis hijos!».',
    q: { ask: 'What does the woman cry out?', options: ['“Oh, my children!”', '“Help, the volcano!”', '“Where is my husband?”'] },
    story: [
      'Hace muchos años, las mujeres de Antigua lavaban la ropa en los tanques públicos, como el Tanque de la Unión.',
      'Doña Chabela siempre lavaba de noche, porque de día trabajaba en una casa grande.',
      'Una noche de luna llena, mientras lavaba, oyó un llanto muy triste que venía del río Pensativo.',
      'Al principio pensó que era el viento. Pero el llanto se acercaba cada vez más.',
      'Entonces vio a una mujer vestida de blanco, con el pelo largo y mojado, que caminaba sin tocar el suelo.',
      'La mujer se paró al otro lado de la pila y le preguntó con una voz muy fría: «¿Has visto a mis hijos?».',
      'Doña Chabela no podía hablar. El agua de la pila se puso helada.'
    ],
    events: [
      'Doña Chabela lavaba la ropa de noche.',
      'Oyó un llanto que venía del río.',
      'Pensó que era el viento.',
      'Vio a una mujer vestida de blanco.',
      'La mujer le preguntó por sus hijos.'
    ],
    why: { ask: 'Why did Doña Chabela wash clothes at night?', options: ['She worked in a big house during the day', 'The water was cleaner at night', 'She wanted to see the ghost'] },
    ending: 'Doña Chabela dejó la ropa y salió corriendo hasta su casa, sin mirar atrás. Desde lejos, todavía oía el grito: «¡Ay, mis hijos!». Al día siguiente regresó por su ropa y la encontró toda doblada al lado de la pila, fría como el hielo. Nunca más volvió a lavar de noche.',
    endKeys: [
      { re: 'corr|huy|escap|se fue', en: 'Doña Chabela ran away' },
      { re: 'no volvio|nunca|ya no|jamas', en: 'she never washed at night again' },
      { re: 'grit|llor|hijos', en: 'the cry' },
      { re: 'ropa|pila', en: 'the clothes she left behind' }
    ]
  },
  {
    id: 'beatriz', title: 'Doña Beatriz y el Volcán de Agua', en: 'Doña Beatriz and the Volcán de Agua (legend and history)', icon: 'volcano',
    fragment: '¿Ve el Volcán de Agua? Antes la capital estaba allá abajo, en lo que hoy es Ciudad Vieja. En 1541 gobernaba una mujer, Doña Beatriz de la Cueva. Pero una noche de mucha lluvia, el volcán soltó un río de agua y lodo, y la ciudad desapareció.',
    q: { ask: 'What destroyed the old capital?', options: ['A flood of water and mud from the volcano', 'An earthquake during a festival', 'A fire in the governor’s palace'] },
    story: [
      'En 1541, la capital del reino de Guatemala estaba en el valle de Almolonga, al pie del Volcán de Agua.',
      'Ese año murió el conquistador Pedro de Alvarado, y su esposa, Doña Beatriz de la Cueva, recibió la noticia.',
      'Doña Beatriz estaba tan triste que mandó pintar todo su palacio de negro.',
      'Pero también era ambiciosa: aceptó ser gobernadora. Fue la primera mujer que gobernó en esa parte de América.',
      'Firmó los documentos con las palabras «La sin ventura Doña Beatriz».',
      'Pocos días después empezó a llover. Llovió tres días sin parar, y el cráter del volcán se llenó de agua.',
      'En la noche del diez de septiembre, se oyó un ruido terrible que bajaba de la montaña.'
    ],
    events: [
      'Murió Pedro de Alvarado.',
      'Doña Beatriz pintó su palacio de negro.',
      'Ella aceptó ser gobernadora.',
      'Llovió tres días sin parar.',
      'Se oyó un ruido terrible en la montaña.'
    ],
    why: { ask: 'Why did Doña Beatriz have her palace painted black?', options: ['She was in mourning for her husband', 'Black paint was cheaper', 'To hide from enemies at night'] },
    ending: 'Una pared del cráter se rompió, y un río de agua, lodo y piedras bajó sobre la ciudad. Doña Beatriz corrió con sus damas a la capilla del palacio, pero la capilla se derrumbó. La ciudad quedó destruida. Por eso, los sobrevivientes trasladaron la capital al valle de Panchoy, y así nació la ciudad que hoy llamamos Antigua.',
    endKeys: [
      { re: 'agua|lodo|piedra|inund|rio|cayo', en: 'the flood came down' },
      { re: 'muri|muere|murieron|mataron', en: 'Doña Beatriz died' },
      { re: 'capilla|iglesia|techo|palacio', en: 'the chapel' },
      { re: 'traslad|nueva|panchoy|antigua|mudar|cambi', en: 'the capital moved to Antigua' }
    ]
  },
  {
    id: 'siguanaba', title: 'La Siguanaba', en: 'La Siguanaba', icon: 'comb',
    fragment: 'Mi tío dice que a los hombres que andan de noche en la calle les puede salir la Siguanaba. De lejos parece una mujer muy bonita, con el pelo largo hasta la cintura. Pero si la sigues… cuando se da la vuelta, tiene cara de caballo.',
    q: { ask: 'What does the Siguanaba look like when she turns around?', options: ['She has the face of a horse', 'She has no face at all', 'She looks like your grandmother'] },
    story: [
      'Don Tacho era un hombre muy fiestero. Todas las noches salía y regresaba tarde a su casa.',
      'Su esposa siempre le decía: «Tacho, no andes tan tarde, que te va a salir la Siguanaba». Pero él se reía.',
      'Una noche, cuando regresaba por la orilla del río Pensativo, vio a una mujer que se bañaba en una pila.',
      'Tenía el pelo negro y larguísimo, y se peinaba con un peine de oro.',
      'Don Tacho le gritó: «¡Señorita! ¿Para dónde va tan solita?». La mujer no contestó, pero empezó a caminar.',
      'Él la siguió por calles cada vez más oscuras, hasta que llegaron a la orilla de un barranco.',
      'Entonces la mujer se paró y, muy despacio, empezó a darse la vuelta.'
    ],
    events: [
      'Don Tacho salía todas las noches.',
      'Su esposa le advirtió de la Siguanaba.',
      'Vio a una mujer que se bañaba en una pila.',
      'Él la siguió por calles oscuras.',
      'La mujer se paró al lado de un barranco.'
    ],
    why: { ask: 'What did his wife warn him about?', options: ['That the Siguanaba would appear if he stayed out late', 'That the river floods in the rainy season', 'That he would lose his job'] },
    ending: 'Cuando la mujer se dio la vuelta, Don Tacho vio que tenía cara de caballo y unos ojos que brillaban como fuego. Ella soltó una carcajada horrible, y Don Tacho se desmayó del susto. A la mañana siguiente, unos campesinos lo encontraron dormido a la orilla del barranco, todo lleno de lodo. Desde ese día, Don Tacho regresa a su casa temprano.',
    endKeys: [
      { re: 'caballo|cara|ojos', en: 'the horse face' },
      { re: 'desmay|grit|corr|susto|miedo|asust', en: 'he fainted or ran in fright' },
      { re: 'barranco|cayo|lodo', en: 'the ravine' },
      { re: 'temprano|nunca|ya no|cambi|no volvio', en: 'he changed his ways' }
    ]
  }
];

/* ---------- DIRECTIONS: phrase bank the map generator uses ---------- */
/* {from} start place, {ref} what you are facing, {n} "dos cuadras", {lm} a landmark you pass. Guatemalans often say "cruce" for "turn". */
const DIRECTIONS = {
  start: ['Mire, estamos aquí, en {from}, viendo hacia {ref}.', 'Fíjese: usted está aquí, en {from}, de frente hacia {ref}.', 'Bueno, desde aquí, desde {from}, con {ref} enfrente…'],
  refs: { N: 'el Cerro de la Cruz', S: 'el Volcán de Agua', E: 'el lado donde sale el sol', W: 'el lado donde se pone el sol' },
  straight: ['siga recto {n}', 'camine derecho {n}', 'váyase todo recto {n}'],
  right: ['cruce a la derecha y camine {n}', 'doble a la derecha y siga {n}', 'agarre a la derecha y camine {n}'],
  left: ['cruce a la izquierda y camine {n}', 'doble a la izquierda y siga {n}', 'agarre a la izquierda y camine {n}'],
  back: ['dé la vuelta y camine {n}', 'regrésese {n}'],
  firstLead: ['Primero, ', '', 'Bueno, '],
  connectors: ['Luego, ', 'Después, ', 'Cuando llegue a la esquina, ', 'Al llegar a esa esquina, '],
  pass: ['Va a pasar por {lm}.', 'En el camino va a ver {lm}.'],
  end: ['Ahí, en esa esquina, está {it}.', 'Allí está {it}, en la esquina. No tiene pérdida.', 'Justo en esa esquina va a ver {it}.'],
  blocks: ['', 'una cuadra', 'dos cuadras', 'tres cuadras', 'cuatro cuadras', 'cinco cuadras', 'seis cuadras', 'siete cuadras'],
  retry: ['No, no. Se lo explico otra vez, más despacio.', 'Casi. Escuche otra vez, con calma.'],
  ok: ['¡Exacto! Ahí es.', '¡Eso! Usted sí que sabe orientarse.', 'Cabal, ahí es. ¡Que le vaya bien!']
};

/* ---------- PHRASES the engine uses in many places ---------- */
const PHRASES = {
  notUnderstood: ['¿Perdón? No le entendí bien.', '¿Cómo dice? ¿Me lo repite, por favor?', 'Disculpe, no le entendí.'],
  english: ['Ay, fíjese que yo no hablo inglés… ¿Me lo dice en español?', 'Perdón, inglés no hablo. ¿En español, por favor?'],
  numWrong: 'Not quite. Listen again: press ⟲ Repetir.',
  storyStop: ['Y entonces… ¿Saben qué pasó? Esperen, esperen. Antes de terminar, quiero ver si me pusieron atención.'],
  howEnded: ['Ahora díganme ustedes: ¿cómo creen que terminó la historia?']
};

/* ---------- SCENARIOS ---------- */
/* Each scenario: id, title (shown on the map), place (landmark key or 'random'), cast (CAST pool),
   scene (backdrop: props + optional landmark), prefers (legend ids that fit this place),
   vars (VarSpecs), steps (run in order; `goto` jumps to a step id).
   Step types: say · talk · haggle · num · pick · audiopick · legend · map · write.
   The engine supplies the finale (story · order · why · write ending) from LEGENDS. */
const ARRIVAL = {
  id: 'tuktuk', title: 'El tuk-tuk', en: 'Get to your posada', place: 'mercado', cast: 'DRIVERS', prefers: ['cadejo', 'sombreron'],
  scene: { props: 'tuktuk', landmark: 'merced' },
  vars: { posada: { from: 'POSADAS' }, price: { oneOf: [35, 40, 45] }, fair: { calc: 'price - 15' }, floor: { calc: 'price - 20' } },
  steps: [
    { type: 'say', lines: ['((¡Buenas tardes!|¡Buenas!)) ¿Tuk-tuk? ((¿Para dónde va, joven?|¿Adónde lo llevo?|¿A dónde va?)) Súbase, que ya ((está oscureciendo|se está yendo el sol)).'] },
    { type: 'talk', id: 'dest', card: 'booking',
      task: 'Tell the driver the name of your posada (on your booking card) and ask how much the ride costs.',
      parts: [
        { re: '{posada.re}', ask: ['¿Y cómo se llama la posada? Hay muchas en Antigua.', '¿A qué posada va? Dígame el nombre.'] },
        { re: 'cuanto|precio|cobra|cuesta|vale|cobrar|tarifa|sale en', ask: ['Va pues, a la {posada.name}. ((¿Y no me va a preguntar cuánto le cobro?|Pregúnteme el precio, pues, que aquí todo se negocia.))'] }
      ],
      done: ['A la {posada.name}… ((Cabal, la conozco.|Sí, sí, sé dónde queda.)) Se lo dejo en {price} quetzales.'],
      hint: 'Name the posada and ask the price: “Voy a la …, por favor. ¿Cuánto me cobra?”',
      options: [
        { say: 'Buenas tardes. Voy a la {posada.name}. ¿Cuánto me cobra?', ok: true },
        { say: 'Buenas tardes. ¿Usted vive en la {posada.name}?', reply: ['¿Yo? No, joven. Yo vivo en Jocotenango. ¿Usted adónde va?'] },
        { say: 'Quiero comprar un tuk-tuk, por favor.', reply: ['¡Ja! Este no se vende. ¿Lo llevo a algún lado o no?'] }
      ] },
    { type: 'num', task: 'How much did the driver ask for the ride? (in quetzales)', answer: '{price}' },
    { type: 'haggle', task: 'A friend told you this ride should cost about Q{fair}. Bargain politely for a lower price.',
      start: '{price}', target: '{fair}', floor: '{floor}', paidVar: 'paidRide',
      counter: ['((¡Púchica!|¡Ay, no!)) Así no me sale. Se lo dejo en {counter}, ¿va?', 'Mire, la gasolina está cara… Le puedo hacer {counter}.'],
      accept: ['((Va pues.|Está bueno.|Trato hecho.)) {offer} quetzales. Súbase.'],
      acceptFull: ['Va pues, {offer} quetzales. Agárrese bien, que las calles son de piedra.'],
      hint: 'Offer a lower number, or ask for a discount: “¿Me lo deja en … quetzales?”, “¿No me lo deja más barato?”',
      options: [
        { say: '¿No me lo deja en {fair} quetzales, por favor?', ok: true },
        { say: 'Está bien, le pago {price}.', ok: true, full: true },
        { say: '¡Qué caro! Adiós.', reply: ['¡Espérese, espérese! No se vaya. ¿Cuánto me ofrece?'] }
      ] },
    { type: 'legend', intro: ['((Ya que va a andar de noche…|Ahora que se está haciendo de noche…)) le voy a contar algo.'] },
    { type: 'say', lines: ['((Aquí está su posada.|Llegamos, joven.)) ((¡Que le vaya bien!|¡Que disfrute Antigua!)) Y de noche, tenga cuidado, ((por si acaso|uno nunca sabe)).'] }
  ]
};

const SCENARIOS = [
  /* ---- FOOD: the comedor ---- */
  {
    id: 'comedor', title: 'El comedor', en: 'Dinner at a comedor', place: 'random', cast: 'COOKS', prefers: ['llorona', 'siguanaba'],
    scene: { props: 'comedor', landmark: null },
    vars: { menu: { from: 'DISHES', count: 3 }, soldOut: { pick: 'menu' }, okDish: { pick: 'menu', exclude: 'soldOut' } },
    steps: [
      { type: 'say', lines: ['((¡Buenas noches!|¡Buenas!)) Pase adelante, ((siéntese donde guste|aquí hay una mesita libre)).', 'Hoy tenemos {menu|list}. {okDish.the|cap} {okDish.is} {okDish.desc}. ((¿Qué le sirvo?|¿Qué va a querer?|¿Qué se le antoja?))'] },
      { type: 'talk', id: 'order',
        task: 'Order one of today’s dishes and a drink.',
        parts: [
          { match: '$menu', capture: 'dish', reject: [{ match: '$soldOut', say: ['Ay, fíjese que de {soldOut.name} ya no hay, se nos acabó. ((Es que hoy vino mucha gente.|Lo vendimos todo al mediodía.)) ¿Quiere otra cosa?'] }],
            ask: ['¿Y qué plato le traigo? Le repito: {menu|list}.'] },
          { match: 'DRINKS', capture: 'drink', ask: ['¿Y para tomar? Tenemos horchata, rosa de jamaica, atol de elote, café, licuado de banano y limonada.'] }
        ],
        done: ['Muy bien: {dish.name} y {drink.name}. ((Ahorita se lo traigo.|Ya se lo traigo.))'],
        hint: 'Name a dish she said, and a drink: “Me trae el …, por favor, y una horchata.” One dish may be sold out.',
        options: [
          { say: 'Me trae {okDish.the}, por favor, y una horchata.', ok: true, effect: { dish: '$okDish', drink: 'DRINKS.0' } },
          { say: '¿Usted es la cocinera?', reply: ['Sí, yo cocino todo, con la receta de mi mamá. ¿Qué le sirvo?'] },
          { say: 'Quiero una hamburguesa con papas.', reply: ['Ay, eso no tenemos. Aquí solo comida chapina. ¿Qué le traigo?'] }
        ] },
      { type: 'say', set: { wrongDrink: { from: 'DRINKS', exclude: 'drink' } },
        lines: ['Aquí tiene: {dish.the}, con arroz y tortillas, y su {wrongDrink.name}. ¡Buen provecho!'] },
      { type: 'talk', id: 'fix',
        task: 'Something about your order isn’t right. Tell her politely.',
        parts: [
          { re: '{drink.re}|no (es|era) (lo que|mi)|equivoc|no pedi|yo pedi|habia pedido|queria|pedi', ask: ['¿Sí? ¿Qué pasó? ¿Qué fue lo que pidió?'] }
        ],
        done: ['¡Ay, perdone! ((Me equivoqué de mesa.|Me confundí.)) Ahorita le cambio la bebida y le traigo {drink.the}.'],
        else: ['((¿Todo bien?|¿Le gusta?)) ¿Le falta algo?'],
        hint: 'She brought the wrong drink. Say what you ordered: “Perdón, pero yo pedí …”',
        options: [
          { say: 'Perdón, pero yo pedí {drink.the}, no {wrongDrink.the}.', ok: true },
          { say: '¡Qué rico! Muchas gracias.', reply: ['De nada. ¿Seguro que todo está bien? Mire bien lo que le traje.'] },
          { say: '¿Me trae la cuenta, por favor?', reply: ['Ahorita, pero… ¿no se fijó en la bebida?'] }
        ] },
      { type: 'legend', intro: ['((Mientras come…|Ya que está aquí tranquilo…)) ¿Usted conoce las leyendas de aquí? Mi mamá siempre me contaba una.'] },
      { type: 'say', set: { total: { calc: 'dish.price + drink.price' } },
        lines: ['((Bueno, aquí está la cuenta.|Ya le traigo la cuenta.)) Son {dish.price} quetzales por {dish.the} y {drink.price} por {drink.the}.'] },
      { type: 'num', task: 'Add it up: how much is the bill in total?', answer: '{total}', listen: false },
      { type: 'say', lines: ['Cabal, {total} quetzales. ¡Muchas gracias! ((Vuelva pronto.|Que le vaya bonito.))'] }
    ]
  },

  /* ---- SHOPPING: the artisan market ---- */
  {
    id: 'mercado', title: 'El mercado de artesanías', en: 'A gift for Lucía’s grandmother', place: 'random', cast: 'VENDORS', prefers: ['sombreron', 'siguanaba'],
    scene: { props: 'market', landmark: 'arco' },
    vars: { gift: { from: 'GIFTS' }, color: { from: 'COLORS' }, otherColors: { from: 'COLORS', count: 2, exclude: 'color' }, town: { from: 'WEAVE_TOWNS' },
            colorWord: { agree: 'color', with: 'gift' }, otherWord: { agree: 'otherColors.0', with: 'gift' }, budget: { oneOf: [120, 150, 180] }, price: { calc: 'budget + 40' }, floor: { calc: 'budget - 20' } },
    brief: ['Oye, ¿me haces un favor? Quiero que le compres un regalo a mi abuela en el mercado de artesanías. Ella quiere {gift.a} {gift.name} {colorWord}. Pero que no cueste más de {budget} quetzales, ¿eh? ¡Gracias!'],
    steps: [
      { type: 'say', lines: ['((¡Pase adelante!|¡Adelante, adelante!)) ¿Qué anda buscando? Tengo huipiles, bufandas, morrales, fajas… todo hecho a mano.'] },
      { type: 'talk', id: 'ask',
        task: 'Ask for the gift Lucía described in her voice message: the item and the colour. (Replay her message in your Libreta if you need to.)',
        parts: [
          { re: '{gift.re}', ask: ['((¿Pero qué busca: huipil, bufanda, morral o faja?|Dígame qué cosa busca.))'] },
          { re: '{color.re}', reject: [{ re: '{otherColors.0.re}|{otherColors.1.re}', say: ['Ese color no me queda, fíjese. ¿No quiere otro?'] }], ask: ['((¿Y de qué color lo quiere?|¿De qué color?)) Tengo de todos los colores.'] }
        ],
        done: ['((Mire, aquí tengo|Fíjese que tengo)) {gift.a} {gift.name} {colorWord}, tejid{gift.o} a mano en {town}. ((Se l{gift.o} dejo en|Le sale en)) {price} quetzales.'],
        hint: 'Say what Lucía asked for: “Busco un/una … (colour) para mi abuela.”',
        options: [
          { say: 'Busco {gift.a} {gift.name} {colorWord} para una abuelita.', ok: true },
          { say: 'Busco {gift.a} {gift.name} {otherWord}.', reply: ['¿{otherWord|cap}? Ese color no me queda. ¿Seguro que es ese?'] },
          { say: 'Solo estoy mirando, gracias.', reply: ['Con confianza. ¿Pero no busca algo especial? ¿Un regalo?'] }
        ] },
      { type: 'haggle', task: 'That’s over Lucía’s budget (she said it in her message). Bargain until the price fits.',
        start: '{price}', target: '{budget}', floor: '{floor}', paidVar: 'paidGift',
        counter: ['((¡Ay, me está matando!|¡Uy, no!)) Esto lleva semanas de trabajo… Se l{gift.o} dejo en {counter}.', 'Mire, por ser usted, {counter}. Más no puedo.'],
        accept: ['((Va pues.|Está bueno, pues.)) {offer} quetzales. ((Se lleva algo muy bonito.|A su abuelita le va a encantar.))'],
        acceptFull: ['Muy bien, {offer} quetzales. ¡Gracias!'],
        hint: 'Offer Lucía’s budget or less: “¿Me lo deja en … quetzales?”, “Es que solo tengo …”',
        options: [
          { say: 'Es muy bonito, pero solo tengo {budget} quetzales. ¿Me lo deja en {budget}?', ok: true },
          { say: 'Bueno, me lo llevo por {price}.', ok: true, full: true },
          { say: '¿Lo tiene en otro color?', reply: ['En ese color solo me queda este. ¿Cuánto me ofrece?'] }
        ] },
      { type: 'legend', intro: ['((Ya que me hizo rebajar…|Ahora que se lleva su regalo…)) le cuento algo que me contaban de patoja.'] },
      { type: 'say', lines: ['((¡Que le vaya bien!|Gracias por su compra.)) Y salúdeme a la abuelita.'] }
    ]
  },

  /* ---- DIRECTIONS: the tourist police (PROATUR) ---- */
  {
    id: 'direcciones', title: 'La policía de turismo', en: 'Ask for directions', place: 'parque', cast: 'OFFICERS', prefers: ['cadejo', 'beatriz'],
    scene: { props: 'park', landmark: 'catedral' },
    vars: { need: { from: 'NEEDS' } },
    steps: [
      { type: 'say', lines: ['((Buenas noches.|¡Buenas!)) Agente de la policía de turismo. ((¿En qué le puedo servir?|¿Le puedo ayudar en algo?))'] },
      { type: 'talk', id: 'ask', taskVar: 'need.en',
        parts: [
          { re: '{need.re}', ask: ['((Con mucho gusto le ayudo.|Claro.)) ¿Qué es lo que busca?'] },
          { re: 'donde|como (llego|llegar|se llega|puedo llegar)|sabe si hay|hay (un|una)|me (podria|puede) (decir|ayudar|indicar)|busco|necesito|ando buscando|queda', ask: ['¿Y qué necesita saber? ¿Dónde queda?'] }
        ],
        done: ['¿{need.thing|cap}? ((Sí, claro.|Claro, no está lejos.|Cómo no.))'],
        checks: ['usted'],
        hint: 'Ask politely where it is: “Disculpe, ¿me podría decir dónde hay …?”',
        options: [
          { say: 'Disculpe, ¿me podría decir dónde hay {need.thing}?', ok: true },
          { say: '¿Usted trabaja aquí todos los días?', reply: ['Sí, todos los días, menos los martes. ¿Qué anda buscando?'] },
          { say: 'Me gusta mucho Antigua.', reply: ['¡Qué bueno! A mí también. ¿Le ayudo con algo?'] }
        ] },
      { type: 'map', from: 'parque', it: '{need.it}', task: 'Follow the officer’s directions. Click the place where you end up.' },
      { type: 'legend', intro: ['((Y un consejo:|Ah, y otra cosa:)) no camine solo muy tarde. ((No por los ladrones…|No solo por seguridad…)) Usted sabe lo que dicen de las noches de Antigua…'] },
      { type: 'say', lines: ['((Que tenga buena noche.|¡Que le vaya bien!)) Y si necesita algo, aquí estamos.'] }
    ]
  },

  /* ---- TRANSPORT: the chicken-bus terminal ---- */
  {
    id: 'camioneta', title: 'La terminal de camionetas', en: 'Tomorrow’s bus', place: 'mercado', cast: 'AYUDANTES', prefers: ['beatriz', 'tatuana'],
    scene: { props: 'buses', landmark: null },
    vars: { buses: { from: 'BUSES', count: 3 }, dest: { pick: 'buses' }, time: { from: 'TIMES' }, fare: { oneOf: [5, 6, 8, 10] } },
    brief: ['¡Ey! Mañana vamos a {dest.name}, ¿te acuerdas? Pasa por la terminal de camionetas y pregunta a qué hora sale la primera y cuánto cuesta. ¡Gracias!'],
    steps: [
      { type: 'audiopick', task: 'Tomorrow you and Lucía are going to {dest.name}. Three ayudantes are shouting destinations. Which bus goes there?',
        choices: '$buses', sayKey: 'shout', answer: '$dest', label: 'Camioneta' },
      { type: 'say', lines: ['((¡Eso! Esta es.|¡Súbase, súbase!… Ah, ¿es para mañana?)) ¿En qué le puedo ayudar?'] },
      { type: 'talk', id: 'info',
        task: 'Ask the ayudante what time the first bus leaves tomorrow and how much it costs.',
        parts: [
          { re: 'a que hora|cuando sale|hora sale|horario|que hora|primera', ask: ['((¿Y no quiere saber la hora?|¿Le digo a qué hora sale?))'] },
          { re: 'cuanto|precio|cobra|cuesta|vale|pasaje', ask: ['((¿Y el pasaje? ¿No me pregunta cuánto es?|Pregunte el precio también, pues.))'] }
        ],
        done: ['Mañana la primera saldrá a {time.say} en punto. ((Y el pasaje le costará|El pasaje es de)) {fare} quetzales. ((No llegue tarde, ¿eh?|Venga temprano para agarrar asiento.))'],
        hint: 'Ask two things: “¿A qué hora sale la primera camioneta mañana?” and “¿Cuánto cuesta el pasaje?”',
        options: [
          { say: '¿A qué hora sale la primera mañana, y cuánto cuesta el pasaje?', ok: true },
          { say: '¿Esta camioneta es muy vieja?', reply: ['¡Vieja pero bonita! Es un bus escolar de Estados Unidos. ¿Qué más quiere saber?'] },
          { say: '¿Dónde está el baño?', reply: ['Allá atrás, por el mercado. ¿Y la camioneta? ¿Qué quería saber?'] }
        ] },
      { type: 'pick', task: 'What time does the first bus leave tomorrow?', optionsFrom: 'TIMES', label: 'digits', answer: '$time' },
      { type: 'num', task: 'How much is the fare? (in quetzales)', answer: '{fare}' },
      { type: 'legend', cast: 'ELDERS', intro: ['((Joven, joven…|Disculpe, joven…)) Lo oí preguntar. Mientras espera, ¿quiere que le cuente algo de por aquí?'] },
      { type: 'say', cast: 'ELDERS', lines: ['((Bueno, ya me voy, que se hace tarde.|Que Dios lo acompañe.)) ¡Buenas noches!'] }
    ]
  },

  /* ---- PROBLEM: the lost wallet ---- */
  {
    id: 'cartera', title: 'Algo se perdió', en: 'Solve a problem at the posada', place: 'posada', cast: 'CLERKS', prefers: ['tatuana', 'llorona'],
    scene: { props: 'posada', landmark: null },
    vars: { item: { from: 'LOST_ITEMS' }, foundAt: { from: 'FOUND_AT' } },
    steps: [
      { type: 'say', lines: ['((¡Buenas noches!|¡Ah, ya regresó!)) ¿Qué le pasa? ((Lo veo preocupado.|Tiene cara de susto.))'] },
      { type: 'talk', id: 'lost', task: 'Oh no — you can’t find your {item.en}! Tell the receptionist what you lost.',
        parts: [ { re: '{item.re}', ask: ['¿Qué perdió? ¿Su cartera, su celular…?'] }, { re: 'perd|no (encuentro|tengo|esta)|se me|desaparec|robar|olvid|dej', ask: ['¿Qué le pasó con {item.the}?'] } ],
        done: ['¡Ay, no! ¿Perdió {item.the}? ((No se preocupe, aquí la gente es honrada.|Calma, calma, vamos a ver.))'],
        hint: '“Perdí mi …” or “No encuentro mi …”',
        options: [
          { say: 'Perdí mi {item.name}. No l{item.o} encuentro por ningún lado.', ok: true },
          { say: 'Estoy muy cansado.', reply: ['Me imagino, ¡caminó todo el día! Pero lo veo preocupado. ¿Perdió algo?'] },
          { say: 'Quiero otra habitación.', reply: ['Mmm, la posada está llena. Pero dígame, ¿qué le pasó?'] }
        ] },
      { type: 'write', id: 'did', person: 'yo', min: { pretYo: 2 },
        npc: ['((A ver, piense bien:|Vamos por partes:)) ¿Qué hizo esta tarde? ¿Adónde fue?'],
        task: 'Tell her what you did this afternoon: at least two things, in the past (preterite). For example where you went and what you did.',
        done: ['((Ajá…|Ya veo…)) Entonces anduvo por varios lados.'],
        hint: 'Use yo-forms of the preterite: fui, comí, compré, visité, tomé, caminé, entré, vi…',
        model: 'Primero fui al mercado y compré un regalo. Después comí en un comedor y caminé por el parque.' },
      { type: 'write', id: 'desc', person: 'yo', min: { imperfect: 1 },
        npc: ['¿Y cómo era {item.the}? Descríbamel{item.o}, por si alguien l{item.o} encuentra.'],
        task: 'Describe your {item.en} in the past: what it was like (colour, size, what it had inside). Use the imperfect: era, tenía, estaba…',
        done: ['Perfecto, ((lo anoto todo.|ya tengo los detalles.))'], captureColor: 'itemColor',
        hint: 'Imperfect for descriptions: “Era pequeña y negra. Tenía mi pasaporte adentro.”',
        model: 'Era pequeña y negra. Tenía unas fotos y un poco de dinero adentro.' },
      { type: 'say', lines: ['¡Momento! Está sonando el teléfono…', '¡Buenas noticias! Llamaron de {foundAt.name}: alguien encontró {item.a} que coincide con su descripción. Le explico cómo llegar.'] },
      { type: 'map', from: 'posada', it: '{foundAt.it}', task: 'Listen to her directions and click the place where your {item.en} is waiting.' },
      { type: 'legend', intro: ['((Antes de que se vaya…|Ya que ya está más tranquilo…)) ¿sabía que esta casa es muy antigua? Aquí cuentan una historia…'] },
      { type: 'say', lines: ['((¡Corra, que ya es tarde!|Vaya, vaya, que la están esperando.)) ¡Suerte!'] }
    ]
  },

  /* ---- CAFÉ: order and catch the wrong change ---- */
  {
    id: 'cafe', title: 'El café', en: 'Coffee and the wrong change', place: 'random', cast: 'BARISTAS', register: 'tu', prefers: ['siguanaba', 'sombreron'],
    scene: { props: 'cafe', landmark: null },
    vars: { items: { from: 'CAFE_ITEMS', count: 2 }, paidWith: 100, short: { oneOf: [10, 20] } },
    steps: [
      { type: 'say', lines: ['((¡Hola, buenas noches!|¡Bienvenido!)) Este café es de las faldas del volcán, cien por ciento antigüeño. ((¿Qué te sirvo?|¿Qué vas a tomar?))'] },
      { type: 'talk', id: 'order', task: 'Order something to drink and something to eat.',
        parts: [ { match: 'CAFE_ITEMS', capture: 'item1', ask: ['((¿Qué te preparo?|¿Qué te sirvo?)) Tenemos capuchino, chocolate caliente, café de olla…'] },
                 { re: 'pastel|queque|rellenito|pan|galleta|comer|algo de comer|sandwich', ask: ['¿Y algo de comer? El pastel de banano está recién salido del horno.'] } ],
        done: ['((¡Dale!|¡Listo!)) Ya te lo preparo.'],
        hint: 'A drink and a snack: “Quiero un capuchino y un pastel de banano, por favor.”',
        options: [
          { say: 'Un chocolate caliente y unos rellenitos, por favor.', ok: true, effect: { item1: 'CAFE_ITEMS.1' } },
          { say: '¿Tienes wifi?', reply: ['Sí, la clave está en la pared. ¿Y qué vas a tomar?'] },
          { say: 'No me gusta el café.', reply: ['¡Tranquilo! Tenemos chocolate caliente también. ¿Qué te sirvo?'] }
        ] },
      { type: 'say', set: { total: { oneOf: [34, 38, 42, 45] }, change: { calc: 'paidWith - total' }, gave: { calc: 'paidWith - total - short' } },
        lines: ['((Aquí tienes.|Listo, aquí está todo.)) Son {total} quetzales.', '[en]You hand over a Q100 note.', 'Gracias. Aquí está tu cambio: {gave} quetzales.'] },
      { type: 'num', task: 'You paid with Q100 and the bill was Q{total}. How much change should you get?', answer: '{change}', listen: false, showTask: true },
      { type: 'talk', id: 'change', task: 'The barista gave you Q{gave}. Tell her politely there’s a mistake.',
        parts: [ { re: 'cambio|me falta|faltan|me dio|me diste|equivoc|error|incorrect|deberia|son {change}|{change}|no es', ask: ['¿Pasa algo? ¿Todo bien?'] } ],
        done: ['¡Uy, perdón! ((Tenés razón… digo, tienes razón.|Me equivoqué.)) Aquí están los {short} que faltaban. ¡Qué pena!'],
        hint: '“Perdón, creo que me falta cambio. Le di cien y la cuenta era de …”',
        options: [
          { say: 'Perdón, creo que me diste mal el cambio. Me faltan {short} quetzales.', ok: true },
          { say: '¡Muchas gracias! ¡Qué amable!', reply: ['¡De nada!… Oye, cuenta bien tu cambio, ¿eh?'] },
          { say: '¿Me das una servilleta?', reply: ['Claro, aquí tienes. ¿Algo más?'] }
        ] },
      { type: 'legend', intro: ['((Por cierto…|Oye, ya que vas a salir tarde…)) mi tío siempre me cuenta una historia de la noche.'] },
      { type: 'say', lines: ['((¡Disfruta tu chocolate!|¡Buen provecho!)) Y si ves algo raro en la calle… ¡no lo sigas!'] }
    ]
  }
];

/* ---------- SIDE ENCOUNTERS (optional, short; each reveals a Dato) ---------- */
const SIDES = [
  { id: 'lustrador', title: 'El lustrador', place: 'parque', who: { name: 'Josué', look: { skin: '#A86E50', hair: '#1E1612', style: 'short', outfit: 'shirt', color: '#E07A2F', hat: 'cap', age: 'young' }, pitch: 1.2 },
    say: ['((¡Lustre, lustre!|¡Joven! ¿Le lustro los zapatos?)) Se los dejo brillantes por diez quetzales.'],
    task: 'A shoeshine boy offers to polish your shoes. Accept or decline politely.',
    branches: [ { re: 'no gracias|no,? gracias|ahorita no|no necesito|otro dia|mejor no|no quiero', say: ['Va pues, ((otro día será.|que le vaya bien.)) ¿Sabía que esa fuente del parque es famosa? Mire las sirenas.'] },
                { re: 'si|bueno|claro|esta bien|dale|va|por favor', say: ['¡Va pues! Siéntese en la banca… ¡Listo, mire qué brillo! ¿Sabía que esa fuente del parque es famosa? Mire las sirenas.'] } ],
    gem: 'sirenas' },
  { id: 'rellenitos', title: 'Los rellenitos', place: 'catedral', who: { name: 'Doña Cata', look: { skin: '#9E6A4C', hair: '#2A1F1A', style: 'braid', outfit: 'huipil', color: '#D8433E', accent: '#3FA36B', age: 'adult' }, pitch: 1.05 },
    say: ['((¡Rellenitos, rellenitos calientitos!|¡Lleve sus rellenitos!)) A cinco quetzales cada uno. ¿Cuántos le doy?'],
    task: 'A woman is selling rellenitos (sweet plantain dumplings). Buy some: say how many.',
    branches: [ { re: '\\b(un|uno|dos|tres|cuatro|cinco|seis|[1-9])\\b', say: ['¡Aquí tiene! Ojo: por dentro tienen frijol negro con chocolate y canela. ¿Verdad que no se lo esperaba?'] },
                { re: 'no gracias|no,? gracias|ahorita no', say: ['Va pues. Pero se lo pierde, ¿eh? Tienen frijol dulce con chocolate por dentro.'] } ],
    gem: 'rellenitos' },
  { id: 'marimba', title: 'La marimba', place: 'tanque', who: { name: 'Don Rigo', look: { skin: '#8E5A44', hair: '#3A2A26', style: 'short', outfit: 'shirt', color: '#F4F0E6', hat: 'sombrero', age: 'adult', mustache: true }, pitch: 0.82 },
    say: ['¡Buenas noches! Estamos tocando marimba. ((¿De dónde es usted?|¿Y usted de dónde viene?))'],
    task: 'A marimba player asks where you’re from. Answer him.',
    branches: [ { re: 'soy de|vengo de|canada|alberta|lethbridge|estados unidos|vivo en', say: ['¡Qué lejos! Entonces esta pieza va para usted. La marimba es el instrumento nacional de Guatemala, ¿sabía?'] } ],
    gem: 'marimba' },
  { id: 'barrilete', title: 'Los barriletes', place: 'merced', who: { name: 'Pedrito', look: { skin: '#A86E50', hair: '#1E1612', style: 'curly', outfit: 'shirt', color: '#3E7BD8', age: 'young' }, pitch: 1.3 },
    say: ['¡Mire mi barrilete! Lo hice yo. ((¿Le gusta?|¿Verdad que está chilero?))'],
    task: 'A boy shows you the kite he made. React and ask him something about it.',
    branches: [ { re: 'bonito|lindo|chilero|me gusta|precioso|increible|genial|que bien|como|cuanto|hiciste|quien|donde|cuando', say: ['¡Gracias! Para el Día de Todos los Santos, en Sumpango hacen barriletes gigantes, ¡más grandes que una casa! Así se comunican con los difuntos.'] } ],
    gem: 'barriletes' },
  { id: 'hora', title: 'El abuelo de la banca', place: 'sanfrancisco', who: { name: 'Don Fermín', look: { skin: '#94603F', hair: '#D7D0E3', style: 'bald', outfit: 'jacket', color: '#7A5236', hat: 'sombrero', age: 'old', mustache: true }, pitch: 0.75 },
    say: ['Buenas noches, joven. Fíjese que se me olvidó el reloj. ¿Qué hora tiene?'],
    task: 'An old man asks you the time. Look at the clock at the top of the scene and tell him.',
    branches: [ { re: 'son las|es la|las (seis|siete|ocho|nueve)|\\d', say: ['Ah, gracias. Aquí en San Francisco está la tumba del Hermano Pedro. Dicen que de noche caminaba por estas calles tocando una campanita.'] } ],
    gem: 'hermanopedro' },
  { id: 'pulseras', title: 'Las pulseras', place: 'capuchinas', who: { name: 'Ana', look: { skin: '#9A6248', hair: '#1E1612', style: 'braid', outfit: 'huipil', color: '#8A4FC7', accent: '#3FA36B', age: 'young' }, pitch: 1.25 },
    say: ['((¡Pulseras, pulseras!|¿Me compra una pulsera?)) Son de jade. Dos por veinte quetzales.'],
    task: 'A girl is selling bracelets. Buy some or say no thank you, politely.',
    branches: [ { re: 'no gracias|no,? gracias|ahorita no|no quiero', say: ['Va pues. ¿Sabía que para los mayas el jade valía más que el oro?'] },
                { re: 'si|dos|una|me (da|llevo)|quiero|compro|cuanto', say: ['¡Gracias! ¿Sabía que para los mayas el jade valía más que el oro?'] } ],
    gem: 'jade' }
];

/* ---------- GEMS: "Datos de Antigua" (6 are hidden per run) ---------- */
/* where: 'map' (hub map, at a landmark or x/y %) or a scene id. es is spoken; en is shown. */
const GEMS = [
  { id: 'volcan', title: 'Volcán de Agua', where: 'map', x: 50, y: 93, es: 'Los mayas kaqchikeles llamaban a este volcán Hunahpú. Mide casi cuatro mil metros, y desde cualquier calle de Antigua se ve al fondo.', en: 'The Kaqchikel Maya called the Volcán de Agua “Hunahpú”. It is almost 4,000 m high and you can see it from nearly every street in Antigua.' },
  { id: 'fuego', title: 'Volcán de Fuego', where: 'map', x: 9, y: 90, es: 'El Volcán de Fuego es uno de los más activos del mundo. De noche, a veces se ve la lava roja desde Antigua.', en: 'Volcán de Fuego is one of the most active volcanoes in the world. On some nights you can see red lava from Antigua.' },
  { id: 'arco', title: 'El Arco', where: 'map', lm: 'arco', es: 'El Arco de Santa Catalina se construyó en el siglo diecisiete para que las monjas pudieran cruzar la calle sin que nadie las viera.', en: 'The Arco de Santa Catalina (17th century) let the nuns of the convent cross the street without being seen.' },
  { id: 'tanque', title: 'Tanque de la Unión', where: 'map', lm: 'tanque', es: 'En el Tanque de la Unión, todavía hoy, algunas personas lavan la ropa en las pilas públicas.', en: 'At Tanque La Unión, some people still wash clothes in the public stone basins (pilas) today.' },
  { id: 'terremoto', title: 'Los terremotos', where: 'map', lm: 'capuchinas', es: 'En 1773 los terremotos de Santa Marta destruyeron la ciudad. Por eso la capital se trasladó a la ciudad de Guatemala, y por eso esta se llama «la Antigua».', en: 'The Santa Marta earthquakes of 1773 wrecked the city; the capital moved to Guatemala City, and this one became “la Antigua” (the old one).' },
  { id: 'cacao', title: 'El cacao', where: 'cafe', x: 82, y: 58, es: 'Los mayas usaban las semillas de cacao como dinero. ¡Con unas cuantas semillas se podía comprar un tomate!', en: 'The Maya used cacao beans as money: a few beans could buy you a tomato.' },
  { id: 'chapin', title: 'Palabras chapinas', where: 'tuktuk', x: 14, y: 40, es: 'Los guatemaltecos se llaman chapines. Un niño es un patojo, el dinero es el pisto, y un perro es un chucho.', en: 'Guatemalans call themselves chapines. A kid is a patojo, money is pisto, a dog is a chucho.' },
  { id: 'pepian', title: 'El pepián', where: 'comedor', x: 86, y: 30, es: 'El pepián es uno de los platos más antiguos de Guatemala: mezcla ingredientes mayas, como el chile y las semillas, con ingredientes españoles.', en: 'Pepián is one of Guatemala’s oldest dishes, mixing Maya ingredients (chiles, toasted seeds) with Spanish ones.' },
  { id: 'huipil', title: 'El huipil', where: 'mercado', x: 80, y: 26, es: 'Cada pueblo tiene su propio diseño de huipil. Con solo mirar la blusa, se puede saber de dónde es una mujer.', en: 'Each town has its own huipil design; the blouse tells you which town a woman is from.' },
  { id: 'camioneta', title: 'Las camionetas', where: 'camioneta', x: 12, y: 30, es: 'Las camionetas eran buses escolares de Estados Unidos. Aquí los pintan de colores y les ponen nombres.', en: 'Chicken buses are old US school buses, repainted in bright colours and given names.' },
  { id: 'proatur', title: 'PROATUR', where: 'direcciones', x: 86, y: 34, es: 'En Antigua hay una policía especial para turistas. Si quieres subir al Cerro de la Cruz, te pueden acompañar.', en: 'Antigua has tourist police (PROATUR); they will even walk you up to the Cerro de la Cruz lookout.' },
  // These four are revealed by side encounters (not placed on their own)
  { id: 'sirenas', title: 'La Fuente de las Sirenas', where: 'side', es: 'La fuente del Parque Central tiene sirenas desde hace más de doscientos años.', en: 'The fountain in the Parque Central, with its mermaids, has stood for over 200 years.' },
  { id: 'rellenitos', title: 'Los rellenitos', where: 'side', es: 'Los rellenitos son de plátano, rellenos de frijol negro dulce con chocolate.', en: 'Rellenitos are plantain dumplings filled with sweetened black beans and chocolate.' },
  { id: 'marimba', title: 'La marimba', where: 'side', es: 'La marimba es el instrumento nacional de Guatemala.', en: 'The marimba is Guatemala’s national instrument.' },
  { id: 'barriletes', title: 'Barriletes gigantes', where: 'side', es: 'El primero de noviembre, en Sumpango, vuelan barriletes gigantes para comunicarse con los difuntos.', en: 'On 1 November, people in Sumpango fly giant kites as a message to the dead.' },
  { id: 'hermanopedro', title: 'El Hermano Pedro', where: 'side', es: 'El Hermano Pedro cuidaba a los enfermos y a los pobres. Fue el primer santo de Centroamérica.', en: 'Hermano Pedro cared for the sick and poor; he became the first saint of Central America.' },
  { id: 'jade', title: 'El jade', where: 'side', es: 'Para los mayas, el jade valía más que el oro.', en: 'For the Maya, jade was worth more than gold.' }
];

/* ---------- LUCÍA: intro, voice notes and goodbye ---------- */
const LUCIA = {
  intro: ['¡Hola! ¡Bienvenido a Antigua Guatemala! Yo llego más tarde.', 'Esta noche, a las ocho y media, Don Chepe va a contar leyendas en el Arco de Santa Catalina. ¡Es el mejor cuentacuentos de la ciudad!', 'Mientras tanto, conoce la ciudad. Y pon atención: aquí todo el mundo tiene una leyenda que contar.'],
  // short voice notes before each scenario without a `brief`
  notes: {
    comedor: ['¿Ya tienes hambre? Hay un comedor muy bueno cerca de donde estás. Pide algo típico, ¡no te vas a arrepentir!'],
    direcciones: ['Oye, la policía de turismo está en el Parque Central. Si necesitas algo, pregúntales a ellos.'],
    cartera: ['¿Ya regresaste a la posada? Descansa un ratito antes de la noche de leyendas.'],
    cafe: ['Antes de vernos, tómate un chocolate en el café. ¡El de aquí es el mejor del mundo!']
  },
  finale: ['¡Ya es hora! Te espero en el Arco. ¡Corre, que Don Chepe ya va a empezar!'],
  goodbye: ['¡Qué noche! Ahora ya conoces Antigua… y sus fantasmas.', 'Mi próxima parada es {nextCity}. ¡Allá te espero!']
};

/* ---------- FINALE: Don Chepe at the Arco ---------- */
const FINALE = {
  title: 'Noche de leyendas', place: 'arco',
  welcome: ['¡Buenas noches, buenas noches! Acérquense, que la noche está fresca y las historias calientes.', 'Me llamo José, pero todos me dicen Don Chepe. Esta noche les voy a contar una leyenda que me contó mi abuelo.'],
  orderTask: 'Put the events of the story in order. Listen to each card (▶), then click them in the order they happened.',
  writeTask: 'How do you think the story ended? Write the ending in your own words: at least three sentences in the past (preterite for events, imperfect for descriptions).',
  writeMin: { past: 4, pret: 2 },
  reactHit: ['¡Púchica! ¡Así mero fue! Usted ya sabía, ¿verdad? Escuche cómo me lo contó mi abuelo.', '¡Casi casi como la cuenta mi abuelo! Escuche.'],
  reactMiss: ['¡Qué buen final! Pero en la versión de mi abuelo pasó otra cosa. Escuche.', 'Ah, ¡usted tiene imaginación! Pero mi abuelo la contaba diferente.'],
  closing: ['Y así termina la historia. Dicen que si uno camina solo esta noche por la Calle del Arco… mejor no se los digo. ¡Buenas noches!']
};
