// =====================================================================
// PARTICIPACIÓN DEL PÚBLICO, del lado del servidor (lo usa server.js).
//
// El público entra desde el celular (/sumate) con su nombre y su municipio y
// responde lo que esté abierto: nube de palabras, votación o preguntas a
// Migue. La pantalla abre cada actividad al llegar a su placa y muestra los
// resultados; la botonera modera (✕ oculta una palabra, una pregunta o a una
// persona) y puede abrir cualquier actividad en cualquier placa.
//
// Todo pasa por este servidor, con pedidos HTTP comunes (sin WebSocket):
// aguanta cientos de celulares en el mismo wifi sin depender de Supabase.
//
// Las respuestas se guardan en DATOS (fuera de la carpeta publicada, así nadie
// las descarga): sobreviven a un reinicio. Cada sala (canal) va por separado:
// las pruebas con ?canal=prueba no se mezclan con la charla.
//
// Preguntas a Migue: van al chat real (el mismo puente que /api/preguntar), en
// fila, de a dos y espaciadas, para no pasar el límite por minuto del chat.
// El chat web de Migue acepta 15 mensajes por minuto por IP (CHAT_LIMITE_POR_MINUTO,
// default 15) y todas las preguntas del público salen de la IP de este servidor:
// una cada 4,2 s son ~14 por minuto. Si Migue sube su límite, bajar MIGUE_ESPACIO_MS.
// =====================================================================
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ACTIVIDADES, MUNICIPIOS, OTROS } = require('./publico-actividades.js');

