import { Router } from 'express';
import { createReport,
         getAllReports,
         getReportById

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
router.get('/show/:id', getReportById);

export default router;