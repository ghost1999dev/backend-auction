import express from "express";
import passport from "passport";
import { handleJWTLogin } from "../utils/generateToken.js";

export const loginRouter = express.Router();

loginRouter.get("/auth/google",
    passport.authenticate("auth-google", {
      failureRedirect: "/login",
      session: false, // IMPORTANTE: estamos usando JWT ahora
    }),
    (req, res) => {
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      // Redirige con token en la URL (puedes usar cookies también si prefieres)
      res.redirect(`http://localhost:4000/#/main/dashboard?token=${token}`);
    }
  );
  loginRouter.get("/auth/github/callback",
    passport.authenticate("auth-github", {
      failureRedirect: "/login",
      session: false,
    }),
    (req, res) => {
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      res.redirect(`http://localhost:4000/#/main/dashboard?token=${token}`);
    }
  );
  
loginRouter.get("/api/session", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ authenticated: true, user: req.user });
  } else {
    res.status(401).json({ authenticated: false });
  }
});


loginRouter.get("/api/logout", (req, res, next) => {
    req.logout(err => {
      if (err) return next(err);
      res.redirect("http://localhost:4000/#/login");
    });
  });
  
  loginRouter.get("/github", (req, res) => res.send(req.user));
  
  export { loginRouter };
  

