import express from "express";
import passport from "passport";
import { handleJWTLogin } from "../utils/generateToken.js";

export const loginRouter = express.Router();
  
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
      res.redirect("http://localhost:4200/#/login");
    });
});
    
export { loginRouter };
  
