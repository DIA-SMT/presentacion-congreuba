// =====================================================================
// CIMBA · AVANCE, RECREADO
// La pantalla "Avance" de CIMBA, con los datos congelados en
// datos/cimba-avance.js (sin direcciones, sin fotos, sin personas: solo
// punto, día, empresa y m² de cada trabajo terminado). Espera quieta hasta
// que se toca "Reproducir" en la botonera (o la tecla P): los días corren,
// los baches aparecen en el mapa con el color de su empresa, y suben el
// contador, los m² y las barras de cada día. Al terminar queda en hoy.
// =====================================================================
(function () {
  const D = window.CIMBA_AVANCE || null;
  // Colores fijos por empresa, los mismos de CIMBA (lib/color-empresa.ts).
  const COLOR = { administracion: '#f4dc00', proycon: '#f2a33c', ingeco: '#3ec9a7', galindo: '#4f9cf9', calleri: '#b18cff', antonelli: '#e06fae', linea: '#9ecf4a', lechesi: '#ef7d54', baronetto: '#6fd1e8', sercovial: '#ff8fa3', luxury: '#c9b458', contratuc: '#8f9bff', uocra: '#d4a373', otros: '#9aa3b2' };
  const clave = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/\s+/)[0];
  const colorDe = (s) => COLOR[clave(s)] || '#9aa3b2';
  const ESTILO = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
  const DURACION = 18000; // como "Todo" en CIMBA: seis meses en 18 segundos
  const fmt = (n) => Math.round(n).toLocaleString('es-AR');
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const fechaDia = (dia) => { const f = new Date(Date.UTC(2026, 0, 1 + dia)); return f.getUTCDate() + ' de ' + MESES[f.getUTCMonth()]; };

  let raiz = null, mapa = null, mapaListo = false, lienzo = null, barras = null;
  let cursor = null, corriendo = false, raf = null, t0 = 0;
  let acumN = [], acumM2 = [], porDia = [], porEmpresa = [], desde = 0, hasta = 0;

  function preparar() {
    if (!D || acumN.length) return;
    desde = D.desdeDia; hasta = D.hoyDia;
    const dias = hasta - desde + 1;
    porDia = new Array(dias).fill(0);
    const m2Dia = new Array(dias).fill(0);
    porEmpresa = D.empresas.map(() => new Array(dias).fill(0));
    for (const [, , dia, e, m2] of D.puntos) {
      const i = Math.max(0, Math.min(dias - 1, dia - desde));
      porDia[i]++; m2Dia[i] += m2 || 0; porEmpresa[e][i]++;
    }
    let n = 0, m = 0;
    acumN = porDia.map(x => (n += x)); acumM2 = m2Dia.map(x => (m += x));
    // Los m² de cada punto vienen redondeados: se ajustan para cerrar con el total de CIMBA.
    const totM2 = D.cifras && D.cifras.total && D.cifras.total.m2; if (totM2 && m) acumM2 = acumM2.map(x => x * totM2 / m);
    porEmpresa = porEmpresa.map(a => { let s = 0; return a.map(x => (s += x)); });
  }

  function armarDom() {
    raiz = document.createElement('div');
    raiz.className = 'avance';
    raiz.innerHTML = `
      <div class="av-mapa"><div class="av-gl"></div><canvas class="av-plano"></canvas>
        <div class="av-fecha"><span>Desde el 15 de marzo</span><b>—</b></div>
        <div class="av-boton"><i>▶</i>Reproducir</div></div>
      <div class="av-riel">
        <p class="ceja">Avance · toda la ciudad</p>
        <div class="av-total"><b data-av="n">0</b><span>baches</span></div>
        <p class="av-m2"><b data-av="m2">0</b> m² reparados</p>
        <p class="ceja av-ritmo">Baches por día</p>
        <canvas class="av-barras"></canvas>
        <div class="av-empresas"></div>
        <p class="av-fuente">CIMBA · datos al ${D ? D.hoy.split('-').reverse().join('/') : '—'} · sin datos personales</p>
      </div>`;
    lienzo = raiz.querySelector('.av-plano');
    barras = raiz.querySelector('.av-barras');
    const emp = raiz.querySelector('.av-empresas');
    emp.innerHTML = D.empresas.map((e, i) => `<span data-e="${i}"><i style="background:${colorDe(e)}"></i>${e}<em>0</em></span>`).join('');
    // Mapa base de CARTO (como en CIMBA); si no carga, los puntos se dibujan solos sobre un plano.
    if (window.maplibregl) {
      try {
        mapa = new maplibregl.Map({ container: raiz.querySelector('.av-gl'), style: ESTILO, center: D.centro || [-65.2337, -26.8122], zoom: D.zoom || 12.55, interactive: false, attributionControl: false, fadeDuration: 0 });
        mapa.on('load', () => {
          mapa.addSource('hechos', { type: 'geojson', data: { type: 'FeatureCollection', features: D.puntos.map(([lon, lat, dia, e]) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [lon, lat] }, properties: { d: dia, c: colorDe(D.empresas[e]) } })) } });
          mapa.addLayer({ id: 'brillo', type: 'circle', source: 'hechos', filter: ['==', ['get', 'd'], -1], paint: { 'circle-radius': 11, 'circle-color': ['get', 'c'], 'circle-opacity': .35, 'circle-blur': .6 } });
          mapa.addLayer({ id: 'puntos', type: 'circle', source: 'hechos', filter: ['<=', ['get', 'd'], -1], paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 2.4, 14, 4.5], 'circle-color': ['get', 'c'], 'circle-stroke-width': .6, 'circle-stroke-color': '#ffffff', 'circle-opacity': .92 } });
          mapaListo = true; pintar();
        });
        mapa.on('error', () => { /* sin teselas: queda el plano de respaldo */ });
      } catch (e) { mapa = null; }
    }
  }

  // Plano de respaldo (sin internet): los puntos sobre el fondo, proyectados a mano.
  function plano() {
    if (mapaListo || !lienzo) { if (lienzo) lienzo.style.display = 'none'; return; }
    const w = lienzo.clientWidth, h = lienzo.clientHeight, dpr = window.devicePixelRatio || 1;
    if (lienzo.width !== Math.round(w * dpr)) { lienzo.width = Math.round(w * dpr); lienzo.height = Math.round(h * dpr); }
    const x = lienzo.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
    const [cx, cy] = D.centro || [-65.2337, -26.8122], esc = (D.escalaPlano || 5200) * (w / 880), k = Math.cos(cy * Math.PI / 180);
    for (const [lon, lat, dia, e] of D.puntos) {
      if (cursor == null || dia > cursor) continue;
      x.fillStyle = colorDe(D.empresas[e]);
      x.beginPath(); x.arc(w / 2 + (lon - cx) * esc * k, h / 2 - (lat - cy) * esc, dia > cursor - 3 ? 4.5 : 2.6, 0, 7); x.fill();
    }
  }

  function pintar() {
    if (!raiz || !D) return;
    const i = cursor == null ? -1 : Math.min(hasta, cursor) - desde;
    const n = i >= 0 ? acumN[i] : 0, m2 = i >= 0 ? acumM2[i] : 0;
    raiz.querySelector('[data-av="n"]').textContent = fmt(n);
    raiz.querySelector('[data-av="m2"]').textContent = fmt(m2);
    raiz.querySelector('.av-fecha b').textContent = cursor == null ? 'Listo para reproducir' : fechaDia(Math.min(cursor, hasta));
    raiz.querySelectorAll('.av-empresas span').forEach((s) => { const e = +s.dataset.e; s.querySelector('em').textContent = fmt(i >= 0 ? porEmpresa[e][i] : 0); s.classList.toggle('activa', i >= 0 && porEmpresa[e][i] > 0); });
    if (mapaListo) {
      const c = cursor == null ? -1 : cursor;
      mapa.setFilter('puntos', ['<=', ['get', 'd'], c]);
      mapa.setFilter('brillo', ['all', ['<=', ['get', 'd'], c], ['>', ['get', 'd'], c - 4]]);
    } else plano();
    dibujarBarras(i);
  }
  function dibujarBarras(i) {
    const w = barras.clientWidth, h = barras.clientHeight, dpr = window.devicePixelRatio || 1;
    if (!w) return;
    if (barras.width !== Math.round(w * dpr)) { barras.width = Math.round(w * dpr); barras.height = Math.round(h * dpr); }
    const x = barras.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
    // Tope en el percentil 97: dos días de cargas por planilla no aplastan al resto.
    const orden = porDia.filter(x => x > 0).sort((p, q) => p - q), max = Math.max(1, orden[Math.floor(orden.length * .97)] || 1), n = porDia.length, bw = w / n;
    for (let k = 0; k < n; k++) {
      const v = Math.min(1, porDia[k] / max) * (h - 6);
      x.fillStyle = k <= i ? (k > i - 4 ? '#111a3b' : '#3a4366') : 'rgba(17,26,59,.08)';
      x.fillRect(k * bw, h - Math.max(1, v), Math.max(1, bw - 1), Math.max(1, v));
    }
  }

  function cuadro(t) {
    const k = Math.min(1, (t - t0) / DURACION);
    cursor = Math.round(desde + (hasta - desde) * k);
    pintar();
    if (k < 1 && corriendo) raf = requestAnimationFrame(cuadro);
    else { corriendo = false; raiz && raiz.classList.remove('corriendo'); window.informar && window.informar(); }
  }
  function reproducir() {
    if (!raiz || !D) return;
    cancelAnimationFrame(raf);
    corriendo = true; raiz.classList.add('corriendo', 'empezo'); t0 = performance.now();
    raf = requestAnimationFrame(cuadro);
    window.informar && window.informar();
  }

  window.avance = {
    // Lo pone en el cajón; devuelve la función para sacarlo.
    montar(host) {
      if (!D) { host.innerHTML = '<div class="av-falta"><b>Avance de CIMBA</b><p>Faltan los datos (datos/cimba-avance.js).</p></div>'; return () => { }; }
      preparar();
      if (!raiz) armarDom();
      host.appendChild(raiz);
      cancelAnimationFrame(raf); corriendo = false; cursor = null; raiz.classList.remove('corriendo', 'empezo');
      requestAnimationFrame(() => { mapa && mapa.resize(); pintar(); });
      return () => { cancelAnimationFrame(raf); corriendo = false; };
    },
    reproducir,
    // Arma el mapa al empezar, escondido, para que las teselas ya estén cuando llegue la vitrina.
    precalentar() {
      if (!D || raiz) return; preparar(); armarDom();
      const h = document.createElement('div');
      h.style.cssText = 'position:absolute;left:0;top:0;width:1317px;height:788px;visibility:hidden;pointer-events:none;z-index:-1';
      document.getElementById('stage').appendChild(h); h.appendChild(raiz);
      setTimeout(() => { mapa && mapa.resize(); pintar(); }, 300);
    },
    redimensionar() { if (mapa && raiz && raiz.isConnected) mapa.resize(); },
    estado: () => ({ datos: !!D, corriendo, mapa: mapaListo, montado: !!(raiz && raiz.isConnected) }),
  };
})();
