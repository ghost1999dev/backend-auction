import swaggerJsDoc from "swagger-jsdoc"
import { fileURLToPath } from "url"
import { dirname } from "path"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
                url: "https://backend-m1g2.onrender.com/",
                description: "Development server"
            },
            {
                url: "https://backend-auction-5zdm.onrender.com/",
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
    apis: [
        path.join(__dirname, "../routes/*.js")
    ],
}

export const swaggerUiOptions = {
    swaggerOptions: {
        defaultModelsExpandDepth: 3,
        displayOperationId: true,
        showRequestHeaders: true,
        showExtensions: true,
        filter: true,
        validatorUrl: false,
        docExpansion: "list",
        showCommonExtensions: true,
    },
    customSiteTitle: "auction API",
}

export const swaggerSpec = swaggerJsDoc(options)