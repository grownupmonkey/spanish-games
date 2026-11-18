/* =====================================================================
   CUANDO ERA PEQUEÑO · DATA  (Spanish 30-3Y · game 2 · Montevideo, Uruguay)
   Everything a content editor might want to change lives in this block.
   The game engine (bottom of the file) reads these objects and never
   hard-codes Spanish content.

   QUICK GUIDE FOR EDITORS
   • Spoken lines ("LineSpecs") are strings or arrays of strings.
       "Hola."                       → always this line
       ["Hola.", "Buenas."]           → one of these, chosen at random
       "((Buenas tardes|Buenas)), gurí." → inline variants, chosen at random
   • {name} inserts a variable, {dest.name} a field, {menu|list} a list
     ("un chivito, un alfajor y unas medialunas"). Variables come from each scenario's `vars`.
   • Regular expressions ("re") are matched against what the student types,
     after it is lower-cased and stripped of accents and punctuation.
     So write them WITHOUT accents: "rodo", not "Rodó"; "ano" matches "año".
   • VarSpecs (in `vars` and `set`):
       25                          a fixed value
       { oneOf: [25, 30, 35] }     one of these
       { range: [40, 60], step: 5} a number in the range
       { from: "DRINKS" }          one item from a LISTS entry
       { from: "MERIENDA", count: 3} several different items
       { from: "DRINKS", exclude: "drink" }  any item except var `drink`
       { pick: "menu" }            one item from an array variable
       { calc: "price - 10" }      arithmetic with other number variables
   • Step types: say · talk · haggle · num · pick · audiopick · memory · hop · hide · write.
   • Money is written as plain numbers; the engine adds the sign from GAME.currency.
   ===================================================================== */

/* ---------- GAME: identity, voice and look ---------- */
const GAME = {
  id: 'cuando-era-pequeno',
  title: 'Cuando era pequeño',
  course: 'Español 30-3Y',
  city: 'Montevideo',
  nextCity: 'Valencia',                          // Lucía names this at the very end
  currency: { sign: '$', name: 'pesos' },          // shown in feedback (Q for Guatemala, $ for Uruguay)
  // Speech: the first Spanish voice that matches wins (Uruguay → Río de la Plata → any Latin American → any Spanish)
  voicePrefs: ['es-UY', 'es-AR', 'es-419', 'es-US', 'es-CL', 'es-MX', 'es-CO', 'es-ES'],
  // Story clock: one entry per stage (arrival, three scenes, finale)
  clock: ['16:40', '17:25', '18:10', '18:55', '19:40'],
  scenesPerRun: 3,      // city scenarios after the bus ride (drawn from SCENARIOS)
  sidesPerRun: 2,       // optional side encounters shown on the map
  gemsPerRun: 6         // hidden "Datos de Montevideo" placed per run
};

/* ---------- LANDMARKS (schematic map grid: col 1 = west … 7 = east, row 1 = north … 6 = south/coast) ---------- */
/* The map is a simplified sketch, not a street plan. Positions are approximate (Ciudad Vieja at the west, the Rambla along the south coast). */
const LANDMARKS = {
  independencia: { name: 'la Plaza Independencia',  col: 2, row: 2, glyph: 'statue',  color: '#EADBC4' },
  salvo:         { name: 'el Palacio Salvo',        col: 3, row: 2, glyph: 'tower',   color: '#F2C14E' },
  solis:         { name: 'el Teatro Solís',         col: 1, row: 3, glyph: 'theater', color: '#E8C3A0' },
  mercado:       { name: 'el Mercado del Puerto',   col: 1, row: 4, glyph: 'stall',   color: '#FF9A6B' },
  barriosur:     { name: 'Barrio Sur',              col: 3, row: 4, glyph: 'drum',    color: '#F28FAD' },
  rodo:          { name: 'el Parque Rodó',          col: 5, row: 4, glyph: 'ferris',  color: '#5FE0C8' },
  centenario:    { name: 'el Estadio Centenario',   col: 6, row: 1, glyph: 'stadium', color: '#7FB8E0' },
  pocitos:       { name: 'Pocitos',                 col: 7, row: 4, glyph: 'wave',    color: '#7FD0E8' },
  casa:          { name: 'la casa de los abuelos',  col: 4, row: 5, glyph: 'door',    color: '#FFC27A' }
};
const STREETS = {   // the few real names drawn on the map
  avenue: 'Av. 18 de Julio',        // a thick street along row 2
  rambla: 'La Rambla'               // the coast road along the last row
};

/* ---------- LISTS: pools that scenarios draw from ---------- */
const LISTS = {
  DESTINOS: [
    { name: 'el Parque Rodó', to: 'al Parque Rodó', re: 'rodo|parque' },
    { name: 'Pocitos', to: 'a Pocitos', re: 'pocitos' },
    { name: 'la Ciudad Vieja', to: 'a la Ciudad Vieja', re: 'ciudad vieja|vieja' },
    { name: 'el Palacio Salvo', to: 'al Palacio Salvo', re: 'salvo|palacio' },
    { name: 'el Mercado del Puerto', to: 'al Mercado del Puerto', re: 'mercado|puerto' },
    { name: 'Barrio Sur', to: 'a Barrio Sur', re: 'barrio sur|sur' }
  ],
  MERIENDA: [
    { name: 'un chivito', the: 'el chivito', re: 'chivito', price: 420 },
    { name: 'unas medialunas', the: 'las medialunas', re: 'medialuna', price: 130 },
    { name: 'un alfajor', the: 'el alfajor', re: 'alfajor', price: 95 },
    { name: 'una torta frita', the: 'la torta frita', re: 'torta', price: 60 },
    { name: 'unos churros', the: 'los churros', re: 'churro', price: 140 },
    { name: 'un pancho', the: 'el pancho', re: 'pancho', price: 150 }
  ],
  DRINKS: [
    { name: 'un café con leche', the: 'el café con leche', re: 'cafe', price: 120 },
    { name: 'una chocolatada', the: 'la chocolatada', re: 'chocolat', price: 110 },
    { name: 'un jugo de naranja', the: 'el jugo de naranja', re: 'jugo|naranja', price: 130 },
    { name: 'un mate cocido', the: 'el mate cocido', re: 'mate', price: 90 },
    { name: 'un licuado de banana', the: 'el licuado de banana', re: 'licuado|banana', price: 150 }
  ],
  WANTS: [   // the figurita Lucía's cousin needs
    { name: 'la de Francescoli', re: 'francescoli' },
    { name: 'la de Suárez', re: 'suarez' },
    { name: 'la de Forlán', re: 'forlan' }
  ],
  YEARS: [30, 35, 40, 45, 50],
  CLASS_SIZES: [28, 30, 32, 35],
  BLOCKS: [5, 6, 8, 10]
};

/* ---------- HOP: rayuela instructions (numbers are spoken in words) ---------- */
const HOP = {
  words: ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'],
  forward: ['Primero salta al {a}. Luego al {b}, después al {c} y, por último, al {d}.', 'Mira bien: empieza en el {a}, sigue al {b}, después al {c} y termina en el {d}.'],
  skip: ['Empieza en el {a}. Salta el {b}, ¡no lo pises! Sigue al {c} y termina en el {d}.', 'Primero el {a}. Después, sin pisar el {b}, el {c}. Y para terminar, el {d}.'],
  back: ['Ahora al revés: empieza en el {a}, baja al {b} y termina en el {c}.', 'Y ahora de vuelta: del {a} al {b} y, por último, al {c}.'],
  ok: ['¡Eso! Sin pisar ni una raya.', '¡Muy bien! Saltas como una gurisa.', '¡Cabal! Así se juega.'],
  oops: ['Uy, ¡pisó la raya! Escuche de nuevo.', 'No, no. Ese no era. A ver otra vez, con calma.']
};

