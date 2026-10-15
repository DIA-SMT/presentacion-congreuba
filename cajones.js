// =====================================================================
// CAJONES Y VITRINAS DE PROYECTOS
// Un cajón muestra los recursos de un proyecto de contenido.js con la grilla
// de las placas (panel azul + escena): capturas animadas, el avance de CIMBA,
// tableros recreados o Migue en vivo.
//   · VITRINA: una placa del recorrido (data-vitrina="cimba" o "espacio,bus").
//     Entra sola con la placa, sus recursos pasan solos y, si junta varios
//     proyectos, el panel cambia con cada uno. El expositor sólo cuenta.
//   · CAJÓN: el mismo contenido abierto a mano desde la botonera, sobre
//     cualquier placa (para preguntas). Crece en círculo desde su tarjeta.
// =====================================================================
(function () {
  const C = window.CONTENIDO;
  const cajon = document.getElementById('cajon');
  const escena = cajon.querySelector('.cj-escena');
  const $ = (s) => cajon.querySelector(s);
  const escH = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const buscar = (id) => C.PROYECTOS.find(p => p.id === id) || C.PROYECTOS[+id];

  // Cuánto se queda cada recurso en una vitrina antes de pasar al próximo (ms).
  // El último se queda quieto hasta la próxima placa.
  const DURA = { ps: 13000, web: 8000, scroll: 14000, par: 11000, cel: 8000, kpis: 8000, avance: 23000, vivo: Infinity };
  const durDe = (r) => (r.tipo === 'web' && r.scroll) || (r.tipo === 'par' && r.web && r.web.scroll) ? DURA.scroll : (DURA[r.tipo] || 9000);

  let lista = [], idx = 0, recEl = null, modo = null, clave = null, panelDe = null;
  let timer = null, finAuto = 0, pausado = false;
  const vistos = new Set();

  // ---------------------------------------------------------------- recursos
  function navegador(r) {
    return `<div class="navegador"><div class="barra"><i></i><i></i><i></i><span>${escH(r.url || '')}</span></div>
      <div class="vista${r.scroll ? ' recorre' : ' zoom'}"><img src="${escH(r.src)}" alt=""></div></div>`;
  }
  const celular = (r) => `<div class="celular"><div class="vista recorre"><img src="${escH(r.src)}" alt=""></div></div>`;
  function tarjetaVivo() {
    const pregs = (C.PREGUNTAS || []).map(p => `<li>${escH(p)}</li>`).join('');
    return `<div class="vivo-intro">
      <div class="vi-preg"><span class="ceja">En vivo, desde la botonera</span><b>Le preguntamos a Migue, ahora</b>
        <p>La respuesta llega del asistente real de la ciudad, en este momento.</p><ol>${pregs}</ol></div>
      <div class="vi-qr"><img src="img/migue/qr-telegram.svg" alt=""><b>@MigueSMT_bot</b><span>Telegram · y en smt.gob.ar</span></div>
    </div>`;
  }
  // PROBLEMA → SOLUCIÓN: a la izquierda los problemas aparecen de a uno; una flecha;
  // a la derecha la solución en números grandes (cuentan), anillos de porcentaje
  // (g: 'dona') o barras de antes y después (g: 'barras', de, a).
  function numAttr(n) { const m = String(n).match(/^([^\d]*)([\d.]+)(,\d+)?(.*)$/); return m && !m[3] ? ` data-n="${m[2].replace(/\./g, '')}" data-pre="${escH(m[1])}" data-pos="${escH(m[4])}"` : ''; }
  function grafico(s) {
    if (s.g === 'dona') {
      const v = Math.max(0, Math.min(100, parseFloat(String(s.n).replace(',', '.')) || 0)), L = 2 * Math.PI * 52;
      return `<svg class="ps-dona" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="fondo"/><circle cx="60" cy="60" r="52" class="valor" style="--L:${L.toFixed(1)};--fin:${(L * (1 - v / 100)).toFixed(1)}"/></svg><b${numAttr(s.n)}>${escH(s.n)}</b>`;
    }
    if (s.g === 'barras') {
      const max = Math.max(s.de, s.a) || 1;
      return `<div class="ps-barras"><div><span>${escH((s.eti || [])[0] || 'Antes')}</span><i style="--w:${(s.de / max * 100).toFixed(0)}%"></i><em>${escH(String(s.de))}</em></div><div><span>${escH((s.eti || [])[1] || 'Ahora')}</span><i class="ahora" style="--w:${(s.a / max * 100).toFixed(0)}%"></i><em>${escH(String(s.a))}</em></div></div><b${numAttr(s.n)}>${escH(s.n)}</b>`;
    }
    const na = numAttr(s.n), palabras = !na && String(s.n).length > 3; // "Costos", "Lenguaje claro": más chico que un número
    return `<b class="${palabras ? 'txt' : ''}"${na}>${escH(s.n)}</b>`;
  }
  function problemaSolucion(r) {
    const prob = (r.problema || []).map(([ic, t], i) => `<li style="--i:${i}"><i>${escH(ic)}</i><b>${escH(t)}</b></li>`).join('');
    const sol = (r.solucion || []).map((s, i) => `<div class="ps-n${s.g ? ' con-g' : ''}" style="--i:${i}">${grafico(s)}<span>${escH(s.t)}</span></div>`).join('');
    return `<div class="ps">
      <div class="ps-prob"><span class="ceja">El problema</span><ul>${prob}</ul></div>
      <div class="ps-flecha"><svg viewBox="0 0 80 40"><path d="M4 20 H70 M56 6 L72 20 L56 34"/></svg></div>
      <div class="ps-sol"><span class="ceja">La solución con IA</span><div class="ps-nums n${(r.solucion || []).length}">${sol}</div>${r.conecta || r.fuente ? `<p class="ps-conecta"><span>${r.fuente ? 'Fuente' : 'Conecta'}</span>${escH(r.conecta || r.fuente)}</p>` : ''}</div>
    </div>`;
  }
  function armar(r) {
    const el = document.createElement('div');
    el.className = 'rec';
    if (r.tipo === 'web') el.innerHTML = navegador(r);
    else if (r.tipo === 'cel') { el.classList.add('solo-cel'); el.innerHTML = celular(r); }
    else if (r.tipo === 'par') { el.classList.add('par'); el.innerHTML = navegador(r.web) + celular(r.cel); }
    else if (r.tipo === 'vivo') { el.classList.add('vivo-rec'); el.innerHTML = tarjetaVivo(); }
    else if (r.tipo === 'avance') { el.classList.add('avance-rec'); el.innerHTML = '<div class="avance-host"></div>'; }
    else if (r.tipo === 'ps') { el.classList.add('ps-rec'); el.innerHTML = problemaSolucion(r); setTimeout(() => window.efectos.contar(el, 1700), 50); }
    else if (r.tipo === 'kpis') {
      el.classList.add('kpis-rec');
      const num = (n) => { const m = String(n).match(/^([^\d]*)([\d.]+)(,\d+)?(.*)$/); return m && !m[3] ? ` data-n="${m[2].replace(/\./g, '')}" data-pre="${escH(m[1])}" data-pos="${escH(m[4])}"` : ''; };
      el.innerHTML = `<div class="kpis"><div class="k-cab"><span class="ceja">${escH(r.cab || '')}</span></div>
        <div class="k-grilla">${(r.kpis || []).map(([n, t], i) => `<div class="k" style="transition-delay:${(.15 + i * .12).toFixed(2)}s"><b${num(n)}>${escH(n)}</b><span>${escH(t)}</span></div>`).join('')}</div>
        <p class="k-nota">${escH(r.nota || '')}</p></div>`;
      setTimeout(() => window.efectos.contar(el, 300), 50);
    }
    return el;
  }
  // La ventana del navegador se ajusta a la captura y al lugar: si la captura es
  // más alta, se corta y se recorre de arriba abajo (scroll) o se acerca despacio.
  function medir(el) {
    const W = escena.clientWidth || 1317, H = escena.clientHeight || 788, BARRA = 44;
    const par = el.classList.contains('par');
    el.querySelectorAll('.navegador').forEach((nav) => {
      const v = nav.querySelector('.vista'), img = v.querySelector('img');
      const listo = () => {
        const asp = img.naturalWidth / img.naturalHeight;
        const maxW = par ? W - 220 : W - 20, maxH = H - BARRA - 20;
        let w, h;
        if (v.classList.contains('recorre')) { w = Math.min(maxW, maxH * 1.6); h = Math.min(maxH, w / asp); }
        else { w = Math.min(maxW, maxH * asp); h = w / asp; }
        nav.style.width = Math.round(w) + 'px'; v.style.height = Math.round(h) + 'px';
        const sobra = w / asp - h;
        if (sobra > 8 && v.classList.contains('recorre')) {
          v.style.setProperty('--hasta', -sobra + 'px');
          v.style.setProperty('--t', Math.max(10, Math.min(40, sobra / 60)) + 's');
        } else v.classList.remove('recorre');
      };
      if (img.complete && img.naturalWidth) listo(); else { img.addEventListener('load', listo, { once: true }); img.addEventListener('error', () => nav.classList.add('sin-imagen'), { once: true }); }
    });
    el.querySelectorAll('.celular .vista').forEach((v) => {
      const img = v.querySelector('img');
      const listo = () => {
        const sobra = img.naturalHeight * v.clientWidth / img.naturalWidth - v.clientHeight;
        if (sobra > 8) { v.style.setProperty('--hasta', -sobra + 'px'); v.style.setProperty('--t', Math.max(10, Math.min(30, sobra / 50)) + 's'); }
        else v.classList.remove('recorre');
      };
      if (img.complete && img.naturalWidth) listo(); else img.addEventListener('load', listo, { once: true });
    });
  }

  // ---------------------------------------------------------------- panel
  function pintarPanel(p) {
    if (panelDe === p) return; panelDe = p;
    $('.cj-nombre').textContent = p.nombre;
    $('.cj-eje').textContent = p.eje;
    $('.cj-num').textContent = p.num;
    // Panel corto: el número del proyecto, su nombre y hasta tres cifras. Nada para leer.
    $('.cj-nombre2').textContent = p.nombre;
    $('.cj-datos').innerHTML = (p.cifras || []).slice(0, 3).map(([a, b]) => `<dd${numAttr(a)}>${escH(a)}</dd><dt>${escH(b)}</dt>`).join('');
    window.efectos.contar(cajon.querySelector('.panel'), 350);
  }
  function pintarPie() {
    const it = lista[idx];
    $('.cj-rec').textContent = it ? it.r.titulo || '' : '';
    $('.cj-puntos').innerHTML = lista.length > 1 ? lista.map((_, i) => `<i class="${i === idx ? 'on' : ''}"></i>`).join('') : '';
  }

  // ---------------------------------------------------------------- mostrar
  // congelado: mientras Migue responde en vivo, la vitrina espera; al cerrar sigue con
  // el tiempo que le quedaba a ese recurso (resto).
  let congelado = false, resto = 0;
  function programar(dur) {
    clearTimeout(timer); finAuto = 0;
    if (modo !== 'vitrina' || pausado || congelado || idx >= lista.length - 1) return;
    const d = dur || durDe(lista[idx].r); if (!isFinite(d)) return;
    finAuto = Date.now() + d;
    timer = setTimeout(() => { if (modo === 'vitrina' && !pausado && !congelado) mostrar(idx + 1); }, d);
  }
  function congelar(on) {
    if (on && !congelado) { congelado = true; resto = finAuto ? Math.max(2000, finAuto - Date.now()) : 0; clearTimeout(timer); finAuto = 0; }
    else if (!on && congelado) { congelado = false; programar(resto || undefined); resto = 0; }
  }
  function mostrar(n) {
    if (!modo) return;
    if (!lista.length) { escena.innerHTML = '<div class="rec on sin-rec"><p>Capturas en camino.</p></div>'; recEl = null; pintarPie(); return; }
    idx = Math.max(0, Math.min(lista.length - 1, n));
    const viejo = recEl;
    if (viejo) { viejo.classList.remove('on'); viejo.classList.add('sale'); try { viejo._salir && viejo._salir(); } catch (e) { } setTimeout(() => viejo.remove(), 800); }
    const { p, r } = lista[idx];
    pintarPanel(p);
    recEl = armar(r);
    escena.appendChild(recEl);
    medir(recEl);
    if (r.tipo === 'avance' && window.avance) {
      recEl._salir = window.avance.montar(recEl.querySelector('.avance-host'));
      // En la vitrina el avance arranca solo; en el cajón espera "Reproducir".
      if (modo === 'vitrina') { const esta = recEl; setTimeout(() => { if (recEl === esta) window.avance.reproducir(); }, 1400); }
    }
    const nuevo = recEl;
    requestAnimationFrame(() => requestAnimationFrame(() => nuevo.classList.add('on')));
    pintarPie();
    programar();
    window.informar && window.informar();
  }

  // ---------------------------------------------------------------- abrir / cerrar
  function origen(id) {
    const card = document.querySelector(`.slide.on .proy[data-proy="${id}"]`);
    const stage = document.getElementById('stage');
    document.querySelectorAll('.proy.elegido').forEach(x => x.classList.remove('elegido'));
    if (!card) { cajon.style.setProperty('--cx', '50%'); cajon.style.setProperty('--cy', '50%'); return; }
    const s = stage.getBoundingClientRect(), r = card.getBoundingClientRect(), k = s.width / stage.offsetWidth;
    cajon.style.setProperty('--cx', ((r.left + r.width / 2 - s.left) / k) + 'px');
    cajon.style.setProperty('--cy', ((r.top + r.height / 2 - s.top) / k) + 'px');
    card.classList.add('elegido');
  }
  function limpiar() {
    clearTimeout(timer); finAuto = 0; pausado = false;
    congelado = !!(window.vivoAbierto && window.vivoAbierto()); resto = 0;
    if (recEl) { try { recEl._salir && recEl._salir(); } catch (e) { } }
    escena.innerHTML = ''; recEl = null; panelDe = null;
  }
  function entrar(nuevoModo, nuevaClave, nuevaLista, directo) {
    limpiar();
    modo = nuevoModo; clave = nuevaClave; lista = nuevaLista; idx = 0;
    cajon.classList.toggle('directo', !!directo);
    cajon.classList.add('ver');
    mostrar(0);
    window.lugarMigue && window.lugarMigue();
    window.informar && window.informar();
  }
  // Cajón a mano (botonera): un proyecto.
  function abrir(id) {
    const p = buscar(id); if (!p) return false;
    if (modo === 'cajon' && clave === p.id) return true;
    if (!modo) origen(p.id);
    entrar('cajon', p.id, (p.recursos || []).map(r => ({ p, r })), false);
    return true;
  }
  // Vitrina (placa del recorrido): uno o varios proyectos seguidos.
  function vitrina(ids, solo) {
    const ps = String(ids).split(',').map(s => buscar(s.trim())).filter(Boolean);
    if (!ps.length) return false;
    // solo: 'ps' deja sólo los problema → solución (las capturas quedan para los cajones).
    const filtro = solo ? (r) => String(solo).split(',').includes(r.tipo) : () => true;
    entrar('vitrina', ids, ps.flatMap(p => (p.recursos || []).filter(filtro).map(r => ({ p, r }))), true);
    return true;
  }
  function cerrar(opc) {
    if (!modo) return;
    const directo = !!(opc && opc.directo);
    if (modo === 'cajon') {
      vistos.add(clave);
      document.querySelectorAll(`.proy[data-proy="${clave}"]`).forEach(x => { x.classList.remove('elegido'); x.classList.add('visto'); });
    }
    clearTimeout(timer); finAuto = 0;
    if (recEl) { try { recEl._salir && recEl._salir(); } catch (e) { } }
    modo = null; clave = null;
    cajon.classList.toggle('directo', directo);
    cajon.classList.remove('ver');
    setTimeout(() => { if (!modo) { escena.innerHTML = ''; recEl = null; panelDe = null; } }, directo ? 0 : 900);
    window.lugarMigue && window.lugarMigue();
    window.informar && window.informar();
  }

  window.cajones = {
    abrir, vitrina, cerrar,
    alternar: (id) => (modo === 'cajon' && clave === (buscar(id) || {}).id ? cerrar() : abrir(id)),
    // A mano: pasa al recurso y deja de pasar solo (para que no se mueva mientras explicás).
    recurso: (d) => { if (modo) { pausado = true; mostrar(idx + (d || 1)); } },
    irRecurso: (n) => { if (modo) { pausado = true; mostrar(n | 0); } },
    seguir: () => { if (modo) { pausado = false; programar(); window.informar && window.informar(); } },
    congelar,
    abiertoId: () => modo ? clave : null,
    modo: () => modo,
    tipoActual: () => lista[idx] && lista[idx].r.tipo,
    estado: () => ({
      abierto: modo ? clave : null, modo,
      nombre: lista[idx] ? lista[idx].p.nombre : '',
      idx, total: modo ? lista.length : 0,
      recurso: lista[idx] ? lista[idx].r.titulo : '',
      tipo: lista[idx] ? lista[idx].r.tipo : '',
      auto: !!finAuto, pausado, restante: finAuto ? Math.max(0, Math.round((finAuto - Date.now()) / 1000)) : 0,
      vistos: [...vistos],
    }),
    lista: () => C.PROYECTOS.map(p => ({ id: p.id, num: p.num, nombre: p.nombre, eje: p.eje })),
    // Todas las imágenes de los recursos, para precargarlas al empezar.
    imagenes: () => C.PROYECTOS.flatMap(p => (p.recursos || []).flatMap(r => [r.src, r.web && r.web.src, r.cel && r.cel.src])).filter(Boolean),
  };
})();
