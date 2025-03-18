import express from "express"
import path from "path";
import process from "node:process";
import { fileURLToPath } from 'url';
import { getConnection } from "./config/connection.js";
import { config } from "dotenv";
import cors from "cors"
import helmet from "helmet"

// import routes 
import indexRoutes from "./routes/indexRoutes.js";
import UserRoutes from "./routes/userRoutes.js"
import CompanyRoutes from "./routes/companyRoutes.js"
import emailRoutes from './routes/emailRoutes.js';

config();
const app = express();

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Server{
    constructor(app, PORT, NODE_ENV, __filename, __dirname){
        this.app = app
        this.PORT = PORT
        this.NODE_ENV = NODE_ENV
        this.__filename = __filename
        this.__dirname = __dirname
        this.middlewars();
		this.routes();
    }

    async dbConnection() {
		try {
			await getConnection();
		} catch (error) {
			throw new Error("You Error is: " + error);
		}
	}

    middlewars() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(helmet()); 
        this.app.use(express.urlencoded({ extended: true }))
    }

    routes(){
        app.use('/', indexRoutes)
        app.use('/users', UserRoutes)
        app.use('/companies', CompanyRoutes)
        app.use('/email', emailRoutes)
    }

    listen(){
        this.app.listen(
            this.PORT, () => {
                console.log(`Server Running on http://localhost:${this.PORT}`);
            }
        );
    }
}

const server = new Server(
    app, 
    PORT, 
    NODE_ENV, 
    __filename, 
    __dirname, 
);

server.listen()
