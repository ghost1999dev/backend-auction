import jwt from "jsonwebtoken";
import UsersModel from "../models/UsersModel.js";
import updateImage from "./ImagesController.js";
import hashPassword from "../helpers/hashPassword.js";
import { emailVerificationService } from "../helpers/emailVerification.js";
import { confirmEmailService } from "../helpers/emailVerification.js";


export const verficationEmail = async (req, res) => {
  try {
    let { email } = req.body;

     const existingEmail = await UsersModel.findOne({ where: { email } })
     if (existingEmail) {
         return res.status(400).json({ message: "Email already exists" })
    }else{
      const response = await emailVerificationService(email);
      
      if(response.status===200){
        return res.status(200).json(response);
      }else{
        return res.status(response.status).json({ message: response.message });
      }
    }

  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

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
    let { 
      role_id, 
      name, 
      email,
      code, 
      password, 
      address,
      phone,
      image, 
      account_type } = req.body;

      const response = await confirmEmailService(email, code);
      if(response.status===200){
          password = hashPassword(password);
          const user = await UsersModel.create({
          role_id,
          name,
          email,
          password,
          address,
          phone,
          image,
          account_type,
          status: 1,
          last_login: new Date(),
        });
      
        return res
          .status(200)
          .json({ 
            message:
              "User created successfully. please check your email to verify your account",
            user,
          });
      }

  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

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
        status: 1,
      },
    });
    const usersWithImage = users.map((user) => {
      return {
        ...user.dataValues,
        image: user.image
          ? `${req.protocol}://${req.get("host")}/${user.image}`
          : null,
      };
    });
    res
      .status(200)
      .json({ message: "Users retrieved successfully", usersWithImage });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error });
  }
};

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
    const { id } = req.params;
    const user = await UsersModel.findByPk(id);
    if (user.status === 1) {
      res.status(200).json({ message: "User retrieved successfully", user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user", error });
  }
};

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
    const { id } = req.params;
    const { name, email, image } = req.body;

    const user = await UsersModel.findByPk(id);
    if (user) {
      user.name = name;
      user.email = email;
      user.image = image;
      await user.save();
      res.status(200).json({ message: "User updated successfully", user });
    } else {
      res.status(404).json("User not found");
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

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
    const { id } = req.params;
    const { password } = req.body;
    const user = await UsersModel.findByPk(id);
    if (user) {
      user.password = hashPassword(password);
      await user.save();
      res.status(200).json({ message: "Password updated successfully", user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating password", error });
  }
};

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
    const { id } = req.params;
    const user = await UsersModel.findByPk(id);
    if (user) {
      user.status = false;
      await user.save();
      res.status(200).json({ message: "User deleted successfully", user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

/**
 * upload image
 *
 * function to upload image
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} image uploaded
 */
export const uploadImageUser = async (req, res) => {
  updateImage(req, res, UsersModel);
};