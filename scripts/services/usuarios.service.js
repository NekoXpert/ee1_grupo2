// ============================================================
// services/usuarios.service.js - Autor: Felipe Reyes Ingunza
// Capa de logica (ES Module): datos del usuario persistidos en
// localStorage (perfil, preferencias y resumen de actividad).
// Usa las mismas claves que mi-cuenta.js y el CRUD de reservas,
// centralizando el acceso a datos del usuario en un servicio.
// ============================================================

const KEY_PERFIL = 'la_perfil';
const KEY_PREF = 'la_preferencias';
const KEY_SESION = 'la_sesion';
const KEY_RESERVAS = 'la_db_reservas';
const KEY_COMPRA = 'la_ultima_compra';

// Lee un valor JSON de localStorage de forma segura.
function _leer(key, porDefecto) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v === null || v === undefined ? porDefecto : v;
  } catch {
    return porDefecto;
  }
}

export class UsuarioService {
  // READ: perfil guardado (o los datos basicos de la sesion como fallback).
  static getPerfil() {
    const perfil = _leer(KEY_PERFIL, null);
    if (perfil) return perfil;
    const sesion = _leer(KEY_SESION, null);
    return sesion ? { nombre: sesion.nombre, email: sesion.email } : null;
  }

  // READ: preferencias de comunicacion e idioma.
  static getPreferencias() { return _leer(KEY_PREF, null); }

  // READ: sesion activa (o null).
  static getSesion() { return _leer(KEY_SESION, null); }

  // READ: resumen de actividad de la cuenta para el dashboard.
  static getResumen() {
    const reservas = _leer(KEY_RESERVAS, []);
    return {
      sesion: _leer(KEY_SESION, null),
      perfil: UsuarioService.getPerfil(),
      totalReservas: Array.isArray(reservas) ? reservas.length : 0,
      ultimaCompra: _leer(KEY_COMPRA, null),
    };
  }
}
