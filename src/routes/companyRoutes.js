import express from "express";
import {
  ListAllCompany,
  UpdateCompanyId,
  DeleteCompany,
  DetailsCompanyId,
  AddNewCompany,
  UploadLogoCompany,
} from "../controllers/CompaniesController.js";
/**
 * 
 * Companies Routes
 * 
 */
const router = express.Router();
router.post("/create", AddNewCompany);
router.get("/show/all", ListAllCompany);
router.get("/show/:id", DetailsCompanyId);
router.put("/update/:id", UpdateCompanyId);
router.delete("/delete/:id", DeleteCompany);
router.post("/upload-logo/:id", UploadLogoCompany);

export default router;