/* ---------- HIDE: escondidas clues. {ref.del} = "del árbol", {ref.the} = "el árbol" ---------- */
const HIDE = {
  objects: [
    { id: 'arbol', the: 'el árbol', del: 'del árbol' },
    { id: 'banco', the: 'el banco', del: 'del banco' },
    { id: 'quiosco', the: 'el quiosco', del: 'del quiosco' },
    { id: 'fuente', the: 'la fuente', del: 'de la fuente' },
    { id: 'tobogan', the: 'el tobogán', del: 'del tobogán' },
    { id: 'columpio', the: 'el columpio', del: 'del columpio' },
    { id: 'estatua', the: 'la estatua', del: 'de la estatua' },
    { id: 'arbusto', the: 'el arbusto', del: 'del arbusto' }
  ],
  kids: ['Tomás', 'Valentina', 'Mateo', 'Sofía', 'Bautista'],
  behind: ['Está escondido detrás {ref.del}.', 'Se escondió detrás {ref.del}. ¡Ese pillo!'],
  right: ['Está a la derecha {ref.del}.', 'Fíjese: está justo a la derecha {ref.del}.'],
  left: ['Está a la izquierda {ref.del}.', 'Mire bien: está justo a la izquierda {ref.del}.'],
  between: ['Está entre {a.the} y {b.the}.', 'Se escondió en el medio: entre {a.the} y {b.the}.'],
  found: ['¡Ahí está! ¡Te encontré, pillo!', '¡Cabal! Ahí estaba el botija.'],
  retry: ['No, ahí no. Escuche otra vez.', 'Casi. Escuche con atención.']
};

/* ---------- CAST: people who can appear (looks feed the portrait drawer) ---------- */
/* look: skin, hair, style (short|long|bun|braid|bald|curly), outfit (huipil|shirt|uniform|apron|jacket),
   color, accent, hat (sombrero|cap|null), age (young|adult|old), beard, mustache, glasses.  pitch/rate tune the voice. */
const CAST = {
  lucia: { name: 'Lucía', guide: true, pitch: 1.12, rate: 1 },
  DRIVERS: [
    { name: 'Gustavo, el chofer', look: { skin: '#C99A7A', hair: '#3A2A26', style: 'short', outfit: 'uniform', color: '#2F5D8A', hat: 'cap', age: 'adult', mustache: true }, pitch: 0.88 },
    { name: 'Marcela, la chofer', look: { skin: '#D2A584', hair: '#2A1F1A', style: 'bun', outfit: 'uniform', color: '#2F5D8A', hat: null, age: 'adult' }, pitch: 1.1 }
  ],
  ABUELAS: [
    { name: 'Doña Nelly', look: { skin: '#D4A98A', hair: '#D7D0E3', style: 'bun', outfit: 'shirt', color: '#B83B5E', accent: '#F2C14E', age: 'old', glasses: true }, pitch: 1.0 },
    { name: 'Doña Olga', look: { skin: '#C99A7A', hair: '#CFC8DD', style: 'bun', outfit: 'jacket', color: '#3FA36B', accent: '#F4F0E6', age: 'old' }, pitch: 1.05 }
  ],
  ABUELOS: [
    { name: 'Don Washington', look: { skin: '#C99A7A', hair: '#E6E1EE', style: 'bald', outfit: 'jacket', color: '#5B4A7A', hat: 'cap', age: 'old', mustache: true }, pitch: 0.78 },
    { name: 'Don Aníbal', look: { skin: '#B98263', hair: '#D7D0E3', style: 'short', outfit: 'shirt', color: '#3E7BD8', age: 'old', glasses: true }, pitch: 0.82 }
  ],
  KIOSQUEROS: [
    { name: 'Don Walter', look: { skin: '#C99A7A', hair: '#8F8A9E', style: 'short', outfit: 'apron', color: '#E07A2F', accent: '#F4F0E6', hat: 'cap', age: 'old', mustache: true }, pitch: 0.84 },
    { name: 'Doña Silvia', look: { skin: '#D2A584', hair: '#8F8A9E', style: 'long', outfit: 'apron', color: '#8A4FC7', accent: '#F4F0E6', age: 'adult' }, pitch: 1.08 }
  ],
  CONFITERAS: [
    { name: 'Doña Carmen', look: { skin: '#D4A98A', hair: '#CFC8DD', style: 'bun', outfit: 'apron', color: '#C9506A', accent: '#F4F0E6', age: 'old', glasses: true }, pitch: 1.02 },
    { name: 'Don Ernesto', look: { skin: '#C99A7A', hair: '#8F8A9E', style: 'bald', outfit: 'apron', color: '#2F5D4A', accent: '#F4F0E6', age: 'old', mustache: true }, pitch: 0.8 }
  ],
  TAMBOREROS: [
    { name: 'Don Rubén', look: { skin: '#8E5A44', hair: '#D7D0E3', style: 'short', outfit: 'shirt', color: '#D8433E', age: 'old', hat: 'cap', mustache: true }, pitch: 0.76 },
    { name: 'Doña Ofelia', look: { skin: '#8E5A44', hair: '#D7D0E3', style: 'bun', outfit: 'shirt', color: '#F2C14E', accent: '#D8433E', age: 'old' }, pitch: 1.0 }
  ],
  MAESTRAS: [
    { name: 'Maestra Teresa', look: { skin: '#D4A98A', hair: '#CFC8DD', style: 'bun', outfit: 'jacket', color: '#3E7BD8', accent: '#F4F0E6', age: 'old', glasses: true }, pitch: 1.02 },
    { name: 'Maestro Julio', look: { skin: '#C99A7A', hair: '#D7D0E3', style: 'short', outfit: 'jacket', color: '#5B4A7A', age: 'old', glasses: true, mustache: true }, pitch: 0.84 }
  ],
  HOSTS: {   // finale hosts, one per PROFILES entry
    washington: { name: 'Don Washington', look: { skin: '#C99A7A', hair: '#E6E1EE', style: 'bald', outfit: 'jacket', color: '#5B4A7A', hat: 'cap', age: 'old', mustache: true }, pitch: 0.78, rate: 0.95 },
    nelly:      { name: 'Doña Nelly', look: { skin: '#D4A98A', hair: '#D7D0E3', style: 'bun', outfit: 'shirt', color: '#B83B5E', accent: '#F2C14E', age: 'old', glasses: true }, pitch: 1.0, rate: 0.95 },
    hugo:       { name: 'Don Hugo', look: { skin: '#C99A7A', hair: '#CFC8DD', style: 'short', outfit: 'shirt', color: '#3E7BD8', age: 'old', beard: true }, pitch: 0.8, rate: 0.95 }
  }
};

/* ---------- MEMORIES: short recuerdos told by locals, each followed by one listening question ---------- */
/* fragment: the spoken memory (imperfect: habits and descriptions).  q.options[0] is the correct answer. */
const MEMORIES = [
  { id: 'mate', title: 'El mate del abuelo', en: 'Grandfather’s mate', icon: 'cup',
    fragment: 'En mi casa, mi abuelo tomaba mate todas las tardes en el patio, con el termo bajo el brazo. Siempre me dejaba cebar el primero, pero me decía: «Despacito, gurí, que el agua quema». Yo me sentía muy grande.',
    q: { ask: 'What did the grandfather let the child do first?', options: ['Prepare the first mate', 'Drink the whole thermos', 'Go and buy the yerba'] } },
  { id: 'rambla', title: 'Domingos en la Rambla', en: 'Sundays on the Rambla', icon: 'wave',
    fragment: 'Los domingos mi familia caminaba por la Rambla hasta que se hacía de noche. Mi papá llevaba el termo, mi mamá llevaba las tortas fritas y mis hermanos corrían por las piedras. A veces pescábamos, pero nunca pescábamos nada.',
    q: { ask: 'What did the father carry on the walks?', options: ['The thermos', 'The fishing rods', 'The football'] } },
  { id: 'cometa', title: 'Las cometas de agosto', en: 'August kites', icon: 'kite',
    fragment: 'En agosto, cuando soplaba mucho viento, hacíamos cometas con papel de diario y cañas. Las armábamos en el patio y las volábamos en la plaza. Una vez, mi cometa voló tan alto que se perdió entre las nubes.',
    q: { ask: 'What did the children make their kites from?', options: ['Newspaper and canes', 'Silk and wire', 'Plastic bags'] } },
  { id: 'radio', title: 'El partido por la radio', en: 'The match on the radio', icon: 'radio',
    fragment: 'Mi padre escuchaba los partidos de fútbol por la radio, y gritaba tanto que los vecinos se asomaban a la ventana. Nosotros no teníamos televisión, así que imaginábamos los goles. Cuando ganaba su equipo, mi madre hacía una torta.',
    q: { ask: 'Why did the neighbours look out of their windows?', options: ['Because the father shouted at the radio', 'Because of a fire', 'Because of a street party'] } },
  { id: 'murga', title: 'Las murgas del barrio', en: 'The neighbourhood murgas', icon: 'mask',
    fragment: 'En febrero íbamos al tablado del barrio a ver las murgas. Los murguistas cantaban canciones divertidas sobre la política y la vida del barrio, y todo el mundo se reía. Nosotros, los niños, nos quedábamos dormidos en las sillas.',
    q: { ask: 'What did the murgas sing about?', options: ['Funny songs about politics and the neighbourhood', 'Only love songs', 'Football results'] } },
  { id: 'lluvia', title: 'Tardes de lluvia', en: 'Rainy afternoons', icon: 'rain',
    fragment: 'Cuando llovía, mi mamá hacía tortas fritas y nos quedábamos adentro jugando a las cartas. Afuera sonaba la lluvia en el techo de chapa, y adentro olía a azúcar y a grasa caliente. Eran las mejores tardes del año.',
    q: { ask: 'What did the mother make on rainy days?', options: ['Tortas fritas', 'Empanadas', 'Soup'] } }
];

