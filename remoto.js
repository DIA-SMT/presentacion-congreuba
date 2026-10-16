// Comunicación entre la presentación (pantalla) y el control del celular.
//
// Dos caminos, según dónde corra:
//   · "supabase": publicada en internet (Vercel). Los dos se hablan por un canal
//     en tiempo real de Supabase (broadcast). No toca ninguna tabla.
//   · "local": en la compu, con server.js. Comandos por POST /cmd y SSE /events.
//
// EL CANAL (SALA)
//   Con `sala` en config.js el canal es fijo: la pantalla y la botonera se
//   encuentran solas, sin código, y cualquier link viejo con ?sala=… cae en el
//   mismo canal. Sin `sala` en config.js vuelve el código de sala: llega en el
//   link (?sala=…) y queda guardado en ese navegador.
//
// QUE NO SE PIERDA NINGÚN TOQUE
//   Cada comando viaja con un id. La pantalla contesta "ack" con ese id; si el
//   celular no recibe la confirmación, reintenta. La pantalla ignora los ids
//   repetidos, así que un reintento nunca ejecuta dos veces la misma orden.
//   Si el canal se cae (red, celular bloqueado), se vuelve a conectar solo.
//
// LA MEJOR CONEXIÓN POSIBLE (supabase)
//   · Cada comando sale por dos caminos a la vez: el WebSocket y un envío HTTPS.
//     El que llegue primero se ejecuta; el otro se descarta por el id.
//   · Latido cada 5 s: un corte silencioso se nota en segundos, no en un minuto.
//   · Reconectar es de verdad: se corta el socket, se saca el canal y se arma de nuevo.
//   · El celular mide la demora con la pantalla (ping) y la muestra arriba.
//   · Si la pantalla queda muda o el celular vuelve de estar bloqueado, se rehace
//     la conexión al instante.
//
// PRUEBAS SIN TOCAR EL CANAL DEL SALÓN
//   ?canal=algo usa otro canal ("prueba-algo"); ?remoto=supabase fuerza Supabase
//   aun abriendo desde la compu (localhost).
(function () {
  const CFG = window.UBA_CONFIG || {};
  const CLAVE = 'uba-sala';
  const params = new URLSearchParams(location.search);
  const canalPrueba = (params.get('canal') || '').trim();
  let sala = canalPrueba ? 'prueba-' + canalPrueba : (CFG.sala || '').trim();
  if (!sala) {
    sala = (params.get('sala') || '').trim();
    try {
      if (sala) localStorage.setItem(CLAVE, sala);
      else sala = (localStorage.getItem(CLAVE) || '').trim();
    } catch (e) { }
  }

  // Abierta desde server.js (localhost o la IP de la compu) va siempre por el
  // servidor local: así una prueba en la compu no se mete en el canal publicado.
  const forzarSupabase = params.get('remoto') === 'supabase';
  const hayServidorLocal = !forzarSupabase && location.protocol.startsWith('http') && /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(location.hostname);
  const haySupabase = !!(CFG.supabaseUrl && CFG.supabaseKey && window.supabase);
  const modo = hayServidorLocal ? 'local'
    : (haySupabase && sala ? 'supabase'
      : (haySupabase ? 'sin-sala' : 'ninguno'));

  function guardarSala(codigo) {
    try { localStorage.setItem(CLAVE, String(codigo || '').trim()); } catch (e) { }
    const u = new URL(location.href); u.searchParams.set('sala', String(codigo || '').trim()); location.href = u.toString();
  }

  function iniciar({ rol, alRecibirComando, alRecibirEstado, alCambiarConexion, alMedir }) {
    let avisar = (ok, txt) => alCambiarConexion && alCambiarConexion(ok, txt);
    const nuevoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

    // ------------------------------------------------------------ Supabase
    if (modo === 'supabase') {
      const yo = nuevoId();
      const avisarBase = avisar;
      avisar = (ok, txt) => { if (!ok) vivaAvisada = false; avisarBase(ok, txt); };
      const motivos = [];
      let generacion = 0, conexiones = 0, sb = null, canal = null, listo = false, reintento = null, espera = 500, ultimoIntento = 0;
      const pendientes = new Map();      // control: id → { intentos, timer, alTerminar, porHttp }
      const vistos = [];                 // pantalla: últimos ids ejecutados
      let ultimaPantalla = 0, ultimoControl = 0, latencia = null, vivaAvisada = false;
      function oiPantalla() { ultimaPantalla = Date.now(); if (!vivaAvisada && listo) { vivaAvisada = true; avisar(true, 'Conectado'); } }

      function cliente() {
        return window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
          realtime: {
            params: { eventsPerSecond: 20 },
            heartbeatIntervalMs: 5000,
            timeout: 6000,
            reconnectAfterMs: (n) => [250, 500, 1000, 2000][n - 1] || 3000,
          },
        });
      }
      function enviarCrudo(evento, payload) {
        if (!canal || !listo) return false;
        canal.send({ type: 'broadcast', event: evento, payload }).catch(() => { });
        return true;
      }
      // Segundo camino, por HTTPS: no depende de que el WebSocket de este aparato esté vivo.
      const TOPICO = 'uba-presentacion-' + sala;
      const URL_HTTP = String(CFG.supabaseUrl).replace(/\/+$/, '') + '/realtime/v1/api/broadcast/' + encodeURIComponent(TOPICO) + '/events/';
      function enviarHttp(evento, payload) {
        try {
          const ctl = new AbortController(), corte = setTimeout(() => ctl.abort(), 5000);
          return fetch(URL_HTTP + encodeURIComponent(evento), {
            method: 'POST', keepalive: true, signal: ctl.signal,
            headers: { apikey: CFG.supabaseKey, Authorization: 'Bearer ' + CFG.supabaseKey, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }).then(r => r.status === 202 || r.ok, () => false).finally(() => clearTimeout(corte));
        } catch (e) { return Promise.resolve(false); }
      }
      const dormir = (ms) => new Promise(r => setTimeout(r, ms));
      async function conectar(por) {
        const gen = ++generacion;
        motivos.push((por || '?') + '@' + Math.round(performance.now() / 100) / 10); if (motivos.length > 40) motivos.shift();
        clearTimeout(reintento); ultimoIntento = Date.now(); conexiones++;
        listo = false;
        if (!sb) sb = cliente();
        const viejo = canal; canal = null; // desde acá, los avisos del canal viejo no cuentan
        if (viejo) {
          // Se corta el socket y se saca el canal viejo: el nombre queda libre y la
          // conexión siguiente es nueva de verdad (unos 400 ms).
          try { await Promise.race([sb.realtime.disconnect(), dormir(3000)]); } catch (e) { }
          try { await Promise.race([sb.removeChannel(viejo), dormir(1500)]); } catch (e) { }
          if (gen !== generacion) return; // otra reconexión más nueva tomó el control
          if (sb.getChannels().some(c => c.topic === 'realtime:' + TOPICO)) sb = cliente(); // quedó colgado: cliente nuevo
        }
        const este = sb.channel(TOPICO, { config: { broadcast: { self: false, ack: false } } });
        canal = este;
        const al = (evento, fn) => este.on('broadcast', { event: evento }, (m) => { if (canal === este) fn(m); });
        if (rol === 'pantalla') {
          al('cmd', ({ payload }) => {
            ultimoControl = Date.now();
            const id = payload && payload.id;
            enviarCrudo('ack', { id });
            if (id && vistos.includes(id)) return;
            if (id) { vistos.push(id); if (vistos.length > 120) vistos.shift(); }
            alRecibirComando && alRecibirComando(payload);
          });
          al('pedir-estado', () => { ultimoControl = Date.now(); api.pedirEstado && api.pedirEstado(); });
          al('ping', ({ payload }) => { ultimoControl = Date.now(); enviarCrudo('pong', payload || {}); });
        } else {
          al('estado', ({ payload }) => { oiPantalla(); alRecibirEstado && alRecibirEstado(payload); });
          al('ack', ({ payload }) => {
            oiPantalla();
            const p = payload && pendientes.get(payload.id);
            if (p) { clearTimeout(p.timer); pendientes.delete(payload.id); p.alTerminar && p.alTerminar(true); }
          });
          al('pong', ({ payload }) => {
            oiPantalla();
            if (!payload || payload.de !== yo || !payload.t) return;
            const ms = Date.now() - payload.t;
            latencia = latencia == null ? ms : Math.round(latencia * 0.5 + ms * 0.5);
            alMedir && alMedir(latencia);
          });
        }
        este.subscribe((st) => {
          if (canal !== este) return; // avisos de una conexión vieja
          if (st === 'SUBSCRIBED') {
            listo = true; espera = 500;
            if (rol === 'control') { enviarCrudo('pedir-estado', {}); enviarCrudo('ping', { de: yo, t: Date.now() }); avisar(false, 'Buscando la pantalla…'); }
            else { avisar(true, 'Conectado'); api.pedirEstado && api.pedirEstado(); }
          } else if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT' || st === 'CLOSED') {
            listo = false; avisar(false, 'Reconectando…');
            clearTimeout(reintento); reintento = setTimeout(() => conectar('estado-' + st), espera); espera = Math.min(espera * 2, 2000);
          }
        });
      }
      conectar('inicio');
      // Al volver a la pestaña (celular desbloqueado): conexión nueva si estuvo un rato afuera.
      let ocultoDesde = 0;
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') { ocultoDesde = Date.now(); return; }
        const fuera = ocultoDesde ? Date.now() - ocultoDesde : 0;
        if (!listo || fuera > 5 * 60000) { conectar('volvio'); return; }
        if (rol !== 'control') return;
        const desde = Date.now();
        enviarCrudo('ping', { de: yo, t: desde }); enviarCrudo('pedir-estado', {});
        setTimeout(() => { if (ultimaPantalla < desde) conectar('volvio-sin-pong'); }, 1500);
      });
      addEventListener('pageshow', (e) => { if (e.persisted) conectar('pageshow'); });
      addEventListener('online', () => conectar('online'));
      if (rol === 'pantalla') {
        setInterval(() => {
          const hace = Date.now() - ultimoControl;
          if (ultimoControl && hace > 7000 && hace < 60000 && Date.now() - ultimoIntento > 10000) conectar('pantalla-sin-celular');
        }, 2000);
      }
      if (rol === 'control') {
        setInterval(() => {
          if (listo) enviarCrudo('ping', { de: yo, t: Date.now() });
          const hace = Date.now() - ultimaPantalla, viva = hace < 6500;
          if (listo) avisar(viva, viva ? 'Conectado' : 'Sin pantalla: ¿está abierta la presentación?');
          if (!viva && latencia != null) { latencia = null; alMedir && alMedir(null); }
          if (listo && !viva) enviarCrudo('pedir-estado', {});
          // Canal "abierto" pero mudo: se rehace la conexión entera.
          if (hace > 9000 && Date.now() - ultimoIntento > 12000) conectar('celular-sin-pantalla');
        }, 2000);
      }
      const api = {
        modo, sala, guardarSala,
        // alTerminar(ok): true = la pantalla confirmó; 'sin-confirmar' = salió por HTTPS
        // pero no volvió la confirmación; false = no salió por ningún camino.
        enviarComando: (c, alTerminar) => {
          const id = nuevoId(), cmd = { ...c, id };
          const p = { intentos: 0, alTerminar, porHttp: false };
          const mandar = () => {
            p.intentos++;
            enviarCrudo('cmd', cmd);
            enviarHttp('cmd', cmd).then(ok => { if (ok) p.porHttp = true; });
            p.timer = setTimeout(() => {
              if (!pendientes.has(id)) return;
              // Sin confirmación y la pantalla muda: el problema es este celular. Conexión nueva.
              if (p.intentos === 2 && Date.now() - ultimaPantalla > 3000 && Date.now() - ultimoIntento > 3000) conectar('sin-ack');
              if (p.intentos < 4) mandar();
              else { pendientes.delete(id); alTerminar && alTerminar(p.porHttp ? 'sin-confirmar' : false); }
            }, 900);
          };
          pendientes.set(id, p); mandar();
        },
        enviarEstado: (e) => enviarCrudo('estado', e),
        pedirEstado: null,
        latencia: () => latencia,
        _cliente: () => sb, // para diagnóstico desde la consola
        _conexiones: () => conexiones,
        _motivos: () => motivos.join(' '),
        // Pantalla: ¿hay un celular conectado a esta sala?
        controlVivo: async () => Date.now() - ultimoControl < 8000,
        linkControl: async () => location.origin + '/control' + (canalPrueba ? '?canal=' + encodeURIComponent(canalPrueba) : CFG.sala ? '' : '?sala=' + encodeURIComponent(sala)),
      };
      return api;
    }

    // ------------------------------------------------------------ local (server.js)
    if (modo === 'local') {
      if (rol === 'pantalla') {
        const es = new EventSource('/events');
        const vistos = [];
        es.onopen = () => avisar(true, 'Conectado');
        es.onerror = () => avisar(false, 'Reconectando…');
        es.onmessage = (ev) => {
          try {
            const c = JSON.parse(ev.data);
            if (c.id && vistos.includes(c.id)) return;
            if (c.id) { vistos.push(c.id); if (vistos.length > 80) vistos.shift(); }
            alRecibirComando && alRecibirComando(c);
          } catch (e) { }
        };
      } else {
        const sondear = async () => {
          try {
            const e = await (await fetch('/estado', { cache: 'no-store' })).json();
            avisar(e.pantallas > 0, e.pantallas > 0 ? 'Conectado' : 'Sin pantalla: ¿está abierta la presentación?');
            if (e.total) alRecibirEstado && alRecibirEstado(e);
          } catch (err) { avisar(false, 'Sin conexión con la compu'); }
        };
        setInterval(sondear, 700); sondear();
      }
      return {
        modo, sala, guardarSala,
        enviarComando: (c, alTerminar) => {
          const cmd = { ...c, id: nuevoId() };
          let intentos = 0;
          const mandar = () => fetch('/cmd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) })
            .then(r => r.json()).then(j => alTerminar && alTerminar(j.pantallas > 0))
            .catch(() => { if (++intentos < 3) setTimeout(mandar, 400); else alTerminar && alTerminar(false); });
          mandar();
        },
        enviarEstado: (e) => fetch('/estado', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(e) }).catch(() => { }),
        // En local el celular entra por la IP de la compu en la red, no por localhost.
        controlVivo: async () => { try { const j = await (await fetch('/red', { cache: 'no-store' })).json(); return j.controlHace < 5000; } catch (e) { return false; } },
        linkControl: async () => { try { const j = await (await fetch('/red', { cache: 'no-store' })).json(); if (j.ips && j.ips[0]) return 'http://' + j.ips[0] + ':' + location.port + '/control'; } catch (e) { } return location.origin + '/control'; },
      };
    }

    // ------------------------------------------------------------ sin configurar
    avisar(false, modo === 'sin-sala' ? 'Falta el código de sala' : 'Control remoto sin configurar');
    return { modo, sala, guardarSala, enviarComando: (c, alTerminar) => alTerminar && alTerminar(false), enviarEstado: () => { }, controlVivo: async () => false, linkControl: async () => null };
  }

  window.Remoto = { iniciar, modo, sala, guardarSala };
})();
