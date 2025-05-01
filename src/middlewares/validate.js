export default (schema) => (req, _res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly:false, stripUnknown:true });
  if (error) return next({ status:422, message:error.details.map(d=>d.message).join(", ") });
  req.body = value;
  next();
};
