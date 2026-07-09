// ============================================================
// crud/vuelos-crud.js - Autor: Felipe Reyes Ingunza
// CRUD del catalogo de vuelos en localStorage (el archivo del avance
// estaba vacio; aqui se completa sin Supabase). El catalogo se siembra
// una vez y vuelos.js consume estos datos para la busqueda, de modo que
// la fuente de vuelos es editable/persistente y no un array fijo.
// ============================================================

(function () {
  'use strict';

  const LA = (window.LA = window.LA || {});
  if (!LA.crearRepositorio) return; // requiere crud/db.js
  const repo = LA.crearRepositorio('vuelos');

  // Catalogo inicial de vuelos (mock de la demo).
  const SEMILLA = [
    { codigo: 'LA8201', origen: 'KMG', destino: 'DLU', salida: '06:30', llegada: '07:15', duracion: '45 min', precio: 380 },
    { codigo: 'LA8203', origen: 'KMG', destino: 'DLU', salida: '12:45', llegada: '13:30', duracion: '45 min', precio: 420 },
    { codigo: 'LA8207', origen: 'KMG', destino: 'DLU', salida: '18:10', llegada: '18:55', duracion: '45 min', precio: 350 },
    { codigo: 'LA8310', origen: 'KMG', destino: 'JHG', salida: '08:00', llegada: '09:05', duracion: '1 h 5 min', precio: 540 },
    { codigo: 'LA8412', origen: 'KMG', destino: 'LJG', salida: '07:20', llegada: '08:10', duracion: '50 min', precio: 460 },
    { codigo: 'LA9001', origen: 'KMG', destino: 'PEK', salida: '09:30', llegada: '13:20', duracion: '3 h 50 min', precio: 1280 },
    { codigo: 'LA9105', origen: 'KMG', destino: 'SHA', salida: '14:00', llegada: '17:25', duracion: '3 h 25 min', precio: 1150 },
    { codigo: 'LA8202', origen: 'DLU', destino: 'KMG', salida: '08:00', llegada: '08:45', duracion: '45 min', precio: 360 },
  ];

  repo.sembrar(SEMILLA);

  // API publica del CRUD de vuelos (reutilizable / editable).
  window.VuelosCrud = {
    listar: () => repo.listar(),
    buscarPorRuta: (origen, destino) => repo.listar().filter((v) => v.origen === origen && v.destino === destino),
    crear: (v) => repo.crear(v),
    actualizar: (id, cambios) => repo.actualizar(id, cambios),
    eliminar: (id) => repo.eliminar(id),
  };

  // ----------------------------------------------------------
  // Wiring del panel de gestion en vuelos.html (solo si existe).
  // Renderiza la tabla del catalogo y controla el modal de alta/
  // edicion. Reutiliza el motor CRUD y el escape anti-XSS de db.js.
  // ----------------------------------------------------------
  const esc = LA.escaparHtml;
  const notificar = (m, t) => (LA.notificar ? LA.notificar(m, t) : null);

  document.addEventListener('DOMContentLoaded', () => {
    const lista = document.getElementById('vuelos-lista');
    const form = document.querySelector('[name="form-vuelo"]');
    if (!lista || !form) return; // otras paginas no tienen el panel

    const titulo = document.getElementById('modal-vuelo-title');
    const btnNuevo = document.querySelector('[data-nuevo-vuelo]');
    const campo = (id) => document.getElementById(id);

    // Dibuja la tabla del catalogo guardado en localStorage.
    function render() {
      const filas = window.VuelosCrud.listar();
      if (!filas.length) {
        lista.innerHTML =
          '<div class="crud-panel"><p class="crud-vacio">No hay vuelos en el catalogo. Crea el primero con &laquo;Nuevo vuelo&raquo;.</p></div>';
        return;
      }
      lista.innerHTML = `
        <div class="crud-panel">
          <h3>${filas.length} vuelo(s) en el catalogo</h3>
          <div class="table-scroll"><table>
            <caption>Catalogo de vuelos (localStorage)</caption>
            <thead><tr>
              <th scope="col">Codigo</th><th scope="col">Ruta</th>
              <th scope="col">Salida</th><th scope="col">Llegada</th>
              <th scope="col">Duracion</th><th scope="col">Precio</th>
              <th scope="col">Acciones</th>
            </tr></thead>
            <tbody>${filas.map((v) => `
              <tr data-id="${v.id}">
                <td>${esc(v.codigo)}</td>
                <td>${esc(v.origen)} &rarr; ${esc(v.destino)}</td>
                <td>${esc(v.salida)}</td>
                <td>${esc(v.llegada)}</td>
                <td>${esc(v.duracion)}</td>
                <td>CNY ${esc(v.precio)}</td>
                <td class="crud-acciones">
                  <button type="button" class="btn btn-outline btn-sm" data-accion="editar">Editar</button>
                  <button type="button" class="btn btn-danger btn-sm" data-accion="eliminar">Eliminar</button>
                </td>
              </tr>`).join('')}</tbody>
          </table></div>
        </div>`;
    }

    // Deja el modal en modo "crear" (formulario vacio).
    function prepararNuevo() {
      form.reset();
      campo('vf-id').value = '';
      if (titulo) titulo.textContent = 'Nuevo vuelo';
    }

    // Carga una fila en el formulario y abre el modal en modo "editar".
    function prepararEdicion(v) {
      campo('vf-id').value = v.id;
      campo('vf-codigo').value = v.codigo || '';
      campo('vf-precio').value = v.precio ?? '';
      campo('vf-origen').value = v.origen || '';
      campo('vf-destino').value = v.destino || '';
      campo('vf-salida').value = v.salida || '';
      campo('vf-llegada').value = v.llegada || '';
      campo('vf-duracion').value = v.duracion || '';
      if (titulo) titulo.textContent = 'Editar vuelo';
      window.location.hash = 'modal-vuelo';
    }

    // Editar (UPDATE) y Eliminar (DELETE) por delegacion de eventos.
    lista.addEventListener('click', (e) => {
      const boton = e.target.closest('button[data-accion]');
      if (!boton) return;
      const id = Number(boton.closest('tr').dataset.id);
      if (boton.dataset.accion === 'eliminar') {
        window.VuelosCrud.eliminar(id);
        notificar('Vuelo eliminado del catalogo.', 'ok');
        render();
      } else if (boton.dataset.accion === 'editar') {
        const v = window.VuelosCrud.listar().find((x) => x.id === id);
        if (v) prepararEdicion(v);
      }
    });

    // Boton "Nuevo vuelo": limpia el formulario antes de abrir el modal.
    if (btnNuevo) btnNuevo.addEventListener('click', prepararNuevo);

    // CREATE / UPDATE al enviar (validacion HTML5 nativa ya paso).
    form.addEventListener('submit', (e) => {
      e.preventDefault(); // tomamos control: sin navegacion nativa
      const datos = {
        codigo: campo('vf-codigo').value.trim().toUpperCase(),
        origen: campo('vf-origen').value,
        destino: campo('vf-destino').value,
        salida: campo('vf-salida').value,
        llegada: campo('vf-llegada').value,
        duracion: campo('vf-duracion').value.trim(),
        precio: Number(campo('vf-precio').value),
      };
      if (datos.origen === datos.destino) {
        notificar('El origen y el destino no pueden ser iguales.', 'error');
        return;
      }
      const id = campo('vf-id').value;
      if (id) {
        window.VuelosCrud.actualizar(Number(id), datos);
        notificar('Vuelo actualizado.', 'ok');
      } else {
        window.VuelosCrud.crear(datos);
        notificar('Vuelo agregado al catalogo.', 'ok');
      }
      render();
      prepararNuevo();
      window.location.hash = 'close'; // cierra el modal :target
    });

    render();
  });
})();
