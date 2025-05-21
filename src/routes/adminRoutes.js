import { Router } from 'express';
import upload from "../middlewares/upload.js";
import { createAdmin, 
    getAllAdmins, 
    getAdminById, 
    updateAdmin, 
    deleteAdmin,
    getAllProjects,
    searchProjects,
    getProjectById,
    updateProjectStatus,
    generateUsername,
    uploadImageAdmin,
    reactivateAdmin,
    forgotPassword,
    resetPassword

} from '../controllers/AdminsController.js';
import { validateAdmin } from '../middlewares/authAdmin.js';


const router = Router();
    /**
     * @swagger
     * /admins/generate-username:
     *  post:
     *    tags: [Admins]
     *    summary: Generate username
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/schemas/generateUsername'
     *    responses:
     *      200:
     *        description: Returns a username
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/username'
     *      400:
     *        description: Invalid credentials
     *      500:        
     *        description: Server error         
     */
router.post('/generate-username', generateUsername);




    /**
     * @swagger
     * tags:
     *   name: Admins
     *   description: Operations about admins
     */

    /**
     * @swagger
     * /admins/create:
     *  post:
     *    tags: [Admins]
     *    summary: Create a new admin
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/schemas/adminCreate'
     *    responses:
     *      201:
     *        description: Returns a new admin
     *      400:
     *        description: Nrc number or nit number already exists
     *      500:
     *        description: Server error 
     */      

router.post('/create', validateAdmin, createAdmin);

    /**
     * @swagger
     * /admins/show/all:
     *  get:
     *    tags: [Admins]
     *    summary: Get all admins
     *    responses:
     *      200:
     *        description: Returns all admins
     *        content:
     *          application/json:
     *            schema:
     *              type: array
     *              items:
     *                $ref: '#/components/schemas/Admin'
     *      500:
     *        description: Server error         
     */
router.get('/show/all', getAllAdmins);

    /**
     * @swagger
     * /admins/show/{id}:
     *  get:
     *    tags: [Admins]
     *    summary: Get a admin by id
     *    parameters:
     *      - in: path
     *        name: id
     *        schema:
     *          type: string
     *        required: true
     *        description: Admin id
     *    responses:
     *      200:
     *        description: Returns a admin
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/Admin'
     *      404:
     *        description: Admin not found
     *      500:
     *        description: Server error         
     */ 
router.get('/show/:id', getAdminById);
    /**
     * @swagger
     * /admins/update/{id}:
     *  put:
     *    tags: [Admins]
     *    summary: Update a admin
     *    parameters:
     *      - in: path
     *        name: id
     *        schema:
     *          type: string
     *        required: true
     *        description: Admin id
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/schemas/adminUpdate'
     *    responses:
     *      200:
     *        description: Returns updated admin
     *      404:
     *        description: Admin not found
     *      500:
     *        description: Server error         
     */
router.put('/update/:id', updateAdmin);
    /**
     * @swagger
     * /admins/delete/{id}:
     *  delete:
     *    tags: [Admins]
     *    summary: Delete a admin
     *    parameters:
     *      - in: path
     *        name: id
     *        schema:
     *          type: string
     *        required: true
     *        description: Admin id
     *    responses:
     *      200:
     *        description: Returns deleted admin
     *      404:
     *        description: Admin not found
     *      500:
     *        description: Server error         
     */     
router.delete('/delete/:id', validateAdmin, deleteAdmin);
    /**
     * @swagger
     * /admins/get-all-projects:
     *  get:
     *    tags: [Admins]
     *    summary: Get all projects
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
router.get('/get-all-projects', getAllProjects);
    /**
     * @swagger
     * /admins/search-projects:
     *  get:
     *    tags: [Admins]
     *    summary: Search projects
     *    parameters:
     *      - in: query
     *        name: company_name
     *        schema:
     *          type: string
     *        required: false
     *        description: Company name
     *      - in: query
     *        name: project_name
     *        schema:
     *          type: string
     *        required: false
     *        description: Project name
     *      - in: query         
     *        name: category_name
     *        schema:
     *          type: string
     *        required: false
     *        description: Category name
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
router.get('/search-projects', searchProjects);
    /**
     * @swagger
     * /admins/get-project-by-id/{id}:
     *  get:
     *    tags: [Admins]
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
router.get('/get-project-by-id/:id', getProjectById);
    /**
     * @swagger
     * /admins/update-project-status/{id}:
     *  put:
     *    tags: [Admins]
     *    summary: Update project status
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
     *            $ref: '#/components/schemas/projectUpdateStatus'
     *    responses:
     *      200:
     *        description: Returns updated project
     *      404:
     *        description: Project not found
     *      500:
     *        description: Server error         
     */

