import Joi from "joi";

export const createInitiativeSchema = Joi.object({
  initiativeTypeId: Joi.string().required(),
  initiativeId:Joi.string().required(),
  userId:Joi.string().required(),
  name:Joi.string().required(),
  target:Joi.number().required(),
  grade:Joi.string().required(),
  numberOfStudents:Joi.number().required(),
  imageKeys:Joi.array().required(),
  // files:Joi.array().required()
})
.options({ allowUnknown: false });

export const updateInitiativeSchema = Joi.object({
  initiativeId: Joi.string().required(),
  userId:Joi.string().required(),
  imageKeys:Joi.array().required()
})
.options({ allowUnknown: false });

export const getInitiativeSchema = Joi.object({
  id:Joi.string().required(),
})
.options({ allowUnknown: false });


export const deleteImageSchema = Joi.object({
  imageKeys:Joi.array().required()
})
.options({ allowUnknown: false });