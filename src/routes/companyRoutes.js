import express from "express";
import {
  ListAllCompany,
  UpdateCompanyId,
  DeleteCompany,
  DetailsCompanyId,
  AddNewCompany,
  UploadLogoCompany,
} from "../controllers/CompaniesController.js";
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
router.get("/show/all", ListAllCompany);

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
router.get("/show/:id", DetailsCompanyId);

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
router.put("/update/:id", UpdateCompanyId);

/**
 * @swagger
 * /companies/delete/{id}:
 *  delete:
 *    tags: [Companies]
 *    summary: Delete a company
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Company id
 *    responses:
 *      200:
 *        description: Returns deleted company
 *      404:
 *        description: Company not found
 *      500:
 *        description: Server error
 */
router.delete("/delete/:id", DeleteCompany);

export default router;

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