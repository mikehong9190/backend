import { nanoid } from 'nanoid';
// import AWS from 'aws-sdk';

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { dbExecuteQuery, pool } from './utils/dbConnect.js';
import {  verifyOTPSchema } from './utils/schema.js';

const componentName = 'auth-service/verifyOTP';

//Lambda Handler
export const handler = async (event) => {
  const reqId = nanoid();

  try {
    LOGGER.info(reqId, componentName, "Event received", event);
    const body = await JSON.parse(event.body);
    const requestType = body['requestType']==='email'?'verify-email':'reset-password'

    // validate request body,
    const { error, value } = await verifyOTPSchema.validate(body, { abortEarly: false });
    if (error) {
      LOGGER.error(reqId, componentName, `Invalid request body`, error);
      const err = {
        message: `Invalid request body`,
        body: error
      };
      return sendResponse(reqId, 400, err);
    }

    // validating if otp with this email address exists in the database
    const query = `SELECT * FROM otp
                   WHERE emailId = ?
                   AND type = ?
                   AND otp = ?
                   AND createdAt >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)`

    const [res] = await dbExecuteQuery(query,[body['emailId'],requestType,body['otp']])
    
    // console.log("res------",res)
    if (res?.emailId) {
      if(body['requestType']==='email'){
        const query = `DELETE FROM otp
                       WHERE emailId = ?
                       AND type = ?
                       AND otp = ?`
        const res = await dbExecuteQuery(query,[body['emailId'],requestType,body['otp']])

        const userquery = `UPDATE user
                        SET status=?
                       WHERE emailId = ?`
        const userres = await dbExecuteQuery(userquery,['active',body['emailId']])
        return sendResponse(reqId,200,{message:"OTP Verified Successfully"})
      } 
      else{
        const query =`UPDATE otp
                      SET status=?
                      WHERE emailId = ?
                      AND type = ?
                      AND otp = ?`
        const res = await dbExecuteQuery(query,['verified',body['emailId'],requestType,body['otp']])
        return sendResponse(reqId,200,{message:"OTP Verified Successfully"})

      }        
    }
    else{
        return sendResponse(reqId, 400, { message: 'Incorrect OTP' });
    }

  } catch (error) {
    LOGGER.error(reqId, componentName, 'Exception raised :: ', error);
    return sendResponse(reqId, 500, {
      message: error.message || 'Internal Server Error',
      error
    });
  }

};