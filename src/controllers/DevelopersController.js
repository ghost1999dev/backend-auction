import DevelopersModel from "../models/DevelopersModel.js"
import UsersModel from "../models/UsersModel.js"

/**
 * create developer
 *
 * function to create developer
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} developer created
 */
export const AddNewDeveloper = async (req, res) => {
    try {
        const { bio, user_id, linkedin, occupation, portfolio } = req.body

        const developer = await DevelopersModel.create({
            bio,
            user_id,
            linkedin,
            occupation,
            portfolio,
        })

        res.status(201).json({ message: "Developer created successfully", developer })
    } catch (error) {
        res.status(500).json({ message: "Error creating developer", error })
    }
}

