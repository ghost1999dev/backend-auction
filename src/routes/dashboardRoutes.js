import express from "express";
import {
  countActiveCompanies,
  countActiveDevelopers,
  countProjectsByStatus,
  countReportsByStatus,
  countTotalCategories,
  countAdminsByStatus,
  getRatingsDistribution,
  getTotalProjectApplicationsDeveloper,
  getFavoriteProjectsDeveloper

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
/**
 * @swagger
 * /dashboard/count/reportsByStatus:
 *  get:
 *    tags: [Dashboard]
 *    summary: Get the number of reports by status
 *    responses:
 *      200:
 *        description: Returns the number of reports by status
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
router.get("/count/reportsByStatus", countReportsByStatus);
/**
 * @swagger
 * /dashboard/count/totalCategories:
 *  get:
 *    tags: [Dashboard]
 *    summary: Get the total number of categories
 *    responses:
 *      200:
 *        description: Returns the total number of categories
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                total:
 *                  type: number
 *                  description: Total number of categories
 *                message:
 *                  type: string
 *                  description: Message
 *                status:
 *                  type: number
 *                  description: Status
 *      500:
 *        description: Server error
 */   
router.get("/count/totalCategories", countTotalCategories);
/**
 * @swagger
 * /dashboard/count/adminsByStatus:
 *  get:
 *    tags: [Dashboard]
 *    summary: Get the number of admins by status
 *    responses:
 *      200:
 *        description: Returns the number of admins by status
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
router.get("/count/adminsByStatus", countAdminsByStatus);
/**
 * @swagger
 * /dashboard/ratings/distribution:
 *  get:
 *    tags: [Dashboard]
 *    summary: Get the ratings distribution
 *    responses:
 *      200:
 *        description: Returns the ratings distribution
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
router.get("/ratings/distribution", getRatingsDistribution);
/**
 * @swagger
 * /dashboard/applications/total:
 *  get:
 *    tags: [Dashboard]
 *    summary: Get the total number of applications
 *    responses:
 *      200:
 *        description: Returns the total number of applications
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                total:
 *                  type: number
 *                  description: Total number of applications   
 */
router.get("/ApplicationsDeveloper", getTotalProjectApplicationsDeveloper);
/**
 * @swagger
 * /dashboard/favorites/developer:
 *  get:
 *    tags: [Dashboard]
 *    summary: Get the total number of favorite projects
 *    responses:
 *      200:
 *        description: Returns the total number of favorite projects
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                total:
 *                  type: number
 *                  description: Total number of favorite projects
 *      500:
 *        description: Server error
 */
router.get("/Totalfavorites/developer", getFavoriteProjectsDeveloper);



export default router;