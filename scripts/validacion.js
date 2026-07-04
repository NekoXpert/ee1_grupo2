// ============================================================
// validacion.js - Autor: Felipe Reyes Ingunza
// Funciones reutilizables de validacion para todo el sitio.
// Se exponen en el espacio de nombres global window.LA para que
// las usen index.js, vuelos.js, mi-cuenta.js y ayuda.js sin
// chocar con las variables globales de otros scripts.
// ============================================================

(function () {
  'use strict';

  // Crea (una sola vez) el espacio de nombres compartido del proyecto.
  const LA = (window.LA = window.LA || {});

  // Expresion regular simple y suficiente para correos.
  const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Muestra un mensaje de error propio junto al campo y lo marca como invalido.
  function mostrarError(campo, mensaje) {
    if (!campo) return false;
    const contenedor = campo.parentElement;
    let aviso = contenedor.querySelector('.error-msg');
    if (!aviso) {
      aviso = document.createElement('span');
      aviso.className = 'error-msg';
      aviso.setAttribute('aria-live', 'polite');
      aviso.setAttribute('role', 'alert');
      contenedor.appendChild(aviso);
    }
    aviso.textContent = mensaje;
    campo.setAttribute('aria-invalid', 'true');
    campo.classList.add('campo-invalido');
    return false;
  }

  // Limpia el mensaje de error y las marcas de invalidez de un campo.
  function limpiarError(campo) {
    if (!campo) return true;
    const aviso = campo.parentElement.querySelector('.error-msg');
    if (aviso) aviso.textContent = '';
    campo.removeAttribute('aria-invalid');
    campo.classList.remove('campo-invalido');
    return true;
  }

  // Verifica que un campo de texto no este vacio.
  function validarVacio(campo, etiqueta) {
    if (!campo) return false;
    if (!campo.value.trim()) {
      return mostrarError(campo, `${etiqueta} es obligatorio.`);
    }
    return limpiarError(campo);
  }

  // Verifica que un campo tenga un correo electronico valido.
  function validarEmail(campo) {
    if (!campo) return false;
    if (!RE_EMAIL.test(campo.value.trim())) {
      return mostrarError(campo, 'Ingresa un correo electronico valido.');
    }
    return limpiarError(campo);
  }

  // Verifica que un campo cumpla una expresion regular dada.
  function validarPatron(campo, regex, mensaje) {
    if (!campo) return false;
    if (!regex.test(campo.value.trim())) {
      return mostrarError(campo, mensaje);
    }
    return limpiarError(campo);
  }

  // Verifica que el largo del valor este dentro de un rango.
  function validarLargo(campo, min, max, etiqueta) {
    if (!campo) return false;
    const largo = campo.value.trim().length;
    if (largo < min) {
      return mostrarError(campo, `${etiqueta} debe tener al menos ${min} caracteres.`);
    }
    if (max && largo > max) {
      return mostrarError(campo, `${etiqueta} no debe superar ${max} caracteres.`);
    }
    return limpiarError(campo);
  }

  // Verifica que una casilla obligatoria este marcada.
  function validarCheck(campo, mensaje) {
    if (!campo) return false;
    if (!campo.checked) {
      return mostrarError(campo, mensaje);
    }
    return limpiarError(campo);
  }

  // Publica las utilidades en el espacio de nombres compartido.
  LA.mostrarError = mostrarError;
  LA.limpiarError = limpiarError;
  LA.validarVacio = validarVacio;
  LA.validarEmail = validarEmail;
  LA.validarPatron = validarPatron;
  LA.validarLargo = validarLargo;
  LA.validarCheck = validarCheck;
})();
