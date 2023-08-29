import { nanoid } from 'nanoid';

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { dbExecuteQuery } from './utils/dbConnect.js';
import { updateSchoolSchema } from './utils/schema.js';

const componentName = 'auth-service/addSchoolDetails';

//Lambda Handler
export const handler = async (event) => {
  const reqId = nanoid();
  try {
    LOGGER.info(reqId, componentName, "Event received", event);
    const body = await JSON.parse(event.body);
    const itemId = nanoid();

    // validate request body,
    const { error, value } = await updateSchoolSchema.validate(body, { abortEarly: false });
    if (error) {
      LOGGER.error(reqId, componentName, `Invalid request body`, error);
      const err = {
        message: `Invalid request body`,
        body: error
      };
      return sendResponse(reqId, 400, err);
    }


    // validating if user exists in the database
    if (body['id']) {
      const [res] = await dbExecuteQuery('SELECT loginType FROM user WHERE id = ?',[body['id']])
      if (res?.loginType==='google') {
        const customSchoolId = nanoid()
        let givenSchoolId = ''
        
        if(body['createSchool']==='true'){
            const schoolDistrict = body['districtName'].trim()
            const schoolName = body['schoolName'].trim()
            const [getSchoolQuery] = await dbExecuteQuery('SELECT * FROM school WHERE LOWER(name) = LOWER(?) AND LOWER(district)=LOWER(?)',[schoolName,schoolDistrict])
            
            if(getSchoolQuery && getSchoolQuery.name){
              // return sendResponse(reqId, 400, { message: 'School already exists. Choose from dropdown.'}); 
              givenSchoolId=getSchoolQuery.id
            }
            else{
              const insertQuery = `INSERT INTO school(id,district,name,status) VALUES (?,?,?,?);`
              const insertValues = [customSchoolId,schoolDistrict,schoolName,'active'] 
              const result = await dbExecuteQuery(insertQuery,insertValues);
              LOGGER.info(reqId, componentName, 'Response from DB :: ', result);
              }
            }
      
            const schoolId = body['createSchool']==='true' && !givenSchoolId.length?customSchoolId:givenSchoolId.length?givenSchoolId:body['schoolId'];
            const insertQuery = `UPDATE user SET schoolId = ? WHERE id = ?;`
            const insertValues = [schoolId,body['id']]
        
            const result = await dbExecuteQuery(insertQuery,insertValues);
            LOGGER.info(reqId, componentName, 'Response from DB :: ', result);
            return sendResponse(reqId, 200, { message: 'School Details Added Successfully!'});

      }
      else{
        return sendResponse(reqId, 400, { message: 'Cannot update Details, please try again later'});        
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