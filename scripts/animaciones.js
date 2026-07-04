// ============================================================
// animaciones.js - Autor: Felipe Reyes Ingunza
// Motor de movimiento del sitio (JavaScript puro, sin librerias).
// - Scroll-reveal: las secciones y tarjetas entran con fade +
//   subida al llegar al viewport (IntersectionObserver).
// - Stagger: las tarjetas de una grilla entran en cascada.
// - Header pegajoso: sombra cuando el usuario baja (is-stuck).
// Reglas: solo se animan transform y opacity (GPU); se respeta
// prefers-reduced-motion; y nunca se oculta contenido si el JS
// falla (solo se esconde lo que YA esta debajo del fold).
// ============================================================

(function () {
  'use strict';

  try {
    // Preferencia de accesibilidad: si el usuario pide menos
    // movimiento, no se anima nada (todo queda visible).
    const reducir = window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ----------------------------------------------------------
    // Header: agrega sombra al bajar (estado is-stuck).
    // ----------------------------------------------------------
    function iniciarHeader() {
      const header = document.querySelector('body > header');
      if (!header) return;
      // Marca o desmarca el estado segun la posicion del scroll.
      const marcar = () => header.classList.toggle('is-stuck', window.scrollY > 24);
      window.addEventListener('scroll', marcar, { passive: true });
      marcar();
    }

    // Limpia las clases del elemento cuando termina su transicion,
    // para no dejar transform/delay residuales (modales, sticky).
    function limpiarTrasRevelar(el) {
      el.addEventListener('transitionend', () => {
        el.classList.remove('pre-reveal', 'is-visible');
        el.style.transitionDelay = '';
      }, { once: true });
    }

    // ----------------------------------------------------------
    // Scroll-reveal + stagger de tarjetas.
    // ----------------------------------------------------------
    function iniciarReveal() {
      if (reducir || !('IntersectionObserver' in window)) return;

      const limite = window.innerHeight * 0.9;
      const objetivos = [];

      // Oculta un elemento SOLO si aun esta debajo del fold.
      function preparar(el, delaySeg) {
        if (el.getBoundingClientRect().top <= limite) return;
        el.classList.add('pre-reveal');
        if (delaySeg) el.style.transitionDelay = delaySeg + 's';
        objetivos.push(el);
      }

      // Secciones de contenido + elementos marcados a mano.
      document.querySelectorAll('main > section, [data-reveal]').forEach((el) => preparar(el, 0));

      // Tarjetas: entran en cascada (maximo ~0.42s de retardo).
      document.querySelectorAll('.cards').forEach((grilla) => {
        Array.from(grilla.children).forEach((hijo, i) => {
          preparar(hijo, Math.min(i * 0.07, 0.42));
        });
      });

      if (!objetivos.length) return;

      const pendientes = new Set(objetivos);

      // Revela un elemento y lo saca de la lista de pendientes.
      function revelar(el) {
        if (!pendientes.has(el)) return;
        pendientes.delete(el);
        el.classList.add('is-visible');
        limpiarTrasRevelar(el);
        io.unobserve(el);
      }

      // Revela cada elemento la primera vez que entra en vista.
      const io = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => { if (e.isIntersecting) revelar(e.target); });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      objetivos.forEach((el) => io.observe(el));

      // Red de seguridad: en cada scroll revisa si algo ya paso el
      // viewport sin dispararse (saltos rapidos, anclas, etc.).
      let programado = false;
      function repasar() {
        programado = false;
        pendientes.forEach((el) => {
          if (el.getBoundingClientRect().top < window.innerHeight) revelar(el);
        });
        if (!pendientes.size) window.removeEventListener('scroll', alScroll);
      }
      function alScroll() {
        if (programado) return;
        programado = true;
        requestAnimationFrame(repasar);
      }
      window.addEventListener('scroll', alScroll, { passive: true });
    }

    iniciarHeader();
    iniciarReveal();
  } catch (err) {
    // Fallback a prueba de fallos: nada puede quedar invisible.
    document.querySelectorAll('.pre-reveal').forEach((el) => el.classList.add('is-visible'));
    console.warn('animaciones.js: se desactivaron las animaciones.', err);
  }
})();
