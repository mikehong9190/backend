import { nanoid } from 'nanoid';

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { loginSchema } from './utils/schema.js';
import { dbExecuteQuery } from './utils/dbConnect.js';

const componentName = 'auth-service/login';

// Lambda Handler
export const handler = async (event) => {
  const reqId = nanoid();
  try {
    LOGGER.info(reqId, componentName, "Event received", event);
    const body = JSON.parse(event.body);

    // step-1: validate request body,
    const { error, value } = await loginSchema.validate(body, { abortEarly: false });
    if (error) {
      LOGGER.error(reqId, componentName, `Invalid request body`, error);
      const err = {
        message: `Invalid request body`,
        body: error
      };
      return sendResponse(reqId, 400, err);
    }

    // ############ Main business logic ############
    // step-2: write logic here
    // TODO: <remove TODO once done>
    // query db with email, if user found, cross-check hashed password, if correct, send the access token,
    // else, send appropriate message like - password incorrect, or user not found.
    const dbResp  = await dbExecuteQuery('SELECT * FROM user');
    LOGGER.info(reqId, componentName, "query results", dbResp);


    // ############ Handler end ############

    // finally return response
    return sendResponse(reqId, 200, {
      message: 'success',
      data: dbResp
    });

  } catch (error) {
    LOGGER.error(reqId, componentName, "Event received", event);
    return sendResponse(reqId, 500, {
      message: error.message || 'Internal Server Error',
      error
    });
  }
}