/* ---------- PHRASES the engine uses in many places ---------- */
const PHRASES = {
  notUnderstood: ['¿Perdón? No le entendí bien.', '¿Cómo dice? ¿Me lo repite, por favor?', 'Disculpe, no le entendí.'],
  english: ['Ay, fíjese que yo no hablo inglés… ¿Me lo dice en español?', 'Perdón, inglés no hablo. ¿En español, por favor?'],
  numWrong: 'Not quite. Listen again: press ⟲ Repetir.',
  storyStop: ['Y así era un día en mi niñez. Ahora, antes de seguir, quiero ver si me prestaron atención.'],
  howEnded: ['Ahora cuéntenme ustedes: ¿cómo era su niñez?']
};

/* ---------- SCENARIOS ---------- */
/* Each scenario: id, title (shown on the map), place (landmark key or 'random'), cast (CAST pool),
   scene (backdrop: props + optional landmark), prefers (memory ids that fit this place),
   vars (VarSpecs), steps (run in order; `goto` jumps to a step id).
   The engine supplies the finale (story · order · why · write about your childhood) from PROFILES. */
const ARRIVAL = {
  id: 'omnibus', title: 'El ómnibus', en: 'Get on the bus', place: 'independencia', cast: 'DRIVERS', prefers: ['mate', 'rambla', 'radio'],
  scene: { props: 'bus', landmark: 'salvo' },
  vars: { dest: { from: 'DESTINOS' }, fare: { oneOf: [48, 52, 56] } },
  card: { eyebrow: 'Mensaje de Lucía', title: 'Voy a {dest.name}', sub: 'Montevideo · ómnibus' },
  steps: [
    { type: 'say', lines: ['((¡Buenas tardes!|¡Buenas!)) Suba, suba, que no tengo todo el día. ((¿Para dónde va?|¿Adónde va?))'] },
    { type: 'talk', id: 'dest', card: 'ticket',
      task: 'Tell the driver where you are going (it’s on your card from Lucía) and ask how much the ticket (boleto) costs.',
      parts: [
        { re: '{dest.re}', ask: ['¿Y para dónde va? Mire que hay varias líneas.', '¿A qué parada va? Dígame el nombre.'] },
        { re: 'cuanto|precio|cobra|cuesta|vale|boleto|pasaje|sale', ask: ['Va, {dest.to}. ((¿Y no me pregunta cuánto es el boleto?|Pregúnteme el precio, pues.))'] }
      ],
      done: ['{dest.to|cap}, ta. El boleto sale {fare} pesos.'],
      hint: 'Say where you are going and ask the price: “Voy a …, por favor. ¿Cuánto cuesta el boleto?”',
      options: [
        { say: 'Buenas tardes. Voy {dest.to}. ¿Cuánto cuesta el boleto?', ok: true },
        { say: 'Buenas tardes. ¿Usted vive {dest.to}?', reply: ['¿Yo? No, yo vivo en el Cerro. ¿Usted para dónde va?'] },
        { say: 'Quiero comprar este ómnibus, por favor.', reply: ['¡Ja! No se vende. ¿Va a subir o no?'] }
      ] },
    { type: 'num', task: 'How much does the ticket cost? (in pesos)', answer: '{fare}' },
    { type: 'talk', id: 'hace',
      task: 'The driver wants to chat. Tell him how long you have been in Montevideo. Use hace + time (hace dos días…).',
      npc: ['((Y dígame, ¿hace cuánto que está en Montevideo?|Y usted, ¿hace cuánto tiempo que llegó a Montevideo?))'],
      parts: [
        { re: 'hace (un|una|unos|unas|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|quince|veinte|\\d+|poco|poquito|mucho)( [a-z]+)? ?(hora|horas|dia|dias|semana|semanas|mes|meses|ano|anos|rato|tiempo)', ask: ['¿Hace cuánto? ¿Un día? ¿Una semana? Dígame con «hace».'] }
      ],
      done: ['¡Ah, hace poco, entonces! Qué bueno que vino a conocernos. Mire, mientras manejo, le cuento algo.'],
      else: ['¿Cómo dice? Yo le pregunto: ¿hace cuánto que está aquí?'],
      hint: 'Use hace + a period of time: “Hace dos días que estoy aquí.” / “Llegué hace una semana.”',
      options: [
        { say: 'Hace dos días que estoy en Montevideo.', ok: true },
        { say: 'Hace cinco horas que estoy aquí. Llegué esta mañana.', ok: true },
        { say: 'Me gusta mucho el ómnibus.', reply: ['¡Gracias! Pero yo le pregunté otra cosa: ¿hace cuánto que está aquí?'] }
      ] },
    { type: 'memory', intro: ['((Mientras manejo…|Para el viaje…)) ¿quiere que le cuente algo de cuando yo era chico?'] },
    { type: 'say', lines: ['((Aquí está su parada.|Llegamos, joven.)) ((¡Que le vaya bien!|¡Que disfrute Montevideo!)) Y baje por atrás, ¿eh?'] }
  ]
};

