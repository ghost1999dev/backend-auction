import Joi from 'joi'

export const createRatingSchema = Joi.object({
  developer_id: Joi.number().integer().allow(null),
  company_id: Joi.number().integer().allow(null),
  score: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().optional().allow(''),
  isVisible: Joi.boolean().optional()
}).or('developer_id', 'company_id'); 

export const updateRatingSchema = Joi.object({
  score: Joi.number().min(1).max(5).optional(),
  comment: Joi.string().max(500).optional(),
  isVisible: Joi.boolean().optional()
});


