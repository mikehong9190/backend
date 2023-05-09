import { nanoid } from 'nanoid';

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { dbExecuteQuery } from './utils/dbConnect.js';
import { createInitiativeSchema } from './utils/schema.js';

const componentName = 'initiative-service/createInitiative';

//Lambda Handler
export const handler = async (event) => {
  const reqId = nanoid();
  try {
    LOGGER.info(reqId, componentName, "Event received", event);
    const body = await JSON.parse(event.body);
    const itemId = nanoid();

    // validate request body,
    const { error, value } = await createInitiativeSchema.validate(body, { abortEarly: false });
    if (error) {
      LOGGER.error(reqId, componentName, `Invalid request body`, error);
      const err = {
        message: `Invalid request body`,
        body: error
      };
      return sendResponse(reqId, 400, err);
    }

    const insertQuery = `INSERT INTO initiative(id,district,name,status) VALUES (?,?,?,?);`
    const insertValues = [customSchoolId,body['districtName'],body['schoolName'],'active'] 
    const result = await dbExecuteQuery(insertQuery,insertValues);
    LOGGER.info(reqId, componentName, 'Response from DB :: ', result);

    const schoolId = body['createSchool']==='true'?customSchoolId:body['schoolId'];
    // const insertQuery = `INSERT INTO user(id,firstname,lastname,emailId,schoolId,password,loginType,status) VALUES (?,?,?,?,?,?,'default','pending');`
    // const insertValues = [itemId,body['firstname'],body['lastname'],body['emailId'],schoolId,hashedPassword]

    //If not, inserting user data in the database
    // const result = await dbExecuteQuery(insertQuery,insertValues);
    
    LOGGER.info(reqId, componentName, 'Response from DB :: ', result);
    return sendResponse(reqId, 200, { message: 'Initiative created successfully!'});

  } catch (error) {
    LOGGER.error(reqId, componentName, 'Exception raised :: ', error);
    return sendResponse(reqId, 500, error?.message || 'Internal Server Error');
  }

};