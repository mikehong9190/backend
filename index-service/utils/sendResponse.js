// import LOGGER from './logger.js';
const LOGGER = require('./logger.js');


const componentName = 'auth-service/sendResponse';

const sendResponse = (reqId, statusCode, data) => {
  const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Credentials': true,
  };
  LOGGER.info(reqId,componentName, `Status Code: ${statusCode}`, data);

  return {
    statusCode: statusCode,
    headers: responseHeaders,
    body: JSON.stringify(data, null, 2),
  };
};

// export default sendResponse;
module.exports = {sendResponse}
