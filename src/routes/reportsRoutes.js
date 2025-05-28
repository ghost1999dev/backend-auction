import { Router } from 'express';
import { createReport,
         getAllReports,
         getReportById,
         updateReport,
         deleteReport

} 
from '../controllers/ReportsController.js';
import  authenticateToken  from '../middlewares/authenticateToken.js';

const router = Router();

/**
 * @swagger
 * tags: 
 *   name: reports
 *   description: Operations about reports
 */

/**
 * @swagger
 * /reports/create:
 *   post:
 *     tags:               
 *       - reports
 *     summary:            Crear un reporte
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: number
 *               project_id:
 *                 type: number
 *               reason:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reporte creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 reporter_id:
 *                   type: number
 *                 user_id:
 *                   type: number
 *                 user_role:
 *                   type: string
 *                 project_id:
 *                   type: number
 *                 reason:
 *                   type: string
 *                 comment:
 *                   type: string
 *                 status:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                 reporter_name:
 *                   type: string
 *                 reportedUser_name:
 *                   type: string
 *                 project_name:
 *                   type: string
 *       400:
 *         description: Error en la petición
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *       403:
 *         description: No autorizado para realizar la operación solicitada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error                 
 *               required:  
 *                 - message                 
 */
router.post('/create', authenticateToken, createReport);
/**
 * @swagger
 * /reports/show/all:
 *   get:
 *     tags:               
 *       - reports
 *     summary:            Obtener todos los reportes
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Reportes obtenidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       reporter_id:
 *                         type: number
 *                       user_id:
 *                         type: number
 *                       user_role:
 *                         type: string
 *                       project_id:
 *                         type: number
 *                       reason:
 *                         type: string
 *                       comment:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *                       reporter_name:
 *                         type: string
 *                       reportedUser_name:
 *                         type: string
 *                       project_name:
 *                         type: string
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 totalPages:
 *                   type: number
 *       400:
 *         description: Error en la petición
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *       403:
 *         description: No autorizado para realizar la operación solicitada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error                 
 *               required:  
 *                 - message                 
 */     
router.get('/show/all', authenticateToken, getAllReports);
/**
 * @swagger
 * /reports/show/{id}:
 *   get:
 *     tags:               
 *       - reports
 *     summary:            Obtener un reporte por id
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: ID del reporte
 *     responses:
 *       200:
 *         description: Reporte obtenido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 reporter_id:
 *                   type: number
 *                 user_id:
 *                   type: number
 *                 user_role:
 *                   type: string
 *                 project_id:
 *                   type: number
 *                 reason:
 *                   type: string
 *                 comment:
 *                   type: string
 *                 status:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                 reporter_name:
 *                   type: string
 *                 reportedUser_name:
 *                   type: string
 *                 project_name:
 *                   type: string
 *       400:
 *         description: Error en la petición
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *       403:
 *         description: No autorizado para realizar la operación solicitada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *       404:
 *         description: Reporte no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error                 
 *               required:  
 *                 - message                 
 */
router.get('/show/:id', authenticateToken, getReportById);
/**
 * @swagger
 * /reports/update/{id}:
 *   put:
 *     tags:               
 *       - reports
 *     summary:            Actualizar un reporte
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: ID del reporte
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: number
 *               project_id:
 *                 type: number
 *               reason:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reporte actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 reporter_id:
 *                   type: number
 *                 user_id:
 *                   type: number
 *                 user_role:
 *                   type: string
 *                 project_id:
 *                   type: number
 *                 reason:
 *                   type: string
 *                 comment:
 *                   type: string
 *                 status:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                 reporter_name:
 *                   type: string
 *                 reportedUser_name:
 *                   type: string
 *                 project_name:
 *                   type: string
 *       400:
 *         description: Error en la petición
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *       403:
 *         description: No autorizado para realizar la operación solicitada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *       404:
 *         description: Reporte no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error                 
 *               required:  
 *                 - message                    
 */
router.put('/update/:id', authenticateToken, updateReport);
/**
 * @swagger
 * /reports/delete/{id}:
 *   delete:
 *     tags:               
 *       - reports
 *     summary:            Eliminar un reporte
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: ID del reporte
 *     responses:
 *       200:
 *         description: Reporte eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *       400:
 *         description: Error en la petición
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *       401:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *       403:
 *         description: No autorizado para realizar la operación solicitada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: 
 *                   type: string
 *                   description: Descripción del error
 *       404:
 *         description: Reporte no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Descripción del error                 
 *               required:  
 *                 - message                 
 */     
router.delete('/delete/:id', authenticateToken, deleteReport);

export default router;
/**
 * @swagger
 * components:
 *   shemas:
 *     Report:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         reporter_id:
 *           type: number
 *         user_id:
 *           type: number
 *         user_role:
 *           type: string
 *         project_id:
 *           type: number
 *         reason:
 *           type: string
 *         comment:
 *           type: string
 *         status:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *         reporter_name:
 *           type: string
 *         reportedUser_name:
 *           type: string
 *         project_name:
 *           type: string
 *       required:
 *         - id
 *         - reporter_id
 *         - user_id
 *         - user_role
 *         - project_id
 *         - reason
 *         - comment
 *         - status
 *         - createdAt
 *         - updatedAt
 *         - reporter_name
 *         - reportedUser_name
 *         - project_name           
 *     Reports:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/shemas/Report'
 *         total:
 *           type: number
 *         page:
 *           type: number
 *         totalPages:
 *           type: number
 *       required:
 *         - data
 *         - total
 *         - page
 *         - totalPages           
 */ 