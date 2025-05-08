// src/routes/ApplicationRoutes.js

import { Router } from "express";
import validate from "../middlewares/validate.js";
import {
  applicationSchema,
  applicationUpdateSchema
} from "../validations/applicationSchema.js";
import {
  createApplication,
  listApplications,
  getApplication,
  updateApplication,
  deleteApplication,
  applicationsCounterByDeveloper
} from "../controllers/ProjectApplicationsController.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: aplication-projects
 *   description: Solicitudes de desarrolladores a proyectos
 */

/**
 * @swagger
 * /aplication-projects/create:
 *   post:
 *     tags: [aplication-projects]
 *     summary: Crear una nueva aplicación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplicationCreate'
 *     responses:
 *       201:
 *         description: Aplicación creada
 *       409:
 *         description: Aplicación duplicada
 *       422:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post(
  "/create",
  validate(applicationSchema),
  createApplication
);

/**
 * @swagger
 * /aplication-projects/show/all:
 *   get:
 *     tags: [aplication-projects]
 *     summary: Listar aplicaciones (con filtros)
 *     parameters:
 *       - in: query
 *         name: developer_id
 *         schema:
 *           type: integer
 *         description: ID del desarrollador
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: integer
 *         description: ID del proyecto
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: Estado (0=pending,1=approved,2=rejected)
 *     responses:
 *       200:
 *         description: Lista de aplicaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 *       422:
 *         description: Datos de filtro inválidos
 *       500:
 *         description: Error del servidor
 */
router.get("/show/all", listApplications);

/**
 * @swagger
 * /aplication-projects/{id}:
 *   get:
 *     tags: [aplication-projects]
 *     summary: Obtener una aplicación por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la aplicación
 *     responses:
 *       200:
 *         description: Aplicación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       404:
 *         description: Aplicación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get("/:id", getApplication);

/**
 * @swagger
 * /aplication-projects/update/{id}:
 *   put:
 *     tags: [aplication-projects]
 *     summary: Actualizar estado de la aplicación
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la aplicación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplicationUpdate'
 *     responses:
 *       200:
 *         description: Aplicación actualizada
 *       404:
 *         description: Aplicación no encontrada
 *       422:
 *         description: Regla de negocio violada o dato inválido
 *       500:
 *         description: Error del servidor
 */
router.put(
  "/update/:id",
  validate(applicationUpdateSchema),
  updateApplication
);

/**
 * @swagger
 * /aplication-projects/delete/{id}:
 *   delete:
 *     tags: [aplication-projects]
 *     summary: Eliminar una aplicación
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la aplicación
 *     responses:
 *       204:
 *         description: Eliminada con éxito
 *       404:
 *         description: Aplicación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete("/delete/:id", deleteApplication);

/**
 * @swagger
 * /aplication-projects/counter/{developer_id}:
 *   get:
 *     tags: [aplication-projects]
 *     summary: Contar las aplicaciones de un desarrollador
 *     parameters:
 *       - in: path
 *         name: developer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del desarrollador
 *     responses:
 *       200:
 *         description: Contador de aplicaciones
 *       404:
 *         description: Desarrollador no encontrado o no tiene aplicaciones
 *       500:
 *         description: Error del servidor
 */
router.get("/counter/:developer_id", applicationsCounterByDeveloper);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         project_id:
 *           type: integer
 *         developer_id:
 *           type: integer
 *         status:
 *           type: integer
 *           description: '0=pending,1=approved,2=rejected'
 *       required: [id, project_id, developer_id, status]
 *
 *     ApplicationCreate:
 *       type: object
 *       properties:
 *         project_id:
 *           type: integer
 *         developer_id:
 *           type: integer
 *         status:
 *           type: integer
 *           description: '0=pending,1=approved,2=rejected'
 *       required: [project_id, developer_id, status]
 *
 *     ApplicationUpdate:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           description: '0=pending,1=approved,2=rejected'
 *       required: [status]
 */