const SCENARIOS = [
  /* ---- GAMES: rayuela (hopscotch) ---- */
  {
    id: 'rayuela', title: 'La rayuela', en: 'Hopscotch on the sidewalk', place: 'random', cast: 'ABUELAS', prefers: ['lluvia', 'cometa'],
    scene: { props: 'plaza', landmark: null },
    vars: {},
    steps: [
      { type: 'say', lines: ['((¡Buenas tardes, mi vida!|¡Hola, gurí!)) ¿Le gusta mi rayuela? La dibujé con tiza.', 'Cuando yo era niña, jugábamos a la rayuela todos los días, después de la escuela. Dibujábamos diez cuadros en la vereda y tirábamos una piedrita. Teníamos que saltar con un pie, sin pisar las rayas. Siempre ganaba mi hermana, porque era muy rápida.'] },
      { type: 'pick', task: 'What did the children use to draw the squares?', options: ['Chalk', 'Paint', 'Charcoal'] },
      { type: 'hop', task: 'Now it’s your turn! Listen to the instructions and tap the squares in the order she says.', rounds: 2 },
      { type: 'write', id: 'games', person: 'any', min: { imperfect: 2 },
        npc: ['((Y usted, ¿a qué jugaba cuando era niño?|Cuénteme, ¿y usted? ¿A qué jugaba cuando era pequeño?)) ¿Con quién jugaba?'],
        task: 'Tell her what games you used to play when you were little, and with whom. Use the imperfect: jugaba, saltaba, corría… (at least two verbs).',
        done: ['((¡Qué lindo!|¡Ay, qué bueno!)) Los juegos de antes eran distintos, pero la risa era la misma.'],
        hint: 'Imperfect for habits: “Cuando era pequeño, jugaba al fútbol con mis primos y saltaba la cuerda.”',
        model: 'Cuando era pequeña, jugaba al fútbol con mis primos. También saltaba la cuerda y corría por el patio.' },
      { type: 'memory', intro: ['((Ya que habla de juegos…|Mientras descanso…)) le cuento algo que me acuerdo siempre.'] },
      { type: 'say', lines: ['((¡Que le vaya bonito!|Vuelva cuando quiera, mi vida.)) La rayuela siempre va a estar aquí.'] }
    ]
  },

  /* ---- GAMES: escondidas (hide and seek) ---- */
  {
    id: 'escondidas', title: 'Las escondidas', en: 'Hide and seek in the park', place: 'rodo', cast: 'ABUELOS', prefers: ['radio', 'rambla'],
    scene: { props: 'park', landmark: null },
    vars: { kid: { oneOf: HIDE.kids } },
    steps: [
      { type: 'say', lines: ['((¡Buenas tardes!|Buenas, buenas.)) Mire esos botijas… Me hacen acordar a cuando yo era chico.', 'En mi barrio jugábamos a las escondidas todos los veranos. Uno contaba hasta veinte con los ojos cerrados, y los demás nos escondíamos. Yo siempre me escondía detrás del tanque de agua, y mi mejor amigo, Beto, nunca me encontraba.'] },
      { type: 'pick', task: 'Where did he always hide?', options: ['Behind the water tank', 'Under a bridge', 'Inside a church'] },
      { type: 'say', lines: ['Ahora mi nieto {kid} se escondió. ¡Ese pillo! Yo conté hasta veinte… y no lo veo. ((Ayúdeme a encontrarlo.|¿Me ayuda a buscarlo?)) Escuche bien.'] },
      { type: 'hide', task: 'Listen to the clue and click the place where the child is hiding.' },
      { type: 'talk', id: 'ask',
        task: 'Ask him a question about his childhood games: where did he hide? who did he play with? what did he play? (¿Dónde te escondías?, ¿Con quién jugabas?…)',
        parts: [ { re: 'donde|con quien|a que|jugaba|jugabas|jugaban|escondia|escondias|escondian|hacia|hacias|solia|solias|cuando (eras|era)', ask: ['((¿Quiere saber algo de mis juegos?|Pregúnteme lo que quiera sobre cuando yo era chico.))'] } ],
        done: ['((¡Buena pregunta!|¡Ja, qué buena pregunta!)) Jugábamos en la calle hasta que oscurecía. Nadie nos llamaba a comer hasta que pasaba el heladero.'],
        else: ['¿Quiere saber algo de mi niñez? Pregunte, pregunte.'],
        hint: 'Ask in the past: “¿Dónde se escondía usted cuando era niño?” or “¿A qué jugaba?”',
        options: [
          { say: '¿Con quién jugaba usted cuando era niño?', ok: true },
          { say: '¿A qué jugaba usted en la calle?', ok: true },
          { say: '¿Cuántos años tiene su nieto?', reply: ['Siete. Pero yo hablo de mi niñez. ¿Quiere saber algo de eso?'] }
        ] },
      { type: 'memory', intro: ['((Ya que me preguntó…|Y le cuento otra…)) ¿sabe qué me acuerdo?'] },
      { type: 'say', lines: ['((¡Hasta luego!|Que lo pase lindo.)) ¡Ay, mi nieto, que ya se fue a esconder de nuevo!'] }
    ]
  },

  /* ---- GAMES: figuritas (sticker swaps) ---- */
  {
    id: 'figuritas', title: 'Las figuritas', en: 'Swapping stickers at the kiosk', place: 'random', cast: 'KIOSQUEROS', prefers: ['radio', 'cometa'],
    scene: { props: 'kiosco', landmark: null },
    vars: { want: { from: 'WANTS' }, other: { from: 'WANTS', exclude: 'want' }, start: { oneOf: [8, 9, 10] }, target: { oneOf: [4, 5] }, floor: 3 },
    brief: ['Oye, ¿me haces un favor? Mi primo está haciendo el álbum del Mundial y le falta {want.name}. Busca un kiosco y cambia repetidas por esa figurita. ¡Pero que no te cobren más de {target} repetidas! ¡Gracias!'],
    steps: [
      { type: 'say', lines: ['((¡Buenas tardes!|Buenas, buenas.)) Mire estas figuritas… Cuando yo era botija, coleccionaba figuritas todo el año.', 'Íbamos al kiosco y comprábamos un sobre con cinco. Después nos juntábamos en el patio de la escuela y cambiábamos las repetidas. Yo siempre buscaba la de Francescoli, pero nunca la conseguía.'] },
      { type: 'pick', task: 'What did the children do in the schoolyard?', options: ['Swap their duplicate stickers', 'Sell the stickers for money', 'Play football with them'] },
      { type: 'talk', id: 'ask',
        task: 'Ask for the sticker Lucía’s cousin needs (see her voice message in the Libreta): which player?',
        parts: [ { re: '{want.re}', reject: [{ re: '{other.re}', say: ['Esa tengo pila, pero me parece que usted busca otra. ¿Cuál era?'] }], ask: ['((¿Y cuál figurita busca?|¿Cuál le falta?)) Tengo de todos los jugadores.'] } ],
        done: ['¡Uy! ¿{want.name|cap}? ((Esa es la difícil.|Esa casi nadie la tiene.)) Se la cambio por {start} repetidas.'],
        hint: 'Name the player from Lucía’s message: “Busco la figurita de …”',
        options: [
          { say: 'Busco {want.name}, por favor.', ok: true },
          { say: 'Busco {other.name}, por favor.', reply: ['Esa tengo pila. Pero yo creo que usted busca otra. ¿Cuál era?'] },
          { say: '¿Cuánto cuesta un sobre?', reply: ['Cuarenta pesos. Pero dígame qué figurita busca.'] }
        ] },
      { type: 'haggle', task: 'He wants {start} duplicates for it. Lucía said not more than {target}. Bargain!', unit: 'figuritas',
        start: '{start}', target: '{target}', floor: '{floor}', paidVar: 'paidFig',
        counter: ['((¡Ni loco!|¡Uy, no!)) Con tan pocas no. Se la dejo en {counter}, ta.', 'Mire, es la difícil… Por {counter} se la doy.'],
        accept: ['((Ta, trato hecho.|Dale, trato hecho.)) {offer} repetidas por {want.name}.'],
        acceptFull: ['Ta. {offer} repetidas, entonces.'],
        hint: 'Offer fewer: “¿Se la cambio por … repetidas?”, “Solo tengo … repetidas.”',
        options: [
          { say: '¿Se la cambio por {target} repetidas?', ok: true },
          { say: 'Bueno, le doy {start} repetidas.', ok: true, full: true },
          { say: '¿Tiene el álbum completo?', reply: ['¡Ja! Nunca lo completé. Pero dígame, ¿cuántas repetidas me ofrece?'] }
        ] },
      { type: 'talk', id: 'collect',
        task: 'He asks what YOU collected as a kid. Answer him (cartas, muñecas, autitos, piedras…).',
        npc: ['((Y usted, ¿qué coleccionaba cuando era chico?|Y a usted, ¿qué le gustaba juntar de niño?))'],
        parts: [ { re: 'colecciona|juntaba|guardaba|tenia|cartas|munec|autito|piedra|estampilla|moneda|figurita|tarjeta|pokemon|nada|coches|juguete|libro', ask: ['¿Qué juntaba? ¿Cartas, piedras, autitos?'] } ],
        done: ['((¡Qué bien!|¡Mire qué lindo!)) Yo todavía tengo mi álbum en un cajón.'],
        else: ['No le entendí… ¿qué coleccionaba?'],
        hint: 'Use the imperfect: “Yo coleccionaba cartas.” / “Yo juntaba piedras.”',
        options: [
          { say: 'Yo coleccionaba cartas de animales.', ok: true },
          { say: 'Yo juntaba piedras de colores.', ok: true },
          { say: 'Hoy hace mucho calor.', reply: ['¡Y sí! Pero yo le pregunté qué coleccionaba.'] }
        ] },
      { type: 'memory', intro: ['((Ya que habla de la infancia…|Mientras usted guarda su figurita…)) le cuento algo.'] },
      { type: 'say', lines: ['((¡Hasta luego!|Que le vaya bien.)) Y dígale a su amigo que no pierda esa figurita.'] }
    ]
  },

  /* ---- FOOD: la merienda in a confitería ---- */
  {
    id: 'merienda', title: 'La confitería', en: 'Afternoon snack at the confitería', place: 'random', cast: 'CONFITERAS', prefers: ['mate', 'lluvia'],
    scene: { props: 'confiteria', landmark: null },
    vars: { menu: { from: 'MERIENDA', count: 3 }, soldOut: { pick: 'menu' }, okItem: { pick: 'menu', exclude: 'soldOut' } },
    steps: [
      { type: 'say', lines: ['((¡Buenas tardes!|Pase, pase.)) Está justo a la hora de la merienda.', 'La merienda era sagrada en mi casa. Cuando yo era niña, mi mamá siempre preparaba mate cocido con pan casero y dulce de leche. Los domingos íbamos con mi padre a la confitería y pedíamos chocolatada con churros.'] },
      { type: 'pick', task: 'What did her mother always prepare for the merienda?', options: ['Mate cocido with homemade bread and dulce de leche', 'Coffee with croissants', 'Soup with crackers'] },
      { type: 'say', lines: ['Hoy tenemos {menu|list}. Para tomar, hay café con leche, chocolatada, jugo de naranja, mate cocido y licuado de banana. ((¿Qué le sirvo?|¿Qué va a querer?))'] },
      { type: 'talk', id: 'order',
        task: 'Order one of today’s items and a drink.',
        parts: [
          { match: '$menu', capture: 'item', reject: [{ match: '$soldOut', say: ['Ay, mi vida, {soldOut.the} se acabó. ((Se nos fue todo con el calor.|Lo vendimos todo temprano.)) ¿Quiere otra cosa?'] }], ask: ['¿Y qué le traigo para comer? Le repito: {menu|list}.'] },
          { match: 'DRINKS', capture: 'drink', ask: ['¿Y para tomar? Café con leche, chocolatada, jugo de naranja, mate cocido o licuado de banana.'] }
        ],
        done: ['Muy bien: {item.name} y {drink.name}. ((Ahora se lo traigo.|Enseguida.))'],
        hint: 'Name an item she said, and a drink: “Me trae …, por favor, y una chocolatada.” One item is sold out.',
        options: [
          { say: 'Me trae {okItem.name}, por favor, y una chocolatada.', ok: true, effect: { item: '$okItem', drink: 'DRINKS.1' } },
          { say: '¿Usted preparó todo esto?', reply: ['Sí, todo, con las recetas de mi mamá. ¿Qué le sirvo?'] },
          { say: 'Quiero una pizza con papas fritas.', reply: ['Ay, eso no tenemos. ¿Qué le traigo de lo que dije?'] }
        ] },
      { type: 'say', set: { wrongDrink: { from: 'DRINKS', exclude: 'drink' } },
        lines: ['Aquí tiene: {item.name} y {wrongDrink.name}. ¡Que aproveche!'] },
      { type: 'talk', id: 'fix',
        task: 'Something about your order isn’t right. Tell her politely.',
        parts: [ { re: '{drink.re}|no (es|era) (lo que|mi)|equivoc|no pedi|yo pedi|habia pedido|queria|pedi', ask: ['¿Sí? ¿Qué pasó? ¿Qué fue lo que pidió?'] } ],
        done: ['¡Ay, perdone! ((Me equivoqué de mesa.|Me confundí.)) Ahora le cambio la bebida y le traigo {drink.the}.'],
        else: ['((¿Todo bien?|¿Le gusta?)) ¿Le falta algo?'],
        hint: 'She brought the wrong drink. Say what you ordered: “Perdón, pero yo pedí …”',
        options: [
          { say: 'Perdón, pero yo pedí {drink.name}, no {wrongDrink.name}.', ok: true },
          { say: '¡Qué rico! Muchas gracias.', reply: ['De nada. ¿Seguro que todo está bien? Mire bien lo que le traje.'] },
          { say: '¿Me trae la cuenta, por favor?', reply: ['Enseguida, pero… ¿no se fijó en la bebida?'] }
        ] },
      { type: 'memory', intro: ['((Mientras come…|Ya que está tranquilo…)) ¿quiere que le cuente algo de cuando yo era chica?'] },
      { type: 'say', set: { total: { calc: 'item.price + drink.price' } },
        lines: ['((Bueno, aquí está la cuenta.|Ahora le traigo la cuenta.)) Son {item.price} pesos por {item.the} y {drink.price} por {drink.the}.'] },
      { type: 'num', task: 'Add it up: how much is the bill in total?', answer: '{total}', listen: false },
      { type: 'say', lines: ['Cabal, {total} pesos. ¡Muchas gracias! ((Vuelva pronto.|Que le vaya bonito.))'] }
    ]
  },

  /* ---- CULTURE: candombe and the llamadas ---- */
  {
    id: 'candombe', title: 'Las llamadas', en: 'Candombe drums in Barrio Sur', place: 'barriosur', cast: 'TAMBOREROS', prefers: ['murga', 'rambla'],
    scene: { props: 'candombe', landmark: null },
    vars: { years: { from: 'YEARS' } },
    steps: [
      { type: 'say', lines: ['((¡Buenas tardes!|Buenas, buenas.)) Escuche ese tambor… ¿Lo siente en el pecho?', 'Cuando yo era chico, mi padre tocaba el tambor en las llamadas de febrero. Salíamos de casa a las ocho y toda la calle se llenaba de gente. Los tambores sonaban toda la noche y las mujeres bailaban con vestidos de colores. Yo todavía no tocaba, porque era muy chico: solo miraba y bailaba.'] },
      { type: 'pick', task: 'Why didn’t he play the drum as a child?', options: ['He was too young', 'He was afraid of the noise', 'His father said no'] },
      { type: 'talk', id: 'hace',
        task: 'Ask him how long he has been playing the drum. Use hace: ¿Hace cuánto que toca el tambor?',
        parts: [ { re: 'hace cuanto|cuanto tiempo|desde cuando|cuantos anos', ask: ['((¿Quiere saber desde cuándo toco?|Pregúnteme cuánto tiempo hace que toco.))'] } ],
        done: ['((¡Uy, hace mucho!|¡Ja, hace tiempo!)) Hace {years} años que salgo en las llamadas. Empecé a tocar cuando tenía quince años.'],
        else: ['Pregúnteme cuánto tiempo hace que toco el tambor.'],
        hint: 'Ask with hace: “¿Hace cuánto que toca el tambor?” or “¿Hace cuántos años que toca?”',
        options: [
          { say: '¿Hace cuánto que toca el tambor?', ok: true },
          { say: '¿Hace cuántos años que sale en las llamadas?', ok: true },
          { say: '¿Qué hora es?', reply: ['Las seis, más o menos. Pero usted quería saber algo del tambor, ¿no?'] }
        ] },
      { type: 'num', task: 'For how many years has he been playing in the llamadas?', answer: '{years}' },
      { type: 'memory', intro: ['((Y le cuento algo más…|Mientras afinamos los tambores…)) ¿quiere oír un recuerdo?'] },
      { type: 'say', lines: ['((¡Hasta luego!|Que le vaya bien.)) Y en febrero, venga a las llamadas: ¡se va a acordar de nosotros toda la vida!'] }
    ]
  },

  /* ---- SCHOOL: the white smock ---- */
  {
    id: 'escuela', title: 'El delantal blanco', en: 'School when she was a girl', place: 'random', cast: 'MAESTRAS', prefers: ['cometa', 'mate'],
    scene: { props: 'escuela', landmark: null },
    vars: { size: { from: 'CLASS_SIZES' }, blocks: { from: 'BLOCKS' } },
    steps: [
      { type: 'say', lines: ['((¡Buenas tardes!|Buenas, buenas.)) ¿Ve esa escuela? Ahí fui yo de niña.', 'Todos llevábamos un delantal blanco con una moña azul. Caminaba {blocks} cuadras hasta la escuela, con mi hermano. En mi clase éramos {size} alumnos, y la maestra se llamaba la señorita Rosa. A la hora del recreo, saltábamos la cuerda y jugábamos a las bolitas.'] },
      { type: 'pick', task: 'What did all the children wear to school?', options: ['A white smock with a blue bow', 'A grey uniform with a tie', 'A red jacket'] },
      { type: 'num', task: 'How many students were in her class?', answer: '{size}' },
      { type: 'write', id: 'school', person: 'any', min: { imperfect: 3 },
        npc: ['((Y usted, ¿cómo era su escuela?|¿Y su escuela, cómo era?)) ¿Qué llevaba puesto? ¿Cómo iba?'],
        task: 'Describe your school when you were little: what you wore, how you got there, what you did at recess. Use the imperfect (at least three verbs): llevaba, iba, jugaba, era…',
        done: ['((¡Qué interesante!|¡Cuánta diferencia!)) Pero los recreos siempre fueron los mejores momentos.'],
        hint: 'Imperfect for habits and descriptions: “Mi escuela era grande. Iba en autobús. En el recreo jugaba con mis amigos.”',
        model: 'Mi escuela era grande y tenía un patio con árboles. Iba en autobús con mis amigos. En el recreo jugaba al fútbol.' },
      { type: 'memory', intro: ['((Ya que habla de la escuela…|Antes de que suene el timbre…)) le cuento algo.'] },
      { type: 'say', lines: ['((¡Hasta luego!|Que le vaya bien.)) Hoy cada niño de escuela pública tiene su propia computadora. ¡Qué cambio!'] }
    ]
  }
];

