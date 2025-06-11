// src/routes/ApplicationRoutes.js

import { Router } from "express";
import validate from "../middlewares/validate.js";
import {
  applicationSchema,
} from "../validations/applicationSchema.js";
import {
  createApplication,
  listApplications,
  getApplication,
  deleteApplication,
  applicationsCounterByDeveloper,
  getProjectsApplicationsByDeveloper
} from "../controllers/ProjectApplicationsController.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: application-projects
 *   description: Solicitudes de desarrolladores a proyectos
 */

/**
 * @swagger
 * /application-projects/create:
 *   post:
 *     tags: [application-projects]
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
 *         description: Aplicación ya existe
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
 * /application-projects/show/all:
 *   get:
 *     tags: [application-projects]
 *     summary: Listar aplicaciones (con filtros)
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
 * /application-projects/show/{id}:
 *   get:
 *     tags: [application-projects]
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
 * /application-projects/delete/{id}:
 *   delete:
 *     tags: [application-projects]
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
 * /application-projects/counter/{developer_id}:
 *   get:
 *     tags: [application-projects]
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

/**
 * @swagger
 * /application-projects/my-applications/{developer_id}":
 *   get:
 *     tags: [application-projects]
 *     summary: Obtener las aplicaciones de un desarrollador
 *     parameters:
 *       - in: path
 *         name: developer_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del desarrollador
 *     responses:
 *       200:
 *         description: Aplicaciones encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 *       404:
 *         description: Desarrollador no encontrado o no tiene aplicaciones
 *       500:
 *         description: Error del servidor  
 */
router.get("/my-applications/:developer_id", getProjectsApplicationsByDeveloper);

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
 *           description: '0=activo, 1=ganador, 2=rechazado'
 *         project:
 *           $ref: '#/components/schemas/Project'
 *         company_profile:
 *           $ref: '#/components/schemas/Company'
 *         user: 
 *           $ref: '#/components/schemas/User'
 *         developer:
 *           $ref: '#/components/schemas/Developer'
 *         category:
 *           $ref: '#/components/schemas/Category'
 *
 *     ApplicationCreate:
 *       type: object
 *       properties:
 *         project_id:
 *           type: integer
 *         developer_id:
 *           type: integer
 *       required: [project_id, developer_id]
 *
 */
