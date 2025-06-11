import AdminsModel from '../models/AdminsModel.js';
import ProjectsModel from '../models/ProjectsModel.js';
import CompaniesModel from '../models/CompaniesModel.js';
import CategoriesModel from '../models/CategoriesModel.js';
import UsersModel from '../models/UsersModel.js';
import NotificationsModel from "../models/NotificationsModel.js";
import updateImage from "./ImagesController.js";
import RolesModel from '../models/RolesModel.js';
import signImage from "../helpers/signImage.js";
import { sendProjectStatusEmail, sendReactivationEmail, sendReportReplyEmail, sendWelcomeEmail } from '../services/emailService.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { requestPasswordRecovery } from "../services/passwordRecoveryService.js";
import ReportsModel from "../models/ReportsModel.js";
import { adminSchema, adminUpdateSchema, schemaParams, schemaBody } from "../validations/adminSchema.js";
import { confirmEmailService, emailVerificationService } from "../helpers/emailVerification.js";

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
        message: 'El nombre completo es requerido para generar un nombre de usuario',
        status: 400
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
      },
      status: 200
    });
  } catch (error) {
    console.error('Error al generar nombre de usuario:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      status: 500
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

  if (!req.user || req.user.role !== 'SuperAdministrador') {
      return res.status(403).json({
        error: true,
        message: 'No tienes permisos para crear administradores. Solo el superAdministrador puede realizar esta acción.',
        status: 403
      });
    }

    const { error, value } = adminSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      
      return res.status(400).json({
        error: true,
        message: 'Error de validación',
        errors,
        status: 400
      });
    }

    const { full_name, phone, email, password, image, role, username: customUsername, url_base } = value;

    if (!url_base) {
      return res.status(400).json({
        error: true,
        message: 'La URL base para restablecer la contraseña es requerida (url_base)',
        status: 400
      });
    }

    const existingEmail = await AdminsModel.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        error: true,
        message: 'Este correo electrónico ya está registrado',
        status: 400
      });
    }
    const existingFullName = await AdminsModel.findOne({ where: { full_name } });
    if (existingFullName) {
      return res.status(400).json({
        error: true,
        message: 'Este nombre completo ya está registrado. Por favor, utiliza un nombre diferente.',
        status: 400
      });
    }

    let roleId = null;
    if (role !== undefined) {
      let roleRecord;

      if (typeof role === 'number') {
        roleRecord = await RolesModel.findByPk(role);
      } else if (typeof role === 'string') {
        roleRecord = await RolesModel.findOne({ where: { role_name: role } });
      }

      if (!roleRecord) {
        return res.status(400).json({
          error: true,
          message: 'El rol especificado no existe en la base de datos.',
          status: 400
        });
      }

      roleId = roleRecord.id;
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
          status: 400
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
      image: image,
      status: 'active',
      role_id: roleId,
      url_base
    });

    const resetToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    const resetLink = `${url_base}${resetToken}`;

    const verificationCode = await emailVerificationService(email);
    await sendWelcomeEmail(email, full_name, username, resetLink);



    const adminResponse = {
      ...newAdmin.get(),
      password: undefined
    };
    
    return res.status(201).json({
      error: false,
      message: 'Admin creado exitosamente',
      data: adminResponse,
      status: 201
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
        errors,
        status: 400
      });
    }
    
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      status: 500
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
    const admins = await AdminsModel.findAll({
      attributes: {
        exclude: ['password', 'createdAt']
      },
      order: [['createdAt', 'DESC']]
    })

    const adminsWithImage = await Promise.all(
      admins.map(async (admin) => {
        
        const imageUrl = await signImage(admin.image)

        return {
          ...admin.dataValues,
          image: imageUrl 
        }
      })
    )

    res
      .status(200)
      .json({
        status: 200,
        message: "Admins retrieved successfully",
        admins: adminsWithImage
      })
  } catch (error) {
    console.error('Error al obtener admins:', error);
    return res.status(500).json({ 
      error: true,
      message: 'Error interno del servidor' ,
      status: 500
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

    if (!req.params.id) {
      return res.status(400).json({
        error: true,
        message: 'ID de administrador requerido',
        status: 400
      });
    }

    const admin = await AdminsModel.findByPk(req.params.id);

    if (!admin) {
      return res.status(400).json({
        error: true,
        message: 'Administrador no encontrado',
        status: 400
      });
    }

    const imageUrl = await signImage(admin.image)

    const adminWithImage = {
      ...admin.dataValues,
      image: imageUrl
    }

    return res.status(200).json({
      error: false,
      message: 'Admin retrieved successfully',
      status: 200,
      data: adminWithImage
    });
  } catch (error) {
    console.error('Error al obtener admin por id:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      status: 500
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

   if (!req.user) {
      return res.status(401).json({
        error: true,
        message: 'No autenticado',
        status: 401
      });
    }

    if (!req.params.id) {
      return res.status(400).json({
        error: true,
        message: 'ID de administrador requerido',
        status: 400
      });
    }

    const admin = await AdminsModel.findByPk(req.params.id);
    if (!admin) {
      return res.status(404).json({
        error: true,
        message: 'Administrador no encontrado',
        status: 404
      });
    }

  const { error, value } = adminUpdateSchema.validate(req.body, { abortEarly: false });
  if (error) {
   
    const messages = error.details.map(detail => detail.message);

    return res.status(400).json({
      error: true,
      message: 'Error de validación',
      errors: messages,
      status: 400
    });
  }



    const { full_name, phone, email, password, image, status, role, username: customUsername } = value;
    
  if (email && req.user.role_id !== 4) {
    return res.status(403).json({
      error: true,
      message: 'No está permitido modificar el email siendo administrador',
      error_code: 'EMAIL_MODIFICATION_NOT_ALLOWED',
      status: 403
    });
  }

    if (full_name && full_name !== admin.full_name) {
      const existingFullName = await AdminsModel.findOne({ where: { full_name } });
      if (existingFullName) {
        return res.status(400).json({
          error: true,
          message: 'Este nombre completo ya está registrado. Por favor, utiliza un nombre diferente.',
          status: 400
        });
      }
    }

    let roleId = admin.role_id;
        if (role !== undefined) {
          let roleRecord;

          if (typeof role === 'number') {
            roleRecord = await RolesModel.findByPk(role);
          } else if (typeof role === 'string') {
            roleRecord = await RolesModel.findOne({ where: { role_name: role } });
          }

          if (!roleRecord) {
            return res.status(400).json({
              error: true,
              message: 'El rol especificado no existe en la base de datos.',
              status: 400
            });
          }

          roleId = roleRecord.id;
        }


     let username = customUsername || admin.username;
    if (customUsername && customUsername !== admin.username) {
      const existingUser = await AdminsModel.findOne({ where: { username: customUsername } });
      if (existingUser) {
        return res.status(400).json({
          error: true,
          message: 'El nombre de usuario ya está en uso. Por favor, elige otro.',
          status: 400
        });
      }
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
    admin.role_id = roleId;

    await admin.save();

    const adminResponse = {
      ...admin.get(),
      password: undefined
    };

    return res.status(200).json({
      error: false,
      message: 'Administrador actualizado exitosamente',
      data: adminResponse,
      status: 200
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
        errors,
        status: 400
      });
    }
    
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      status: 500
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
        message: 'ID de administrador no proporcionado',
        status: 400
      });
    }

    const admin = await AdminsModel.findByPk(id);

    if (!admin) {
      return res.status(404).json({
        error: true,
        message: 'Administrador no encontrado',
        status: 400
      });
    }

    admin.status = 'inactive';
    await admin.save();

    return res.status(200).json({
      error: false,
      message: 'Administrador desactivado exitosamente',
      status: 200
    });

  } catch (error) {
    console.error('Error al desactivar admin:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      status: 500
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
      data: projects,
      status: 200
    });
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      status: 500
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
        message: 'Debe proporcionar al menos un criterio de búsqueda (company_name, project_name o category_id)',
        status: 400
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
      message: 'Error interno del servidor',
      status: 500
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
        message: 'ID de proyecto requerido',
        status: 400
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
      return res.status(404).json({ message: 'Proyecto no encontrado', status: 404 });
    }
    
    return res.status(200).json({
      error: false,
      data: project,
      status: 200
    });
  } catch (error) {
    console.error('Error al obtener proyecto por id:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      status: 500
    });
  }
};

