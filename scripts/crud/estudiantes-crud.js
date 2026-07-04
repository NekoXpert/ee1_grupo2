// ============================================================
// crud/estudiantes-crud.js - Autor: Felipe Reyes Ingunza
// CRUD de estudiantes verificados y cotizaciones grupales,
// persistido en localStorage (antes Supabase). Al enviar los
// formularios de la pagina Estudiantes se guardan los registros y
// se muestran en tablas dinamicas con accion Eliminar (DELETE).
// ============================================================

(function () {
  'use strict';

  const LA = (window.LA = window.LA || {});
  if (!LA.crearRepositorio) return; // requiere crud/db.js
  const repoEst = LA.crearRepositorio('estudiantes');
  const repoCot = LA.crearRepositorio('cotizaciones');
  const esc = LA.escaparHtml;

  // API publica reutilizable del CRUD de estudiantes.
  const api = {
    listarEstudiantes: () => repoEst.listar(),
    listarCotizaciones: () => repoCot.listar(),
    crearEstudiante: (p) => repoEst.crear(p),
    crearCotizacion: (p) => repoCot.crear(p),
    eliminarEstudiante: (id) => repoEst.eliminar(id),
    eliminarCotizacion: (id) => repoCot.eliminar(id),
    buscarPorEmail: (email) => repoEst.listar().find((e) => e.email === String(email).trim().toLowerCase()) || null,
  };
  window.EstudiantesCrud = api;

  // Crea un panel-lista dentro de una seccion y devuelve helpers de render.
  function montarPanel(seccion, titulo) {
    const panel = document.createElement('div');
    panel.className = 'crud-panel';
    panel.innerHTML = `<h3>${titulo}</h3><div class="crud-lista"></div>`;
    seccion.appendChild(panel);
    return panel.querySelector('.crud-lista');
  }

  document.addEventListener('DOMContentLoaded', () => {
    // ------- Verificacion de carnet (estudiantes) -------
    const formVer = document.querySelector('[name="form-verificacion"]');
    const secVer = document.getElementById('verificacion');
    if (formVer && secVer) {
      const lista = montarPanel(secVer, 'Estudiantes verificados (localStorage)');

      function render() {
        const filas = api.listarEstudiantes();
        if (!filas.length) {
          lista.innerHTML = '<p class="crud-vacio">Aun no hay estudiantes verificados en este navegador.</p>';
          return;
        }
        lista.innerHTML = `
          <div class="table-scroll"><table>
            <caption>${filas.length} estudiante(s) registrados</caption>
            <thead><tr>
              <th scope="col">Nombre</th><th scope="col">Email</th>
              <th scope="col">Universidad</th><th scope="col">Ciclo</th><th scope="col">Accion</th>
            </tr></thead>
            <tbody>${filas.map((s) => `
              <tr data-id="${s.id}">
                <td>${esc(s.nombre)}</td><td>${esc(s.email)}</td>
                <td>${esc(s.universidad)}</td><td>${esc(s.ciclo)}</td>
                <td><button type="button" class="btn btn-danger btn-sm" data-accion="eliminar">Eliminar</button></td>
              </tr>`).join('')}</tbody>
          </table></div>`;
      }

      lista.addEventListener('click', (e) => {
        const boton = e.target.closest('button[data-accion="eliminar"]');
        if (!boton) return;
        api.eliminarEstudiante(Number(boton.closest('tr').dataset.id));
        if (LA.notificar) LA.notificar('Verificacion eliminada.', 'ok');
        render();
      });

      formVer.addEventListener('submit', (e) => {
        if (e.defaultPrevented) return; // estudiantes.js bloqueo por validacion
        e.preventDefault();
        const val = (id) => (document.getElementById(id)?.value || '').trim();
        api.crearEstudiante({
          nombre: val('est-nombre'),
          email: val('est-email').toLowerCase(),
          universidad: val('est-uni'),
          carnet: val('est-carnet'),
          ciclo: val('est-ciclo'),
        });
        render();
        if (LA.notificar) LA.notificar('Estudiante verificado y guardado.', 'ok');
        formVer.reset();
        window.location.hash = 'gracias-verificacion';
      });

      render();
    }

    // ------- Cotizacion grupal universitaria -------
    const formGrupo = document.querySelector('[name="form-grupo"]');
    const secGrupo = document.getElementById('grupos');
    if (formGrupo && secGrupo) {
      const lista = montarPanel(secGrupo, 'Cotizaciones grupales solicitadas (localStorage)');

      function render() {
        const filas = api.listarCotizaciones();
        if (!filas.length) {
          lista.innerHTML = '<p class="crud-vacio">Aun no has solicitado cotizaciones grupales.</p>';
          return;
        }
        lista.innerHTML = `
          <div class="table-scroll"><table>
            <caption>${filas.length} cotizacion(es) guardadas</caption>
            <thead><tr>
              <th scope="col">Institucion</th><th scope="col">Ruta</th>
              <th scope="col">Personas</th><th scope="col">Fecha</th><th scope="col">Accion</th>
            </tr></thead>
            <tbody>${filas.map((c) => `
              <tr data-id="${c.id}">
                <td>${esc(c.institucion)}</td>
                <td>${esc(c.origen)} - ${esc(c.destino)}</td>
                <td>${esc(c.personas)}</td><td>${esc(c.fecha)}</td>
                <td><button type="button" class="btn btn-danger btn-sm" data-accion="eliminar">Eliminar</button></td>
              </tr>`).join('')}</tbody>
          </table></div>`;
      }

      lista.addEventListener('click', (e) => {
        const boton = e.target.closest('button[data-accion="eliminar"]');
        if (!boton) return;
        api.eliminarCotizacion(Number(boton.closest('tr').dataset.id));
        if (LA.notificar) LA.notificar('Cotizacion eliminada.', 'ok');
        render();
      });

      formGrupo.addEventListener('submit', (e) => {
        if (e.defaultPrevented) return; // validacion nativa fallida
        e.preventDefault();
        const val = (id) => (document.getElementById(id)?.value || '').trim();
        api.crearCotizacion({
          institucion: val('g-institucion'),
          contacto: val('g-contacto'),
          email: val('g-email'),
          telefono: val('g-tel'),
          personas: val('g-personas'),
          origen: val('g-origen'),
          destino: val('g-destino'),
          fecha: val('g-fecha'),
          detalles: val('g-detalles'),
        });
        render();
        if (LA.notificar) LA.notificar('Cotizacion grupal guardada.', 'ok');
        formGrupo.reset();
        window.location.hash = 'gracias-grupo';
      });

      render();
    }
  });
})();
