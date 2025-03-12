import { Router } from "express";
import {
  requestVerification,
  confirmVerification,
} from "../controllers/emailController.js";

const router = Router();

router.post("/request-verification", requestVerification);

router.post("/confirm-verification", confirmVerification);

export default router;
