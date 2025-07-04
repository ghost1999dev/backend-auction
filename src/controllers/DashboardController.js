import Sequelize from "sequelize";
import sequelize from "../config/connection.js";
import UsersModel from "../models/UsersModel.js";
import CompaniesModel from "../models/CompaniesModel.js";
import ProjectsModel from "../models/ProjectsModel.js";
import DevelopersModel from "../models/DevelopersModel.js";
import ReportsModel from "../models/ReportsModel.js";
import CategoriesModel from "../models/CategoriesModel.js";
import AdminsModel from "../models/AdminsModel.js";
import RatingModel from "../models/RatingModel.js";
import ProjectApplicationsModel from "../models/ProjectApplicationsModel.js";
import FavoriteProjectsModel from "../models/FavoriteProjectsModel.js";
const ROLE_MAP = {
  1: 'Company',
  2: 'Developer'
};


/**
 * Count active companies
 * 
 * Function to count the number of active companies
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} count of active companies  
 */
export const countActiveCompanies = async (req, res) => {
  try {
    const companiesCount = await UsersModel.count({
      where: { status: 1 },
      include: [{
        model: CompaniesModel,
        as: 'company_profile',
        required: true
      }]
    })
    return res.status(200).json({
      companiesCount,
      message: 'Conteo de empresas activas exitosamente',
      status: 200
    })
  } catch (error) {
    console.error('Error en conteo:', error)
    return res.status(500).json({ error: 'Error al obtener conteos' })
  }
}
/**
 * Count active developers
 * 
 * Function to count the number of active developers
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} count of active developers  
 */
export const countActiveDevelopers = async (req, res) => {
  try {
    const developersCount = await UsersModel.count({
      where: { status: 1 },
      include: [{
        model: DevelopersModel,
        as: 'dev_profile',
        required: true
      }]
    })
    return res.status(200).json({
      developersCount,
      message: 'Conteo de developers activos exitosamente',
      status: 200
    })
  } catch (error) {
    console.error('Error en conteo:', error)
    return res.status(500).json({ error: 'Error al obtener conteos' })
  }
}
/**
 * Count projects by status
 * 
 * Function to count the number of projects by status
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} count of projects by status  
 */ 
export const countProjectsByStatus = async (req, res) => {
  try {
    const projects = await ProjectsModel.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const statusMap = {
      0: "Pendiente",
      1: "Activo",
      2: "Inactivo",
      3: "Rechazado",
      4: "Finalizado"
    };

    const result = {};
    Object.values(statusMap).forEach(statusText => {
      result[statusText] = 0;
    });

    projects.forEach(project => {
      const status = project.getDataValue('status');
      const count = parseInt(project.getDataValue('count'), 10);
      const label = statusMap[status] || `Desconocido (${status})`;
      result[label] = count;
    });

    return res.status(200).json({
      statusCounts: result,
      message: 'Conteo de proyectos por estado exitoso',
      status: 200
    });

  } catch (error) {
    console.error('Error al obtener conteo de proyectos:', error);
    return res.status(500).json({
      error: 'Error al obtener conteo de proyectos'
    });
  }
};
/**
 * Count reports by status
 * 
 * Function to count the number of reports by status
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} count of reports by status  
 */
export const countReportsByStatus = async (req, res) => {
  try {
    const reports = await ReportsModel.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const statusLabels = ["Pendiente", "Resuelto", "Rechazado"];

    const result = {};
    statusLabels.forEach(label => {
      result[label] = 0;
    });

    reports.forEach(report => {
      const status = report.getDataValue('status');
      const count = parseInt(report.getDataValue('count'), 10);
      result[status] = count;
    });

    return res.status(200).json({
      statusCounts: result,
      message: "Conteo de reportes por estado exitoso",
      status: 200
    });

  } catch (error) {
    console.error("Error al obtener conteo de reportes:", error);
    return res.status(500).json({
      error: "Error al obtener conteo de reportes"
    });
  }
};
/**
 * Count total categories
 * 
 * Function to count the total number of categories
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} count of total categories  
 */
