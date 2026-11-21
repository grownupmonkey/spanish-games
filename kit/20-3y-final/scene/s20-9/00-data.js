/* ===================== Las siete ciudades de oro: data ===================== */
/* ll = [longitude, latitude]; lbl = label offset on the map.
   clues  = how witnesses describe this city when it is the NEXT stop (comprehensible input + pictures)
   datos  = clues that only make sense if you remember a Dato from an earlier game (ref = that game)
   wit    = three witnesses: [0] and [1] describe the next city, [2] describes the thief
   archivo.year/event = the line used by the medallion lock in Granada */
const LETH = { id: 'lethbridge', name: 'Lethbridge', country: 'Canadá', ll: [-112.8, 49.7], lbl: [8, -8] };

const CITIES = {
  mexico: {
    name: 'Ciudad de México', country: 'México', ll: [-99.1, 19.4], lbl: [-12, -12], flag: 'mx', hola: '¡Qué onda!',
    sym: 'sol', symName: 'el sello del sol', puzzle: 'glyph',
    clues: [
      { es: 'Quería ver una pirámide en el centro de una ciudad muy grande.', ic: '🛕🏙️' },
      { es: 'Preguntó por la Piedra del Sol, una piedra enorme y redonda.', ic: '☀️🪨' },
      { es: 'Dijo: «Voy a la capital de México. Antes, allí había un lago y una ciudad azteca».', ic: '🇲🇽🛶' },
      { es: 'Habló de una bandera verde, blanca y roja, con un águila y una serpiente.', ic: '🦅🐍', flag: 'mx' }
    ],
    datos: [],
    wit: [
      { name: 'Don Ramiro', role: 'guía del Templo Mayor', look: { skin: '#A86E50', hairC: '#C9C3D3', style: 'short', shirtC: '#3E6E9E', beard: true, age: 60 } },
      { name: 'Xóchitl', role: 'vende esquites en el Zócalo', look: { skin: '#B07656', hairC: '#1E1620', style: 'long', shirtC: '#D9506A', fem: true, age: 25 } },
      { name: 'Iván', role: 'estudiante de arqueología', look: { skin: '#C48A66', hairC: '#2B1D17', style: 'curly', shirtC: '#3E8E7E', glasses: true, age: 22 } }
    ],
    archivo: {
      title: 'Tenochtitlan y la Ciudad de México', year: '1536', event: 'Cabeza de Vaca llega a la Ciudad de México.',
      short: ['Los mexicas fundaron Tenochtitlan en 1325, en una isla en un lago.', 'Hoy, debajo de la Ciudad de México, están las ruinas del Templo Mayor.', 'En 1536, Cabeza de Vaca llegó aquí después de caminar ocho años. Habló de siete ciudades ricas en el norte.'],
      long: 'Según la leyenda, los mexicas buscaban un águila sobre un nopal, comiendo una serpiente. La encontraron en una isla del lago de Texcoco y allí fundaron Tenochtitlan, una ciudad enorme con canales, mercados y templos. En 1521, después de la guerra con Hernán Cortés y sus aliados indígenas, los españoles construyeron la Ciudad de México sobre la ciudad mexica. En 1539, el virrey mandó a fray Marcos de Niza al norte a buscar Cíbola, y en 1540 salió Francisco Vázquez de Coronado con un gran ejército. Encontraron pueblos zuñis de adobe, con familias, campos de maíz y cerámica… pero no encontraron oro.',
      en: 'The Mexica founded Tenochtitlan on an island in Lake Texcoco in 1325 (the eagle on the cactus is on Mexico’s flag). After the war of 1521 the Spanish built Mexico City on top of it. Cabeza de Vaca reached the city in 1536 with stories of rich cities to the north; fray Marcos went to look in 1539 and Coronado set out in 1540. He found Zuni adobe pueblos, not gold.'
    },
    letter: 'Aquí leí los papeles del virrey. Coronado salió de esta ciudad en 1540. Buscó siete ciudades de oro, pero encontró pueblos de adobe.',
    gems: [
      { id: 'esquites', title: 'Los esquites', es: 'Esquites con limón, chile y mayonesa.', en: 'Corn kernels cooked with epazote, served in a cup with lime, chili, mayonnaise and cheese. Maize was first grown in Mexico thousands of years ago and is still at the heart of Mexican food.' },
      { id: 'coyolxauhqui', title: 'La piedra de Coyolxauhqui', es: 'En 1978, unos trabajadores encontraron esta piedra.', en: 'In 1978 electricians digging in the centre of Mexico City hit a huge round stone carving of the moon goddess Coyolxauhqui. The find led to the excavation of the Templo Mayor, the main temple of Tenochtitlan.' }
    ]
  },

  miami: {
    name: 'Miami', country: 'Estados Unidos', ll: [-80.2, 25.8], lbl: [10, -6], flag: 'us', hola: '¿Qué volá?',
    sym: 'concha', symName: 'el sello de la concha', puzzle: 'route', route: 'vaca',
    clues: [
      { es: 'Quería tomar un cafecito cubano en la Calle Ocho.', ic: '☕🇨🇺' },
      { es: 'Habló de una ciudad de Estados Unidos donde mucha gente habla español.', ic: '🇺🇸🗣️' },
      { es: 'Quería ir a la playa y ver los edificios art déco de colores.', ic: '🏖️🏨' },
      { es: 'Preguntó: «¿Por qué ese estado se llama Florida?».', ic: '🌸❓' }
    ],
    datos: [],
    wit: [
      { name: 'Doña Caridad', role: 'juega al dominó en la Calle Ocho', look: { skin: '#D9A07C', hairC: '#C9C3D3', style: 'curly', shirtC: '#E8A23A', fem: true, glasses: true, age: 70 } },
      { name: 'Andrés', role: 'vende café en una ventanita', look: { skin: '#8E5A44', hairC: '#1E1620', style: 'short', shirtC: '#2F6F7A', age: 35 } },
      { name: 'Kiara', role: 'salvavidas en South Beach', look: { skin: '#6B4232', hairC: '#1E1620', style: 'curly', shirtC: '#E8505B', fem: true, age: 24 } }
    ],
    archivo: {
      title: 'La Florida y Miami', year: '1528', event: 'El barco de Cabeza de Vaca llega a la costa de la Florida.',
      short: ['En 1513, Juan Ponce de León llegó a esta costa en Pascua. Por eso la llamó «la Florida».', 'En 1528, Cabeza de Vaca llegó a la Florida con la expedición de Narváez.', 'Hoy, en Miami, más de la mitad de la gente habla español.'],
      long: 'Juan Ponce de León, el primer gobernador de Puerto Rico, llegó a esta península en la Pascua de 1513 y la llamó «la Florida», por la Pascua Florida y por sus flores. Más tarde nació una leyenda: que buscaba la Fuente de la Juventud. En 1528, la expedición de Pánfilo de Narváez llegó a la costa oeste de la Florida, cerca de Tampa. Perdieron los barcos, hicieron balsas y el mar los llevó a Texas. De unos trescientos hombres, solo cuatro sobrevivieron: Álvar Núñez Cabeza de Vaca, dos españoles más y Estebanico, un hombre de Marruecos. En 1565, los españoles fundaron San Agustín, la ciudad de origen europeo más antigua de Estados Unidos. Hoy Miami es una ciudad muy latina: después de 1959 llegaron muchas familias cubanas, y después personas de toda América Latina.',
      en: 'Ponce de León named La Florida at Easter (Pascua Florida) in 1513. In 1528 the Narváez expedition, with Cabeza de Vaca, landed on the Gulf coast near Tampa; of about 300 men only four survived, among them Estebanico, a Moroccan. St. Augustine (1565) is the oldest European-founded city in the US. Modern Miami grew with Cuban families after 1959 and people from across Latin America.'
    },
    letter: 'Aquí empieza la historia de Cabeza de Vaca. Su barco llegó a la Florida en 1528. Caminó ocho años hasta México y contó la historia de las siete ciudades.',
    gems: [
      { id: 'domino', title: 'El parque del dominó', es: '¡Capicúa!', en: 'In Máximo Gómez Park on Calle Ocho, older Cuban-Americans play dominoes every day. «¡Capicúa!» is when the last tile fits at either end of the line, a winning move worth extra points.' },
      { id: 'freedom', title: 'La Torre de la Libertad', es: 'La Torre de la Libertad es alta y amarilla.', en: 'The Freedom Tower downtown is where many thousands of Cuban arrivals were received in the 1960s and early 1970s. People call it the “Ellis Island of the South”.' }
    ]
  },

  bogota: {
    name: 'Bogotá', country: 'Colombia', ll: [-74.1, 4.7], lbl: [10, 4], flag: 'co', hola: '¡Quiubo!',
    sym: 'balsa', symName: 'el sello de la balsa', puzzle: 'pick', pick: 'balsa',
    clues: [
      { es: 'Quería visitar el Museo del Oro.', ic: '🥇🏛️' },
      { es: 'Habló de una capital en las montañas, a 2600 metros de altura.', ic: '⛰️🏙️' },
      { es: 'Habló de una bandera amarilla, azul y roja.', ic: '🏳️', flag: 'co' }
    ],
    datos: [
      { es: 'Pidió «un tinto»… ¡y no quería vino!', ic: '☕', ref: 'Otra vez tarde', en: 'In Colombia, un tinto is a small black coffee.' },
      { es: 'Quería un chocolate caliente… ¡con queso!', ic: '🍫🧀', ref: 'Otra vez tarde', en: 'Chocolate santafereño, with cheese, is from Bogotá.' },
      { es: 'Quería subir a Monserrate en el teleférico.', ic: '🚡⛪', ref: 'Otra vez tarde', en: 'Monserrate is the mountain above Bogotá.' }
    ],
    wit: [
      { name: 'Don Efraín', role: 'vende tintos en un termo', look: { skin: '#B07656', hairC: '#3B2A22', style: 'bald', shirtC: '#8A5A3C', beard: true, age: 58 } },
      { name: 'Mariana', role: 'guía del Museo del Oro', look: { skin: '#D2A07E', hairC: '#3B2419', style: 'long', shirtC: '#E9A93A', fem: true, age: 30 } },
      { name: 'Julián', role: 'va en bicicleta a la ciclovía', look: { skin: '#C48A66', hairC: '#1E1620', style: 'short', shirtC: '#3E8E4E', age: 19 } }
    ],
    archivo: {
      title: 'El Dorado y Bogotá', year: '1538', event: 'Gonzalo Jiménez de Quesada funda Santafé de Bogotá.',
      short: ['Los muiscas vivían en estas montañas. Trabajaban muy bien el oro.', 'Cuando tenían un nuevo jefe, lo cubrían de oro, y él entraba en la laguna de Guatavita en una balsa.', 'Los españoles oyeron esta historia y buscaron «El Dorado». En 1538 fundaron Bogotá.'],
      long: 'Para los muiscas, el oro no era dinero: era sagrado, como el sol. En la ceremonia de la laguna de Guatavita, el nuevo cacique se cubría de polvo de oro, subía a una balsa y ofrecía oro y esmeraldas a la laguna. De esta ceremonia nació la leyenda de El Dorado: primero era un hombre de oro, después una ciudad de oro y por fin un país entero de oro. Muchas expediciones lo buscaron durante siglos. En 1538, Gonzalo Jiménez de Quesada fundó Santafé de Bogotá. En 1969, unos campesinos encontraron en una cueva de Pasca la Balsa Muisca, una pequeña balsa de oro con el cacique y sus acompañantes. Hoy está en el Museo del Oro, que tiene más de treinta mil piezas de oro.',
      en: 'For the Muisca, gold was sacred, not money. A new ruler was covered in gold dust and made offerings from a raft on Lake Guatavita; the story grew into the legend of El Dorado, first a golden man, then a city, then a whole land of gold. Bogotá was founded in 1538. The gold Muisca Raft, found in a cave in 1969, is in the Museo del Oro.'
    },
    letter: 'Busqué El Dorado en la laguna de Guatavita. No era una ciudad de oro: era una ceremonia de los muiscas.',
    gems: [
      { id: 'esmeralda', title: 'Las esmeraldas', es: 'Las esmeraldas de Colombia son famosas en todo el mundo.', en: 'Colombia produces many of the world’s finest emeralds, mostly in the mountains of Boyacá. The Muisca offered emeralds as well as gold.' },
      { id: 'ciclovia', title: 'La ciclovía', es: 'Los domingos, muchas calles son para las bicicletas.', en: 'Every Sunday and holiday, more than 100 km of Bogotá’s streets close to cars for the Ciclovía, and huge crowds walk, cycle and skate.' }
    ],
    remember: { q: 'En Bogotá, un señor te ofrece «un tinto». ¿Qué es?', opts: ['Un café negro pequeño', 'Un vino tinto', 'Un jugo de fresa'], ref: 'Otra vez tarde' }
  },

  sanjuan: {
    name: 'San Juan', country: 'Puerto Rico', ll: [-66.1, 18.5], lbl: [8, 12], flag: 'pr', hola: '¡Wepa!',
    sym: 'garita', symName: 'el sello de la garita', puzzle: 'timeline', timeline: 'sanjuan',
    clues: [
      { es: 'Quería ver un fuerte español muy viejo al lado del mar.', ic: '🏰🌊' },
      { es: 'Habló de una isla del Caribe. La gente de la isla se llama «boricua».', ic: '🏝️' },
      { es: 'Habló de una bandera con franjas rojas y blancas, un triángulo azul y una estrella.', ic: '⭐', flag: 'pr' }
    ],
    datos: [
      { es: 'Dijo: «Quiero escuchar al coquí por la noche».', ic: '🐸🌙', ref: '¿Quedamos?', en: 'The coquí frog sings at night in Puerto Rico.' },
      { es: 'Quería comer una piragua de tamarindo.', ic: '🍧', ref: '¿Quedamos?', en: 'Piraguas are Puerto Rico’s shaved ice.' },
      { es: 'Quería volar una chiringa en el césped de un fuerte.', ic: '🪁', ref: '¿Quedamos?', en: 'In Puerto Rico a kite is a chiringa, flown on the lawn of El Morro.' }
    ],
    wit: [
      { name: 'Don Wilfredo', role: 'vende piraguas', look: { skin: '#9A6448', hairC: '#C9C3D3', style: 'short', shirtC: '#F2C230', age: 62 } },
      { name: 'Yadira', role: 'guía de El Morro', look: { skin: '#C48A66', hairC: '#2B1D17', style: 'curly', shirtC: '#2F6F7A', fem: true, age: 33 } },
      { name: 'Luis', role: 'toca el tambor de bomba', look: { skin: '#5E3A2A', hairC: '#1E1620', style: 'bald', shirtC: '#E8505B', beard: true, age: 40 } }
    ],
    archivo: {
      title: 'San Juan y El Morro', year: '1539', event: 'Empiezan a construir El Morro en San Juan.',
      short: ['En 1508, Juan Ponce de León fundó Caparra, el primer pueblo español de Puerto Rico.', 'En 1539 empezaron a construir El Morro, un fuerte enorme para proteger la bahía.', 'El Viejo San Juan tiene calles azules y casas de colores.'],
      long: 'Antes de los españoles, en la isla vivían los taínos, que la llamaban Borikén; de ahí viene la palabra «boricua». En 1508, Ponce de León fundó Caparra, y en 1521 la ciudad se mudó a la pequeña isla de San Juan. Puerto Rico era la puerta del Caribe, y por eso España construyó murallas y fuertes: El Morro (desde 1539) y San Cristóbal. Ingleses y holandeses atacaron la ciudad varias veces. Hoy los fuertes y el Viejo San Juan son Patrimonio de la Humanidad. Desde 1898, Puerto Rico está unido a Estados Unidos, pero su cultura y su lengua siguen siendo muy hispanas.',
      en: 'The Taíno called the island Borikén (hence “boricua”). Ponce de León founded Caparra in 1508; the city moved to San Juan islet in 1521. Spain fortified this “gateway to the Caribbean” with El Morro (from 1539) and San Cristóbal, which held off English and Dutch attacks. Since 1898 Puerto Rico has been tied to the United States, but its culture remains deeply Hispanic.'
    },
    letter: 'Aquí vivió Ponce de León, el primer gobernador de la isla. Desde las garitas de El Morro, los soldados miraban el mar día y noche.',
    gems: [
      { id: 'taino', title: 'Palabras taínas', es: 'Huracán, hamaca, canoa: palabras taínas.', en: 'The Taíno people of the Caribbean gave Spanish (and English) words like huracán (hurricane), hamaca (hammock), canoa (canoe), barbacoa (barbecue) and tabaco.' },
      { id: 'mofongo', title: 'El mofongo', es: 'El mofongo es de plátano verde con ajo.', en: 'Fried green plantain mashed with garlic and pork crackling in a wooden pilón. It comes from West African fufu, brought to the island by enslaved Africans and kept alive by their descendants.' }
    ],
    remember: { q: 'En Puerto Rico, ¿qué es el coquí?', opts: ['Una rana pequeña que canta de noche', 'Un postre de coco', 'Un baile'], ref: '¿Quedamos?' }
  },

  oaxaca: {
    name: 'Oaxaca', country: 'México', ll: [-96.7, 17.1], lbl: [-8, 16], flag: 'mx', hola: '¡Buenas!',
    sym: 'jicara', symName: 'el sello de la jícara', puzzle: 'pick', pick: 'mole',
    clues: [
      { es: 'Quería ver las ruinas zapotecas de Monte Albán.', ic: '🛕⛰️' },
      { es: 'Habló de una ciudad en el sur de México donde mucha gente habla zapoteco o mixteco.', ic: '🇲🇽🗣️' },
      { es: 'Quería ver la Guelaguetza, una gran fiesta de bailes en julio.', ic: '💃🎉' }
    ],
    datos: [
      { es: 'Compró chapulines… ¡para comer!', ic: '🦗🌶️', ref: 'El mercado', en: 'Chapulines are toasted grasshoppers from Oaxaca.' },
      { es: 'Quería probar los siete moles.', ic: '🍲7️⃣', ref: 'El mercado', en: 'Oaxaca is the land of the seven moles.' },
      { es: 'Quería beber tejate en una jícara.', ic: '🥥', ref: 'El mercado', en: 'Tejate is an ancient Zapotec drink served in a gourd bowl.' }
    ],
    wit: [
      { name: 'Abuela Chayo', role: 'cocinera, la abuela de Tomás', look: { skin: '#9C6650', hairC: '#C9C3D3', style: 'long', shirtC: '#9B4F7E', fem: true, age: 72 } },
      { name: 'Tomás', role: 'el sobrino de Don Manuel', look: { skin: '#A86E50', hairC: '#1E1620', style: 'short', shirtC: '#3E6E9E', age: 16 } },
      { name: 'Doña Rufina', role: 'vende tejate en el mercado', look: { skin: '#8E5A44', hairC: '#1E1620', style: 'long', shirtC: '#E9A93A', fem: true, age: 50 } }
    ],
    archivo: {
      title: 'Monte Albán y Oaxaca', year: '500 a. C.', event: 'Los zapotecas fundan Monte Albán en la cima de una montaña.',
      short: ['Hace unos 2500 años, los zapotecas construyeron Monte Albán en la cima de una montaña.', 'Fue una de las primeras ciudades grandes de América.', 'Hoy, en Oaxaca, viven dieciséis pueblos indígenas, y muchas personas hablan zapoteco o mixteco.'],
      long: 'Hacia el año 500 antes de Cristo, los zapotecas allanaron la cima de una montaña y construyeron Monte Albán: plazas, pirámides, un juego de pelota y un observatorio. En sus piedras hay figuras llamadas «los danzantes» y algunos de los primeros textos escritos de América. La ciudad tuvo más de mil años de historia. En 1932, en la Tumba 7, el arqueólogo Alfonso Caso encontró un tesoro mixteco de oro, jade y turquesa. La ciudad de Oaxaca, con sus iglesias de piedra verde, y Monte Albán son Patrimonio de la Humanidad desde 1987. Cada julio, en la Guelaguetza, las comunidades de las ocho regiones de Oaxaca comparten sus bailes, su ropa y su comida.',
      en: 'Around 500 BC the Zapotecs levelled a mountaintop and built Monte Albán, one of the first great cities of the Americas, whose carvings include some of the earliest writing in the Americas. In 1932 Alfonso Caso found a Mixtec treasure of gold, jade and turquoise in Tomb 7. Sixteen Indigenous peoples live in Oaxaca today; each July the Guelaguetza shares their dances, dress and food.'
    },
    letter: 'En 1932 vi el tesoro de la Tumba 7 de Monte Albán. ¡Oro de verdad! Pero no era de Cíbola: era de los mixtecos.',
    gems: [
      { id: 'danzantes', title: 'Los danzantes', es: 'Estas figuras de piedra tienen más de dos mil años.', en: 'The carved stones at Monte Albán are called los danzantes (the dancers), though archaeologists now think many show captives. Some include early Zapotec glyphs, among the oldest writing in the Americas.' },
      { id: 'guelaguetza', title: 'La Guelaguetza', es: '«Guelaguetza» quiere decir «compartir».', en: 'In Zapotec, guelaguetza means sharing, a gift given and returned. Every July, groups from Oaxaca’s eight regions dance on the Cerro del Fortín and throw fruit and bread to the crowd.' }
    ],
    remember: { q: 'En el mercado de Oaxaca venden chapulines. ¿Qué son?', opts: ['Saltamontes tostados', 'Chiles verdes pequeños', 'Pan dulce'], ref: 'El mercado' }
  },

  madrid: {
    name: 'Madrid', country: 'España', ll: [-3.7, 40.4], lbl: [-10, -10], flag: 'es', hola: '¡Hola, majo!',
    sym: 'oso', symName: 'el sello del oso', puzzle: 'grid', grid: 'madrid',
    clues: [
      { es: 'Quería visitar el Museo del Prado y ver Las Meninas.', ic: '🖼️👑' },
      { es: 'Habló de la capital de España, en el centro del país.', ic: '🇪🇸📍' },
      { es: 'Quería ver el Kilómetro Cero, en la Puerta del Sol.', ic: '0️⃣🛣️' }
    ],
    datos: [
      { es: 'Dijo: «Mis abuelos y mis padres son de allí… ¡soy un gato!».', ic: '🐈', ref: '¿Moda o no moda?', en: 'People from Madrid (for generations) are called gatos.' },
      { es: 'Quería ver la estatua del oso y el madroño.', ic: '🐻🌳', ref: '¿Moda o no moda?', en: 'The bear and the strawberry tree are the symbol of Madrid.' },
      { es: 'Quería comprar ropa vieja en el Rastro el domingo.', ic: '🛍️', ref: '¿Moda o no moda?', en: 'El Rastro is Madrid’s Sunday flea market.' }
    ],
    wit: [
      { name: 'Nerea', role: 'tiene una tienda de ropa de segunda mano', look: { skin: '#E3B48E', hairC: '#3B2419', style: 'long', shirtC: '#7A5BD0', fem: true, age: 28 } },
      { name: 'Doña Carmen', role: 'la abuela de Nerea, costurera', look: { skin: '#E0AE8A', hairC: '#C9C3D3', style: 'curly', shirtC: '#2F3A6B', fem: true, glasses: true, age: 75 } },
      { name: 'Iker', role: 'amigo de Nerea', look: { skin: '#E8B894', hairC: '#6B4A2B', style: 'short', shirtC: '#3E8E7E', age: 17 } }
    ],
    archivo: {
      title: 'Madrid, la capital', year: '1561', event: 'Felipe II hace de Madrid la capital de España.',
      short: ['En 1561, el rey Felipe II llevó la corte a Madrid. Así Madrid se convirtió en la capital.', 'En el Museo del Prado hay cuadros de Velázquez, Goya y El Greco.', 'Las Meninas, de Velázquez, es de 1656. ¡El pintor está dentro del cuadro!'],
      long: 'Madrid era una villa pequeña con una fortaleza árabe, Mayrit. En 1561, Felipe II, rey de un imperio enorme, llevó la corte a Madrid, en el centro de la península. En los archivos de España se guardan miles de documentos de las expediciones: mapas, cartas y diarios, también los de Coronado, que escribió que las siete ciudades eran siete pueblos pequeños. El Museo del Prado abrió en 1819. En Las Meninas (1656), Velázquez se pintó a sí mismo trabajando, junto a la infanta Margarita, y en un espejo al fondo se ven el rey y la reina. ¿Qué está pintando? Nadie lo sabe con seguridad.',
      en: 'Madrid (Arabic Mayrit) was a small town until Felipe II moved the court there in 1561. Spain’s archives keep thousands of maps, letters and diaries from the expeditions, including Coronado’s report that the Seven Cities were seven small villages. The Prado opened in 1819; in Velázquez’s Las Meninas (1656) the painter shows himself at work, with the king and queen reflected in a mirror.'
    },
    letter: 'En los archivos leí la carta de Coronado. Escribió que las siete ciudades eran siete pueblos pequeños. ¡Qué decepción para él!',
    gems: [
      { id: 'kmcero', title: 'El Kilómetro Cero', es: 'Las carreteras de España empiezan aquí.', en: 'A plaque in the pavement of the Puerta del Sol marks Kilómetro Cero, the point from which Spain’s national roads are measured.' },
      { id: 'uvas', title: 'Las doce uvas', es: 'En Nochevieja comemos doce uvas, una con cada campanada.', en: 'On New Year’s Eve, people all over Spain eat twelve grapes, one for each chime of the clock of the Puerta del Sol at midnight, shown live on TV.' }
    ],
    remember: { q: 'En Madrid, ¿quién es un «gato»?', opts: ['Una persona de Madrid de toda la vida', 'Un turista', 'Un ladrón'], ref: '¿Moda o no moda?' }
  },

  buenosaires: {
    name: 'Buenos Aires', country: 'Argentina', ll: [-58.4, -34.6], lbl: [10, 2], flag: 'ar', hola: '¿Qué hacés?',
    sym: 'bandoneon', symName: 'el sello del bandoneón', puzzle: 'pick', pick: 'colectivo',
    clues: [
      { es: 'Quería bailar tango en la capital de Argentina.', ic: '💃🕺' },
      { es: 'Habló de una bandera celeste y blanca, con un sol.', ic: '☀️', flag: 'ar' },
      { es: 'Quería ir al Teatro Colón, un teatro de ópera enorme.', ic: '🎭🎶' }
    ],
    datos: [
      { es: 'Quería tomar mate con bombilla.', ic: '🧉', ref: '¡Gol!', en: 'Mate is a shared herbal drink in Argentina.' },
      { es: 'Quería sacar una foto del Obelisco.', ic: '🗼📷', ref: '¡Gol!', en: 'The Obelisco stands on Avenida 9 de Julio.' },
      { es: 'Quería comer un choripán con chimichurri.', ic: '🌭', ref: '¡Gol!', en: 'Choripán is grilled chorizo in bread.' }
    ],
    wit: [
      { name: 'Martina', role: 'jugadora de fútbol, la prima de Lucía', look: { skin: '#E3B48E', hairC: '#3B2419', style: 'long', shirtC: '#5FA8D3', fem: true, age: 16 } },
      { name: 'Don Beto', role: 'locutor de radio', look: { skin: '#D9A07C', hairC: '#8F8A9E', style: 'bald', shirtC: '#7A3B2A', glasses: true, age: 64 } },
      { name: 'Graciela', role: 'bailarina de tango', look: { skin: '#E8B894', hairC: '#1E1620', style: 'long', shirtC: '#C0283C', fem: true, age: 45 } }
    ],
    archivo: {
      title: 'Buenos Aires y la Ciudad de los Césares', year: '1580', event: 'Juan de Garay funda Buenos Aires por segunda vez.',
      short: ['En 1536, Pedro de Mendoza fundó Buenos Aires, pero la ciudad no duró.', 'En 1580, Juan de Garay la fundó otra vez.', 'Muchos exploradores buscaron otra ciudad mágica en el sur: la Ciudad de los Césares.'],
      long: 'La primera Buenos Aires, de 1536, sufrió hambre y guerras, y sus habitantes la abandonaron. En 1580, Juan de Garay llegó desde Asunción y la fundó de nuevo. Mientras tanto, en el sur, nacía otra leyenda: la Ciudad de los Césares, una ciudad encantada en la Patagonia, con calles de plata, que nadie puede ver. Durante unos doscientos años, expediciones desde Chile y Argentina la buscaron. Buenos Aires creció como puerto: entre 1880 y 1930 llegaron millones de inmigrantes de Italia, España y otros países, y en los barrios del puerto nació el tango. En 1810, con la Revolución de Mayo, empezó el camino a la independencia, declarada el 9 de julio de 1816.',
      en: 'Pedro de Mendoza’s Buenos Aires (1536) was abandoned; Juan de Garay refounded it in 1580. Meanwhile explorers from Chile and Argentina spent about two centuries searching Patagonia for the enchanted City of the Caesars. Between 1880 and 1930 millions of immigrants arrived, mostly from Italy and Spain, and tango was born in the port neighbourhoods. Independence followed the May Revolution of 1810 and was declared on 9 July 1816.'
    },
    letter: 'En Buenos Aires me hablaron de otra ciudad mágica: la Ciudad de los Césares, con calles de plata. ¡Todas las leyendas buscan una ciudad de oro o de plata!',
    gems: [
      { id: 'colon', title: 'El Teatro Colón', es: 'El Teatro Colón abrió en 1908.', en: 'One of the great opera houses of the world, famous for its acoustics, opened in 1908.' },
      { id: 'plata', title: 'Argentina y la plata', es: '«Argentina» viene de «argentum»: plata, en latín.', en: 'The name Argentina comes from the Latin argentum, silver, and the Río de la Plata is the “River of Silver”: early explorers hoped it led to a mountain of silver.' }
    ],
    remember: { q: 'En Argentina te ofrecen mate. Ya no quieres más. ¿Qué dices?', opts: ['«Gracias»', '«Otro, por favor»', '«¡Qué rico!»'], ref: '¡Gol!' }
  },

  cusco: {
    name: 'Cusco', country: 'Perú', ll: [-72.0, -13.5], lbl: [10, 2], flag: 'pe', hola: '¡Allillanchu!',
    sym: 'nudo', symName: 'el sello del nudo', puzzle: 'quipu',
    clues: [
      { es: 'Quería ver la antigua capital de los incas.', ic: '🏔️🏛️' },
      { es: 'Habló de una ciudad en los Andes, a 3400 metros. ¡Allí cuesta respirar!', ic: '⛰️😮‍💨' },
      { es: 'Habló de una bandera roja, blanca y roja, con franjas verticales.', ic: '🏳️', flag: 'pe' }
    ],
    datos: [
      { es: 'Quería tomar el tren a Machu Picchu.', ic: '🚂⛰️', ref: 'Conexión perdida', en: 'Machu Picchu is reached by train from near Cusco.' },
      { es: 'Aprendió palabras en quechua: papa, cancha, cóndor.', ic: '🥔🦅', ref: 'Conexión perdida', en: 'Quechua, the language of the Inca, gave Spanish many words.' },
      { es: 'Quería ver volar un cóndor sobre las montañas.', ic: '🦅⛰️', ref: 'Conexión perdida', en: 'The Andean condor is a symbol of the Andes.' }
    ],
    wit: [
      { name: 'Wayra', role: 'guía; habla quechua y español', look: { skin: '#9C6650', hairC: '#1E1620', style: 'long', shirtC: '#C0283C', fem: true, age: 27 } },
      { name: 'Doña Ermelinda', role: 'la señora del aeropuerto de Lima', look: { skin: '#B98068', hairC: '#C9C3D3', style: 'curly', shirtC: '#3E6E9E', fem: true, glasses: true, age: 70 } },
      { name: 'Ronald', role: 'vende choclo con queso', look: { skin: '#A06A54', hairC: '#1E1620', style: 'short', shirtC: '#E9A93A', age: 30 } }
    ],
    archivo: {
      title: 'Cusco, la capital de los incas', year: '1450', event: 'Los incas construyen Machu Picchu (hacia 1450).',
      short: ['Cusco era la capital del imperio inca. En quechua, «Qusqu» quiere decir «centro» u «ombligo».', 'Hacia 1450, los incas construyeron Machu Picchu.', 'Los incas no escribían con letras: usaban quipus, cuerdas con nudos, para contar.'],
      long: 'El imperio inca, el Tawantinsuyu, iba desde Ecuador hasta Chile y Argentina. Pachacútec, que gobernó desde 1438, transformó Cusco y mandó construir Machu Picchu. Los incas unieron el imperio con el Qhapaq Ñan, una red de caminos de unos treinta mil kilómetros, y los chasquis corrían con mensajes de un puesto a otro. Para guardar números —personas, llamas, cosechas— usaban quipus: cuerdas de colores con nudos, que leían los quipucamayocs. Los españoles construyeron el convento de Santo Domingo sobre el Coricancha, el templo del Sol, y todavía se ven los muros incas. Después nació la leyenda de Paititi, una ciudad inca perdida en la selva, llena de oro. Nadie la ha encontrado.',
      en: 'Cusco (“centre” or “navel” in Quechua) was the capital of the Inca Empire, which ran from Ecuador to Chile. Pachacútec rebuilt the city and had Machu Picchu built around 1450. A road network of some 30,000 km (Qhapaq Ñan) joined the empire, and quipus, knotted coloured cords, recorded numbers. The Santo Domingo convent stands on the walls of the Coricancha. Paititi, a lost Inca city of gold, has never been found.'
    },
    letter: 'En Cusco aprendí a leer un quipu. Me hablaron de Paititi, una ciudad inca de oro en la selva. ¡Otra ciudad que nadie encuentra!',
    gems: [
      { id: 'chasqui', title: 'Los chasquis', es: 'Los chasquis corrían con mensajes por los caminos incas.', en: 'Relay runners on the Inca roads passed messages and quipus from post to post; a message could travel well over 200 km in a day.' },
      { id: 'coricancha', title: 'El Coricancha', es: 'El convento está encima del templo inca.', en: 'The walls of the Coricancha, the Inca temple of the Sun, were covered in gold. The Spanish built the convent of Santo Domingo on top, and in earthquakes the Inca stonework has held better than the colonial walls.' }
    ],
    remember: { q: '¿Qué palabra viene del quechua?', opts: ['cóndor', 'mesa', 'ciudad'], ref: 'Conexión perdida' }
  },

  antigua: {
    name: 'Antigua', country: 'Guatemala', ll: [-90.7, 14.6], lbl: [-14, 14], flag: 'gt', hola: '¡Qué tal, vos!',
    sym: 'volcan', symName: 'el sello del volcán', puzzle: 'grid', grid: 'antigua',
    clues: [
      { es: 'Habló de una ciudad colonial entre tres volcanes.', ic: '🌋🌋🌋' },
      { es: 'Habló de una bandera azul y blanca, con un pájaro verde: el quetzal.', ic: '🐦', flag: 'gt' },
      { es: 'Quería ver las alfombras de flores y aserrín de Semana Santa.', ic: '🌺🟪' }
    ],
    datos: [
      { es: 'Quería pasar debajo del arco amarillo donde las monjas cruzaban la calle sin ser vistas.', ic: '🟨⛪', ref: 'Noche de leyendas', en: 'The Arco de Santa Catalina is in Antigua, Guatemala.' },
      { es: 'Quería subir a una camioneta: un viejo bus escolar pintado de colores.', ic: '🚌🎨', ref: 'Noche de leyendas', en: 'Guatemala’s chicken buses are old US school buses.' },
      { es: 'Dijo: «Allí el Volcán de Agua se ve desde todas las calles».', ic: '🌋', ref: 'Noche de leyendas', en: 'The Volcán de Agua towers over Antigua.' }
    ],
    wit: [
      { name: 'Don Chepe', role: 'cuentacuentos', look: { skin: '#9A6448', hairC: '#C9C3D3', style: 'short', shirtC: '#5B5F80', beard: true, age: 68 } },
      { name: 'Doña Tere', role: 'vende rellenitos', look: { skin: '#A86E50', hairC: '#1E1620', style: 'long', shirtC: '#B5397A', fem: true, age: 48 } },
      { name: 'Brayan', role: 'maneja un tuk-tuk', look: { skin: '#B07656', hairC: '#1E1620', style: 'short', shirtC: '#E8505B', age: 21 } }
    ],
    archivo: {
      title: 'Antigua Guatemala', year: '1543', event: 'Fundan la nueva capital, hoy Antigua, en el valle de Panchoy.',
      short: ['En 1541, una inundación del Volcán de Agua destruyó la primera capital.', 'En 1543 fundaron la nueva capital en el valle de Panchoy: hoy se llama Antigua.', 'En 1773 hubo terremotos terribles, y la capital se fue a la Ciudad de Guatemala.'],
      long: 'En 1541, doña Beatriz de la Cueva se convirtió en gobernadora: fue la primera mujer en gobernar una provincia española en América. Pocos días después, el agua y el lodo bajaron del volcán y destruyeron la ciudad. Los sobrevivientes fundaron una nueva capital en 1543. Santiago de los Caballeros fue durante más de doscientos años la capital de un territorio que iba desde Chiapas hasta Costa Rica, con universidad, imprenta y decenas de iglesias y conventos. Después de los terremotos de 1773, la capital se mudó, y la vieja ciudad empezó a llamarse «la Antigua». Hoy es Patrimonio de la Humanidad, y en Semana Santa las familias hacen alfombras de aserrín de colores y flores para las procesiones.',
      en: 'A flood from the Volcán de Agua destroyed the first capital in 1541, days after Beatriz de la Cueva became the first woman to govern a Spanish province in the Americas. The new capital (1543) governed a region from Chiapas to Costa Rica for over two centuries, with a university and a printing press. After the 1773 earthquakes the capital moved and the old city became “la Antigua”. In Holy Week families make carpets of coloured sawdust and flowers for the processions.'
    },
    letter: 'Un cuentacuentos me contó la historia de doña Beatriz y del volcán. En Antigua, cada calle tiene una leyenda.',
    gems: [
      { id: 'quetzal', title: 'El quetzal', es: 'El quetzal es el pájaro nacional… ¡y también el dinero!', en: 'The resplendent quetzal, with its long green tail feathers, was sacred to the Maya. Guatemala’s currency is also called the quetzal.' },
      { id: 'alfombras', title: 'Las alfombras', es: 'Las alfombras son de aserrín y flores.', en: 'For the Holy Week processions, families work through the night making carpets of dyed sawdust, flowers and fruit on the street; the procession walks over them in the morning.' }
    ],
    remember: { q: 'En Antigua, ¿para qué construyeron el Arco de Santa Catalina?', opts: ['Para que las monjas cruzaran la calle sin ser vistas', 'Para ver los volcanes', 'Para el mercado'], ref: 'Noche de leyendas' }
  },

  puertoviejo: {
    name: 'Puerto Viejo', country: 'Costa Rica', ll: [-82.75, 9.65], lbl: [8, 12], flag: 'cr', hola: '¡Pura vida!',
    sym: 'tortuga', symName: 'el sello de la tortuga', puzzle: 'timeline', timeline: 'puertoviejo',
    clues: [
      { es: 'Quería ver tortugas en una playa del Caribe.', ic: '🐢🏖️' },
      { es: 'Habló de un país que no tiene ejército desde 1948.', ic: '🕊️' },
      { es: 'Habló de una bandera azul, blanca y roja, con una franja roja ancha en el medio.', ic: '🏳️', flag: 'cr' }
    ],
    datos: [
      { es: 'Decía «¡Pura vida!» todo el tiempo.', ic: '🤙', ref: 'La farmacia de guardia', en: '¡Pura vida! is Costa Rica’s favourite expression.' },
      { es: 'Quería ver un perezoso en un árbol.', ic: '🦥🌳', ref: 'La farmacia de guardia', en: 'Sloths live on Costa Rica’s Caribbean coast.' },
      { es: 'Quería comer un patí picante.', ic: '🥟🌶️', ref: 'La farmacia de guardia', en: 'The patí is a spicy pastry from Limón.' }
    ],
    wit: [
      { name: 'Doña Fefi', role: 'la farmacéutica', look: { skin: '#5E3A2A', hairC: '#1E1620', style: 'curly', shirtC: '#3E8E7E', fem: true, glasses: true, age: 55 } },
      { name: 'Kevin', role: 'estudiante del colegio', look: { skin: '#C48A66', hairC: '#1E1620', style: 'short', shirtC: '#5FA8D3', age: 16 } },
      { name: 'Diego', role: 'surfista', look: { skin: '#B98068', hairC: '#C9A15A', style: 'curly', shirtC: '#F2C230', age: 25 } }
    ],
    archivo: {
      title: 'Costa Rica: la costa caribeña', year: '1502', event: 'Cristóbal Colón llega a la costa de Costa Rica en su cuarto viaje.',
      short: ['En 1502, en su cuarto viaje, Cristóbal Colón llegó a esta costa.', 'Vio a gente con joyas de oro. Por eso, dicen, el país se llama «Costa Rica».', 'Después, en el siglo diecinueve, llegaron familias de Jamaica para construir el tren.'],
      long: 'En septiembre de 1502, Colón ancló cerca de la isla Uvita, frente a Limón, y se quedó unos días. La gente de la costa llevaba adornos de oro y, según la tradición, de ahí viene el nombre «Costa Rica». Pero el oro no era mucho: Costa Rica fue una colonia pobre y lejana. En la década de 1870 empezó la construcción del ferrocarril al Atlántico, y llegaron muchos trabajadores de Jamaica y de otras islas del Caribe. Sus familias trajeron el inglés criollo, el calipso y el rice and beans. En 1948, después de una guerra civil, Costa Rica abolió el ejército, y hoy protege más de una cuarta parte de su territorio en parques y reservas.',
      en: 'Columbus anchored off Uvita island near Limón in September 1502, on his fourth voyage; the gold ornaments he saw may have given Costa Rica (“rich coast”) its name, though the colony turned out poor. From the 1870s workers from Jamaica and other islands came to build the railway to the Atlantic, bringing Creole English, calypso and rice and beans. Costa Rica abolished its army in 1948 and protects over a quarter of its land.'
    },
    letter: 'Colón llegó a esta costa en 1502 y vio oro. Por eso se llama Costa Rica… pero aquí el verdadero tesoro es la selva.',
    gems: [
      { id: 'tren', title: 'El tren al Atlántico', es: 'El tren unió San José con el mar Caribe.', en: 'The railway from San José to Limón (finished in 1890) was built largely by workers from Jamaica, China and Italy. Bananas were planted along it, the start of Costa Rica’s banana industry.' },
      { id: 'uvita', title: 'La isla Uvita', es: 'Colón ancló al lado de esta isla.', en: 'In 1502, on his fourth and last voyage, Columbus’s ships anchored beside a small island off Limón, now called Isla Uvita.' }
    ],
    remember: { q: 'En Costa Rica, ¿qué quiere decir «¡Pura vida!»?', opts: ['Hola, gracias, todo bien…', '¡Cuidado!', 'Tengo hambre'], ref: 'La farmacia de guardia' }
  },

  habana: {
    name: 'La Habana', country: 'Cuba', ll: [-82.4, 23.1], lbl: [-60, 14], flag: 'cu', hola: '¿Qué bolá?',
    sym: 'galeon', symName: 'el sello del galeón', puzzle: 'route', route: 'flota',
    clues: [
      { es: 'Quería ver los coches viejos de los años cincuenta.', ic: '🚗🎨' },
      { es: 'Habló del Malecón, un paseo largo al lado del mar.', ic: '🌊🚶' },
      { es: 'Habló de una bandera con franjas azules y blancas, un triángulo rojo y una estrella.', ic: '⭐', flag: 'cu' },
      { es: 'Quería escuchar el cañonazo de las nueve de la noche.', ic: '💥🕘' }
    ],
    datos: [],
    wit: [
      { name: 'Yunior', role: 'taxista de un coche viejo', look: { skin: '#8E5A44', hairC: '#1E1620', style: 'short', shirtC: '#E8505B', age: 34 } },
      { name: 'Doña Mercedes', role: 'guía del castillo del Morro', look: { skin: '#C48A66', hairC: '#C9C3D3', style: 'curly', shirtC: '#2F6F7A', fem: true, age: 63 } },
      { name: 'Lázaro', role: 'toca el tres en un grupo de son', look: { skin: '#5E3A2A', hairC: '#1E1620', style: 'bald', shirtC: '#F4F1EA', beard: true, age: 50 } }
    ],
    archivo: {
      title: 'La Habana y la Flota de Indias', year: '1519', event: 'La villa de San Cristóbal de La Habana se muda a su lugar de hoy.',
      short: ['En 1519, la villa de San Cristóbal de La Habana se mudó a esta bahía.', 'Los barcos con plata de México y de Perú se juntaban en La Habana.', 'Después, todos juntos, cruzaban el océano hasta Sevilla. Era la Flota de Indias.'],
      long: 'La Habana tiene una de las mejores bahías del Caribe. Por eso, desde la década de 1560, los barcos de Veracruz y de Tierra Firme (Cartagena y Portobelo) se reunían aquí antes de cruzar juntos el Atlántico hasta Sevilla, con plata, oro, cacao y tabaco. Viajar juntos protegía a los barcos de los piratas y los corsarios. Para defender la bahía, España construyó el castillo del Morro y, después, La Cabaña. Todas las noches a las nueve, desde La Cabaña, se dispara un cañonazo: antes avisaba que se cerraban las puertas de la ciudad. Según la tradición, la ciudad se fundó al lado de una ceiba, y todavía hoy, cada 16 de noviembre, la gente da tres vueltas alrededor del árbol, en El Templete.',
      en: 'Havana’s superb harbour made it the meeting point of the Flota de Indias: from the 1560s the fleets from Veracruz and from Cartagena and Portobelo gathered here to cross to Seville together, safe from pirates. Spain defended the bay with El Morro and La Cabaña, where a cannon is still fired every night at nine (it once signalled the closing of the city gates). By tradition the city was founded beside a ceiba tree at El Templete; each 16 November people walk around it three times.'
    },
    letter: 'En La Habana vi los mapas de la Flota de Indias. Los barcos llevaban plata a Sevilla. ¡Mucha plata, sí, pero de las minas, no de Cíbola!',
    gems: [
      { id: 'canonazo', title: 'El cañonazo de las nueve', es: 'Todas las noches, a las nueve: ¡BUM!', en: 'Every night at 9 p.m., soldiers in eighteenth-century uniforms fire a cannon from La Cabaña, as when the shot signalled the closing of the city gates.' },
      { id: 'son', title: 'El son cubano', es: 'El son mezcla la guitarra española y los tambores africanos.', en: 'Son, from eastern Cuba, blends Spanish guitar (and the Cuban tres) with African rhythms and the clave. It is one of the roots of salsa.' }
    ]
  },

  granada: {
    name: 'Granada', country: 'España', ll: [-3.6, 37.2], lbl: [-14, 16], flag: 'es', hola: '¡Hola!',
    clues: [
      { es: 'Habló de un palacio rojo con fuentes y patios: la Alhambra.', ic: '🏰⛲' },
      { es: 'Quería ver la ciudad donde todo empezó, en 1492.', ic: '📜' },
      { es: 'Dijo: «Voy al sur de España, a Andalucía. Allí nació Elena».', ic: '🇪🇸☀️' },
      { es: 'Quería ver los doce leones de piedra de una fuente muy famosa.', ic: '🦁⛲' }
    ],
    datos: [],
    archivo: {
      title: 'Granada, 1492', year: '1492', event: 'Granada pasa a los Reyes Católicos; Colón firma su acuerdo en Santa Fe.',
      short: ['La Alhambra fue el palacio de los reyes nazaríes, los últimos reyes musulmanes de la península.', 'En enero de 1492, el rey Boabdil entregó Granada a los Reyes Católicos, Isabel y Fernando.', 'En abril de 1492, en Santa Fe, al lado de Granada, los reyes firmaron un acuerdo con Cristóbal Colón.'],
      long: 'Desde el año 711, durante casi ochocientos años, gran parte de la península ibérica fue Al-Ándalus, con ciudades como Córdoba, Sevilla y Granada, famosas por su ciencia, su poesía y su arquitectura. El reino nazarí de Granada fue el último. Sus reyes construyeron la Alhambra («la roja», en árabe): patios, fuentes, azulejos y poemas escritos en las paredes. El 2 de enero de 1492, Boabdil entregó las llaves de la ciudad a Isabel y Fernando. En abril, en Santa Fe, Colón firmó las Capitulaciones, y en agosto salió hacia el oeste. Los Reyes Católicos están enterrados en la Capilla Real de Granada. Aquí nació también el poeta Federico García Lorca.',
      en: 'From 711, for almost 800 years, much of Iberia was Al-Andalus, with cities famous for science, poetry and architecture. The Nasrid kingdom of Granada was its last state, and its kings built the Alhambra (“the red one”). On 2 January 1492 Boabdil handed the city to Isabel and Fernando; that April, at nearby Santa Fe, they signed the agreement with Columbus, who sailed in August. The Catholic Monarchs are buried in Granada’s Royal Chapel.'
    }
  }
};
const POOL = ['bogota', 'sanjuan', 'oaxaca', 'madrid', 'buenosaires', 'cusco', 'antigua', 'puertoviejo', 'habana'];

