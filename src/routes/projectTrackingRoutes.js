import express from "express";
import { 
    createTracking, 
    getProjectHistory, 
    getCurrentStatus } 
    from "../controllers/ProjectTrackingController.js";

const router = express.Router();

router.post("/create", createTracking);
router.get("/get-history/:project_id", getProjectHistory);
router.get("/get-current-status/:project_id", getCurrentStatus);

export default router;