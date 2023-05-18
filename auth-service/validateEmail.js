import { nanoid } from 'nanoid';

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { dbExecuteQuery, pool } from './utils/dbConnect.js';
import { handler } from './sendOTP.js';
import {  validateEmailSchema } from './utils/schema.js';
const componentName = 'auth-service/validateEmail';

//Lambda Handler
export const emailhandler = async (event) => {
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
    if(body['requestType']==='password'){
      const [res] = await dbExecuteQuery('SELECT * FROM user WHERE emailId=? AND loginType=?',[body['emailId'],'default']);
      const [res2] = await dbExecuteQuery('SELECT * FROM user WHERE emailId=?',[body['emailId']]);
      if(res?.emailId && res2?.emailId){
        const response = await handler(event)
        return sendResponse(reqId, JSON.parse(response.statusCode), JSON.parse(response.body));
      }
      else if(res2?.emailId && !res?.emailId){
        return sendResponse(reqId, 400, { message: 'Sign in using google' });
      }
      else{
        return sendResponse(reqId, 400, { message: 'User does not exists' });
      }
    }
    // validating if email already exists in the database
    else{
      const [res] = await dbExecuteQuery('SELECT * FROM user WHERE emailId = ?',[body['emailId']])
      if (res?.emailId) {
        return sendResponse(reqId, 400, { message: 'User already exists' });
      }
      else{
        const response = await handler(event)
        return sendResponse(reqId, JSON.parse(response.statusCode), JSON.parse(response.body));
    }
    }
    

  } catch (error) {
    LOGGER.error(reqId, componentName, 'Exception raised :: ', error);
    return sendResponse(reqId, 500, {
      message: error.message || 'Internal Server Error',
      error
    });
  }

};