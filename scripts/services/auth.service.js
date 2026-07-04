// ============================================================
// services/auth.service.js - Autor: Felipe Reyes Ingunza
// Capa de logica (ES Module): autenticacion sobre localStorage.
// Opera sobre las MISMAS claves que scripts/cuentas.js clasico
// (la_cuentas / la_sesion), por lo que ambos caminos son 100%
// compatibles. Ademas siembra cuentas demo desde users.json.
//
// NOTA: la contrasena se guarda ofuscada (base64), igual que en
// cuentas.js. Es una simulacion academica, NO seguridad real.
// ============================================================

const URL_USERS = new URL('../database/users.json', import.meta.url);
const KEY_CUENTAS = 'la_cuentas';
const KEY_SESION = 'la_sesion';

// Ofusca un texto a base64 (mismo formato que cuentas.js).
function _ofuscar(txt) {
  try { return btoa(unescape(encodeURIComponent(txt))); } catch { return txt; }
}

// Lee un valor JSON de localStorage de forma segura.
function _leer(key, porDefecto) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v === null || v === undefined ? porDefecto : v;
  } catch {
    return porDefecto;
  }
}

// Escribe un valor JSON en localStorage.
function _escribir(key, valor) {
  try { localStorage.setItem(key, JSON.stringify(valor)); return true; }
  catch { return false; }
}

export class AuthService {
  // CREATE: siembra en la_cuentas los usuarios demo de users.json
  // que aun no existan. Devuelve cuantos se agregaron.
  static async seedUsuariosDemo() {
    const resp = await fetch(URL_USERS);
    if (!resp.ok) throw new Error('No se pudo cargar users.json');
    const demo = await resp.json();
    const cuentas = _leer(KEY_CUENTAS, []);
    let nuevos = 0;
    demo.forEach((u) => {
      const email = String(u.email).trim().toLowerCase();
      if (!cuentas.some((c) => c.email === email)) {
        cuentas.push({
          nombre: u.nombre || '', apellido: u.apellido || '', email,
          pass: _ofuscar(u.pass || ''), pais: u.pais || '', doc: '', fecha: '',
        });
        nuevos++;
      }
    });
    if (nuevos) _escribir(KEY_CUENTAS, cuentas);
    return nuevos;
  }

  // READ: verifica credenciales contra las cuentas guardadas.
  static login(email, pass) {
    const e = String(email).trim().toLowerCase();
    const cuenta = _leer(KEY_CUENTAS, []).find((c) => c.email === e);
    if (!cuenta) return { ok: false, error: 'No existe una cuenta con ese correo.' };
    if (cuenta.pass !== _ofuscar(pass)) return { ok: false, error: 'La contrasena no es correcta.' };
    const usuario = { nombre: cuenta.nombre || e.split('@')[0], email: e };
    _escribir(KEY_SESION, usuario);
    return { ok: true, usuario };
  }

  // READ: devuelve la sesion activa o null.
  static sesionActual() { return _leer(KEY_SESION, null); }

  // DELETE: cierra la sesion activa.
  static cerrarSesion() {
    try { localStorage.removeItem(KEY_SESION); } catch { /* sin storage */ }
  }
}
