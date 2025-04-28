import AdminModel from '../models/AdminModel.js';
import ProjectsModel from '../models/ProjectsModel.js';
import CompaniesModel from '../models/CompaniesModel.js';
import CategorieModel from '../models/CategorieModel.js';
import UsersModel from '../models/UsersModel.js';
import { Op } from 'sequelize';
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

      const requiredFields = { full_name, phone, email, username, password };
      const missingFields = Object.keys(requiredFields).filter(field => !requiredFields[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: true,
          message: 'Campos requeridos faltantes', 
          missingFields 
        });
      }

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
    
    return res.status(201).json({ 
      error: false,
      message: 'Admin creado exitosamente', 
      data: newAdmin 
    });
  } catch (error) {
    console.error('Error al crear admin:', error);
    
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        error: true,
        message: 'Error de validación',
        errors
      });
    }
    
    return res.status(500).json({ 
      error: true,
      message: 'Error interno del servidor'
    });
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
    return res.status(200).json({
      error: false,
      data: admins
    });
  } catch (error) {
    console.error('Error al obtener admins:', error);
    return res.status(500).json({ 
      error: true,
      message: 'Error interno del servidor' 
    });
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

    // Validar que el ID sea proporcionado
    if (!req.params.id) {
      return res.status(400).json({
        error: true,
        message: 'ID de administrador requerido'
      });
    }

    const admin = await AdminModel.findByPk(req.params.id);

    if (!admin) {
      return res.status(400).json({
        error: true,
        message: 'Administrador no encontrado'
      });
    }

    return res.status(200).json({
      error: false,
      data: admin
    });
  } catch (error) {
    console.error('Error al obtener admin por id:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
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

    if (!req.params.id) {
      return res.status(400).json({
        error: true,
        message: 'ID de administrador requerido'
      });
    }

    const { full_name, phone, email, username, password, image, status } = req.body;

     if (!full_name && !phone && !email && !username && !password && !image && !status) {
      return res.status(400).json({
        error: true,
        message: 'Debe proporcionar al menos un campo para actualizar'
      });
    }

    const admin = await AdminModel.findByPk(req.params.id);

    if (!admin) {
      return res.status(404).json({
        error: true,
        message: 'Administrador no encontrado'
      });
    }

    let hashedPassword = admin.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    admin.full_name = full_name || admin.full_name;
    admin.phone = phone || admin.phone;
    admin.email = email || admin.email;
    admin.username = username || admin.username;
    admin.password = hashedPassword;
    admin.image = image !== undefined ? image : admin.image;
    admin.status = status || admin.status;

    await admin.save();

    return res.status(200).json({
      error: false,
      message: 'Administrador actualizado exitosamente',
      data: admin
    });
  } catch (error) {
    console.error('Error al actualizar admin:', error);
    
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        error: true,
        message: 'Error de validación',
        errors
      });
    }
    
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
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
     // Validar que el ID sea proporcionado
     if (!req.params.id) {
      return res.status(404).json({
        error: true,
        message: 'Administrador no encontrado'
      });
    }

    await admin.destroy();
    return res.status(200).json({
      error: false,
      message: 'Administrador eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar admin:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * obtener todos los proyectos
 *
 * función para obtener todos los proyectos para administrador
 * @param {Object} req - objeto de solicitud
 * @param {Object} res - objeto de respuesta
 * @returns {Object} proyectos recuperados
 */
export const getAllProjects = async (req, res) => {
  try {
    const projects = await ProjectsModel.findAll({
      include: [
        {
          model: CompaniesModel,
          as: 'company_profile',
          attributes: ['id', 'user_id']
        },
        {
          model: CategorieModel,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    return res.status(200).json({
      error: false,
      data: projects
    });
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
};


/**
 * buscar proyectos
 *
 * función para buscar proyectos por nombre de compañía, nombre de proyecto o categoría
 * @param {Object} req - objeto de solicitud
 * @param {Object} res - objeto de respuesta
 * @returns {Object} proyectos que coinciden con los criterios de búsqueda
 */
export const searchProjects = async (req, res) => {
  try {
    const { company_name, project_name, category_id } = req.query;

     if (!company_name && !project_name && !category_id) {
      return res.status(400).json({
        error: true,
        message: 'Debe proporcionar al menos un criterio de búsqueda (company_name, project_name o category_id)'
      });
    }    
    
    const whereConditions = {};
    const includeConditions = [
      {
        model: CompaniesModel,
        as: 'company_profile',
        attributes: ['id'],
        include: [
          {
            model: UsersModel,
            attributes: ['id', 'name'], 
          }
        ]
      },
      {
        model: CategorieModel,
        as: 'category',
        attributes: ['id', 'name']
      }
    ];

    
    if (project_name) {
      whereConditions.project_name = {
        [Op.iLike]: `%${project_name}%` 
      };
    }

    
    if (category_id) {
      whereConditions.category_id = category_id;
    }

    
    if (company_name) {
      whereConditions['$company_profile.user.name$'] = {
        [Op.iLike]: `%${company_name}%`
      };
    }

    const projects = await ProjectsModel.findAll({
      where: whereConditions,
      include: includeConditions
    });
    
    if (projects.length === 0) {
      return res.status(200).json({
        error: false,
        message: 'No se encontraron proyectos que coincidan con los criterios',
        data: []
      });
    }
    
    return res.status(200).json({
      error: false,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Error al buscar proyectos:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * obtener proyecto por id
 *
 * función para obtener proyecto por id para administrador
 * @param {Object} req - objeto de solicitud
 * @param {Object} res - objeto de respuesta
 * @returns {Object} proyecto recuperado
 */
export const getProjectById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({
        error: true,
        message: 'ID de proyecto requerido'
      });
    }
    const project = await ProjectsModel.findByPk(req.params.id, {
      include: [
        {
          model: CompaniesModel,
          as: 'company_profile',
          attributes: ['id'],
          include: [
            {
              model: UsersModel,
              attributes: ['id', 'name'], 
            }
          ]
        },
        {
          model: CategorieModel,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    
    return res.status(200).json({
      error: false,
      data: project
    });
  } catch (error) {
    console.error('Error al obtener proyecto por id:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
};