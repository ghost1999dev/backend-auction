import express from 'express';
import { createAdmin, 
    getAllAdmins, 
    getAdminById, 
    updateAdmin, 
    deleteAdmin 

} from '../controllers/AdminController.js';

const router = express.Router();
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

router.post('/create', createAdmin);

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
router.delete('/delete/:id', deleteAdmin);

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
