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
})();
