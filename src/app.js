import express from "express";
import path from "path";
import process from "node:process";
import { fileURLToPath } from "url";
import { getConnection } from "./config/connection.js";
import { config } from "dotenv";
import cors from "cors";
import helmet from "helmet";
////////// NNUEVAS FUNCIONES
import passport from "passport";
import "./middlewares/google.js";


// Import routes
import indexRoutes from "./routes/indexRoutes.js";
import UserRoutes from "./routes/userRoutes.js";
import CompanyRoutes from "./routes/companyRoutes.js";

//////NUEVAS FUNCIONES
import { loginRouter } from "./routes/authRoutes.js";


config();
const app = express();

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Server class to initialize and configure the Express application.
 */
class Server {
  /**
   * Creates a new Server instance.
   * @param {express.Application} app - Express application instance.
   * @param {number|string} PORT - Port number for the server.
   * @param {string} NODE_ENV - Node environment (e.g., development or production).
   * @param {string} __filename - The current file's name.
   * @param {string} __dirname - The current directory's name.
   */
  constructor(app, PORT, NODE_ENV, __filename, __dirname) {
    this.app = app;
    this.PORT = PORT;
    this.NODE_ENV = NODE_ENV;
    this.__filename = __filename;
    this.__dirname = __dirname;
    this.middlewares();
    this.routes();
  }

  /**
   * Establishes a connection to the database.
   * @async
   * @throws {Error} If database connection fails.
   */
  async dbConnection() {
    try {
      await getConnection();
    } catch (error) {
      throw new Error("Database connection error: " + error);
    }
  }

  /**
   * Configures global middlewares.
   */
  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(helmet());
    this.app.use(express.urlencoded({ extended: true }));
    /////// NNUEVAS FUNCIONES
    this.app.use(express.json());
    this.app.use(passport.initialize());

  }

  /**
   * Registers application routes.
   */
  routes() {
    this.app.use("/", indexRoutes);
    this.app.use("/users", UserRoutes);
    this.app.use("/companies", CompanyRoutes);
    /////////NUEVA FUNCIONES 
    this.app.use(
      "/auth",
      passport.authenticate("auth-google", {
        scope: [
          "https://www.googleapis.com/auth/userinfo.profile",
          "https://www.googleapis.com/auth/userinfo.email",
        ],
        session: false,
      }),
      loginRouter
    );
  }
  /**
   * Starts the server and listens on the specified port.
   */
  listen() {
    this.app.listen(this.PORT, () => {
      console.log(`Server Running on http://localhost:${this.PORT}`);
    });
  }
}

const server = new Server(app, PORT, NODE_ENV, __filename, __dirname);
server.listen();