# La IA como servicio público · Panel UBA (16/10/2026)

Presentación interactiva del Dr. Marco Rossi (Dirección de IA, Municipalidad de San Miguel de Tucumán) para el panel "IA Federal: innovación desde los territorios", congreso Celebrando Magnífica Humanitas, Facultad de Derecho UBA. Estética del template oficial del congreso; se maneja desde el celular.

## Links

Sin código de sala: la pantalla y la botonera se encuentran solas por un canal fijo (`sala` en `config.js`).

- **Pantalla (para la técnica):** https://uba-ia-servicio-publico.vercel.app
- **Botonera (tu celular):** https://uba-ia-servicio-publico.vercel.app/control
- Proyecto en Vercel: https://vercel.com/direccionia-5744s-projects/uba-ia-servicio-publico

El link de la botonera no se comparte: quien lo abra maneja la presentación. La técnica abre el de la pantalla y toca **Comenzar** (un clic: habilita el sonido de Migue y la pantalla completa). Todo lo demás, desde el celular.

Sin internet en la sala: doble clic en `INICIAR.bat` (necesita Node.js). La botonera entra por la IP de la compu que muestra la ventana (mismo wifi). "Preguntale a Migue" necesita internet igual.

## Qué hay

- 12 placas en el recorrido (`index.html`): portada con los logos de la organización, el decreto 0596/INT/2025, los ocho servicios, **seis vitrinas** (Migue, CIMBA, UrbanIA, EstudIA, Generador de Notas, Ciudad abierta), antes/ahora, conclusión y gracias. Tres placas quedan en el archivo con `data-oculta` (tres frentes, caso Migue, datos).
- **Vitrinas** (`data-vitrina` en la placa): entran solas con la placa y sus recursos pasan solos (duraciones en `cajones.js` → `DURA`); el avance de CIMBA arranca solo. ◀ ▶ en la botonera las pausa; "Que siga sola" las retoma.
- **Cajones** (extras para preguntas): el mismo contenido de `contenido.js` → `PROYECTOS`, abierto a mano sobre cualquier placa.
- Migue de cuerpo entero con el verde recortado en vivo (`media/`), frases en `contenido.js` → `VIDEOS`.
- Botonera (`control.html`): cronómetro, guion, siguiente/anterior, Migue, cajones con sus recursos, Reproducir avance, preguntas a Migue (preparadas o escritas), QR, negro, foco y salto a cualquier placa.

## Teclado (en la compu de la pantalla)

→ / ← placas · Enter o M Migue habla · 1…8 abre ese cajón · Esc lo cierra · [ ] recurso anterior/siguiente · P reproduce el avance · K pregunta a Migue · X cierra la respuesta · Q QR de Migue · F pantalla completa · ? ayuda.

## Publicar cambios

El proyecto de Vercel está conectado a este repositorio: **cada push a `main` se publica solo** en https://uba-ia-servicio-publico.vercel.app (tarda menos de un minuto). Otras ramas generan una vista previa aparte, sin tocar la publicada.

```bash
git add -A
git commit -m "Qué cambió"
git push
```

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
