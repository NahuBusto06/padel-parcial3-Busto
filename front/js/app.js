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

// TODO: cargar las canchas y completar el combo.

// TODO: cargar y mostrar las reservas en tarjetas.

// TODO: cargar y mostrar la recaudación en la tabla.

// TODO: registrar una reserva al enviar el formulario.

// TODO: registrar pagos usando delegación de eventos o eventos en los botones.

// TODO: mostrar mensajes claros de éxito y error provenientes de la API.

