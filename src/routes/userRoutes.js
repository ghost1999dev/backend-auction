import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser,
  uploadImageUser,
  verficationEmail,
} from "../controllers/UsersController.js";

const router = Router();

/**
 * @swagger
 * tags: 
 *   name: Users
 *   description: Operations about users (login, register, etc.)
 */
 
/**
 * @swagger
 * /users/validate-email:
 *  post:
 *    tags: [Users]
 *    summary: Validates the email
 *    description: Verify if the email is valid
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                description: Email to verify
 *                example: example@example.com
 *            required:
 *              - email
 *    responses:
 *      200:
 *        description: Returns verification code
 *      400: 
 *        description: Email already exists
 *      500:
 *        description: Server error
 */
router.post("/validate-email", verficationEmail);

/**
 * @swagger
 * /users/create:
 *  post:
 *    tags: [Users]
 *    summary: Create a new user
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/userCreate'
 *    responses:
 *      200:
 *        description: Returns a new user
 *      500:
 *        description: Server error
 */
router.post("/create", createUser);
/**
 * @swagger
 * /users/show/all:
 *  get:
 *    tags: [Users]
 *    summary: Get all users
 *    responses:
 *      200:
 *        description: Returns all users
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/User'
 *      500:
 *        description: Server error
 */
router.get("/show/all", getUsers);
/**
 * @swagger
 * /users/show/{id}:
 *  get:
 *    tags: [Users]
 *    summary: Get a user by id
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: User id
 *    responses:
 *      200:
 *        description: Returns a user
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      404:
 *        description: User not found
 *      500:
 *        description: Server error
 * 
 */
router.get("/show/:id", getUserById);
/**
 * @swagger
 * /users/update/{id}:  
 *  put:
 *    tags: [Users]
 *    summary: Update a user
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: User id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/userUpdate'
 *    responses:
 *      200:
 *        description: Returns updated user
 *      404:
 *        description: User not found
 *      500:
 *        description: Server error
 */
router.put("/update/:id", updateUser);
/**
 * @swagger
 * /users/update-password/{id}:
 *  put:
 *    tags: [Users]
 *    summary: Update a user password
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: User id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              currentPassword:
 *                type: string
 *                format: password
 *              newPassword:
 *                type: string
 *                format: password
 *            required:
 *              - currentPassword 
 *              - newPassword
 *    responses:
 *      200:
 *        description: Returns updated user
 *      404:
 *        description: User not found
 *      500:
 *        description: Server error
 */
router.put("/update-password/:id", updatePassword);
/**
 * @swagger
 * /users/delete/{id}:
 *  delete:
 *    tags: [Users]
 *    summary: Delete a user
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: User id
 *    responses:
 *      200:
 *        description: Returns deleted user
 *      404:
 *        description: User not found
 *      500:
 *        description: Server error
 */
router.delete("/delete/:id", deleteUser);
/**
 * @swagger
 * /users/upload-image:
 *  post:
 *    tags: [Users]
 *    summary: Upload a user image
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              image:
 *                type: string
 *                format: url
 *                description: Image url
 *                example: https://example.com/image.jpg
 *            required:
 *              - image
 *    responses:
 *      200:
 *        description: Returns updated user
 *      404:
 *        description: User not found
 *      500:
 *        description: Server error
 */
router.post("/upload-image", uploadImageUser);

export default router;


/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          format: int32
 *        role_id:
 *          type: integer
 *          format: int32
 *        name:
 *          type: string
 *        email:
 *          type: string
 *          format: email
 *        password:
 *          type: string
 *        address:
 *          type: string
 *        phone:
 *          type: string
 *        image:
 *          type: string
 *        account_type:
 *          type: integer
 *          format: int32
 *        status:
 *          type: integer
 *          format: int32
 *          example: 1  
 *          enum: [0, 1]
 *          description: 0 = Inactive, 1 = Active
 *        last_login:
 *          type: Date
 *      required:
 *        - id
 *        - role_id
 *        - name
 *        - email
 *        - address
 *        - phone
 *        - image
 *        - account_type
 *        - status
 *        - last_login
 * 
 *    userCreate:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *        role_id:
 *          type: integer
 *          format: int32
 *        email:
 *          type: string
 *          format: email
 *        password:
 *          type: string
 *        address:
 *          type: string
 *        phone:
 *          type: string
 *        image:
 *          type: string
 *          format: url
 *        account_type:
 *          type: integer
 *          format: int32
 *          example: 1  
 *          enum: [0, 1]
 *          description: 0 = Company, 1 = Developer 
 *      required:
 *        - name
 *        - role_id
 *        - email
 *        - password
 *        - address
 *        - phone
 *        - image
 *        - account_type
 * 
 *    userUpdate:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *        address:
 *          type: string
 *        phone:
 *          type: string
 */