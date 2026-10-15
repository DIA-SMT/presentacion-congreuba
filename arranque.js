// =====================================================================
// CONTROLES: teclado, clicker y botonera del celular. Y el estado que la
// pantalla le manda al celular cada vez que algo cambia.
// =====================================================================
let destino = null; // placa a la que se está yendo durante la cortina
function cambiar(n) {
  n = Math.max(0, Math.min(placas.length - 1, n));
  if (n === (destino != null ? destino : actual)) return;
  // Cambiar de placa cierra la pregunta en vivo; el cajón o la vitrina se cambian en irA, bajo la cortina.
  if (window.vivoAbierto()) window.vivo.cerrar();
  if (destino == null && placas[n].dataset.transicion !== 'suave') {
    destino = n;
    window.efectos.cortina(() => { const d = destino; destino = null; irA(d); });
  } else if (destino != null) destino = n;
  else irA(n);
}
const base = () => (destino != null ? destino : actual);
let destinoDesde = 0;
setInterval(() => { if (destino != null) { if (!destinoDesde) destinoDesde = Date.now(); else if (Date.now() - destinoDesde > 2500) { const d = destino; destino = null; destinoDesde = 0; irA(d); } } else destinoDesde = 0; }, 500);

let ultimoError = null;
// Identidad de esta pantalla: si quedan dos abiertas con el mismo código, la botonera sigue a la última que arrancó.
const PANTALLA = Math.random().toString(36).slice(2, 8);
function ejecutar(c) {
  try { ejecutar1(c); }
  catch (e) { ultimoError = { cmd: c && c.cmd, msg: String(e && e.message || e), t: Date.now() }; console.warn('Orden con error', c, e); }
  setTimeout(informar, 60);
}
function ejecutar1(c) {
  switch (c.cmd) {
    case 'siguiente': cambiar(base() + 1); break;
    case 'anterior': cambiar(base() - 1); break;
    case 'ir': cambiar(c.n | 0); break;
    case 'migue': migue.decir(c.n != null ? c.n : undefined); break;
    case 'callar': migue.callar(); break;
    case 'repetir': migue.repetir(); break;
    case 'reiniciar': migue.reiniciar(); break;
    case 'migue-atras': migue.atras(); break;
    case 'ocultar': migue.alternar(); break;
    // "proyecto" y no "id": el campo id lo usa remoto.js para no ejecutar dos veces la misma orden.
    case 'cajon': window.cajones.alternar(c.proyecto); break;
    case 'cajon-cerrar': window.cajones.cerrar(); break;
    case 'recurso': window.cajones.recurso(c.d || 1); break;
    case 'seguir': window.cajones.seguir(); break;
    case 'ir-recurso': window.cajones.irRecurso(c.n); break;
    case 'reproducir': window.avance.reproducir(); break;
    case 'preguntar': c.texto ? window.vivo.preguntar(c.texto) : window.vivo.preguntarN(c.n | 0); break;
    case 'preguntar-siguiente': window.vivo.preguntarSiguiente(); break;
    case 'cerrar-pregunta': window.vivo.cerrar(); break;
    case 'qr': window.efectos.qr(c.on); break;
    case 'negro': window.efectos.negro(c.on); break;
    case 'foco': window.efectos.foco(c.on); break;
  }
}
window.presentacion = { ejecutar, debug: () => migue.debug() }; // para probar desde la consola

let empezado = false, inicioCharla = 0;
async function empezar() {
  if (empezado) return; empezado = true; inicioCharla = Date.now();
  document.getElementById('inicio').style.display = 'none';
  // Sin esperar: en algunos navegadores el pedido de pantalla completa nunca contesta.
  try { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => { }); } catch (e) { }
  // La placa primero: el audio no puede demorar la presentación.
  irA(0);
  despierta();
  precargar();
  await conTope(migue.desbloquear(), 4000);
}
// Que la compu de la pantalla no se apague ni ponga el protector en medio del panel.
let candadoPantalla = null;
async function despierta() { try { if ('wakeLock' in navigator && !candadoPantalla) { candadoPantalla = await navigator.wakeLock.request('screen'); candadoPantalla.addEventListener('release', () => { candadoPantalla = null; }); } } catch (e) { } }
document.addEventListener('visibilitychange', () => { if (empezado && document.visibilityState === 'visible') despierta(); });
// Precarga: todas las capturas de las vitrinas y el mapa del avance, para que nada aparezca a medio cargar.
let precarga = { listas: 0, total: 0 };
function precargar() {
  const urls = [...new Set(window.cajones.imagenes())]; precarga.total = urls.length;
  let i = 0; const una = () => { if (i >= urls.length) return; const im = new Image(); im.onload = im.onerror = () => { precarga.listas++; una(); }; im.src = urls[i++]; };
  una(); una(); una();
  try { window.avance.precalentar(); } catch (e) { }
}
document.querySelector('#inicio .ini-boton').addEventListener('click', empezar);
document.getElementById('inicio').addEventListener('click', (e) => { if (!e.target.closest('#vinculo')) empezar(); });

