import { nanoid } from 'nanoid';
import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';

const componentName = 'index-service/index';

export const handler = async (event) => {
  const reqId = nanoid();

  LOGGER.info(reqId, componentName, 'Event :: ', event);
  return sendResponse('root', 200, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Credentials': '*'
    }, body: { message: 'Root is alive' }
  });
};
