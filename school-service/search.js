import { nanoid } from 'nanoid';

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { searchSchema } from './utils/schema.js';
import { dbExecuteQuery } from './utils/dbConnect.js';

const componentName = 'school-service/search';

// Lambda Handler
export const handler = async (event) => {
  const reqId = nanoid();
  try {
    LOGGER.info(reqId, componentName, "Event received", event);
    const queryParams = event.queryStringParameters;

    // step-1: validate request body,
    const { error, value } = await searchSchema.validate(queryParams, { abortEarly: false });
    if (error) {
      LOGGER.error(reqId, componentName, `Invalid request body`, error);
      const err = {
        message: `Invalid request body`,
        body: error
      };
      return sendResponse(reqId, 400, err);
    }

    // ############ Main business logic ############
    const searchText = queryParams.text;
    const limit = queryParams.limit != undefined ? parseInt(queryParams.limit) : 20;
    const page = queryParams.page != undefined ? parseInt(queryParams.page) : 1;
    const offset = (page - 1) * limit;

    const searchQuery = `SELECT id, name, district FROM school WHERE name LIKE '%${searchText}%' AND status = 'active' ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${offset}`;

    LOGGER.info(reqId, componentName, 'seach query to be executed', searchQuery);
    const [dbResp] = await dbExecuteQuery(searchQuery);


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
