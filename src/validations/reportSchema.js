import Joi from 'joi';

export const reportSchema = Joi.object({
  user_id: Joi.number().required(),
  reported_user_role: Joi.string().valid('company', 'developer').required(),
  project_id: Joi.number().optional().allow(null),
  reason: Joi.string().max(255).required(),
  comment: Joi.string().allow(''),
});
