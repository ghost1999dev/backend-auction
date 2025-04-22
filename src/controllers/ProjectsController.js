import ProjectsModel from "../models/ProjectsModel.js";
import NotificationModel from "../models/NotificationModel.js";
import CategoriesModel from "../models/CategorieModel.js";
import UsersModel from "../models/UsersModel.js";

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
        status: 'Active',
        error_message: null

        });
  
      } catch (notificationError) {
        await NotificationModel.create({
            user_id: company_id,
            title: 'Error al crear notificación',
            body: 'No se pudo crear correctamente la notificación del proyecto.',
            context: { action: 'notification_error' },
            sent_at: new Date(),
            status: 'Desactive',
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

/**
 * Update project
 *
 * function to update project details
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} updated project data
 */
export const updateProjectId = async (req, res) => {
  try {
    const { id } = req.params;
    const { company_id, category_id, project_name, description, budget, days_available, status } = req.body;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    // Verificar que el proyecto existe
    const projectExists = await ProjectsModel.findByPk(id);
    if (!projectExists) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Validación de estado si se proporciona
    if (status !== undefined) {
      const validStatuses = [1, 0];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value. Valid values are 1 (active) or 0 (inactive).' });
      }
    }
    
    // Preparar los datos para actualizar
    const updateData = {};
    
    // Solo incluimos campos que se proporcionan en el cuerpo de la solicitud
    if (company_id !== undefined) updateData.company_id = company_id;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (project_name !== undefined) updateData.project_name = project_name;
    if (description !== undefined) updateData.description = description;
    if (budget !== undefined) updateData.budget = budget;
    if (days_available !== undefined) updateData.days_available = days_available;
    if (status !== undefined) updateData.status = status;
    
    // Actualizar el proyecto
    await ProjectsModel.update(updateData, {
      where: { id }
    });
    
    // Obtener el proyecto actualizado para devolver en la respuesta
    const updatedProject = await ProjectsModel.findByPk(id, {
      include: [
        { model: CategoriesModel, as: 'category' },
        { model: UsersModel, as: 'company' }
      ]
    });
    
    // Crear notificación sobre la actualización
    try {
      await NotificationModel.create({
        user_id: updatedProject.company_id,
        title: 'Proyecto Actualizado',
        body: `El proyecto "${updatedProject.project_name}" ha sido actualizado`,
        context: JSON.stringify({ action: 'project_update', project_id: id }),
        sent_at: new Date(),
        status: 'Active',
        error_message: null
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      
    }
    
    res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: "Error updating project", error: error.message });
  }
};

/**
 * Delete project
 *
 * function to delete a project (soft delete by changing status)
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} confirmation message
 */
/**
 * Delete project
 *
 * function to delete a project (soft delete by changing status)
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} confirmation message
 */
export const DesactivateProjectId = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    // Verificar que el proyecto existe
    const project = await ProjectsModel.findByPk(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // En vez de eliminar físicamente, cambiamos el estado a 0 (inactivo)
    await ProjectsModel.update({ status: 0 }, {
      where: { id }
    });
    
    // Crear notificación sobre la desactivación
    try {
      await NotificationModel.create({
        user_id: project.company_id,
        title: 'Proyecto Desactivado',
        body: `El proyecto "${project.project_name}" ha sido desactivado`,
        context: JSON.stringify({ action: 'project_deactivation', project_id: id }),
        sent_at: new Date(),
        status: 'Active',
        error_message: null
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
     
    }
    
    res.status(200).json({
      message: "Project deactivated successfully"
    });
  } catch (error) {
    console.error('Error deactivating project:', error);
    res.status(500).json({ message: "Error deactivating project", error: error.message });
  }
};
  /**
 * Get all projects
 *
 * function to retrieve all projects with optional filter by status
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Array} array of projects
 */
  export const getAllProjects = async (req, res) => {
    try {
      const { status } = req.query;
      let whereCondition = {};
      
      // Si se proporciona un estado, filtramos por él
      if (status !== undefined) {
        whereCondition.status = parseInt(status);
      }
      
      // Obtener proyectos con sus relaciones
      const projects = await ProjectsModel.findAll({
        where: whereCondition,
        include: [
          { model: CategoriesModel, as: 'category' },
          { model: UsersModel, as: 'company' }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      res.status(200).json({
        message: "Projects retrieved successfully",
        projects
      });
    } catch (error) {
      console.error('Error retrieving projects:', error);
      res.status(500).json({ message: "Error retrieving projects", error: error.message });
    }
  };

  /**
 * Get project by ID
 *
 * function to retrieve a specific project by its ID
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} project data
 */
  export const DetailsProjectId = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validar que el ID sea un número
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await ProjectsModel.findByPk(id, {
        include: [
          { model: CategoriesModel, as: 'category' },
          { model: UsersModel, as: 'company' }
        ]
      });
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(200).json({
        message: "Project retrieved successfully",
        project
      });
    } catch (error) {
      console.error('Error retrieving project:', error);
      res.status(500).json({ message: "Error retrieving project", error: error.message });
    }
  };
  

  /**
 * Hard delete project
 *
 * function to permanently delete a project from database
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} confirmation message
 */
  export const hardDeleteProject = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validar que el ID sea un número
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // Verificar que el proyecto existe
      const project = await ProjectsModel.findByPk(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Guardar los datos necesarios para la notificación antes de eliminar
      const { company_id, project_name } = project;
      
      // Eliminar físicamente el registro
      await ProjectsModel.destroy({
        where: { id }
      });
      
      // Crear notificación sobre la eliminación
      try {
        await NotificationModel.create({
          user_id: company_id,
          title: 'Proyecto Eliminado Permanentemente',
          body: `El proyecto "${project_name}" ha sido eliminado permanentemente`,
          context: JSON.stringify({ action: 'project_deletion', project_id: id }),
          sent_at: new Date(),
          status: 'Deleted',
          error_message: null
        });
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
       
      }
      
      res.status(200).json({
        message: "Project permanently deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ message: "Error deleting project", error: error.message });
    }
  };
  
/**
 * Get projects by company
 *
 * function to retrieve all projects for a specific company
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Array} array of company projects
 */
export const getProjectsByCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    console.log('Params:', req.params);
    console.log('Query:', req.query);
    
    // Validar que el ID de la compañía sea un número
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }
    
    // Configurar condiciones de búsqueda
    const whereCondition = { company_id: id };
    
    // Si se proporciona un estado, filtramos por él
    if (status !== undefined) {
      whereCondition.status = parseInt(status);
    }
    
    console.log('Where condition:', whereCondition);
    
    // Obtener proyectos de la compañía
    const projects = await ProjectsModel.findAll({
      where: whereCondition,
      include: [
        { model: CategoriesModel, as: 'category' }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      message: "Company projects retrieved successfully",
      projects
    });
  } catch (error) {
    console.error('Error retrieving company projects:', error);
    res.status(500).json({ message: "Error retrieving company projects", error: error.message });
  }
};

/**
 * Get projects by category
 *
 * function to retrieve all projects for a specific category
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Array} array of category projects
 */

export const getProjectsByCategory = async (req, res) => {
  try {
    const { id } = req.params; // Cambiado de categoryId a id para coincidir con la ruta
    const { status } = req.query;
    
    console.log('Params:', req.params);
    console.log('Query:', req.query);
    
    // Validar que el ID de la categoría sea un número
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    // Configurar condiciones de búsqueda
    const whereCondition = { category_id: id }; // Cambiado de categoryId a id
    
    // Si se proporciona un estado, filtramos por él
    if (status !== undefined) {
      whereCondition.status = parseInt(status);
    }
    
    console.log('Where condition:', whereCondition);
    
    // Obtener proyectos de la categoría
    const projects = await ProjectsModel.findAll({
      where: whereCondition,
      include: [
        { model: UsersModel, as: 'company' }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      message: "Category projects retrieved successfully",
      projects
    });
  } catch (error) {
    console.error('Error retrieving category projects:', error);
    res.status(500).json({ message: "Error retrieving category projects", error: error.message });
  }
};