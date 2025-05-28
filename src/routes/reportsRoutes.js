import { Router } from 'express';
import { createReport 

} 
from '../controllers/ReportsController.js';

const router = Router();

/**
 * @swagger
 * tags: 
 *   name: reports
 *   description: Operations about reports
 */

router.post('/create', createReport);

export default router;