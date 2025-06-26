import sequelize from "../config/connection.js";
import UsersModel from "../models/UsersModel.js";
import CompaniesModel from "../models/CompaniesModel.js";
import ProjectsModel from "../models/ProjectsModel.js";
import DevelopersModel from "../models/DevelopersModel.js";
import ReportsModel from "../models/ReportsModel.js";
import CategoriesModel from "../models/CategoriesModel.js";

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