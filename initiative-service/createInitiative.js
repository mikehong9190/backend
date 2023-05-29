import { nanoid } from 'nanoid';
// import parser from 'lambda-multipart-parser';
// import AWS from 'aws-sdk';
// import AWS from '/var/runtime/node_modules/aws-sdk/lib/aws.js'

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { dbExecuteQuery } from './utils/dbConnect.js';
import { createInitiativeSchema } from './utils/schema.js';

const componentName = 'initiative-service/createInitiative';
// const SWIIRL_INITIATIVE_BUCKET = process.env.SWIIRL_INITIATIVE_BUCKET;
// const s3 = new AWS.S3();

//Lambda Handler
export const handler = async (event) => {
  const reqId = nanoid();
  try {
    // LOGGER.info(reqId, componentName, "Event received", event);
    const parsedBody = JSON.parse(event.body);
    // const itemId = nanoid();
    let user = {};

    // validate request body,
    const { error, value } = await createInitiativeSchema.validate(parsedBody, { abortEarly: false });
    if (error) {
      LOGGER.error(reqId, componentName, `Invalid request body`, error);
      const err = {
        message: `Invalid request body`,
        body: error
      };
      return sendResponse(reqId, 400, err);
    }

    
    const [res] = await dbExecuteQuery('SELECT * FROM user WHERE id = ?',[parsedBody['userId']])
    // console.log("res----",res)
      if (res?.id) {
        user = res;
      }
      else{
        return sendResponse(reqId, 400, { message: 'User Not Found' });
      }

    const insertQuery = `INSERT INTO initiative(id,userId,initiativeTypeId,target,grade,numberOfStudents,name,status) VALUES (?,?,?,?,?,?,?,?);`
    const insertValues = [parsedBody['initiativeId'],parsedBody['userId'],parsedBody['initiativeTypeId'],parsedBody['target'],parsedBody['grade'],parsedBody['numberOfStudents'],parsedBody['name'],'active'] 
    const result = await dbExecuteQuery(insertQuery,insertValues);
    LOGGER.info(reqId, componentName, 'Response from DB :: ', result);

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

  
  return sendResponse(reqId, 200, { message: 'Initiative created successfully!'});

  } catch (error) {
    LOGGER.error(reqId, componentName, 'Exception raised :: ', error);
    return sendResponse(reqId, 500, {
      message: error.message || 'Internal Server Error',
      error
    });
  }

};