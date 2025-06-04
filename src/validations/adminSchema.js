import Joi from "joi";
import { isCorporateEmail } from "../utils/emailValidation.js";

 export const adminSchema = Joi.object({
  full_name: Joi.string().required().min(3).max(100).messages({
    'string.empty': 'El nombre completo es obligatorio',
    'string.min': 'El nombre completo debe tener al menos 3 caracteres',
    'string.max': 'El nombre completo no puede exceder los 100 caracteres',
    'any.required': 'El nombre completo es obligatorio'
  }),

  phone: Joi.string()
  .pattern(/^\+\(\d{3}\) \d{4}-\d{4}$/)
  .required()
    .messages({
      'string.pattern.base': 'Phone numbers format is wrong',
      'string.empty': 'Number is empty'
  }),
  
  email: Joi.string().required().email().messages({
    'string.empty': 'El correo electrónico es obligatorio',
    'string.email': 'Formato de correo electrónico inválido',
    'any.required': 'El correo electrónico es obligatorio'
  }),
  password: Joi.string().required().min(8).max(30).messages({
    'string.empty': 'La contraseña es obligatoria',
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'string.max': 'La contraseña no puede exceder los 30 caracteres',
    'any.required': 'La contraseña es obligatoria'
  }),
  image: Joi.string().allow('', null).optional(),

  role: Joi.string().required().valid('Administrador', 'SuperAdministrador').messages({
    'string.empty': 'El rol es obligatorio',
    'any.only': 'Rol inválido. Los roles permitidos son: Administrador, SuperAdministrador',
    'any.required': 'El rol es obligatorio'
  }),
  username: Joi.string().min(3).max(20).optional().messages({
    'string.empty': 'El nombre de usuario no puede estar vacío si se proporciona',
    'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
    'string.max': 'El nombre de usuario no puede exceder los 20 caracteres'
  })
});

export const adminUpdateSchema = Joi.object({
  email: Joi.string().email().optional(),
  full_name: Joi.string().min(3).max(100).optional(),
  phone: Joi.string().min(7).max(20).optional(),
  username: Joi.string().min(3).max(30).optional(),
  password: Joi.string().min(6).max(100).optional(),
  image: Joi.string().uri().optional().allow(null),
  status: Joi.string().valid('active', 'inactive').optional() // o ajusta según tu modelo
}).or('email', 'full_name', 'phone', 'username', 'password', 'image', 'status'); // al menos uno

export default adminSchema;
