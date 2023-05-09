import Joi from "joi";

export const loginSchema = Joi.object({
  emailId: Joi.string().email().required(),
  password: Joi.string().required()
})
.options({ allowUnknown: false });

export const signupSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  emailId: Joi.string().email().required(),
  createSchool:Joi.bool().required(),
  districtName:Joi.string().optional(),
  schoolName:Joi.string().optional(),
  schoolId:Joi.string().optional(),
  password: Joi.string()
            .min(8)
            .max(20)
            .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&<>\.'";:(){}[\],_|=`~\/+-])[A-Za-z\d@$!%*#?&<>\.'";:(){}[\],_|=`~\/+-]{8,}$/)
            .required()
            .messages({
              'any.required': `Password is a required field`,
              'string.pattern.base': `Password should contain at least 1 letter, number and symbol`,
              'string.min': `Password must be at least 8 chars long`,
              'string.max': `Password must not contain more than 20 chars`
            }),
  
})
.options({ allowUnknown: false });

export const updateProfileSchema = Joi.object({
  id:Joi.string().required(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  bio:Joi.string().optional(),
  files:Joi.array().optional(),
})
.options({ allowUnknown: false });

export const validateEmailSchema = Joi.object({
  emailId: Joi.string().email().required(),
  requestType:Joi.string().required()
}).options({ allowUnknown: false })


export const verifyOTPSchema = Joi.object({
  emailId: Joi.string().email().required(),
  requestType:Joi.string().required(),
  otp:Joi.number().required()
})

export const sendOTPSchema = Joi.object({
  emailId: Joi.string().email().required(),
  requestType:Joi.string().required()
}).options({ allowUnknown: false })


export const resetPasswordSchema = Joi.object({
  emailId: Joi.string().email().required(),
  userId: Joi.string().required(),
  password:Joi.string().required()
})