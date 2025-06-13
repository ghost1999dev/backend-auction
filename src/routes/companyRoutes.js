import express from "express";
import {
  ListAllCompany,
  UpdateCompanyId,
  DetailsCompanyId,
  AddNewCompany,
  UpdateCompanyProfile,
  DetailsCompanyIdUser,
} from "../controllers/CompaniesController.js";

import authRoutes from "../middlewares/authRoutes.js";
/**
 * 
 * Companies Routes
 * 
 */
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Operations about companies
 */

/**
 * @swagger
 * /companies/create:
 *  post:
 *    tags: [Companies]
 *    summary: Create a new company
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/companyCreate'
 *    responses:
 *      201:
 *        description: Returns a new company
 *      400:
 *        description: Nrc number or nit number already exists
 *      500:
 *        description: Server error
 */
router.post("/create", AddNewCompany);

/**
 * @swagger
 * /companies/show/all:
 *  get:
 *    tags: [Companies]
 *    summary: Get all companies
 *    responses:
 *      200:
 *        description: Returns all companies hability
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Company'
 *      500:
 *        description: Server error
 */
router.get("/show/all", authRoutes, ListAllCompany);

/**
 * @swagger
 * /companies/show/{id}:
 *  get:
 *    tags: [Companies]
 *    summary: Get a company by id
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Company id
 *    responses:
 *      200:
 *        description: Returns a company
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Company'
 *      404:
 *        description: Company not found
 *      500:
 *        description: Server error
 */
router.get("/show/:id", authRoutes, DetailsCompanyId);

/**
 * @swagger
 * /companies/show/user_id/{id}:
 *  get:
 *    tags: [Companies]
 *    summary: Get a company by user_id
 *    parameters:
 *      - in: path
 *        name: user_id
 *        schema:
 *          type: string
 *        required: true
 *        description: Company user_id
 *    responses:
 *      200:
 *        description: Returns a company
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Company'
 *      404:
 *        description: Company not found
 *      500:
 *        description: Server error
 */
router.get("/show/user_id/:user_id", authRoutes, DetailsCompanyIdUser);

/**
 * @swagger
 * /companies/update/{id}:
 *  put:
 *    tags: [Companies]
 *    summary: Update a company
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Company id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/companyUpdate'
 *    responses:
 *      200:
 *        description: Returns updated company
 *      404:
 *        description: Company not found
 *      500:
 *        description: Server error
 */
router.put("/update/:id", authRoutes, UpdateCompanyId);


/**
 * @swagger
 * components:
 *  schemas:
 *    Company:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          format: int32
 *        user_id:
 *          type: integer
 *          format: int32
 *        nrc_number:
 *          type: string
 *        bussiness_type:
 *          type: string
 *        web_site:
 *          type: string
 *        nit_number:
 *          type: string
 *      required:
 *        - id
 *        - user_id
 *        - nrc_number
 *        - bussiness_type
 *        - nit_number
 * 
 *    companyCreate:
 *      type: object
 *      properties:
 *        user_id:
 *          type: integer
 *          format: int32
 *        nrc_number:
 *          type: string
 *        bussiness_type:
 *          type: string
 *        web_site:
 *          type: string
 *        nit_number:
 *          type: string
 *      required:
 *        - nrc_number
 *        - bussiness_type
 *        - website
 *        - nit_number
 * 
 *    companyUpdate:
 *      type: object
 *      properties:
 *        nrc_number:
 *          type: string
 *        bussiness_type:
 *          type: string
 *        web_site:
 *          type: string
 *        nit_number:
 *          type: string
 *      required:
 *        - nrc_number
 *        - bussiness_type 
 *        - nit_number
 *        - web_site
 */


/**
 * @swagger
 * /companies/{id}/profile:
 *   put:
 *     tags: [Companies]
 *     summary: Actualizar perfil de la empresa (datos de contacto + logo)
 *     description: >
 *       Permite modificar los campos de contacto de la empresa y opcionalmente subir un nuevo
 *       logo (archivo de imagen).  
 *       Si se envía un logo, el campo debe llamarse **logo** y enviarse como `multipart/form-data`.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la empresa
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               nrc_number:
 *                 type: string
 *               nit_number:
 *                 type: string
 *               business_type:
 *                 type: string
 *               web_site:
 *                 type: string
 *               contact_email:
 *                 type: string
 *                 format: email
 *               logo:
 *                 type: string
 *                 format: binary
 *           encoding:
 *             logo:
 *               contentType: image/png, image/jpeg
 *     responses:
 *       200:
 *         description: Perfil actualizado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       404:
 *         description: Empresa o usuario asociado no encontrados
 *       422:
 *         description: Error de validación o duplicidad de NRC/NIT
 *       500:
 *         description: Error interno del servidor
 */

router.put("/companies/:id/profile", authRoutes, UpdateCompanyProfile);

export default router;