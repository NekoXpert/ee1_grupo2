// ============================================================
// shared/sesion.js - Autor: Felipe Reyes Ingunza
// Helper de sesion reutilizable (ES Module): lectura de la
// sesion activa desde localStorage (clave la_sesion, compartida
// con main.js, cuentas.js y auth.service.js).
// ============================================================

const KEY_SESION = 'la_sesion';

// Devuelve la sesion activa ({ nombre, email }) o null.
export function sesionActual() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY_SESION));
    return s && s.email ? s : null;
  } catch {
    return null;
  }
}

// Devuelve el nombre corto para saludar al usuario.
export function nombreCorto(sesion) {
  if (!sesion) return '';
  return (sesion.nombre || sesion.email.split('@')[0]).split(' ')[0];
}
