# Lucky Air - Sitio Web v4.0 (EE4 - Integración, Calidad y Despliegue)

Proyecto académico del curso **Fundamentos de Desarrollo Frontend (18612)** de UCAL.

**Enlaces principales**

- Sitio publicado (GitHub Pages): https://nekoxpert.github.io/ee1_grupo2/
- Repositorio: https://github.com/NekoXpert/ee1_grupo2
- Evidencia de calidad (Entregable 3): [`docs/quality.md`](docs/quality.md)

Sitio web diseñado para atender el caso de estudio internacional **E-commerce at Yunnan Lucky Air** (Berenguer, Cai, Li, Liu y Wang, 2008 - MIT, versión adaptada).

## Descripción del proyecto

Lucky Air es una aerolínea low-cost china (Yunnan, 2004) que quiere convertir su sitio **luckyair.net** en un diferenciador competitivo: no solo una tienda web sino un destino web que genere lealtad, reduzca costos y aumente la conversión.

El sitio cubre los siguientes escenarios del caso:

- Compra, validación y reembolso de tickets online (self-service sin call center)
- Estado de vuelo en tiempo real
- Guía turística de destinos en Yunnan y rutas extra-provinciales
- Comunidad con reseñas por criterios (puntualidad, equipaje, atención)
- Programa de fidelización Lucky Points con canje y socios
- Ventas corporativas (portal B2B) y descuentos para estudiantes
- Pagos con tarjeta, PayPal, Alipay y WeChat Pay
- Centro de ayuda con FAQ y formulario de contacto
- Libro de reclamaciones (quejas y estado del reclamo)

## Equipo

| Integrante | Rol | Entregables |
|---|---|---|
| **Felipe Reyes Ingunza** | Owner del repo | Header + Footer globales, `index.html`, `vuelos.html`, `mi-cuenta.html`, `ayuda.html` |
| **Lenin David Mamani Sarmiento** | Contribuidor | `destinos.html`, `destino-detalle.html`, `blog.html` |
| **Piero Batti Peña** | Contribuidor | `lucky-points.html`, `empresas.html`, `estudiantes.html` |
| **Rodrigo Alonso Santos Núñez** | Contribuidor | `login.html`, `checkout.html`, `legal.html`, `nosotros.html` |
| **Adso Martin Obregón Gutiérrez** | Contribuidor | `quejas.html`, `estado-queja.html` |

## EE3 - JavaScript + DOM + localStorage

Esta versión 3.0 cubre la Unidad de Aprendizaje 3: **interactividad real con JavaScript puro (vanilla)**, sin librerías ni frameworks. Todo el JS vive en `scripts/` y se enlaza con `defer`; no hay manejadores `onclick` en línea (todo con `addEventListener`).

### Convenciones de JavaScript

- JavaScript puro (vanilla). Sin jQuery, React ni otras librerías.
- Cada archivo `.js` inicia con su comentario de autoría y cada función lleva una línea que explica qué hace.
- La validación HTML5 (`required`, `pattern`, `type`) se mantiene y encima se agrega validación con JS que muestra mensajes de error propios (`.error-msg`, `aria-live`).
- Accesibilidad: mensajes con `aria-live`, menú hamburguesa usable con teclado (`Esc`, foco), modales con foco y cierre con `Esc`.

### Estructura de `scripts/`

| Archivo | Autor | Función |
|---|---|---|
| `validacion.js` | Felipe Reyes | Utilidades reutilizables de validación en `window.LA` (`validarEmail`, `validarVacio`, `validarPatron`, `mostrarError`, `limpiarError`, ...) |
| `main.js` | Felipe Reyes | Globales en las 16 páginas: menú hamburguesa JS, nav activa (`aria-current`), año dinámico, estado de sesión, botón "volver arriba", notificaciones (toasts) y accesibilidad de modales |
| `cuentas.js` | Felipe Reyes | Sistema de cuentas con localStorage: registrar y luego iniciar sesión con esa cuenta (`window.LA.cuentas`) |
| `index.js` | Felipe Reyes | Buscador del home: contador de pasajeros, fecha de vuelta condicional y validación |
| `vuelos.js` | Felipe Reyes | Buscar/comprar (render dinámico), validar ticket, estado de vuelo y calculadora de reembolso |
| `mi-cuenta.js` | Felipe Reyes | Perfil y preferencias guardados y cargados desde localStorage |
| `ayuda.js` | Felipe Reyes | Filtro en vivo de FAQ + validación de contacto con contador de caracteres |
| `destinos.js` `destino-detalle.js` `blog.js` | Lenin Mamani | Filtros/orden, carrusel + reseñas, buscador de artículos + newsletter |
| `lucky-points.js` `empresas.js` `estudiantes.js` | Piero Batti | Calculadora de puntos, ahorro corporativo, validación de grupo/archivo |
| `login.js` `checkout.js` `legal.js` `nosotros.js` | Rodrigo Santos | Login/registro/recuperar, pago, pestañas legales, contador animado |

