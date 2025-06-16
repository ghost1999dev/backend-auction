import ProjectApplicationsModel from "../models/ProjectApplicationsModel.js";
import ProjectsModel from "../models/ProjectsModel.js";
import UsersModel from "../models/UsersModel.js";
import DevelopersModel from "../models/DevelopersModel.js";
import CompaniesModel from "../models/CompaniesModel.js";
import CategoriesModel from "../models/CategoriesModel.js";

/**
 * @desc    Crear nueva aplicación a proyecto
 * @route   POST /applications/create
 * @access  Private - Solo desarrolladores
 * @param   {Object} req.body
 * @param   {number} req.body.project_id - ID del proyecto
 * @param   {number} req.body.developer_id - ID del desarrollador
 * @returns {Object} Nueva aplicación creada o mensaje de error
 */
export const createApplication = async (req, res, next) => {
  try {
    const { project_id, developer_id } = req.body;

    if (!project_id || !developer_id) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos",
        error: "missing_fields",
        status: 400
      });
    }

    const project = await ProjectsModel.findOne({
        where: {
          id: project_id,
          status: 1
        }
      })

    const developer = await DevelopersModel.findOne({
        where: {
          id: developer_id
        }
      })

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Proyecto no encontrado",
        error: "project_not_found",
        status: 400
      });
    }

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: "Desarrollador no encontrado",
        error: "developer_not_found",
        status: 400
      });
    }

    const alreadyExists = await ProjectApplicationsModel.findOne({
      where: { project_id, developer_id }
    });

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "Ya existe una aplicación para este proyecto",
        error: "application_exists",
        status: 400
      });
    }

    const applications = await ProjectApplicationsModel.count({
      where: { 
        developer_id,
        status: 0
      },
      include: [{
        model: ProjectsModel,
        as: 'project',
        where: {
          status: 1
        }
      }]
    })

    if (applications >= 5) {
      return res.status(403).json({
        success: false,
        message: "Ha alcanzado el límite de aplicaciones en curso",
        error: "applications_limit",
        status: 403
      });
    }

    const app = await ProjectApplicationsModel.create({
      project_id,
      developer_id
    });

    return res.status(201).json({
      success: true,
      message: "Aplicación creada exitosamente",
      data: app,
      status: 201
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear la aplicación",
      error: error.message,
      status: 500
    });
  }
};

/**
 * @desc    Listar aplicaciones con filtros opcionales
 * @route   GET /applications
 * @param   {Object} req.query.developer_id - Filtrar por desarrollador
 * @param   {Object} req.query.project_id - Filtrar por proyecto
 * @param   {Object} req.query.status - Filtrar por estado
 */
export const listApplications = async (req, res, next) => {
  try {
    const applications = await ProjectApplicationsModel.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {                      
          model: UsersModel,
          as: "developer",
          attributes: {
            exclude: ['password']
          }
        },
        {                   
          model: ProjectsModel,
          as: "project",
          include: [
            {
              model: CompaniesModel,
              as: 'company_profile'
            },
            {
              model: CategoriesModel,
              as: 'category',
            }
          ]
        }
      ]
    });

    const projectDaysRemaining = applications.map(application => {
      let daysRemaining = null;

      if (application.project.status === 1) {
        const activatedAt = new Date(application.project.updatedAt);
        const today = new Date();

        const msInDay = 24 * 60 * 60 * 1000;
        const elapsedDays = Math.floor((today - activatedAt) / msInDay);
        daysRemaining = application.project.days_available - elapsedDays;

        if (daysRemaining < 0) daysRemaining = 0;
      }

      return {
        ...application.get({ plain: true }), 
        project: {
          ...application.project.get({ plain: true }),
          days_remaining: daysRemaining
        }
      };
    })

    res.status(200).json({
      success: true,
      message: "Aplicaciones obtenidas exitosamente",
      applications: projectDaysRemaining
    })

  } catch (error) { 
    res.status(500).json({
      success: false,
      message: "Error al obtener las aplicaciones",
      error: error.message,
      status: 500
    });
   }
};


/**
 * @desc    Obtener una aplicación por ID
 * @route   GET /applications/:id
 * @param   {string} req.params.id - ID de la aplicación
 */
export const getApplication = async (req, res, next) => {
  try {
    const application = await ProjectApplicationsModel.findByPk(req.params.id, {
      include: [
        { 
          model: ProjectsModel,
          as: 'project',
          include: [{
            model: CompaniesModel,
            as: 'company_profile'
          },{
            model: CategoriesModel,
            as: 'category'
          }]
        },
        { 
          model: UsersModel,
          as: 'developer'
        }
      ]
    });

    const projectDaysRemaining = () => {
      let daysRemaining = null;

      if (application.project.status === 1) {
        const activatedAt = new Date(application.project.updatedAt);
        const today = new Date();

        const msInDay = 24 * 60 * 60 * 1000;
        const elapsedDays = Math.floor((today - activatedAt) / msInDay);
        daysRemaining = application.project.days_available - elapsedDays;

        if (daysRemaining < 0) daysRemaining = 0;
      }

      return {
        ...application.get({ plain: true }), 
        project: {
          ...application.project.get({ plain: true }),
          days_remaining: daysRemaining
        }
      };
    }

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Aplicación no encontrada",
        status: 404
      });
    }

    res.json({
      success: true,
      application: projectDaysRemaining(),
      status: 200
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener la aplicación",
      error: error.message,
      status: 500
    });
  }
};

