import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
            .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&<>\.'";:(){}[\],_|=`~\/+-])[A-Za-z\d@$!%*#?&<>\.'";:(){}[\],_|=`~\/+-]{8,}$/)
            .required()
            .messages({
              'string.base': `Password should contain at least 1 letter, number and symbol`,
              'any.required': `Password is a required field`
            })
})
.options({ allowUnknown: true });
