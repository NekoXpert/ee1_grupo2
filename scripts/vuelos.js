// ============================================================
// vuelos.js - Autor: Felipe Reyes Ingunza
// Cuatro flujos de la pagina de vuelos:
//   1. Buscar y comprar -> pinta resultados desde un array mock
//   2. Validar ticket    -> consulta un codigo y muestra su estado
//   3. Estado de vuelo   -> consulta un vuelo y muestra su estado
//   4. Reembolso         -> calculadora de devolucion segun tarifa
// ============================================================

(function () {
  'use strict';

  const LA = window.LA || {};

  // Nombres de ciudad por codigo IATA (para mostrar rutas legibles).
  const CIUDADES = {
    KMG: 'Kunming', DLU: 'Dali', JHG: 'Xishuangbanna',
    LJG: 'Lijiang', PEK: 'Beijing', SHA: 'Shanghai',
  };

  // Vuelos de ejemplo (datos mock para la demostracion).
  const VUELOS_SEED = [
    { codigo: 'LA8201', origen: 'KMG', destino: 'DLU', salida: '06:30', llegada: '07:15', duracion: '45 min', precio: 380 },
    { codigo: 'LA8203', origen: 'KMG', destino: 'DLU', salida: '12:45', llegada: '13:30', duracion: '45 min', precio: 420 },
    { codigo: 'LA8207', origen: 'KMG', destino: 'DLU', salida: '18:10', llegada: '18:55', duracion: '45 min', precio: 350 },
    { codigo: 'LA8310', origen: 'KMG', destino: 'JHG', salida: '08:00', llegada: '09:05', duracion: '1 h 5 min', precio: 540 },
    { codigo: 'LA8412', origen: 'KMG', destino: 'LJG', salida: '07:20', llegada: '08:10', duracion: '50 min', precio: 460 },
    { codigo: 'LA9001', origen: 'KMG', destino: 'PEK', salida: '09:30', llegada: '13:20', duracion: '3 h 50 min', precio: 1280 },
    { codigo: 'LA9105', origen: 'KMG', destino: 'SHA', salida: '14:00', llegada: '17:25', duracion: '3 h 25 min', precio: 1150 },
    { codigo: 'LA8202', origen: 'DLU', destino: 'KMG', salida: '08:00', llegada: '08:45', duracion: '45 min', precio: 360 },
  ];

  // Fuente de vuelos: usa el catalogo persistido en localStorage
  // (crud/vuelos-crud.js) si esta disponible; si no, usa la semilla.
  const VUELOS = (window.VuelosCrud && window.VuelosCrud.listar().length)
    ? window.VuelosCrud.listar()
    : VUELOS_SEED;

  // Estados de vuelo de ejemplo (mock).
  const ESTADOS = {
    LA8201: { ruta: 'KMG - DLU', estado: 'En hora', salida: '06:30', puerta: 'B12' },
    LA8203: { ruta: 'KMG - DLU', estado: 'Demorado 20 min', salida: '13:05', puerta: 'B14' },
    LA9001: { ruta: 'KMG - PEK', estado: 'Embarcando', salida: '09:30', puerta: 'A3' },
    LA9105: { ruta: 'KMG - SHA', estado: 'Cancelado', salida: '--', puerta: '--' },
  };

  // Reservas de ejemplo para validar tickets (mock).
  const RESERVAS = {
    ABC123: { vuelo: 'LA8201', ruta: 'KMG - DLU', fecha: '20 abr 2026', pasajero: 'Reyes', estado: 'Confirmado' },
    DEF456: { vuelo: 'LA8310', ruta: 'KMG - JHG', fecha: '12 may 2026', pasajero: 'Mamani', estado: 'Pendiente de pago' },
    GHI789: { vuelo: 'LA8202', ruta: 'DLU - KMG', fecha: '03 feb 2026', pasajero: 'Batti', estado: 'Completado' },
  };

  // Devuelve los vuelos de una ruta; si no hay, sintetiza 3 opciones.
  function vuelosDeRuta(origen, destino) {
    const directos = VUELOS.filter((v) => v.origen === origen && v.destino === destino);
    if (directos.length) return directos;
    const base = 300 + (origen.charCodeAt(0) + destino.charCodeAt(2)) % 9 * 60;
    return [
      { codigo: 'LA' + (8000 + base % 900), origen, destino, salida: '07:40', llegada: '09:10', duracion: '1 h 30 min', precio: base },
      { codigo: 'LA' + (8100 + base % 800), origen, destino, salida: '13:15', llegada: '14:45', duracion: '1 h 30 min', precio: base + 80 },
      { codigo: 'LA' + (8200 + base % 700), origen, destino, salida: '19:05', llegada: '20:35', duracion: '1 h 30 min', precio: base - 40 },
    ];
  }

  // ----------------------------------------------------------
  // 1. Buscar y comprar: pinta resultados dinamicos.
  // ----------------------------------------------------------
  function iniciarBuscar() {
    const form = document.querySelector('[name="form-buscar"]');
    if (!form) return;
    form.noValidate = true;
    const origen = document.getElementById('b-origen');
    const destino = document.getElementById('b-destino');
    const fecha = document.getElementById('b-fecha');
    const clase = document.getElementById('b-clase');

    if (fecha) fecha.min = new Date().toISOString().split('T')[0];

    // Contenedor donde se inyectan los resultados.
    const salida = document.createElement('section');
    salida.id = 'b-resultados';
    salida.setAttribute('aria-live', 'polite');
    form.insertAdjacentElement('afterend', salida);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      if (!origen.value) ok = LA.mostrarError(origen, 'Elige el origen.');
      else LA.limpiarError(origen);
      if (!destino.value) ok = LA.mostrarError(destino, 'Elige el destino.') && ok;
      else LA.limpiarError(destino);
      if (origen.value && destino.value && origen.value === destino.value) {
        LA.mostrarError(destino, 'El destino debe ser distinto del origen.');
        ok = false;
      }
      if (!fecha.value) { LA.mostrarError(fecha, 'Elige la fecha.'); ok = false; }
      else LA.limpiarError(fecha);
      if (!ok) { salida.innerHTML = ''; return; }

      pintarResultados(origen.value, destino.value, fecha.value, clase ? clase.value : 'basica', salida);
    });
  }

  // Construye la tabla de resultados a partir del array de vuelos.
  function pintarResultados(origen, destino, fecha, clase, contenedor) {
    const lista = vuelosDeRuta(origen, destino);
    const recargo = clase === 'flex' ? 120 : 0; // la tarifa Flex cuesta mas
    const ruta = `${CIUDADES[origen]} (${origen}) - ${CIUDADES[destino]} (${destino})`;

    let filas = '';
    lista.forEach((v) => {
      const precio = v.precio + recargo;
      filas += `<tr>
        <td>${v.codigo}</td>
        <td>${v.salida}</td>
        <td>${v.llegada}</td>
        <td>${v.duracion}</td>
        <td>CNY ${precio}</td>
        <td><a href="checkout.html?vuelo=${v.codigo}&precio=${precio}">Comprar</a></td>
      </tr>`;
    });

    contenedor.innerHTML = `
      <h3>${lista.length} vuelos para ${ruta}</h3>
      <p>Fecha: ${fecha} | Tarifa: ${clase === 'flex' ? 'Flex' : 'Basica'}</p>
      <div class="table-scroll">
        <table>
          <caption>Resultados de busqueda</caption>
          <thead>
            <tr>
              <th scope="col">Vuelo</th><th scope="col">Salida</th><th scope="col">Llegada</th>
              <th scope="col">Duracion</th><th scope="col">Precio</th><th scope="col">Accion</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
      </div>`;
  }

  // ----------------------------------------------------------
  // 2. Validar ticket: consulta un codigo en las reservas mock.
  // ----------------------------------------------------------
  function iniciarValidar() {
    const form = document.querySelector('[name="form-validar"]');
    if (!form) return;
    form.noValidate = true;
    const codigo = document.getElementById('v-codigo');
    const apellido = document.getElementById('v-apellido');

    const salida = document.createElement('div');
    salida.setAttribute('aria-live', 'polite');
    form.insertAdjacentElement('afterend', salida);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = LA.validarPatron(codigo, /^[A-Z0-9]{6}$/, 'El codigo tiene 6 caracteres (letras mayusculas y numeros).');
      ok = LA.validarVacio(apellido, 'El apellido') && ok;
      if (!ok) { salida.innerHTML = ''; return; }

      // Busca primero en las reservas persistidas (crud/reservas-crud.js),
      // que incluyen las creadas al comprar; si no, usa las reservas mock.
      const cod = codigo.value.trim().toUpperCase();
      const reserva = (window.ReservasCrud && window.ReservasCrud.buscarPorCodigo(cod)) || RESERVAS[cod];
      if (!reserva) {
        salida.innerHTML = `<p class="la-aviso la-aviso--error">No encontramos la reserva ${codigo.value.toUpperCase()}. Revisa el codigo.</p>`;
        return;
      }
      salida.innerHTML = `
        <div class="la-aviso la-aviso--ok">
          <p>Ticket validado correctamente.</p>
          <dl>
            <dt>Vuelo</dt><dd>${reserva.vuelo}</dd>
            <dt>Ruta</dt><dd>${reserva.ruta}</dd>
            <dt>Fecha</dt><dd>${reserva.fecha}</dd>
            <dt>Estado</dt><dd>${reserva.estado}</dd>
          </dl>
        </div>`;
    });
  }

  // ----------------------------------------------------------
  // 3. Estado de vuelo: muestra el estado de un numero de vuelo.
  // ----------------------------------------------------------
  function iniciarEstado() {
    const form = document.querySelector('[name="form-estado"]');
    if (!form) return;
    form.noValidate = true;
    const vuelo = document.getElementById('e-vuelo');
    const fecha = document.getElementById('e-fecha');

    const salida = document.createElement('div');
    salida.setAttribute('aria-live', 'polite');
    form.insertAdjacentElement('afterend', salida);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = LA.validarPatron(vuelo, /^LA[0-9]{4}$/, 'Formato de vuelo: LA + 4 numeros (ej. LA8201).');
      ok = LA.validarVacio(fecha, 'La fecha') && ok;
      if (!ok) { salida.innerHTML = ''; return; }

      const num = vuelo.value.trim().toUpperCase();
      const info = ESTADOS[num];
      if (!info) {
        salida.innerHTML = `<p class="la-aviso la-aviso--info">No tenemos informacion en vivo del vuelo ${num} para esa fecha.</p>`;
        return;
      }
      const clase = info.estado === 'Cancelado' ? 'la-aviso--error' : 'la-aviso--ok';
      salida.innerHTML = `
        <div class="la-aviso ${clase}">
          <dl>
            <dt>Vuelo</dt><dd>${num}</dd>
            <dt>Ruta</dt><dd>${info.ruta}</dd>
            <dt>Estado</dt><dd>${info.estado}</dd>
            <dt>Salida</dt><dd>${info.salida}</dd>
            <dt>Puerta</dt><dd>${info.puerta}</dd>
          </dl>
        </div>`;
    });
  }

  // ----------------------------------------------------------
  // 4. Reembolso: calculadora segun tarifa + envio del formulario.
  // ----------------------------------------------------------
  function iniciarReembolso() {
    const form = document.querySelector('[name="form-reembolso"]');
    if (!form) return;
    form.noValidate = true;
    const codigo = document.getElementById('r-codigo');
    const email = document.getElementById('r-email');
    const motivo = document.getElementById('r-motivo');

    // Inyecta la calculadora de reembolso antes del formulario.
    const calc = document.createElement('div');
    calc.className = 'la-aviso la-aviso--info';
    calc.innerHTML = `
      <p><strong>Calculadora de reembolso</strong></p>
      <p>
        <label for="re-tarifa">Tarifa de tu vuelo:</label>
        <select id="re-tarifa">
          <option value="basica">Basica (cargo de CNY 100)</option>
          <option value="flex">Flex (reembolso total)</option>
        </select>
      </p>
      <p>
        <label for="re-monto">Monto pagado (CNY):</label>
        <input type="number" id="re-monto" min="0" step="10" value="380">
      </p>
      <p id="re-salida" aria-live="polite"></p>`;
    form.insertAdjacentElement('beforebegin', calc);

    const tarifa = calc.querySelector('#re-tarifa');
    const monto = calc.querySelector('#re-monto');
    const reSalida = calc.querySelector('#re-salida');

    let ultimaDevolucion = 0; // recuerda la ultima cotizacion para el registro CRUD

    // Calcula la devolucion segun tarifa y motivo.
    function calcular() {
      const valor = Number(monto.value) || 0;
      const cancelado = motivo && motivo.value === 'cancelacion';
      let devolucion;
      if (cancelado || tarifa.value === 'flex') {
        devolucion = valor; // Flex o vuelo cancelado: 100%
      } else {
        devolucion = Math.max(0, valor - 100); // Basica: menos cargo administrativo
      }
      ultimaDevolucion = devolucion;
      reSalida.textContent = `Reembolso estimado: CNY ${devolucion} de CNY ${valor}`;
      // Guarda la ultima cotizacion para persistencia.
      try {
        localStorage.setItem('la_reembolso', JSON.stringify({ tarifa: tarifa.value, monto: valor, devolucion }));
      } catch { /* localStorage no disponible */ }
    }

    tarifa.addEventListener('change', calcular);
    monto.addEventListener('input', calcular);
    if (motivo) motivo.addEventListener('change', calcular);
    calcular();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = LA.validarPatron(codigo, /^[A-Z0-9]{6}$/, 'El codigo tiene 6 caracteres.');
      ok = LA.validarEmail(email) && ok;
      ok = (motivo.value ? LA.limpiarError(motivo) : LA.mostrarError(motivo, 'Elige un motivo.')) && ok;
      if (!ok) return;
      // CREATE: guarda la solicitud de reembolso en localStorage (CRUD).
      if (window.ReembolsosCrud) {
        window.ReembolsosCrud.crear({
          codigo: codigo.value.trim().toUpperCase(),
          email: email.value.trim(),
          motivo: motivo.value,
          devolucion: ultimaDevolucion,
        });
        if (window.ReembolsosCrud.render) window.ReembolsosCrud.render();
      }
      // Reutiliza el modal :target del HTML para confirmar.
      window.location.hash = 'gracias-reembolso';
    });
  }

  iniciarBuscar();
  iniciarValidar();
  iniciarEstado();
  iniciarReembolso();
})();
