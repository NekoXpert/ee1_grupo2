# Evidencia de calidad - EE4 (Lucky Air)

Documento de la **Evidencia Evaluativa 4 - Entregable 3**: auditoria de calidad,
hallazgos detectados y correcciones aplicadas con su forma de verificacion.

- **Sitio publicado:** https://nekoxpert.github.io/ee1_grupo2/
- **Repositorio:** https://github.com/NekoXpert/ee1_grupo2
- **Metodo de auditoria:** Google Lighthouse 12 sobre el sitio en vivo (ver
  seccion 1.1), DevTools (consola y pestana Application/localStorage), pruebas
  funcionales automatizadas end-to-end en navegador Chromium sobre un servidor
  local (`python -m http.server`) y revision manual responsive
  (movil 375px / tablet 768px / desktop 1280px).

---

## 1. Resultado de la auditoria (registro)

Auditoria automatizada de la pagina con mas JavaScript del sitio (`pages/vuelos.html`,
que carga 6 scripts CRUD + `vuelos.js`):

| Criterio auditado                     | Resultado |
|---------------------------------------|-----------|
| Errores en consola (flujo normal)     | **0 errores** |
| `<html lang>` definido                | si (`es`) |
| Meta viewport                         | si |
| Favicon (evita 404)                   | si |
| Enlace "saltar al contenido"          | si |
| Imagenes sin atributo `alt`           | 0 |
| Imagenes sin `width`/`height` (evita CLS) | 0 |
| Campos de formulario sin `label`      | 0 (de 15) |
| Encabezados `h1` por pagina           | 1 |
| Regiones `aria-live` (feedback)       | 4 |
| Referencias a Supabase / claves API   | 0 |
| Enlaces internos rotos                | 0 |

Las persistencias en `localStorage` se verificaron en DevTools > Application >
Local Storage, con las claves: `la_db_empresas`, `la_db_estudiantes`,
`la_db_cotizaciones`, `la_db_reservas`, `la_db_vuelos`, `la_db_reembolsos`,
`la_cuentas`, `la_sesion`, `la_perfil`, `la_preferencias`, `la_ultima_compra`.

### 1.1 Auditoria Lighthouse (sitio en vivo - GitHub Pages)

Auditoria ejecutada con **Google Lighthouse 12** (Chrome headless, perfil movil)
sobre el sitio publicado en https://nekoxpert.github.io/ee1_grupo2/. Los reportes
HTML navegables y las capturas estan en [`docs/lighthouse/`](lighthouse/).

| Pagina auditada            | Performance | Accesibilidad | Buenas practicas | SEO |
|----------------------------|:-----------:|:-------------:|:----------------:|:---:|
| Home (`index.html`)        |   **96**    |    **100**    |      **96**      |**100**|
| Vuelos (`pages/vuelos.html`) |   **98**    |    **100**    |      **96**      |**100**|

**Core Web Vitals (movil):**

| Metrica                          |  Home  | Vuelos |
|----------------------------------|:------:|:------:|
| First Contentful Paint (FCP)     | 1.2 s  | 1.1 s  |
| Largest Contentful Paint (LCP)   | 2.2 s  | 1.7 s  |
| Total Blocking Time (TBT)        | 110 ms | 20 ms  |
| Cumulative Layout Shift (CLS)    |   0    |   0    |
| Speed Index                      | 3.7 s  | 3.7 s  |

Capturas: [`home.png`](lighthouse/home.png) · [`vuelos.png`](lighthouse/vuelos.png).
Reportes completos: [`home.report.html`](lighthouse/home.report.html) ·
[`vuelos.report.html`](lighthouse/vuelos.report.html).

Lecturas: Accesibilidad y SEO en 100 en ambas paginas; CLS = 0 (sin saltos de
layout, gracias a `width`/`height` en imagenes); Performance 96-98 con el sitio
desplegado en produccion. La pagina con mas JavaScript (`vuelos.html`, 6 scripts
CRUD + `vuelos.js`) mantiene 98 de performance y 20 ms de bloqueo.

---

## 2. Hallazgos corregidos

### Hallazgo 1 - CRUD dependia de un servicio externo (Supabase) con clave expuesta

