// ============================================================
// services/destinos.service.js - Autor: Felipe Reyes Ingunza
// Capa de logica (ES Module): acceso a los destinos de la base
// de datos JSON (scripts/database/destinos.json) via fetch, con
// cache en memoria. Las paginas consumen SOLO esta API, nunca
// leen el JSON directamente.
// ============================================================

const URL_DESTINOS = new URL('../database/destinos.json', import.meta.url);
let cacheDestinos = null;

// Descarga el JSON de destinos una sola vez y lo cachea.
async function _fetchDestinos() {
  if (!cacheDestinos) {
    const resp = await fetch(URL_DESTINOS);
    if (!resp.ok) throw new Error('No se pudo cargar destinos.json');
    cacheDestinos = await resp.json();
  }
  return cacheDestinos;
}

export class DestinoService {
  // READ: devuelve todos los destinos.
  static async getDestinos() { return _fetchDestinos(); }

  // READ: devuelve un destino por su id (o null si no existe).
  static async getDestinoById(id) {
    const destinos = await _fetchDestinos();
    return destinos.find((d) => d.id === id) || null;
  }

  // READ: destinos filtrados por region.
  static async getDestinosPorRegion(region) {
    const destinos = await _fetchDestinos();
    return destinos.filter((d) => d.region === region);
  }
}
