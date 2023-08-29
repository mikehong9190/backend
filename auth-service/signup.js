import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import generateToken from './utils/generateToken.js';
import { dbExecuteQuery, pool } from './utils/dbConnect.js';
import { signupSchema } from './utils/schema.js';

const componentName = 'auth-service/signup';
const googleClient = new OAuth2Client(process.env.ANDROID_GOOGLE_CLIENT_ID);

//Lambda Handler
export const handler = async (event) => {
  const reqId = nanoid();
  try {
    LOGGER.info(reqId, componentName, "Event received", event);
    const body = await JSON.parse(event.body);
    const itemId = nanoid();
    const decodingToken = body.platform ==='ios'?process.env.IOS_GOOGLE_CLIENT_ID:process.env.ANDROID_GOOGLE_CLIENT_ID
    if(body.idToken){
      const ticket = await googleClient.verifyIdToken({
        idToken: body.idToken,
        audience: decodingToken,
      });
      let user = ticket.getPayload();
      //Validating if email already exists in db
        const [res] = await dbExecuteQuery('SELECT * FROM user WHERE emailId = ?',[user.email])
        if (res?.emailId) {
          const token = generateToken(res?.id,res.emailId);
          return sendResponse(reqId, 200, { message: 'Logged in Successfully', data: { id: res?.id, token: token } });       
        }
        else{
          const insertQuery = `INSERT INTO user(id,firstname,lastname,emailId,profilePictureKey,loginType,status) VALUES (?,?,?,?,?,'google','active');`
          const insertValues = [itemId,user.given_name,user.family_name,user.email,user.picture]
          const result = await dbExecuteQuery(insertQuery,insertValues);
          LOGGER.info(reqId, componentName, 'Response from DB :: ', result);
          const token = generateToken(itemId,user.email);
          return sendResponse(reqId, 200, { message: 'Account created successfully!', data: { id: itemId, token: token } });
        }
     
    }
    else{
      const hashedPassword = await bcrypt.hash(body['password'], 10);
      const customSchoolId = nanoid();
      let givenSchoolId = ''

      // Validate request body
      const { error, value } = await signupSchema.validate(body, { abortEarly: false });
      if (error) {
        LOGGER.error(reqId, componentName, `Invalid request body`, error);
        const err = {
          message: `Invalid request body`,
          body: error
        };
        return sendResponse(reqId, 400, err);
      }

      // Validating if email already exists in the database
      if (body['emailId']) {
        const [res] = await dbExecuteQuery('SELECT * FROM user WHERE emailId = ?',[body['emailId']])
        if (res?.emailId) {
          return sendResponse(reqId, 400, { message: 'User already exists' });
        }
      }

      if(body['createSchool']==='true'){
        const schoolDistrict = body['districtName'].trim()
        const schoolName = body['schoolName'].trim()
        const [getSchoolQuery] = await dbExecuteQuery('SELECT * FROM school WHERE LOWER(name) = LOWER(?) AND LOWER(district)=LOWER(?)',[schoolName,schoolDistrict])
            
        if(getSchoolQuery && getSchoolQuery.name){
            // return sendResponse(reqId, 400, { message: 'School already exists. Choose from dropdown.'});
            givenSchoolId=getSchoolQuery.id      
        }
        else{
          const insertQuery = `INSERT INTO school(id,district,name,createdBy,status) VALUES (?,?,?,?,?);`
          const insertValues = [customSchoolId,body['districtName'],body['schoolName'],itemId,'active'] 
          const result = await dbExecuteQuery(insertQuery,insertValues);
          LOGGER.info(reqId, componentName, 'Response from DB :: ', result);
          LOGGER.info(reqId, componentName, `School Created By : ${body['firstname']}-${body['lastname']}`);
        }          
      }
      const schoolId = body['createSchool']==='true' && !givenSchoolId.length?customSchoolId:givenSchoolId.length?givenSchoolId:body['schoolId'];
      const insertQuery = `INSERT INTO user(id,firstName,lastName,emailId,schoolId,password,loginType,status) VALUES (?,?,?,?,?,?,'default','active');`
      const insertValues = [itemId,body['firstname'],body['lastname'],body['emailId'],schoolId,hashedPassword]

      //If not, inserting user data in the database
      const result = await dbExecuteQuery(insertQuery,insertValues);
      LOGGER.info(reqId, componentName, 'Response from DB :: ', result);

      const token = generateToken(itemId,body['emailId']);

      return sendResponse(reqId, 200, { message: 'Account created successfully!', data: { id: itemId, token: token } });

    }  
  } catch (error) {
    LOGGER.error(reqId, componentName, 'Exception raised :: ', error);
    return sendResponse(reqId, 500, {
      message: error.message || 'Internal Server Error',
      error
    });
  }

};