- **Que se corrigio:** El avance del equipo implementaba el CRUD contra Supabase,
  cargando la libreria `@supabase/supabase-js` desde un CDN e incrustando la URL y
  la API key del proyecto en el codigo del navegador. Ademas dependia de una
  conexion activa (fallaba sin internet y ensuciaba la consola con errores de
  conexion) y contradecia la regla del curso de "JavaScript vanilla, sin librerias".
  Se reemplazo por un **motor CRUD propio sobre localStorage**.
- **Donde:** se elimino la dependencia de `scripts/crud/config.js` (Supabase) y se
  reescribieron los repositorios en `scripts/crud/db.js` (motor generico) +
  `empresas-crud.js`, `estudiantes-crud.js`, `reservas-crud.js`, `vuelos-crud.js`,
  `reembolsos-crud.js`.
- **Como verificarlo:** abrir cualquier pagina sin conexion a internet; el CRUD
  sigue funcionando. Buscar "supabase" en el repositorio: 0 resultados en el sitio.
  En DevTools > Application > Local Storage aparecen las claves `la_db_*` al crear
  registros.

### Hallazgo 2 - Tres modulos CRUD del avance estaban vacios (funcionalidad incompleta)

- **Que se corrigio:** `vuelos-crud.js`, `reservas-crud.js` y `reembolsos-crud.js`
  estaban vacios (0 lineas), por lo que la persistencia de vuelos, reservas y
  reembolsos no existia. Se completaron con CRUD real en localStorage y se
  **conectaron al flujo de la app**: el checkout crea una reserva, "Mis reservas"
  la lista y permite cancelarla, y "Validar ticket" busca el codigo generado.
- **Donde:** `scripts/crud/vuelos-crud.js`, `scripts/crud/reservas-crud.js`,
  `scripts/crud/reembolsos-crud.js`, con enganches en `scripts/checkout.js`,
  `scripts/vuelos.js` y `pages/mi-cuenta.html`.
- **Como verificarlo:** completar una compra en `checkout.html`; luego en
  `mi-cuenta.html` aparece la nueva reserva con su codigo; copiar ese codigo en
  `vuelos.html > Validar tu ticket` y confirma "Ticket validado correctamente".

### Hallazgo 3 - Error 404 de favicon en consola en todas las paginas

- **Que se corrigio:** El navegador solicitaba `/favicon.ico` y recibia 404 en cada
  pagina, generando un error visible en consola (afecta el criterio "sin errores en
  consola"). Se agrego un favicon con el logo de la marca.
- **Donde:** `<link rel="icon" type="image/png" href="images/logo/lucky-mark.png">`
  en el `<head>` de las 16 paginas HTML.
- **Como verificarlo:** abrir DevTools > Console y recargar cualquier pagina: 0
  errores (antes aparecia el 404 de `favicon.ico`).

### Hallazgo 4 - Riesgo de inyeccion (XSS) al renderizar datos del usuario en las tablas CRUD

- **Que se corrigio:** Las listas CRUD se dibujan con `innerHTML` a partir de datos
  que el usuario escribe. Se agrego una funcion de escape (`LA.escaparHtml`) que se
  aplica a todos los valores antes de insertarlos en el HTML.
- **Donde:** `scripts/crud/db.js` (funcion `escaparHtml`) y su uso en cada `render()`
  de los modulos CRUD.
- **Como verificarlo:** registrar una empresa cuya razon social sea
  `<b>test</b>`; en la tabla se muestra el texto literal, no una etiqueta en negrita
  (no se ejecuta HTML inyectado).

---

## 3. Mejoras de UI/UX y consistencia aplicadas

- Tarjetas (cards) a ancho completo y legibles en desktop/tablet/movil.
- Botones de marca (rojo/blanco/dorado) consistentes, incluidos los botones de
  accion CRUD (`.btn-danger` para eliminar/cancelar).
- Feedback bidireccional: modales de confirmacion (`:target`), avisos `aria-live` y
  notificaciones tipo toast en cada operacion CRUD.
- Validacion en JavaScript con mensajes propios (ademas de la validacion HTML5).
- Redireccion de retorno tras iniciar sesion o registrarse.
