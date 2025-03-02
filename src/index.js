import app from "./app.js";
import { getConnection } from "./config/connection.js";
import { config } from "dotenv";
import process from 'node:process';

// Cargar variables de entorno
config();

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";

const startServer = async () => {
  try {
    // Establecer conexión con la base de datos
    await getConnection();
    console.log("✅ Conexión a la base de datos establecida");

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en modo ${NODE_ENV}`);
      console.log(`📡 Escuchando en http://localhost:${PORT}`);
    });

    // Manejar cierre graceful del servidor
    const gracefulShutdown = () => {
      console.log("\n🔻 Recibida señal de apagado...");
      server.close(async () => {
        console.log("🔒 Servidor cerrado correctamente");
        // Aquí podrías agregar la desconexión de la base de datos si es necesario
        process.exit(0);
      });

      // Forzar cierre después de 5 segundos
      setTimeout(() => {
        console.error("🛑 Forzando cierre del servidor");
        process.exit(1);
      }, 5000);
    };

    // Manejadores para señales de terminación
    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);

    // Manejar errores de escucha del servidor
    server.on("error", (error) => {
      if (error.syscall !== "listen") throw error;
      
      switch (error.code) {
        case "EACCES":
          console.error(`❌ El puerto ${PORT} requiere privilegios elevados`);
          process.exit(1);
          break;
        case "EADDRINUSE":
          console.error(`❌ El puerto ${PORT} ya está en uso`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    console.error("⛔ Error al iniciar la aplicación:", error.message);
    process.exit(1);
  }
};

// Iniciar la aplicación
startServer();