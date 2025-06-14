import FavoriteProjectsModel from "../models/FavoriteProjectsModel.js"
import ProjectsModel from "../models/ProjectsModel.js"
import DevelopersModel from "../models/DevelopersModel.js"
import CategoriesModel from "../models/CategoriesModel.js"
import CompaniesModel from "../models/CompaniesModel.js"
import UsersModel from "../models/UsersModel.js"

/**
 * create a favorite project
 * 
 * function to create a favorite project
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @returns {object} the response object
 */
export const createFavoriteProject = async (req, res) => {
    const { project_id, developer_id } = req.body

    if (!project_id || !developer_id) {
        return res.status(400).json({
            success: false,
            message: "Faltan campos requeridos",
            error: "missing_fields",
            status: 400
        })
    }

    try {
        const project = await ProjectsModel.findOne({
            where: { 
                id: project_id,
                status: 1
            },
        })

        const developer = await DevelopersModel.findOne({
            where: {
                id: developer_id
            }
        })

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Proyecto no encontrado",
                error: "project_not_found",
                status: 404
            })
        }

        if (!developer) {
            return res.status(404).json({
                success: false,
                message: "Desarrollador no encontrado",
                error: "developer_not_found",
                status: 404
            })
        }

        const favoriteProjectExists = await FavoriteProjectsModel.findOne({
            where: {
                project_id,
                developer_id
            }
        })

        if (favoriteProjectExists) {
            return res.status(400).json({
                success: false,
                message: "El proyecto ya está en favoritos",
                error: "project_already_favorite",
                status: 400
            })
        }
        
        const favoriteProject = await FavoriteProjectsModel.create({
            project_id,
            developer_id
        })

        res.status(201).json({
            success: true,
            message: "Proyecto añadido a favoritos exitosamente",
            data: favoriteProject,
            status: 201
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al añadir el proyecto a favoritos",
            error: error.message,
            status: 500
        })
    }
}

/**
 * delete a favorite project
 * 
 * function to delete a favorite project
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @returns {object} the response object
 */
export const deleteFavoriteProject = async (rqe, res) => {
    const { id } = rqe.params

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Falta el ID del proyecto favorito",
            error: "missing_fields",
            status: 400
        })
    }

    try {
        const favoriteProject = await FavoriteProjectsModel.findByPk(id)

        if (!favoriteProject){
            return res.status(404).json({
                success: false,
                message: "Proyecto no encontrado",
                error: "project_not_found",
                status: 404
            })
        }

        await favoriteProject.destroy()

        res.status(200).json({
            success: true,
            message: "Proyecto eliminado de favoritos exitosamente",
            status: 200
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar el proyecto de favoritos",
            error: error.message,
            status: 500
        })
    }
}

/**
 * get all favorite projects
 * 
 * function to get all favorite projects
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @returns {object} the response object
 */
export const getAllFavoriteProjects = async (req, res) => {
    const { developer_id } = req.params

    if (!developer_id) {
        return res.status(400).json({
            success: false,
            message: "Falta el ID del desarrollador",
            error: "missing_fields",
            status: 400
        })
    }

    try {
        const favoriteProjects = await FavoriteProjectsModel.findAll({
            where: {
                developer_id
            },
            include: [{
                model: ProjectsModel,
                as: 'project',
                where: {
                    status: 1
                },
                include: [{
                    model: CompaniesModel,
                    as: 'company_profile',
                    include: [{
                        model: UsersModel,
                        attributes: ['id', 'name', 'email', 'phone']
                    }]
                },{
                    model: CategoriesModel,
                    as: 'category',
                    attributes: ['name']
                },]
            }]
        })

        if (favoriteProjects) {
            res.status(200).json({
                success: true,
                status: 200,
                message: "Proyectos favoritos obtenidos exitosamente",
                favoriteProjects
            })
        } else {
            res.status(404).json({
                success: false,
                status: 404,
                message: "No se encontraron proyectos favoritos",
                error: "favorite_projects_not_found"
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 500,
            message: "Error obteniendo proyectos favoritos",
            error: error.message
        })
    }
}