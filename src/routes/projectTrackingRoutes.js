import express from "express";
import { 
    createTracking, 
    getProjectHistory, 
    getCurrentStatus } 
    from "../controllers/ProjectTrackingController.js";

const router = express.Router();

/**
 * @swagger
 * /project-tracking/create:
 *   post:
 *     tags: [Project Tracking]
 *     summary: Crear un nuevo estado de proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_id:
 *                 type: integer
 *                 description: ID del proyecto
 *               status:
 *                 type: integer
 *                 description: Estado del proyecto
 *               notes:
 *                 type: string
 *                 description: Notas del estado
 *     responses:
 *       201:
 *         description: Estado de proyecto creado
 *       500:
 *         description: Error al crear el estado
 */
router.post("/create", createTracking);
/**
 * @swagger
 * /project-tracking/get-history/{project_id}:
 *   get:
 *     tags: [Project Tracking]
 *     summary: Obtener historial de estados de proyecto
 *     parameters:
 *       - in: path
 *         name: project_id
 *         required: true
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Historial de estados de proyecto
 *       500:
 *         description: Error al obtener el historial
 */
router.get("/get-history/:project_id", getProjectHistory);
/**
 * @swagger
 * /project-tracking/get-current-status/{project_id}:
 *   get:
 *     tags: [Project Tracking]
 *     summary: Obtener el estado actual de un proyecto
 *     parameters:
 *       - in: path
 *         name: project_id
 *         required: true
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Estado actual del proyecto
 *       500:
 *         description: Error al obtener el estado actual
 */
router.get("/get-current-status/:project_id", getCurrentStatus);

export default router;
/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectTracking:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del estado
 *         project_id:
 *           type: integer
 *           description: ID del proyecto
 *         status:
 *           type: integer
 *           description: Estado del proyecto
 *         notes:
 *           type: string
 *           description: Notas del estado
 *         updated_at:
 *           type: string
 *           description: Fecha de actualización          
 */ 