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

// Crear nuevo usuario
router.post("/users", createUser);

// Obtener todos los usuarios
router.get("/users-all", getUsers);

// Obtener un usuario por ID
router.get("/users/:id", getUserById);

// Actualizar datos de un usuario (excepto password)
router.put("/users/:id", updateUser);

// Actualizar password de un usuario
router.put("/users/:id/password", updatePassword);

// Eliminar (baja lógica) de un usuario
router.delete("/users/:id", deleteUser);

// Subir imagen asociada a un usuario (depende de tu lógica de almacenamiento)
router.post("/users/upload-image", uploadImageUser);

// Verificar usuario (vía token)
router.get("/users/verify/:token", verifyUser);

export default router;
