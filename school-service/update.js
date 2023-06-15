import { nanoid } from 'nanoid';
import parser from 'lambda-multipart-parser';
// import AWS from 'aws-sdk';
import AWS from '/var/runtime/node_modules/aws-sdk/lib/aws.js'

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { dbExecuteQuery } from './utils/dbConnect.js';
import {  updateSchoolSchema } from './utils/schema.js';

const componentName = 'school-service/update';
const SWIIRL_SCHOOL_BUCKET = process.env.SWIIRL_SCHOOL_BUCKET;
const s3 = new AWS.S3();

export const handler = async (event) => {
  const reqId = nanoid();
  try {
    const parsedBody = await parser.parse(event);
    const id = parsedBody['schoolId'];
    const userId = parsedBody['userId'];
    const itemId = nanoid();

    // validate request body,
    const { error, value } = await updateSchoolSchema.validate(parsedBody, { abortEarly: false });
    if (error) {
      LOGGER.error(reqId, componentName, `Invalid request body`, error);
      const err = {
        message: `Invalid request body`,
        body: error
      };
      return sendResponse(reqId, 400, err);
    }

    // Get the existing user data from the database
    const [user] = await dbExecuteQuery(
        'SELECT * FROM user WHERE id =?;', userId
      );
      if (user.length === 0) {
        return sendResponse(reqId, 404, 'User not found');
      }
    
  

    // Get the existing school data from the database
    const [rows] = await dbExecuteQuery(
      'SELECT * FROM school WHERE id =?;', id
    );


    if (rows.length === 0) {
      return sendResponse(reqId, 404, 'School not found');
    }

    else if(user.schoolId!==rows.id){
      return sendResponse(reqId, 401, 'Unauthorized');
    }

    const schoolData = rows;

    // Merge the existing user data with the updated user data
    const updatedSchoolData = { ...schoolData, ...parsedBody };

    //handling image
    if (parsedBody.files.length > 0) {
      //Add New Image
      const imageParams = {
        Bucket: SWIIRL_SCHOOL_BUCKET,
        Key: `${updatedSchoolData['name']}/${itemId}.${parsedBody.files[0].filename?.split('.').pop()}`,
        Body: parsedBody.files[0].content,
        ContentType: parsedBody.files[0].contentType,
        ContentEncoding: parsedBody.files[0].encoding
      };
      const allowedContentTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      if (allowedContentTypes.includes(parsedBody.files[0].contentType)) {
        imageParams.ContentType = parsedBody.files[0].contentType;
      } else {
        imageParams.ContentType = 'application/octet-stream';
      }

      const s3Response = await s3.putObject(imageParams).promise();
      updatedSchoolData['imageKey'] = `${updatedSchoolData['name']}/${itemId}.${parsedBody.files[0].filename?.split('.').pop()}`;
      LOGGER.info(reqId, componentName, 'Response from S3 :: ', s3Response);

      //Delete Old Image
      const deleteParams = {
        Bucket: SWIIRL_SCHOOL_BUCKET,
        Key: schoolData.imageKey,
      };
      const s3ResponseDelete = await s3.deleteObject(deleteParams).promise();
      
      LOGGER.error(reqId, componentName, `S3 Response Delete`, {
        message: "S3 Response: Delete Old Picture",
        data: s3ResponseDelete,
      });

    }

    // Update the school data in the database
    const result = await dbExecuteQuery(
      'UPDATE school SET name = ?,district = ?, description = ? ,imageKey = ? WHERE id = ?;',
      [updatedSchoolData.name,updatedSchoolData.district, updatedSchoolData.description, updatedSchoolData.imageKey,id]
    );
    
    LOGGER.info(reqId, componentName, 'Response from DB :: ', result);
    return sendResponse(reqId, 200, { message: 'School updated successfully'});
  } 
  catch (error) {
    LOGGER.error(reqId, componentName, 'Exception raised :: ', error);
    return sendResponse(reqId, 500, {
      message: error.message || 'Internal Server Error',
      error
    });
  }
};
