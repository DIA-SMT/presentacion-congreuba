# Gobernar la IA agéntica en el Estado · Módulo 6 (Chaco, noviembre 2026)

Presentación interactiva del Dr. Marco Rossi (Dirección de IA, Municipalidad de San Miguel de Tucumán) para el Módulo 6 de "IA para Gobiernos Locales" (IALAB UBA), en la capacitación "Gobernar con IA" del Gobierno del Chaco para los 70 municipios de la provincia (25 y 26 de noviembre de 2026, Presidencia Roque Sáenz Peña). Dura 2 horas y se maneja desde el celular.

La versión del panel UBA (16/10/2026) queda en la etiqueta `uba-2026-10-16`.

## Links

Sin código de sala: la pantalla y la botonera se encuentran solas por un canal fijo (`sala` en `config.js`: `chaco-modulo6-2026`).

- **Pantalla (para la técnica):** https://presentacion.195-35-42-168.sslip.io
- **Botonera (tu celular):** https://presentacion.195-35-42-168.sslip.io/control

Publicada el 25/11/2026 en el VPS del municipio (195.35.42.168): carpeta `/var/www/presentacion-modulo6`, proceso pm2 `presentacion-modulo6` en `127.0.0.1:3090`, sitio nginx `presentacion-modulo6` con certificado de Let's Encrypt. Para republicar lo commiteado: `.\herramientas\publicar-vps.ps1` (usa la clave SSH `~/.ssh/vps_presentacion`). El proyecto de Vercel (`uba-ia-servicio-publico`) respondía 402 (pago requerido).

El link de la botonera no se comparte: quien lo abra maneja la presentación. La técnica abre el de la pantalla y toca **Comenzar** (un clic: habilita el sonido de Migue y la pantalla completa). Todo lo demás, desde el celular.

Sin internet en la sala: doble clic en `INICIAR.bat` (necesita Node.js). La botonera entra por la IP de la compu que muestra la ventana (mismo wifi). "Preguntale a Migue" y las demos en vivo necesitan internet igual.

## Qué hay

- 45 placas en 7 bloques (`index.html`), con los componentes nuevos en `m6.css` y `m6.js` (prefijo `m6-`): portada con el diálogo de Migue, el plan, cómo empezó, y por bloque un **separador** (número grande y riel de avance) seguido de sus placas:
  1. De la IA individual a la institucional: pregunta a la sala, cuatro niveles, chat frente a agente, vitrina Herramientas internas.
  2. Las capas: cinco capas, ocho condiciones de una licencia, detrás de escena de CIMBA y de Migue (datos conectados), vitrina de Migue, IA soberana (matriz 2×2).
  3. Del piloto a la producción: embudo y seis causas, el camino, checklist, vitrina y **demo en vivo** de CIMBA, vitrinas UrbanIA + Presupuesto y Ciudad abierta.
  4. La economía de los agentes: tokens, el multiplicador del agente, costo efectivo, vitrina y demo de EstudIA, cinco reglas para presupuestar.
  5. Gobernanza del agente: decreto 0596, semáforo de permisos, trazabilidad (CIMBA real), el tablero de Migue y el tablero en vivo.
  6. El costo que la factura no muestra: sedentarismo cognitivo y cuatro prácticas.
  7. Hoja de ruta para Chaco: cinco fases con criterio de paso, y qué hace la provincia y qué cada municipio.
  Cierre: conclusión, preguntas (QR de Migue) y gracias.
- El encabezado de cada placa dice en qué bloque estás (lo arma `m6.js`).
- **Migue co-conduce**: está parado en cada separador y abre el bloque con una frase (MIGUE 7…15; con globo hasta que se graben los videos `media/m6-*.mp4`), y la placa 43 recorre los siete bloques en su caso.
- **Guion imprimible**: `guion.html` arma el guion placa por placa leyendo la presentación (miniatura, línea de la botonera, notas, frases de Migue y demos). `.\herramientas\guion-pdf.ps1` lo imprime a `guion-modulo6.pdf` (A4) con Edge.
- **Sistemas en vivo, dentro de la presentación** (`#web`, en `m6.js`): un navegador con pestañas que muestra el sistema real. En las placas "EN VIVO" (`data-web="cimba|estudia|migue"`) el primer SIGUIENTE lo abre y el siguiente lo cierra y avanza; la botonera tiene un botón por sistema (lista `SISTEMAS` en `contenido.js`). Se precarga una placa antes y conserva la sesión.
- Capturas reales en las placas de trazabilidad (CIMBA, control de lo cargado), presupuesto (EstudIA, Laboratorio IA) y el tablero de Migue.
- Logo del Gobierno del Chaco: si existe `img/logos/gobierno-chaco.png` (o `.svg`), reemplaza solo a la marca de texto en portada y cierre.
- Cronómetro de la botonera: ámbar a la 1:45, rojo a las 2:00.
- **Vitrinas** (`data-vitrina` en la placa): entran solas con la placa y sus recursos pasan solos (duraciones en `cajones.js` → `DURA`); el avance de CIMBA arranca solo. ◀ ▶ en la botonera las pausa; "Que siga sola" las retoma.
- **Cajones** (extras para preguntas): el mismo contenido de `contenido.js` → `PROYECTOS`, abierto a mano sobre cualquier placa.
- Migue de cuerpo entero con el verde recortado en vivo (`media/`), frases en `contenido.js` → `VIDEOS`.
- Botonera (`control.html`): cronómetro, guion, siguiente/anterior, Migue, cajones con sus recursos, Reproducir avance, preguntas a Migue (preparadas, escritas o dictadas con la voz: el celular la pasa a texto, se revisa y se manda), QR, negro, foco y salto a cualquier placa.

