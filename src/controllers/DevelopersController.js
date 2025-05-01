import DevelopersModel from "../models/DevelopersModel.js"
import UsersModel from "../models/UsersModel.js"
import RolesModel from "../models/RolesModel.js"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3Client } from "../utils/s3Client.js"

import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

        res.status(201).json(
            { 
                status: 201,
                message: "Developer created successfully", 
                developer 
            }
        )
    } catch (error) {
        res.status(500).json(
            { 
                status: 500,
                message: "Error creating developer", error 
            }
        )
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
                    "id",
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
                    required: true,
                }]
            }],
            where: {
                id: id
            }
        })

        if (developer) {

            let imageUrl = ''
            if (developer.user.image){
                const s3key = developer.user.image.includes("amazonaws.com/") 
                ? developer.user.image.split("amazonaws.com/")[1]
                : developer.user.image

                const command = new GetObjectCommand({
                    Bucket: process.env.BUCKET_NAME,
                    Key: s3key,
                })

                imageUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 24 })
            }
            else {
                imageUrl = path.join(__dirname, "../images/default-image.png")
            }

            const developerWithImage = {
                ...developer.dataValues,
                user: {
                    ...developer.user.dataValues,
                    image: imageUrl
                }
            }

            res
                .status(200)
                .json({
                    status: 200,
                    message: "Developer retrieved successfully", 
                    developer: developerWithImage 
                })
        }
        else {
            res
                .status(404)
                .json({ 
                    status: 404,
                    message: "Developer not found" 
                })
        }
    } catch (error) {
        res
            .status(500)
            .json({ 
                status: 500,
                message: "Error retrieving developer", 
                error: error.message 
            })
    }
}

/**
 * get developer by id user
 *
 * function to get developer by id
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} developer retrieved
 */
export const getDevelopersByIdUser = async (req, res) => {
    try {
        const { user_id } = req.params

        if (!user_id) throw new Error("Developer id is required")

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
                    required: true,
                }]
            }],
            where: {
                user_id: user_id
            }
        })

        if (developer) {

            let imageUrl = ''
            if (developer.user.image){
                const s3key = developer.user.image.includes("amazonaws.com/") 
                ? developer.user.image.split("amazonaws.com/")[1]
                : developer.user.image

                const command = new GetObjectCommand({
                    Bucket: process.env.BUCKET_NAME,
                    Key: s3key,
                })

                imageUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 24 })
            }
            else {
                imageUrl = path.join(__dirname, "../images/default-image.png")
            }

            const developerWithImage = {
                ...developer.dataValues,
                user: {
                    ...developer.user.dataValues,
                    image: imageUrl
                }
            }

            res
                .status(200)
                .json({ 
                    status: 200,
                    message: "Developer retrieved successfully", 
                    developer: developerWithImage
                })
        }
        else {
            res
                .status(404)
                .json({ 
                    status: 404,
                    message: "Developer not found" 
                })
        }
    } catch (error) {
        res
            .status(500)
            .json({ 
                status: 500,
                message: "Error retrieving developer", error 
            })
    }
}

/**
 * get all developers
 *
 * function to get all developers
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} developers retrieved
 */
export const ListAllDevelopers = async (req, res) => {
    try {
        const developers = await DevelopersModel.findAll({
            include: [{
                model: UsersModel,
                attributes: [
                    "id",
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
                    required: true,
                }]
            }],
        })

        if (developers) {

            const developersWithImage = await Promise.all(
                developers.map(async (developer) => {
                    if (!developer.user.image) {
                        return {
                            ...developer.dataValues,
                            user: {
                                ...developer.user.dataValues,
                                image: path.join(__dirname, "../images/default-image.png")
                            }
                        }
                    }

                    const s3key = developer.user.image.includes("amazonaws.com/") 
                    ? developer.user.image.split("amazonaws.com/")[1]
                    : developer.user.image

                    const command = new GetObjectCommand({
                    Bucket: process.env.BUCKET_NAME,
                    Key: s3key,
                    })

                    const imageUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 24 })

                    return {
                        ...developer.dataValues,
                        user: {
                            ...developer.user.dataValues,
                            image: imageUrl
                        }
                    }
                })
            )

            res
                .status(200)
                .json({ 
                    status: 200,
                    message: "Developers retrieved successfully", 
                    developers: developersWithImage 
                })
        }
        else {
            res
                .status(404)
                .json({ 
                    status: 404,
                    message: "There are no developers"
                })
        }
    } catch (error) {
        res
            .status(500)
            .json({ 
                status: 500,
                message: "Error retrieving developers", 
                error: error.message 
            })
    }
}

/**
 * update developer
 *
 * function to update developer
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} developer updated
 */
export const UpdateDeveloperId = async (req, res ) => {
    try {
        const { id } = req.params
        const { bio, linkedin, occupation, portfolio } = req.body

        const developer = await DevelopersModel.findByPk(id)

        if (developer) {
            developer.bio = bio
            developer.linkedin = linkedin
            developer.occupation = occupation
            developer.portfolio = portfolio
            await developer.save()

            res
                .status(200)
                .json({ 
                    status: 200,
                    message: "Developer updated successfully", developer 
                })
        }
        else {
            res
                .status(404)
                .json({ 
                    message: "Developer not found" 
                })
        }
    } catch (error) {
        res
            .status(500)
            .json({ 
                message: "Error updating developer", error 
            })
    }
}