export const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;

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

    if (project.status !== 0) {
      return res.status(403).json({
        message: 'Solo se pueden actualizar los estados de proyectos que estén en "Pendiente".',
        currentStatus: project.status,
        status: 403
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

/**
 * upload image
 *
 * function to upload image
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} image uploaded
 */
export const uploadImageAdmin = async (req, res) => {
  updateImage(req, res, AdminsModel);
};

/**
 * reactivate admin
 *
 * function to reactivate an inactive admin and send temporary password email
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} admin reactivated status
 */

export const reactivateAdmin = async (req, res) => {
  try {

    console.log("Usuario autenticado:", req.user);
    if (!req.user || req.user.role !== 'SuperAdministrador') {
      return res.status(403).json({
        error: true,
        message: 'No tienes permisos para Reactivar administradores. Solo el superAdministrador puede realizar esta acción.',
        status: 403
      });
    }
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: true,
        message: 'ID de administrador no proporcionado',
        status: 400
      });
    }

    const admin = await AdminsModel.findByPk(id);

    if (!admin) {
      return res.status(404).json({
        error: true,
        message: 'Administrador no encontrado',
        status: 404
      });
    }

    if (admin.status === 'active') {
      return res.status(400).json({
        error: true,
        message: 'El administrador ya se encuentra activo',
        status: 400
      });
    }

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const length = Math.floor(Math.random() * 5) + 8; // Entre 8 y 12 caracteres
    let tempPassword = '';
    
    for (let i = 0; i < length; i++) {
      tempPassword += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24);

    admin.status = 'active';
    admin.password = hashedPassword;
    admin.password_expires_at = expirationDate;
    admin.password_change_required = true; 
    await admin.save();
    
    try {
      await sendReactivationEmail({
        email: admin.email,
        name: admin.full_name,
        tempPassword: tempPassword,
        expirationHours: 24
      });
      
      return res.status(200).json({
        error: false,
        message: 'Administrador reactivado exitosamente. Se ha enviado un correo con la contraseña temporal válida por 24 horas.',
        status: 200
      });
    } catch (emailError) {
      console.error('Error al enviar correo de reactivación:', emailError);

      return res.status(200).json({
        error: false,
        message: 'Administrador reactivado exitosamente, pero hubo un problema al enviar el correo con la contraseña temporal.',
        status: 200
      });
    }
  } catch (error) {
    console.error('Error al reactivar admin:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      status: 500
    });
  }
};

