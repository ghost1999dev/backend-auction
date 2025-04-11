import DevelopersModel from "../models/DevelopersModel.js"
import UsersModel from "../models/UsersModel.js"
import RolesModel from "../models/RolesModel.js"

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

/**
 * get developer by id
 *
 * function to get developer by id
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} developer retrieved
 */
export const DetailsDeveloperId = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) throw new Error("Developer id is required")

        const developer = await DevelopersModel.findOne({
            include: [{
                model: UsersModel,
                attributes: [
                    "role_id",
                    "name",
                    "email",
                    "address",
                    "phone",
                    "image",
                ],
                where: {
                    status: 1,
                },
                required: true,
                include: [{
                    model: RolesModel,
                    attributes: ["role_name"],
                    as: "role",
                }]
            }],
            where: {
                id: id
            }
        })

        if (developer) {
            res.status(200).json({ message: "Developer retrieved successfully", developer })
        }
        else {
            res.status(404).json({ message: "Developer not found" })
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving developer", error })
    }
}