/**
 * @desc    Eliminar una aplicación
 * @route   DELETE /applications/:id
 * @param   {string} req.params.id - ID de la aplicación
 */
export const deleteApplication = async (req, res, next) => {
  try {
    const app = await ProjectApplicationsModel.findByPk(req.params.id);
    if (!app) {
      return res.status(404).json({ 
        success: false,
        message: "Aplicación no encontrada",
        status: 404
      });
    }

    await app.destroy();
    res.json({
      success: true,
      message: "Aplicación eliminada exitosamente",
      status: 200
    });
  } catch (error) { 
    res.status(500).json({
      success: false,
      message: "Error al eliminar la aplicación",
      error: error.message,
      status: 500
    });
  }
};

/**
 * @desc    Contar las aplicaciones de un desarrollador
 * @route   GET /applications/counter/:developer_id
 * @param   {string} req.params.developer_id - ID del desarrollador
 * @returns {Object} Contador de aplicaciones
 */
export const applicationsCounterByDeveloper = async (req, res) => {
  try {
    const { developer_id } = req.params;

    if (!developer_id) {
      return res.status(400).json({
        status: 400,
        message: "Falta el ID del desarrollador",
        error: "missing_fields"
      })
    }

    const developer = await UsersModel.findByPk(developer_id)

    if (!developer) {
      return res.status(404).json({
        status: 404,
        message: "Desarrollador no encontrado",
        error: error.message
      })
    }
    
    const applications = await ProjectApplicationsModel.count({
      where: { 
        developer_id
      },
      include: [{
        model: ProjectsModel,
        as: 'project',
        where: {
          status: 1
        }
      }]
    })

    if (applications <= 0) {
      return res.status(404).json({
        status: 404,
        message: "No se encontraron aplicaciones para este desarrollador",
        applications
      })
    }

    res.status(200).json({
      status: 200,
      message: "Aplicaciones contadas exitosamente",
      applications
    })
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error al contar las aplicaciones",
      error: error.message
    });
  }
}

/**
 * projects application by developer
 * 
 * function to get projects applications by developer
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} projects applications
 */
export const getProjectsApplicationsByDeveloper = async (req, res) => {
  try {
    const { developer_id } = req.params

    if (!developer_id) {
      return res.status(400).json({
        status: 400,
        message: 'ID de desarrollador requerido',
        error: 'missing_fields'
      });
    }

    const developer = await DevelopersModel.findOne({
      where: { 
        id: developer_id
      }
    })

    if (!developer) {
      return res.status(404).json({
        status: 404,
        message: 'Desarrollador no encontrado',
        error: 'developer_not_found'
      });
    }

    const applications = await ProjectApplicationsModel.findAll({
      where: {
        developer_id 
      },
      include: [{
        model: ProjectsModel,
        as: 'project',
        where: {
          status: 1
        },
        include: [{
          model: CompaniesModel,
          as: 'company_profile',
          include: [{
            model: UsersModel,
            attributes: ['id', 'name', 'email', 'phone']
          }] 
        },{
          model: CategoriesModel,
          as: 'category',
          attributes: ['id', 'name']
        }]
      }]
    })

    if (applications.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'No se encontraron aplicaciones para este desarrollador',
        error: 'applications_not_found'
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Aplicaciones obtenidas exitosamente',
      applications
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Error al obtener las aplicaciones',
      error: error.message
    });
  }
}

export const updateStatusApplication = async (req, res) => {
  const { id } = req.params
  const { newStatus } = req.body

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Falta el ID de la aplicación",
      error: "missing_fields",
      status: 400
    })
  }

  if (!newStatus) {
    return res.status(400).json({
      success: false,
      message: "Falta el estado de la aplicación",
      error: "missing_fields",
      status: 400
    })
  }

  if (newStatus === 0){
    return res.status(400).json({
      success: false,
      message: "Estado no valido",
      status: 400
    })
  }

  try {
    const application = await ProjectApplicationsModel.findByPk(id)
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Aplicación no encontrada",
        error: "application_not_found",
        status: 400
      })
    }

    application.status = newStatus
    await application.save()

    res.json({
      success: true,
      message: "Estado actualizado exitosamente",
      status: 200
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar el estado de la aplicación",
      error: error.message,
      status: 500
    })
  }
}