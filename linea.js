// "Cómo empezó": la línea de tiempo se recorre sola. Un cometa avanza de hito en
// hito; el hito actual se ilumina y sus números cuentan; los que vienen esperan en
// gris; el año de fondo cambia; al llegar a "Hoy", estalla. Arranca cada vez que se
// entra a la placa (unos 15 s) y no necesita ningún botón.
(function () {
  const lt = document.querySelector('.linea-tiempo'); if (!lt) return;
  const placa = lt.closest('.slide');
  const hitos = [...lt.querySelectorAll('.hito')];
  const eje = lt.querySelector('.lt-eje'), avance = lt.querySelector('.lt-avance');
  const cometa = lt.querySelector('.lt-cometa'), anio = lt.querySelector('.lt-anio');
  const PASO = 2300;
  let timers = [];
  const limpiar = () => { timers.forEach(clearTimeout); timers = []; };
  const despues = (ms, fn) => timers.push(setTimeout(fn, ms));
  const centro = (h) => { const ic = h.querySelector('.h-ic'); return h.offsetLeft + ic.offsetLeft + ic.offsetWidth / 2; };

  function arrancar() {
    limpiar();
    lt.classList.remove('fin'); lt.classList.add('recorre');
    hitos.forEach(h => h.classList.remove('paso', 'aca'));
    const x0 = eje.offsetLeft, y = eje.offsetTop;
    for (const el of [avance, cometa]) el.style.transition = 'none';
    avance.style.left = x0 + 'px'; avance.style.top = y + 'px'; avance.style.width = '0px';
    cometa.style.left = x0 + 'px'; cometa.style.top = (y + 3) + 'px';
    if (anio) anio.textContent = hitos[0] && hitos[0].dataset.anio || '';
    void lt.offsetWidth;
    for (const el of [avance, cometa]) el.style.transition = '';
    hitos.forEach((h, i) => despues(600 + i * PASO, () => activar(i)));
    despues(600 + (hitos.length - 1) * PASO + 1800, () => { lt.classList.add('fin'); hitos.forEach(h => h.classList.add('paso')); });
  }
  function activar(i) {
    const h = hitos[i];
    hitos.forEach((o, j) => { o.classList.toggle('aca', j === i); o.classList.toggle('paso', j < i); });
    const x = centro(h);
    avance.style.width = Math.max(0, x - avance.offsetLeft) + 'px';
    cometa.style.left = x + 'px';
    if (anio && h.dataset.anio && anio.textContent !== h.dataset.anio) {
      anio.classList.add('cambia');
      despues(260, () => { anio.textContent = h.dataset.anio; anio.classList.remove('cambia'); });
    }
    window.efectos && window.efectos.contar(h, 450);
    if (h.classList.contains('fuerte')) despues(500, () => estallar(h));
  }
  function estallar(h) {
    const ic = h.querySelector('.h-ic');
    for (let k = 0; k < 18; k++) {
      const p = document.createElement('i'); p.className = 'lt-chispa';
      const ang = (k / 18) * Math.PI * 2, dist = 130 + Math.random() * 70;
      p.style.setProperty('--x', (Math.cos(ang) * dist).toFixed(0) + 'px');
      p.style.setProperty('--y', (Math.sin(ang) * dist).toFixed(0) + 'px');
      p.style.animationDelay = (Math.random() * 0.15).toFixed(2) + 's';
      ic.appendChild(p); setTimeout(() => p.remove(), 1800);
    }
  }
  // Arranca al entrar a la placa (también si se vuelve a entrar) y se frena al salir.
  new MutationObserver((cambios) => {
    const ahora = placa.classList.contains('on');
    const entro = ahora && cambios.some(c => !/(^|\s)on(\s|$)/.test(c.oldValue || ''));
    if (entro) arrancar(); else if (!ahora) limpiar();
  }).observe(placa, { attributes: true, attributeFilter: ['class'], attributeOldValue: true });
})();
