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
full_name: Joi.string()
    .min(3)
    .max(100)
    .messages({
      'string.min': 'El nombre completo debe tener al menos 3 caracteres',
      'string.max': 'El nombre completo no debe exceder los 100 caracteres'
    }),

 phone: Joi.string()
  .pattern(/^\+\(\d{3}\) \d{4}-\d{4}$/)
    .messages({
      'string.pattern.base': 'Phone numbers format is wrong',
      'string.empty': 'Number is empty'
  }),

  email: Joi.string()
    .email()
    .messages({
      'string.email': 'El correo electrónico no es válido'
    }),

  password: Joi.string()
    .min(6)
    .max(50)
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.max': 'La contraseña no debe exceder los 50 caracteres'
    }),

  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .messages({
      'string.alphanum': 'El nombre de usuario solo puede contener letras y números',
      'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
      'string.max': 'El nombre de usuario no debe exceder los 30 caracteres'
    }),

  image: Joi.string()
    .uri()
    .allow(null, '')
    .messages({
      'string.uri': 'La imagen debe ser una URL válida'
    }),

  role: Joi.string()
    .valid('Administrador', 'SuperAdministrador')
    .messages({
      'any.only': 'El rol debe ser "Administrador" o "SuperAdministrador"'
    }),

  status: Joi.string()
    .valid('active', 'inactive')
    .messages({
      'any.only': 'El estado debe ser "active" o "inactive"'
    })
}).min(1).messages({
  'object.min': 'Debes proporcionar al menos un campo para actualizar'
});

export default adminSchema;
