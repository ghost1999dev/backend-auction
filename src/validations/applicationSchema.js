import Joi from "joi";

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