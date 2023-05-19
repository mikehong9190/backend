import Joi from "joi";

export const createInitiativeSchema = Joi.object({
  initiativeTypeId: Joi.string().required(),
  userId:Joi.string().required(),
  name:Joi.string().required(),
  target:Joi.number().required(),
  grade:Joi.string().required(),
  numberOfStudents:Joi.number().required(),
  files:Joi.array().required()
})
.options({ allowUnknown: false });

