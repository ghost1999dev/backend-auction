import UsersModel from "../models/UsersModel.js";
import updateImage from "./ImagesController.js";
import hashPassword from "../helpers/hashPassword.js";
import { emailVerificationService } from "../helpers/emailVerification.js";
import { confirmEmailService } from "../helpers/emailVerification.js";
import { generateToken } from "../utils/generateToken.js";
import signImage from "../helpers/signImage.js";
import dotenv from "dotenv";
import { 
createUserSchema, 
validateEmailSchema, 
updateUserSchema, 
passwordUserchema,
resetPasswordSchema 
} from '../validations/userSchema.js';
import { requestPasswordRecovery } from "../services/passwordRecoveryService.js";

dotenv.config()

export const verficationEmail = async (req, res) => {
  try {
    let { email } = req.body;

    const { error, value } = validateEmailSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        details: error.details.map(d => d.message),
        status: 400
      });
    }

    const existingEmail = await UsersModel.findOne({ where: { email } })
    if (existingEmail) {
         return res.status(400).json({ status: 500, message: "Email already exists" })
    }else{
      if (existingEmail) {
        return res
          .status(400)
          .json({ 
            status: 400,
            message: "Email already exists" 
          });
      }else{
      const response = await emailVerificationService(email);
      
      if(response.status===200){
        return res
          .status(200)
          .json({ 
            status: 200,
            message: response.message 
          });
      }else{
        return res
          .status(response.status)
          .json({ 
            status: response.status,
            message: "Correo no encontrado" 
          });
      }
    }
  }
  } catch (error) {
    return res
      .status(500)
      .json({ 
        status: 500,
        message: "Error creating user", error: error.message 
      });
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
    const { error, value } = createUserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        details: error.details.map(d => d.message),
        status: 400
      });
    }

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
            id: user.previous('id'),
            status: response.status,
            message: response.message,
            user,
          })        
      }
      else {
        return res.status(response.status).json({
          status: response.status,
          message: response.error
        });
      }
  } catch (error) {
    res
      .status(500)
      .json({ 
        status: 500,
        message: "Error creating user", error: error.message 
      });
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
      attributes: { exclude: ['password', 'createdAt'] },
    })
    const usersWithImage = await Promise.all(
      users.map(async (user) => {

        const imageUrl = await signImage(user.image)

        return {
          ...user.dataValues,
          image: imageUrl
        }
      })
    )

    res
      .status(200)
      .json({ 
        status: 200,
        message: "Users retrieved successfully", 
        users: usersWithImage 
      });
  } catch (error) {
    res
      .status(500)
      .json({ 
        status: 500,
        message: "Error retrieving users", 
        error: error.message 
      });
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
    const user = await UsersModel.findByPk(id, {
      attributes: {
        exclude: ['password', 'createdAt']
      }
    });
    if (user.status === 1) {

      const imageUrl = await signImage(user.image)

      const userWithImage = {
        ...user.dataValues,
        image: imageUrl
      }

      res
        .status(200)
        .json({ 
          status: 200,
          message: "User retrieved successfully", 
          user: userWithImage 
        });
    } else {
      res
        .status(404)
        .json({ 
          status: 404,
          message: "User not found" 
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({ 
        status: 500,
        message: "Error retrieving user",
        error: error.message
      });
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
    const { name, address, phone } = req.body;
    const { error, value } = updateUserSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        details: error.details.map(d => d.message),
        status: 400
      });
    }
        
    const user = await UsersModel.findByPk(id);
    if (user) {
      user.name = name;
      user.address = address;
      user.phone = phone;
      await user.save();
      res
        .status(200)
        .json({ 
          status: 200,
          message: "User updated successfully", user 
        });
    } else {
      res
        .status(404)
        .json({
          status: 404,
          message: "User not found"
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({ 
        status: 500,
        message: "Error updating user", error 
      });
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
    const { currentPassword, Newpassword } = req.body;
    
    const { error } = passwordUserchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        details: error.details.map(d => d.message),
        status: 400
      });
    }

    const user = await UsersModel.findByPk(id);
    if (user) {
      if (user.password === hashPassword(currentPassword)) {
        user.password = hashPassword(Newpassword);
        await user.save();
        res
          .status(200)
          .json({
            status: 200,
            message: "Password updated successfully", user 
          });
      }
      else {
        res
          .status(400)
          .json({ 
            status: 400,
            message: "Current password is incorrect" 
          });
      }
    } else {
      res
        .status(404)
        .json({ 
          status: 404,
          message: "User not found" 
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({ 
        status: 500,
        message: "Error updating password", error 
      });
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
      user.status = 0;
      await user.save();
      res
        .status(200)
        .json({ 
          status: 200,
          message: "User deleted successfully", user 
        });
    } else {
      res
        .status(404)
        .json({ 
          status: 404,
          message: "User not found" 
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({ 
        status: 500,
        message: "Error deleting user", error 
      });
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

export const updateUserFieldsGoogle = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_id, password, address, phone } = req.body;

    const user = await UsersModel.findByPk(id);
    if (user) {
      if (password) user.password = hashPassword(password);
      if (address !== undefined) user.address = address;
      if (phone !== undefined) user.phone = phone;
      if (role_id !== undefined) user.role_id = role_id;

      await user.save();

      res
        .status(200)
        .json({
          status: 200,
          message: "Campos actualizados correctamente",
          user
        });
    } else {
      res
        .status(404)
        .json({ 
          status: 404,
          message: "Usuario no encontrado" 
        });
    }
  } catch (error) {
    console.error("Error al actualizar los campos:", error);
    res
      .status(500)
      .json({ 
        status: 500,
        message: "Error al actualizar los campos", error 
      });
  }
};
/**
 * authenticate user
 *
 * function to authenticate user
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} user authenticated
 */
export const AuthUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UsersModel.findOne({ where: { email } });

    if (!user) {
      return res
        .status(401)
        .json({ 
          status: 401,
          message: "Correo o contraseña incorrectos" 
        });
    }

    if (user.status !== 1) {
      return res
        .status(403)
        .json({ 
          status: 403,
          message: "La cuenta está desactivada" 
        });
    }

    const isPasswordValid = user.password === hashPassword(password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ 
          status: 401,
          message: "Correo o contraseña incorrectos" 
        });
    }

    const token = generateToken(user);

    user.last_login = new Date();
    await user.save();

    const { password: _, ...userData } = user.toJSON();

    res
      .status(200)
      .json({ 
        status: 200,
        message: "Usuario autenticado correctamente", 
        token, 
        user: userData 
      });

  } catch (error) {
    res
      .status(500)
      .json({ 
        status: 500,
        message: "Error al autenticar al usuario", error: error.message 
      });
  }
};