/**
 * send password recovery email
 * 
 * function to send password recovery email
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} admin recovered
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email, url_base } = req.body;

    if (!email || !url_base) {
      return res.status(400).json({
        message: 'Correo y url_base son requeridos',
        status: 400
      });
    }

    const admin = await AdminsModel.findOne({ where: { email } });

    if (!admin) {
      return res.status(400).json({
        message: 'Correo no encontrado',
        status: 400
      });
    }

    const response = await requestPasswordRecovery(email, url_base);

    if (response.status === 200) {
      return res.status(200).json({
        message: 'Código de recuperación enviado',
        email: admin.email,
        code: response.code, 
        status: 200
      });
    } else {
      return res.status(response.status).json({
        message: response.message,
        status: response.status
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error al enviar el correo de recuperación',
      error: error.message,
      status: 500
    });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body

    if (!email || !code || !password) {
      return res.status(400).json({
        message: 'Error de validación',
        error: error.message,
        status: 400
      });
    }
    else {
      const response = await confirmEmailService(email, code)

      if (response.status === 200) {
        const admin = await AdminsModel.findOne({ where: { email } })

        if (!admin) {
          return res.status(400).json({
            message: 'Correo no encontrado',
            error: error.message,
            status: 400
          });
        }
        else {
          const hashedPassword = await bcrypt.hash(password, 10);

          admin.password = hashedPassword

          await admin.save()
          res.status(200).json({
            message: 'Contraseña actualizada correctamente',
            admin: admin,
            status: 200
          })
        }
      }
      else {
        res.status(response.status)
        .json({
          message: response.message,
          status: response.status
        })
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ 
        status: 500,
        message: "Error al actualizar la contraseña", error: error.message 
      })
  }
}

/**
 * getAllUserReportsForAdmin
 * Get all reports created by all users (admin only).
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} The response object.
 */
