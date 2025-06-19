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
  getProjectsApplicationsByDeveloper,
  updateStatusApplication,
  getApplicationsByProject
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
router.get("/show/:id", getApplication);

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
 *       200:
 *         description: Eliminada con éxito
 *       400:
 *         description: Falta el ID de la aplicación
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

/**
 * @swagger
 * /application-projects/update-status/{id}:
 *   put:
 *     tags: [application-projects]
 *     summary: Actualizar el estado de una aplicación
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
 *             type: object
 *             properties:
 *               newStatus:
 *                 type: integer
 *                 description: '1=ganador, 2=rechazado'
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *       404:
 *         description: Aplicación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put("/update-status/:id", updateStatusApplication);

/**
 * @swagger
 * /application-projects/show/by-project/{project_id}:
 *   get:
 *     tags: [application-projects]
 *     summary: Obtener las aplicaciones de un proyecto
 *     parameters:
 *       - in: path
 *         name: project_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del proyecto
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
 *         description: Proyecto no encontrado o no tiene aplicaciones
 *       500:
 *         description: Error del servidor  
 */   
router.get("/show/by-project/:project_id", getApplicationsByProject);

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
