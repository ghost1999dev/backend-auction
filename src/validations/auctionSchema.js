import Joi from "joi";

export const createAuctionSchema = Joi.object({
  project_id: Joi.number()
    .integer()
    .required()
    .messages({
      "any.required": "El ID del proyecto es obligatorio",
      "number.base": "El ID del proyecto debe ser un número entero",
    }),
  bidding_started_at: Joi.date()
    .required()
    .less(Joi.ref("bidding_deadline"))
    .messages({ 
      "date.base": "La fecha de inicio debe ser una fecha válida",
      "date.less": "fecha de inicio debe ser anterior a la fecha de finalizacion" 
    }), 
  bidding_deadline: Joi.date()
    .required()
    .messages({
      "date.base": "La fecha de finalización debe ser una fecha válida",
    })
});