### Persistencia en localStorage (claves)

| Clave | Contenido |
|---|---|
| `la_cuentas` | Cuentas registradas (la contraseña se guarda ofuscada; es una simulación académica, no seguridad real) |
| `la_sesion` | Sesión activa (`{ nombre, email }`); el header muestra "Hola, X" y "Salir" en las 16 páginas |
| `la_perfil` | Datos del perfil de "Mi cuenta" |
| `la_preferencias` | Preferencias de comunicación e idioma |
| `la_reembolso` | Última cotización de la calculadora de reembolso |
| `la_ultima_compra` | Confirmación del último pago del checkout |
| `la_db_empresas` | CRUD de empresas B2B registradas |
| `la_db_estudiantes` / `la_db_cotizaciones` | CRUD de estudiantes verificados y cotizaciones grupales |
| `la_db_reservas` | CRUD de reservas (creadas al comprar; validables por código) |
| `la_db_vuelos` | Catálogo de vuelos que consume el buscador |
| `la_db_reembolsos` | Historial de solicitudes de reembolso |

### Flujo de cuenta de extremo a extremo

1. En `login.html` te registras (se valida y se guarda la cuenta en `la_cuentas`).
2. Inicias sesión con esa misma cuenta: las credenciales se verifican contra lo guardado.
3. La sesión queda en `la_sesion` y el header saluda "Hola, X" con botón "Salir" en todo el sitio.
4. En "Mi cuenta" el perfil se precarga desde la sesión y se guardan perfil y preferencias.

## EE4 - Integración, Calidad y Despliegue (v4.0)

La versión final integra un **CRUD completo persistido en localStorage** y el
**consumo de datos con Fetch/JSON**, cerrando las Unidades de Aprendizaje UA1–UA4.

### Arquitectura por capas (separación de responsabilidades)

El código está dividido en capas con responsabilidad única, usando **ES Modules**
(`import`/`export`, páginas cargadas con `<script type="module">`):

```
scripts/
├── database/    → SOLO datos (JSON): destinos, ofertas, paquetes, users, vuelos
├── services/    → SOLO acceso a datos y reglas (la "API interna"): clases con
│                  métodos estáticos (DestinoService, OfertaService, VueloService,
│                  AuthService, UsuarioService) que hacen fetch de los JSON y
│                  persisten/leen en localStorage
├── pages/       → SOLO controlan UNA página (importan servicios y pintan el DOM):
│                  index.js, destinos.js, vuelos.js, login.js, mi-cuenta.js
├── shared/      → Reutilizable en TODAS las páginas: render.js (plantillas +
│                  escape anti-XSS + rutas de assets) y sesion.js
├── crud/        → Motor CRUD genérico + repositorios en localStorage
└── *.js         → Scripts de página EE3 (validacion, main, cuentas, etc.)
```

**Flujo de datos:** JSON Database (`scripts/database/*.json`) → Service (fetch +
reglas) → Page (render en el DOM) → Usuario. Los datos NO están en el HTML: se
inyectan con JavaScript tras el fetch. `VueloService` además siembra el JSON en
localStorage (`la_db_vuelos`), la misma tabla que edita el CRUD, y `AuthService`
siembra cuentas demo desde `users.json` (prueba: `demo@luckyair.com` / `lucky123`).

### Consumo de datos (Fetch + JSON)

- `scripts/services/*.service.js` consumen la base JSON de `scripts/database/` con
  `fetch()` y caché en memoria; las páginas renderizan grillas y tablas dinámicas
  (ofertas del home, guía de destinos, paquetes, tablero de salidas).
- `scripts/lucky-points.js` obtiene el catálogo de canje desde `data/site-data.json`
  con `fetch()`, lo renderiza dinámicamente y permite filtrarlo por categoría
  (vuelos / regalos / experiencias), con manejo de error si la carga falla.

### CRUD en localStorage (`scripts/crud/`)

