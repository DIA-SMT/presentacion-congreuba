// =====================================================================
// ESCENARIO, PLACAS Y MIGUE
// Mismo motor que las presentaciones de Migue y de SMT EstudIA: placas de 1080
// de alto que se estiran a lo ancho, y Migue con el verde recortado en vivo.
// =====================================================================
const C = window.CONTENIDO;
const VIDEOS = C.VIDEOS;
const BUSTO = C.FORMATO_MIGUE === 'busto';
const LW = BUSTO ? 520 : 440, LH = 640, LADO_BUSTO = 520;
// Animaciones de espera de cuerpo entero (sin sonido).
const LOOPS = BUSTO ? [] : ['media/migueloop1.mp4', 'media/migueloop2.mp4', 'media/migueloop3.mp4'];
const ALTO_MIGUE = 560;
const PIES_Y = 596, CENTRO_X = 220;
// Medidas de la figura en cada tipo de video: los de habla son 896×1024 y los
// loops 720×1280 con franjas negras (los de la presentación de Migue).
const GEO = {
  habla: { figura: 908, pies: 956, centro: 448, recorte: [0, 0, 896, 1024] },
  busto: { busto: true },
  loop:  { figura: 698, pies: 982, centro: 360, recorte: [0, 252, 720, 1026] },
};
const CROMA = { desde: 0.24, hasta: 0.42 };
// Si cambia el tamaño de la ventana (o el proyector cambia de resolución), se reacomoda.
let ultimoTam = '';
setInterval(() => { const t = innerWidth + 'x' + innerHeight; if (t !== ultimoTam) { ultimoTam = t; try { ajustar(); } catch (e) { } } }, 700);
// Una espera con tope: sin un toque en la pantalla, el navegador deja el audio en suspenso para siempre.
const conTope = (promesa, ms) => Promise.race([promesa, new Promise(ok => setTimeout(ok, ms))]);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// =====================================================================
// ESCENARIO
// =====================================================================
const stage = document.getElementById('stage');
function ajustar() {
  const ancho = Math.round(Math.min(2400, Math.max(1920, 1080 * innerWidth / innerHeight)));
  stage.style.width = ancho + 'px';
  stage.style.setProperty('--extra', (ancho - 1920) + 'px');
  const s = Math.min(innerWidth / ancho, innerHeight / 1080);
  stage.style.transformOrigin = '50% 50%';
  stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  migue.ajustarResolucion(s);
  window.avance && window.avance.redimensionar && window.avance.redimensionar();
}

// Encabezado del congreso y logo de la ciudad en las placas de contenido y en
// el cajón (la portada y el cierre traen la franja de logos de la organización).
const ENCAB = '<p class="encab">Celebrando Magnífica Humanitas · Dr. Marco Rossi</p><img class="logo-sup" src="img/logos/logo-horizontal-color.png" alt="">';
document.querySelectorAll('.slide:not(.portada)').forEach((p) => p.insertAdjacentHTML('afterbegin', ENCAB));
document.getElementById('cajon').insertAdjacentHTML('afterbegin', ENCAB);

// Las tarjetas de los proyectos (placa 4), armadas con contenido.js.
(function tarjetas() {
  const caja = document.getElementById('proyectos'); if (!caja) return;
  caja.innerHTML = C.PROYECTOS.map((p, i) => `
    <article class="proy a" style="--d:${(.15 + i * .1).toFixed(2)}s" data-proy="${esc(p.id)}">
      <header><em>${esc(p.num)}</em>${esc(p.nombre)}</header>
      <div>
        <span class="ceja">${esc(p.eje)}</span>
        <b>${esc(p.idea || '')}</b>
        <p>${esc(p.corta || p.bajada)}</p>
        <span class="p-estado${/piloto|desarrollo/i.test(p.estado) ? ' piloto' : ''}"><i></i>${esc(p.estado)}</span>
      </div>
    </article>`).join('');
})();

// Logos de la organización en la portada y el cierre, en las cajas exactas del template (franja.js).
(function logos() {
  const L = window.LOGOS_TEMPLATE || [];
  const html = L.map(o => {
    if (o.t === 'img') return `<img src="${esc(o.src)}" alt="${esc(o.n || '')}" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px">`;
    if (o.t === 'txt') return `<span class="rot" style="left:${o.x}px;top:${o.y}px;font-size:${o.s}px">${esc(o.texto)}</span>`;
    if (o.t === 'linea') return `<i class="filete" style="left:${o.x}px;top:${o.y}px;width:${o.w}px"></i>`;
    return '';
  }).join('');
  document.querySelectorAll('[data-logos]').forEach(el => { el.innerHTML = html; });
})();