addEventListener('keydown', (e) => {
  if (e.target && e.target.closest && e.target.closest('#vinculo')) return;
  if (!empezado && ['q', 'Q', 't', 'T'].includes(e.key)) { const v = document.getElementById('vinculo'); v.hidden = !v.hidden; return; }
  if (!empezado) { empezar(); return; }
  const k = e.key;
  if (['ArrowRight', 'PageDown', ' ', 'ArrowDown'].includes(k)) { e.preventDefault(); cambiar(base() + 1); }
  else if (['ArrowLeft', 'PageUp', 'ArrowUp', 'Backspace'].includes(k)) { e.preventDefault(); cambiar(base() - 1); }
  else if (k >= '1' && k <= '9') { const p = window.CONTENIDO.PROYECTOS[+k - 1]; if (p) window.cajones.alternar(p.id); }
  else if (k === 'Escape') { if (window.vivoAbierto()) window.vivo.cerrar(); else window.cajones.cerrar(); }
  else if (k === ']') window.cajones.recurso(1);
  else if (k === '[') window.cajones.recurso(-1);
  else if (k === 'p' || k === 'P') window.avance.reproducir();
  else if (k === 'k' || k === 'K') window.vivo.preguntarSiguiente();
  else if (k === 'x' || k === 'X') window.vivo.cerrar();
  else if (k === 'l' || k === 'L') window.efectos.foco();
  else if (k === 'q' || k === 'Q') window.efectos.qr();
  else if (k === 'z' || k === 'Z') migue.atras();
  else if (k === 'n' || k === 'N') { e.preventDefault(); migue.anterior(); }
  else if (['Enter', 'm', 'M', 'b', 'B', '.'].includes(k)) { e.preventDefault(); migue.decir(); }
  else if (k === '0') migue.reiniciar();
  else if (['c', 'C', 's', 'S'].includes(k)) migue.callar();
  else if (k === 'r' || k === 'R') migue.repetir();
  else if (k === 'h' || k === 'H') migue.alternar();
  else if (k === 'f' || k === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => { }); }
  else if (k === '?') document.getElementById('ayuda').classList.toggle('ver');
  setTimeout(informar, 60);
});
let mouseTimer; addEventListener('mousemove', () => { document.body.classList.add('cursor'); clearTimeout(mouseTimer); mouseTimer = setTimeout(() => document.body.classList.remove('cursor'), 2000); });

// Control remoto (celular): por Supabase si está publicada, o por server.js en la compu.
const remoto = window.Remoto.iniciar({
  rol: 'pantalla',
  // Si nadie tocó Comenzar, la primera orden del celular arranca la presentación igual
  // (Migue habla sin sonido hasta que alguien toque la pantalla).
  alRecibirComando: async (c) => { if (!empezado) { await empezar(); if (c.cmd === 'siguiente') return informar(); } ejecutar(c); },
});
remoto.pedirEstado = () => informar();
setInterval(() => informar(), 2000); // latido: el celular sabe que la pantalla sigue ahí

// AVISO DE MIGUE: en la placa donde va su próxima frase ("MIGUE n" en las notas)
// aparecen tres puntitos al lado de Migue y late el botón en el celular.
placas.forEach(p => { const m = (p.dataset.notas || '').match(/MIGUE (\d+)/g); if (m) p.dataset.frases = m.map(x => x.split(' ')[1]).join(','); });
function tocaMigue() {
  const p = placas[actual], fr = (p.dataset.frases || '').split(',').filter(Boolean).map(Number);
  const cont = document.getElementById('migue');
  return !!(empezado && fr.includes(migue.proximo() + 1) && !migue.hablando && !cont.classList.contains('oculto'));
}
setInterval(() => {
  const m = tocaMigue();
  const cont = document.getElementById('migue');
  if (m !== cont.classList.contains('quiere-hablar')) { cont.classList.toggle('quiere-hablar', m); informar(); }
}, 300);

