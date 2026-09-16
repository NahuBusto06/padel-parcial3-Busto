const { Router } = require("express");
const { recaudacionPorCancha } = require("../controllers/reportes.controller");

const router = Router();

// GET /api/reportes/recaudacion
router.get("/recaudacion", recaudacionPorCancha);

module.exports = router;
