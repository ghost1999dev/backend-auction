import bcrypt from 'bcrypt';
import AdminModel from '../models/AdminModel.js';  
import { generateAdminToken } from '../utils/generateToken.js';  



export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Buscando administrador con el nombre de usuario:', username);

    const admin = await AdminModel.findOne({ where: { username } });
    
    if (!admin) {
      console.log('Admin no encontrado');
      return res.status(404).json({ message: 'Admin not found.' });
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
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

