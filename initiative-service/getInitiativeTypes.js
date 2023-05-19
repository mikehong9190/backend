import { nanoid } from 'nanoid';

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { dbExecuteQuery } from './utils/dbConnect.js';

const componentName = 'initiative-service/getInitiativeTypes';

// Lambda Handler
export const handler = async () => {
  const reqId = nanoid();
  try {
    LOGGER.info(reqId, componentName, "Get Initiative types", null);
    const query = `SELECT * FROM initiativeType ORDER BY createdAt DESC`;
    const dbResp = await dbExecuteQuery(query);

    // finally return response
    return sendResponse(reqId, 200, {
      message: 'success',
      data: dbResp
    });

  } catch (error) {
    return sendResponse(reqId, 500, {
      message: error.message || 'Internal Server Error',
      error
    });
  }
}
