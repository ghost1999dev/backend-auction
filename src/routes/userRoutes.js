import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser,
  uploadImageUser,
  verifyUser,
  verficationEmail,
} from "../controllers/UsersController.js";

const router = Router();
router.post("/validate-email", verficationEmail);
router.post("/create", createUser);
router.get("/show/all", getUsers);
router.get("/show/:id", getUserById);
router.put("/update/:id", updateUser);
router.put("/update-password/:id", updatePassword);
router.delete("/delete/:id", deleteUser);
router.post("/upload-image", uploadImageUser);
router.get("/verify/:token", verifyUser);
export default router;
