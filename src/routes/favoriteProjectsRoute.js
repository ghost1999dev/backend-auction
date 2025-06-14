import express from 'express'

import {
    createFavoriteProject,
    deleteFavoriteProject,
    getAllFavoriteProjects
} from '../controllers/FavoriteProjectsController.js'

const router = express.Router()

/**
 * @swagger 
 * /favorite-projects/get/all/{developer_id}:
 *  get:
 *    tags: [favorite-projects]
 *    summary: Get all favorite projects
 *    parameters:
 *      - in: path
 *        name: developer_id
 *        schema:
 *          type: string
 *        required: true
 *        description: The developer id
 *    responses:
 *      200:
 *        description: Returns all favorite projects
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/FavoriteProject'
 *      400:
 *        description: Developer id is required
 *      404:
 *        description: No favorite projects found
 *      500:
 *        description: Server error
 */
router.get('/get/all/:developer_id', getAllFavoriteProjects)

/**
 * @swagger
 * /favorite-projects/create:
 *  post:
 *    tags: [favorite-projects]
 *    summary: Add a favorite project
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              project_id:
 *                type: string
 *                description: The project id
 *              developer_id:
 *                type: string
 *                description: The developer id
 *            required:
 *              - projectId
 *              - developerId
 *    responses:
 *      201:
 *        description: Proyecto añadido a favoritos exitosamente
 *      400:
 *        description: Faltan campos requeridos
 *      404:
 *        description: proyecto o desarrollador no encontrado
 *      500:
 *        description: Error de servidor
 */
router.post('/create', createFavoriteProject)

/**
 * @swagger
 * /favorite-projects/delete/{id}:
 *  delete:
 *    tags: [favorite-projects]
 *    summary: Delete a favorite project
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The favorite project id
 *    responses:
 *      200:
 *        description: Proyecto eliminado de favoritos exitosamente
 *      400:
 *        description: Falta el ID del proyecto
 *      404:
 *        description: Proyecto no encontrado
 *      500:
 *        description: Error interno del servidor
 */
router.delete('/delete/:id', deleteFavoriteProject)

export default router