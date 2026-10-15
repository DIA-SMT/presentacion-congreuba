// =====================================================================
// CONTENIDO EDITABLE DE LA PRESENTACIÓN (UBA · 16/10/2026)
// "La IA como servicio público": las frases de Migue, las preguntas en vivo
// y los proyectos. Los textos de las placas están en index.html.
// Números: los de cada sistema al 14/10/2026 (revisar el día del panel).
// =====================================================================
window.CONTENIDO = {

  // Lo que dice Migue, en orden: cada toque de "MIGUE HABLA" dice el próximo.
  // Con archivo: null lo dice con un globo de texto (hasta que haya video).
  // Videos de cuerpo entero sobre verde, 896×1024 (los del lanzamiento de Migue).
  FORMATO_MIGUE: 'cuerpo',
  VIDEOS: [
    { archivo: null, texto: 'Saludo al panel', sub: '¡Buenas! Vengo desde Tucumán. Atiendo las 24 horas… y sin turno.' },
    { archivo: 'media/migue2.mp4', texto: 'Vos me contás qué te pasa', sub: 'Vos me contás qué te pasa. Yo intento entender qué necesitás.' },
    { archivo: 'media/migue4.mp4', texto: 'Entiendo, organizo, busco y ayudo', sub: 'Yo entiendo, organizo, busco… y ayudo.' },
    { archivo: 'media/migue14.mp4', texto: '¡Gracias! Nos vemos en la ciudad', sub: '¡Muchas gracias a todos! Y ahora sí… nos vemos en la ciudad.' },
  ],

  // Preguntale a Migue, en vivo: la respuesta es la del chat real de Migue
  // (api/preguntar.js). Salen como botones en la botonera; también se puede
  // escribir otra desde el celular. Probadas contra el chat real el 14/10/2026:
  // "¿regularon la IA?" y la fecha del Presupuesto Participativo NO las sabe
  // por esta vía (responde que no tiene la info), por eso no están.
  PREGUNTAS: [
    'Hay un bache enorme en mi cuadra, ¿dónde lo reclamo?',
    '¿Hay algún corte de tránsito hoy?',
    '¿Cómo saco la licencia de conducir por primera vez?',
    '¿Cómo habilito un negocio?',
  ],

  // Los proyectos. El orden cuenta la historia: primero lo que usamos adentro,
  // después lo que llevamos al vecino. Cada uno arranca con 'ps' (problema → solución):
  //   problema: [ícono, frase corta] · solucion: { n, t, g? } (g: 'dona' | 'barras', de, a)
  // Otros recursos: 'web' (captura en ventana de navegador; scroll: true la recorre),
  // 'cel', 'par' (navegador + celular), 'vivo' (Preguntale a Migue), 'avance'
  // (CIMBA, datos/cimba-avance.js) y 'kpis' (tablero con números que cuentan).
  // En "url" va lo que se lee en la barra del navegador: nunca una dirección de Vercel.
  PROYECTOS: [
    // ---------------------------------------------------------------- PUERTAS ADENTRO
    {
      id: 'notas', num: '01', eje: 'Puertas adentro', nombre: 'Generador de Notas',
      idea: 'Lenguaje claro, con criterio', corta: 'La IA redacta, la persona firma.',
      estado: 'En funcionamiento',
      cifras: [['10', 'tipos de nota'], ['100%', 'con firma humana']],
      recursos: [
        { tipo: 'ps', titulo: 'El mismo criterio en todas las áreas',
          problema: [['✍️', 'Cada área escribía a su manera'], ['📄', 'Notas largas y poco claras'], ['🤔', 'Desconfianza en la IA']],
          solucion: [{ n: '10', t: 'tipos de nota con el mismo criterio' }, { n: 'Lenguaje claro', t: 'para cada repartición' }, { n: 'IA + firma', t: 'la IA redacta, la persona revisa y firma' }],
          conecta: 'Dictado por voz · padrón de áreas y cargos · pedido, pase, intimación, dictamen' },
        { tipo: 'web', src: 'img/capturas/generador/formulario.jpg', url: 'Generador de Notas · Dirección de IA', titulo: 'Contalo con tus palabras' },
      ],
    },
    {
      id: 'capital', num: '02', eje: 'Puertas adentro', nombre: 'Capital Humano',
      idea: 'El expediente, digital', corta: 'Licencias y bonificaciones sin papel.',
      estado: 'En desarrollo',
      cifras: [['−39%', 'pasos en 13 trámites'], ['8.000', 'hojas por año']],
      recursos: [
        { tipo: 'ps', titulo: 'Menos papel, menos pasos',
          problema: [['⏳', '35 días por licencia por examen'], ['📑', '8.000 hojas por año en papel'], ['🔁', '107 pasos en 13 trámites']],
          solucion: [{ n: '−39%', t: 'pasos en 13 trámites', g: 'barras', de: 107, a: 65 }, { n: '0', t: 'hojas: expediente digital con firma' }, { n: 'IA', t: 'sugiere prioridad y borrador; una persona decide' }],
          conecta: 'Relevamiento de la Dirección de IA con Capital Humano · 07/10/2026' },
      ],
    },
    // ---------------------------------------------------------------- PARA EL VECINO
    {
      id: 'migue', num: '03', eje: 'Atención ciudadana', nombre: 'Migue',
      idea: 'Asistente virtual las 24 horas', corta: 'En Ciudad Digital, Telegram y WhatsApp.',
      estado: 'En funcionamiento',
      cifras: [['17.848', 'consultas'], ['91%', 'resueltas'], ['3.797', 'vecinos que vuelven']],
      recursos: [
        { tipo: 'ps', titulo: 'Una sola puerta para preguntar',
          problema: [['🏛️', 'Cada trámite, en un área distinta'], ['⏰', 'Ventanilla de 8 a 13'], ['🔎', 'Información dispersa']],
          solucion: [{ n: '24 h', t: 'en Ciudad Digital, Telegram y WhatsApp' }, { n: '17.848', t: 'consultas respondidas' }, { n: '91%', t: 'resueltas', g: 'dona' }, { n: '99,8%', t: 'llegan por Ciudad Digital', g: 'dona' }],
          conecta: 'Guía de Trámites · Turnos · Reclamos · Cortes de tránsito · Ciudad Digital (CiDiTuc)' },
        { tipo: 'web', src: 'img/migue/canal-cidituc.png', url: 'ciudaddigital.smt.gob.ar', titulo: 'La puerta: Ciudad Digital, con Migue adentro' },
        { tipo: 'web', src: 'img/capturas/migue/gobernanza.jpg', url: 'migue.smt.gob.ar · Gobernanza de datos', titulo: 'El cerebro: gobernanza de cada consulta' },
        { tipo: 'web', src: 'img/capturas/migue/clima.jpg', url: 'migue.smt.gob.ar · Clima ciudadano', titulo: 'El termómetro: el clima, leído por IA' },
        { tipo: 'vivo', titulo: 'Preguntale a Migue, en vivo' },
      ],
    },
    {
      id: 'cimba', num: '04', eje: 'Obra pública', nombre: 'CIMBA',
      idea: 'Del reclamo al bache reparado', corta: 'Áreas conectadas, cierre del reclamo, trazabilidad.',
      estado: 'En funcionamiento',
      cifras: [['4.316', 'baches desde marzo'], ['880 t', 'de mezcla trazada'], ['6', 'canales conectados']],
      recursos: [
        { tipo: 'ps', titulo: 'Del reclamo disperso al bache trazado',
          problema: [['📥', 'Reclamos en 6 canales distintos'], ['🗂️', 'Planillas sueltas por área y empresa'], ['❓', 'El vecino no sabía si se arregló'], ['🧾', 'Sin trazabilidad de materiales']],
          solucion: [{ n: '4.316', t: 'baches con lugar, fecha y empresa' }, { n: '880 t', t: 'de mezcla asfáltica, trazada' }, { n: '1.383', t: 'arreglos con foto antes y después' }, { n: '162', t: 'reclamos de vecinos cerrados' }],
          conecta: '147 · Concejo · S.A.T. · Secretarías · Redes · 12 empresas · SIGOV · Ciudad Digital — cierre automático del reclamo' },
        { tipo: 'avance', titulo: 'Así se fue llenando la ciudad' },
        { tipo: 'web', src: 'img/capturas/cimba/mapa.jpg', url: 'cimba.smt.gob.ar/mapa', titulo: 'Lo pedido y lo hecho, en un mapa' },
        { tipo: 'web', src: 'img/capturas/cimba/muro.jpg', url: 'cimba.smt.gob.ar/avance', titulo: 'Cada arreglo, con su foto', scroll: true },
      ],
    },
    {
      id: 'estudia', num: '05', eje: 'Educación', nombre: 'SMT EstudIA',
      idea: 'La IA arma el borrador, el docente decide', corta: 'Celulares para aprender, con reglas.',
      estado: 'Piloto en 2 escuelas',
      cifras: [['2', 'escuelas piloto'], ['1 min', 'por actividad'], ['50', 'usos de IA por día, con tope']],
      recursos: [
        { tipo: 'ps', titulo: 'Una escuela que usa la IA con reglas',
          problema: [['📵', '¿Celulares en el aula: prohibir o usar?'], ['🧑‍🏫', 'Docentes sobrecargados, sin IA segura'], ['🗂️', 'Datos dispersos'], ['🤖', 'Estudiantes usando mal la IA']],
          solucion: [{ n: '1 min', t: 'para armar una actividad' }, { n: '1', t: 'plataforma: docentes, estudiantes, familias y dirección' }, { n: '50', t: 'usos de IA por día por docente, con tope' }, { n: 'US$ 0,017', t: 'costo de IA del piloto en 30 días' }],
          conecta: 'La IA arma el borrador · el docente revisa · la IA ayuda a pensar, no hace la tarea' },
        { tipo: 'web', src: 'img/capturas/estudia/crear.jpg', url: 'estudia.smt.gob.ar/crear', titulo: 'El docente elige; la IA arma el borrador' },
        { tipo: 'par', web: { src: 'img/capturas/estudia/mi-dia.png', url: 'estudia.smt.gob.ar' }, cel: { src: 'img/capturas/estudia/cel-estudiar.png' }, titulo: 'El celular, para aprender' },
        { tipo: 'web', src: 'img/capturas/estudia/consumo-ia.jpg', url: 'estudia.smt.gob.ar/admin/consumo-ia', titulo: 'Cuánto cuesta, a la vista' },
      ],
    },
    {
      id: 'urbania', num: '06', eje: 'Planeamiento urbano', nombre: 'UrbanIA',
      idea: 'El nuevo Código, con memoria pública', corta: 'Cada idea del vecino, cruzada con su norma.',
      estado: 'En uso por el equipo del Código',
      cifras: [['10', 'audiencias públicas'], ['15', 'normas nuevas']],
      recursos: [
        { tipo: 'ps', titulo: 'Un Código nuevo que escucha',
          problema: [['📜', 'Un Código de 1998, con texto de 2014'], ['🎙️', 'Horas de audiencias sin sistematizar'], ['🧩', 'Ideas de vecinos sin cruzar con cada norma']],
          solucion: [{ n: '10', t: 'audiencias públicas analizadas' }, { n: '15', t: 'normas nuevas ancladas al Código vigente' }, { n: 'Minuto a minuto', t: 'cada idea del vecino, cruzada con su norma' }],
          conecta: 'Fábrica de Normas · Audiencias · Consulta al Código · Foro · Mapa — la IA orienta, el equipo valida' },
        { tipo: 'web', src: 'img/capturas/urbania/audiencia-cruce.jpg', url: 'urbania.smt.gob.ar/audiencias', titulo: 'Lo que dijo cada vecino, con su norma', scroll: true },
        { tipo: 'web', src: 'img/capturas/urbania/codigo-2026.jpg', url: 'urbania.smt.gob.ar/normas', titulo: 'Fábrica de Normas' },
        { tipo: 'web', src: 'img/capturas/urbania/consulta-cpu.jpg', url: 'urbania.smt.gob.ar/consulta-cpu', titulo: 'El Código, en lenguaje natural' },
      ],
    },
    // ---------------------------------------------------------------- CIUDAD ABIERTA (falta confirmar el problema de cada uno)
    {
      id: 'espacio', num: '07', eje: 'Espacio público', nombre: 'Applaza',
      idea: 'Cada plaza, con su evidencia', corta: '218 espacios verdes con ubicación y fotos.',
      estado: 'En funcionamiento',
      cifras: [['218', 'espacios verdes'], ['911', 'evidencias'], ['24', 'cooperativas']],
      recursos: [
        { tipo: 'kpis', titulo: 'Estado de los espacios verdes', cab: 'Padrón municipal · Estado general', kpis: [['218', 'espacios del padrón'], ['210', 'con ubicación'], ['8', 'pendientes de ubicar'], ['911', 'evidencias cargadas'], ['110,6', 'km recorridos'], ['24', 'cooperativas activas']], nota: 'Applaza · Municipalidad de San Miguel de Tucumán · datos al 14/10/2026' },
      ],
    },
    {
      id: 'bus', num: '08', eje: 'Turismo', nombre: 'Bus Turístico',
      idea: 'La ciudad, para quien la visita', corta: 'Reservas y consultas con Migue.',
      estado: 'En funcionamiento',
      cifras: [['488', 'conversaciones'], ['106', 'turistas'], ['74', 'lugares reservados']],
      recursos: [
        { tipo: 'web', src: 'img/capturas/bus/resumen.jpg', url: 'busturistico.smt.gob.ar/admin', titulo: 'Lo que preguntan los turistas' },
        { tipo: 'web', src: 'img/capturas/bus/salidas.jpg', url: 'busturistico.smt.gob.ar/admin', titulo: 'Salidas, cupos y reservas' },
      ],
    },
    {
      id: 'participa', num: '09', eje: 'Participación', nombre: 'Ciudad abierta',
      idea: 'Los vecinos proponen y deciden', corta: 'Presupuesto Participativo y ferias online.',
      estado: 'En funcionamiento',
      cifras: [['20', 'distritos'], ['19', 'proyectos elegidos en 2025']],
      recursos: [
        { tipo: 'par', web: { src: 'img/capturas/presupuesto/escritorio-completa.jpg', url: 'presupuestoparticipativo.smt.gob.ar', scroll: true }, cel: { src: 'img/capturas/presupuesto/celular.jpg' }, titulo: 'Presupuesto Participativo' },
        { tipo: 'par', web: { src: 'img/capturas/ferias/escritorio-completa.jpg', url: 'Ferias Municipales · San Miguel de Tucumán', scroll: true }, cel: { src: 'img/capturas/ferias/celular.jpg' }, titulo: 'Ferias municipales online' },
      ],
    },
  ],
};
