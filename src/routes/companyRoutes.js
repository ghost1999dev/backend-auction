import express from "express";
import {
  createCompany,
  getCompanyById,
  getCompanies,
  updateCompany,
  deleteCompany,
  uploadImageCompany,
} from "../controllers/CompaniesController.js";

const router = express.Router();

// Ruta para crear una compañía
router.post("/companies", createCompany);

// Ruta para obtener una compañía por su ID
router.get("/companies/:id", getCompanyById);

// Ruta para obtener todas las compañías
/**
 * 
 * 
 * TODO ERROR
 */
router.get("/companies", getCompanies);

// Ruta para actualizar una compañía
router.put("/companies/:id", updateCompany);

// Ruta para eliminar una compañía (cambiar su estado a false)
router.delete("/companies/:id", deleteCompany);

// Ruta para subir una imagen de la compañía
router.post("/companies/:id/upload-image", uploadImageCompany);

export default router;
