import express from "express";
import passport from "passport";
import { handleJWTLogin } from "../utils/generateToken.js";
import { loginAdmin } from "../controllers/authController.js";
import { validateAdmin } from "../middlewares/AuthAdmin.js";


export const loginRouter = express.Router();
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Operations about auth
 */

/**
 * @swagger
 * /api/session:
 *  post:
 *    tags: [Auth]
 *    summary: Login
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/login'
 *    responses:
 *      200:
 *        description: Returns a token
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/token'
 *      400:
 *        description: Invalid credentials
 *      500:
 *        description: Server error         
 */
  
loginRouter.get("/api/session", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ authenticated: true, user: req.user });
  } else {
    res.status(401).json({ authenticated: false });
  }
});
    /**
     * @swagger
     * /api/logout:
     *  get:
     *    tags: [Auth]
     *    summary: Logout
     *    responses:
     *      200:
     *        description: Returns a token
     *      400:
     *        description: Invalid credentials
     *      500:
     *        description: Server error         
     */ 

loginRouter.get("/api/logout", (req, res, next) => {
    req.logout(err => {
      if (err) return next(err);
      res.redirect("http://localhost:4200/#/login");
    });
});

    /**
     * @swagger
     * /Adminlogin:
     *  post:
     *    tags: [Auth]
     *    summary: Login Admin
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/schemas/loginAdmin'
     *    responses:
     *      200:
     *        description: Returns a token
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/token'
     *      400:
     *        description: Invalid credentials
     *      500:
     *        description: Server error         
     */ 
loginRouter.post("/Adminlogin", loginAdmin);
    /**
     * @swagger
     * /protectedAdmin:
     *  get:
     *    tags: [Auth]
     *    summary: Protected Admin
     *    responses:
     *      200:
     *        description: Returns a token
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/token'
     *      400:
     *        description: Invalid credentials
     *      500:
     *        description: Server error         
     */
loginRouter.get('/protectedAdmin', validateAdmin, (req, res) => {
  res.status(200).json({ message: 'You have access to this protected route.', user: req.user });
});
    
//export { loginRouter };
/**          
 * @swagger
 * components:
 *  schemas:
 *    login:
 *      type: object
 *      properties:
 *        username:
 *          type: string
 *        password:
 *          type: string
 *      required:
 *        - username
 *        - password
 *    loginAdmin:
 *      type: object
 *      properties:
 *        username:
 *          type: string
 *        password:
 *          type: string
 *      required:
 *        - username
 *        - password
 *    token:
 *      type: object
 *      properties:
 *        token:
 *          type: string
 *        user:
 *          type: object
 *          properties:
 *            id:
 *              type: integer
 *              format: int32
 *            email:
 *              type: string
 *            role:
 *              type: string
 *          required:
 *            - id
 *            - email
 *            - role
 *      required:
 *        - token
 *        - user
 */ 
