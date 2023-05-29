import { nanoid } from 'nanoid';
// import parser from 'lambda-multipart-parser';
// import AWS from 'aws-sdk';
// import AWS from '/var/runtime/node_modules/aws-sdk/lib/aws.js'

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { dbExecuteQuery } from './utils/dbConnect.js';
import { updateInitiativeSchema } from './utils/schema.js';

const componentName = 'initiative-service/update';
// const SWIIRL_INITIATIVE_BUCKET = process.env.SWIIRL_INITIATIVE_BUCKET;
// const s3 = new AWS.S3();

//Lambda Handler
export const handler = async (event) => {
  const reqId = nanoid();
  try {
    // LOGGER.info(reqId, componentName, "Event received", event);
    const parsedBody = await JSON.parse(event.body);
    let data = {};

    // validate request body,
    const { error, value } = await updateInitiativeSchema.validate(parsedBody, { abortEarly: false });
    if (error) {
      LOGGER.error(reqId, componentName, `Invalid request body`, error);
      const err = {
        message: `Invalid request body`,
        body: error
      };
      return sendResponse(reqId, 400, err);
    }

    
    const [res] = await dbExecuteQuery(`SELECT *
        FROM user u
        JOIN initiative i ON u.id = i.userId
        WHERE u.id = ?
        AND i.id = ?;`,[parsedBody['userId'],parsedBody['initiativeId']])

    if (res?.firstName && res?.target) {
        data = res;
    } 
    else{
    return sendResponse(reqId, 400, { message: 'Initiative Not Found' });
    }


    if (parsedBody.imageKeys.length > 0) {
      for(let i=0;i<parsedBody.imageKeys.length;i++){
        const item = parsedBody.imageKeys[i];
        const imageId = item.match(/\/([^/]+)\./)[1];
        // const imageParams = {
        //     Bucket: SWIIRL_INITIATIVE_BUCKET,
        //     Key: `${user['firstName']}-${user['lastName']}/${parsedBody['name']}-${itemId}/${imageId}.${item.filename.split('.').pop()}`,
        //     Body: item.content,
        //     ContentType: item.contentType,
        //     ContentEncoding: item.encoding
        // };
  
        // const allowedContentTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
        // if (allowedContentTypes.includes(item.contentType)) {
        //     imageParams.ContentType = item.contentType;
        // } else {
        //     imageParams.ContentType = 'application/octet-stream';
        // }
        // const s3Response = await s3.putObject(imageParams).promise();
        // const image_key = `${user['firstName']}-${user['lastName']}/${parsedBody['name']}-${itemId}/${imageId}.${item.filename.split('.').pop()}`;
        // LOGGER.info(reqId, componentName, 'Response from S3 :: ', s3Response);
        const result = await dbExecuteQuery(
            'INSERT INTO image (id,initiativeId,imageKey,status) VALUES (?,?,?,?)',
            [imageId,parsedBody['initiativeId'], item,'active']
        );
        LOGGER.info(reqId, componentName, 'Response from DB :: ', result);
      }
  }

  
  return sendResponse(reqId, 200, { message: 'Images Added Successfully'});

  } catch (error) {
    LOGGER.error(reqId, componentName, 'Exception raised :: ', error);
    return sendResponse(reqId, 500, {
      message: error.message || 'Internal Server Error',
      error
    });
  }

};