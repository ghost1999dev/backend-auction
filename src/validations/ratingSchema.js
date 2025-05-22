const Joi = require('joi');

export const createRatingSchema = Joi.object({
  developer_id: Joi.number().required(),
  company_id: Joi.number().required(),
  score: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(500).allow(''),
  isVisible: Joi.boolean().default(true),
});


