import { Router } from "express";
import { 
    createProject 

} from "../controllers/ProjectsController.js";

const router = Router();
/**
 * @swagger
 * tags: 
 *   name: projects
 *   description: Operations about projects
 */

/**
 * @swagger
 * /projects/create:
 *  post:
 *    tags: [projects]
 *    summary: Create a new project
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/projectCreate'
 *    responses:
 *      201:
 *        description: Returns a new project
 *      500:
 *        description: Server error
 */
router.post("/create", createProject);

export default router;

/**
 */
