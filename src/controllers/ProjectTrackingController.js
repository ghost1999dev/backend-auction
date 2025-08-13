import ProjectTrackingModel from "../models/ProjectTrackingModel.js";
import ProjectsModel from "../models/ProjectsModel.js";

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
