import { nanoid } from 'nanoid';
// import AWS from 'aws-sdk';
import AWS from '/var/runtime/node_modules/aws-sdk/lib/aws.js'
import otpGenerator from 'otp-generator';

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { dbExecuteQuery } from './utils/dbConnect.js';
import {  sendOTPSchema} from './utils/schema.js';
import { resetPasswordTemplate } from './utils/emailTemplates/resetPassword.js';
import { verifyEmailTemplate } from './utils/emailTemplates/verifyEmail.js';

const sendPromise = new AWS.SES();
const componentName = 'auth-service/sendOTP';

//Lambda Handler
export const handler = async (event) => {
  const reqId = nanoid();
  const otp = otpGenerator.generate(6, { lowerCaseAlphabets:false,upperCaseAlphabets: false, specialChars: false });
  

  try {
    LOGGER.info(reqId, componentName, "Event received", event);
    const body = await JSON.parse(event.body);

     // validate request body,
  const { error, value } = await sendOTPSchema.validate(body, { abortEarly: false });
  if (error) {
    LOGGER.error(reqId, componentName, `Invalid request body`, error);
    const err = {
      message: `Invalid request body`,
      body: error
    };
    return sendResponse(reqId, 400, err);
  }

    const template = body['requestType']==='email'?verifyEmailTemplate(otp):resetPasswordTemplate(otp)
    const subject = body['requestType']==='email'?'Verify Your Email for Swiirl':'Reset Your Swiirl Password'
    const type = body['requestType']==='email'?'verify-email':'reset-password'

    const sendEmailParams = {
        Source: 'punnitbhesota@gmail.com',
        Destination: {
            ToAddresses: [
            //   'aadesh10kamble@gmail.com',
              // 'punnitbhesota@gmail.com'
            //   body['emailId'],
            'amanattrish@yahoo.com',
            "swiirl-user@mailinator.com",      
            ],
        },
        Message: {
            Body: {
                Html: {
                    // Charset: 'UTF-8',
                    Data: template,
                },
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject,
            },
        },
      };
  
    try {
        const data = await sendPromise.sendEmail(sendEmailParams).promise();
        LOGGER.info(reqId, componentName, 'Response from SES :: ', data);

        const otpId = nanoid();
        const insertQuery = `INSERT INTO otp (id,otp,emailId,type,status) VALUES (?,?,?,?,?);`
        const insertValues = [otpId,otp,body['emailId'],type,'pending'] 
        const result = await dbExecuteQuery(insertQuery,insertValues);
        LOGGER.info(reqId, componentName, 'Response from DB :: ', result);
        
        return sendResponse(reqId, 200, { message: 'OTP sent successfully' });
    } catch (error) {
        console.error({
            reqId,
            componentName,
            message: 'Send Email Failed',
            error,
        });
        throw error;
    }
    

  } catch (error) {
    LOGGER.error(reqId, componentName, 'Exception raised :: ', error);
    return sendResponse(reqId, 500, error?.message || 'Internal Server Error');
  }

};