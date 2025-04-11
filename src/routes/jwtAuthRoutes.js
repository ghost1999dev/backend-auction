import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const jwtRouter = express.Router();

// Iniciar autenticación con Google sin sesión y usar JWT
jwtRouter.get(
  "/auth/google/jwt",
  passport.authenticate("auth-google", { session: false, scope: ["profile", "email"] })
);

// Callback para Google: generar el token JWT y devolverlo
jwtRouter.get(
  "/auth/google/callback",
  passport.authenticate("auth-google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const payload = {
      id: req.user.id,
      email: req.user.email
    };
    // Generar el token con expiración de 1 día 
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  }
);
// Ruta protegida
jwtRouter.get(
    "/api/protected",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      res.status(200).json({
        message: " Acceso autorizado",
        user: req.user,
      });
    }
  );
export { jwtRouter };

