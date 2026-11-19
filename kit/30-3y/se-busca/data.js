/* ============ 2 · CONTENT: postings, applicants, questions, facts ============ */
const JOBS = [
  { id: 'campamento', title: 'Monitor/a de campamento', company: 'Casal d’Estiu Els Pins', place: 'Collserola (la montaña)', color: '#2BB673',
    hours: 'Julio, de lunes a viernes, de 9:00 a 14:00', pay: '9,50 € la hora',
    req: ['Haber trabajado con niños', 'Saber tocar la guitarra o hacer manualidades', 'Hablar español y catalán'],
    desc: 'Buscamos monitores para nuestro campamento de verano en la montaña. Los niños tienen entre seis y doce años. Haremos excursiones, juegos y talleres.',
    q: ['¿En qué trabajo hay que haber trabajado con niños?', '¿Qué trabajo es en la montaña, por las mañanas?'],
    boss: { name: 'Jordi', fem: false, skin: '#E8B48E', hair: '#3B2A20', style: 'short', top: '#2BB673', beard: true } },
  { id: 'socorrista', title: 'Socorrista', company: 'Salvamento Mediterráneo', place: 'Playa de la Barceloneta', color: '#E2483D',
    hours: 'Junio a septiembre, turnos de 10:00 a 19:00', pay: '11 € la hora',
    req: ['Saber nadar muy bien', 'Tener un título de primeros auxilios', 'Haber trabajado en una piscina o en la playa'],
    desc: 'Buscamos socorristas para las playas de la ciudad. Vigilarás a los bañistas y ayudarás en las emergencias.',
    q: ['¿Para qué trabajo hay que saber nadar muy bien?', '¿Qué trabajo pide un título de primeros auxilios?'],
    boss: { name: 'Elena', fem: true, skin: '#C98B62', hair: '#1E1612', style: 'ponytail', top: '#E2483D' } },
  { id: 'chiringuito', title: 'Camarero/a', company: 'Chiringuito La Ola', place: 'Playa del Bogatell', color: '#FF9F43',
    hours: 'Noches y fines de semana, de 19:00 a 1:00', pay: '10 € la hora + propinas',
    req: ['Haber trabajado de camarero/a', 'Saber preparar cafés y zumos', 'Hablar inglés'],
    desc: 'Chiringuito en la playa busca camareros para el verano. Mucho trabajo, buen ambiente y música en directo los sábados.',
    q: ['¿Qué trabajo es por la noche y los fines de semana?', '¿En qué trabajo hay que saber preparar cafés y zumos?'],
    boss: { name: 'Toni', fem: false, skin: '#D9A07A', hair: '#B9B9C0', style: 'bald', top: '#FF9F43', glasses: true } },
  { id: 'bici', title: 'Guía turístico/a en bici', company: 'Rueda Libre Tours', place: 'Barrio Gótico', color: '#3D7BE0',
    hours: 'Tours a las 10:00 y a las 17:00', pay: '10,50 € la hora',
    req: ['Conocer bien los barrios de Barcelona', 'Saber mucho de historia', 'Hablar inglés y español'],
    desc: 'Enseña Barcelona a los turistas en bicicleta: el Barrio Gótico, el Born y el puerto. Cada tour dura tres horas.',
    q: ['¿Para qué trabajo hay que conocer bien los barrios de Barcelona?', '¿En qué trabajo hay que saber mucho de historia?'],
    boss: { name: 'Marta', fem: true, skin: '#F0C7A4', hair: '#B5562E', style: 'long', top: '#3D7BE0', earrings: true } },
  { id: 'tienda', title: 'Dependiente/a', company: 'La Tienda del Modernismo', place: 'Passeig de Gràcia', color: '#9B5DE5',
    hours: 'Tardes, de 16:00 a 21:00', pay: '9,50 € la hora',
    req: ['Saber usar la caja', 'Conocer la obra de Gaudí', 'Hablar inglés y francés'],
    desc: 'Tienda de recuerdos y libros de arte busca dependiente para la temporada de verano. Atenderás a turistas de todo el mundo.',
    q: ['¿Qué trabajo pide conocer la obra de Gaudí?', '¿En qué trabajo hay que saber usar la caja?'],
    boss: { name: 'Pilar', fem: true, skin: '#E3A981', hair: '#C9C9CF', style: 'bun', top: '#9B5DE5', glasses: true } },
  { id: 'cocina', title: 'Ayudante de cocina', company: 'Bar Rosa, en La Boqueria', place: 'La Rambla', color: '#E05297',
    hours: 'De martes a sábado, de 7:00 a 13:00', pay: '9,80 € la hora',
    req: ['Saber cocinar', 'Haber trabajado en una cocina', 'Conocer los productos del mercado'],
    desc: 'Pequeño bar dentro del mercado busca ayudante de cocina. Preparamos desayunos y tapas para la gente del mercado y para los turistas.',
    q: ['¿Qué trabajo empieza a las siete de la mañana?', '¿En qué trabajo hay que saber cocinar?'],
    boss: { name: 'Rosa', fem: true, skin: '#B97A55', hair: '#2A1C14', style: 'curly', top: '#E05297' } },
];
const JOB = id => JOBS.find(j => j.id === id);

