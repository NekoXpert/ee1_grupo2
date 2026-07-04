// ============================================================
// crud/empresas-crud.js - Autor: Felipe Reyes Ingunza
// CRUD de empresas B2B persistido en localStorage (antes Supabase).
// Al registrar una empresa desde el formulario, el registro se guarda
// y se muestra en una tabla dinamica con acciones Editar / Eliminar,
// demostrando el ciclo CRUD completo requerido por la EE4.
// ============================================================

(function () {
  'use strict';

  const LA = (window.LA = window.LA || {});
  if (!LA.crearRepositorio) return; // requiere crud/db.js
  const repo = LA.crearRepositorio('empresas');
  const esc = LA.escaparHtml;

  // Calcula el % de descuento corporativo segun el plan elegido.
  function calcularDescuento(plan) {
    return { starter: 5, business: 10, enterprise: 15 }[plan] || 0;
  }

  // API publica del CRUD de empresas (usada por la pagina y reutilizable).
  const api = {
    calcularDescuento,
    listar: () => repo.listar(),
    buscarPorRuc: (ruc) => repo.listar().find((e) => e.ruc === String(ruc).trim()) || null,
    crear: (p) => repo.crear({
      razon_social: p.razon_social,
      ruc: p.ruc,
      tamano: p.tamano,
      rubro: p.rubro,
      contacto: p.contacto,
      email: p.email,
      telefono: p.telefono,
      plan: p.plan,
      descuento: calcularDescuento(p.plan),
    }),
    actualizar: (id, cambios) => repo.actualizar(id, cambios),
    eliminar: (id) => repo.eliminar(id),
  };
  window.EmpresasCrud = api;

  // ----------------------------------------------------------
  // Wiring de la pagina de empresas (solo si el form existe).
  // ----------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('[name="form-empresa"]');
    const seccion = document.getElementById('registro');
    if (!form || !seccion) return;

    // Panel donde se listan las empresas registradas.
    const panel = document.createElement('div');
    panel.className = 'crud-panel';
    panel.innerHTML = '<h3>Empresas registradas (localStorage)</h3><div class="crud-lista"></div>';
    seccion.appendChild(panel);
    const lista = panel.querySelector('.crud-lista');

    // Dibuja la tabla de empresas guardadas en localStorage.
    function render() {
      const filas = api.listar();
      if (!filas.length) {
        lista.innerHTML = '<p class="crud-vacio">Aun no hay empresas registradas. Completa el formulario para crear la primera.</p>';
        return;
      }
      lista.innerHTML = `
        <div class="table-scroll"><table>
          <caption>${filas.length} empresa(s) en tu navegador</caption>
          <thead><tr>
            <th scope="col">Razon social</th><th scope="col">RUC/NIT</th>
            <th scope="col">Plan</th><th scope="col">Descuento</th><th scope="col">Acciones</th>
          </tr></thead>
          <tbody>${filas.map((e) => `
            <tr data-id="${e.id}">
              <td>${esc(e.razon_social)}</td>
              <td>${esc(e.ruc)}</td>
              <td>${esc(e.plan)}</td>
              <td>${e.descuento}%</td>
              <td class="crud-acciones">
                <button type="button" class="btn btn-outline btn-sm" data-accion="editar">Editar plan</button>
                <button type="button" class="btn btn-danger btn-sm" data-accion="eliminar">Eliminar</button>
              </td>
            </tr>`).join('')}</tbody>
        </table></div>`;
    }

    // Delegacion de eventos para Editar (UPDATE) y Eliminar (DELETE).
    lista.addEventListener('click', (e) => {
      const boton = e.target.closest('button[data-accion]');
      if (!boton) return;
      const id = Number(boton.closest('tr').dataset.id);
      if (boton.dataset.accion === 'eliminar') {
        api.eliminar(id);
        if (LA.notificar) LA.notificar('Empresa eliminada.', 'ok');
        render();
      } else if (boton.dataset.accion === 'editar') {
        const actual = repo.obtener(id);
        const nuevo = prompt('Nuevo plan (starter / business / enterprise):', actual ? actual.plan : 'starter');
        if (!nuevo) return;
        const plan = nuevo.trim().toLowerCase();
        if (!['starter', 'business', 'enterprise'].includes(plan)) {
          if (LA.notificar) LA.notificar('Plan no valido.', 'error');
          return;
        }
        api.actualizar(id, { plan, descuento: calcularDescuento(plan) });
        if (LA.notificar) LA.notificar('Plan actualizado.', 'ok');
        render();
      }
    });

    // CREATE: al enviar el form ya validado (empresas.js) guardamos el registro.
    form.addEventListener('submit', (e) => {
      if (e.defaultPrevented) return; // empresas.js bloqueo por validacion
      e.preventDefault(); // tomamos control: evitamos la navegacion GET nativa
      const val = (id) => (document.getElementById(id)?.value || '').trim();
      api.crear({
        razon_social: val('e-razon'),
        ruc: val('e-ruc'),
        tamano: val('e-tamano'),
        rubro: val('e-rubro'),
        contacto: val('e-contacto'),
        email: val('e-email'),
        telefono: val('e-tel'),
        plan: document.querySelector('[name="plan"]:checked')?.value || 'starter',
      });
      render();
      if (LA.notificar) LA.notificar('Empresa registrada en localStorage.', 'ok');
      form.reset();
      window.location.hash = 'gracias-empresa';
    });

    render();
  });
})();