/* ---------- SIDE ENCOUNTERS (optional, short; each reveals a Dato) ---------- */
const SIDES = [
  { id: 'mate', title: 'Un mate', place: 'independencia', props: 'plaza', who: { name: 'Doña Ana', look: { skin: '#D2A584', hair: '#8F8A9E', style: 'bun', outfit: 'jacket', color: '#3FA36B', accent: '#F4F0E6', age: 'old' }, pitch: 1.05 },
    say: ['((¡Buenas tardes!|Buenas.)) ¿Quiere un mate? Es amargo, ¿eh? Yo lo tomo así desde que era niña.'],
    task: 'A woman offers you a mate. Accept or decline politely.',
    branches: [ { re: 'no gracias|no,? gracias|ahorita no|no quiero|mejor no|otro dia', say: ['Ta, ta. ¿Sabía que en Uruguay la gente anda con el termo y el mate bajo el brazo a todas partes?'] },
                { re: 'si|bueno|claro|dale|gracias|por favor|quiero', say: ['¡Tome, tome, con cuidado que quema! ¿Sabía que en Uruguay la gente anda con el termo y el mate bajo el brazo a todas partes?'] } ],
    gem: 'mate' },
  { id: 'heladero', title: 'El heladero', place: 'pocitos', props: 'street', who: { name: 'Gerardo', look: { skin: '#C99A7A', hair: '#3A2A26', style: 'short', outfit: 'apron', color: '#8A4FC7', accent: '#F4F0E6', hat: 'cap', age: 'young' }, pitch: 1.0 },
    say: ['¡Helado, helado! ¿Querés uno? … Digo, ¿quiere uno? De dulce de leche granizado, el mejor. ¿Cuántas bochas?'],
    task: 'An ice-cream seller asks how many scoops (bochas) you want. Answer him.',
    branches: [ { re: '\\b(una|un|uno|dos|tres|cuatro|[1-4])\\b', say: ['¡Aquí tiene! Con dulce de leche, como se debe. ¿Sabía que el dulce de leche es casi sagrado en Uruguay?'] },
                { re: 'no gracias|no,? gracias|ahora no', say: ['Ta. Se lo pierde, ¿eh? ¿Sabía que el dulce de leche es casi sagrado en Uruguay?'] } ],
    gem: 'helado' },
  { id: 'tambor', title: 'El tamborcito', place: 'barriosur', props: 'candombe', who: { name: 'Facundo', look: { skin: '#8E5A44', hair: '#1E1612', style: 'curly', outfit: 'shirt', color: '#D8433E', age: 'young' }, pitch: 1.3 },
    say: ['¡Mire mi tambor! Me lo regaló mi abuelo. ¿Quiere tocar? Es fácil… ¡Bo, no se asuste!'],
    task: 'A boy shows you his drum and asks if you want to play. Answer him.',
    branches: [ { re: 'si|bueno|claro|dale|quiero|por favor|me gustaria', say: ['¡Ta! Así, despacito… ¡Qué bien! Usted ya es del barrio. Los tambores del candombe son tres: chico, repique y piano.'] },
                { re: 'no gracias|no,? gracias|ahora no|no se|no puedo|mejor no', say: ['Ta, otro día. Mire, los tambores del candombe son tres: chico, repique y piano.'] } ],
    gem: 'tambores2' },
  { id: 'teatro', title: 'La acomodadora', place: 'solis', props: 'street', who: { name: 'Señora Beatriz', look: { skin: '#D4A98A', hair: '#2A1F1A', style: 'long', outfit: 'jacket', color: '#8A2F4F', accent: '#F4F0E6', age: 'adult' }, pitch: 1.08 },
    say: ['Buenas tardes. ¿Conoce el Teatro Solís? Yo trabajo aquí desde hace veinte años. ¿Le gustaría entrar alguna vez?'],
    task: 'An usher at the Teatro Solís asks if you would like to visit. Answer her.',
    branches: [ { re: 'si|claro|me gustaria|quisiera|quiero|bueno|por favor|encantaria', say: ['¡Qué bueno! Hay visitas guiadas todos los días. El teatro se inauguró en 1856 y todavía se usa.'] },
                { re: 'no|todavia|quizas|tal vez|capaz|depende', say: ['Capaz otro día. De todos modos, el teatro se inauguró en 1856 y todavía se usa.'] } ],
    gem: 'solis' },
  { id: 'futbol', title: 'El botija con la pelota', place: 'centenario', props: 'street', who: { name: 'Santi', look: { skin: '#C99A7A', hair: '#1E1612', style: 'short', outfit: 'shirt', color: '#F4F0E6', accent: '#3E7BD8', age: 'young' }, pitch: 1.28 },
    say: ['¡Eh, gurí! ¿Sos de Nacional o de Peñarol? … Ay, perdón, ¿eres de Nacional o de Peñarol?'],
    task: 'A boy asks which team you support. Answer him (any answer is fine).',
    branches: [ { re: 'nacional|penarol|ninguno|ninguna|ni de|ambos|los dos|de otro|de otra|barcelona|real|boca|river|cuadro|equipo|no soy|no me gusta|soy de', say: ['¡Ta! Acá el fútbol es una religión. En este estadio se jugó la primera final de un Mundial, en 1930, y ganó Uruguay.'] } ],
    gem: 'mundial' },
  { id: 'parrillero', title: 'El parrillero', place: 'mercado', props: 'street', who: { name: 'Don Beto', look: { skin: '#C99A7A', hair: '#8F8A9E', style: 'short', outfit: 'apron', color: '#7A3B2A', accent: '#F4F0E6', age: 'old', mustache: true }, pitch: 0.84 },
    say: ['¡Pase, pase! Aquí se asa carne desde hace más de cien años. ¿Qué va a comer? ¿Chivito, chorizo, entraña?'],
    task: 'A grill cook at the Mercado del Puerto asks what you want to eat. Order something.',
    branches: [ { re: 'chivito|chorizo|entrana|asado|carne|morcilla|pancho|pollo|quiero|me gustaria|voy a', say: ['¡Buena elección! Ahora le preparo. Dato: el chivito es el plato nacional de Uruguay, y aunque se llama «chivito», no lleva carne de cabra.'] } ],
    gem: 'chivito' }
];

