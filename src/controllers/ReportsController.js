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
    const report = await ReportsModel.create({
      ...req.body,
      reporter_id: req.user.id,
    });
    res.status(201).json(report);
  } catch (err) {
    console.error('Error al crear el reporte:', err);
    res.status(500).json({ error: 'No se pudo crear el reporte.' });
  }
};
