import { nanoid } from 'nanoid';
// import AWS from 'aws-sdk';
// import otpGenerator from 'otp-generator';

// import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { dbExecuteQuery, pool } from './utils/dbConnect.js';
import { handler } from './sendOTP.js';
import {  validateEmailSchema } from './utils/schema.js';
const componentName = 'auth-service/validateEmail';
// const lambda = new AWS.Lambda();

//Lambda Handler
export const emailhandler = async (event) => {
  const reqId = nanoid();
  
  try {
    LOGGER.info(reqId, componentName, "Event received", event);
    const body = await JSON.parse(event.body);
    // const lambdaClient = new LambdaClient({ region: process.env.REGION });
    // const payload={
    //   emailId:body['emailId'],
    //   requestType:"email"
    // }
    // console.log("payload----",payload)
    // console.log("AWS----",process.env.AWS_ACCESS_KEY_ID)
    // const invokeParams = {
    //   FunctionName: "swiirl-auth-dev-sendOTP",
    //   InvocationType:'RequestResponse',
    //   LogType:'None',
    //   Payload: event.body,
    // };
  
  // const invokeCommand = new InvokeCommand(invokeParams);
  

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
      // const invokeResponse = await lambdaClient.send(invokeCommand);
      // const responsePayload = JSON.parse(invokeResponse.Payload.toString());
      // const response = await lambda.invoke(invokeParams).promise();
      const response = await handler(event)
      return sendResponse(reqId, 200, JSON.parse(response.body));
    }

  } catch (error) {
    LOGGER.error(reqId, componentName, 'Exception raised :: ', error);
    return sendResponse(reqId, 500, {
      message: error.message || 'Internal Server Error',
      error
    });
  }

};