import ProjectsModel from "../models/ProjectsModel.js";
import NotificationsModel from "../models/NotificationsModel.js";
import CategoriesModel from "../models/CategoriesModel.js";
import UsersModel from "../models/UsersModel.js";
import CompaniesModel from "../models/CompaniesModel.js";
import ProjectApplicationsModel from "../models/ProjectApplicationsModel.js";
import DevelopersModel from "../models/DevelopersModel.js";
import { createProjectSchema } from "../validations/projectSchema.js"

/**
 * create project
 *
 * function to create project
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} project created
 */
export const createProject = async (req, res) => {
    const { error, value } = createProjectSchema.validate(req.body)

    if (error) {
      return res.status(400).json({
        message: 'Error de validación',
        details: error.details.map(d => d.message),
        status: 400
      });
    }

    const { company_id, category_id, project_name, description, long_description, budget, days_available } = value
    
    try {
      const company = await CompaniesModel.findOne({
        include: [{
          model: UsersModel,
          attributes: ['id', 'status'],
        }],
        where: { id: company_id },
        attributes: []
      });

      if (company.user.status === 5){
        return res.status(403).json({
          message: "No puedes realizar ninguna accion mientras estas bloqueado",
          status: 403,
        })
      }

      const activeProjectsCount = await ProjectsModel.count({
       where: {
         company_id,
          status: [0, 1] 
        }
      });

      if (activeProjectsCount >= 5) {
        const activeProjects = await ProjectsModel.count({
          where: {
            company_id: id,
            status: 1
          }
        })

        const pendingProjects = await ProjectsModel.count({
          where: {
            company_id: id,
            status: 0
          }
        })
        return res.status(403).json({
          message: "No se pueden crear más de 5 proyectos simultaneos. Finaliza o desactiva alguno antes de crear uno nuevo.",
          status: 403,
          activeProjects,
          pendingProjects
        });
      }
      
      let projectStatus = 0;

      const project = await ProjectsModel.create({
        company_id,
        category_id,
        project_name,
        description,
        budget,
        days_available,
        status: projectStatus,
        long_description
      });
  
      try {
        await NotificationsModel.create({
        user_id: company_id,
        title: 'Nuevo Proyecto Creado',
        body: `Se ha creado un nuevo proyecto: ${project_name}. Estado: pendiente de verificación.`,
        context: JSON.stringify({
        action: 'project_creation',
        status: 'pendiente de verificación'          
        }),  
        sent_at: new Date(),
        status: 'Pendiente',
        error_message: null

        });
  
      } catch (notificationError) {
        await NotificationsModel.create({
            user_id: company_id,
            title: 'Error al crear notificación',
            body: 'No se pudo crear correctamente la notificación del proyecto.',
            context: { 
              action: 'notification_error'
             },
            sent_at: new Date(),
            status: 'Desactive',
            error_message: notificationError.message
          });
      }

      res.status(201).json({
        message: "Project created successfully", 
        status: 201,
        project
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ message: "Error creating project", error: error.message, status: 500 });
    }
  }

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
    const { company_id, category_id, project_name, description, long_description, budget, days_available } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID", status: 400 });
    }

    const company = await CompaniesModel.findOne({
      include: [{
        model: UsersModel,
        attributes: ['id', 'status'],
      }],
      where: { id: company_id },
      attributes: []
    });

    if (company.user.status === 5){
      return res.status(403).json({
        message: "No puedes realizar ninguna accion mientras estas bloqueado",
        status: 403,
      })
    }
    
    const projectExists = await ProjectsModel.findByPk(id);
    if (!projectExists) {
      return res.status(404).json({ message: "Project not found", status: 404 });
    }

    if (projectExists.status !== 0) {
      return res.status(403).json({
        message: "Solo los proyectos en estado Pendiente pueden ser actualizados.",
        status: 403
      });
    }

    if (
      !company_id || 
      !category_id || 
      !project_name || 
      !description || 
      !budget || 
      !days_available) {
      return res.status(400).json({ message: "All fields must be filled.", status: 400 });
    }

    const currentStatus = projectExists.status;

    const updateData = {
      company_id,
      category_id,
      project_name,
      description,
      budget,
      days_available,
      status: currentStatus,
      long_description: long_description
    };

    await ProjectsModel.update(updateData, {
      where: { id }
    });
    
    const updatedProject = await ProjectsModel.findByPk(id, {
      include: [
        { model: CategoriesModel, as: 'category' },
        { model: UsersModel, as: 'company' }
      ]
    });

    let statusText;
    switch (currentStatus) {
      case 0:
        statusText = "Pendiente";
        break;
      case 1:
        statusText = "Activo";
        break;
      case 2:
        statusText = "Inactivo";
        break;
      case 3:
        statusText = "Rechazado";
        break;
      case 4:
        statusText = "Finalizado";
        break;
      default:
        statusText = "Desconocido";
    }
    
    try {
      await NotificationsModel.create({
        user_id: updatedProject.company_id,
        title: 'Proyecto Actualizado',
        body: `El proyecto "${updatedProject.project_name}" ha sido actualizado. Estado: Pendiente de verificación.`,
        context: JSON.stringify({ 
          action: 'project_update', 
          project_id: id,
          status: statusText          
        }),
        sent_at: new Date(),
        status: statusText,
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
    res.status(500).json({ message: "Error updating project", error: error.message, status: 500 });
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
      return res.status(400).json({ message: "Invalid project ID", status: 400 });
    }
    
    const company = await ProjectsModel.findOne({
      where: { id }
    })

    const status = await CompaniesModel.findOne({
      include: [{
        model: UsersModel,
        attributes: ['id', 'status'],
      }],
      where: { id: company.company_id },
      attributes: []
    });

    if (status.user.status === 5){
      return res.status(403).json({
        message: "No puedes realizar ninguna accion mientras estas bloqueado",
        status: 403,
      })
    }
    
    const project = await ProjectsModel.findOne({
      where: { 
        id,
        status: [0, 1]
      }
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found", status: 404 });
    }

    const applications = await ProjectApplicationsModel.count({
      where: { 
        project_id: id,
        status: 1
      }
    })

    if (applications > 0) {
      return res.status(403).json({
        message: "No se pueden desactivar proyectos con suscripciones activas.",
        status: 403,
        applications
      });
    }

    const currentStatus = project.status;
    
    await ProjectsModel.update({ status: 2 }, {
      where: { id }
    });

    let statusText;
    switch (currentStatus) {
      case 2:
        statusText = "Inactivo";
        break;
      default:
        statusText = "Desconocido";
    }
    
    try {
      await NotificationsModel.create({
        user_id: project.company_id,
        title: 'Proyecto Desactivado',
        body: `El proyecto "${project.project_name}" ha sido desactivado`,
        context: JSON.stringify({ 
          action: 'project_deactivation', 
          project_id: id,
          status: statusText
         }),
        sent_at: new Date(),
        status: statusText,
        error_message: null
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }
    
    res.status(200).json({
      message: "Project deactivated successfully", status: 200
    });
  } catch (error) {
    console.error('Error deactivating project:', error);
    res.status(500).json({ message: "Error deactivating project", error: error.message, status: 500 });
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

      const projectsWithRemainingDays = projects.map(project => {
        let daysRemaining = null;
  
        if (project.status === 1) { 
          const  activatedAt = new Date(project.updatedAt);
          const today = new Date();
  
          const msInDay = 24 * 60 * 60 * 1000;
          const elapsedDays = Math.floor((today -  activatedAt) / msInDay);
          daysRemaining = project.days_available - elapsedDays;
  
          if (daysRemaining < 0) daysRemaining = 0;
        }
  
        return {
          ...project.toJSON(),
          days_remaining: daysRemaining
        };
      });
      
      res.status(200).json({
        message: "Projects retrieved successfully", 
        status: 200,
        projects: projectsWithRemainingDays
      });
    } catch (error) {
      console.error('Error retrieving projects:', error);
      res.status(500).json({ message: "Error retrieving projects", 
        error: error.message, 
        status: 500 });
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
        return res.status(400).json({ message: "Invalid project ID", status: 400 });
      }
  
      const project = await ProjectsModel.findByPk(id, {
        include: [
          { model: CategoriesModel, as: 'category' },
          { model: UsersModel, as: 'company' }
        ]
      });
  
      if (!project) {
        return res.status(404).json({ message: "Project not found", status: 404 });
      }
  
      
      let daysRemaining = null;
      if (project.status === 1 && project.updatedAt) { 
        const activatedAt = new Date(project.updatedAt);
        const today = new Date();
        const daysPassed = Math.floor((today - activatedAt) / (1000 * 60 * 60 * 24));
        daysRemaining = project.days_available - daysPassed;
        if (daysRemaining < 0) daysRemaining = 0;
      }
  
      res.status(200).json({
        message: "Project retrieved successfully",
        project,
        days_remaining: daysRemaining
      });
    } catch (error) {
      console.error('Error retrieving project:', error);
      res.status(500).json({ message: "Error retrieving project", error: error.message, status: 500 });
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
      return res.status(400).json({ message: "Invalid company ID", status: 400 });
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

    const projectsWithRemainingDays = projects.map(project => {
      let daysRemaining = null;

      if (project.status === 1) { 
        const  activatedAt = new Date(project.updatedAt);
        const today = new Date();

        const msInDay = 24 * 60 * 60 * 1000;
        const elapsedDays = Math.floor((today -  activatedAt) / msInDay);
        daysRemaining = project.days_available - elapsedDays;

        if (daysRemaining < 0) daysRemaining = 0;
      }

      return {
        ...project.toJSON(),
        days_remaining: daysRemaining
      };
    });


    
    res.status(200).json({
      message: "Company projects retrieved successfully",
      status: 200,
      projects: projectsWithRemainingDays
    });
  } catch (error) {
    console.error('Error retrieving company projects:', error);
    res.status(500).json({ message: "Error retrieving company projects", error: error.message, status: 500 });
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
      return res.status(400).json({ message: "Invalid category ID", status: 400 });
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

    const projectsWithRemainingDays = projects.map(project => {
      let daysRemaining = null;

      if (project.status === 1) { 
        const  activatedAt = new Date(project.updatedAt);
        const today = new Date();

        const msInDay = 24 * 60 * 60 * 1000;
        const elapsedDays = Math.floor((today -  activatedAt) / msInDay);
        daysRemaining = project.days_available - elapsedDays;

        if (daysRemaining < 0) daysRemaining = 0;
      }

      return {
        ...project.toJSON(),
        days_remaining: daysRemaining
      };
    });

    
    res.status(200).json({
      message: "Category projects retrieved successfully",
      status: 200,
      projects: projectsWithRemainingDays
    });
  } catch (error) {
    console.error('Error retrieving category projects:', error);
    res.status(500).json({ message: "Error retrieving category projects", error: error.message, status: 500 });
  }
};

/**
 * projectsCounterByCompany
 * 
 * function to count projects by company
 * @param {Object} req
 * @param {Object} res  
 * @returns {Object} projects counter by company
 */
export const projectsCounterByCompany = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        status: 400,
        message: "Falta el ID del empresa",
        error: "missing_fields"
      })
    }
    const company = await CompaniesModel.findByPk(id)

    if (!company) {
      return res.status(404).json({
        status: 404,
        message: "Empresa no encontrada",
      })
    }

    const projectsCount = await ProjectsModel.count({
      where: {
        company_id: id,
        status: [0, 1]
      }
    })

    res.status(200).json({
      status: 200,
      message: "Proyectos contados exitosamente",
      count: projectsCount
    })
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error al contar los proyectos",
      error: error.message
    });
  }
}

/**
 * get projects history
 * 
 * function to get projects history
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} projects history
 */
export const getProjectsHistoryByDeveloper = async (req, res) => {
  try {
    const { id } = req.params;
    const developer = await DevelopersModel.findByPk(id, {
      where: {
        status: 1
      }
    })

    if (!developer) {
      return res.status(404).json({
        status: 404,
        message: "Developer not found",
      })
    }

    const projects = await ProjectApplicationsModel.findAll({
      attributes: [],
      include: [{
        model: ProjectsModel,
        as: 'project',
        attributes: ['id', 'project_name', 'description', 'budget', 'status'],
        include: [{
          model: CompaniesModel,
          as: 'company_profile',
          attributes: ['id'],
          include: [{
            model: UsersModel,
            attributes: ['id', 'name', 'email']
          }],
        },{
          model: CategoriesModel,
          as: 'category',
          attributes: ['name']
        }]
      },],
      where: {
        developer_id: id
      }
    })

    res.status(200).json({
      status: 200,
      message: "Projects history retrieved successfully",
      projects
    })
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error retrieving projects history",
      error: error.message
    })
  }
}