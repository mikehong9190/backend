import { nanoid } from 'nanoid';

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { dbExecuteQuery } from './utils/dbConnect.js';
import {  getInitiativeSchema } from './utils/schema.js';

const componentName = 'initiative-service/getUserInitiatives';
const SWIIRL_INITIATIVE_BUCKET = process.env.SWIIRL_INITIATIVE_BUCKET;


export const handler = async (event) => {
  const reqId = nanoid();
  try {
    const queryParams = event.queryStringParameters;
    const id = queryParams?.id;

    // validate request body,
    const { error, value } = await getInitiativeSchema.validate(queryParams, { abortEarly: false });
    if (error) {
      LOGGER.error(reqId, componentName, `Invalid request body`, error);
      const err = {
        message: `Invalid request body`,
        body: error
      };
      return sendResponse(reqId, 400, err);
    }

    // Get user's initiatives
    const initiative = await dbExecuteQuery(
      `SELECT i.id ,i.target,i.initiativeTypeId, i.numberOfStudents,i.grade, i.name, GROUP_CONCAT(img.imageKey) AS images
      FROM initiative AS i
      LEFT JOIN image AS img ON i.id = img.initiativeId
      WHERE i.id=?`, id
    );

    


    if (initiative.length==0) {
      return sendResponse(reqId, 404, 'Initiative Not found');
    }
    let images = initiative[0].images?.split(',').map(str => `https://${SWIIRL_INITIATIVE_BUCKET}.s3.amazonaws.com/` + str) || [];
    initiative[0].images = images
    

    
    LOGGER.info(reqId, componentName, 'Response from DB :: ',initiative[0]);
    return sendResponse(reqId, 200, { message: 'Initiative Fetched Successfully',data:initiative[0]});
  } 
  catch (error) {
    LOGGER.error(reqId, componentName, 'Exception raised :: ', error);
    return sendResponse(reqId, 500, {
      message: error.message || 'Internal Server Error',
      error
    });
  }
};
