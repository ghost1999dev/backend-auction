import app from "./app.js";
import { getConnection } from "./config/connection.js";
import { config } from "dotenv";
import process from "node:process";

// variables de entorno
config();

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";

/**
 * manejador para el apagado ordenado del servidor.
 * @param {Server} server - Instancia del servidor.
 * @returns {Function}
 */
const gracefulShutdown = (server) => () => {
  console.log("\nSeñal de apagado recibida. Cerrando el servidor...");
  server.close(async () => {
    console.log("Servidor cerrado correctamente");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("Tiempo excedido. Forzando el cierre del servidor");
    process.exit(1);
  }, 5000);
};

const startServer = async () => {
  try {
    await getConnection();
    console.log("Conexión a la base de datos establecida");

    const server = app.listen(PORT, () => {
      console.log(`Servidor corriendo en modo ${NODE_ENV}`);
      console.log(`Escuchando en http://localhost:${PORT}`);
    });

    process.on("SIGINT", gracefulShutdown(server));
    process.on("SIGTERM", gracefulShutdown(server));

    server.on("error", (error) => {
      if (error.syscall !== "listen") throw error;
      if (error.code === "EACCES") {
        console.error(`El puerto ${PORT} requiere privilegios elevados`);
        process.exit(1);
      } else if (error.code === "EADDRINUSE") {
        console.error(`El puerto ${PORT} ya está en uso`);
        process.exit(1);
      } else {
        throw error;
      }
    });
  } catch (error) {
    console.error("Error al iniciar la aplicación:", error.message);
    process.exit(1);
  }
};

startServer();
