import { Router } from "express";
import validate from "../middlewares/validate.js";
import {
  createBidSchema,
  updateBidSchema
} from "../validations/bidSchema.js";
import {
  createBid,
  listBids,
  getBid,
  updateBid,
  deleteBid
} from "../controllers/BidsController.js";
import {
  getBidsFromSource,
  compareSourceBids,
  createBidDual,
  getBidsFromRepository
} from "../controllers/BidSourceController.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Bids
 *   description: Operaciones sobre pujas
 */

/**
 * @swagger
 * /bids/create:
 *   post:
 *     tags: [Bids]
 *     summary: Crear una nueva puja
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BidCreate'
 *           example:
 *             auction_id: 1
 *             developer_id: 2
 *             amount: 500
 *     responses:
 *       201:
 *         description: Puja creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Puja creada exitosamente"
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   $ref: '#/components/schemas/Bid'
 *       400:
 *         description: Datos inválidos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Faltan campos requeridos"
 *                 status:
 *                   type: integer
 *                   example: 400
 *       409:
 *         description: Conflicto, ya existe una puja
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ya existe una puja para esta subasta"
 *                 status:
 *                   type: integer
 *                   example: 409
 *       422:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error de validación"
 *                 status:
 *                   type: integer
 *                   example: 422
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al procesar la solicitud"
 *                 status:
 *                   type: integer
 *                   example: 500
 */
router.post("/create", validate(createBidSchema), createBid);

/**
 * @swagger
 * /bids/show/all:
 *   get:
 *     tags: [Bids]
 *     summary: Listar pujas (opcionalmente filtradas)
 *     parameters:
 *       - in: query
 *         name: auction_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: developer_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de pujas
 *       500:
 *         description: Error del servidor
 */
router.get("/show/all", listBids);

/**
 * @swagger
 * /bids/compare/{auctionId}:
 *   get:
 *     tags: [Bids]
 *     summary: Compara pujas entre PostgreSQL y Firebase
 *     parameters:
 *       - in: path
 *         name: auctionId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Comparación exitosa
 *       500:
 *         description: Error del servidor
 */
router.get("/compare/:auctionId", compareSourceBids);

/**
 * @swagger
 * /bids/source/{auctionId}:
 *   get:
 *     tags: [Bids]
 *     summary: Obtiene pujas de la fuente de datos especificada
 *     parameters:
 *       - in: path
 *         name: auctionId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [postgres, firebase]
 *         description: Fuente de datos (postgres o firebase)
 *     responses:
 *       200:
 *         description: Lista de pujas procesadas
 *       400:
 *         description: Fuente de datos no válida
 *       500:
 *         description: Error del servidor
 */
router.get("/source/:auctionId", getBidsFromSource);

/**
 * @swagger
 * /bids/repository/{auctionId}/{repositoryType}:
 *   get:
 *     tags: [Bids]
 *     summary: Obtiene pujas directamente del repositorio especificado
 *     parameters:
 *       - in: path
 *         name: auctionId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: path
 *         name: repositoryType
 *         schema:
 *           type: string
 *           enum: [postgres, firebase]
 *         required: true
 *         description: Tipo de repositorio (postgres o firebase)
 *     responses:
 *       200:
 *         description: Lista de pujas directamente del repositorio
 *       400:
 *         description: Tipo de repositorio no válido
 *       500:
 *         description: Error del servidor
 */
router.get("/repository/:auctionId/:repositoryType", getBidsFromRepository);

/**
 * @swagger
 * /bids/{id}:
 *   get:
 *     tags: [Bids]
 *     summary: Obtener puja por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Puja encontrada
 *       404:
 *         description: Puja no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get("/:id", getBid);

/**
 * @swagger
 * /bids/update/{id}:
 *   put:
 *     tags: [Bids]
 *     summary: Actualizar el monto de una puja
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BidUpdate'
 *     responses:
 *       200:
 *         description: Puj​a actualizada
 *       404:
 *         description: Puj​a no encontrada
 *       422:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.put("/update/:id", validate(updateBidSchema), updateBid);

/**
 * @swagger
 * /bids/delete/{id}:
 *   delete:
 *     tags: [Bids]
 *     summary: Eliminar una puja
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       204:
 *         description: Eliminada con éxito
 *       404:
 *         description: Puj​a no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete("/delete/:id", deleteBid);

/**
 * @swagger
 * /bids/dual:
 *   post:
 *     tags: [Bids]
 *     summary: Crea una puja en ambas fuentes (PostgreSQL y Firebase)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BidCreate'
 *     responses:
 *       201:
 *         description: Puja creada en ambas fuentes
 *       500:
 *         description: Error del servidor
 */
router.post("/dual", validate(createBidSchema), createBidDual);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Bid:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         auction_id:
 *           type: integer
 *         developer_id:
 *           type: integer
 *         amount:
 *           type: number
 *           format: float
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required: [id, auction_id, developer_id, amount]
 *
 *     BidCreate:
 *       type: object
 *       properties:
 *         auction_id:
 *           type: integer
 *         developer_id:
 *           type: integer
 *         amount:
 *           type: number
 *           format: float
 *       required: [auction_id, developer_id, amount]
 *
 *     BidUpdate:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *           format: float
 *       required: [amount]
 */
