// ============================================================
// pages/vuelos.js - Autor: Felipe Reyes Ingunza
// Controlador de pagina (ES Module) de Vuelos: importa el
// servicio de vuelos y renderiza el tablero de salidas desde
// Kunming. La fuente es la cadena JSON -> localStorage del
// VueloService (la misma tabla la_db_vuelos que edita el CRUD).
// ============================================================

import { VueloService } from '../services/vuelos.service.js';
import { escaparHtml } from '../shared/render.js';

// Pinta el tablero dinamico de salidas dentro de la seccion de busqueda.
async function pintarSalidas() {
  const seccionBuscar = document.getElementById('buscar');
  if (!seccionBuscar) return;

  const panel = document.createElement('section');
  panel.setAttribute('aria-labelledby', 'salidas-title');
  panel.innerHTML = `
    <h3 id="salidas-title">Salidas desde Kunming (KMG) - tablero dinamico</h3>
    <p>Catalogo servido por VueloService (JSON sembrado en localStorage).</p>
    <div id="salidas-tabla" aria-live="polite"><p>Cargando salidas...</p></div>`;
  seccionBuscar.appendChild(panel);

  const cont = panel.querySelector('#salidas-tabla');
  try {
    const salidas = await VueloService.getSalidasDesde('KMG');
    if (!salidas.length) {
      cont.innerHTML = '<p>No hay salidas programadas.</p>';
      return;
    }
    cont.innerHTML = `
      <div class="table-scroll"><table>
        <caption>${salidas.length} salidas programadas desde KMG</caption>
        <thead><tr>
          <th scope="col">Vuelo</th><th scope="col">Destino</th><th scope="col">Salida</th>
          <th scope="col">Llegada</th><th scope="col">Duracion</th><th scope="col">Precio</th>
        </tr></thead>
        <tbody>${salidas.map((v) => `
          <tr>
            <td>${escaparHtml(v.codigo)}</td>
            <td>${escaparHtml(v.destino)}</td>
            <td>${escaparHtml(v.salida)}</td>
            <td>${escaparHtml(v.llegada)}</td>
            <td>${escaparHtml(v.duracion)}</td>
            <td>CNY ${Number(v.precio)}</td>
          </tr>`).join('')}</tbody>
      </table></div>`;
  } catch (error) {
    console.warn('vuelos (module): no se pudo cargar el tablero.', error);
    cont.innerHTML = '<p>No se pudo cargar el tablero de salidas.</p>';
  }
}

pintarSalidas();