Se reescribió el avance del equipo (que dependía de Supabase con una API key
expuesta y tenía 3 archivos vacíos) como un **motor CRUD propio, vanilla y sin
dependencias externas**. Todo persiste en el navegador y funciona sin conexión.

| Archivo | Función |
|---|---|
| `crud/db.js` | Motor CRUD genérico y reutilizable (`window.LA.crearRepositorio`): `listar/obtener/crear/actualizar/eliminar/vaciar/sembrar`, id autoincremental y escape anti-XSS |
| `crud/empresas-crud.js` | CRUD de empresas B2B: registrar → listar → editar plan → eliminar |
| `crud/estudiantes-crud.js` | CRUD de estudiantes verificados y cotizaciones grupales |
| `crud/reservas-crud.js` | CRUD de reservas: el checkout crea la reserva, "Mis reservas" la lista/cancela y "Validar ticket" la consulta |
| `crud/vuelos-crud.js` | Catálogo de vuelos persistido que consume el buscador de `vuelos.html` |
| `crud/reembolsos-crud.js` | Historial de solicitudes de reembolso con opción de eliminar |

**Flujo CRUD demostrable de extremo a extremo:** comprar un vuelo en `checkout.html`
→ genera una reserva con código único → aparece en `mi-cuenta.html` (Mis reservas)
→ ese código se valida en `vuelos.html` (Validar tu ticket) → se puede cancelar la
reserva desde Mi cuenta.

### Cobertura por Unidad de Aprendizaje

- **UA1 – Estructura (HTML):** `index.html` + 15 páginas en `/pages`, semántica y accesible.
- **UA2 – Estilo y responsive (CSS):** `styles/main.css`, diseño responsive (móvil/tablet/desktop).
- **UA3 – Interactividad (JS/DOM/eventos/validación/persistencia):** scripts en `/scripts` + localStorage.
- **UA4 – Integración, datos y calidad:** Fetch/JSON, CRUD en localStorage, auditoría y despliegue.

### Calidad

Auditoría (DevTools + pruebas funcionales en navegador) y hallazgos corregidos en
[`docs/quality.md`](docs/quality.md): 0 errores en consola en flujo normal,
eliminación de la dependencia de Supabase, favicon (evita 404), escape anti-XSS en
las tablas CRUD y verificación de accesibilidad (labels, alt, `aria-live`, skip link).

## Cómo probar el sitio

1. Clona el repositorio y entra a la carpeta.
2. Abre `index.html` en un navegador moderno (Chrome, Firefox, Edge).
3. Recomendado (para que localStorage funcione sin restricciones de `file://`), levanta un servidor local:
   ```bash
   python -m http.server 8000
   ```
   Luego abre http://localhost:8000

## Estructura del proyecto

```
ee1_grupo2/
├── index.html                  (Home - Felipe)
├── README.md
├── .gitignore
├── /pages/                     (páginas internas: 15 .html)
├── /scripts/                   (JavaScript vanilla)
│   ├── /database/              (base de datos JSON: 5 archivos)
│   ├── /services/              (capa de servicios ES Modules: 5 clases)
│   ├── /pages/                 (controladores de página ES Modules)
│   ├── /shared/                (módulos reutilizables: render, sesion)
│   └── /crud/                  (motor + módulos CRUD en localStorage)
├── /styles/                    (main.css)
├── /data/                      (site-data.json - Fetch/JSON)
├── /docs/                      (quality.md - evidencia de calidad EE4)
└── /images/ /assets/           (recursos)
```

## Roadmap de evidencias evaluativas

- **EE1 (v1.0) - HTML + Git** — entregado
- **EE2 (v2.0) - CSS + Layout + Responsive** — entregado
- **EE3 (v3.0) - JavaScript + DOM + localStorage** — entregado
- **EE4 (v4.0) - Integración + Calidad + Despliegue (CRUD + Fetch/JSON)** — entregable final actual

## Convenciones del proyecto

- Nombres de archivos en minúsculas con guiones (`destino-detalle.html`)
- Prefijo de ID en inputs por sección (ej. `c-email` en contacto, `p-email` en perfil) para evitar colisiones
- Textos sin tildes en el contenido para evitar problemas de encoding en repos colaborativos
- Comentarios de autoría al inicio de cada bloque de contenido único

## Licencia

Proyecto académico. Material de referencia: UCAL - Fundamentos de Desarrollo Frontend 2026-1.
