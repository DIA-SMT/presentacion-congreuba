// =====================================================================
// PARTICIPACIÓN DEL PÚBLICO: las actividades y los municipios del Chaco.
// Lo usan el celular del público (sumate.html), la pantalla (publico.js),
// la botonera (control.html) y el servidor (publico-servidor.js).
//
// Tipos: "nube" (palabras), "encuesta" (opciones; con `correcta` se revela la
// respuesta con un SIGUIENTE) y "migue" (preguntas al chat real de Migue).
// Las placas con data-publico="<id>" abren la actividad al llegar.
// =====================================================================
(function (raiz) {
  raiz.ACTIVIDADES = [
    {
      id: 'nube-inicio', tipo: 'nube', titulo: 'Nube de inicio',
      pregunta: 'Cuando pensás en IA en tu municipio, ¿qué palabra se te viene?',
      ayuda: 'Una o dos palabras. Podés mandar hasta tres.', max: 3,
    },
    {
      id: 'migue', tipo: 'migue', titulo: 'Preguntale a Migue',
      pregunta: 'Preguntale a Migue algo de trámites o servicios de San Miguel de Tucumán',
      ayuda: 'Como si fueras vecino de Tucumán. Te contesta acá, en tu celular.', max: 3,
    },
    {
      id: 'costo-estudia', tipo: 'encuesta', titulo: 'Adiviná el costo',
      pregunta: '¿Cuánto creés que gastó en IA el piloto de EstudIA en 30 días?',
      opciones: ['Menos de US$ 1', 'Unos US$ 20', 'Unos US$ 200', 'Más de US$ 1.000'],
      correcta: 0,
      revelacion: 'US$ 0,017 en 30 días: tope de usos por docente y el modelo justo para cada tarea.',
    },
    {
      id: 'uso-ia', tipo: 'encuesta', titulo: '¿Usás IA en el trabajo?',
      pregunta: '¿Usás IA en tu trabajo?',
      opciones: ['Sí, con mi cuenta personal', 'Sí, con una cuenta del municipio', 'Todavía no'],
    },
    {
      id: 'soberania', tipo: 'encuesta', titulo: 'IA soberana',
      pregunta: 'Para los municipios del Chaco, ¿qué conviene?',
      opciones: ['Que cada municipio tenga la suya', 'Una infraestructura provincial compartida', 'Servicios comerciales, con buenas condiciones'],
    },
    {
      id: 'nube-cierre', tipo: 'nube', titulo: 'Nube de cierre',
      pregunta: '¿Qué te llevás para tu municipio?',
      ayuda: 'Una o dos palabras. Podés mandar hasta tres.', max: 3,
    },
  ];

  // Para sugerir mientras escriben y para contar municipios distintos. Se puede
  // escribir cualquier otro: se acepta igual.
  raiz.MUNICIPIOS = [
    'Avia Terai', 'Barranqueras', 'Basail', 'Campo Largo', 'Capitán Solari', 'Charadai', 'Charata',
    'Chorotis', 'Ciervo Petiso', 'Colonia Benítez', 'Colonia Elisa', 'Colonia Popular', 'Colonias Unidas',
    'Concepción del Bermejo', 'Coronel Du Graty', 'Corzuela', 'Cote Lai', 'El Espinillo', 'El Sauzalito',
    'Enrique Urien', 'Fontana', 'Fuerte Esperanza', 'Gancedo', 'General Capdevila', 'General José de San Martín',
    'General Pinedo', 'General Vedia', 'Hermoso Campo', 'Horquilla', 'Isla del Cerrito', 'Itín',
    'Juan José Castelli', 'La Clotilde', 'La Escondida', 'La Eduvigis', 'La Leonesa', 'La Tigra', 'La Verde',
    'Laguna Blanca', 'Laguna Limpia', 'Lapachito', 'Las Breñas', 'Las Garcitas', 'Las Palmas', 'Los Frentones',
    'Machagai', 'Makallé', 'Margarita Belén', 'Miraflores', 'Misión Nueva Pompeya', 'Napenay',
    'Pampa Almirón', 'Pampa del Indio', 'Pampa del Infierno', 'Presidencia de la Plaza', 'Presidencia Roca',
    'Presidencia Roque Sáenz Peña', 'Puerto Bermejo', 'Puerto Eva Perón', 'Puerto Tirol', 'Puerto Vilelas',
    'Quitilipi', 'Resistencia', 'Río Muerto', 'Samuhú', 'San Bernardo', 'Santa Sylvina', 'Selvas del Río de Oro',
    'Taco Pozo', 'Tres Isletas', 'Villa Ángela', 'Villa Berthet', 'Villa Río Bermejito',
  ];
  // Fuera de la cuenta de municipios (aparecen en la lista igual).
  raiz.OTROS = ['Gobierno del Chaco', 'Otro'];
})(typeof module !== 'undefined' && module.exports ? module.exports : (window.PUBLICO = {}));
