// =====================================================================
// CONTENIDO EDITABLE DE LA PRESENTACIÓN (UBA · 16/10/2026)
// "La IA como servicio público": las frases de Migue, las preguntas en vivo
// y los cajones de proyectos. Los textos de las placas están en index.html.
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

  // Los cajones: cada proyecto se abre sobre cualquier placa desde la botonera.
  // Recursos: 'web' (captura en ventana de navegador; scroll: true la recorre),
  // 'cel' (captura en un celular), 'par' (navegador + celular), 'vivo'
  // (Preguntale a Migue), 'avance' (CIMBA, datos/cimba-avance.js) y 'kpis'
  // (tablero recreado con números que cuentan).
  // En "url" va lo que se lee en la barra del navegador: nunca una dirección de Vercel.
  PROYECTOS: [
    {
      id: 'migue', num: '01', eje: 'Atención ciudadana', nombre: 'Migue',
      idea: 'Asistente virtual las 24 horas', corta: 'Trámites, turnos, reclamos y cortes, en lenguaje natural.',
      bajada: 'El asistente virtual de la ciudad: trámites, turnos, reclamos y cortes, las 24 horas, en lenguaje natural.',
      estado: 'En funcionamiento',
      canales: 'Web · Ciudadano Digital · Telegram · WhatsApp',
      cifras: [['17.848', 'consultas'], ['91%', 'resueltas'], ['3.797', 'vecinos que vuelven']],
      recursos: [
        { tipo: 'web', src: 'img/capturas/migue/gobernanza.jpg', url: 'migue.smt.gob.ar · Gobernanza de datos', titulo: 'El cerebro: gobernanza de cada consulta' },
        { tipo: 'web', src: 'img/capturas/migue/clima.jpg', url: 'migue.smt.gob.ar · Clima ciudadano', titulo: 'El termómetro: el clima de la ciudad, leído por IA' },
        { tipo: 'web', src: 'img/migue/canal-smt.webp', url: 'smt.gob.ar', titulo: 'En el portal de la ciudad' },
        { tipo: 'vivo', titulo: 'Preguntale a Migue, en vivo' },
      ],
    },
    {
      id: 'cimba', num: '02', eje: 'Obra pública', nombre: 'CIMBA',
      idea: 'Del reclamo al bache reparado', corta: 'Cada pedido se ubica, se ordena, se arregla y se certifica con foto y GPS.',
      bajada: 'Del reclamo del vecino al bache reparado: cada pedido se ubica, se ordena, se arregla y se certifica con foto y GPS.',
      estado: 'En funcionamiento',
      canales: '147 · Concejo · S.A.T. · Secretarías · Redes · Cuadrillas',
      cifras: [['4.316', 'baches desde marzo'], ['64.570', 'm² reparados'], ['3.402', 'pedidos de 6 canales']],
      recursos: [
        { tipo: 'avance', titulo: 'Avance: así se fue llenando la ciudad' },
        { tipo: 'web', src: 'img/capturas/cimba/mapa.jpg', url: 'cimba.smt.gob.ar/mapa', titulo: 'Lo pedido y lo hecho, en un mapa' },
        { tipo: 'web', src: 'img/capturas/cimba/muro.jpg', url: 'cimba.smt.gob.ar/avance', titulo: 'Cada arreglo, con su foto', scroll: true },
      ],
    },
    {
      id: 'urbania', num: '03', eje: 'Planeamiento urbano', nombre: 'UrbanIA',
      idea: 'El nuevo Código, con memoria pública', corta: 'Las audiencias se cruzan con cada norma nueva; el Código se consulta en lenguaje natural.',
      bajada: 'La reforma del Código de Planeamiento Urbano: lo que dicen los vecinos en las audiencias se cruza con cada norma nueva. La IA orienta; el equipo valida.',
      estado: 'En uso por el equipo del Código',
      canales: 'Fábrica de Normas · Audiencias · Consulta al CPU · Foro · Mapa',
      cifras: [['10', 'audiencias públicas'], ['15', 'normas nuevas en redacción']],
      recursos: [
        { tipo: 'web', src: 'img/capturas/urbania/audiencia-cruce.jpg', url: 'urbania.smt.gob.ar/audiencias', titulo: 'Lo que dijo cada vecino, cruzado con cada norma', scroll: true },
        { tipo: 'web', src: 'img/capturas/urbania/audiencias.jpg', url: 'urbania.smt.gob.ar/audiencias', titulo: 'Memoria pública: diez audiencias' },
        { tipo: 'web', src: 'img/capturas/urbania/codigo-2026.jpg', url: 'urbania.smt.gob.ar/normas', titulo: 'Fábrica de Normas: cada artículo anclado al Código vigente' },
        { tipo: 'web', src: 'img/capturas/urbania/consulta-cpu.jpg', url: 'urbania.smt.gob.ar/consulta-cpu', titulo: 'El Código, en lenguaje natural' },
        { tipo: 'web', src: 'img/capturas/urbania/mapa.jpg', url: 'urbania.smt.gob.ar', titulo: 'Territorio y evidencia' },
      ],
    },
    {
      id: 'estudia', num: '04', eje: 'Educación', nombre: 'SMT EstudIA',
      idea: 'La IA arma el borrador, el docente decide', corta: 'Clases y actividades a medida de cada curso, revisadas por el docente.',
      bajada: 'La plataforma con IA de las escuelas municipales: cada docente prepara clases, actividades y evaluaciones a la medida de su curso. La IA arma el borrador; el docente lo revisa antes de que llegue a sus estudiantes.',
      estado: 'Piloto en 2 escuelas',
      canales: 'Docentes · Estudiantes · Familias · Dirección',
      cifras: [],
      recursos: [
        { tipo: 'web', src: 'img/capturas/estudia/crear.jpg', url: 'estudia.smt.gob.ar/crear', titulo: 'El docente elige; la IA arma el borrador' },
        { tipo: 'par', web: { src: 'img/capturas/estudia/mi-dia.png', url: 'estudia.smt.gob.ar' }, cel: { src: 'img/capturas/estudia/cel-estudiar.png' }, titulo: 'El día del docente y el celular del estudiante' },
        { tipo: 'web', src: 'img/capturas/estudia/tablero.png', url: 'estudia.smt.gob.ar', titulo: 'La escuela, sin pedir informes' },
        { tipo: 'web', src: 'img/capturas/estudia/consumo-ia.jpg', url: 'estudia.smt.gob.ar/admin/consumo-ia', titulo: 'Cuánto cuesta, a la vista' },
      ],
    },
    {
      id: 'notas', num: '05', eje: 'Gestión interna', nombre: 'Generador de Notas',
      idea: 'Lenguaje claro, con criterio', corta: 'Notas administrativas en lenguaje claro para cada repartición: la IA redacta, la persona firma.',
      bajada: 'Notas, pases, intimaciones y dictámenes en lenguaje claro, con el mismo criterio en todas las reparticiones. La IA redacta el borrador; la persona revisa y firma. Así se gana confianza en la IA desde adentro.',
      estado: 'En funcionamiento',
      canales: 'Diez tipos de nota · dictado por voz · padrón de áreas',
      cifras: [['10', 'tipos de nota'], ['−39%', 'pasos en 13 trámites de Capital Humano']],
      recursos: [
        { tipo: 'web', src: 'img/capturas/generador/formulario.jpg', url: 'Generador de Notas · Dirección de IA', titulo: 'Contalo con tus palabras: la nota sale en lenguaje claro' },
      ],
    },
    {
      id: 'bus', num: '06', eje: 'Turismo', nombre: 'Bus Turístico',
      idea: 'La ciudad, para quien la visita', corta: 'Reservas, cupos y consultas de turistas con Migue, por WhatsApp y Telegram.',
      bajada: 'Salidas, cupos y reservas del bus turístico, con Migue respondiendo a turistas y escuelas por WhatsApp y Telegram.',
      estado: 'En funcionamiento',
      canales: 'WhatsApp · Telegram · Web',
      cifras: [['488', 'conversaciones'], ['106', 'turistas'], ['74', 'lugares reservados']],
      recursos: [
        { tipo: 'web', src: 'img/capturas/bus/resumen.jpg', url: 'busturistico.smt.gob.ar/admin', titulo: 'Lo que preguntan los turistas' },
        { tipo: 'web', src: 'img/capturas/bus/salidas.jpg', url: 'busturistico.smt.gob.ar/admin', titulo: 'Salidas, cupos y reservas' },
      ],
    },
    {
      id: 'espacio', num: '07', eje: 'Espacio público', nombre: 'Applaza',
      idea: 'Cada plaza, con su evidencia', corta: 'Los 218 espacios verdes del padrón, con ubicación, fotos y cooperativa a cargo.',
      bajada: 'El control de los espacios verdes de la ciudad: cada plaza del padrón municipal, ubicada en el mapa, con su evidencia fotográfica y la cooperativa que la mantiene.',
      estado: 'En funcionamiento',
      canales: 'Padrón municipal · Mapa operativo · Registro de control · Auditoría',
      cifras: [['218', 'espacios verdes'], ['911', 'evidencias'], ['24', 'cooperativas']],
      recursos: [
        { tipo: 'kpis', titulo: 'Estado general de los espacios verdes', cab: 'Padrón municipal · Estado general', kpis: [['218', 'espacios del padrón'], ['210', 'con ubicación'], ['8', 'pendientes de ubicar'], ['911', 'evidencias cargadas'], ['110,6', 'km recorridos'], ['24', 'cooperativas activas']], nota: 'Applaza · Municipalidad de San Miguel de Tucumán · datos al 14/10/2026' },
      ],
    },
    {
      id: 'participa', num: '08', eje: 'Participación', nombre: 'Ciudad abierta',
      idea: 'Los vecinos proponen y deciden', corta: 'Presupuesto Participativo en 20 distritos y ferias con vidriera online.',
      bajada: 'Presupuesto Participativo con los 20 distritos en el mapa, y las ferias municipales con vidriera online para cada emprendedor.',
      estado: 'En funcionamiento',
      canales: 'Presupuesto Participativo · Ferias Municipales · Ciudadano Digital',
      cifras: [['20', 'distritos'], ['19', 'proyectos elegidos en 2025']],
      recursos: [
        { tipo: 'par', web: { src: 'img/capturas/presupuesto/escritorio-completa.jpg', url: 'presupuestoparticipativo.smt.gob.ar', scroll: true }, cel: { src: 'img/capturas/presupuesto/celular.jpg' }, titulo: 'Presupuesto Participativo' },
        { tipo: 'par', web: { src: 'img/capturas/ferias/escritorio-completa.jpg', url: 'Ferias Municipales · San Miguel de Tucumán', scroll: true }, cel: { src: 'img/capturas/ferias/celular.jpg' }, titulo: 'Ferias municipales online' },
      ],
    },
  ],
};
