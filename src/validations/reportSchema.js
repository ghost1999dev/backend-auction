// validations/reportSchema.js
import Joi from 'joi';

export const reportSchema = Joi.object({
  user_id: Joi.number().integer().required().messages({
    'any.required': 'El ID del usuario reportado es obligatorio',
    'number.base': 'El ID del usuario debe ser un número',
    'number.integer': 'El ID del usuario debe ser un número entero'
  }),

  project_id: Joi.number().integer().optional().allow(null).messages({
    'number.base': 'El ID del proyecto debe ser un número',
    'number.integer': 'El ID del proyecto debe ser un número entero'
  }),

  reason: Joi.string().min(5).max(255).required().messages({
    'any.required': 'La razón del reporte es obligatoria',
    'string.base': 'La razón debe ser una cadena de texto',
    'string.min': 'La razón debe tener al menos 5 caracteres',
    'string.max': 'La razón no debe superar los 255 caracteres'
  }),

  comment: Joi.string().max(1000).optional().allow(null, '').messages({
    'string.base': 'El comentario debe ser una cadena de texto',
    'string.max': 'El comentario no debe superar los 1000 caracteres'
  })
});
