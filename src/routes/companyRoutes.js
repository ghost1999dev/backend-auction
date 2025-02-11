import express from "express"
import { createCompany, uploadImageCompany, getCompanyById, getCompanies, updateCompany, deleteCompany } from "../controllers/CompaniesController.js"
import upload from "../helpers/uploadImage.js"

const router = express.Router()

router.get("/", getCompanies)
router.get("/:id", getCompanyById)
router.put("/:id", updateCompany)
router.delete("/:id", deleteCompany)
router.post("/", createCompany)
router.post("/upload/:id", upload.single("image"), uploadImageCompany)

export default router