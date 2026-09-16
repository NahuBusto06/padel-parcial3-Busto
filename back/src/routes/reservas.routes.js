const { Router } = require("express");
const {
  listarReservas,
  crearReserva,
  registrarPago
} = require("../controllers/reservas.controller");

const router = Router();

// GET /api/reservas
router.get("/", listarReservas);

// POST /api/reservas
router.post("/", crearReserva);

// PUT /api/reservas/:id/pago
router.put("/:id/pago", registrarPago);

module.exports = router;
