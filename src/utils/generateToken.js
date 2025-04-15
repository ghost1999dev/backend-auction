import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};
export const handleJWTLogin = async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "No autenticado" });
  
      const token = generateToken(req.user);
      res.status(200).json({
        token,
        user: req.user,
      });
    } catch (err) {
      res.status(500).json({ message: "Error al generar token", error: err.message });
    }
  };