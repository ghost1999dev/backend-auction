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
  
      const validStatuses = [1, 0];  
      let projectStatus = status;
  
      if (status !== undefined && !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value. Valid values are 1 (active) or 0 (inactive).' });
      }
  
      if (status === undefined) {
        projectStatus = 1;  
      }
  
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
        await NotificationModel.create({
        user_id: company_id,
        title: 'Nuevo Proyecto Creado',
        body: `Se ha creado un nuevo proyecto: ${project_name}`,
        context: JSON.stringify({ action: 'project_creation' }),  
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
            error_message: notificationError.message
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
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    const projectExists = await ProjectsModel.findByPk(id);
    if (!projectExists) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    if (status !== undefined) {
      const validStatuses = [1, 0];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value. Valid values are 1 (active) or 0 (inactive).' });
      }
    }
    
    const updateData = {};
    
    
    if (company_id !== undefined) updateData.company_id = company_id;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (project_name !== undefined) updateData.project_name = project_name;
    if (description !== undefined) updateData.description = description;
    if (budget !== undefined) updateData.budget = budget;
    if (days_available !== undefined) updateData.days_available = days_available;
    if (status !== undefined) updateData.status = status;
    
    await ProjectsModel.update(updateData, {
      where: { id }
    });
    
    const updatedProject = await ProjectsModel.findByPk(id, {
      include: [
        { model: CategoriesModel, as: 'category' },
        { model: UsersModel, as: 'company' }
      ]
    });
    
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
export const DesactivateProjectId = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    const project = await ProjectsModel.findByPk(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    await ProjectsModel.update({ status: 0 }, {
      where: { id }
    });
    
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
      
      if (status !== undefined) {
        whereCondition.status = parseInt(status);
      }

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
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await ProjectsModel.findByPk(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const { company_id, project_name } = project;
      
      await ProjectsModel.destroy({
        where: { id }
      });
      
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
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }
    
    const whereCondition = { company_id: id };
    
    if (status !== undefined) {
      whereCondition.status = parseInt(status);
    }
    
    console.log('Where condition:', whereCondition);
    
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
    const { id } = req.params; 
    const { status } = req.query;
    
    console.log('Params:', req.params);
    console.log('Query:', req.query);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    const whereCondition = { category_id: id }; 
    
    if (status !== undefined) {
      whereCondition.status = parseInt(status);
    }
    
    console.log('Where condition:', whereCondition);
    
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