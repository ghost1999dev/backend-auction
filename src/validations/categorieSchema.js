import Joi from "joi";

export const categorySchema = Joi.object({
 name: Joi.string()
  .trim()
  .min(3)
  .max(50)
  .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
  .required()
  .messages({
    'string.base': 'El nombre debe ser un texto',
    'string.empty': 'El nombre no puede estar vacío',
    'string.min': 'El nombre debe tener al menos 3 caracteres',
    'string.max': 'El nombre no debe exceder los 50 caracteres',
    'string.pattern.base': 'El nombre solo puede contener letras y espacios, sin números ni caracteres especiales',
    'any.required': 'El nombre es obligatorio'
  })
});

const categoryIdParam = Joi.number().integer().positive().required();

export default categorySchema;