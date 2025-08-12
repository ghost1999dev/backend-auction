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
  deleteBid,
  listBidsByAuction,
  finalizarSubasta,
  getResultadosSubasta,
  chooseWinner
} from "../controllers/BidsController.js";

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
 *     responses:
 *       201:
 *         description: Puj​a creada
 *       422:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
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
 * /bids/show/by-auction/{id}:
 *   get:
 *     tags: [Bids]
 *     summary: Listar pujas por subasta
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de pujas
 *       500:
 *         description: Error del servidor    
 */
router.get("/show/by-auction/:id", listBidsByAuction);

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
 *         description: Puj​a encontrada
 *       404:
 *         description: Puj​a no encontrada
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
  * /bids/finalize:
  *   post:
  *     tags: [Bids]
  *     summary: Finalizar una subasta
  *     responses:
  *       200:
  *         description: Subasta finalizada
  *       500:
  *         description: Error del servidor
  */
router.post("/finalize", finalizarSubasta);
/**
 * @swagger     
 * /bids/resultados/{id}:
 *   get:
 *     tags: [Bids]
 *     summary: Obtener resultados de una subasta
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Resultados de la subasta
 *       404:
 *         description: Subasta no encontrada
 *       500:
 *         description: Error del servidor
 */ 
router.get("/resultados/:id", getResultadosSubasta);

router.post("/choose-winner", chooseWinner);

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
