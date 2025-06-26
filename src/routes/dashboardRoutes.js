import express from "express";
import {
  countActiveCompanies,
  countActiveDevelopers,
  countProjectsByStatus,
  countReportsByStatus
  
} from "../controllers/DashboardController.js";

/**
 * 
 * Dashboard Routes
 * 
 */

const router = express.Router();
/**
 * @swagger
 * tags: 
 *   name: Dashboard
 *   description: Operations about dashboard
 */ 

/**
 * @swagger
 * /dashboard/count/activeCompanies:
 *  get:
 *    tags: [Dashboard]
 *    summary: Get active companies count
 *    responses:
 *      200:
 *        description: Returns active companies count
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                companiesCount:
 *                  type: number
 *                  description: Active companies count
 *                message:
 *                  type: string
 *                  description: Message
 *                status:
 *                  type: number
 *                  description: Status
 *      500:
 *        description: Server error
 */
router.get("/count/activeCompanies", countActiveCompanies);
/**
 * @swagger
 * /dashboard/count/activeDevelopers:
 *  get:
 *    tags: [Dashboard]
 *    summary: Get active developers count
 *    responses:
 *      200:
 *        description: Returns active developers count
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                developersCount:
 *                  type: number
 *                  description: Active developers count
 *                message:
 *                  type: string
 *                  description: Message
 *                status:
 *                  type: number
 *                  description: Status
 *      500:
 *        description: Server error
 */
router.get("/count/activeDevelopers", countActiveDevelopers);
/**
 * @swagger
 * /projects/count/projectsByStatus:
 *  get:
 *    tags: [Projects]
 *    summary: Get the number of projects by status
 *    responses:
 *      200:
 *        description: Returns the number of projects by status
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: Message
 *                status:
 *                  type: number
 *                  description: Status
 *      500:
 *        description: Server error
 */ 
router.get("/count/projectsByStatus", countProjectsByStatus);

router.get("/count/reportsByStatus", countReportsByStatus);




export default router;