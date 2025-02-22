// import users model
import UsersModel from "../models/UsersModel.js"
// import image controller
import updateImage from "./ImagesController.js"
// import helper to hash password
import hashPassword from "../helpers/hashPassword.js"

/**
 * create user
 * 
 * function to create user
 * @param {object} req - request object
 * @param {object} res - response object
 * @returns {object} user created
 */
export const createUser = async (req, res) => {
    try {
        let { name, email, password, role, image } = req.body
        password = hashPassword(password)
        const user = await UsersModel.create({ name, email, password, role, image })
        res.status(201).json({ message: "User created successfully", user })
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error: error.message })
    }
}

/**
 * get users
 * 
 * function to get all users
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} users registered
 */
export const getUsers = async (req, res) => {
    try {
        const users = await UsersModel.findAll({
        where: {
            status: true
         }
        })
        const usersWithImage = users.map(user => {
            return {
                ...user.dataValues,
                image: user.image ? `${req.protocol}://${req.get('host')}/${user.image}` : null
            }
        })
        res.status(200).json({ message: "Users retrieved successfully", usersWithImage })
    } catch (error) {
        res.status(500).json({ message: "Error retrieving users", error })
    }
}

/**
 * get user by id
 * 
 * function to get user by id
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} user registered
 */
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params
        const user = await UsersModel.findByPk(id)
        if (user) {
            res.status(200).json({ message: "User retrieved successfully", user })
        }
        else {
            res.status(404).json({ message: "User not found" })
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving user", error })
    }
}

/**
 * update user
 * 
 * function to update user
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} user updated
 */
export const updateUser = async (req, res) => {
    try {
        // get id from params
        const { id } = req.params
        // get updated user data from request body
        const { name, email, password, role, image } = req.body
        // get user from database
        const user = await UsersModel.findByPk(id)
        // update user in database if user exists
        if (user) {
            user.name = name
            user.email = email
            user.password = password
            user.role = role
            user.image = image
            await user.save()
            res.status(200).json({ message: "User updated successfully", user })
        }
        else {
            res.status(404).json("User not found")
        }
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error })
    }
}

/**
 * update password
 * 
 * function to update password
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} user updated
 */
export const updatePassword = async (req, res) => {
    try {
        const { id } = req.params
        const { password } = req.body
        const user = await UsersModel.findByPk(id)
        if (user) {
            user.password = hashPassword(password)
            await user.save()
            res.status(200).json({ message: "Password updated successfully", user })
        }
        else {
            res.status(404).json({ message: "User not found" })
        }
    } catch (error) {
        res.status(500).json({ message: "Error updating password", error })
    }
}

/**
 * delete user 
 * 
 * function to delete user
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} user deleted
 * 
*/
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params
        const user = await UsersModel.findByPk(id)
        if (user) {
            user.status = false
            await user.save()
            res.status(200).json({ message: "User deleted successfully", user })
        }
        else {
            res.status(404).json({ message: "User not found" })
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error })
    }
}

/**
 * upload image
 * 
 * function to upload image
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} image uploaded
 */
export const uploadImageUser = async (req, res) => {
    updateImage(req, res, UsersModel)
}