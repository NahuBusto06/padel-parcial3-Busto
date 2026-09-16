const API_URL = "http://localhost:3000/api";

const formulario = document.querySelector("#form-reserva");
const comboCanchas = document.querySelector("#cancha");
const listaReservas = document.querySelector("#lista-reservas");
const tablaRecaudacion = document.querySelector("#tabla-recaudacion");
const mensaje = document.querySelector("#mensaje");

const formatearPrecio = (valor) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS"
  }).format(valor);

const formatearFecha = (valor) => {
  // El backend devuelve la fecha como ISO (ej: 2026-06-10T00:00:00.000Z).
  // La recortamos a los primeros 10 caracteres (yyyy-mm-dd) y la mostramos
  // en formato dd/mm/aaaa sin depender de la zona horaria del navegador.
  const soloFecha = String(valor).slice(0, 10);
  const [anio, mes, dia] = soloFecha.split("-");
  return `${dia}/${mes}/${anio}`;
};

function mostrarMensaje(texto, tipo = "exito") {
  mensaje.textContent = texto;
  mensaje.classList.remove("mensaje-exito", "mensaje-error");
  mensaje.classList.add(tipo === "error" ? "mensaje-error" : "mensaje-exito");
}

function limpiarMensaje() {
  mensaje.textContent = "";
  mensaje.classList.remove("mensaje-exito", "mensaje-error");
}

// -------------------- Canchas --------------------

async function cargarCanchas() {
  try {
    const respuesta = await fetch(`${API_URL}/canchas`);
    const canchas = await respuesta.json();

    comboCanchas.innerHTML = '<option value="">Seleccione una cancha</option>';

    canchas.forEach((cancha) => {
      const opcion = document.createElement("option");
      opcion.value = cancha.IdCancha;
      opcion.textContent = `${cancha.Nombre} - ${formatearPrecio(cancha.PrecioPorHora)}/h`;
      comboCanchas.appendChild(opcion);
    });
  } catch (error) {
    console.error(error);
    mostrarMensaje("No se pudieron cargar las canchas. Verificá que el backend esté encendido.", "error");
  }
}

// -------------------- Reservas --------------------

async function cargarReservas() {
  try {
    const respuesta = await fetch(`${API_URL}/reservas`);
    const reservas = await respuesta.json();

    listaReservas.innerHTML = "";

    if (reservas.length === 0) {
      listaReservas.innerHTML = "<p>Todavía no hay reservas cargadas.</p>";
      return;
    }

    reservas.forEach((reserva) => {
      const tarjeta = document.createElement("article");
      tarjeta.className = "tarjeta";

      const estadoClase = reserva.Pagada ? "pagada" : "pendiente";
      const estadoTexto = reserva.Pagada ? "Pagada" : "Pendiente";

      tarjeta.innerHTML = `
        <h3>${reserva.Cancha}</h3>
        <p><strong>Cliente:</strong> ${reserva.Cliente}</p>
        <p><strong>Fecha:</strong> ${formatearFecha(reserva.Fecha)}</p>
        <p><strong>Hora:</strong> ${reserva.Hora}</p>
        <p><strong>Precio:</strong> ${formatearPrecio(reserva.PrecioPorHora)}</p>
        <p class="${estadoClase}">${estadoTexto}</p>
        ${
          reserva.Pagada
            ? ""
            : `<button type="button" class="btn-pagar" data-id="${reserva.IdReserva}">Registrar pago</button>`
        }
      `;

      listaReservas.appendChild(tarjeta);
    });
  } catch (error) {
    console.error(error);
    mostrarMensaje("No se pudieron cargar las reservas.", "error");
  }
}

// Delegación de eventos: un solo listener para todos los botones "Registrar pago",
// incluso los que se agregan dinámicamente al volver a renderizar la lista.
listaReservas.addEventListener("click", async (evento) => {
  const boton = evento.target.closest(".btn-pagar");
  if (!boton) return;

  const idReserva = boton.dataset.id;
  boton.disabled = true;

  try {
    const respuesta = await fetch(`${API_URL}/reservas/${idReserva}/pago`, {
      method: "PUT"
    });
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mostrarMensaje(datos.mensaje || "No se pudo registrar el pago.", "error");
      boton.disabled = false;
      return;
    }

    mostrarMensaje(datos.mensaje || "Pago registrado correctamente.");
    await Promise.all([cargarReservas(), cargarRecaudacion()]);
  } catch (error) {
    console.error(error);
    mostrarMensaje("Error de conexión al registrar el pago.", "error");
    boton.disabled = false;
  }
});

// -------------------- Recaudación --------------------

async function cargarRecaudacion() {
  try {
    const respuesta = await fetch(`${API_URL}/reportes/recaudacion`);
    const filas = await respuesta.json();

    tablaRecaudacion.innerHTML = "";

    filas.forEach((fila) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${fila.Nombre}</td>
        <td>${fila.CantidadReservas}</td>
        <td>${formatearPrecio(fila.TotalCobrado)}</td>
        <td class="pendiente">${formatearPrecio(fila.TotalPendiente)}</td>
      `;
      tablaRecaudacion.appendChild(tr);
    });
  } catch (error) {
    console.error(error);
    mostrarMensaje("No se pudo cargar la recaudación.", "error");
  }
}

// -------------------- Alta de reserva --------------------

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limpiarMensaje();

  const datosFormulario = new FormData(formulario);
  const cuerpo = {
    idCancha: Number(datosFormulario.get("idCancha")),
    cliente: datosFormulario.get("cliente").trim(),
    fecha: datosFormulario.get("fecha"),
    hora: datosFormulario.get("hora")
  };

  try {
    const respuesta = await fetch(`${API_URL}/reservas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo)
    });
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      // Acá cae, entre otros, el THROW 50011 (horario ya ocupado) devuelto como 400.
      mostrarMensaje(datos.mensaje || "No se pudo registrar la reserva.", "error");
      return;
    }

    mostrarMensaje(datos.mensaje || "Reserva creada correctamente.");
    formulario.reset();
    await Promise.all([cargarReservas(), cargarRecaudacion()]);
  } catch (error) {
    console.error(error);
    mostrarMensaje("Error de conexión al crear la reserva.", "error");
  }
});

// -------------------- Inicio --------------------

async function iniciar() {
  await Promise.all([cargarCanchas(), cargarReservas(), cargarRecaudacion()]);
}

iniciar();
