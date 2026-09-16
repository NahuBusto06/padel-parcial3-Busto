const { poolPromise } = require("../config/db");

async function recaudacionPorCancha(_req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute("usp_RecaudacionPorCancha");
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}

module.exports = { recaudacionPorCancha };
