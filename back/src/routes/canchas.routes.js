const { Router } = require("express");
const { listarCanchas } = require("../controllers/canchas.controller");

const router = Router();

// GET /api/canchas
router.get("/", listarCanchas);

module.exports = router;
