import { Router } from 'express';
import { 
    getAllRatings, 
    getByIdRating, 
    createRatings, 
    updateRatings,
    deleteRatings,
    getPromRatingByCompany,
    getPromRatingByDeveloper,
    getPublicProfile

} 
    from '../controllers/RatingsController.js';
    import  authenticateToken  from '../middlewares/authenticateToken.js';

const router = Router();

/**
 * @swagger
 * tags: 
 *   name: ratings
 *   description: Operations about ratings
 */

/**
 * @swagger
 * /ratings/show/all:
 *   get:
 *     tags:               
 *       - ratings
 *     summary:            Obtener todos los ratings
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ratings obtenidos
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
 *                       score:
 *                         type: number
 *                       comment:
 *                         type: string
 *                       isVisible:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *                       developer_id:
 *                         type: number
 *                       company_id:
 *                         type: number
 *                       developer_name:
 *                         type: string
 *                       company_name:
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
 */
router.get('/show/all',authenticateToken, getAllRatings);
/**
 * @swagger
 * /ratings/show/{id}:
 *   get:
 *     tags:               
 *       - ratings
 *     summary:            Obtener un rating por id
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
 *         description: ID del rating
 *     responses:
 *       200:
 *         description: Rating obtenido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 score:
 *                   type: number
 *                 comment:
 *                   type: string
 *                 isVisible:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                 developer_id:
 *                   type: number
 *                 company_id:
 *                   type: number
 *                 developer_name:
 *                   type: string
 *                 company_name:
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
 *         description: Rating no encontrado
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
router.get('/show/:id',authenticateToken, getByIdRating);
/**
 * @swagger
 * /ratings/create:
 *   post:
 *     tags:               
 *       - ratings
 *     summary:            Crear un rating
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
 *               developer_id:
 *                 type: number
 *               company_id:
 *                 type: number
 *               score:
 *                 type: number
 *               comment:
 *                 type: string
 *               isVisible:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Rating creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 score:
 *                   type: number
 *                 comment:
 *                   type: string
 *                 isVisible:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                 developer_id:
 *                   type: number
 *                 company_id:
 *                   type: number
 *                 developer_name:
 *                   type: string
 *                 company_name:
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
router.post('/create', createRatings);
/**
 * @swagger
 * /ratings/update/{id}:
 *   put:
 *     tags:               
 *       - ratings
 *     summary:            Actualizar un rating
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
 *         description: ID del rating
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               developer_id:
 *                 type: number
 *               company_id:
 *                 type: number
 *               score:
 *                 type: number
 *               comment:
 *                 type: string
 *               isVisible:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Rating actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 score:
 *                   type: number
 *                 comment:
 *                   type: string
 *                 isVisible:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                 developer_id:
 *                   type: number
 *                 company_id:
 *                   type: number
 *                 developer_name:
 *                   type: string
 *                 company_name:
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
 *         description: Rating no encontrado
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
router.put('/update/:id',authenticateToken, updateRatings);
/**
 * @swagger
 * /ratings/delete/{id}:
 *   delete:
 *     tags:               
 *       - ratings
 *     summary:            Eliminar un rating
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
 *         description: ID del rating
 *     responses:
 *       200:
 *         description: Rating eliminado
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
 *         description: Rating no encontrado
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
router.delete('/delete/:id',authenticateToken, deleteRatings);
/**
 * @swagger
 * /ratings/getPromCompany/{id}:
 *   get:
 *     tags:               
 *       - ratings
 *     summary:            Obtener el promedio de la empresa
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
 *         description: ID del rating
 *     responses:
 *       200:
 *         description: Promedio obtenido               
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 averageScore:
 *                   type: number
 *                   description: Promedio del rating
 *                 totalRatings:
 *                   type: number
 *                   description: Total de ratings
 *                 type:
 *                   type: string
 *                   description: Tipo de rating
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
 *         description: Rating no encontrado
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
router.get('/getPromCompany/:id', getPromRatingByCompany);
/**
 * @swagger
 * /ratings/getPromDeveloper/{id}:
 *   get:
 *     tags:               
 *       - ratings
 *     summary:            Obtener el promedio del desarrollador
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
 *         description: ID del rating
 *     responses:
 *       200:
 *         description: Promedio obtenido               
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 averageScore:
 *                   type: number
 *                   description: Promedio del rating
 *                 totalRatings:
 *                   type: number
 *                   description: Total de ratings
 *                 type:
 *                   type: string
 *                   description: Tipo de rating
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
 *         description: Rating no encontrado
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
router.get('/getPromDeveloper/:id',getPromRatingByDeveloper);
/**
 * @swagger
 * /ratings/getPublicProfile/{id}:
 *   get:
 *     tags:               
 *       - ratings
 *     summary:            Obtener el perfil público
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
 *         description: ID del rating
 *     responses:
 *       200:
 *         description: Perfil público obtenido               
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     image:
 *                       type: string
 *                     account_type:
 *                       type: number
 *                     status:
 *                       type: number
 *                     last_login:
 *                       type: string
 *                 ratingSummary:
 *                   type: object
 *                   properties:
 *                     averageScore:
 *                       type: number
 *                     totalRatings:
 *                       type: number
 *                 recentRatings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       score:
 *                         type: number
 *                       comment:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                       reviewer:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           image:
 *                             type: string
 *                           account_type:
 *                             type: number
 *                           status:
 *                             type: number
 *                           last_login:
 *                             type: string
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
 *         description: Rating no encontrado
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
router.get('/getPublicProfile/:id',getPublicProfile);


export default router;
/**
 * @swagger
 * components:
 *   shemas:
 *     Rating:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         score:
 *           type: number
 *         comment:
 *           type: string
 *         isVisible:
 *           type: boolean
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *         developer_id:
 *           type: number
 *         company_id:
 *           type: number
 *         developer_name:
 *           type: string
 *         company_name:
 *           type: string
 *       required:
 *         - id
 *         - score
 *         - comment
 *         - isVisible
 *         - createdAt
 *         - updatedAt
 *         - developer_id
 *         - company_id
 *         - developer_name
 *         - company_name           
 *     Ratings:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/shemas/Rating'
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
