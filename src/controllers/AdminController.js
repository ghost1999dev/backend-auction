import AdminModel from '../models/AdminModel.js';
import bcrypt from 'bcrypt';
/**
 * create admin
 *
 * function to create admin
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} admin created
 */ 
export const createAdmin = async (req, res) => {
  try {
    const { full_name, phone, email, username, password, image } = req.body;

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await AdminModel.create({
      full_name,
      phone,
      email,
      username,
      password: hashedPassword,
      image,
      status: 'active', 
    });

    return res.status(201).json({ message: 'Admin created successfully', newAdmin });
  } catch (error) {
    console.error('Error creating admin:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


/**
 * get all admins
 *
 * function to get all admins
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} admins retrieved
 */
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await AdminModel.findAll();
    return res.status(200).json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * get admin by id
 *
 * function to get admin by id
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} admin retrieved    
 */
export const getAdminById = async (req, res) => {
  try {
    const admin = await AdminModel.findByPk(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    return res.status(200).json(admin);
  } catch (error) {
    console.error('Error fetching admin by id:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * update admin
 *
 * function to update admin
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} admin updated
 */
export const updateAdmin = async (req, res) => {
  try {
    const { full_name, phone, email, username, password, image, status } = req.body;

    // Buscar el administrador por ID
    const admin = await AdminModel.findByPk(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Encriptar la nueva contraseña si se proporciona
    let hashedPassword = admin.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Actualizar los campos del administrador
    admin.full_name = full_name || admin.full_name;
    admin.phone = phone || admin.phone;
    admin.email = email || admin.email;
    admin.username = username || admin.username;
    admin.password = hashedPassword;
    admin.image = image || admin.image;
    admin.status = status || admin.status;

    await admin.save();

    return res.status(200).json({ message: 'Admin updated successfully', admin });
  } catch (error) {
    console.error('Error updating admin:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * delete admin
 *
 * function to delete admin
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} admin deleted
 */
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await AdminModel.findByPk(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    await admin.destroy();
    return res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
