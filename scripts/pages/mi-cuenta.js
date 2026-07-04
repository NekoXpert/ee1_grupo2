// ============================================================
// pages/mi-cuenta.js - Autor: Felipe Reyes Ingunza
// Controlador de pagina (ES Module) de Mi cuenta: importa
// UsuarioService y el helper de sesion para pintar un resumen
// dinamico de la cuenta (sesion, reservas y ultima compra),
// todo leido desde localStorage a traves de la capa de servicios.
// ============================================================

import { UsuarioService } from '../services/usuarios.service.js';
import { sesionActual, nombreCorto } from '../shared/sesion.js';
import { escaparHtml } from '../shared/render.js';

// Pinta el panel-resumen de la cuenta al inicio del contenido.
function pintarResumenCuenta() {
  const seccionReservas = document.getElementById('reservas');
  if (!seccionReservas) return;

  const resumen = UsuarioService.getResumen();
  const sesion = sesionActual();

  const panel = document.createElement('section');
  panel.className = 'crud-panel';
  panel.setAttribute('aria-labelledby', 'resumen-cuenta-title');

  if (!sesion) {
    panel.innerHTML = `
      <h3 id="resumen-cuenta-title">Resumen de tu cuenta</h3>
      <p>No has iniciado sesion. <a href="login.html">Ingresa aqui</a> para ver tu resumen personalizado.</p>`;
  } else {
    const compra = resumen.ultimaCompra
      ? `${escaparHtml(resumen.ultimaCompra.vuelo)} (${escaparHtml(resumen.ultimaCompra.total)})`
      : 'Aun no registras compras';
    panel.innerHTML = `
      <h3 id="resumen-cuenta-title">Hola, ${escaparHtml(nombreCorto(sesion))}</h3>
      <dl>
        <dt>Email</dt><dd>${escaparHtml(sesion.email)}</dd>
        <dt>Reservas guardadas</dt><dd>${resumen.totalReservas}</dd>
        <dt>Ultima compra</dt><dd>${compra}</dd>
      </dl>
      <p><small>Resumen servido por UsuarioService desde localStorage.</small></p>`;
  }

  seccionReservas.insertAdjacentElement('beforebegin', panel);
}

pintarResumenCuenta();