/* ---------- GEMS: "Datos de Montevideo" (6 are hidden per run) ---------- */
/* where: 'map' (hub map, at a landmark via lm, or x/y in %), a scene id, or 'side' (revealed by a side encounter).
   es is spoken; en is shown. */
const GEMS = [
  { id: 'salvo', title: 'Palacio Salvo', where: 'map', lm: 'salvo', es: 'El Palacio Salvo se terminó en 1928. Con casi cien metros, fue durante años el edificio más alto de Sudamérica.', en: 'The Palacio Salvo was finished in 1928. At almost 100 m it was for years the tallest building in South America.' },
  { id: 'independencia', title: 'Plaza Independencia', where: 'map', lm: 'independencia', es: 'En el centro de la Plaza Independencia está la estatua de Artigas, el héroe nacional. Debajo de la estatua hay un mausoleo.', en: 'In the middle of Plaza Independencia stands the statue of Artigas, the national hero. A mausoleum lies beneath it.' },
  { id: 'mercado', title: 'Mercado del Puerto', where: 'map', lm: 'mercado', es: 'El Mercado del Puerto tiene una gran estructura de hierro y está lleno de parrillas. Desde 1868 la gente viene a comer carne asada.', en: 'The Mercado del Puerto has a big iron structure and is full of grills. People have come for roast meat since 1868.' },
  { id: 'rambla', title: 'La Rambla', where: 'map', x: 70, y: 86, es: 'La Rambla de Montevideo es un paseo de más de veinte kilómetros junto al río. La gente camina, corre y toma mate mirando el agua.', en: 'Montevideo’s Rambla is a promenade of over 20 km along the river. People walk, run and drink mate looking at the water.' },
  { id: 'rio', title: 'El Río de la Plata', where: 'map', x: 28, y: 90, es: 'El Río de la Plata es tan ancho que parece un mar. Su agua tiene color marrón porque lleva mucha tierra.', en: 'The Río de la Plata is so wide it looks like a sea. Its water is brown because it carries a lot of silt.' },
  { id: 'cerro', title: 'El Cerro', where: 'map', x: 6, y: 74, es: 'Al otro lado de la bahía se ve el Cerro de Montevideo, con una pequeña fortaleza en la cima.', en: 'Across the bay you can see the Cerro de Montevideo, with a small fortress on top.' },
  { id: 'carnaval', title: 'El Carnaval', where: 'map', lm: 'barriosur', es: 'El Carnaval de Uruguay es famoso por ser el más largo del mundo: dura unos cuarenta días, con murgas, tambores y tablados.', en: 'Uruguay’s Carnival is famous as the longest in the world: about forty days of murgas, drums and street stages.' },
  { id: 'mundial', title: 'El Mundial de 1930', where: 'map', lm: 'centenario', es: 'El primer Mundial de fútbol se jugó en Uruguay en 1930. La final fue en el Estadio Centenario, y ganó Uruguay.', en: 'The first football World Cup was played in Uruguay in 1930. The final was at the Estadio Centenario, and Uruguay won.' },
  { id: 'palabras', title: 'Palabras uruguayas', where: 'omnibus', x: 14, y: 36, es: 'Un niño es un gurí o un botija. «Ta» significa «está bien», y «bo» es como decir «oye».', en: 'A kid is a gurí or a botija. “Ta” means “okay”, and “bo” is like saying “hey”.' },
  { id: 'cielo', title: 'El cielo de la rayuela', where: 'rayuela', x: 82, y: 24, es: 'En la rayuela, el último cuadro se llama «cielo». El que llega al cielo, gana.', en: 'In hopscotch, the last square is called the “cielo” (sky). Whoever reaches it wins.' },
  { id: 'figuritas', title: 'Las figuritas', where: 'figuritas', x: 84, y: 30, es: 'Los niños uruguayos coleccionan figuritas de fútbol y cambian las repetidas en el recreo. Cada Mundial sale un álbum nuevo.', en: 'Uruguayan kids collect football stickers and swap their duplicates at recess. A new album comes out every World Cup.' },
  { id: 'dulce', title: 'El dulce de leche', where: 'merienda', x: 84, y: 28, es: 'El dulce de leche se come con pan, en alfajores y en tortas. En Uruguay casi todos tienen un frasco en casa.', en: 'Dulce de leche is eaten on bread, in alfajores and in cakes. In Uruguay almost every home has a jar.' },
  { id: 'tambores', title: 'Los tambores', where: 'candombe', x: 14, y: 36, es: 'El candombe usa tres tambores: el chico, el repique y el piano. La UNESCO lo declaró patrimonio cultural en 2009.', en: 'Candombe uses three drums: chico, repique and piano. UNESCO recognised it as cultural heritage in 2009.' },
  { id: 'delantal', title: 'El delantal', where: 'escuela', x: 80, y: 30, es: 'Los niños de escuela pública usan un delantal blanco con una moña azul.', en: 'Children at public schools wear a white smock with a blue bow.' },
  { id: 'ceibal', title: 'Plan Ceibal', where: 'escuela', x: 16, y: 34, es: 'Desde 2007, cada niño de escuela pública recibe una computadora portátil. Se llama Plan Ceibal.', en: 'Since 2007, every public-school child receives a laptop. It’s called Plan Ceibal.' },
  // These are revealed by side encounters (not placed on their own)
  { id: 'mate', title: 'El mate', where: 'side', es: 'En Uruguay, la gente anda con el termo y el mate bajo el brazo a todas partes. Es uno de los países donde más mate se toma.', en: 'In Uruguay people carry their thermos and mate everywhere. It is one of the countries that drinks the most mate.' },
  { id: 'helado', title: 'El dulce de leche granizado', where: 'side', es: 'El dulce de leche granizado es un helado de dulce de leche con trocitos de chocolate.', en: 'Dulce de leche granizado is dulce de leche ice cream with chocolate chips.' },
  { id: 'tambores2', title: 'Chico, repique y piano', where: 'side', es: 'Los tres tambores del candombe son el chico, el repique y el piano. Cada uno toca un ritmo distinto.', en: 'The three candombe drums are the chico, the repique and the piano. Each plays a different rhythm.' },
  { id: 'solis', title: 'El Teatro Solís', where: 'side', es: 'El Teatro Solís se inauguró en 1856. Es el teatro más antiguo de Montevideo que sigue funcionando.', en: 'The Teatro Solís opened in 1856. It is Montevideo’s oldest theatre still in use.' },
  { id: 'chivito', title: 'El chivito', where: 'side', es: 'El chivito es un sándwich de carne con jamón, queso, huevo y otras cosas. Es el plato nacional, aunque «chivito» significa cabrito.', en: 'The chivito is a steak sandwich with ham, cheese, egg and more. It is the national dish, though “chivito” means kid goat.' }
];

