import Joi from "joi";

export const createInitiativeSchema = Joi.object({
  emailId: Joi.string().email().required(),
  password: Joi.string().required()
})
.options({ allowUnknown: false });

