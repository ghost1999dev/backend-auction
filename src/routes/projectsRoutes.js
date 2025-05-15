import { Router } from "express";
import { 
    createProject,
    getAllProjects,
    DetailsProjectId,
    updateProjectId,
    DesactivateProjectId,
    getProjectsByCompany,
    getProjectsByCategory,
    projectsCounterByCompany

} from "../controllers/ProjectsController.js";

const router = Router();
/**
 * @swagger
 * tags: 
 *   name: projects
 *   description: Operations about projects
 */

/**
 * API for managing projects
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

/**
 * @swagger
 * /projects/show/all:
 *  get:
 *    tags: [projects]
 *    summary: Get all projects
 *    parameters:
 *      - in: query
 *        name: status
 *        schema:
 *          type: integer
 *        required: false
 *        description: Filter projects by status
 *    responses:
 *      200:
 *        description: Returns all projects
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Project'
 *      500:
 *        description: Server error
 */

router.get("/show/all", getAllProjects);

/**
 * @swagger
 * /projects/show/{id}:
 *  get:
 *    tags: [projects]
 *    summary: Get a project by id
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Project id
 *    responses:
 *      200:
 *        description: Returns a project
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Project'
 *      404:
 *        description: Project not found
 *      500:
 *        description: Server error
 */
router.get("/show/:id", DetailsProjectId);

/**
 * @swagger
 * /projects/update/{id}:
 *  put:
 *    tags: [projects]
 *    summary: Update a project
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Project id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/projectUpdate'
 *    responses:
 *      200:
 *        description: Returns updated project
 *      404:
 *        description: Project not found
 *      500:
 *        description: Server error
 */ 

router.put("/update/:id", updateProjectId);
/**
 * @swagger
 * /projects/delete/{id}:
 *  delete:
 *    tags: [projects]
 *    summary: Delete a project
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Project id
 *    responses:
 *      200:
 *        description: Returns deleted project
 *      404:
 *        description: Project not found
 *      500:
 *        description: Server error 
 */

router.delete("/desactivate/:id", DesactivateProjectId);
/**
 * @swagger
 * /projects/show/companyProject/{id}:
 *  get:
 *    tags: [projects]
 *    summary: Get all projects by company
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Company id
 *    responses:
 *      200:
 *        description: Returns all projects
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Project'
 *      500:
 *        description: Server error
 */
router.get("/show/companyProject/:id", getProjectsByCompany);

/**
 * @swagger
 * /projects/show/categoryProject/{id}:
 *  get:
 *    tags: [projects]
 *    summary: Get all projects by category
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Category id
 *    responses:
 *      200:
 *        description: Returns all projects
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Project'
 *      500:
 *        description: Server error                         
 */
router.get("/show/categoryProject/:id", getProjectsByCategory);

/**
 * @swagger
 * /projects/counter/{id}:
 *  get:
 *    tags: [projects]
 *    summary: Get projects counter by company
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Company id
 *    responses:
 *      200:
 *        description: Returns projects counter
 *      400: 
 *        description: Company not found
 *      500:
 *        description: Server error
 */
router.get("/counter/:id", projectsCounterByCompany);
 
export default router;
/**
 * @swagger
 * components:
 *  schemas:
 *    Project:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          format: int32
 *        company_id:
 *          type: integer
 *          format: int32
 *        category_id:
 *          type: integer
 *          format: int32
 *        project_name:
 *          type: string
 *        description:
 *          type: string
 *        budget:
 *          type: number
 *        days_available:
 *          type: integer
 *        status:
 *          type: integer
 *          format: int32
 *          example: 1  
 *          enum: [0, 1]
 *          description: 0 = Inactive, 1 = Active
 *      required:
 *        - id
 *        - company_id
 *        - category_id
 *        - project_name
 *        - description
 *        - budget
 *        - days_available
 *        - status
 * 
 *    projectCreate:
 *      type: object
 *      properties:
 *        company_id:
 *          type: integer
 *          format: int32
 *        category_id:
 *          type: integer
 *          format: int32
 *        project_name:
 *          type: string
 *        description:
 *          type: string
 *          description: Short description of the project min 20 characters
 *        long_description:
 *          type: string
 *          description: Long description of the project min 100 characters
 *        budget:
 *          type: number
 *        days_available:
 *          type: integer
 *      required:
 *        - company_id
 *        - category_id
 *        - project_name
 *        - description
 *        - long_description
 *        - budget
 *        - days_available
 * 
 *    projectUpdate:
 *      type: object
 *      properties:
 *        company_id:
 *          type: integer
 *          format: int32
 *        category_id:
 *          type: integer
 *          format: int32
 *        project_name:
 *          type: string
 *        description:
 *          type: string
 *        budget:
 *          type: number
 *        days_available:
 *          type: integer
 *        status:
 *          type: integer
 *          format: int32
 *          example: 1  
 *          enum: [0, 1]
 *          description: 0 = Inactive, 1 = Active
 *      required:
 *        - company_id
 *        - category_id
 *        - project_name
 *        - description
 *        - budget
 *        - days_available
 *        - status
 */     