const ACT = Object.fromEntries(ACTIVIDADES.map(a => [a.id, a]));
const MIGUE_CHAT = process.env.MIGUE_CHAT || 'https://migue.smt.gob.ar/api/chat';
const MIGUE_A_LA_VEZ = 2, MIGUE_ESPACIO_MS = +process.env.MIGUE_ESPACIO_MS || 4200;
const MIGUE_POR_MINUTO = Math.max(1, Math.floor(60000 / MIGUE_ESPACIO_MS));
const MIGUE_MAX = 1; // preguntas por persona si la actividad no dice otra cosa
const CORTESIA = 'Uy, justo ahora no puedo ir a buscar ese dato. Probá en un ratito desde Ciudad Digital (ciudaddigital.smt.gob.ar) y te respondo.';
const TOPE = { salas: 40, personas: 3000, respuestas: 6000, migue: 600 };
// La sala de la charla (config.js) siempre tiene lugar; las demás, sólo de prueba (?canal=…).
const SALA_FIJA = (() => { try { return (fs.readFileSync(path.join(__dirname, 'config.js'), 'utf8').match(/\bsala:\s*'([^']+)'/) || [])[1] || null; } catch (e) { return null; } })();

// ------------------------------------------------------------------ textos
const sinTildes = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
const clave = s => sinTildes(String(s).toLowerCase()).replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const limpiar = (s, max) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const mayuscula = s => s ? s[0].toUpperCase() + s.slice(1) : s;
// Lo que no sale en la pantalla grande (se recibe igual, pero queda oculto).
const MALAS = new Set(('puto puta putos putas mierda mierdas concha conchudo conchuda verga vergas pija pijas culo culos culiao culiado forro forra forros '
  + 'pelotudo pelotuda pelotudos boludo boluda boludos idiota idiotas imbecil imbeciles estupido estupida tarado tarada mogolico mogolica '
  + 'trolo trola garca garcas garcha garchar coger cogida chupala chupame chupen hdp carajo orto poronga choto chota pajero pajera sorete '
  + 'cagar cagada cagadas nazi zorra perra cornudo marica maricon lpm ctm lpqtp porno porn teta tetas pene vagina falopa merca '
  + 'chorro chorros chorra ladron ladrones corrupto corruptos corrupta').split(' '));
const FRASES_MALAS = ['hijo de puta', 'hijos de puta', 'la puta', 'la concha', 'chupa pija', 'me chupa', 'que se vayan'];
function esMala(t) {
  const k = clave(t);
  if (!k) return false;
  if (k.split(' ').some(w => MALAS.has(w))) return true;
  if (FRASES_MALAS.some(f => (' ' + k + ' ').includes(' ' + f + ' '))) return true;
  return /https?:|www\.|@|\d{6,}/i.test(t);
}

// Municipio escrito → nombre oficial (si se reconoce).
const CANON = MUNICIPIOS.concat(OTROS).map(n => [clave(n), n]);
const ALIAS = {
  'saenz pena': 'Presidencia Roque Sáenz Peña', 'roque saenz pena': 'Presidencia Roque Sáenz Peña', 'pcia roque saenz pena': 'Presidencia Roque Sáenz Peña',
  'presidencia roque saenz pena': 'Presidencia Roque Sáenz Peña', 'pres roque saenz pena': 'Presidencia Roque Sáenz Peña', 'castelli': 'Juan José Castelli',
  'j j castelli': 'Juan José Castelli', 'san martin': 'General José de San Martín', 'gral san martin': 'General José de San Martín', 'general san martin': 'General José de San Martín',
  'la plaza': 'Presidencia de la Plaza', 'pcia de la plaza': 'Presidencia de la Plaza', 'nueva pompeya': 'Misión Nueva Pompeya', 'bermejito': 'Villa Río Bermejito',
  'rio bermejito': 'Villa Río Bermejito', 'du graty': 'Coronel Du Graty', 'cnel du graty': 'Coronel Du Graty', 'gral pinedo': 'General Pinedo', 'gral vedia': 'General Vedia',
  'gral capdevila': 'General Capdevila', 'tirol': 'Puerto Tirol', 'vilelas': 'Puerto Vilelas', 'provincia': 'Gobierno del Chaco', 'gobierno provincial': 'Gobierno del Chaco',
  'gobierno de la provincia': 'Gobierno del Chaco', 'provincia del chaco': 'Gobierno del Chaco', 'chaco': 'Gobierno del Chaco', 'gob del chaco': 'Gobierno del Chaco',
  'machagay': 'Machagai', 'makalle': 'Makallé', 'resis': 'Resistencia', 'villa angela': 'Villa Ángela', 'pampa infierno': 'Pampa del Infierno',
};
function municipio(texto) {
  let k = clave(texto).replace(/^(la )?(municipalidad|municipio|intendencia|comuna)( de( la)?)? /, '');
  if (!k) return null;
  const exacto = CANON.find(([c]) => c === k);
  if (exacto) return exacto[1];
  if (ALIAS[k]) return ALIAS[k];
  if (k.length >= 4) {
    const parecidos = CANON.filter(([c]) => c.includes(k) || k.includes(c));
    if (parecidos.length === 1) return parecidos[0][1];
  }
  return null;
}

module.exports = function publico({ datos }) {
  fs.mkdirSync(datos, { recursive: true });
  const ARCHIVO = path.join(datos, 'salas.json');
  const salas = new Map();
  try {
    const j = JSON.parse(fs.readFileSync(ARCHIVO, 'utf8'));
    Object.entries(j).forEach(([k, s]) => {
      // Una pregunta que quedó en camino al reiniciar: vuelve a la fila.
      (s.migue || []).forEach(m => { if (m.e === 'pensando') m.e = 'cola'; });
      salas.set(k, s);
    });
  } catch (e) { }

  // ---------------------------------------------------------------- guardado
  let sucio = false, guardando = null;
  function cambio(s) { s.v = (s.v || 0) + 1; sucio = true; if (!guardando) guardando = setTimeout(guardar, 2500); }
  function guardar() {
    guardando = null; if (!sucio) return; sucio = false;
    const tmp = ARCHIVO + '.tmp';
    fs.writeFile(tmp, JSON.stringify(Object.fromEntries(salas)), (err) => { if (!err) fs.rename(tmp, ARCHIVO, () => { }); });
  }

  function sala(nombre, crear) {
    nombre = String(nombre || '').trim();
    if (!/^[a-z0-9][a-z0-9-]{0,63}$/i.test(nombre)) return null;
    let s = salas.get(nombre);
    if (!s && crear) {
      const fija = nombre === SALA_FIJA;
      if (SALA_FIJA && !fija && !/^prueba-/.test(nombre)) return null;
      if (salas.size >= TOPE.salas && !fija) return null;
      s = { act: null, revel: {}, migueVisto: false, gente: {}, resp: {}, migue: [], v: 0 };
      salas.set(nombre, s);
    }
    return s;
  }
  const persona = (s, yo) => (yo && Object.prototype.hasOwnProperty.call(s.gente, yo) ? s.gente[yo] : null);
  const visible = (s, r) => !r.x && !(s.gente[r.yo] && s.gente[r.yo].x);

  // Para el celular: la actividad abierta, sin la respuesta correcta hasta que se revela.
  function actPublica(s, id) {
    const a = ACT[id]; if (!a) return null;
    const revelada = !!s.revel[id];
    return {
      id: a.id, tipo: a.tipo, titulo: a.titulo, pregunta: a.pregunta, ayuda: a.ayuda || '', opciones: a.opciones || null, max: a.max || 1,
      revelada, cerrada: revelada, correcta: revelada ? a.correcta : undefined, revelacion: revelada ? a.revelacion : undefined,
    };
  }

  // ---------------------------------------------------------------- resultados
  function nube(s, id) {
    const grupos = new Map();
    (s.resp[id] || []).forEach((r) => {
      if (!visible(s, r)) return;
      const k = clave(r.v); if (!k) return;
      const g = grupos.get(k) || { t: mayuscula(r.v), c: 0, p: r.t };
      g.c++; grupos.set(k, g);
    });
    return [...grupos.entries()].map(([k, g]) => ({ k, t: g.t, c: g.c, p: g.p }))
      .sort((a, b) => b.c - a.c || a.p - b.p).slice(0, 70).map(({ k, t, c }) => ({ k, t, c }));
  }
  function votos(s, id) {
    const a = ACT[id], n = (a.opciones || []).map(() => 0);
    (s.resp[id] || []).forEach((r) => { if (visible(s, r) && n[r.v] != null) n[r.v]++; });
    return n;
  }
  function gente(s) {
    const lista = Object.entries(s.gente).filter(([, p]) => !p.x);
    const munis = new Map();
    lista.forEach(([, p]) => { const m = p.mc || mayuscula(p.m); munis.set(m, (munis.get(m) || 0) + 1); });
    const contados = [...munis.keys()].filter(m => MUNICIPIOS.includes(m)).length;
    return {
      gente: lista.length, municipios: contados,
      top: [...munis.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([m, c]) => ({ m, c })),
      recientes: lista.sort((a, b) => b[1].t - a[1].t).slice(0, 12).map(([, p]) => ({ n: p.n, m: p.mc || p.m })),
    };
  }
  function resultados(s, id) {
    const a = ACT[id], r = { v: s.v, act: s.act, ...gente(s) };
    if (!a) return r;
    r.a = actPublica(s, id);
    if (a.tipo === 'nube') { r.nube = nube(s, id); r.total = (s.resp[id] || []).filter(x => visible(s, x)).length; }
    else if (a.tipo === 'encuesta') { r.votos = votos(s, id); r.total = r.votos.reduce((x, y) => x + y, 0); }
    else if (a.tipo === 'migue') {
      const vis = s.migue.filter(m => visible(s, m));
      r.total = vis.length; r.respondidas = vis.filter(m => m.e === 'ok').length;
      r.feed = vis.slice(-9).reverse().map(m => ({ id: m.id, n: (s.gente[m.yo] || {}).n || '', m: ((s.gente[m.yo] || {}).mc || (s.gente[m.yo] || {}).m || ''), q: m.q, e: m.e }));
    }
    return r;
  }

  // ---------------------------------------------------------------- Migue
  let migueActivos = 0, migueUltimo = 0, migueTimer = null;
  const cola = [];
  function bombear() {
    if (migueTimer) return;
    while (migueActivos < MIGUE_A_LA_VEZ && cola.length) {
      const falta = MIGUE_ESPACIO_MS - (Date.now() - migueUltimo);
      if (falta > 0) { migueTimer = setTimeout(() => { migueTimer = null; bombear(); }, falta); return; }
      const [s, m] = cola.shift();
      migueActivos++; migueUltimo = Date.now();
      consultarMigue(s, m).finally(() => { migueActivos--; bombear(); });
    }
  }
  const dormir = ms => new Promise(ok => setTimeout(ok, ms));
  async function consultarMigue(s, m) {
    m.e = 'pensando'; cambio(s);
    // 429 (límite por minuto de Migue): se espera a que se libere y se reintenta hasta 5 veces.
    for (let intento = 0, limite = 0; intento < 3 + limite; intento++) {
      let espera = 6000 + intento * 6000;
      try {
        const r = await fetch(MIGUE_CHAT, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mensaje: m.q, sessionId: 'chaco-' + m.yo.slice(0, 14) }),
          signal: AbortSignal.timeout(45000),
        });
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.respuesta) { m.r = String(j.respuesta).slice(0, 4000); m.e = 'ok'; cambio(s); return; }
        if (r.status === 429) { if (limite < 2) limite++; espera = 20000; }
        else if (r.status < 500) break;
      } catch (e) { }
      await dormir(espera);
    }
    m.r = CORTESIA; m.e = 'error'; cambio(s);
  }
  salas.forEach(s => (s.migue || []).forEach(m => { if (m.e === 'cola') cola.push([s, m]); }));
  bombear();

  // ---------------------------------------------------------------- pedidos
  const ultimoEnvio = new Map(); // yo → hora: un envío por segundo por persona
  function apurado(yo) { const t = ultimoEnvio.get(yo) || 0, ahora = Date.now(); if (ahora - t < 700) return true; ultimoEnvio.set(yo, ahora); if (ultimoEnvio.size > 20000) ultimoEnvio.clear(); return false; }
  // Sólo pedidos que salen de la misma presentación (no de otra página).
  function mismoSitio(req) {
    const desde = req.headers.origin; if (!desde) return true;
    try {
      const h = new URL(desde).hostname, aca = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0];
      return h === aca || /(^|\.)195-35-42-168\.sslip\.io$|(^|\.)srv1915283\.hstgr\.cloud$|^localhost$|^127\.|^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(h);
    } catch (e) { return false; }
  }
  function json(res, cod, obj) {
    res.writeHead(cod, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(obj));
  }

  // Reacciones con emojis (desde el 26/11/2026): la botonera las prende y las apaga
  // (s.emojis); mientras están prendidas, cada celular tiene una barra de emojis y la
  // pantalla los hace volar. No se guardan: viven en memoria, los últimos 200 por sala.
  const EMOJIS = ['👏', '❤️', '🔥', '😮', '😂', '🤔'];
  const EMO = new Map(), ultEmoji = new Map();
  const RUTAS = {
    'POST emoji': (s, b, nombre) => {
      if (!persona(s, b.yo)) return [401, { error: 'Volvé a entrar con tu nombre.' }];
      if (!s.emojis) return [409, { error: 'Las reacciones están cerradas.' }];
      const e = String(b.e || ''); if (!EMOJIS.includes(e)) return [400, { error: 'Ese no.' }];
      const ahora = Date.now(); if (ahora - (ultEmoji.get(b.yo) || 0) < 500) return [429, { error: '…' }];
      ultEmoji.set(b.yo, ahora); if (ultEmoji.size > 20000) ultEmoji.clear();
      const r = EMO.get(nombre) || { seq: 0, lista: [] }; EMO.set(nombre, r);
      r.lista.push({ i: ++r.seq, e }); if (r.lista.length > 200) r.lista.splice(0, r.lista.length - 200);
      return [200, { ok: true }];
    },
    'GET emojis': (s, q, nombre) => {
      const r = EMO.get(nombre) || { seq: 0, lista: [] }, desde = Number(q.get('desde'));
      // desde < 0 (recién abierta) o mayor que seq (se reinició el servidor): sólo el número, sin repetir viejos.
      const nuevos = !(desde >= 0) || desde > r.seq ? [] : r.lista.filter(x => x.i > desde).slice(-60).map(x => x.e);
      return [200, { on: !!s.emojis, seq: r.seq, nuevos }];
    },
    'POST emojis': (s, b) => {
      const on = b.on !== false;
      if (!!s.emojis !== on) { s.emojis = on; cambio(s); }
      return [200, { ok: true, on }];
    },
    // ---- celular del público
    'POST entrar': (s, b) => {
      const n = limpiar(b.nombre, 40), mTxt = limpiar(b.municipio, 60);
      if (n.length < 2) return [400, { error: 'Escribí tu nombre.' }];
      if (mTxt.length < 2) return [400, { error: 'Escribí tu municipio.' }];
      if (esMala(n)) return [400, { error: 'Usá tu nombre, por favor.' }];
      let yo = String(b.yo || '');
      if (!persona(s, yo)) {
        if (Object.keys(s.gente).length >= TOPE.personas) return [429, { error: 'La sala está llena.' }];
        yo = crypto.randomBytes(9).toString('base64url');
        s.gente[yo] = { t: Date.now() };
      }
      const p = s.gente[yo];
      p.n = mayuscula(n); p.m = mTxt; p.mc = municipio(mTxt); if (esMala(mTxt)) p.x = true;
      cambio(s);
      return [200, { yo, nombre: p.n, municipio: p.mc || p.m }];
    },
    'GET estado': (s, q) => {
      const yo = q.get('yo'), p = persona(s, yo), id = s.act, a = ACT[id];
      const r = { v: s.v, conocido: !!p, gente: Object.values(s.gente).filter(x => !x.x).length, act: a ? actPublica(s, id) : null, emojis: !!s.emojis };
      if (p && a) {
        const mias = (s.resp[id] || []).filter(x => x.yo === yo);
        if (a.tipo === 'nube') r.mio = { palabras: mias.map(x => x.v) };
        else if (a.tipo === 'encuesta') r.mio = { voto: mias.length ? mias[0].v : null };
      }
      if (p && (s.migueVisto || s.act === 'migue')) {
        const mias = s.migue.filter(m => m.yo === yo);
        r.migue = {
          max: ACT.migue ? ACT.migue.max : MIGUE_MAX, porMinuto: MIGUE_POR_MINUTO,
          preguntas: mias.map(m => {
            const delante = m.e === 'cola' ? cola.findIndex(([, x]) => x === m) : -1;
            return { q: m.q, e: m.e, r: m.r || null, antes: delante >= 0 ? delante : 0 };
          }),
        };
      }
      return [200, r];
    },
    'POST responder': (s, b) => {
      const p = persona(s, b.yo); if (!p) return [401, { error: 'Volvé a entrar con tu nombre.' }];
      const id = String(b.act || ''), a = ACT[id];
      if (!a || s.act !== id) return [409, { error: 'Esa pregunta ya se cerró.' }];
      if (s.revel[id]) return [409, { error: 'La votación ya se cerró.' }];
      if (apurado(b.yo)) return [429, { error: 'Un segundo…' }];
      const lista = s.resp[id] || (s.resp[id] = []);
      if (lista.length >= TOPE.respuestas) return [429, { error: 'Ya hay muchísimas respuestas.' }];
      if (a.tipo === 'encuesta') {
        const v = Number(b.valor);
        if (!Number.isInteger(v) || v < 0 || v >= a.opciones.length) return [400, { error: 'Opción inválida.' }];
        const ya = lista.find(x => x.yo === b.yo);
        if (ya) { ya.v = v; ya.t = Date.now(); } else lista.push({ yo: b.yo, v, t: Date.now() });
      } else if (a.tipo === 'nube') {
        const v = limpiar(b.valor, 30).replace(/^[\s.,;:!¡?¿"'-]+|[\s.,;:!¡?¿"'-]+$/g, '');
        if (!v) return [400, { error: 'Escribí una palabra.' }];
        if (v.split(' ').length > 3) return [400, { error: 'Hasta tres palabras.' }];
        const mias = lista.filter(x => x.yo === b.yo);
        if (mias.length >= (a.max || 3)) return [409, { error: 'Ya mandaste ' + (a.max || 3) + '. ¡Gracias!' }];
        if (mias.some(x => clave(x.v) === clave(v))) return [409, { error: 'Esa ya la mandaste.' }];
        lista.push({ yo: b.yo, v, t: Date.now(), x: esMala(v) || undefined });
      } else return [400, { error: 'Acá no se responde así.' }];
      cambio(s);
      return [200, { ok: true }];
    },
    'POST migue': (s, b) => {
      const p = persona(s, b.yo); if (!p) return [401, { error: 'Volvé a entrar con tu nombre.' }];
      if (!s.migueVisto && s.act !== 'migue') return [409, { error: 'Todavía no abrimos las preguntas a Migue.' }];
      const q = limpiar(b.texto, 300);
      if (q.length < 4) return [400, { error: 'Escribí tu pregunta.' }];
      const max = ACT.migue ? ACT.migue.max : MIGUE_MAX;
      if (s.migue.filter(m => m.yo === b.yo).length >= max) return [409, { error: max === 1 ? 'Ya le hiciste tu pregunta a Migue. ¡Gracias!' : 'Ya le hiciste ' + max + ' preguntas a Migue. ¡Gracias!' }];
      if (s.migue.length >= TOPE.migue) return [429, { error: 'Migue tiene muchas preguntas: probá desde Ciudad Digital.' }];
      if (apurado(b.yo)) return [429, { error: 'Un segundo…' }];
      const m = { id: crypto.randomBytes(5).toString('hex'), yo: b.yo, q, t: Date.now(), e: 'cola', x: esMala(q) || undefined };
      s.migue.push(m); cola.push([s, m]); cambio(s); bombear();
      return [200, { ok: true }];
    },
    // ---- pantalla
    'GET resultados': (s, q) => [200, resultados(s, q.get('act') || s.act)],
    'POST activar': (s, b) => {
      const id = b.act == null || b.act === '' ? null : String(b.act);
      if (id && !ACT[id]) return [400, { error: 'No existe esa actividad.' }];
      if (s.act !== id) { s.act = id; if (id === 'migue') s.migueVisto = true; cambio(s); }
      return [200, { ok: true, act: s.act }];
    },
    'POST revelar': (s, b) => {
      const id = String(b.act || ''); if (!ACT[id]) return [400, { error: 'No existe esa actividad.' }];
      const on = b.on !== false;
      if (!!s.revel[id] !== on) { if (on) s.revel[id] = true; else delete s.revel[id]; cambio(s); }
      return [200, { ok: true }];
    },
    // ---- botonera (moderación)
    'GET panel': (s) => {
      const quien = yo => { const p = s.gente[yo] || {}; return (p.n || '¿?') + (p.mc || p.m ? ' · ' + (p.mc || p.m) : ''); };
      const id = s.act, a = ACT[id], g = gente(s);
      const items = [];
      if (a && a.tipo === 'nube') (s.resp[id] || []).forEach((r, i) => items.push({ k: 'r:' + id + ':' + i, quien: quien(r.yo), texto: r.v, x: !!r.x, xp: !!(s.gente[r.yo] || {}).x, t: r.t }));
      return [200, {
        v: s.v, act: id, gente: g.gente, municipios: g.municipios, emojis: !!s.emojis,
        actividades: ACTIVIDADES.map(x => ({ id: x.id, titulo: x.titulo, tipo: x.tipo, n: x.tipo === 'migue' ? s.migue.length : (s.resp[x.id] || []).length, revelada: !!s.revel[x.id], correcta: x.correcta != null })),
        items: items.sort((x, y) => y.t - x.t).slice(0, 30),
        migue: s.migue.slice(-30).reverse().map(m => ({ k: 'm:' + m.id, quien: quien(m.yo), texto: m.q, e: m.e, r: m.e === 'ok' ? m.r : null, x: !!m.x, xp: !!(s.gente[m.yo] || {}).x })),
        personas: Object.entries(s.gente).sort((x, y) => y[1].t - x[1].t).slice(0, 30).map(([yo, p]) => ({ k: 'p:' + yo, quien: quien(yo), x: !!p.x })),
      }];
    },
    'POST ocultar': (s, b) => {
      const k = String(b.k || ''), x = b.x !== false;
      let obj = null;
      if (k.startsWith('p:')) obj = s.gente[k.slice(2)];
      else if (k.startsWith('m:')) obj = s.migue.find(m => m.id === k.slice(2));
      else if (k.startsWith('r:')) { const [, id, i] = k.split(':'); obj = (s.resp[id] || [])[+i]; }
      if (!obj) return [404, { error: 'No está.' }];
      if (x) obj.x = true; else delete obj.x;
      cambio(s);
      return [200, { ok: true }];
    },
    'POST reiniciar': (s, b, nombre) => {
      for (let i = cola.length - 1; i >= 0; i--) if (cola[i][0] === s) cola.splice(i, 1);
      salas.delete(nombre); EMO.delete(nombre); sucio = true; guardar();
      return [200, { ok: true }];
    },
  };

  // Devuelve true si el pedido era de la participación (y ya lo contestó).
  return async function atender(req, res, url, leerCuerpo) {
    if (!url.pathname.startsWith('/api/publico/')) return false;
    const ruta = RUTAS[req.method + ' ' + url.pathname.slice('/api/publico/'.length)];
    if (!ruta) { json(res, 404, { error: 'No existe' }); return true; }
    if (req.method === 'POST' && !mismoSitio(req)) { json(res, 403, { error: 'Pedido de otro sitio' }); return true; }
    let b = {};
    if (req.method === 'POST') { try { b = JSON.parse(await leerCuerpo(req) || '{}') || {}; } catch (e) { json(res, 400, { error: 'Pedido mal armado' }); return true; } }
    const nombre = req.method === 'POST' ? b.sala : url.searchParams.get('sala');
    const lee = req.method === 'GET';
    const s = sala(nombre, !lee);
    if (!s) {
      if (lee && /^[a-z0-9][a-z0-9-]{0,63}$/i.test(String(nombre || ''))) {
        // Sala todavía vacía: respuestas en blanco, sin crearla.
        const vacia = { act: null, revel: {}, migueVisto: false, gente: {}, resp: {}, migue: [], v: 0 };
        const [cod, obj] = ruta(vacia, url.searchParams, nombre); json(res, cod, obj); return true;
      }
      json(res, 400, { error: 'Sala inválida' }); return true;
    }
    try { const [cod, obj] = ruta(s, lee ? url.searchParams : b, nombre); json(res, cod, obj); }
    catch (e) { console.warn('publico', e); json(res, 500, { error: 'Error del servidor' }); }
    return true;
  };
};
module.exports.municipio = municipio; // para probar
module.exports.esMala = esMala;
