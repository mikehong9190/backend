import { nanoid } from 'nanoid';

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { dbExecuteQuery, pool } from './utils/dbConnect.js';
import {  validateEmailSchema } from './utils/schema.js';

const componentName = 'auth-service/validateEmail';

//Lambda Handler
export const handler = async (event) => {
  const reqId = nanoid();
  try {
    LOGGER.info(reqId, componentName, "Event received", event);
    const body = await JSON.parse(event.body);

    // validate request body,
    const { error, value } = await validateEmailSchema.validate(body, { abortEarly: false });
    if (error) {
      LOGGER.error(reqId, componentName, `Invalid request body`, error);
      const err = {
        message: `Invalid request body`,
        body: error
      };
      return sendResponse(reqId, 400, err);
    }

    // validating if email already exists in the database
    const [res] = await dbExecuteQuery('SELECT * FROM user WHERE emailId = ?',[body['emailId']])
    if (res?.emailId) {
        return sendResponse(reqId, 400, { message: 'User already exists' });
    }
    else{
        return sendResponse(reqId, 200, { message: 'User email available'});
    }

  } catch (error) {
    LOGGER.error(reqId, componentName, 'Exception raised :: ', error);
    return sendResponse(reqId, 500, error?.message || 'Internal Server Error');
  }

};