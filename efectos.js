// =====================================================================
// Recursos en vivo de la presentación. Cada uno se dispara con un comando
// (desde el celular o el teclado) y no depende de la placa en la que estés.
//   · efectos.foco(on)       apaga la placa e ilumina a Migue.
//   · efectos.qr(on)         QR gigante para escribirle a Migue.
//   · efectos.negro(on)      pantalla negra.
//   · efectos.cortina(fn)    transición: paño azul con la trama del globo; fn cambia la placa a mitad.
//   · efectos.contar(raiz)   los números con data-n cuentan desde cero.
// =====================================================================
(function () {
  const stage = document.getElementById('stage');

  // ---------------------------------------------------------------- foco, qr, negro
  // En un panel académico el foco automático (cada vez que Migue habla) distrae:
  // queda apagado, y se prende a mano si hace falta.
  let focoManual = false, focoAuto = false;
  function aplicarFoco() {
    const hablando = !!(window.migueHablando && window.migueHablando());
    stage.classList.toggle('foco', focoManual || (focoAuto && hablando));
  }
  setInterval(aplicarFoco, 150);
  const qrs = document.getElementById('qrs'), negro = document.getElementById('negro');

  // ---------------------------------------------------------------- cortina
  const cortinaEl = document.getElementById('cortina');
  function cortina(cambiar) {
    cortinaEl.classList.remove('va'); void cortinaEl.offsetWidth; cortinaEl.classList.add('va');
    setTimeout(cambiar, 520);
    setTimeout(() => cortinaEl.classList.remove('va'), 1250);
  }

  // ---------------------------------------------------------------- contadores
  // <b data-n="13022" data-pre="−" data-pos="%">: cuenta de 0 al valor con
  // separador de miles argentino. Sin data-n, no se toca.
  const fmt = (n) => Math.round(n).toLocaleString('es-AR');
  function contar(raiz, demoraBase = 250) {
    raiz.querySelectorAll('[data-n]').forEach((el) => {
      const fin = +el.dataset.n, pre = el.dataset.pre || '', pos = el.dataset.pos || '';
      const anim = el.closest('.a'); // esperar a que su tarjeta entre
      const demora = demoraBase + (anim ? parseFloat(getComputedStyle(anim).animationDelay) * 1000 || 0 : 0);
      const dur = 1400 + Math.min(900, Math.log10(fin + 1) * 220);
      el.textContent = pre + '0' + pos;
      clearTimeout(el._t); cancelAnimationFrame(el._r);
      el._t = setTimeout(() => {
        const t0 = performance.now();
        const paso = (t) => {
          const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          el.textContent = pre + fmt(fin * e) + pos;
          if (k < 1) el._r = requestAnimationFrame(paso);
        };
        el._r = requestAnimationFrame(paso);
      }, demora);
    });
  }

  window.efectos = {
    foco: (on) => { focoManual = on == null ? !focoManual : !!on; aplicarFoco(); },
    focoAuto: (on) => { focoAuto = on == null ? !focoAuto : !!on; aplicarFoco(); },
    qr: (on) => qrs.classList.toggle('ver', on == null ? !qrs.classList.contains('ver') : !!on),
    negro: (on) => negro.classList.toggle('ver', on == null ? !negro.classList.contains('ver') : !!on),
    cortina, contar,
    estado: () => ({ foco: focoManual, qr: qrs.classList.contains('ver'), negro: negro.classList.contains('ver') }),
  };
})();
