import express from "express";
import path from "path";
import process from "node:process";
import { fileURLToPath } from "url";
import { getConnection } from "./config/connection.js";
import { config } from "dotenv";
import swaggerUi from "swagger-ui-express"
import { swaggerSpec, swaggerUiOptions } from "./config/swagger.js";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import "./services/emailService.js";

import passport from "passport";
import "./middlewares/google.js";
import "./middlewares/jwt.js";


import indexRoutes from "./routes/indexRoutes.js";
import UserRoutes from "./routes/userRoutes.js";
import CompanyRoutes from "./routes/companyRoutes.js";
import DeveloperRoutes from "./routes/developerRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js";
import {loginRouter} from "./routes/authRoutes.js";
import AuctionRoutes from "./routes/AuctionRoutes.js";
import ApplicationRoutes from "./routes/ApplicationRoutes.js";
//import BidRoutes from "./routes/bidRoutes.js";

import { jwtRouter } from "./routes/jwtAuthRoutes.js";
import sequelize from "./config/connection.js";
import ProjectRoutes from "./routes/projectsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import ratingRoutes from "./routes/ratingsRoutes.js";
import reportRoutes from "./routes/reportsRoutes.js";

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
    this.dbConnection();
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
    
    this.app.use(passport.initialize());


  }

  /**
   * Registers application routes.
   */
 routes() {
    this.app.use("/", indexRoutes);
    this.app.use("/users", UserRoutes);
    this.app.use("/companies", CompanyRoutes);
    this.app.use("/developers", DeveloperRoutes);
    this.app.use("/projects", ProjectRoutes);
    this.app.use("/categories", categoryRoutes);
    this.app.use("/auth", loginRouter);
    this.app.use("/admins", adminRoutes);
    this.app.use("/auctions", AuctionRoutes);
    this.app.use("/application-projects", ApplicationRoutes);
    this.app.use("/ratings", ratingRoutes);
    this.app.use("/reports", reportRoutes);
    //this.app.use("/bids", BidRoutes);
    this.app.use("/passport", jwtRouter);
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
 
    app.use((req, res)=>res.status(404).json({ error:"Ruta no encontrada" }));
    app.use((err, _req, res, _n)=>{
      console.error(err);
      res.status(err.status||500).json({ error: err.message || "Error interno" });
    });

    this.app.get("/protected", passport.authenticate("jwt", { session: false }), (req, res) => {
      res.json({ message: "Acceso autorizado", user: req.user });
    });
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