import Joi from "joi";

export const createBidSchema = Joi.object({
  auction_id: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base":  "auction_id debe ser numérico",
      "any.required": "auction_id es obligatorio"
    }),

  user_id: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base":  "user_id debe ser numérico",
      "any.required": "user_id es obligatorio"
    }),

  amount: Joi.number()
    .precision(2)
    .positive()
    .required()
    .messages({
      "number.base":     "amount debe ser numérico",
      "number.positive": "amount debe ser mayor que 0",
      "any.required":    "amount es obligatorio"
    })
}).options({ abortEarly: false, stripUnknown: true });

export const updateBidSchema = Joi.object({
  amount: Joi.number()
    .precision(2)
    .positive()
    .required()
    .messages({
      "number.base":     "amount debe ser numérico",
      "number.positive": "amount debe ser mayor que 0",
      "any.required":    "amount es obligatorio"
    })
}).options({ abortEarly: false, stripUnknown: true });
