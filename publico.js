// =====================================================================
// PARTICIPACIÓN DEL PÚBLICO, en la pantalla.
//
// Las placas con data-publico="<id>" abren esa actividad en los celulares al
// llegar (y la dejan abierta hasta que otra placa abra otra) y muestran los
// resultados en vivo: la nube de palabras, las barras de la votación o las
// preguntas que le hacen a Migue. Con data-revelar, el primer SIGUIENTE marca
// la respuesta correcta y el segundo avanza.
//
// La botonera también puede abrir cualquier actividad en cualquier placa: se
// muestra encima (#publico), como la respuesta de Migue.
//
//   publico.placa(p) · publico.abrir(id) · publico.cerrar() · publico.revelar()
// Va después de arranque.js y m6.js. Los datos van y vienen por HTTP con este
// mismo servidor (publico-servidor.js), no por Supabase.
// =====================================================================
(function () {
  const P = window.PUBLICO || {}, CFG = window.UBA_CONFIG || {};
  const ACT = Object.fromEntries((P.ACTIVIDADES || []).map(a => [a.id, a]));
  const qs = new URLSearchParams(location.search);
  const captura = qs.has('captura');
  const canal = (qs.get('canal') || '').trim();
  const SALA = (window.Remoto && window.Remoto.sala) || CFG.sala || 'sala';
  const flota = document.getElementById('publico');
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const COLORES = ['#111a3b', '#0066ff', '#2f9e6e', '#c98a00', '#3a4366', '#d6453d', '#0a8fd6', '#6b4fbf'];
  const color = k => { let h = 0; for (const ch of String(k)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return COLORES[h % COLORES.length]; };

  let cont = null, actId = null, abierta = false, ultimo = null, timer = null, pidiendo = false, revLocal = {};
  // placas y actual son de presentacion.js (globales del escenario).
  const placaActual = () => (typeof placas !== 'undefined' ? placas[actual] : null);

  // ------------------------------------------------------------ QR y dirección
  let link = (CFG.origenPublico || location.origin) + '/sumate' + (canal ? '?canal=' + encodeURIComponent(canal) : '');
  function pintarQrs() {
    document.querySelectorAll('.pub-qr').forEach((el) => {
      if (el.dataset.link === link) return;
      el.dataset.link = link;
      try { const q = qrcode(0, 'M'); q.addData(link); q.make(); el.innerHTML = q.createSvgTag({ cellSize: 8, margin: 0, scalable: true }); } catch (e) { el.textContent = link; }
    });
    document.querySelectorAll('.pub-url').forEach(el => { el.textContent = link.replace(/^https?:\/\//, ''); });
  }
  // Con INICIAR.bat (sin internet) los celulares entran por la IP de la compu, en el mismo wifi.
  if (window.Remoto && window.Remoto.modo === 'local') {
    fetch('/red', { cache: 'no-store' }).then(r => r.json()).then((j) => {
      if (j.ips && j.ips[0]) { link = 'http://' + j.ips[0] + ':' + location.port + '/sumate'; pintarQrs(); }
    }).catch(() => { });
  }
  pintarQrs();

  // ------------------------------------------------------------ servidor
  function mandar(ruta, cuerpo, intentos) {
    if (captura) return Promise.resolve(null);
    return fetch('api/publico/' + ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sala: SALA, ...cuerpo }) })
      .then(r => r.json()).catch(() => {
        if ((intentos || 0) < 3) return new Promise(ok => setTimeout(() => ok(mandar(ruta, cuerpo, (intentos || 0) + 1)), 1200));
        return null;
      });
  }
  async function traer() {
    clearTimeout(timer);
    if (!cont || captura) return;
    if (!pidiendo) {
      pidiendo = true;
      const pedido = actId;
      try {
        const r = await fetch('api/publico/resultados?sala=' + encodeURIComponent(SALA) + '&act=' + encodeURIComponent(actId) + '&_=' + Date.now(), { cache: 'no-store' });
        const j = await r.json();
        if (pedido === actId && cont) { ultimo = j; pintar(); }
      } catch (e) { }
      pidiendo = false;
    }
    if (cont) timer = setTimeout(traer, 1500);
  }

  // ------------------------------------------------------------ armar
  const CEJA = a => a.tipo === 'nube' ? 'Nube de palabras' : a.tipo === 'migue' ? 'Preguntale a Migue · desde el celular' : a.correcta != null ? 'Adiviná · desde el celular' : 'Votación · desde el celular';
  function preparar(c, id) {
    const a = ACT[id]; if (!c || !a) return;
    if (c.dataset.act !== id) {
      c.dataset.act = id;
      c.dataset.tipo = a.tipo;
      const ceja = c.querySelector('.pub-ceja'), preg = c.querySelector('.pub-pregunta');
      if (ceja && (!ceja.textContent.trim() || ceja.hasAttribute('data-auto'))) { ceja.setAttribute('data-auto', ''); ceja.textContent = CEJA(a); }
      if (preg && (!preg.textContent.trim() || preg.hasAttribute('data-auto'))) { preg.setAttribute('data-auto', ''); preg.textContent = a.pregunta; }
      const res = c.querySelector('.pub-res');
      res.className = 'pub-res ' + (a.tipo === 'nube' ? 'pub-nube' : a.tipo === 'encuesta' ? 'pub-barras' : 'pub-feed');
      res.innerHTML = ''; res._firma = null;
    }
    if (!ultimo || (ultimo.a && ultimo.a.id !== id)) ultimo = null;
    pintar();
  }
  function revelada() {
    const a = ACT[actId];
    return !!(a && (revLocal[actId] || (ultimo && ultimo.a && ultimo.a.id === actId && ultimo.a.revelada)));
  }
  function pintar() {
    if (!cont) return;
    const a = ACT[actId]; if (!a) return;
    const j = ultimo || {};
    const num = (sel, n) => cont.querySelectorAll(sel).forEach((el) => {
      const t = String(n || 0);
      if (el.textContent !== t) { el.textContent = t; el.classList.remove('salta'); void el.offsetWidth; el.classList.add('salta'); }
    });
    num('.pub-gente', j.gente); num('.pub-munis', j.municipios);
    const rec = cont.querySelector('.pub-recientes'); if (rec) recientes(rec, j.recientes || []);
    const res = cont.querySelector('.pub-res');
    if (a.tipo === 'nube') nube(res, j.nube || []);
    else if (a.tipo === 'encuesta') barras(res, a, j.votos || a.opciones.map(() => 0), revelada());
    else feed(res, j);
  }

  // ------------------------------------------------------------ nube
  function nube(caja, lista) {
    const firma = JSON.stringify(lista);
    if (caja._firma === firma) return; // sin cambios: no se vuelve a medir
    caja._firma = firma;
    if (!lista.length) {
      if (!caja.querySelector('.pub-vacio')) caja.innerHTML = '<p class="pub-vacio">Las palabras van apareciendo acá…</p>';
      return;
    }
    const vacio = caja.querySelector('.pub-vacio'); if (vacio) vacio.remove();
    const max = lista[0].c, min = lista[lista.length - 1].c;
    // La más votada al medio; las demás, alternadas a los costados.
    const orden = []; lista.forEach((w, i) => { if (i % 2) orden.push(w); else orden.unshift(w); });
    const vivos = new Set(), els = [];
    orden.forEach((w, pos) => {
      let el = [...caja.children].find(x => x.dataset.k === w.k);
      if (!el) {
        el = document.createElement('span'); el.className = 'pw nueva'; el.dataset.k = w.k; el.textContent = w.t;
        el.style.color = color(w.k); caja.appendChild(el);
        setTimeout(() => el.classList.remove('nueva'), 900);
      }
      el.style.order = pos; el._f = max === min ? (lista.length === 1 ? 1 : .5) : (w.c - min) / (max - min);
      vivos.add(w.k); els.push(el);
    });
    [...caja.children].forEach(el => { if (!vivos.has(el.dataset.k)) el.remove(); });
    // Tamaño según los votos; si no entra, todo un poco más chico.
    const tope = lista.length > 40 ? 74 : lista.length > 18 ? 92 : 118;
    let escala = 1;
    const aplicar = () => els.forEach(el => { el.style.fontSize = Math.max(26, Math.round((30 + Math.pow(el._f, .7) * tope) * escala)) + 'px'; });
    // Se mide sin la transición (si no, se mediría el tamaño de antes) y después se anima hasta el final.
    const previas = els.map(el => el.style.fontSize);
    caja.classList.add('midiendo');
    aplicar();
    // Centrada, lo que se pasa sobresale arriba y abajo: se mide el bloque de palabras entero.
    const noEntra = () => {
      let arriba = Infinity, abajo = -Infinity, ancho = 0;
      els.forEach((el) => { arriba = Math.min(arriba, el.offsetTop); abajo = Math.max(abajo, el.offsetTop + el.offsetHeight); ancho = Math.max(ancho, el.offsetWidth); });
      return abajo - arriba > caja.clientHeight - 36 || ancho > caja.clientWidth - 70;
    };
    for (let i = 0; i < 14 && noEntra(); i++) { escala *= .9; aplicar(); }
    const finales = els.map(el => el.style.fontSize);
    els.forEach((el, i) => { el.style.fontSize = previas[i] || finales[i]; });
    void caja.offsetWidth; caja.classList.remove('midiendo'); void caja.offsetWidth;
    els.forEach((el, i) => { el.style.fontSize = finales[i]; });
  }

  // ------------------------------------------------------------ votación
  function barras(caja, a, v, rev) {
    if (!caja.querySelector('.pb')) {
      caja.innerHTML = a.opciones.map((o, i) => `<div class="pb" data-i="${i}"><div class="pb-txt"><b>${esc(o)}</b><span class="pb-n"></span></div><div class="pb-barra"><i></i></div></div>`).join('')
        + '<p class="pub-total"></p><div class="pub-revelacion"></div>';
    }
    const tot = v.reduce((x, y) => x + y, 0);
    caja.querySelectorAll('.pb').forEach((row) => {
      const i = +row.dataset.i, n = v[i] || 0, pct = tot ? Math.round(n * 100 / tot) : 0;
      row.querySelector('.pb-n').textContent = tot ? pct + '%' : '';
      row.querySelector('.pb-barra i').style.width = (tot ? Math.max(n ? 1.5 : 0, n * 100 / tot) : 0) + '%';
      row.classList.toggle('correcta', rev && a.correcta === i);
      row.classList.toggle('apagada', rev && a.correcta != null && a.correcta !== i);
    });
    caja.querySelector('.pub-total').textContent = tot ? tot + (tot === 1 ? ' voto' : ' votos') : 'Esperando los votos…';
    const r = caja.querySelector('.pub-revelacion');
    const ver = rev && a.correcta != null;
    if (ver && !r.classList.contains('ver')) r.innerHTML = `<b>${esc(a.opciones[a.correcta])}</b>${esc(a.revelacion || '')}`;
    r.classList.toggle('ver', ver);
  }

  // ------------------------------------------------------------ Migue
  function feed(caja, j) {
    if (!caja.querySelector('.pf-lista')) caja.innerHTML = '<p class="pf-cuenta"></p><div class="pf-lista"></div>';
    caja.querySelector('.pf-cuenta').innerHTML = j.total
      ? `<b>${j.total}</b> ${j.total === 1 ? 'pregunta' : 'preguntas'} a Migue · <b>${j.respondidas || 0}</b> ya ${j.respondidas === 1 ? 'respondida' : 'respondidas'}`
      : 'Esperando las preguntas…';
    const lista = caja.querySelector('.pf-lista'), items = j.feed || [], vivos = new Set();
    items.forEach((m, pos) => {
      let el = [...lista.children].find(x => x.dataset.id === m.id);
      if (!el) {
        el = document.createElement('div'); el.className = 'pf nueva'; el.dataset.id = m.id;
        el.innerHTML = `<b>${esc(m.n)}${m.m ? ' · ' + esc(m.m) : ''}</b><p>${esc(m.q)}</p><span class="pf-e"></span>`;
        lista.appendChild(el); setTimeout(() => el.classList.remove('nueva'), 800);
      }
      el.style.order = pos; vivos.add(m.id);
      el.classList.toggle('ok', m.e === 'ok');
      el.querySelector('.pf-e').textContent = m.e === 'ok' ? '✓ Migue respondió' : m.e === 'pensando' ? 'Migue escribe…' : m.e === 'error' ? 'Sin respuesta' : 'En la fila';
    });
    [...lista.children].forEach(el => { if (!vivos.has(el.dataset.id)) el.remove(); });
  }

  // ------------------------------------------------------------ quiénes se sumaron
  function recientes(caja, lista) {
    const vivos = new Set();
    lista.forEach((p, pos) => {
      const k = p.n + '|' + p.m; vivos.add(k);
      let el = [...caja.children].find(x => x.dataset.k === k);
      if (!el) {
        el = document.createElement('span'); el.className = 'nueva'; el.dataset.k = k;
        el.innerHTML = `${esc(p.n)}<small>${p.m ? ' · ' + esc(p.m) : ''}</small>`;
        caja.appendChild(el); setTimeout(() => el.classList.remove('nueva'), 800);
      }
      el.style.order = pos;
    });
    [...caja.children].forEach(el => { if (!vivos.has(el.dataset.k)) el.remove(); });
  }

  // ------------------------------------------------------------ placas y botonera
  function mostrarEn(c, id, abrirEnServidor) {
    cont = c; actId = id;
    preparar(c, id);
    if (abrirEnServidor) mandar('activar', { act: id });
    traer();
  }
  function placa(p) {
    if (abierta) cerrarFlota();
    clearTimeout(timer);
    if (p && p.dataset.publico && ACT[p.dataset.publico]) mostrarEn(p.querySelector('.pub'), p.dataset.publico, true);
    else { cont = null; actId = null; }
  }
  // Desde la botonera, sobre cualquier placa.
  function abrir(id) {
    if (!ACT[id]) return;
    const p = placaActual();
    if (p && p.dataset.publico === id) { mandar('activar', { act: id }); return; }
    flota.classList.add('ver'); flota.setAttribute('aria-hidden', 'false'); abierta = true;
    document.getElementById('stage').classList.add('publico-flota');
    mostrarEn(flota.querySelector('.pub'), id, true);
    window.informar && window.informar();
  }
  function cerrarFlota() {
    abierta = false; flota.classList.remove('ver'); flota.setAttribute('aria-hidden', 'true');
    document.getElementById('stage').classList.remove('publico-flota');
  }
  function cerrar() {
    if (!abierta) return;
    cerrarFlota();
    const p = placaActual();
    placa(p);
    window.informar && window.informar();
  }
  // En una placa con data-revelar (o en la flotante): marca la respuesta correcta.
  function puedeRevelar() {
    const a = ACT[actId];
    if (!cont || !a || a.correcta == null || revelada()) return false;
    const p = placaActual();
    return abierta || !!(p && p.dataset.revelar !== undefined && p.dataset.publico === actId);
  }
  function revelar(on) {
    if (!actId) return;
    on = on !== false;
    revLocal[actId] = on; if (!on && ultimo && ultimo.a) ultimo.a.revelada = false;
    mandar('revelar', { act: actId, on });
    pintar();
    window.informar && window.informar();
  }

  window.publico = {
    placa, abrir, cerrar, revelar, puedeRevelar,
    abierta: () => abierta,
    estado: () => ({ act: actId, flota: abierta, revelable: puedeRevelar(), revelada: revelada(), link }),
  };
  // La placa en la que arranca (normalmente la portada) y el modo captura.
  try { const p = placaActual(); if (p && p.dataset.publico) placa(p); } catch (e) { }
})();
