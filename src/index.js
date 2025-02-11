import app from "./app.js"
import { getConnection } from "./config/connection.js"

//getConnection()

const PORT = 3000

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`)
})