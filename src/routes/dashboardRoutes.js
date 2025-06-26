import express from "express";
import {
  countActiveCompanies,
  countActiveDevelopers
} from "../controllers/DashboardController.js";

const router = express.Router();

router.get("/count/activeCompanies", countActiveCompanies);

router.get("/count/activeDevelopers", countActiveDevelopers);


export default router;