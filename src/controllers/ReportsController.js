import { Op } from 'sequelize';
import { Sequelize } from 'sequelize';
import ReportsModel from '../models/ReportsModel.js';
import UsersModel from '../models/UsersModel.js';
import ProjectsModel from '../models/ProjectsModel.js';
import { reportSchema, reportUpdateSchema } from '../validations/reportSchema.js';

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

  const { user_id, project_id, reason, comment } = req.body;
  const reporter_id = req.user.id;
  const user_role = req.user.role_id; 

  try {
    const existingReport = await ReportsModel.findOne({
      where: {
        reporter_id,
        status: 'Pendiente',
        ...(project_id ? { project_id } : { user_id })
      }
    });

    if (existingReport) {
      return res.status(400).json({
        status: 400,
        error: 'Ya existe un reporte pendiente para este usuario o proyecto. Espera a que se finalice antes de crear otro.'
      });
    }

    const report = await ReportsModel.create({
      user_id,
      project_id,
      reason,
      comment,
      reporter_id,
      user_role, 
      status: 'Pendiente'
    });

    return res.status(201).json({
      status: 201,
      message: 'Reporte creado exitosamente',
      report
    });
  } catch (err) {
    console.error('Error al crear el reporte:', err);
    return res.status(500).json({
      status: 500,
      error: 'No se pudo crear el reporte.'
    });
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
    const { status, user_role, page = 1, limit = 10 } = req.query;
    const reporter_id = req.user.id;

    const where = { reporter_id };
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

    res.json({
      data: reports.rows.map(report => ({
        id: report.id,
        reporter_id: report.reporter_id,
        user_id: report.user_id,
        user_role: translateUserRole(report.user_role),
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


/**
 * getByIdReport
 * Get a report by id.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} The response object.
 */

export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const translateUserRole = (role) => {
    const roleNum = Number(role); 
      if (roleNum === 1) return 'Company';
      if (roleNum === 2) return 'Developer';
      return 'Desconocido';
    };

    const report = await ReportsModel.findOne({
      where: { id },
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

    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado.' });
    }

    const responseData = {
      id: report.id,
      reporter_id: report.reporter_id,
      user_id: report.user_id,
      user_role: translateUserRole(report.user_role),
      project_id: report.project_id,
      reason: report.reason,
      comment: report.comment,
      status: report.status,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      reporter_name: report.reporter?.name || null,
      reporter_email: report.reporter?.email || null,
      reportedUser_name: report.reportedUser?.name || null,
      reportedUser_email: report.reportedUser?.email || null,
      project_name: report.project?.project_name || null
    };
    const statusesWithAdminResponse = ['resuelto', 'rechazado'];
    if (statusesWithAdminResponse.includes(report.status.toLowerCase())) {
      responseData.admin_response = report.admin_response || null;
    }
    res.json(responseData);

  } catch (err) {
    console.error('Error al obtener el reporte por ID:', err);
    res.status(500).json({ error: 'No se pudo obtener el reporte.' });
  }
};

export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;

    const { error: validationError } = reportUpdateSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false
    });

    if (validationError) {
      return res.status(400).json({
        error: true,
        message: 'Error de validación',
        errors: validationError.details.map(err => ({
          field: err.path[0],
          message: err.message
        })),
        status: 400
      });
    }

    const { reason, comment, user_role } = req.body;

    const report = await ReportsModel.findByPk(id);
    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado.' });
    }
    const nonEditableStatuses = ['resuelto', 'rechazado',['desactivado']];
    if (nonEditableStatuses.includes(report.status.toLowerCase())) {
      return res.status(400).json({
        error: true,
        message: 'No se puede editar un reporte que ya ha sido resuelto,rechazado o desactivado.',
        status: 400
      });
    }

    if (req.body.comment && req.body.comment !== report.comment) {
        const now = new Date();
        const createdAt = new Date(report.createdAt);
        const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);

        if (hoursSinceCreation > 1) {
            return res.status(400).json({
            message: 'No puedes editar el Reporte después de una hora de haberlo creado',
            });
        }
        }  

    await report.update({
      reason: reason ?? report.reason,
      comment: comment ?? report.comment,
      user_role: user_role ?? report.user_role
    });

    res.json({ message: 'Reporte actualizado correctamente.', report });
  } catch (err) {
    console.error('Error al actualizar el reporte:', err);
    res.status(500).json({ error: 'No se pudo actualizar el reporte.' });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await ReportsModel.findByPk(id);
    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado.' });
    }

    await report.update({ status: 'Desactivado' });

    res.json({ message: 'Reporte desactivado correctamente.' });
  } catch (err) {
    console.error('Error al desactivar el reporte:', err);
    res.status(500).json({ error: 'No se pudo desactivar el reporte.' });
  }
};

