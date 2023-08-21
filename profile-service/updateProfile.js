import { nanoid } from 'nanoid';
import parser from 'lambda-multipart-parser';
// import AWS from 'aws-sdk';
import AWS from '/var/runtime/node_modules/aws-sdk/lib/aws.js'

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { dbExecuteQuery } from './utils/dbConnect.js';
import {  updateProfileSchema } from './utils/schema.js';

const componentName = 'profile-service/updateProfile';
const SWIIRL_USER_BUCKET = process.env.SWIIRL_USER_BUCKET;
const s3 = new AWS.S3();

export const handler = async (event) => {
  const reqId = nanoid();
  try {
    const parsedBody = await parser.parse(event);
    const id = parsedBody['id'];
    const itemId = nanoid();

    // validate request body,
    const { error, value } = await updateProfileSchema.validate(parsedBody, { abortEarly: false });
    if (error) {
      LOGGER.error(reqId, componentName, `Invalid request body`, error);
      const err = {
        message: `Invalid request body`,
        body: error
      };
      return sendResponse(reqId, 400, err);
    }

    // Get the existing user data from the database
    const [rows] = await dbExecuteQuery(
      'SELECT * FROM user WHERE id =?;', id
    );


    if (rows.length === 0) {
      return sendResponse(reqId, 404, 'User not found');
    }

    const userData = rows;

    // Merge the existing user data with the updated user data
    const updatedUserData = { ...userData, ...parsedBody };

    //handling image
    if (parsedBody.files.length > 0) {

      //add new image        
      const imageParams = {
        Bucket: SWIIRL_USER_BUCKET,
        Key: `${updatedUserData['firstName']}-${updatedUserData['lastName']}/${itemId}.${parsedBody.files[0].filename.split('.').pop()}`,
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
      updatedUserData['profilePictureKey'] = `${updatedUserData['firstName']}-${updatedUserData['lastName']}/${itemId}.${parsedBody.files[0].filename.split('.').pop()}`;
      
      LOGGER.info(reqId, componentName, 'S3 Response: Add New Profile Picture', s3Response);

      //Delete Old Image
      if(userData.profilePictureKey){
      const deleteParams = {
        Bucket: SWIIRL_USER_BUCKET,
        Key: userData.profilePictureKey,
      };
      const s3ResponseDelete = await s3.deleteObject(deleteParams).promise();
      
      LOGGER.error(reqId, componentName, `S3 Response Delete`, {
        message: "S3 Response: Delete Old Profile Picture",
        data: s3ResponseDelete,
      });
      }
    }

    // Update the user data in the database
    const result = await dbExecuteQuery(
      'UPDATE user SET firstname = ?,lastname = ?, bio = ? ,profilePictureKey = ? WHERE id = ?;',
      [updatedUserData.firstName,updatedUserData.lastName, updatedUserData.bio, updatedUserData.profilePictureKey,id]
    );
    
    LOGGER.info(reqId, componentName, 'Response from DB :: ', result);
    return sendResponse(reqId, 200, { message: 'User updated successfully'});
  } 
  catch (error) {
    LOGGER.error(reqId, componentName, 'Exception raised :: ', error);
    return sendResponse(reqId, 500, {
      message: error.message || 'Internal Server Error',
      error
    });
  }
};
