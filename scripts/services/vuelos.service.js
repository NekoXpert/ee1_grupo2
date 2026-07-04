// ============================================================
// services/vuelos.service.js - Autor: Felipe Reyes Ingunza
// Capa de logica (ES Module): catalogo de vuelos. La base JSON
// (scripts/database/vuelos.json) siembra la base local una sola
// vez; despues TODO se lee desde localStorage (la_db_vuelos), la
// misma tabla que edita el CRUD (scripts/crud/vuelos-crud.js).
// Asi el flujo es: JSON (fetch) -> localStorage -> paginas.
// ============================================================

const URL_VUELOS = new URL('../database/vuelos.json', import.meta.url);
const KEY_LOCAL = 'la_db_vuelos'; // misma tabla del motor CRUD

// Lee el catalogo persistido en localStorage (o null si no existe).
function _leerLocal() {
  try {
    const filas = JSON.parse(localStorage.getItem(KEY_LOCAL));
    return Array.isArray(filas) && filas.length ? filas : null;
  } catch {
    return null;
  }
}

// Descarga el JSON de vuelos (fuente semilla).
async function _fetchVuelos() {
  const resp = await fetch(URL_VUELOS);
  if (!resp.ok) throw new Error('No se pudo cargar vuelos.json');
  return resp.json();
}

export class VueloService {
  // READ: catalogo desde localStorage; si esta vacio, lo siembra desde el JSON.
  static async getVuelos() {
    const local = _leerLocal();
    if (local) return local;
    const vuelos = await _fetchVuelos();
    try {
      const conId = vuelos.map((v, i) => ({ id: i + 1, ...v }));
      localStorage.setItem(KEY_LOCAL, JSON.stringify(conId));
      return conId;
    } catch {
      return vuelos; // sin localStorage disponible, devuelve el JSON igual
    }
  }

  // READ: vuelos de una ruta origen -> destino.
  static async getVuelosPorRuta(origen, destino) {
    const vuelos = await VueloService.getVuelos();
    return vuelos.filter((v) => v.origen === origen && v.destino === destino);
  }

  // READ: vuelos que salen de un aeropuerto (para tableros de salidas).
  static async getSalidasDesde(origen) {
    const vuelos = await VueloService.getVuelos();
    return vuelos.filter((v) => v.origen === origen);
  }
}
