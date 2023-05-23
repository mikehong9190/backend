import { nanoid } from 'nanoid';

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
// import { searchSchema } from './utils/schema.js';
import { dbExecuteQuery } from './utils/dbConnect.js';

const componentName = 'school-service/getDetails';
const SWIIRL_INITIATIVE_BUCKET = process.env.SWIIRL_INITIATIVE_BUCKET;

// Lambda Handler
export const handler = async (event) => {
  const reqId = nanoid();
  try {
    LOGGER.info(reqId, componentName, "Event received", event);
    const queryParams = event.queryStringParameters;
    
    // ############ Main business logic ############
    // const searchText = queryParams.text;
    // const limit = queryParams.limit != undefined ? parseInt(queryParams.limit) : 20;
    // const page = queryParams.page != undefined ? parseInt(queryParams.page) : 1;
    // const offset = (page - 1) * limit;
    let searchQuery = '';
    
    if(queryParams.schoolId){
      // searchQuery = `SELECT u.firstName as user_first_name, u.lastName as user_last_name, s.name as school_name, s.district as school_district,i.name AS initiative_name, i.grade AS initiative_grade, GROUP_CONCAT(img.imageKey) AS images
      // FROM initiative AS i
      // JOIN user AS u ON i.userId = u.id
      // JOIN school AS s ON u.schoolId = s.id
      // LEFT JOIN image AS img ON i.id = img.initiativeId
      // WHERE s.id = ?
      // GROUP BY i.id, i.name, i.grade;`;
      searchQuery=`SELECT u.firstName AS user_first_name,u.lastName AS user_last_name, GROUP_CONCAT(img.imageKey) AS images
      FROM user AS u
      JOIN initiative AS i ON u.id = i.userId
      LEFT JOIN image AS img ON i.id = img.initiativeId
      WHERE u.schoolId = ?
      GROUP BY u.id, u.firstName,u.lastName;`
    }
    
    

    LOGGER.info(reqId, componentName, 'seach query to be executed', searchQuery);
    const dbResp = await dbExecuteQuery(searchQuery,[queryParams.schoolId]);
    // console.log('db respose',dbResp,dbResp.data)
    if(dbResp){
        for (let i=0;i<=dbResp.length-1;i++){
            console.log("depres",dbResp[i])
            let allImages = dbResp[i]?.images?.split(',').map(str => `https://${SWIIRL_INITIATIVE_BUCKET}.s3.amazonaws.com/` + str);
            dbResp[i].images = allImages?allImages:[]
        }
    
    }
    

    // ############ Handler end ############

    // finally return response
    return sendResponse(reqId, 200, {
      message: 'success',
      data: dbResp
    });

  } catch (error) {
    LOGGER.error(reqId, componentName, "Event received", event);
    return sendResponse(reqId, 500, {
      message: error.message || 'Internal Server Error',
      error
    });
  }
}
