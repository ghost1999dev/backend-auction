/**
 * 
 * 
 * 
 */
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
} from "../controllers/UsersController.js";

const router = Router();
router.post("/users", createUser);
router.get("/users-all", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.put("/users/:id/password", updatePassword);
router.delete("/users/:id", deleteUser);
router.post("/users/upload-image", uploadImageUser);
router.get("/users/verify/:token", verifyUser);

export default router;