export const getAllUserReportsForAdmin = async (req, res) => {
  try {

    const { status, user_role, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (user_role) where.user_role = user_role;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const translateUserRole = (role) => {
      const roleNum = Number(role);
      if (roleNum === 1) return 'Company';
      if (roleNum === 2) return 'Developer';
      return 'Desconocido';
    };

    const reports = await ReportsModel.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: UsersModel, as: 'reporter', attributes: ['id', 'name', 'email'] },
        { model: UsersModel, as: 'reportedUser', attributes: ['id', 'name', 'email'] },
        { model: ProjectsModel, as: 'project', attributes: ['id', 'project_name'] }
      ]
    });

    return res.json({
      data: reports.rows.map(report => ({
        id: report.id,
        reporter_id: report.reporter_id,
        reporter_name: report.reporter?.name || null,
        reporter_email: report.reporter?.email || null,
        reportedUser_id: report.user_id,
        reportedUser_name: report.reportedUser?.name || null,
        reportedUser_email: report.reportedUser?.email || null,
        user_role: translateUserRole(report.user_role),
        project_id: report.project_id,
        project_name: report.project?.project_name || null,
        reason: report.reason,
        comment: report.comment,
        status: report.status,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
      })),
      total: reports.count,
      page: parseInt(page),
      totalPages: Math.ceil(reports.count / parseInt(limit)),
    });

  } catch (err) {
    console.error('Error al obtener reportes como administrador:', err);
    res.status(500).json({ error: 'No se pudieron obtener los reportes.' });
  }
};
/**
 * respondToReport
 * Admin responde un reporte, actualiza su estado y notifica por correo.
 * @param {object} req
 * @param {object} res
 * @returns {object}
 */

export const respondToReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { responseMessage, newStatus } = req.body;

    if (!['Resuelto', 'Rechazado'].includes(newStatus)) {
      return res.status(400).json({ error: 'Estado inválido. Debe ser "resuelto" o "rechazado".' });
    }

    const report = await ReportsModel.findOne({
      where: { id },
      include: [{ model: UsersModel, as: 'reporter', attributes: ['email', 'name'] }]
    });

    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado.' });
    }

    if (report.status !== 'Pendiente') {
      return res.status(400).json({ error: 'Este reporte ya ha sido atendido.' });
    }

    await report.update({
      status: newStatus,
      admin_response: responseMessage
    });

    await sendReportReplyEmail({
      to: report.reporter.email,
      name: report.reporter.name,
      reportId: report.id,
      newStatus,
      responseMessage
    });

    res.json({ message: 'Reporte respondido y correo enviado correctamente.' });

  } catch (err) {
    console.error('Error al responder el reporte:', err);
    res.status(500).json({ error: 'No se pudo responder el reporte.' });
  }
};

