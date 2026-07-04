// ============================================================
// shared/render.js - Autor: Felipe Reyes Ingunza
// Utilidades de renderizado reutilizables por TODAS las paginas
// (ES Module): escape anti-XSS, resolucion de rutas de assets
// independiente de la profundidad de la pagina, y plantillas de
// tarjetas (ofertas, destinos, paquetes) para pintar en el DOM.
// ============================================================

// Raiz del sitio calculada desde este modulo (funciona en / y en /pages/).
const RAIZ_SITIO = new URL('../../', import.meta.url);

// Convierte una ruta relativa a la raiz (ej. "images/x.jpg") en URL absoluta.
export function rutaAsset(relativa) {
  return new URL(relativa, RAIZ_SITIO).href;
}

// Escapa texto para insertarlo de forma segura como HTML (anti-XSS).
export function escaparHtml(valor) {
  return String(valor == null ? '' : valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Plantilla de tarjeta de oferta (para grillas .cards).
export function tarjetaOferta(o) {
  return `<article>
    <h3>${escaparHtml(o.titulo)}</h3>
    <img src="${rutaAsset(o.imagen)}" alt="Promocion: ${escaparHtml(o.titulo)}" width="400" height="250" loading="lazy">
    <p>${escaparHtml(o.descripcion)}</p>
    <p><strong>Desde CNY ${Number(o.precio)}</strong> | Valida hasta ${escaparHtml(o.vigencia)}</p>
  </article>`;
}

// Plantilla de tarjeta de destino (para grillas .cards).
export function tarjetaDestino(d) {
  const lugares = (d.lugares || []).map((l) => escaparHtml(l)).join(' &middot; ');
  return `<article>
    <h3>${escaparHtml(d.nombre)}</h3>
    <img src="${rutaAsset(d.imagen)}" alt="Vista de ${escaparHtml(d.nombre)}" width="400" height="250" loading="lazy">
    <p>${escaparHtml(d.descripcion)}</p>
    <p>${lugares}</p>
    <p><strong>Desde CNY ${Number(d.precioDesde)}</strong></p>
  </article>`;
}

// Plantilla de tarjeta de paquete turistico (para grillas .cards).
export function tarjetaPaquete(p) {
  const incluye = (p.incluye || []).map((i) => escaparHtml(i)).join('; ');
  return `<article>
    <h3>${escaparHtml(p.nombre)}</h3>
    <p><strong>${escaparHtml((p.destinos || []).join(' - '))}</strong> | ${Number(p.dias)} dias</p>
    <p>Incluye: ${incluye}</p>
    <p><strong>CNY ${Number(p.precio)}</strong> por persona</p>
  </article>`;
}
