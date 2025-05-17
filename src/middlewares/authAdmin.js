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
    
    const admin = await AdminsModel.findOne({ 
      where: { 
        id: decoded.id,
        status: 'active'
      },
      include: {
      model: RolesModel,
      as: 'role',
      attributes: ['role_name']
    } 
    });
    
    if (!admin || !admin.role) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    req.user = {
      admin_id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role.role_name
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