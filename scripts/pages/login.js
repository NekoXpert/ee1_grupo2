// ============================================================
// pages/login.js - Autor: Felipe Reyes Ingunza
// Controlador de pagina (ES Module) de Login: usa AuthService
// para sembrar las cuentas demo de users.json en localStorage
// (la_cuentas) y muestra al usuario las credenciales de prueba.
// El formulario clasico (login.js + cuentas.js) sigue haciendo
// el login: ambas capas comparten las mismas claves.
// ============================================================

import { AuthService } from '../services/auth.service.js';

// Siembra las cuentas demo y muestra la nota con las credenciales.
async function prepararCuentaDemo() {
  const formLogin = document.querySelector('[name="form-login"]');
  if (!formLogin) return;

  try {
    await AuthService.seedUsuariosDemo(); // CREATE solo si aun no existen

    const nota = document.createElement('p');
    nota.className = 'la-aviso la-aviso--info';
    nota.innerHTML = 'Cuenta demo disponible: <strong>demo@luckyair.com</strong> / <strong>lucky123</strong> (sembrada desde users.json).';
    formLogin.insertAdjacentElement('afterend', nota);
  } catch (error) {
    console.warn('login (module): no se pudo sembrar la cuenta demo.', error);
  }
}

prepararCuentaDemo();