export const countTotalCategories = async (req, res) => {
  try {
    const totalCategories = await CategoriesModel.count();

    return res.status(200).json({
      total: totalCategories,
      message: "Total de categorías obtenido exitosamente",
      status: 200
    });
  } catch (error) {
    console.error("Error al obtener total de categorías:", error);
    return res.status(500).json({
      error: "Error al obtener total de categorías"
    });
  }
};
/**
 * Count admins by status
 * 
 * Function to count the number of admins by status
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} count of admins by status  
 */
export const countAdminsByStatus = async (req, res) => {
  try {
    const admins = await AdminsModel.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const statusLabels = ['active', 'inactive'];
    const result = {};
    statusLabels.forEach(status => result[status] = 0);

    admins.forEach(admin => {
      const status = admin.getDataValue('status');
      const count = parseInt(admin.getDataValue('count'), 10);
      result[status] = count;
    });

    return res.status(200).json({
      statusCounts: result,
      message: "Conteo de administradores por estado exitoso",
      status: 200
    });
  } catch (error) {
    console.error("Error al obtener conteo de administradores:", error);
    return res.status(500).json({
      error: "Error al obtener conteo de administradores"
    });
  }
};
/**
 * Get ratings distribution
 * 
 * Function to get the ratings distribution
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} ratings distribution
 */
export const getRatingsDistribution = async (req, res) => {
  try {
    const ratingsDistribution = await RatingModel.findAll({
      attributes: ['score', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['score'],
      order: [['score', 'ASC']],
      raw: true,
    });
    res.json(ratingsDistribution);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener distribución de ratings' });
  }
};
/**
 * Get total number of applications
 * 
 * Function to get the total number of applications
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} total number of applications
 */
export const getTotalProjectApplicationsDeveloper = async (req, res) => {
  try {
    const developerId = req.user.id;

    const totalApplications = await ProjectApplicationsModel.count({
      where: { developer_id: developerId }
    });

    res.json({ total: totalApplications });
  } catch (error) {
    console.error('Error al obtener total de aplicaciones:', error);
    res.status(500).json({ message: 'Error al obtener total de aplicaciones' });
  }
};
/**
 * Get total number of favorite projects
 * 
 * Function to get the total number of favorite projects
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} total number of favorite projects
 */
export const getFavoriteProjectsDeveloper = async (req, res) => {
  try {
    const developerId = req.user.id;

    const totalFavorites = await FavoriteProjectsModel.count({
      where: { developer_id: developerId }
    });

    res.json({ total: totalFavorites });
  } catch (error) {
    console.error('Error al obtener total de favoritos:', error);
    res.status(500).json({ message: 'Error al obtener total de favoritos' });
  }
};
/**
 * Get ratings distribution
 * 
 * Function to get the ratings distribution
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} ratings distribution
 */
export const getMyRatingsDistribution = async (req, res) => {
  try {
    const { id, role } = req.user;
    const roleName = ROLE_MAP[role];

    if (!roleName || !['Developer', 'Company'].includes(roleName)) {
      return res.status(400).json({ message: "Rol no válido para obtener ratings" });
    }

    let whereClause = {};
    if (roleName === 'Developer') {
      whereClause.developer_id = id;
    } else if (roleName === 'Company') {
      whereClause.company_id = id;
    }

    const ratings = await RatingModel.findAll({
      where: {
        ...whereClause,
        isVisible: true
      },
      attributes: ['score', [sequelize.fn('COUNT', sequelize.col('score')), 'total']],
      group: ['score'],
      order: [['score', 'ASC']]
    });

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };

    ratings.forEach(r => {
      distribution[r.score] = parseInt(r.dataValues.total);
    });

    res.json({ distribution });
  } catch (error) {
    console.error("Error al obtener distribución de ratings:", error);
    res.status(500).json({ message: "Error al obtener la distribución de ratings" });
  }
};
/**
 * Get my average rating
 * 
 * Function to get my average rating
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} my average rating  
 */
