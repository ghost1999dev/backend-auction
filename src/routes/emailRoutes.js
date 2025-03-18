import { Router } from "express";
import {
 
  confirmEmail,
  emailVerification,
} from "../controllers/emailController.js";

const router = Router();

router.post("/email/verification", emailVerification);
router.post("/email/confirm", confirmEmail);

export default router;
