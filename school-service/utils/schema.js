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
