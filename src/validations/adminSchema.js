import Joi from "joi";
import { isCorporateEmail } from "../utils/emailValidation.js";

 export const adminSchema = Joi.object({
full_name: Joi.string()
    .min(3)
    .max(100)
    .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
     .messages({
    'string.min': 'El nombre completo debe tener al menos 3 caracteres',
    'string.max': 'El nombre completo no debe exceder los 100 caracteres',
    'string.pattern.base': 'El nombre completo solo puede contener letras y espacios, sin números ni caracteres especiales'
  }),

  phone: Joi.string()
  .pattern(/^\+\(\d{3}\) \d{4}-\d{4}$/)
  .required()
    .messages({
      'string.pattern.base': 'El formato de los números de teléfono es incorrecto',
      'string.empty': 'El número está vacío'
  }),
  
  email: Joi.string().required().email().messages({
    'string.empty': 'El correo electrónico es obligatorio',
    'string.email': 'Formato de correo electrónico inválido',
    'any.required': 'El correo electrónico es obligatorio'
  }),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,20}$/)
    .messages({
      'string.pattern.base': 'La contraseña debe tener entre 6 y 20 caracteres, e incluir al menos una mayúscula, una minúscula, un número y un símbolo.',
      'string.empty': 'La contraseña no puede estar vacía.'
    }),

  image: Joi.string().allow('', null).optional(),

  role: Joi.number().valid(3, 4).optional(),

  username: Joi.string().min(3).max(20).optional().messages({
    'string.empty': 'El nombre de usuario no puede estar vacío si se proporciona',
    'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
    'string.max': 'El nombre de usuario no puede exceder los 20 caracteres'
  }),

  url_base:Joi.string().allow('', null).optional()
});

export const adminUpdateSchema = Joi.object({
full_name: Joi.string()
    .min(3)
    .max(100)
    .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
     .messages({
    'string.min': 'El nombre completo debe tener al menos 3 caracteres',
    'string.max': 'El nombre completo no debe exceder los 100 caracteres',
    'string.pattern.base': 'El nombre completo solo puede contener letras y espacios, sin números ni caracteres especiales'
  }),

 phone: Joi.string()
  .pattern(/^\+\(\d{3}\) \d{4}-\d{4}$/)
    .messages({
      'string.pattern.base': 'El formato de los números de teléfono es incorrecto',
      'string.empty': 'El número está vacío'
  }),

  email: Joi.string()
    .email()
    .messages({
      'string.email': 'El correo electrónico no es válido'
    }),

  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,20}$/)
    .messages({
      'string.pattern.base': 'La contraseña debe tener entre 6 y 20 caracteres, e incluir al menos una mayúscula, una minúscula, un número y un símbolo.',
      'string.empty': 'La contraseña no puede estar vacía.'
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
   role: Joi.number().valid(3, 4).optional(),

  status: Joi.string()
    .valid('active', 'inactive')
    .messages({
      'any.only': 'El estado debe ser "active" o "inactive"'
    })
  }).min(1).messages({
    'object.min': 'Debes proporcionar al menos un campo para actualizar'
  });

export const schemaParams = Joi.object({
      id: Joi.number().positive().required().messages({
        'any.required': 'ID de proyecto requerido',
        'number.base': 'El ID debe ser un número',
        'number.positive': 'El ID debe ser un número positivo'
      })
    });
export const schemaBody = Joi.object({
      newStatus: Joi.number().valid(0,1,3,4).required(),
      reason: Joi.string().when('newStatus', {
      is: 3,
      then: Joi.string().min(5).required().messages({
      'any.required': 'La justificación es requerida cuando el proyecto es rechazado.',
     }),
      otherwise: Joi.string().optional().allow(null, ''),
  })
    });

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'El correo electrónico no es válido'
  }),
  code: Joi.string().required().messages({
    'string.empty': 'El código de recuperación no puede estar vacío'
  }),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{6,20}$/)
    .messages({
      'string.pattern.base': 'La contraseña debe tener entre 6 y 20 caracteres, e incluir al menos una mayúscula, una minúscula, un número y un símbolo.',
      'string.empty': 'La contraseña no puede estar vacía.'
    })
});


export default adminSchema;
