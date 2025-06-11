import bcrypt from 'bcrypt';
import AdminsModel from '../models/AdminsModel.js';  
import { generateAdminToken } from '../utils/generateToken.js';  

export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Buscando administrador con el nombre de usuario:', username);

    const admin = await AdminsModel.findOne({ where: { username } });
    
    if (!admin) {
      console.log('Admin no encontrado');
      return res.status(404).json({ message: 'Admin not found.' });
    }

    if (admin.status === 'inactive') {
      console.log('Cuenta suspendida');
      return res.status(403).json({
        message: 'Su cuenta ha sido suspendida. Por favor, comuníquese con el equipo de soporte.'
      });
    }

    console.log('Admin encontrado:', admin);

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log('La contraseña no coincide');
      return res.status(401).json({ message: 'Invalid password.' });
    }

    console.log('Contraseña válida, generando token');
    const token = generateAdminToken(admin);

    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

