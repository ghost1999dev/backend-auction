import jwt from 'jsonwebtoken';
import AdminsModel from '../models/AdminsModel.js';
import RolesModel from '../models/RolesModel.js';

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
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role_id: decoded.role_id,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

