import Joi from 'joi'


export const createRatingSchema = Joi.object({
  developer_id: Joi.number().integer().positive(),
  company_id: Joi.number().integer().positive(),
  score: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(500).required(),
  isVisible: Joi.boolean().default(true),
}).xor('developer_id', 'company_id');

export const updateRatingSchema = Joi.object({
  score: Joi.number().min(1).max(5).optional(),
  comment: Joi.string().max(500).optional(),
  isVisible: Joi.boolean().optional()
});


