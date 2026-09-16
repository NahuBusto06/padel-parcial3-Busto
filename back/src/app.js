require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// TODO: importar y registrar las rutas de canchas, reservas y reportes.

app.get("/", (_req, res) => {
  res.json({ mensaje: "API de reservas de pádel" });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ mensaje: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

