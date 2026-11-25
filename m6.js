// =====================================================================
// MÓDULO 6 (Chaco): riel de bloques, encabezado con el bloque actual,
// logo del Gobierno del Chaco y modo captura para las miniaturas.
// Va después de arranque.js: usa placas, irA y window.efectos.
// =====================================================================
(function () {
  const BLOQUES = [
    'IA individual → institucional',
    'Las capas',
    'Piloto → producción',
    'Economía de los agentes',
    'Gobernanza del agente',
    'Lo que la factura no muestra',
    'Hoja de ruta para Chaco',
  ];
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Riel de los separadores: los bloques hechos, el actual y los que faltan.
  document.querySelectorAll('.m6-sep').forEach((sep) => {
    const n = +sep.dataset.bloque, riel = sep.querySelector('.m6-riel');
    if (!riel) return;
    riel.innerHTML = BLOQUES.map((t, i) => {
      const k = i + 1, cls = k < n ? 'hecho' : k === n ? 'on' : '';
      return `<li class="${cls}"><b>${String(k).padStart(2, '0')}</b>${esc(t)}</li>`;
    }).join('');
  });

  // Encabezado de cada placa: en qué bloque estamos (hasta la conclusión).
  let bloque = 0, fin = false;
  document.querySelectorAll('#stage > .slide:not([data-oculta])').forEach((s) => {
    if (s.dataset.fin !== undefined) fin = true;
    if (s.classList.contains('m6-sep')) bloque = +s.dataset.bloque;
    const enc = s.querySelector('.encab');
    if (!enc) return;
    enc.textContent = bloque && !fin ? `Módulo 6 · Bloque ${bloque} · ${BLOQUES[bloque - 1]}` : 'Gobernar con IA · Módulo 6 · Dr. Marco Rossi';
  });

  // Logo del Gobierno del Chaco: si está el archivo en img/logos, reemplaza la marca de texto.
  (function logoChaco(srcs) {
    if (!srcs.length) return;
    const im = new Image();
    im.onload = () => document.querySelectorAll('[data-logo-chaco]').forEach((el) => {
      const img = document.createElement('img');
      img.src = im.src; img.alt = 'Gobierno del Chaco'; img.className = 'chaco';
      el.replaceWith(img);
    });
    im.onerror = () => logoChaco(srcs.slice(1));
    im.src = srcs[0];
  })(['img/logos/gobierno-chaco.svg', 'img/logos/gobierno-chaco.png']);

  // Modo captura: ?captura=N abre la placa N quieta y en su estado final (sin
  // pantalla de inicio, sin contadores ni consultas a Migue). Lo usa
  // herramientas/miniaturas.ps1 para regenerar img/mini.
  const cap = new URLSearchParams(location.search).get('captura');
  if (cap) {
    document.body.classList.add('captura');
    if (window.vivo) window.vivo.precargar = () => { };
    const fmt = n => Math.round(n).toLocaleString('es-AR');
    window.efectos.contar = (raiz) => raiz.querySelectorAll('[data-n]').forEach((el) => {
      el.textContent = (el.dataset.pre || '') + fmt(+el.dataset.n) + (el.dataset.pos || '');
    });
    document.getElementById('inicio').style.display = 'none';
    empezado = true; // que un toque o una tecla no vuelva a la portada
    irA(Math.max(0, (parseInt(cap, 10) || 1) - 1));
    // &rec=K: en una vitrina, el recurso K (queda en pausa).
    const rec = parseInt(new URLSearchParams(location.search).get('rec'), 10);
    if (rec > 0 && window.cajones) setTimeout(() => window.cajones.irRecurso(rec - 1), 200);
  }
})();
