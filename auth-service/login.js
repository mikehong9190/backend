import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { loginSchema } from './utils/schema.js';
import { dbExecuteQuery, pool } from './utils/dbConnect.js';
import generateToken from './utils/generateToken.js';

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
    
    //step-2: Get user with the specified email from the database
    const [dbResp] = await dbExecuteQuery('SELECT * FROM user WHERE emailId = ?',[body['emailId']]);

    LOGGER.info(reqId, componentName, "query results", dbResp);

    //step-3: Check if user exists
    if (!dbResp?.emailId) {
      return sendResponse(reqId, 401, { message: 'User not found' });
    }

    //step-4: Dont allow user to login if its status is not active 
    if (dbResp?.status!=='active') {
      return sendResponse(reqId, 401, { message: 'User not verified' });
    }

    const passwordMatch = await bcrypt.compare(body['password'], dbResp.password);
   
    
    if (!passwordMatch) {
      return sendResponse(reqId, 401, { message: 'Wrong Password' });
    }

    // Generate a JWT token
    const token = generateToken(dbResp.id,dbResp.emailId);

    // ############ Handler end ############
    pool.end()
    // finally return response
    return sendResponse(reqId, 200, { message: 'Login Successful', data: { id: dbResp.id, token: token } });

  } catch (error) {
    LOGGER.error(reqId, componentName, "Event received", event);
    return sendResponse(reqId, 500, {
      message: error.message || 'Internal Server Error',
      error
    });
  }
}