/* ---------- LUCÍA: intro, voice notes and goodbye ---------- */
const LUCIA = {
  intro: ['¡Hola! ¡Bienvenido a Montevideo! Yo llego más tarde.', 'Esta noche, a las ocho menos veinte, un amigo de mis abuelos nos invita a merendar. Quiere saber cómo era tu niñez, y yo también.', 'Mientras tanto, pasea por la ciudad y habla con la gente: todos tienen un recuerdo de cuando eran pequeños. ¡Escucha bien!'],
  // short voice notes before each scenario without a `brief`
  notes: {
    rayuela: ['En una plaza hay una señora que dibuja rayuelas en la vereda. Ve a jugar con ella, ¡es muy simpática!'],
    escondidas: ['En el Parque Rodó hay un abuelo con su nieto. Dicen que juegan a las escondidas todas las tardes. ¡Ve a ayudarlos!'],
    merienda: ['¿Ya tienes hambre? Es la hora de la merienda. Hay una confitería muy buena por aquí. ¡Pide algo rico!'],
    candombe: ['En Barrio Sur siempre suenan los tambores. Pregúntale a un tamborero desde cuándo toca.'],
    escuela: ['Cerca de aquí hay una escuela muy antigua. Una maestra jubilada siempre cuenta cómo era la escuela de antes.']
  },
  finale: ['¡Ya es hora! El amigo de mis abuelos te espera en su casa. ¡Ven a merendar, que ya está el mate!'],
  goodbye: ['¡Qué tarde! Ahora conoces Montevideo y los recuerdos de su gente.', 'Mi próxima parada es {nextCity}. ¡Allá te espero!']
};

/* ---------- FINALE: la merienda en casa de un amigo de los abuelos ---------- */
/* The host is one of PROFILES, chosen at random. The student listens to his/her childhood, puts a day in order,
   answers one question, then tells about their own childhood. The host replies and compares. */
const FINALE = {
  title: 'La merienda', place: 'casa',
  orderTask: 'Put the events of his/her day in order. Listen to each card (▶), then click them in the order they happened.',
  writeTask: 'Now it’s your turn: tell them about your childhood. Write at least four sentences: what you used to do (imperfect), what it was like, and one thing with hace + time (for example: Hace diez años que vivo en…).',
  writeMin: { imperfect: 3, hace: 1 },
  writeWords: 20,
  reactHit: ['¡Mire qué parecido! Nosotros también hacíamos eso.', '¡Qué lindo! Se nota que usted también tuvo una niñez feliz.'],
  reactMiss: ['¡Qué diferente a la mía! Pero me encanta escucharle.', 'Ah, ¡qué interesante! Su niñez fue distinta a la mía, pero igual de linda.'],
  closing: ['Así que ya ve: los tiempos cambian, pero la merienda siempre es la merienda. ¡Gracias por venir!']
};

