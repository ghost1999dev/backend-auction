import FavoriteProjectsModel from "../models/FavoriteProjectsModel.js"
import ProjectsModel from "../models/ProjectsModel.js"
import DevelopersModel from "../models/DevelopersModel.js"

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
                id: developer_id,
                status: 1
            }
        })

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Proyecto no encontrado",
                error: "project_not_found",
                status: 400
            })
        }

        if (!developer) {
            return res.status(404).json({
                success: false,
                message: "Desarrollador no encontrado",
                error: "developer_not_found",
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
                status: 400
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