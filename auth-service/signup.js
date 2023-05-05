import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import generateToken from './utils/generateToken.js';
import { dbExecuteQuery, pool } from './utils/dbConnect.js';
import { signupSchema } from './utils/schema.js';

const componentName = 'auth-service/signup';

//Lambda Handler
export const handler = async (event) => {
  const reqId = nanoid();
  try {
    LOGGER.info(reqId, componentName, "Event received", event);
    const body = await JSON.parse(event.body);
    const itemId = nanoid();
    const hashedPassword = await bcrypt.hash(body['password'], 10);
    const customSchoolId = nanoid();


    // validate request body,
    const { error, value } = await signupSchema.validate(body, { abortEarly: false });
    if (error) {
      LOGGER.error(reqId, componentName, `Invalid request body`, error);
      const err = {
        message: `Invalid request body`,
        body: error
      };
      return sendResponse(reqId, 400, err);
    }

    // validating if email already exists in the database
    if (body['emailId']) {
      const [res] = await dbExecuteQuery('SELECT * FROM user WHERE emailId = ?',[body['emailId']])
      if (res?.emailId) {
        return sendResponse(reqId, 400, { message: 'User already exists' });
      }
    }

    if(body['createSchool']==='true'){
      const insertQuery = `INSERT INTO school(id,district,name,status) VALUES (?,?,?,?);`
      const insertValues = [customSchoolId,body['districtName'],body['schoolName'],'active'] 
      const result = await dbExecuteQuery(insertQuery,insertValues);
      LOGGER.info(reqId, componentName, 'Response from DB :: ', result);
    }

    const schoolId = body['createSchool']==='true'?customSchoolId:body['schoolId'];
    const insertQuery = `INSERT INTO user(id,firstname,lastname,emailId,schoolId,password,loginType,status) VALUES (?,?,?,?,?,?,'default','pending');`
    const insertValues = [itemId,body['firstname'],body['lastname'],body['emailId'],schoolId,hashedPassword]

    //If not, inserting user data in the database
    const result = await dbExecuteQuery(insertQuery,insertValues);
    LOGGER.info(reqId, componentName, 'Response from DB :: ', result);

    const token = generateToken(itemId,body['emailId']);
    pool.end();
    return sendResponse(reqId, 200, { message: 'Account created successfully!', data: { id: itemId, token: token } });

  } catch (error) {
    LOGGER.error(reqId, componentName, 'Exception raised :: ', error);
    return sendResponse(reqId, 500, error?.message || 'Internal Server Error');
  }

};