/**
 * forgot password
 * 
 * function to send code password reset
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} user recovered
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const { error, value } = validateEmailSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        details: error.details.map(d => d.message),
        status: 400
      });
    }

    const user = await UsersModel.findOne({ where: { email } })

    if (!user) {
      res
        .status(400)
        .json({ 
          status: 400,
          message: "Correo no encontrado" 
        });
    }

    const response = await requestPasswordRecovery(email)

    if (response.status === 200) {
      res
        .status(200)
        .json({
          status: 200,
          message: "Codigo de recuperacion enviado.",
          email: user.email
        })
    }
    else {
      res
        .status(response.status)
        .json({
          status: response.status,
          message: response.message,
          error: response.error
        })
    }
  } catch (error) {
    res
      .status(500)
      .json({ 
        status: 500,
        message: "Error al enviar el correo de recuperacion", 
        error: response.error
      })
  }
}

/**
 * reset password
 * 
 * function to reset password
 * @param {Object} req - request object
 * @param {Object} res - response object  
 * @returns {Object} user recovered
 */
export const resetPassword = async (req, res) => {

  const { error, value } = resetPasswordSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      details: error.details.map(d => d.message),
      status: 400
    });
  }
  
  const { email, code, password } = value

  try {
      
      const response = await confirmEmailService(email, code)

      if (response.status === 200) {
        const user = await UsersModel.findOne({ where: { email } })

        if (!user) {
          res 
            .status(400)
            .json({ 
              status: 400,
              message: "Correo no encontrado" 
            });
        }
        else {
          const passwordHashed = hashPassword(password)

          user.password = passwordHashed

          await user.save()
          res
          .status(200)
          .json({
            status: 200,
            message: "Contraseña actualizada correctamente.",
            user: user
          })
        }
      }
      else {
        res
          .status(response.status)
          .json({
            status: response.status,
            message: response.error
          })
      }
  } catch (error) {
    res
      .status(500)
      .json({ 
        status: 500,
        message: "Error al actualizar la contraseña", error: error.message 
      })
  }
}