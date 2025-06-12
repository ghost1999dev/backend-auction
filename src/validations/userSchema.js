import Joi from 'joi';

export const validateEmailSchema = Joi.object({
    email: Joi.string().email().required(),
});

export const createUserSchema = Joi.object({
  role_id: Joi.number().required(),
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  code: Joi.string().min(6).required(),
  password: Joi.string().optional().allow('', null),
  address: Joi.string().required(),
  phone: Joi.string()
  .pattern(/^\+\(\d{3}\) \d{4}-\d{4}$/)
  .required()
    .messages({
      'string.pattern.base': 'Phone numbers format is wrong',
      'string.empty': 'Number is empty'
    }),
  image: Joi.string().optional().allow(null, ''),
  account_type: Joi.number().required()
});

export const updateUserSchema = Joi.object({
    name: Joi.string().min(3).required(),
    address: Joi.string().required(),
    phone: Joi.string()
    .pattern(/^\+\(\d{3}\) \d{4}-\d{4}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone numbers format is wrong',
      'string.empty': 'Number is empty'
    })
});

export const passwordUserchema = Joi.object({
    currentPassword: Joi.string().optional().allow('',null),
    Newpassword: Joi.string()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/)
      .required()
      .messages({
        'string.pattern.base': 'La nueva contraseña debe tener al menos una mayúscula, una minúscula, un número y mínimo 6 caracteres alfanuméricos.',
        'string.empty': 'La nueva contraseña no puede estar vacía.',
        'any.required': 'La nueva contraseña es obligatoria.'
      })
  });

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email()
    .required()
    .messages({
      'string.empty': 'Correo no puede estar vacío',
      'any.required': 'Correo es obligatorio'
    }),
  code: Joi.string().min(6)
    .required()
    .messages({
      'string.empty': 'El código de recuperación no puede estar vacío',
      'string.min': 'El código de recuperación debe tener al menos 6 caracteres',
      'any.required': 'El código de recuperación es obligatorio'
    }),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/)
    .required()
    .messages({
      'string.pattern.base': 'La nueva contraseña debe tener al menos una mayúscula, una minúscula, un número y mínimo 6 caracteres alfanuméricos.',
      'string.empty': 'La nueva contraseña no puede estar vacía.',
      'any.required': 'La nueva contraseña es obligatoria.'
    })
}).options({ abortEarly: false });
