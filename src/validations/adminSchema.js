import Joi from "joi";
import { isCorporateEmail } from "../utils/emailValidation.js";

const ALLOWED_DOMAINS = ['empresa.com', 'admin.com', 'corporativo.com'];

const adminSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.min": "Nombre debe tener al menos 3 caracteres",
      "string.max": "Nombre no puede exceder 100 caracteres",
      "any.required": "Nombre es requerido"
    }),

  email: Joi.string()
    .required()
    .email()
    .custom((value, helpers) => {
      const domain = value.split('@')[1];
      if (!ALLOWED_DOMAINS.includes(domain)) {
        return helpers.error('email.domain');
      }
      return value;
    })
    .messages({
      'string.empty': 'El correo electrónico es obligatorio',
      'string.email': 'Formato de correo electrónico inválido',
      'email.domain': `El correo debe ser de uno de los siguientes dominios: ${ALLOWED_DOMAINS.join(', ')}`,
      'any.required': 'El correo electrónico es obligatorio'
    }),

  password: Joi.string()
    .min(8)
    .required()
    .messages({
      "string.min": "Contraseña debe tener al menos 8 caracteres",
      "any.required": "Contraseña es requerida"
    })
}).options({
  abortEarly: false,
  stripUnknown: true
});

export default adminSchema;
