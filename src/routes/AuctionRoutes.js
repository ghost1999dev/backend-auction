// routes/subastas.js
import { Router } from "express";
import validate from "../middlewares/validate.js";
import auctionSchema from "../validations/auctionSchema.js";
import {
  createAuction,
  listAuctions,
  getAuction,
  updateAuction,
  updateAuctionDeadline,
  deleteAuction
} from "../controllers/AuctionsController.js";

const router = Router();



/**
 * @swagger
 * tags:
 *   name: Subastas
 *   description: Operaciones sobre subastas
 */

/* ---------- Crear ---------- */
/**
 * @swagger
 * /subastas/create:
 *  post:
 *    tags: [Subastas]
 *    summary: Crear una nueva subasta
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/AuctionCreate'
 *    responses:
 *      201: { description: Subasta creada }
 *      422: { description: Datos inválidos }
 *      500: { description: Error del servidor }
 */
router.post("/create", validate(auctionSchema), createAuction);

/* ---------- Listar ---------- */
/**
 * @swagger
 * /subastas/show/all:
 *  get:
 *    tags: [Subastas]
 *    summary: Listar subastas (filtros via query)
 *    parameters:
 *      - in: query
 *        name: project_id
 *        schema: { type: integer }
 *        description: ID del proyecto
 *      - in: query
 *        name: status
 *        schema: { type: string }
 *        description: Estado de la subasta
 *      - in: query
 *        name: start_date
 *        schema: { type: string, format: date }
 *        description: Fecha mínima de inicio
 *      - in: query
 *        name: end_date
 *        schema: { type: string, format: date }
 *        description: Fecha máxima de inicio
 *    responses:
 *      200:
 *        description: Lista de subastas
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Auction'
 *      500: { description: Error del servidor }
 */
router.get("/show/all", listAuctions);

/* ---------- Detalle ---------- */
/**
 * @swagger
 * /subastas/show/id/{id}:
 *  get:
 *    tags: [Subastas]
 *    summary: Obtener una subasta por ID
 *    parameters:
 *      - in: path
 *        name: id
 *        schema: { type: integer }
 *        required: true
 *        description: ID de la subasta
 *    responses:
 *      200:
 *        description: Subasta encontrada
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Auction'
 *      404: { description: Subasta no encontrada }
 *      500: { description: Error del servidor }
 */
router.get("/show/id/:id", getAuction);

/* ---------- Actualizar ---------- */
/**
 * @swagger
 * /subastas/update/{id}:
 *  put:
 *    tags: [Subastas]
 *    summary: Actualizar una subasta
 *    parameters:
 *      - in: path
 *        name: id
 *        schema: { type: integer }
 *        required: true
 *        description: ID de la subasta
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/AuctionCreate'
 *    responses:
 *      200: { description: Subasta actualizada }
 *      404: { description: Subasta no encontrada }
 *      500: { description: Error del servidor }
 */
router.put("/update/:id", validate(auctionSchema), updateAuction);

/* ---------- Actualizar fecha final ---------- */
/**
 * @swagger
 * /subastas/update-deadline/{id}:
 *  put:
 *    tags: [Subastas]
 *    summary: Actualizar solo la fecha final de una subasta
 *    parameters:
 *      - in: path
 *        name: id
 *        schema: { type: integer }
 *        required: true
 *        description: ID de la subasta
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              bidding_deadline:
 *                type: string
 *                format: date-time
 *                description: Nueva fecha final de la subasta
 *            required:
 *              - bidding_deadline
 *    responses:
 *      200:
 *        description: Fecha final de la subasta actualizada exitosamente
 *      400:
 *        description: Fecha inválida o anterior a la fecha actual/inicio
 *      404:
 *        description: Subasta no encontrada
 *      500:
 *        description: Error del servidor
 */
router.put("/update-deadline/:id", updateAuctionDeadline);

/* ---------- Eliminar ---------- */
/**
 * @swagger
 * /subastas/delete/{id}:
 *  delete:
 *    tags: [Subastas]
 *    summary: Eliminar una subasta
 *    parameters:
 *      - in: path
 *        name: id
 *        schema: { type: integer }
 *        required: true
 *        description: ID de la subasta
 *    responses:
 *      204: { description: Eliminada con éxito }
 *      404: { description: Subasta no encontrada }
 *      500: { description: Error del servidor }
 */
router.delete("/delete/:id", deleteAuction);

export default router;

/* ---------- Definiciones Swagger ---------- */
/**
 * @swagger
 * components:
 *  schemas:
 *    Auction:
 *      type: object
 *      properties:
 *        id:                 { type: integer }
 *        project_id:         { type: integer }
 *        bidding_started_at: { type: string, format: date-time }
 *        bidding_deadline:   { type: string, format: date-time }
 *        status:             { type: string }
 *      required: [id, project_id, bidding_started_at, bidding_deadline, status]
 *
 *    AuctionCreate:
 *      type: object
 *      properties:
 *        project_id:         { type: integer }
 *        bidding_started_at: { type: string, format: date-time }
 *        bidding_deadline:   { type: string, format: date-time }
 *        status:             { type: string }
 *      required: [project_id, bidding_started_at, bidding_deadline, status]
 */
