import { Op } from 'sequelize';
import { Sequelize } from 'sequelize';
import ReportsModel from '../models/ReportsModel.js';
import UsersModel from '../models/UsersModel.js';
import ProjectsModel from '../models/ProjectsModel.js';
import { reportSchema } from '../validations/reportSchema.js';

/**
 * Reports controller.
 * @module ReportsController
 */

/**
 * createReport
 * Create a new report.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} The response object.
 */

export const createReport = async (req, res) => {
  const { error } = reportSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const report = await 
    ReportsModel.create (req.body)/*({
      ...req.body,
      reporter_id: req.user.id,
    });*/
  return res.status(201).json({ 
    status: 201, 
    message: 'Reporte creado exitosamente', 
    report });
  } catch (err) {
    console.error('Error al crear el reporte:', err);
    return res.status(500).json({ 
        status: 500, 
        error: 'No se pudo crear el reporte.' });
  }
};

/**
 * getReports
 * Get all reports.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} The response object.
 */
export const getAllReports = async (req, res) => {
  try {
    const { status, reporter_id, user_role, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (reporter_id) where.reporter_id = reporter_id;
    if (user_role) where.user_role = user_role;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const reports = await ReportsModel.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: UsersModel,
          as: 'reporter',
          attributes: ['id', 'name', 'email']
        },
        {
          model: UsersModel,
          as: 'reportedUser',
          attributes: ['id', 'name', 'email']
        },
        {
          model: ProjectsModel,
          as: 'project',
          attributes: ['id', 'project_name']
        }
      ]
    });

    res.json({
      data: reports.rows.map(report => ({
        id: report.id,
        reporter_id: report.reporter_id,
        user_id: report.user_id,
        user_role: report.user_role,
        project_id: report.project_id,
        reason: report.reason,
        comment: report.comment,
        status: report.status,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        reporter_name: report.reporter?.name || null,
        reportedUser_name: report.reportedUser?.name || null,
        project_name: report.project?.project_name || null,
      })),
      total: reports.count,
      page: parseInt(page),
      totalPages: Math.ceil(reports.count / parseInt(limit)),
    });

  } catch (err) {
    console.error('Error al obtener reportes:', err);
    res.status(500).json({ error: 'No se pudieron obtener los reportes.' });
  }
};
