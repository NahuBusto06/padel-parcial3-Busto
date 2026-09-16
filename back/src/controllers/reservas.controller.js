const { sql, poolPromise } = require("../config/db");

async function listarReservas(_req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute("usp_ListarReservas");
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}

async function crearReserva(req, res) {
  const { idCancha, cliente, fecha, hora } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("IdCancha", sql.Int, idCancha)
      .input("Cliente", sql.NVarChar(100), cliente)
      .input("Fecha", sql.Date, fecha)
      .input("Hora", sql.NVarChar(5), hora)
      .execute("usp_CrearReserva");

    const idReserva = result.recordset[0].IdReserva;
    res.status(201).json({ idReserva, mensaje: "Reserva creada correctamente." });
  } catch (error) {
    manejarErrorDeNegocio(error, res);
  }
}

async function registrarPago(req, res) {
  const idReserva = Number(req.params.id);

  if (!Number.isInteger(idReserva)) {
    return res.status(400).json({ mensaje: "El id de la reserva no es válido." });
  }

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("IdReserva", sql.Int, idReserva)
      .execute("usp_RegistrarPago");

    res.json({ mensaje: "Pago registrado correctamente." });
  } catch (error) {
    manejarErrorDeNegocio(error, res);
  }
}

// Traduce los errores lanzados por los procedimientos (THROW 50002/50003/50008/50011)
// a los códigos HTTP que pide el enunciado:
//   - 50002 (recurso inexistente) -> 404
//   - cualquier otro error de negocio (50003, 50008, 50011) -> 400
//   - cualquier otro error no controlado -> 500
function manejarErrorDeNegocio(error, res) {
  console.error(error);

  if (error.number === 50002) {
    return res.status(404).json({ mensaje: error.message });
  }

  if (typeof error.number === "number" && error.number >= 50000) {
    return res.status(400).json({ mensaje: error.message });
  }

  res.status(500).json({ mensaje: "Error interno del servidor" });
}

module.exports = { listarReservas, crearReserva, registrarPago };
