import Joi from "joi";

export default Joi.object({
  project_id:         Joi.number().integer().required(),
  bidding_started_at: Joi.date().required()
    .less(Joi.ref("bidding_deadline"))
    .messages({ "date.less": "bidding_started_at debe ser anterior a bidding_deadline" }),
  bidding_deadline:   Joi.date().required(),
  status:            Joi.number().integer().required(),
});
