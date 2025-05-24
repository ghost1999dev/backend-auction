import passport from "passport";

const authenticateToken = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      console.error("Error en autenticación:", err);
      return res.status(500).json({ message: "Error interno en autenticación" });
    }

    if (!user) {
      return res.status(401).json({ message: "No autorizado: Token inválido o expirado" });
    }

    req.user = user; 
    next();
  })(req, res, next);
};

export default authenticateToken;
