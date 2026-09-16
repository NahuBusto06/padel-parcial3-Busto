require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const express = require("express");
const cors = require("cors");

const canchasRoutes = require("./routes/canchas.routes");
const reservasRoutes = require("./routes/reservas.routes");
const reportesRoutes = require("./routes/reportes.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/canchas", canchasRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/reportes", reportesRoutes);

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
