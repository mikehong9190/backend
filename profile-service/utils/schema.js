import Joi from "joi";

export const getProfileSchema = Joi.object({
  id:Joi.string().required(),
})
.options({ allowUnknown: false });

export const updateProfileSchema = Joi.object({
  id:Joi.string().required(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  bio:Joi.string().optional().allow(null, ''),
  files:Joi.array().optional(),
})
.options({ allowUnknown: false });


export const resetPasswordSchema = Joi.object({
  emailId: Joi.string().email().required(),
  userId: Joi.string().optional(),
  password:Joi.string().required()
})