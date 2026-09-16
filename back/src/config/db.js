const sql = require("mssql");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    // Si conectás a una instancia con nombre (ej: localhost\SQLEXPRESS),
    // usamos instanceName en vez de un puerto fijo. Requiere que el
    // servicio "SQL Server Browser" esté corriendo en Windows.
    ...(process.env.DB_INSTANCE
      ? { instanceName: process.env.DB_INSTANCE }
      : {})
  }
};

// Solo fijamos el puerto si NO estamos usando instanceName.
if (!process.env.DB_INSTANCE) {
  config.port = Number(process.env.DB_PORT || 1433);
}

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Conectado a SQL Server como", process.env.DB_USER);
    return pool;
  })
  .catch((err) => {
    console.error("Error de conexión a la base de datos:", err.message);
    throw err;
  });

module.exports = { sql, config, poolPromise };
