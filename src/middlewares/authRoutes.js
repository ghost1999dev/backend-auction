import { auth } from "googleapis/build/src/apis/abusiveexperiencereport"
import jwt from "jsonwebtoken"

const authRoutes = (req, res, next) => {
    const authHeader = req.headers.authorization
    try {
        if (!authHeader) {
            return res.status(403).json({
                message: "No autorización proporcionada",
                status: 403
            })
        }

        const token = authHeader.split(" ")[1]
        const user = jwt.verify(token, process.env.JWT_SECRET)

        req.user = user
        next()
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado' })
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token inválido' })
        }
        res.status(500).json({ message: 'Autenticación fallida' })
    }
}

export default authRoutes