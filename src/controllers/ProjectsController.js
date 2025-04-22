import ProjectsModel from "../models/ProjectsModel.js";
import NotificationModel from "../models/NotificationModel.js";
import CategoriesModel from "../models/CategorieModel.js";

/**
 * create project
 *
 * function to create project
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} project created
 */
export const createProject = async (req, res) => {
    try {
      const { company_id, category_id, project_name, description, budget, days_available, status } = req.body;
  
      // Validación de estado (usamos 1 para 'activo' y 0 para 'inactivo')
      const validStatuses = [1, 0];  // 1 = 'activo', 0 = 'inactivo'
      let projectStatus = status;
  
      if (status !== undefined && !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value. Valid values are 1 (active) or 0 (inactive).' });
      }
  
      // Si no se pasa 'status', lo configuramos por defecto como 1 (activo)
      if (status === undefined) {
        projectStatus = 1;  // 'active' por defecto
      }
  
      // Crear el proyecto en la base de datos
      const project = await ProjectsModel.create({
        company_id,
        category_id,
        project_name,
        description,
        budget,
        days_available,
        status: projectStatus, 
      });
  
      try {
       // Crear una notificación de proyecto creado
        await NotificationModel.create({
        user_id: company_id,
        title: 'Nuevo Proyecto Creado',
        body: `Se ha creado un nuevo proyecto: ${project_name}`,
        context: JSON.stringify({ action: 'project_creation' }),  // Esto convierte el objeto a JSON válido
        sent_at: new Date(),
        status: 1,
        error_message: null

        });
  
      } catch (notificationError) {
        await NotificationModel.create({
            user_id: company_id,
            title: 'Error al crear notificación',
            body: 'No se pudo crear correctamente la notificación del proyecto.',
            context: { action: 'notification_error' },
            sent_at: new Date(),
            status: 0,
            error_message: notificationError.message  // ← aquí sí se llena
          });
      }

      res.status(201).json({
        message: "Project created successfully",
        project
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ message: "Error creating project", error: error.message });
    }
  };
