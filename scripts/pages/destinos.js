// ============================================================
// pages/destinos.js - Autor: Felipe Reyes Ingunza
// Controlador de pagina (ES Module) de Destinos: importa los
// servicios de destinos y paquetes, y renderiza dos secciones
// dinamicas (guia de destinos y paquetes recomendados) cuyo
// contenido viene 100% de la base de datos JSON via fetch.
// ============================================================

import { DestinoService } from '../services/destinos.service.js';
import { OfertaService } from '../services/ofertas.service.js';
import { tarjetaDestino, tarjetaPaquete } from '../shared/render.js';

// Pinta la guia dinamica de destinos despues del listado principal.
async function pintarGuiaDestinos() {
  const listado = document.getElementById('listado');
  if (!listado) return;

  const seccion = document.createElement('section');
  seccion.setAttribute('aria-labelledby', 'guia-dinamica-title');
  seccion.innerHTML = `
    <h2 id="guia-dinamica-title">Guia dinamica de destinos</h2>
    <p>Datos servidos por la capa de servicios (DestinoService, desde destinos.json).</p>
    <div class="cards" id="grid-guia" aria-live="polite"><p>Cargando destinos...</p></div>`;
  listado.insertAdjacentElement('afterend', seccion);

  const grid = seccion.querySelector('#grid-guia');
  try {
    const destinos = await DestinoService.getDestinos();
    grid.innerHTML = destinos.map(tarjetaDestino).join('');
  } catch (error) {
    console.warn('destinos (module): no se pudo cargar la guia.', error);
    grid.innerHTML = '<p>No se pudo cargar la guia de destinos.</p>';
  }
}

// Pinta los paquetes turisticos recomendados al final de la guia.
async function pintarPaquetes() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const seccion = document.createElement('section');
  seccion.setAttribute('aria-labelledby', 'paquetes-title');
  seccion.innerHTML = `
    <h2 id="paquetes-title">Paquetes recomendados</h2>
    <p>Paquetes multi-destino cargados desde paquetes.json (OfertaService).</p>
    <div class="cards" id="grid-paquetes" aria-live="polite"><p>Cargando paquetes...</p></div>`;
  main.appendChild(seccion);

  const grid = seccion.querySelector('#grid-paquetes');
  try {
    const paquetes = await OfertaService.getPaquetes();
    grid.innerHTML = paquetes.map(tarjetaPaquete).join('');
  } catch (error) {
    console.warn('destinos (module): no se pudieron cargar los paquetes.', error);
    grid.innerHTML = '<p>No se pudieron cargar los paquetes.</p>';
  }
}

pintarGuiaDestinos();
pintarPaquetes();
