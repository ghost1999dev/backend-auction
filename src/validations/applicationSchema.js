import Joi from "joi";

// 0 = pending | 1 = approved | 2 = rejected
const STATUS_CODES = [0, 1, 2];

export const applicationSchema = Joi.object({
  project_id: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base":  "project_id debe ser numérico",
      "any.required": "project_id es obligatorio"
    }),

  developer_id: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base":  "developer_id debe ser numérico",
      "any.required": "developer_id es obligatorio"
    })
}).options({ abortEarly: false, stripUnknown: true });

export const applicationUpdateSchema = Joi.object({
  status: Joi.number()
    .integer()
    .valid(...STATUS_CODES)
    .required()
    .messages({
      //"number.base":  "status debe ser un número",
      "any.only":     `status válido: ${STATUS_CODES.join(", ")}`,
      "any.required": "status es obligatorio"
    })
}).options({ abortEarly: false, stripUnknown: true });