export const getMyAverageRating = async (req, res) => {
  try {
    const { id, role } = req.user;
    const roleName = ROLE_MAP[role];

    if (!roleName || !['Developer', 'Company'].includes(roleName)) {
      return res.status(400).json({ message: "Rol no válido para obtener promedio de ratings" });
    }

    let whereClause = {};
    if (roleName === 'Developer') {
      whereClause.developer_id = id;
    } else if (roleName === 'Company') {
      whereClause.company_id = id;
    }

    whereClause.isVisible = true;

    const result = await RatingModel.findOne({
      where: whereClause,
      attributes: [
        [sequelize.fn('AVG', sequelize.col('score')), 'average']
      ],
      raw: true
    });

    const average = result.average ? parseFloat(result.average).toFixed(2) : null;

    res.json({ average: average ? Number(average) : 0 });
  } catch (error) {
    console.error("Error al obtener el promedio de ratings:", error);
    res.status(500).json({ message: "Error al obtener el promedio de ratings" });
  }
};

export const getMyProjectsByStatus = async (req, res) => {
  try {
    const { role, profile_id } = req.user;

    if (role !== 1) {
      return res.status(400).json({ message: "Rol no autorizado para consultar proyectos" });
    }

    const projects = await ProjectsModel.findAll({
      where: { company_id: profile_id },  
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "total"]
      ],
      group: ["status"],
      raw: true
    });

    const result = {
      Pendiente: 0,
      Activo: 0,
      Inactivo: 0,
      Rechazado: 0,
      Finalizado: 0
    };

    projects.forEach(p => {
      switch (p.status) {
        case 0:
          result.Pendiente = Number(p.total);
          break;
        case 1:
          result.Activo = Number(p.total);
          break;
        case 2:
          result.Inactivo = Number(p.total);
          break;
        case 3:
          result.Rechazado = Number(p.total);
          break;
        case 4:
          result.Finalizado = Number(p.total);
          break;
      }
    });

    res.json(result);
  } catch (error) {
    console.error("Error al obtener proyectos por estado:", error);
    res.status(500).json({ message: "Error al obtener los proyectos" });
  }
};


/*export const getMyProjectsWithApplicantCount = async (req, res) => {
  try {
    const { id, role } = req.user;
    if (role !== 1) {
      return res.status(400).json({ message: "Rol no autorizado para consultar proyectos" });
    }

    const projects = await ProjectsModel.findAll({
      where: { company_id: id },
      attributes: [
        "id",
        "project_name",
        [sequelize.fn("COUNT", sequelize.col("applications.id")), "total_applicants"]
      ],
      include: [
        {
          model: ProjectApplicationsModel,
          as: "applications",
          attributes: []
        }
      ],
      group: ["ProjectsModel.id", "ProjectsModel.project_name"],
      raw: true
    });

    res.json(projects);
  } catch (error) {
    console.error("Error al obtener proyectos con cantidad de aplicantes:", error);
    res.status(500).json({ message: "Error al obtener los proyectos" });
  }
};*/

export const getMyProjectsWithApplicantCount = async (req, res) => {
  try {
    const { id, role } = req.user;
    if (role !== 1) {
      return res.status(400).json({ message: "Rol no autorizado para consultar proyectos" });
    }

    const query = `
      SELECT 
        p.id AS project_id,
        p.project_name,
        p.budget,
        p.days_available,
        COUNT(pa.id) AS total_applicants
      FROM 
        projects p
      LEFT JOIN 
        project_applications pa ON pa.project_id = p.id
      WHERE 
        p.company_id = :companyId
      GROUP BY 
        p.id, p.project_name;
    `;

    const projects = await sequelize.query(query, {
      replacements: { companyId: id },
      type: sequelize.QueryTypes.SELECT,
      logging: false
    });

    res.json({ 
      success: true,
      message: "Proyectos obtenidos exitosamente",
      data:projects
    });

  } catch (error) {
    console.error("Error al obtener proyectos con cantidad de aplicantes:", error);
    res.status(500).json({ 
      message: "Error al obtener los proyectos", 
      error: error.message , 
      status: 500 });
  }
};