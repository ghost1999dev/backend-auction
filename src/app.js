import express from "express"
import sequelize from "./config/connection.js"
import path from "path"
import { fileURLToPath } from 'url';
// import routes 
import UserRoutes from "./routes/UserRoutes.js"
import CompanyRoutes from "./routes/companyRoutes.js"

const app = express()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('./images', express.static(path.join(__dirname, './images')))

app.use(express.json())
app.use('/users', UserRoutes)
app.use('/companies', CompanyRoutes)

sequelize.sync().then(() => {
    console.log("Database synced")
})

export default app