// Pantalla de inicio: QR para abrir la botonera ya vinculada, y si hay un celular conectado.
(async function vincular() {
  const caja = document.getElementById('vinculo'), qr = document.getElementById('vinculoQr'), est = document.getElementById('vinculoEstado');
  caja.addEventListener('click', (e) => e.stopPropagation());
  if (remoto.modo === 'sin-sala' || remoto.modo === 'ninguno') {
    qr.style.display = 'none';
    est.querySelector('span').textContent = remoto.modo === 'ninguno' ? 'Sin control remoto en este modo' : 'Sin código, el celular no puede manejar la presentación';
    if (remoto.modo === 'sin-sala') {
      caja.hidden = false;
      const f = document.getElementById('vinculoForm'); f.hidden = false;
      f.addEventListener('submit', (e) => { e.preventDefault(); const v = document.getElementById('vinculoCodigo').value.trim(); if (v) remoto.guardarSala(v); });
    }
    return;
  }
  const link = await remoto.linkControl();
  try { const q = qrcode(0, 'M'); q.addData(link); q.make(); qr.innerHTML = q.createSvgTag({ cellSize: 8, margin: 0, scalable: true }); } catch (e) { qr.textContent = link; }
  const pintar = async () => {
    const ok = await remoto.controlVivo();
    est.classList.toggle('ok', ok);
    est.querySelector('span').textContent = ok ? 'Celular conectado' : 'Escaneá con el celular';
  };
  pintar(); setInterval(pintar, 1500);
})();

function informar() {
  const p = placas[actual];
  const tit = q => {
    if (q.dataset.titulo) return q.dataset.titulo;
    const h = q.querySelector('.titular h1, .p-titulo'), b = q.querySelector('.barra-tit, .subt');
    return ((h ? h.textContent : '') + (b ? ' · ' + b.textContent : '')).replace(/\s+/g, ' ').trim();
  };
  const m = migue.listos(), v = window.vivo.chequeo();
  const estado = {
    placa: actual + 1, total: placas.length,
    pantalla: PANTALLA,
    titulo: tit(p),
    siguiente: placas[actual + 1] ? tit(placas[actual + 1]) : 'Fin',
    error: ultimoError,
    guion: p.dataset.guion || '',
    notas: p.dataset.notas || '',
    placas: placas.map((q, i) => (i + 1) + '. ' + tit(q).slice(0, 56)),
    empezado, desde: inicioCharla,
    hablando: migue.hablando, proximo: migue.proximo(), actual: migue.actual(),
    oculto: document.getElementById('migue').classList.contains('oculto'),
    videos: VIDEOS.map(x => x.texto),
    fraseProxima: (() => { const x = VIDEOS[migue.proximo()]; return x ? (x.sub || x.texto) : ''; })(),
    tocaMigue: tocaMigue(),
    proyectos: window.cajones.lista(),
    cajon: window.cajones.estado(),
    avance: window.avance.estado(),
    vivo: window.vivo.estado(), preguntas: window.vivo.preguntas(),
    efectos: window.efectos.estado(),
    chequeo: { imagenes: precarga.listas, totalImagenes: precarga.total, videos: m.listos, totalVideos: m.total, respuestas: v.listas, totalRespuestas: v.total, codigo: v.codigo, avance: window.avance.estado().datos },
    version: window.UBA_VERSION || 'vieja',
  };
  remoto.enviarEstado(estado);
}
window.informar = informar;

// Abierta como archivo (doble clic en index.html) el navegador no deja recortar el video de Migue.
if (location.protocol === 'file:') {
  document.querySelector('#inicio small').textContent = 'Abierta como archivo, Migue no se puede mostrar. Abrila con INICIAR.bat o desde el link publicado.';
}

// La pantalla negra también oscurece las franjas de los costados.
new MutationObserver(() => {
  document.body.classList.toggle('negro', document.getElementById('negro').classList.contains('ver'));
}).observe(document.getElementById('negro'), { attributes: true, attributeFilter: ['class'] });
addEventListener('resize', ajustar);
ajustar();
placas[0].classList.add('on');
informar();
// Las respuestas de Migue para las preguntas de la botonera se preparan apenas abre la pantalla.
setTimeout(() => window.vivo.precargar(), 1500);