// =====================================================================
// PLACAS
// =====================================================================
const placas = [...document.querySelectorAll('.slide:not([data-oculta])')];
let actual = 0;
const globo = document.getElementById('globo');
let globoTimer = null;

function irA(n) {
  n = Math.max(0, Math.min(placas.length - 1, n));
  const antes = placas[actual];
  if (antes && antes !== placas[n]) antes.classList.remove('on');
  actual = n;
  const p = placas[n];
  // Vitrinas: el cajón de la placa anterior se cierra y el de esta entra sin animación (lo tapa la cortina).
  try {
    if (window.cajones && window.cajones.modo()) window.cajones.cerrar({ directo: true });
    if (p.dataset.vitrina && window.cajones) window.cajones.vitrina(p.dataset.vitrina);
  } catch (e) { console.warn('vitrina', e); }
  p.classList.remove('on'); void p.offsetWidth; p.classList.add('on');
  window.efectos.contar(p);
  lugarMigue();
  mostrarGlobo(p);
  informar();
}
// Dónde está Migue: el lado de la placa, o a la derecha si habla en una placa sin él.
let ladoMigue = 'der', cambioLado = null, salidaMigue = null;
function lugarMigue() {
  const cont = document.getElementById('migue'), p = placas[actual];
  const tapado = document.getElementById('cajon').classList.contains('ver');
  const quiere = tapado && !migue.hablando ? 'no' : (p.dataset.migue && p.dataset.migue !== 'no' ? p.dataset.migue : (migue.hablando || window.vivoAbierto && window.vivoAbierto() ? 'der' : 'no'));
  clearTimeout(cambioLado);
  const fuera = cont.classList.contains('fuera');
  if (migue.hablando && !fuera) return;
  if (quiere === 'no') { cont.classList.add('fuera'); return; }
  const ubicar = () => { ladoMigue = quiere; cont.classList.toggle('izq', quiere === 'izq'); stage.classList.toggle('migue-izq', quiere === 'izq'); };
  if (quiere === ladoMigue) { cont.classList.remove('fuera'); return; }
  if (fuera) { ubicar(); void cont.offsetWidth; cont.classList.remove('fuera'); return; }
  cont.classList.add('fuera');
  cambioLado = setTimeout(() => { ubicar(); void cont.offsetWidth; cont.classList.remove('fuera'); }, 480);
}
window.lugarMigue = lugarMigue;
function migueTermino() { clearTimeout(salidaMigue); salidaMigue = setTimeout(() => { if (!migue.hablando) lugarMigue(); }, 1200); }
function mostrarGlobo(p) {
  clearTimeout(globoTimer);
  if (p.dataset.migue === 'no') { if (!migue.hablando) globo.classList.remove('ver', 'dice'); return; }
  if (migue.hablando) return;
  globo.classList.remove('ver', 'dice');
  const txt = p.dataset.globo;
  if (!txt) return;
  globoTimer = setTimeout(() => { if (migue.hablando) return; globo.textContent = txt; globo.classList.add('ver'); }, parseInt(p.dataset.globoDemora || '900', 10));
}

