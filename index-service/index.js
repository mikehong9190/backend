const LOGGER = require('./utils/logger.js');
const nanoid = require('nanoid');
const sendResponse = require('./utils/sendResponse.js');
const componentName = 'root.index.index';

const handler = async (event) => {
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

module.exports = {handler}