// ============================================================
// services/ofertas.service.js - Autor: Felipe Reyes Ingunza
// Capa de logica (ES Module): acceso a ofertas y paquetes de la
// base de datos JSON (ofertas.json / paquetes.json) via fetch,
// con cache en memoria y reglas de negocio (destacadas, vigencia).
// ============================================================

const URL_OFERTAS = new URL('../database/ofertas.json', import.meta.url);
const URL_PAQUETES = new URL('../database/paquetes.json', import.meta.url);
let cacheOfertas = null;
let cachePaquetes = null;

// Descarga el JSON de ofertas una sola vez y lo cachea.
async function _fetchOfertas() {
  if (!cacheOfertas) {
    const resp = await fetch(URL_OFERTAS);
    if (!resp.ok) throw new Error('No se pudo cargar ofertas.json');
    cacheOfertas = await resp.json();
  }
  return cacheOfertas;
}

// Descarga el JSON de paquetes una sola vez y lo cachea.
async function _fetchPaquetes() {
  if (!cachePaquetes) {
    const resp = await fetch(URL_PAQUETES);
    if (!resp.ok) throw new Error('No se pudo cargar paquetes.json');
    cachePaquetes = await resp.json();
  }
  return cachePaquetes;
}

export class OfertaService {
  // READ: devuelve todas las ofertas.
  static async getOfertas() { return _fetchOfertas(); }

  // READ: regla de negocio - solo las ofertas marcadas como destacadas.
  static async getOfertasDestacadas() {
    const ofertas = await _fetchOfertas();
    return ofertas.filter((o) => o.destacada);
  }

  // READ: devuelve todos los paquetes turisticos.
  static async getPaquetes() { return _fetchPaquetes(); }

  // READ: un paquete por id (o null si no existe).
  static async getPaqueteById(id) {
    const paquetes = await _fetchPaquetes();
    return paquetes.find((p) => p.id === id) || null;
  }
}
