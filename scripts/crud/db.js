// ============================================================
// crud/db.js - Autor: Felipe Reyes Ingunza
// Motor CRUD generico y reutilizable sobre localStorage.
// Cada "tabla" se guarda como un arreglo JSON bajo la clave
// la_db_<nombre>. Provee id autoincremental y las 4 operaciones
// CRUD (crear, leer, actualizar, eliminar) para no repetir codigo
// en cada entidad (empresas, estudiantes, reservas, vuelos...).
//
// Reemplaza la version anterior basada en Supabase: ahora todo el
// CRUD persiste en el navegador (localStorage), sin dependencias
// externas ni claves expuestas, y funciona sin conexion.
// ============================================================

(function () {
  'use strict';

  const LA = (window.LA = window.LA || {});
  const PREFIJO = 'la_db_';

  // Lee una tabla completa como arreglo (o [] si no existe / falla).
  function leerTabla(nombre) {
    try {
      const filas = JSON.parse(localStorage.getItem(PREFIJO + nombre));
      return Array.isArray(filas) ? filas : [];
    } catch {
      return [];
    }
  }

  // Escribe el arreglo completo de una tabla en localStorage.
  function escribirTabla(nombre, filas) {
    try {
      localStorage.setItem(PREFIJO + nombre, JSON.stringify(filas));
      return true;
    } catch {
      return false;
    }
  }

  // Devuelve una fecha ISO legible para marcar la creacion del registro.
  function ahoraISO() {
    try { return new Date().toISOString(); } catch { return ''; }
  }

  // Crea un repositorio (objeto con las operaciones CRUD) para una tabla.
  function crearRepositorio(nombre) {
    return {
      // READ: devuelve todas las filas.
      listar() {
        return leerTabla(nombre);
      },
      // READ: devuelve una fila por id (o null).
      obtener(id) {
        return leerTabla(nombre).find((r) => r.id === Number(id)) || null;
      },
      // CREATE: agrega una fila con id autoincremental y fecha.
      crear(datos) {
        const filas = leerTabla(nombre);
        const id = filas.reduce((max, r) => Math.max(max, r.id || 0), 0) + 1;
        const fila = { id, creado: ahoraISO(), ...datos };
        filas.push(fila);
        escribirTabla(nombre, filas);
        return fila;
      },
      // UPDATE: fusiona cambios en la fila indicada (o null si no existe).
      actualizar(id, cambios) {
        const filas = leerTabla(nombre);
        const i = filas.findIndex((r) => r.id === Number(id));
        if (i < 0) return null;
        filas[i] = { ...filas[i], ...cambios };
        escribirTabla(nombre, filas);
        return filas[i];
      },
      // DELETE: elimina la fila indicada; true si borro algo.
      eliminar(id) {
        const filas = leerTabla(nombre);
        const restantes = filas.filter((r) => r.id !== Number(id));
        escribirTabla(nombre, restantes);
        return restantes.length !== filas.length;
      },
      // Vacia la tabla por completo.
      vaciar() {
        escribirTabla(nombre, []);
      },
      // Siembra datos iniciales solo si la tabla esta vacia (para demos).
      sembrar(filasIniciales) {
        if (leerTabla(nombre).length === 0 && Array.isArray(filasIniciales)) {
          const conId = filasIniciales.map((f, i) => ({ id: i + 1, creado: ahoraISO(), ...f }));
          escribirTabla(nombre, conId);
        }
        return leerTabla(nombre);
      },
    };
  }

  // Escapa texto para insertarlo de forma segura como HTML (anti-XSS basico).
  function escaparHtml(valor) {
    return String(valor == null ? '' : valor)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Publica el motor CRUD en el espacio de nombres compartido window.LA.
  LA.crearRepositorio = crearRepositorio;
  LA.escaparHtml = escaparHtml;
})();
