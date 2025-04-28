import jwt from 'jsonwebtoken';
import AdminModel from '../models/AdminModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_segura';

/**
 * validate admin
 * 
 * Function to validate admin
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} validation admin
 */

export const validateAdmin = async (req, res, next) => {
  try {
    // Verificar si existe el token en los headers
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Comprobar si el usuario es un administrador activo
    const admin = await AdminModel.findOne({ 
      where: { 
        id: decoded.id,
        status: 'active'
      } 
    });
    
    if (!admin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    // Añadir la información del administrador al objeto request
    req.user = {
      admin_id: admin.id,
      username: admin.username,
      email: admin.email
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
