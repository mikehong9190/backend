import Joi from "joi";

export const searchSchema = Joi.object({
  text: Joi.string().allow(null, ''),
  district:Joi.string().optional(),
  page: Joi.string().min(1).optional(),
          // .message({
          //   'string.min': 'Min page value allowed is 1'
          // }),
  limit: Joi.string().min(1).optional(),
          // .message({
          //   'string.min': 'Min limit value allowed is 1'
          // })
})
.options({ allowUnknown: false });

export const updateSchoolSchema = Joi.object({
        userId:Joi.string().required(),
        schoolId:Joi.string().required(),
        name: Joi.string().optional(),
        district:Joi.string().optional(),
        description:Joi.string().optional(),
        files:Joi.array().optional(),
      })
      .options({ allowUnknown: false });

