// ============================================================
// pages/index.js - Autor: Felipe Reyes Ingunza
// Controlador de pagina (ES Module) del home: importa la capa de
// servicios y renderiza dinamicamente la grilla de ofertas
// destacadas. Los datos NO estan en el HTML: se inyectan con
// JavaScript despues del fetch (ofertas.json -> OfertaService).
// ============================================================

import { OfertaService } from '../services/ofertas.service.js';
import { tarjetaOferta } from '../shared/render.js';

// Pinta la seccion "Ofertas destacadas" despues de los destinos del home.
async function pintarOfertasDestacadas() {
  const ancla = document.getElementById('destinos-title');
  const seccionDestinos = ancla ? ancla.closest('section') : null;
  if (!seccionDestinos) return;

  const seccion = document.createElement('section');
  seccion.setAttribute('aria-labelledby', 'ofertas-dinamicas-title');
  seccion.innerHTML = `
    <h2 id="ofertas-dinamicas-title">Ofertas destacadas</h2>
    <p>Promociones cargadas dinamicamente desde la base de datos JSON (fetch).</p>
    <div class="cards" id="grid-ofertas" aria-live="polite"><p>Cargando ofertas...</p></div>`;
  seccionDestinos.insertAdjacentElement('afterend', seccion);

  const grid = seccion.querySelector('#grid-ofertas');
  try {
    const ofertas = await OfertaService.getOfertasDestacadas();
    grid.innerHTML = ofertas.map(tarjetaOferta).join(''); // pinta N tarjetas de golpe
  } catch (error) {
    console.warn('index (module): no se pudieron cargar las ofertas.', error);
    grid.innerHTML = '<p>No se pudieron cargar las ofertas en este momento.</p>';
  }
}

pintarOfertasDestacadas();
