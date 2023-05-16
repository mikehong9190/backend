import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { dbExecuteQuery } from './utils/dbConnect.js';
import {  resetPasswordSchema } from './utils/schema.js';
const componentName = 'profile-service/resetPassword';

//Lambda Handler
export const handler = async (event) => {
  const reqId = nanoid();
  
  try {
    LOGGER.info(reqId, componentName, "Event received", event);
    const body = await JSON.parse(event.body);
    
    // validate request body,
    const { error, value } = await resetPasswordSchema.validate(body, { abortEarly: false });
    if (error) {
      LOGGER.error(reqId, componentName, `Invalid request body`, error);
      const err = {
        message: `Invalid request body`,
        body: error
      };
      return sendResponse(reqId, 400, err);
    }
    const hashedPassword = await bcrypt.hash(body['password'], 10);
    const query = `DELETE FROM otp
                   WHERE emailId = ?
                   AND type = ?
                   AND status = ?`
    const res = await dbExecuteQuery(query,[body['emailId'],'reset-password','verified']);
    LOGGER.info(reqId, componentName, 'Response from DB :: ', res);
    
    if(res){
        const insertQuery = `UPDATE user
                            SET password = ?
                            WHERE id = ?;`
        const insertValues = [hashedPassword,body['userId']];
        const result = await dbExecuteQuery(insertQuery,insertValues);
        LOGGER.info(reqId, componentName, 'Response from DB :: ', result);
        return sendResponse(reqId, 200, { message: 'Password Updated Successfully' });
    }
    else{
        return sendResponse(reqId, 500, 'An error occured, please try again later');
    }
    
  } catch (error) {
        LOGGER.error(reqId, componentName, 'Exception raised :: ', error);
        return sendResponse(reqId, 500, {
          message: error.message || 'Internal Server Error',
          error
        });
  }
};