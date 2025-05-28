import { Router } from 'express';
import { createReport,
         getAllReports

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
router.get('/show/all', getAllReports);

export default router;