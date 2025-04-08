import swaggerUi from "swagger-ui-express"
import swaggerJsDoc from "swagger-jsdoc"
import { version } from "os"
import { url } from "inspector"

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "auction API",
            version: "1.0.0",
            description: "Backend API para sistema de subastas en línea",
            contact: {
                name: "bluepixel",
                email: ""
            },
        },
        servers: [
            {
                url: "http://localhost:4000",
                description: "Localhost"
            },
            {
                url: "https://backend-auction-1.onrender.com/",
                description: "Production server"
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },
    apis: ["./src/routes/*.js"]
}

export const swaggerSpec = swaggerJsDoc(options)