// =====================================================================
// MIGUE: videos con el verde recortado en tiempo real (WebGL).
// Mientras una frase no tenga video, Migue la dice con el globo.
// =====================================================================
const migue = (() => {
  const cont = document.getElementById('migue');
  const lienzo = document.getElementById('lienzo');
  const barras = [...document.querySelectorAll('#habla .barras i')];
  const disco = document.getElementById('disco');
  const gl = lienzo.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true });

  const VS = `attribute vec2 p; attribute vec2 uv; varying vec2 v; void main(){ v = uv; gl_Position = vec4(p, 0.0, 1.0); }`;
  const FS = `precision mediump float; varying vec2 v; uniform sampler2D t; uniform float op; uniform vec2 k;
    void main(){
      vec4 c = texture2D(t, v);
      float dom = c.g - max(c.r, c.b);
      float spill = smoothstep(0.06, 0.26, dom) * smoothstep(0.35, 0.6, c.g);
      c.g = mix(c.g, max(c.r, c.b), spill);
      float a = (1.0 - smoothstep(k.x, k.y, dom)) * op;
      gl_FragColor = vec4(c.rgb * a, a);
    }`;
  function sh(tipo, src) { const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer();
  const aP = gl.getAttribLocation(prog, 'p'), aUV = gl.getAttribLocation(prog, 'uv');
  const uOp = gl.getUniformLocation(prog, 'op'), uK = gl.getUniformLocation(prog, 'k');
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  function textura() {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  function crearVideo(src, conSonido) {
    const v = document.createElement('video');
    v.src = src; v.preload = 'auto'; v.playsInline = true; v.muted = !conSonido; v.crossOrigin = 'anonymous';
    return v;
  }

  const loops = LOOPS.map(s => ({ v: crearVideo(s, false), t: textura(), geo: GEO.loop, op: 1 }));
  let loopActual = 0;
  loops.forEach((l) => l.v.addEventListener('ended', () => {
    const sig = Math.random() < 0.55 ? 0 : 1 + Math.floor(Math.random() * (loops.length - 1));
    loopActual = sig; loops[sig].v.currentTime = 0; loops[sig].v.play().catch(() => { });
  }));

  const clips = VIDEOS.map(c => c.archivo ? { v: crearVideo(c.archivo, true), t: textura(), geo: BUSTO ? GEO.busto : GEO.habla, op: 0 } : { v: null, op: 0 });
  let clipActual = -1, proximo = 0, idleOp = 1, finGlobo = null, sinVideo = false;
  const api = { hablando: false, proximo: () => proximo, actual: () => clipActual };

  let ctx = null, analizador = null, datos = null;
  function prepararAudio() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      analizador = ctx.createAnalyser(); analizador.fftSize = 256; datos = new Uint8Array(analizador.frequencyBinCount);
      clips.forEach(c => { if (c.v) ctx.createMediaElementSource(c.v).connect(analizador); });
      analizador.connect(ctx.destination);
    } catch (e) { ctx = null; }
  }
  // Tocar y pausar cada video una vez deja habilitado el sonido para después
  // (lo necesita el control remoto: sus toques no cuentan como gesto del usuario).
  let desbloqueo = Promise.resolve();
  api.desbloquear = () => {
    desbloqueo = (async () => {
      prepararAudio();
      if (ctx && ctx.state === 'suspended') { try { await conTope(ctx.resume(), 800); } catch (e) { } }
      const uno = async (c) => {
        if (!c.v) return;
        const i = clips.indexOf(c);
        try { c.v.muted = true; await c.v.play(); if (!(i === clipActual && api.hablando)) { c.v.pause(); c.v.currentTime = 0; } } catch (e) { } finally { c.v.muted = false; }
      };
      const hasta = new Promise(ok => setTimeout(ok, 2500));
      await Promise.race([Promise.all(clips.map(uno)), hasta]);
      if (loops[0]) loops[0].v.play().catch(() => { });
    })();
    return desbloqueo;
  };

  api.decir = async (i) => {
    await desbloqueo;
    if (i == null) i = proximo;
    if (i < 0 || i >= clips.length) return;
    api.callar(true);
    clipActual = i; proximo = Math.min(i + 1, clips.length);
    const c = clips[i], frase = VIDEOS[i].sub || VIDEOS[i].texto;
    clearTimeout(globoTimer);
    // Con video si se puede; si no, con sonido apagado y subtítulo; y si tampoco, con el globo.
    let anda = false;
    if (c.v) {
      c.v.currentTime = 0; c.v.muted = false;
      try { if (ctx && ctx.state === 'suspended') await conTope(ctx.resume(), 800); await conTope(c.v.play(), 3000); anda = !c.v.paused; } catch (e) { }
      // Sin permiso de sonido (nadie tocó la pantalla): Migue habla igual, sin sonido y con subtítulo.
      if (!anda) { try { c.v.muted = true; await conTope(c.v.play(), 3000); anda = !c.v.paused; } catch (e2) { console.warn('No se pudo reproducir', e2); } }
    }
    if (clipActual !== i) return; // mientras tanto pidieron otra frase o que se calle
    if (anda) {
      globo.classList.remove('ver');
      sinVideo = false; mostrarSubtitulo(frase);
      c.v.onended = () => { if (clipActual === i) terminar(); };
      setTimeout(() => { if (api.hablando && !sinVideo) { const l = loops[loopActual]; if (l && !l.v.paused) l.v.pause(); } }, 450);
    } else {
      if (c.v) c.v.pause();
      sinVideo = true;
      globo.textContent = frase; globo.classList.add('ver', 'dice');
      finGlobo = setTimeout(() => { if (clipActual === i) terminar(); }, 1800 + frase.length * 65);
    }
    api.hablando = true; cont.classList.add('hablando'); cont.classList.toggle('sin-video', sinVideo);
    clearTimeout(salidaMigue); lugarMigue();
    informar();
  };
  function mostrarSubtitulo(texto) {
    const sub = document.getElementById('subtitulo'), t = document.createElement('span');
    t.textContent = texto; sub.replaceChildren(t); sub.classList.add('ver');
  }
  function terminar() {
    clearTimeout(finGlobo);
    api.hablando = false; cont.classList.remove('hablando', 'sin-video');
    migueTermino();
    document.getElementById('subtitulo').classList.remove('ver');
    if (sinVideo) { globo.classList.remove('ver', 'dice'); sinVideo = false; }
    const l = loops[loopActual]; if (l && l.v.paused) l.v.play().catch(() => { });
    informar();
  }
  api.callar = (silencioso) => {
    clips.forEach(c => { if (c.v && !c.v.paused) c.v.pause(); });
    if (api.hablando) terminar();
    if (!silencioso) informar();
  };
  api.repetir = () => { if (clipActual >= 0) api.decir(clipActual); };
  api.anterior = () => { const base = clipActual >= 0 ? clipActual : proximo; if (base - 1 >= 0) api.decir(base - 1); };
  api.reiniciar = () => { proximo = 0; informar(); };
  api.atras = () => {
    if (api.hablando && clipActual >= 0) { const i = clipActual; api.callar(true); proximo = i; }
    else proximo = Math.max(0, proximo - 1);
    informar();
  };
  api.alternar = () => { cont.classList.toggle('oculto'); if (cont.classList.contains('oculto')) api.callar(); informar(); };

  api.ajustarResolucion = (s) => {
    const dpr = window.devicePixelRatio || 1;
    lienzo.width = Math.round(LW * s * dpr); lienzo.height = Math.round(LH * s * dpr);
    gl.viewport(0, 0, lienzo.width, lienzo.height);
  };

  function dibujar(item) {
    const v = item.v; if (!v || v.readyState < 2 || item.op <= 0.001) return;
    const g = item.geo, X = x => x / LW * 2 - 1, Y = y => 1 - y / LH * 2;
    let x0, x1, y0, y1, u0, u1, v0, v1;
    if (g.busto) {
      x0 = (LW - LADO_BUSTO) / 2; x1 = x0 + LADO_BUSTO; y1 = LH; y0 = LH - LADO_BUSTO;
      u0 = 0; u1 = 1; v0 = 0; v1 = 1;
    } else {
      const esc2 = ALTO_MIGUE / g.figura, [cx0, cy0, cx1, cy1] = g.recorte, W = v.videoWidth, H = v.videoHeight;
      x0 = CENTRO_X + (cx0 - g.centro) * esc2; x1 = CENTRO_X + (cx1 - g.centro) * esc2;
      y0 = PIES_Y + (cy0 - g.pies) * esc2; y1 = PIES_Y + (cy1 - g.pies) * esc2;
      u0 = cx0 / W; u1 = cx1 / W; v0 = cy0 / H; v1 = cy1 / H;
    }
    const d = new Float32Array([
      X(x0), Y(y0), u0, v0, X(x1), Y(y0), u1, v0, X(x0), Y(y1), u0, v1,
      X(x0), Y(y1), u0, v1, X(x1), Y(y0), u1, v0, X(x1), Y(y1), u1, v1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, d, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aUV); gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 16, 8);
    gl.bindTexture(gl.TEXTURE_2D, item.t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v);
    gl.uniform1f(uOp, item.op); gl.uniform2f(uK, CROMA.desde, CROMA.hasta);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  let nivel = 0;
  function cuadro() {
    const conVideo = api.hablando && !sinVideo;
    idleOp += ((conVideo ? 0 : 1) - idleOp) * 0.25;
    clips.forEach((c, i) => { const obj = conVideo && i === clipActual ? 1 : 0; c.op = c.op + (obj - c.op) * 0.25; });
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    loops.forEach((l, i) => { l.op = i === loopActual ? idleOp : 0; dibujar(l); });
    clips.forEach(dibujar);
    let n = 0;
    if (api.hablando && sinVideo) n = 0.35 + 0.3 * Math.abs(Math.sin(Date.now() / 140));
    else if (analizador && api.hablando) { analizador.getByteFrequencyData(datos); let s = 0; for (let i = 2; i < 40; i++) s += datos[i]; n = Math.min(1, s / (38 * 170)); }
    nivel += (n - nivel) * 0.3;
    barras.forEach((b, i) => { b.style.height = (6 + nivel * 20 * (0.6 + 0.4 * Math.abs(Math.sin(Date.now() / 120 + i)))) + 'px'; });
    disco.style.transform = `scale(${1 + nivel * 0.05})`;
    requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);
  api.debug = () => ({ ctx: ctx && ctx.state, loops: loops.map(l => l.v.readyState), clips: clips.map(c => c.v ? [c.v.paused, c.v.readyState] : 'globo') });
  api.listos = () => ({ listos: loops.filter(l => l.v.readyState >= 3).length + clips.filter(c => !c.v || c.v.readyState >= 3).length, total: loops.length + clips.length });
  return api;
})();
window.migueHablando = () => migue.hablando;
