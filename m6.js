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

  // -------------------------------------------------------------------
  // SISTEMAS EN VIVO: un navegador dentro de la presentación.
  //   web.abrir(id) · web.cerrar() · web.recargar() · web.ventana(id)
  // Cada sistema tiene su iframe, que queda vivo al cambiar de pestaña o al
  // cerrar (no se pierde la sesión ni lo que se estaba mirando). Las placas
  // con data-web lo precargan una placa antes, para que aparezca ya cargado.
  // -------------------------------------------------------------------
  const captura = new URLSearchParams(location.search).has('captura');
  window.web = (function () {
    const S = (window.CONTENIDO && window.CONTENIDO.SISTEMAS) || [];
    const raiz = document.getElementById('web');
    if (!raiz) return null;
    const pest = raiz.querySelector('.web-pestanas'), txt = raiz.querySelector('.web-url .txt');
    const cuerpo = raiz.querySelector('.web-cuerpo'), aviso = raiz.querySelector('.web-aviso');
    const marcos = {};
    let actual = null, abierto = false;
    const sis = id => S.find(s => s.id === id);
    const sinProto = u => String(u).replace(/^https?:\/\//, '').replace(/\/$/, '');

    function crear(id) {
      const s = sis(id);
      if (!s || marcos[id]) return marcos[id];
      let el;
      if (s.enmarcable === false) {
        // El servidor no deja mostrarlo adentro: tarjeta para abrirlo en una ventana (un clic con el mouse).
        el = document.createElement('div'); el.className = 'web-afuera';
        el.innerHTML = `<div class="fondo"${s.captura ? ` style="background-image:url('${esc(s.captura)}')"` : ''}></div>`
          + `<div class="caja"><span class="ceja">En vivo</span><h3>${esc(s.nombre)} se abre en su propia ventana</h3>`
          + `<button type="button">Abrir ${esc(s.nombre)} ↗</button><small>${esc(sinProto(s.url))}</small></div>`;
        el.querySelector('button').addEventListener('click', () => ventana(id));
      } else {
        el = document.createElement('iframe');
        el.title = s.nombre;
        el.setAttribute('allow', 'clipboard-read; clipboard-write; fullscreen; microphone; geolocation');
        el.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        el.addEventListener('load', () => { el.dataset.cargado = '1'; if (actual === id) aviso.classList.remove('ver'); });
        el.src = s.url;
      }
      el.dataset.sitio = id;
      cuerpo.appendChild(el);
      marcos[id] = el;
      pintarPestanas();
      return el;
    }
    function pintarPestanas() {
      pest.innerHTML = S.filter(s => marcos[s.id]).map(s => `<button type="button" data-sitio="${esc(s.id)}" class="${s.id === actual ? 'on' : ''}">${esc(s.nombre)}</button>`).join('');
    }
    function mostrar(id) {
      const s = sis(id); if (!s) return;
      actual = id;
      Object.values(marcos).forEach(m => m.classList.toggle('on', m.dataset.sitio === id));
      txt.textContent = sinProto(s.url);
      const m = marcos[id];
      aviso.querySelector('b').textContent = s.nombre;
      aviso.classList.toggle('ver', m.tagName === 'IFRAME' && !m.dataset.cargado);
      pintarPestanas();
    }
    function abrir(id) {
      if (!sis(id)) return;
      crear(id); mostrar(id);
      abierto = true; raiz.classList.add('ver'); raiz.setAttribute('aria-hidden', 'false');
      window.informar && window.informar();
    }
    function cerrar() {
      if (!abierto) return;
      abierto = false; raiz.classList.remove('ver'); raiz.setAttribute('aria-hidden', 'true');
      // Que el teclado y el clicker vuelvan a manejar la presentación.
      try { if (document.activeElement && document.activeElement.tagName === 'IFRAME') document.activeElement.blur(); window.focus(); } catch (e) { }
      window.informar && window.informar();
    }
    function recargar() {
      const s = sis(actual), m = marcos[actual];
      if (!s || !m || m.tagName !== 'IFRAME') return;
      delete m.dataset.cargado; aviso.classList.add('ver');
      m.src = 'about:blank'; setTimeout(() => { m.src = s.url; }, 50);
    }
    function ventana(id) {
      const s = sis(id || actual); if (!s) return;
      window.open(s.url, 'sistema-' + s.id, 'popup,width=1600,height=900');
    }
    // Al llegar a una placa: se cierra el navegador y se precarga el sistema de esta placa o de la que sigue.
    function placa(p) {
      if (abierto) cerrar();
      if (captura || !p) return;
      p._webVisto = false;
      const i = placas.indexOf(p), sig = placas[i + 1];
      if (p.dataset.web) crear(p.dataset.web);
      if (sig && sig.dataset.web) crear(sig.dataset.web);
    }
    raiz.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.sitio) return mostrar(b.dataset.sitio);
      const a = b.dataset.webAccion;
      if (a === 'cerrar') cerrar(); else if (a === 'recargar') recargar(); else if (a === 'ventana') ventana();
    });
    return {
      abrir, cerrar, recargar, ventana, placa,
      abierto: () => abierto,
      estado: () => ({ abierto, sitio: actual, nombre: actual ? sis(actual).nombre : '' }),
      sistemas: () => S.map(s => ({ id: s.id, nombre: s.nombre })),
    };
  })();

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