const PROFILES = [
  {
    id: 'washington', title: 'Don Washington y el Cerro', en: 'Don Washington’s childhood in the Cerro',
    welcome: ['¡Buenas tardes, buenas tardes! Pasen, pasen, que ya está el mate listo.', 'Soy Washington, amigo de los abuelos de Lucía. Ella me dijo que hoy quieren saber cómo era la niñez de la gente. Entonces siéntense, que les cuento cómo era un día de mi vida cuando tenía diez años.'],
    intro: 'Así era un día en mi niñez, allá en el Cerro.',
    story: [
      'Cuando yo tenía diez años, vivíamos en el Cerro, en una casa pequeña con un patio lleno de gallinas.',
      'Me levantaba muy temprano, porque mi madre ya estaba preparando el mate cocido, con pan y dulce de leche.',
      'Iba a la escuela caminando con mi hermano mayor. Llevaba un delantal blanco y una moña azul, y siempre llegaba despeinado.',
      'Al mediodía volvía a casa a almorzar con toda la familia, y mi padre, que trabajaba en el frigorífico, también venía a comer.',
      'Por la tarde, después de hacer los deberes, jugaba al fútbol en la calle con una pelota de trapo. No teníamos zapatos buenos, pero éramos felices.',
      'A las cinco merendábamos otra vez, y después yo ayudaba a mi madre a darles de comer a las gallinas.',
      'Y de noche, toda la familia escuchaba la radio en la cocina, porque en el barrio nadie tenía televisión.'
    ],
    events: [
      'Washington se levantaba temprano y tomaba mate cocido con pan.',
      'Caminaba a la escuela con su hermano mayor.',
      'Volvía a casa a almorzar con su familia.',
      'Jugaba al fútbol en la calle con una pelota de trapo.',
      'De noche escuchaba la radio con su familia.'
    ],
    why: { ask: 'Why did the family listen to the radio at night?', options: ['Nobody in the neighbourhood had a television', 'The radio was a gift from Lucía', 'The electricity was cut off'] },
    reply: ['¡Qué lindo, qué lindo! Hace mucho tiempo que no juego con una pelota de trapo, pero todavía me acuerdo de cada gol.', 'Hoy los niños tienen computadoras y celulares, y nosotros teníamos la calle. Pero lo importante es lo mismo: jugar, reírse y merendar con la familia.'],
    keys: [
      { re: 'jug|pelota|futbol|escond|carta|bici|cuerda|juego|corr', en: 'games and playing outside' },
      { re: 'merend|mate|pan|comida|torta|dulce|desayun|almorz|cena', en: 'food and meals' },
      { re: 'famili|madre|padre|mama|papa|abuel|herman|primo|tio', en: 'family' },
      { re: 'escuela|colegio|clase|maestr|deber|tarea', en: 'school' }
    ]
  },
  {
    id: 'nelly', title: 'Doña Nelly y las llamadas', en: 'Doña Nelly’s childhood in Barrio Sur',
    welcome: ['¡Buenas tardes, mis queridos! Pasen, pasen, que ya está el mate listo.', 'Soy Nelly, amiga de los abuelos de Lucía. Ella me dijo que quieren saber cómo era la niñez de la gente. Entonces siéntense, que les cuento cómo era un día de mi vida cuando tenía ocho años.'],
    intro: 'Así era un día en mi niñez, allá en Barrio Sur.',
    story: [
      'Cuando yo tenía ocho años, vivía en Barrio Sur, en una casa con muchas habitaciones y muchas familias. Todos éramos vecinos y casi parientes.',
      'Mi padre era carpintero y, los domingos, tocaba el tambor en las llamadas. Yo lo miraba desde la vereda, con los ojos muy grandes.',
      'Por las mañanas iba a la escuela con mi delantal blanco. Mi maestra se llamaba Ofelia y siempre nos decía: «Hablen despacio y piensen antes de contestar».',
      'En el recreo saltábamos la cuerda y jugábamos a la payana con piedritas. Yo era la mejor saltando y nunca me tropezaba.',
      'Después de la escuela, ayudaba a mi madre a cocinar y a planchar. Planchábamos con una plancha de hierro, pesadísima, que se calentaba en la cocina.',
      'Los sábados por la noche, la familia se reunía en el patio. Mis tíos cantaban, mi padre tocaba el tambor y los niños bailábamos hasta cansarnos.',
      'Y los domingos de febrero, todo el barrio salía a la calle. Las llamadas empezaban a las nueve y no terminaban hasta la madrugada.'
    ],
    events: [
      'Nelly vivía en Barrio Sur con muchos vecinos.',
      'Iba a la escuela con su delantal blanco.',
      'En el recreo saltaba la cuerda con sus amigas.',
      'Después de la escuela ayudaba a su madre a cocinar y planchar.',
      'Los domingos de febrero salía a ver las llamadas.'
    ],
    why: { ask: 'Why did Nelly watch her father from the sidewalk?', options: ['He was playing the drum in the llamadas', 'She wasn’t allowed inside the house', 'She was waiting for the school bus'] },
    reply: ['¡Qué hermoso lo que me contaron! Hace más de sesenta años de esas llamadas, y todavía me acuerdo del sonido del tambor en el pecho.', 'Y todavía hoy, cada febrero, el barrio sale a la calle. Los tiempos cambian, pero la música sigue.'],
    keys: [
      { re: 'jug|cuerda|juego|bailaba|cantaba|corr|musica|tambor', en: 'games and music' },
      { re: 'merend|mate|pan|comida|cocin|torta|dulce|desayun|almorz', en: 'food and cooking' },
      { re: 'famili|madre|padre|mama|papa|abuel|herman|primo|tio|vecino', en: 'family and neighbours' },
      { re: 'escuela|colegio|clase|maestr|deber|tarea|recreo', en: 'school' }
    ]
  },
  {
    id: 'hugo', title: 'Don Hugo y la costa', en: 'Don Hugo’s childhood by the coast',
    welcome: ['¡Buenas tardes, buenas tardes! Pasen, pasen, que ya está el mate listo.', 'Soy Hugo, amigo de los abuelos de Lucía. Ella me dijo que quieren saber cómo era la niñez de la gente. Entonces siéntense, que les cuento cómo eran mis veranos cuando tenía nueve años.'],
    intro: 'Así eran mis veranos, allá en Punta Carretas.',
    story: [
      'Cuando era niño, vivía en Punta Carretas, a dos cuadras de la costa. Mi abuelo, que era pescador, vivía con nosotros.',
      'Los veranos eran larguísimos. Nos levantábamos con el sol y bajábamos a la costa antes del desayuno.',
      'Mi abuelo me llevaba a pescar a las piedras. Salíamos a las seis de la mañana, con una caña de bambú y un balde con carnada.',
      'Casi nunca pescábamos mucho, pero mi abuelo me contaba historias de barcos y de tormentas. Yo me quedaba callado, escuchando.',
      'Al mediodía comíamos pan con queso sentados en las piedras. A veces mi madre nos traía un termo con mate y unas tortas fritas.',
      'Por la tarde, yo nadaba y jugaba con mis amigos hasta que el sol empezaba a bajar.',
      'Y cuando oscurecía, volvíamos a casa con la piel quemada y los bolsillos llenos de caracoles.'
    ],
    events: [
      'Hugo bajaba a la costa temprano con su abuelo.',
      'Pescaban en las piedras con una caña de bambú.',
      'Comían pan con queso sentados en las piedras.',
      'Por la tarde nadaba y jugaba con sus amigos.',
      'Volvía a casa de noche con caracoles en los bolsillos.'
    ],
    why: { ask: 'Why did Hugo stay quiet while fishing?', options: ['He was listening to his grandfather’s stories', 'He was afraid of the sea', 'The fish were sleeping'] },
    reply: ['Hace cincuenta años que no pesco en esas piedras, pero a veces voy a mirar el agua. Cuando uno es grande, extraña las cosas simples.', 'La costa, la familia, el mate… Eso era todo lo que necesitábamos.'],
    keys: [
      { re: 'jug|nad|pesc|playa|mar|rio|corr|juego|bici', en: 'games, swimming and the sea' },
      { re: 'merend|mate|pan|comida|queso|torta|dulce|desayun|almorz', en: 'food and meals' },
      { re: 'famili|madre|padre|mama|papa|abuel|herman|primo|tio|amigo', en: 'family and friends' },
      { re: 'verano|vacacion|sol|calor|casa|barrio', en: 'summers and home' }
    ]
  }
];