router.put('/update-project-status/:id',updateProjectStatus);


/**
 * @swagger
 * /admins/upload-image/{id}:
 *  put:
 *    tags: [Admins]
 *    summary: Upload a admin image
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Admin id
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              file:
 *                type: string
 *                format: url
 *                description: Image url
 *                example: https://example.com/image.jpg
 *            required:
 *              - image
 *    responses:
 *      200:
 *        description: Image updated successfully
 *      400:
 *        description: Invalid file provided or file type not allowed
 *      404:
 *        description: Admin not found
 *      500:
 *        description: Server error
 */
router.put("/upload-image/:id", upload.single('file'), uploadImageAdmin);

/**
 * @swagger
 * /admins/reactivatedAdmin/{id}:
 *  put:
 *    tags: [Admins]
 *    summary: Reactivate an inactive admin
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Admin id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/adminUpdate'
 *    responses:
 *      200:
 *        description: Returns updated admin
 *      404:
 *        description: Admin not found
 *      500:
 *        description: Server error         
 */ 
router.put('/reactivatedAdmin/:id', validateAdmin, reactivateAdmin);

/**
 * @swagger
 * /admins/forgot-password:
 *  post:
 *    tags: [Admins]
 *    summary: Request a password reset
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                format: email
 *                description: Email to reset password
 *                example: example@example.com
 *            required:
 *              - email
 *    responses:
 *      200:
 *        description: Correo de verificacion enviado
 *      400: 
 *        description: Correo no encontrado
 *      500:
 *        description: Server error
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /admins/reset-password:
 *  post:
 *    tags: [Admins]
 *    summary: Reset a password
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                format: email
 *                description: Email to reset password
 *                example: example@example.com
 *              code:
 *                type: string
 *                description: Code to reset password
 *                example: 123456
 *              password:
 *                type: string
 *                format: password
 *                description: New password
 *                example: example123
 *            required:
 *              - email
 *              - code
 *              - password
 *    responses:
 *      200:
 *        description: Usuario actualizado correctamente
 *      400: 
 *        description: Correo no encontrado, codigo incorrecto
 *      500:
 *        description: Server error
 */
router.post('/reset-password', resetPassword);

export default router;
    /**
     * @swagger
     * components:
     *  schemas:
     *    Admin:
     *      type: object
     *      properties:
     *        id:
     *          type: integer
     *          format: int32
     *        full_name:
     *          type: string
     *        phone:
     *          type: string
     *        email:
     *          type: string
     *        username:
     *          type: string
     *        password:
     *          type: string
     *        image:
     *          type: string
     *        status:
     *          type: string
     *      required:
     *        - id
     *        - full_name
     *        - phone
     *        - email
     *        - username
     *        - password
     *        - image
     *        - status
     *    adminCreate:
     *      type: object
     *      properties:
     *        full_name:
     *          type: string
     *        phone:
     *          type: string
     *        email:
     *          type: string
     *        username:
     *          type: string
     *        password:
     *          type: string
     *        image:
     *          type: string
     *      required:
     *        - full_name
     *        - phone
     *        - email
     *        - username
     *        - password
     *        - image
     *    adminUpdate:
     *      type: object
     *      properties:
     *        full_name:
     *          type: string
     *        phone:
     *          type: string
     *        email:
     *          type: string
     *        username:                         
     *          type: string
     *        password:
     *          type: string
     *        image:
     *          type: string
     *        status:
     *          type: string
     *      required:
     *        - full_name
     *        - phone
     *        - email
     *        - username
     *        - password
     *        - image
     *        - status
     */