/* one applicant per job; four are chosen each game, so the other two postings are decoys */
const APPLICANTS = [
  { id: 'aina', name: 'Aina', job: 'campamento', fem: true, skin: '#F2C6A0', hair: '#5A3A22', pitch: 1.18, rate: 1.0,
    note: ['¡Hola! Me llamo Aina y tengo diecisiete años.', 'He trabajado de canguro con los niños de mis vecinos durante dos años.', 'Sé tocar la guitarra y me encanta hacer manualidades.', 'El verano pasado ayudé en las colonias de mi escuela.', 'Este verano solo puedo trabajar por las mañanas, porque por las tardes estudiaré inglés.'] },
  { id: 'marc', name: 'Marc', job: 'socorrista', fem: false, skin: '#E0AC85', hair: '#2B1D16', pitch: .9, rate: 1.0,
    note: ['Buenas, soy Marc.', 'Nado desde los seis años y sé nadar muy bien: he ganado tres competiciones.', 'El año pasado hice un curso de primeros auxilios.', 'He trabajado dos veranos en la piscina de mi barrio.', 'Este verano quiero estar al aire libre, cerca del mar.'] },
  { id: 'lucas', name: 'Lucas', job: 'chiringuito', fem: false, skin: '#8D5A3B', hair: '#17110E', pitch: .95, rate: 1.04,
    note: ['¿Qué tal? Soy Lucas.', 'He trabajado de camarero en el restaurante de mis tíos.', 'Sé preparar cafés, zumos y batidos.', 'Hablo inglés bastante bien, porque viví un año en Irlanda.', 'No me importa trabajar por la noche ni los fines de semana.'] },
  { id: 'valeria', name: 'Valeria', job: 'bici', fem: true, skin: '#E8B48E', hair: '#1E1612', pitch: 1.1, rate: 1.02,
    note: ['¡Hola! Soy Valeria y soy de Barcelona.', 'Conozco muy bien el Barrio Gótico y el Born: he vivido allí toda mi vida.', 'Me encanta la historia: el año pasado gané un concurso de historia en el instituto.', 'Voy en bici a todas partes.', 'Hablo español, catalán e inglés.'] },
  { id: 'nuria', name: 'Nuria', job: 'tienda', fem: true, skin: '#F0C7A4', hair: '#8A5A2B', pitch: 1.05, rate: .98,
    note: ['Hola, me llamo Nuria.', 'He trabajado en una librería, así que sé usar la caja.', 'Conozco bien la obra de Gaudí: el año pasado visité la Sagrada Familia, la Casa Batlló y el Park Güell.', 'Hablo inglés y un poco de francés.', 'Por las mañanas tengo clases, así que prefiero trabajar por las tardes.'] },
  { id: 'omar', name: 'Omar', job: 'cocina', fem: false, skin: '#B97A55', hair: '#17110E', pitch: .85, rate: .98,
    note: ['Buenos días, soy Omar.', 'Me encanta cocinar: sé hacer paella, tortilla y croquetas.', 'He trabajado en la cocina de un hotel en Tarragona.', 'Conozco bien el mercado, porque voy cada sábado con mi abuela.', 'Me levanto muy temprano. ¡No hay problema!'] },
];

/* saber vs conocer sort: drawn from what the applicants said */
const SC_ITEMS = [
  ['nadar muy bien', 's'], ['tocar la guitarra', 's'], ['usar la caja', 's'], ['preparar cafés y zumos', 's'], ['hacer paella', 's'], ['mucho de historia', 's'], ['dónde está la playa', 's'], ['que el trabajo empieza a las siete', 's'],
  ['el Barrio Gótico', 'c'], ['la obra de Gaudí', 'c'], ['el mercado de La Boqueria', 'c'], ['a los niños de mis vecinos', 'c'], ['Barcelona muy bien', 'c'], ['a mucha gente en el barrio', 'c'], ['la playa de la Barceloneta', 'c'], ['a la directora del campamento', 'c'],
];

const GEMS = [
  { id: 'sagrada', t: 'La Sagrada Familia', es: 'Antoni Gaudí trabajó en la Sagrada Familia más de cuarenta años, hasta su muerte en 1926. Está enterrado en la cripta de la basílica.', en: 'Gaudí worked on the Sagrada Família for over forty years, until his death in 1926, and is buried in its crypt.' },
  { id: 'catalan', t: 'Bon dia!', es: 'En Barcelona se hablan el catalán y el castellano, y las dos son lenguas oficiales. «Bon dia» es «buenos días» en catalán.', en: 'Barcelona is bilingual: Catalan and Spanish (Castilian) are both official. “Bon dia” means “good morning” in Catalan.' },
  { id: 'playa', t: 'Las playas de 1992', es: 'Para los Juegos Olímpicos de 1992, Barcelona renovó su costa y creó nuevas playas. Hoy la ciudad tiene más de cuatro kilómetros de playa.', en: 'For the 1992 Olympic Games, Barcelona rebuilt its waterfront and created new beaches; the city now has over four kilometres of them.' },
  { id: 'boqueria', t: 'La Boqueria', es: 'El Mercado de La Boqueria, en La Rambla, es uno de los mercados más famosos de Europa: fruta, pescado, jamón… ¡y pequeños bares para desayunar!', en: 'La Boqueria market, off La Rambla, is one of Europe’s best-known food markets, with fruit, fish, ham and little counter bars.' },
  { id: 'horario', t: '¿A qué hora se come?', es: 'En España se come tarde: mucha gente almuerza entre las dos y las tres, y cena a las nueve o a las diez de la noche.', en: 'Spain eats late: lunch is often between 2 and 3 pm, and dinner at 9 or 10 pm.' },
  { id: 'santjordi', t: 'Sant Jordi', es: 'El 23 de abril, día de Sant Jordi, en Cataluña la gente se regala libros y rosas. Las calles se llenan de puestos de libros.', en: 'On 23 April, Sant Jordi’s Day, people in Catalonia give each other books and roses, and the streets fill with book stalls.' },
];
