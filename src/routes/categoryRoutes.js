import express from 'express';
import { 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  getAllCategories, 
  getCategoryById 
} from '../controllers/categoryController.js';
import { validateAdmin } from '../middlewares/authAdmin.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Operations about categories    
 */
/**
 * @swagger
 * /categories/show/all:
 *  get:
 *    tags: [Categories]
 *    summary: Get all categories
 *    responses:
 *      200:
 *        description: Returns all categories
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Category'
 *      500:
 *        description: Server error         
 */

router.get('/show/all', getAllCategories);
    /**
     * @swagger
     * /categories/show/{id}:
     *  get:
     *    tags: [Categories]
     *    summary: Get a category by id
     *    parameters:
     *      - in: path
     *        name: id
     *        schema:
     *          type: string
     *        required: true
     *        description: Category id
     *    responses:
     *      200:
     *        description: Returns a category
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/Category'
     *      404:
     *        description: Category not found
     *      500:
     *        description: Server error         
     */
router.get('/show/:id', getCategoryById);

// Rutas protegidas (solo administradores)

/**
 * @swagger
 * /categories/create:
 *  post:
 *    tags: [Categories]
 *    summary: Create a new category
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/categoryCreate'
 *    responses:
 *      201:
 *        description: Returns a new category
 *      400:
 *        description: Nrc number or nit number already exists
 *      500:
 *        description: Server error         
 */
router.post('/create', validateAdmin, createCategory);
    /**
     * @swagger
     * /categories/update/{id}:
     *  put:
     *    tags: [Categories]
     *    summary: Update a category
     *    parameters:
     *      - in: path
     *        name: id
     *        schema:
     *          type: string
     *        required: true
     *        description: Category id
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/schemas/categoryUpdate'
     *    responses:
     *      200:
     *        description: Returns updated category
     *      404:
     *        description: Category not found
     *      500:
     *        description: Server error         
     */
router.put('/update/:id', validateAdmin, updateCategory);
    /**
     * @swagger
     * /categories/delete/{id}:
     *  delete:
     *    tags: [Categories]
     *    summary: Delete a category
     *    parameters:
     *      - in: path
     *        name: id
     *        schema:
     *          type: string
     *        required: true
     *        description: Category id
     *    responses:
     *      200:
     *        description: Returns deleted category
     *      404:
     *        description: Category not found
     *      500:
     *        description: Server error         
     */ 
router.delete('/delete/:id', validateAdmin, deleteCategory);

export default router;
    /**
     * @swagger
     * components:
     *  schemas:
     *    Category:
     *      type: object
     *      properties:
     *        id:
     *          type: integer
     *          format: int32
     *        name:
     *          type: string
     *      required:
     *        - id
     *        - name
     *    categoryCreate:
     *      type: object
     *      properties:
     *        name:
     *          type: string
     *      required:
     *        - name
     *    categoryUpdate:
     *      type: object
     *      properties:
     *        name:
     *          type: string
     *      required:
     *        - name                
     *          
     */ 