import AdminsModel from '../models/AdminsModel.js';
import ProjectsModel from '../models/ProjectsModel.js';
import CompaniesModel from '../models/CompaniesModel.js';
import CategoriesModel from '../models/CategoriesModel.js';
import UsersModel from '../models/UsersModel.js';
import NotificationsModel from "../models/NotificationsModel.js";
import RolesModel from '../models/RolesModel.js';
import { sendProjectStatusEmail } from '../services/emailService.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import Joi from 'joi';

/**
 * generate username
 *
 * function to suggest a username based on full_name
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} suggested username
 */
export const generateUsername = async (req, res) => {
  try {
    const { full_name } = req.body;
    
    if (!full_name) {
      return res.status(400).json({
        error: true,
        message: 'El nombre completo es requerido para generar un nombre de usuario'
      });
    }  
    let username = full_name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 10); 
    
    
    const existingUser = await AdminsModel.findOne({ where: { username } });
    
    if (existingUser) {      
      const randomNum = Math.floor(Math.random() * 1000);      
      username = `${username.substring(0, 7)}${randomNum}`.substring(0, 10);
    }
    
    return res.status(200).json({
      error: false,
      data: {
        suggested_username: username
      }
    });
  } catch (error) {
    console.error('Error al generar nombre de usuario:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    });
  }
};

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

    console.log("Usuario autenticado:", req.user);


    if (!req.user || req.user.role !== 'SuperAdministrador') {
      return res.status(403).json({
        error: true,
        message: 'No tienes permisos para crear administradores. Solo el superAdministrador puede realizar esta acción.'
      });
    }

    const { full_name, phone, email, password, image, role, username: customUsername } = req.body;

      const requiredFields = { full_name, phone, email, password };
      const missingFields = Object.keys(requiredFields).filter(field => !requiredFields[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: true,
          message: 'Campos requeridos faltantes', 
          missingFields 
        });
      }

      const validRoles = ['Administrador', 'SuperAdministrador'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        error: true,
        message: 'Rol inválido. Los roles permitidos son: Administrador, SuperAdministrador',
      });
    }  

    let roleId;
    if (role) {
      const roleRecord = await RolesModel.findOne({ where: { role_name: role } });
      if (!roleRecord) {
        return res.status(400).json({
          error: true,
          message: 'El rol especificado no existe en la base de datos.',
        });
      }
      roleId = roleRecord.id; // Asignar role_id según el nombre del rol
    } else {
      // Si no se pasa rol, asignamos 'Administrador' por defecto
      roleId = 3; // ID para 'Administrador'
    }

    let username = customUsername;
    
    if (!username) {
      
      username = full_name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '') 
        .substring(0, 10); 
    
   
      const existingUser = await AdminsModel.findOne({ where: { username } });
      
      if (existingUser) {      
        const randomNum = Math.floor(Math.random() * 1000);      
        username = `${username.substring(0, 7)}${randomNum}`.substring(0, 10);
      }
    } else {
           const existingUser = await AdminsModel.findOne({ where: { username } });
      
      if (existingUser) {
        return res.status(400).json({
          error: true,
          message: 'El nombre de usuario ya está en uso. Por favor, elige otro.',
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await AdminsModel.create({
      full_name,
      phone,
      email,
      username,
      password: hashedPassword,
      image,
      status: 'active',
      role_id: roleId
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
    const admins = await AdminsModel.findAll();
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

    const admin = await AdminsModel.findByPk(req.params.id);

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

    const admin = await AdminsModel.findByPk(req.params.id);

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
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: true,
        message: 'ID de administrador no proporcionado'
      });
    }

    const admin = await AdminsModel.findByPk(id);

    if (!admin) {
      return res.status(404).json({
        error: true,
        message: 'Administrador no encontrado'
      });
    }

    admin.status = 'inactive';
    await admin.save();

    return res.status(200).json({
      error: false,
      message: 'Administrador desactivado exitosamente'
    });

  } catch (error) {
    console.error('Error al desactivar admin:', error);
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
        model: CategoriesModel,
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
          model: CategoriesModel,
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

export const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;

    const schemaParams = Joi.object({
      id: Joi.number().positive().required().messages({
        'any.required': 'ID de proyecto requerido',
        'number.base': 'El ID debe ser un número',
        'number.positive': 'El ID debe ser un número positivo'
      })
    });

    const schemaBody = Joi.object({
      newStatus: Joi.number().valid(0, 1, 3, 4).required().messages({
        'any.required': 'El nuevo estado es obligatorio',
        'number.base': 'El estado debe ser un número',
        'any.only': 'El estado debe ser uno de los siguientes valores: 0, 1, 3, 4'
      })
    });

    const validateParams = schemaParams.validate(req.params);
    const validateBody = schemaBody.validate(req.body);

    if (validateParams.error || validateBody.error) {
      return res.status(400).json({
        message: "Error de validación",
        details: [
          ...(validateParams.error ? validateParams.error.details.map(d => d.message) : []),
          ...(validateBody.error ? validateBody.error.details.map(d => d.message) : [])
        ],
        status: 400
      });
    }

    const project = await ProjectsModel.findByPk(id, {
      include: {
        model: CompaniesModel,
        as: 'company_profile',
        include: {
          model: UsersModel,
          attributes: ['id', 'name', 'email']
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        message: 'Proyecto no encontrado',
        status: 404
      });
    }

    project.status = newStatus;
    await project.save();

    const estados = {
      0: 'Pendiente',
      1: 'Activo',
      3: 'Rechazado',
      4: 'Finalizado'
    };

    const user = project.company_profile?.user;

    if (user) {
      console.log('Enviando notificación con:', {
        user_id: user.id,
        title: 'Actualización del estado de tu proyecto',
        body: `Tu proyecto "${project.project_name}" ha sido marcado como "${estados[newStatus]}".`
      });

      await NotificationsModel.create({
        user_id: user.id,
        title: 'Actualización del estado de tu proyecto',
        body: `Tu proyecto "${project.project_name}" ha sido marcado como "${estados[newStatus]}".`,
        context: {
          projectId: project.id,
          status: newStatus
        },
        sent_at: new Date(),
        status: estados[newStatus]
      });
      // Enviar correo electrónico al usuario
      try {
        await sendProjectStatusEmail({
          email: user.email,
          name: user.name,
          projectName: project.project_name,
          statusName: estados[newStatus],
          status: newStatus
        });
        console.log(`Correo electrónico enviado a ${user.email}`);
      }
      catch (emailError) {
        console.error('Error al enviar el correo electrónico:', emailError);
       
      }
    } else {
      console.warn('No se encontró el usuario para enviar la notificación');
    }

    return res.status(200).json({
      message: `Estado del proyecto actualizado a ${newStatus}`,
      status: 200,
      project
    });
  } catch (error) {
    console.error('Error al actualizar estado del proyecto:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
  

  
};