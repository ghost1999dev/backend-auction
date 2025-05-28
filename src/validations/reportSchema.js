import Joi from 'joi';

export const reportSchema = Joi.object({
  reporter_id: Joi.number().integer().required(),
  user_id: Joi.number().integer().required(),
  user_role: Joi.string().required(),
  project_id: Joi.number().integer().allow(null),
  reason: Joi.string().max(255).required(),
  comment: Joi.string().allow('', null),
  status: Joi.string().required()
});
