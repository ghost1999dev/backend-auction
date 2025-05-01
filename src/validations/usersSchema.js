import Joi from 'joi';

export const validateEmailSchema = Joi.object({
    email: Joi.string().email().required(),
});

export const createUserSchema = Joi.object({
  role_id: Joi.number().required(),
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  code: Joi.string().min(6).required(),
  password: Joi.string().optional().allow('', null),
  address: Joi.string().required(),
  phone: Joi.string()
  .pattern(/^\+\(\d{3}\) \d{4}-\d{4}$/)
  .required()
  .error((errors) => {
    return errors.map((error) => {
      switch (error.code) {
        case 'string.pattern.base':
          return new Error(JSON.stringify({
            success: false,
            message: "The phone format must be +(XXX) XXXX-XXXX",
            status: 400
          }));
        case 'string.empty':
          return new Error(JSON.stringify({
            success: false,
            message: "The phone number cannot be empty",
            status: 400
          }));
        default:
          return new Error(JSON.stringify({
            success: false,
            message: "Phone validation error",
            status: 400
          }));
      }
    });
  }),
  image: Joi.string().optional().allow(null, ''),
  account_type: Joi.number().required()
});

export const updateUserSchema = Joi.object({
    name: Joi.string().min(3).required(),
    address: Joi.string().required(),
    phone: Joi.string()
    .pattern(/^\+\(\d{3}\) \d{4}-\d{4}$/)
    .required()
    .error((errors) => {
      return errors.map((error) => {
        switch (error.code) {
          case 'string.pattern.base':
            return new Error(JSON.stringify({
              success: false,
              message: "Phone numbers format is wrong",
              status: 400
            }));
          case 'string.empty':
            return new Error(JSON.stringify({
              success: false,
              message: "Number is empty",
              status: 400
            }));
          default:
            return new Error(JSON.stringify({
              success: false,
              message: "Number validation error",
              status: 400
            }));
        }
      });
    })
});

export const passwordUserchema = Joi.object({
    currentPassword: Joi.string().optional().allow('',null),
    Newpassword: Joi.string()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)
      .required()
      .error((errors) => {
        return errors.map((error) => {
          switch (error.code) {
            case 'string.pattern.base':
              return new Error(JSON.stringify({
                success: false,
                message: "The new password must have at least one uppercase letter, one lowercase letter, one number, and at least 8 alphanumeric characters.",
                status: 400
              }));
            case 'string.empty':
              return new Error(JSON.stringify({
                success: false,
                message: "The new password cannot be empty.",
                status: 400
              }));
            case 'any.required':
              return new Error(JSON.stringify({
                success: false,
                message: "The new password is mandatory.",
                status: 400
              }));
            default:
              return new Error(JSON.stringify({
                success: false,
                message: "Password validation error",
                status: 400
              }));
          }
        });
      })
  });
