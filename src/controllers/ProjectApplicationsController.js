import ProjectApplicationsModel from "../models/ProjectApplicationsModel.js";
import ProjectsModel from "../models/ProjectsModel.js";
import UsersModel from "../models/UsersModel.js";
import DevelopersModel from "../models/DevelopersModel.js";
import CompaniesModel from "../models/CompaniesModel.js";
import CategoriesModel from "../models/CategoriesModel.js";

const APPLICATION_STATUS = {
  PENDING:  0,
  ACCEPTED: 1,
  REJECTED: 2
};

const VALID_TRANSITIONS = {
  [APPLICATION_STATUS.PENDING]:  [APPLICATION_STATUS.ACCEPTED, APPLICATION_STATUS.REJECTED],
  [APPLICATION_STATUS.ACCEPTED]:  [],
  [APPLICATION_STATUS.REJECTED]:  []
};

/**
 * @desc    Validar transición de estado para una aplicación
 * @param   {number} currentStatus - Estado actual
 * @param   {number} newStatus - Estado propuesto
 * @returns {boolean} True si la transición es válida
 */
const isValidTransition = (currentStatus, newStatus) => {
  return VALID_TRANSITIONS[currentStatus]?.includes(newStatus);
};

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
        error: "missing_fields"
      });
    }

    const [project, developer] = await Promise.all([
      ProjectsModel.findByPk(project_id),
      DevelopersModel.findByPk({
        where: {
          id: developer_id
        }
      })
    ]);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Proyecto no encontrado",
        error: "project_not_found"
      });
    }

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: "Desarrollador no encontrado",
        error: "developer_not_found"
      });
    }

    const alreadyExists = await ProjectApplicationsModel.findOne({
      where: { project_id, developer_id }
    });

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "Ya existe una aplicación para este proyecto",
        error: "application_exists"
      });
    }

    const applications = await ProjectApplicationsModel.count({
      where: { 
        developer_id,
        status: 1 
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
        error: "applications_limit"
      });
    }

    const app = await ProjectApplicationsModel.create({
      project_id,
      developer_id,
      status: APPLICATION_STATUS.PENDING
    });

    return res.status(201).json({
      success: true,
      message: "Aplicación creada exitosamente",
      data: app
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear la aplicación",
      error: error.message
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
    const { developer_id, project_id, status } = req.query;
    const filters = {};
    if (developer_id) filters.developer_id = developer_id;
    if (project_id)   filters.project_id   = project_id;
    if (status !== undefined) {
      const s = Number(status);
      if (![0,1,2].includes(s))
        return res.status(422).json({ message: "status debe ser 0, 1 o 2" });
      filters.status = s;
    }

    const applications = await ProjectApplicationsModel.findAll({
      where: filters,
      order: [["createdAt", "DESC"]],
      include: [
        {                   
          model: ProjectsModel,
          as: "project",
          attributes: ["id", "project_name", "description"]
        },
        {                      
          model: UsersModel,
          as: "developer",
          attributes: ["id", "name", "email"] 
        }
      ]
    });

    res.json(applications);

  } catch (err) { next(err); }
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
          required: false,
          attributes: ['id', 'project_name', 'description']
        },
        { 
          model: UsersModel,
          as: 'developer',
          required: false,
          attributes: ['id', 'user_name', 'email']
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Aplicación no encontrada"
      });
    }

    return res.json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar estado de una aplicación
 * @route   PUT /applications/:id
 * @param   {string} req.params.id - ID de la aplicación
 * @param   {Object} req.body - Datos a actualizar
 */
export const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const app = await ProjectApplicationsModel.findByPk(id);
    if (!app) {
      return res.status(404).json({
        success: false,
        message: "Aplicación no encontrada"
      });
    }

    const newStatus = Number(status);
    if (Number.isNaN(newStatus) || !Object.values(APPLICATION_STATUS).includes(newStatus)) {
      return res.status(422).json({
        success: false,
        message: "status debe ser 0 (pending), 1 (accepted) o 2 (rejected)"
      });
    }

    if (!isValidTransition(app.status, newStatus)) {
      return res.status(422).json({
        success: false,
        message: `Transición no permitida: ${app.status} → ${newStatus}`
      });
    }

    await app.update({ status: newStatus });
    res.json({ success: true, data: app });

  } catch (error) {
    next(error);
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
        message: "Aplicación no encontrada"
      });
    }

    await app.destroy();
    res.json({
      success: true,
      message: "Aplicación eliminada exitosamente"
    });
  } catch (e) { 
    next(e);
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
        developer_id,
        status: 1 
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
        status: 1,
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