/* ---- the thief: five suspects, four features each ---- */
const FEATS = {
  pelo: { label: 'Pelo', vals: {
    rubio: { ic: '👱', es: 'pelo rubio', c: '#E8C36A', line: 'Esa persona tenía el pelo rubio, muy rubio.' },
    negro: { ic: '⚫', es: 'pelo negro', c: '#1E1620', line: 'Esa persona tenía el pelo negro.' },
    blanco: { ic: '⚪', es: 'pelo blanco', c: '#D7D0E3', line: 'Esa persona tenía el pelo blanco, como un abuelo.' },
    rojo: { ic: '🟠', es: 'pelo rojo', c: '#B5482B', line: 'Esa persona tenía el pelo rojo. ¡Muy rojo!' } } },
  acc: { label: 'Lleva', vals: {
    sombrero: { ic: '🎩', es: 'un sombrero negro', line: 'Llevaba un sombrero negro, muy elegante.' },
    gafas: { ic: '🕶️', es: 'gafas de sol', line: 'Llevaba gafas de sol… ¡incluso de noche!' },
    bufanda: { ic: '🧣', es: 'una bufanda roja', line: 'Llevaba una bufanda roja. ¡Con este calor!' },
    gorra: { ic: '🧢', es: 'una gorra', line: 'Llevaba una gorra azul.' } } },
  hobby: { label: 'Le gusta', vals: {
    tango: { ic: '💃', es: 'el tango', line: 'Me dijo: «Me encanta bailar tango».' },
    ajedrez: { ic: '♟️', es: 'el ajedrez', line: 'Jugó al ajedrez en el parque. ¡Ganó todas las partidas!' },
    foto: { ic: '📷', es: 'la fotografía', line: 'Sacó muchas fotos con una cámara grande.' },
    surf: { ic: '🏄', es: 'el surf', line: 'Llevaba una tabla de surf. Le encanta el surf.' } } },
  comida: { label: 'Come', vals: {
    ceviche: { ic: '🐟', es: 'ceviche', line: 'Pidió ceviche. Dijo: «¡Es mi comida favorita!».' },
    arepas: { ic: '🫓', es: 'arepas', line: 'Comió tres arepas. ¡Le encantan las arepas!' },
    empanadas: { ic: '🥟', es: 'empanadas', line: 'Compró una docena de empanadas.' },
    tacos: { ic: '🌮', es: 'tacos', line: 'Comió tacos. Dijo: «Como tacos todos los días».' } } }
};
const FEAT_KEYS = ['pelo', 'acc', 'hobby', 'comida'];
const SUSPECT_POOL = [
  { name: 'Víctor Saavedra', fem: false, skin: '#E0AE8A', style: 'short', shirtC: '#2B2D42' },
  { name: 'Celia Montoya', fem: true, skin: '#C48A66', style: 'long', shirtC: '#7A3B5A' },
  { name: 'Gaspar Ruiz', fem: false, skin: '#A86E50', style: 'short', shirtC: '#3E5E3A', beard: true },
  { name: 'Paloma Ibarra', fem: true, skin: '#E8B894', style: 'curly', shirtC: '#2F3A6B' },
  { name: 'Rodrigo Lanza', fem: false, skin: '#8E5A44', style: 'curly', shirtC: '#6A4020' },
  { name: 'Amparo Calvo', fem: true, skin: '#D9A07C', style: 'long', shirtC: '#5B5F80' }
];

/* ---- Elena's family: one relative stayed in each city ---- */
const FAMILY = [
  { who: 'mi hijo Pablo', was: 'Pablo' }, { who: 'mi hija Rosa', was: 'Rosa' }, { who: 'mi hijo Ernesto', was: 'Ernesto' },
  { who: 'mi hija Pilar', was: 'Pilar' }, { who: 'mi nieta Luz', was: 'Luz' }, { who: 'mi nieto Andrés', was: 'Andrés' }, { who: 'mi sobrina Inés', was: 'Inés' }
];
const STAYED = ['se enamoró de esta ciudad y se quedó aquí.', 'se casó aquí y tuvo tres hijos.', 'abrió una librería aquí.', 'enseña en una escuela de aquí.', 'trabaja aquí en el puerto.', 'se quedó aquí con su familia.', 'abrió un café aquí.'];
