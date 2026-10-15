// =====================================================================
// PREGUNTALE A MIGUE, EN VIVO
// La pregunta va al chat real de Migue por el puente api/preguntar.js (el
// navegador no puede llamar directo a migue.smt.gob.ar). Las preguntas de
// contenido.js se preparan al abrir la pantalla, para que en el panel la
// respuesta salga al instante; una pregunta nueva escrita desde el celular
// va en vivo, con reintentos y una respuesta de cortesía si Migue no contesta.
// =====================================================================
(function () {
  const PREGUNTAS = (window.CONTENIDO.PREGUNTAS || []).slice();
  const vivoEl = document.getElementById('vivo'), hilo = vivoEl.querySelector('.hilo');
  const stage = document.getElementById('stage');
  const sesion = 'uba-' + Date.now().toString(36);
  const guardadas = new Map();
  let estadoVivo = null, tipeo = null, proxima = 0, codigo = 'probando', precargando = false, ultimaPregunta = '';
  const escapar = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function formatear(t) {
    return escapar(t.trim())
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<b>$1</b>')
      .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '$1')
      .replace(/^\s*[-•]\s+/gm, '• ').replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>');
  }
  // Escribe el HTML de a poco, sin partir las etiquetas.
  function tipear(el, html, alTerminar) {
    const partes = html.split(/(<[^>]+>)/).filter(Boolean);
    let i = 0, j = 0, hecho = '';
    clearInterval(tipeo);
    tipeo = setInterval(() => {
      let n = 3;
      while (n-- > 0 && i < partes.length) {
        const p = partes[i];
        if (p.startsWith('<')) { hecho += p; i++; continue; }
        hecho += p[j++]; if (j >= p.length) { i++; j = 0; }
      }
      el.innerHTML = hecho;
      if (i >= partes.length) { clearInterval(tipeo); alTerminar && alTerminar(); }
    }, 20);
  }
  async function consultar(texto, n, esperaMax) {
    const sala = (window.Remoto && window.Remoto.sala) || '';
    const ctrl = new AbortController(); const corte = setTimeout(() => ctrl.abort(), esperaMax);
    try {
      const r = await fetch('api/preguntar', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-sala': sala }, body: JSON.stringify({ mensaje: texto, sessionId: sesion + '-' + n }), signal: ctrl.signal });
      const j = await r.json().catch(() => ({}));
      if (r.status === 403) { codigo = 'mal'; const e = new Error('sala'); e.status = 403; throw e; }
      if (!r.ok || !j.respuesta) { const e = new Error(j.error || 'HTTP ' + r.status); e.status = r.status; throw e; }
      codigo = 'ok';
      return j.respuesta;
    } finally { clearTimeout(corte); }
  }
  // Las respuestas preparadas quedan guardadas en este navegador 12 horas: así
  // abrir y recargar la presentación no le suma consultas de prueba a Migue
  // (cada una cuenta en su panel y en el clima ciudadano).
  const CACHE = 'uba-respuestas-migue', VIDA = 12 * 3600 * 1000;
  try {
    const c = JSON.parse(localStorage.getItem(CACHE) || '{}');
    Object.entries(c).forEach(([p, v]) => { if (v && Date.now() - v.t < VIDA && PREGUNTAS.includes(p)) guardadas.set(p, v.r); });
  } catch (e) { }
  function recordar(p, r) {
    try { const c = JSON.parse(localStorage.getItem(CACHE) || '{}'); c[p] = { r, t: Date.now() }; localStorage.setItem(CACHE, JSON.stringify(c)); } catch (e) { }
  }
  // Prepara las respuestas de las preguntas de la botonera; reintenta cada 20 s las que falten.
  async function precargar() {
    if (precargando) return; precargando = true;
    for (let i = 0; i < PREGUNTAS.length; i++) {
      if (guardadas.has(PREGUNTAS[i])) continue;
      try { const r = await consultar(PREGUNTAS[i], 'p' + i, 60000); guardadas.set(PREGUNTAS[i], r); recordar(PREGUNTAS[i], r); }
      catch (e) { if (e.status === 403) break; }
      avisar();
    }
    precargando = false; avisar();
    if (guardadas.size < PREGUNTAS.length && codigo !== 'mal') setTimeout(precargar, 20000);
  }
  function mostrar(texto) {
    clearInterval(tipeo);
    vivoEl.classList.add('ver'); stage.classList.add('envivo');
    hilo.innerHTML = `<div class="preg">${escapar(texto)}</div><div class="resp"><img src="img/migue/migue-cara.png" alt=""><div class="txt"><div class="pensando"><i></i><i></i><i></i></div></div></div>`;
    window.lugarMigue && window.lugarMigue();
    return hilo.querySelector('.resp .txt');
  }
  function escribir(txt, respuesta) {
    if (respuesta.length > 420) txt.classList.add('chica');
    estadoVivo = 'respondiendo'; avisar();
    tipear(txt, formatear(respuesta), () => { estadoVivo = 'respondida'; avisar(); });
  }
  async function preguntar(texto) {
    texto = String(texto || '').trim().slice(0, 400);
    if (!texto) return;
    ultimaPregunta = texto;
    const txt = mostrar(texto);
    estadoVivo = 'pensando'; avisar();
    if (guardadas.has(texto)) { setTimeout(() => { if (estadoVivo === 'pensando' && ultimaPregunta === texto) escribir(txt, guardadas.get(texto)); }, 1500); return; }
    for (let intento = 0; intento < 3; intento++) {
      try { const r = await consultar(texto, 'v' + Date.now().toString(36), 40000); if (estadoVivo !== 'pensando' || ultimaPregunta !== texto) return; guardadas.set(texto, r); escribir(txt, r); return; }
      catch (e) { if (e.status === 403) break; await new Promise(ok => setTimeout(ok, 1200)); }
    }
    if (estadoVivo !== 'pensando' || ultimaPregunta !== texto) return;
    escribir(txt, 'Uy, justo ahora no puedo ir a buscar ese dato. Preguntámelo en un ratito desde smt.gob.ar o por Telegram y te respondo.');
  }
  function preguntarN(n) { const t = PREGUNTAS[n]; if (t) { proxima = n + 1; preguntar(t); } }
  function preguntarSiguiente() { preguntarN(proxima % PREGUNTAS.length); }
  function cerrar() { clearInterval(tipeo); vivoEl.classList.remove('ver'); stage.classList.remove('envivo'); estadoVivo = null; avisar(); window.lugarMigue && window.lugarMigue(); }
  function avisar() { window.informar && window.informar(); }
  window.vivoAbierto = () => vivoEl.classList.contains('ver');
  window.vivo = {
    preguntar, preguntarN, preguntarSiguiente, cerrar, precargar,
    estado: () => estadoVivo,
    preguntas: () => PREGUNTAS.map(p => ({ texto: p, lista: guardadas.has(p) })),
    proxima: () => PREGUNTAS[proxima % PREGUNTAS.length],
    chequeo: () => ({ codigo, listas: PREGUNTAS.filter(p => guardadas.has(p)).length, total: PREGUNTAS.length }),
    respuestas: () => Object.fromEntries(guardadas), // para revisar desde la consola
  };
})();
