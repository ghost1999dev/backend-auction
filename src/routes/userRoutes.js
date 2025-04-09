import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser,
  uploadImageUser,
  verifyUser,
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
 *    RequestBody:
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
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/User'
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
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
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
router.put("/update-password/:id", updatePassword);
router.delete("/delete/:id", deleteUser);
router.post("/upload-image", uploadImageUser);
router.get("/verify/:token", verifyUser);
export default router;
