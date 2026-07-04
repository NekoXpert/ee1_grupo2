// ============================================================
// crud/reservas-crud.js - Autor: Felipe Reyes Ingunza
// CRUD de reservas de vuelo persistido en localStorage (el archivo
// del avance estaba vacio; aqui se completa sin Supabase). Conecta
// el flujo real de la app:
//   - checkout.js CREA una reserva al confirmar el pago,
//   - mi-cuenta LISTA y CANCELA (DELETE) las reservas,
//   - vuelos.js VALIDA un ticket buscando su codigo aqui.
// ============================================================

(function () {
  'use strict';

  const LA = (window.LA = window.LA || {});
  if (!LA.crearRepositorio) return; // requiere crud/db.js
  const repo = LA.crearRepositorio('reservas');
  const esc = LA.escaparHtml;

  // Reservas de ejemplo (se siembran una sola vez para la demo).
  const SEMILLA = [
    { codigo: 'ABC123', vuelo: 'LA8201', ruta: 'KMG - DLU', fechaISO: '2026-04-20', fecha: '20 abr 2026', pasajero: 'Reyes', estado: 'Confirmado' },
    { codigo: 'DEF456', vuelo: 'LA8310', ruta: 'KMG - JHG', fechaISO: '2026-05-12', fecha: '12 may 2026', pasajero: 'Mamani', estado: 'Pendiente de pago' },
    { codigo: 'GHI789', vuelo: 'LA8202', ruta: 'DLU - KMG', fechaISO: '2026-02-03', fecha: '03 feb 2026', pasajero: 'Batti', estado: 'Completado' },
  ];

  // Genera un codigo de reserva de 6 caracteres (A-Z, 0-9) unico.
  function generarCodigo() {
    const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const usados = new Set(repo.listar().map((r) => r.codigo));
    let codigo;
    do {
      codigo = '';
      for (let i = 0; i < 6; i++) codigo += abc[Math.floor(Math.random() * abc.length)];
    } while (usados.has(codigo));
    return codigo;
  }

  // Asegura que existan las reservas de ejemplo la primera vez.
  repo.sembrar(SEMILLA);

  // API publica del CRUD de reservas.
  const api = {
    listar: () => repo.listar(),
    buscarPorCodigo: (cod) => repo.listar().find((r) => r.codigo === String(cod).trim().toUpperCase()) || null,
    eliminar: (id) => repo.eliminar(id),
    actualizar: (id, cambios) => repo.actualizar(id, cambios),
    // CREATE: registra una reserva a partir de una compra del checkout.
    crearDesdeCompra(compra) {
      const hoy = (function () { try { return new Date(); } catch { return null; } })();
      const iso = hoy ? hoy.toISOString().split('T')[0] : '';
      const legible = hoy ? hoy.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : iso;
      return repo.crear({
        codigo: generarCodigo(),
        vuelo: compra.vuelo || 'LA8201',
        ruta: compra.ruta || 'KMG - DLU',
        fechaISO: iso,
        fecha: legible,
        pasajero: compra.pasajero || 'Titular',
        estado: 'Confirmado',
        total: compra.total || '',
      });
    },
  };
  window.ReservasCrud = api;

  // ----------------------------------------------------------
  // Wiring de mi-cuenta: render dinamico de la tabla de reservas.
  // ----------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    const seccion = document.getElementById('reservas');
    const tbody = seccion ? seccion.querySelector('table tbody') : null;
    if (!tbody) return;

    // Dibuja las reservas guardadas en la tabla de "Mis reservas".
    function render() {
      const filas = api.listar();
      if (!filas.length) {
        tbody.innerHTML = '<tr><td colspan="5">No tienes reservas. Compra un vuelo para verlo aqui.</td></tr>';
        return;
      }
      tbody.innerHTML = filas.map((r) => `
        <tr data-id="${r.id}">
          <td>${esc(r.codigo)}</td>
          <td>${esc(r.ruta)}</td>
          <td><time datetime="${esc(r.fechaISO)}">${esc(r.fecha)}</time></td>
          <td>${esc(r.estado)}</td>
          <td class="crud-acciones">
            <a href="vuelos.html#validar" class="btn btn-outline btn-sm">Check-in</a>
            <button type="button" class="btn btn-danger btn-sm" data-accion="cancelar">Cancelar</button>
          </td>
        </tr>`).join('');
    }

    // DELETE: cancelar una reserva y volver a renderizar.
    tbody.addEventListener('click', (e) => {
      const boton = e.target.closest('button[data-accion="cancelar"]');
      if (!boton) return;
      api.eliminar(Number(boton.closest('tr').dataset.id));
      if (LA.notificar) LA.notificar('Reserva cancelada.', 'ok');
      render();
    });

    render();
  });
})();
