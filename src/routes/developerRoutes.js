import { Router } from "express"
import {
    AddNewDeveloper,
    DetailsDeveloperId,
    getDevelopersByIdUser,
    ListAllDevelopers,
    UpdateDeveloperId,
} from "../controllers/DevelopersController.js"

import authRoutes from "../middlewares/authRoutes.js"

const router = Router()

/**
 * @swagger
 * tags: 
 *   name: Developers
 *   description: Operations about developers 
 */

/**
 * @swagger
 * /developers/create:
 *  post:
 *    tags: [Developers]
 *    summary: Create a new developer
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/developerCreate'
 *    responses:
 *      200:
 *        description: Returns a new developer
 *      500:
 *        description: Server error
 */
router.post("/create", AddNewDeveloper)

/**
 * @swagger
 * /developers/show/all:
 *  get:
 *    tags: [Developers]
 *    summary: Get all developers
 *    responses:
 *      200:
 *        description: Returns all developers
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Developer'
 *      500:
 *        description: Server error
 */
router.get("/show/all", authRoutes, ListAllDevelopers)

/**
 * @swagger
 * /developers/show/{id}:
 *  get:
 *    tags: [Developers]
 *    summary: Get a developer by id
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Developer id
 *    responses:
 *      200:
 *        description: Returns a developer
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Developer'
 *      404:
 *        description: Developer not found
 *      500:
 *        description: Server error
 */

router.get("/show/:id", authRoutes, DetailsDeveloperId)

/**
 * @swagger
 * /developers/show/user_id/{user_id}:
 *  get:
 *    tags: [Developers]
 *    summary: Get a developer by user_id
 *    parameters:
 *      - in: path
 *        name: user_id
 *        schema:
 *          type: string
 *        required: true
 *        description: Developer user_id
 *    responses:
 *      200:
 *        description: Returns a developer
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Developer'
 *      404:
 *        description: Developer not found
 *      500:
 *        description: Server error
 */

router.get("/show/user_id/:user_id", authRoutes, getDevelopersByIdUser)

/**
 * @swagger
 * /developers/update/{id}:
 *  put:
 *    tags: [Developers]
 *    summary: Update a developer
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Developer id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/developerUpdate'
 *    responses:
 *      200:
 *        description: Returns updated developer
 *      404:
 *        description: Developer not found
 *      500:
 *        description: Server error
 */

router.put("/update/:id", authRoutes, UpdateDeveloperId)

export default router

/**
 * @swagger
 * components:
 *  schemas:
 *    Developer:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          format: int32
 *        bio:
 *          type: string
 *        user_id:
 *          type: integer
 *          format: int32
 *        linkedin:
 *          type: string
 *        occupation:
 *          type: string
 *        portfolio:
 *          type: string
 *      required:
 *        - id
 *        - bio
 *        - user_id
 *        - linkedin
 *        - occupation
 *        - portfolio
 * 
 *    developerCreate:
 *      type: object
 *      properties:
 *        bio:
 *          type: string
 *        user_id:
 *          type: integer
 *          format: int32
 *        linkedin:
 *          type: string
 *        occupation:
 *          type: string
 *        portfolio:
 *          type: string
 *      required:
 *        - bio
 *        - user_id
 *        - linkedin
 *        - occupation
 *        - portfolio
 *  
 *    developerUpdate:
 *      type: object
 *      properties:
 *        bio:
 *          type: string
 *        linkedin:
 *          type: string
 *        occupation:
 *          type: string
 *        portfolio:
 *          type: string    
 */