import express from "express"
import { createUser, getUsers, getUserById, updateUser, uploadImageUser, verifyUser } from "../controllers/UsersController.js"
import upload from "../helpers/uploadImage.js"

const router = express.Router()
// rutas para usuarios
router.post("/", createUser)
router.get("/", getUsers)
router.get("/:id", getUserById)
router.put("/:id", updateUser)
router.post("/upload/:id", upload.single("image"), uploadImageUser)
router.get("/verify-email/:token", verifyUser)

export default router