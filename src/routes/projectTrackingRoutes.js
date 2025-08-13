import express from "express";
import { 
    createTracking, 
    getProjectHistory, 
    getCurrentStatus } 
    from "../controllers/ProjectTrackingController.js";

const router = express.Router();

router.post("/create", createTracking);
router.get("/get-history/:id", getProjectHistory);
router.get("/get-current-status/:id", getCurrentStatus);

export default router;