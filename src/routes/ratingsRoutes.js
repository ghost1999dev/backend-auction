import { Router } from 'express';
import { 
    getAllRatings, 
    getByIdRating, 
    createRatings, 
    updateRatings,
    deleteRatings } from '../controllers/RatingsController.js';
    import  authenticateToken  from '../middlewares/authenticateToken.js';

const router = Router();

/**
 * @swagger
 * tags: 
 *   name: ratings
 *   description: Operations about ratings
 */

router.get('/show/all',authenticateToken, getAllRatings);
router.get('/show/:id',authenticateToken, getByIdRating);
router.post('/create',authenticateToken, createRatings);
router.put('/update/:id',authenticateToken, updateRatings);
router.delete('/delete/:id',authenticateToken, deleteRatings);

export default router;