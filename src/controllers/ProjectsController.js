import ProjectsModel from "../models/ProjectsModel.js"
import NotificationModel from "../models/NotificationModel.js"

/**
 * create project
 *
 * function to create project
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} project created
 */
export const AddNewProject = async (req, res) => {
    try {
        const { name, description, user_id, status } = req.body

        const project = await ProjectsModel.create({
            name,
            description,
            user_id,
            status,
        })

        res.status(201).json(
            { 
                message: "Project created successfully", 
                project 
            }
        )
    } catch (error) {
        res.status(500).json({ message: "Error creating project", error })    
    }
}