## Teclado (en la compu de la pantalla)

→ / ← placas · Enter o M Migue habla · 1…8 abre ese cajón · Esc lo cierra · [ ] recurso anterior/siguiente · P reproduce el avance · K pregunta a Migue · X cierra la respuesta · Q QR de Migue · F pantalla completa · ? ayuda.

## Publicar en un VPS

`server.js` no tiene dependencias y sirve todo: la presentación, `/control` y el puente de "Preguntale a Migue" (`/api/preguntar`). Con un dominio público la botonera va por Supabase (el mismo canal de `config.js`).

1. Node.js 18 o más nuevo (usa `fetch` nativo).
2. `git clone` del repositorio y `PORT=8090 node server.js` (con pm2 o un servicio de systemd para que quede andando).
3. nginx adelante, con HTTPS (Let's Encrypt): `proxy_pass http://127.0.0.1:8090;`. HTTPS hace falta para el dictado por voz en el celular, la pantalla completa y el Wake Lock.
4. Para actualizar: `git pull` en el VPS (no hay que compilar nada) y cambiar `version.js`.

## Sistemas que se muestran adentro (frame-ancestors)

El tablero de Migue, EstudIA, UrbanIA y Ciudad Digital se dejan mostrar dentro de la presentación tal como están. En el VPS, nginx agrega a todos los sitios `X-Frame-Options: DENY` (`/etc/nginx/conf.d/seguridad-panel.conf`). El 25/11/2026 se habilitó a **CIMBA, Applaza, Bus Turístico, FerIA y CIMT** para mostrarse **sólo** dentro de la presentación:

- `/etc/nginx/snippets/marco-presentacion.conf`: repite las cabeceras globales (nosniff, Referrer-Policy, HSTS) salvo X-Frame-Options y agrega `Content-Security-Policy: frame-ancestors 'self' https://presentacion.195-35-42-168.sslip.io https://presentacion.smt.gob.ar`.
- En los sitios `cimba`, `applaza`, `turismo`, `feria` y `cimt`, una línea `include snippets/marco-presentacion.conf;` debajo de cada `server_name`.
- Respaldo de los archivos originales en `/root/respaldo-nginx-20261125-001302/` (los cuatro primeros) y `/root/respaldo-nginx-20261125-003433/` (cimt). Para volver atrás: sacar esas líneas (o restaurar el respaldo), `nginx -t` y `systemctl reload nginx`.

Los sistemas del VPS se abren por su dirección `…195-35-42-168.sslip.io`: con la presentación en `presentacion.195-35-42-168.sslip.io` son el mismo sitio, así que el inicio de sesión dentro de la presentación funciona como en una pestaña común.

## Miniaturas de la botonera

`herramientas/miniaturas.ps1` las regenera con Edge sin ventana, usando el modo captura (`?captura=N`, y `&rec=K` para un recurso de vitrina). Necesita la presentación servida en `http://localhost:8080`:

```powershell
.\herramientas\miniaturas.ps1 -Placas 5,6,7
.\herramientas\miniaturas.ps1 -Placas 19 -Recursos 4
```

## Publicar cambios (Vercel)

El proyecto de Vercel está conectado a este repositorio: **cada push a `main` se publica solo** en https://uba-ia-servicio-publico.vercel.app (tarda menos de un minuto), si la cuenta está al día. Otras ramas generan una vista previa aparte, sin tocar la publicada.

```bash
git add -A
git commit -m "Qué cambió"
git push
```

Botonera: arriba muestra la miniatura de lo que está EN PANTALLA (en las vitrinas, el recurso actual) y de la placa que SIGUE; tocándolas se ven grandes. Las miniaturas están en `img/mini/` (mNN-K.jpg): si cambia una placa, hay que regenerarlas.

Conexión botonera ↔ pantalla: cada toque sale por el WebSocket y además por HTTPS (el que llegue primero; el otro se descarta), latido cada 5 s, reconexión limpia y automática, y la botonera muestra la demora (● ms) junto al reloj. Botón verde = confirmado; amarillo = salió por HTTPS sin confirmación; rojo = no salió. Supabase y MapLibre están dentro del proyecto (`lib/`), sin depender de un CDN. Para probar sin tocar el canal del salón: `/?canal=prueba` y `/control?canal=prueba`.

Cambiar `version.js` en cada publicación: la botonera avisa si la pantalla quedó abierta con una versión vieja. El puente de Migue (`api/preguntar.js`) sólo atiende pedidos que salen de la misma presentación; la variable `SALA_CODE` de Vercel ya no se usa. Publicar a mano, sin pasar por GitHub, también funciona: `npx vercel deploy --prod --scope direccionia-5744s-projects`.

## Blindaje

- Si nadie toca Comenzar, la primera orden del celular arranca la presentación (Migue sin sonido, con subtítulo).
- Ninguna orden con error traba la pantalla: queda registrada y la botonera la muestra en rojo.
- La pantalla pide no apagarse (Wake Lock) y precarga todas las capturas y el mapa del avance al empezar.
- Si hay dos pantallas abiertas a la vez, la botonera sigue a la última que arrancó y avisa.

## Cuidado

- Las barras de dirección de las capturas nunca dicen "vercel" (`url` en `contenido.js`).
- No mostrar datos personales: Bus/interacciones y Gobernanza/pendientes de validación tienen datos de vecinos.
- Las preguntas preparadas se probaron contra el chat real el 14/10. "¿Regularon la IA?" y la fecha del Presupuesto Participativo no las sabe por esta vía: no usarlas en vivo hasta cargarlas en las FAQ de Migue.
- Las respuestas preparadas quedan guardadas 12 h en el navegador de la pantalla, para no sumarle consultas de prueba a Migue.
