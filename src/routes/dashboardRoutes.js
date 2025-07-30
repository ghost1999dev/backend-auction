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
  getFavoriteProjectsDeveloper,
  getMyRatingsDistribution,
  getMyAverageRating,
  getMyProjectsByStatus,
  getMyProjectsWithApplicantCount

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
router.get("/Myratings/distribution", getMyRatingsDistribution);
/**
 * @swagger
 * /dashboard/ratings/average:
 *  get:
 *    tags: [Dashboard]
 *    summary: Get my average rating
 *    responses:
 *      200:
 *        description: Returns my average rating
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                average:
 *                  type: number
 *                  description: My average rating
 *      500:
 *        description: Server error
 */

router.get("/Myaveragerating", getMyAverageRating);
/**
 * @swagger
 * /dashboard/projects/status:
 *  get:
 *    tags: [Dashboard]
 *    summary: Get my projects by status
 *    responses:
 *      200:
 *        description: Returns my projects by status
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                Pendiente:
 *                  type: number
 *                  description: Pendiente
 *                Activo:
 *                  type: number
 *                  description: Activo
 *                Inactivo:
 *                  type: number
 *                  description: Inactivo
 *                Rechazado:
 *                  type: number
 *                  description: Rechazado
 *                Finalizado:
 *                  type: number
 *                  description: Finalizado
 *      500:
 *        description: Server error      
 */
router.get("/Myprojectsbystatus", getMyProjectsByStatus);
/**
 * @swagger
 * /dashboard/projects/applicants:
 *  get:
 *    tags: [Dashboard]
 *    summary: Get my projects with applicant count
 *    responses:
 *      200:
 *        description: Returns my projects with applicant count
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                  description: Success
 *                message:
 *                  type: string
 *                  description: Message
 *                data: 
 *                  type: array
 *                  description: Array of projects
 *      500:
 *        description: Server error  
 */

router.get("/Myprojectswithapplicantcount", getMyProjectsWithApplicantCount);

export default router;
/**
 * @swagger
 * components:
 *  schemas:
 *    Project:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          format: int32
 *        project_name:
 *          type: string
 *        description:
 *          type: string
 *        budget:
 *          type: number
 *        days_available:
 *          type: integer
 *          format: int32
 *        status:
 *          type: integer
 *          format: int32
 *        long_description:
 *          type: string
 *        deactivation_reason:
 *          type: string
 *        createdAt:
 *          type: string
 *          format: date-time
 *        updatedAt:
 *          type: string
 *          format: date-time
 *        category:
 *          $ref: '#/components/schemas/Category'
 *        company:
 *          $ref: '#/components/schemas/Company'
 *    Category:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          format: int32 
 *        name:
 *          type: string
 *        createdAt:
 *          type: string
 *          format: date-time
 *        updatedAt:
 *          type: string
 *          format: date-time
 *    Company:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          format: int32
 *        nrc_number:
 *          type: string
 *        business_type:
 *          type: string
 *        createdAt:
 *          type: string
 *          format: date-time
 *        updatedAt:
 *          type: string
 *          format: date-time
 *        user:
 *          $ref: '#/components/schemas/User'
 *    User:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          format: int32
 *        name:
 *          type: string
 *        email:
 *          type: string
 *        address:
 *          type: string
 *        phone:
 *          type: string
 *        account_type:
 *          type: string
 *        status:
 *          type: integer
 *          format: int32
 *        last_login:
 *          type: string
 *          format: date-time
 *        createdAt:
 *          type: string
 *          format: date-time
 *        updatedAt:
 *          type: string
 *          format: date-time
 */   