import { nanoid } from 'nanoid';

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { dbExecuteQuery } from './utils/dbConnect.js';
import {  getProfileSchema } from './utils/schema.js';

const componentName = 'profile-service/getUser';
const SWIIRL_USER_BUCKET = process.env.SWIIRL_USER_BUCKET;
const SWIIRL_INITIATIVE_BUCKET = process.env.SWIIRL_INITIATIVE_BUCKET;


export const handler = async (event) => {
  const reqId = nanoid();
  try {
    const queryParams = event.queryStringParameters;
    const id = queryParams?.id;

    // validate request body,
    const { error, value } = await getProfileSchema.validate(queryParams, { abortEarly: false });
    if (error) {
      LOGGER.error(reqId, componentName, `Invalid request body`, error);
      const err = {
        message: `Invalid request body`,
        body: error
      };
      return sendResponse(reqId, 400, err);
    }

    // Get user details
    const [user] = await dbExecuteQuery(
      'SELECT firstName,lastName,bio,profilePictureKey,emailId,schoolId,loginType FROM user WHERE id = ?', id
    );

    

    if (!user) {
      return sendResponse(reqId, 404, 'User not found');
    }
    // let userData = user;
    let userData={
        firstName:user.firstName,
        lastName:user.lastName,
        bio:user.bio?user.bio:'',
        email:user.emailId,
        profilePicture:user.profilePictureKey
    }
    console.log("userdata1",userData)

    if(userData['profilePicture']){
      userData['profilePicture'] = userData['profilePicture'].startsWith('https')?userData['profilePicture']:`https://${SWIIRL_USER_BUCKET}.s3.amazonaws.com/${user['profilePictureKey']}`
    }

    else{
      userData['profilePicture']=''
    }
    console.log("userdata2",userData)

    // userData['profilePicture'] = user['profilePictureKey']&&user['loginType']==='default'?`https://${SWIIRL_USER_BUCKET}.s3.amazonaws.com/${user['profilePictureKey']}`:user['loginType']==='google'?user['profilePictureKey']:'';


    //Get the user's school details
    if(user.schoolId){
      const [school] = await dbExecuteQuery(
        'SELECT district,name FROM school WHERE id = ?', user.schoolId
    );
    
    userData['schoolName'] = school?.name?school.name:'';
    userData['schoolDistrict'] = school?.district?school?.district:'';
    userData['schoolId'] = user.schoolId
    }
    

    //Getting user's initiative details
    const [dbResp] = await dbExecuteQuery(`SELECT
    SUM(i.actual) AS moneyRaised,
    COUNT(CASE WHEN i.actual >= i.target THEN 1 END) AS goalsMet,
    GROUP_CONCAT(i.id) AS initiatives
    FROM
    user u
    JOIN initiative i ON u.id = i.userId
    WHERE
    u.id = ? `,id)
    userData['goalsMet'] = dbResp.goalsMet?dbResp.goalsMet:0
    userData['moneyRaised'] = dbResp.moneyRaised?dbResp.moneyRaised:0
    
    if(dbResp){
      let initiatives = dbResp?.initiatives?.split(',')

    //Getting user's initiative images
    const images = await dbExecuteQuery(`
        SELECT 
        GROUP_CONCAT(i.imageKey) AS images
        FROM image i
        WHERE i.initiativeId IN (?)`,[initiatives])
    
    let allImages = images[0]?.images?.split(',').map(str => `https://${SWIIRL_INITIATIVE_BUCKET}.s3.amazonaws.com/` + str);
    userData['collectibles'] = allImages?allImages:[]
    
    }
    
    LOGGER.info(reqId, componentName, 'Response from DB :: ',userData);
    return sendResponse(reqId, 200, { message: 'User Details Fetched Successfully',data:userData});
  } 
  catch (error) {
    LOGGER.error(reqId, componentName, 'Exception raised :: ', error);
    return sendResponse(reqId, 500, {
      message: error.message || 'Internal Server Error',
      error
    });
  }
};
