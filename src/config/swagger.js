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
                url: "https://backend-m1g2.onrender.com",
                description: "Development server"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Introduce el toke JWT para autenticarse"
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ],
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
        persistAuthorization: true,
        requestInterceptor: (req) => {
            req.headers['Content-Type'] = 'multipart/form-data';
            if (!req.headers.Authorization) {
            req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
            }
            return req;
        },
        authAction: {
            JWT: {
                name: "JWT",
                schema: {
                    type: "apiKey",
                    in: "header",
                    name: "Authorization",
                    description: "Introduce tu token JWT precedido por 'Bearer '"
                },
                value: "Bearer <your_jwt_token_here>"
            }
        }
    },
    customSiteTitle: "Auction API - Documentation",
    customCss: '.swagger-ui .topbar { display: none }',
};

export const swaggerSpec = swaggerJsDoc(options)