import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const jwtRouter = express.Router();

// --- LOGIN CON GOOGLE ---
jwtRouter.get(
  "/auth/google/jwt",
  passport.authenticate("auth-google", { session: false, scope: ["profile", "email"] })
);

jwtRouter.get(
  "/auth/google/callback",
  passport.authenticate("auth-google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const payload = {
      id: req.user.id,
      email: req.user.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.redirect(`http://localhost:4200/#/auth/passport?token=${token}`);
  }
);

// --- LOGIN CON GITHUB ---
jwtRouter.get(
  "/auth/github/jwt",
  passport.authenticate("auth-github", { session: false, scope: ["user:email"] })
);

jwtRouter.get(
  "/auth/github/callback",
  passport.authenticate("auth-github", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const payload = {
      id: req.user.id,
      email: req.user.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.redirect(`https://stirring-raindrop-a222c3.netlify.app/#/auth/passport?token=${token}`);
  }
);

jwtRouter.get(
  "/api/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.status(200).json({
      message: "Acceso autorizado",
      user: req.user,
    });
  }
);

export { jwtRouter };
