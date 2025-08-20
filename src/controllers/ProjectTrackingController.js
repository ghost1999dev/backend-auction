import ProjectTrackingModel from "../models/ProjectTrackingModel.js";
import ProjectsModel from "../models/ProjectsModel.js";

/*
1 → Proyecto Asignado
2 → En Progreso
3 → En Revisión
4 → Completado
*/
/**
 * @desc    Crear un nuevo estado de proyecto
 * @route   POST /project-tracking/create
 * @access  Private
 * @param   {number} req.body.project_id - ID del proyecto
 * @param   {number} req.body.status - Estado del proyecto
 * @param   {string} req.body.notes - Notas del estado
 * @returns {Object} Mensaje de error o estado creado
 */
export const createTracking = async (req, res) => {
  try {
    const { project_id, status, notes } = req.body;

    const tracking = await ProjectTrackingModel.create({
      project_id,
      status,
      notes
    });

    res.status(201).json({
      success: true,
      message: "Estado de proyecto registrado",
      tracking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al registrar estado" });
  }
};
/**
 * @desc    Obtener historial de estados de proyecto
 * @route   GET /project-tracking/get-history/:id
 * @access  Public
 * @param   {number} req.params.id - ID del proyecto
 * @returns {Object} Mensaje de error o historial de estados
 */ 
export const getProjectHistory = async (req, res) => {
  try {
    const { project_id } = req.params;

    const history = await ProjectTrackingModel.findAll({
      where: { project_id },
      include: [
        { model: ProjectsModel, as: 'project' }
      ],
      order: [['updated_at', 'ASC']]
    });

    res.json({ success: true, history });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al obtener historial" });
  }
};
/**
 * @desc    Obtener el estado actual de un proyecto
 * @route   GET /project-tracking/get-current-status/:id
 * @access  Public
 * @param   {number} req.params.id - ID del proyecto
 * @returns {Object} Mensaje de error o estado actual
 */ 
export const getCurrentStatus = async (req, res) => {
  try {
    const { project_id } = req.params;

    const current = await ProjectTrackingModel.findOne({
      where: { project_id },
      order: [['updated_at', 'DESC']]
    });

    res.json({ success: true, current });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al obtener estado actual" });
  }
};


export const getAllStatus = async (req, res) => {
  try {
    const { project_id } = req.params;

    const current = await ProjectTrackingModel.findAll({
      where: { project_id },
      order: [['updated_at', 'DESC']]
    });

    res.json({ success: true, current });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al obtener estado actual" });
  }
};