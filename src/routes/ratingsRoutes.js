import { Router } from 'express';
import { 
    getAllRatings, 
    getByIdRating, 
    createRatings, 
    updateRatings,
    deleteRatings } from '../controllers/RatingsController.js';

const router = Router();

/**
 * @swagger
 * tags: 
 *   name: ratings
 *   description: Operations about ratings
 */

router.get('/show/all', getAllRatings);
router.get('/show/:id', getByIdRating);
router.post('/create', createRatings);
router.put('/update/:id', updateRatings);
router.delete('/delete/:id', deleteRatings);

export default router;