import { Router } from "express"
import {
    AddNewDeveloper,
    DetailsDeveloperId,
    ListAllDevelopers,
    UpdateDeveloperId,
} from "../controllers/DevelopersController.js"

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
router.get("/show/all", ListAllDevelopers)

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

router.get("/show/:id", DetailsDeveloperId)

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

router.put("/update/:id", UpdateDeveloperId)

export default router