import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_segura';

export const generateToken = (user, profileId, profileType) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role_id,
      profile_id: profileId,
      profile_type: profileType,
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

  export const generateAdminToken = (admin) => {
    const payload = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role_id: admin.role.id,      
      role: admin.role.role_name   
    };

    const options = {
      expiresIn: '1h',
    };

    const token = jwt.sign(payload, JWT_SECRET, options);
    return token;
  };

