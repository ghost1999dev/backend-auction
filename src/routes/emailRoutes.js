import { Router } from "express";
import {
  requestVerification,
  confirmVerification,
} from "../controllers/emailController.js";

const router = Router();

// Ruta para solicitar verificación
router.post("/request-verification", requestVerification);

// Ruta para confirmar verificación
router.post("/confirm-verification", confirmVerification);

export default router;
