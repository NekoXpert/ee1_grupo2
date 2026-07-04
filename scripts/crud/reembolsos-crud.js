// ============================================================
// crud/reembolsos-crud.js - Autor: Felipe Reyes Ingunza
// CRUD de solicitudes de reembolso en localStorage (el archivo del
// avance estaba vacio; aqui se completa sin Supabase). vuelos.js crea
// una solicitud al enviar el formulario de reembolso y este modulo la
// lista con opcion de Eliminar (DELETE), mostrando el historial.
// ============================================================

(function () {
  'use strict';

  const LA = (window.LA = window.LA || {});
  if (!LA.crearRepositorio) return; // requiere crud/db.js
  const repo = LA.crearRepositorio('reembolsos');
  const esc = LA.escaparHtml;

  // API publica del CRUD de reembolsos.
  const api = {
    listar: () => repo.listar(),
    crear: (r) => repo.crear(r),
    eliminar: (id) => repo.eliminar(id),
  };
  window.ReembolsosCrud = api;

  // ----------------------------------------------------------
  // Wiring de la pagina de vuelos: historial de reembolsos.
  // Se activa solo si existe el formulario de reembolso.
  // ----------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('[name="form-reembolso"]');
    if (!form) return;

    const panel = document.createElement('div');
    panel.className = 'crud-panel';
    panel.innerHTML = '<h3>Historial de solicitudes de reembolso (localStorage)</h3><div class="crud-lista"></div>';
    form.insertAdjacentElement('afterend', panel);
    const lista = panel.querySelector('.crud-lista');

    // Dibuja las solicitudes de reembolso guardadas.
    function render() {
      const filas = api.listar();
      if (!filas.length) {
        lista.innerHTML = '<p class="crud-vacio">Aun no has enviado solicitudes de reembolso.</p>';
        return;
      }
      lista.innerHTML = `
        <div class="table-scroll"><table>
          <caption>${filas.length} solicitud(es) registradas</caption>
          <thead><tr>
            <th scope="col">Codigo</th><th scope="col">Motivo</th>
            <th scope="col">Reembolso</th><th scope="col">Accion</th>
          </tr></thead>
          <tbody>${filas.map((r) => `
            <tr data-id="${r.id}">
              <td>${esc(r.codigo)}</td>
              <td>${esc(r.motivo)}</td>
              <td>CNY ${esc(r.devolucion)}</td>
              <td><button type="button" class="btn btn-danger btn-sm" data-accion="eliminar">Eliminar</button></td>
            </tr>`).join('')}</tbody>
        </table></div>`;
    }

    lista.addEventListener('click', (e) => {
      const boton = e.target.closest('button[data-accion="eliminar"]');
      if (!boton) return;
      api.eliminar(Number(boton.closest('tr').dataset.id));
      if (LA.notificar) LA.notificar('Solicitud eliminada.', 'ok');
      render();
    });

    // Exponemos el render para que vuelos.js refresque tras crear.
    api.render = render;
    render();
  });
})();
