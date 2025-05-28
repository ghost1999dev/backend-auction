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

router.post('/create', authenticateToken, createReport);
router.get('/show/all', authenticateToken, getAllReports);
router.get('/show/:id', authenticateToken, getReportById);
router.put('/update/:id', authenticateToken, updateReport);
router.delete('/delete/:id', authenticateToken, deleteReport);

export default router;