import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client } from "@aws-sdk/client-s3";

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { nanoid } from 'nanoid';
import { dbExecuteQuery } from "./utils/dbConnect.js";


const componentName = "initiative-service/getPresignedUrl.js";
const SWIIRL_INITIATIVE_BUCKET = process.env.SWIIRL_INITIATIVE_BUCKET;
const REGION = process.env.REGION;

export const handler = async (event) => {
  let first_name ='';
  let last_name ='';
  let urls = [];
  let imageKeys = [];
  const reqId = nanoid();
  const s3Client = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
    },
  });
  
try {
  LOGGER.info(reqId, componentName, "Event received", event);
  const body = JSON.parse(event.body);


  if(body['userId']){
    const [res] = await dbExecuteQuery('SELECT * FROM user WHERE id = ?',[body['userId']])
      if (res?.id) {
        first_name = res.firstName;
        last_name = res.lastName
      }
      else{
        return sendResponse(reqId, 400, { message: 'User Not Found' });
      }
  }

  for( let type of body['contentTypes']){
    const imageId = nanoid();
    // console.log("type---",type)
    const key = `${first_name}-${last_name}/${body['initiative']}-${reqId}/${imageId}.${type.split('/')[1]}`;
    const bucketParams = {
      Bucket: SWIIRL_INITIATIVE_BUCKET,
      Key: key,
      ContentType: type
    };
    LOGGER.error(reqId, componentName, `Bucket Log`, {"message": "Bucket params", data: bucketParams});
    const command = new PutObjectCommand(bucketParams);
    const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 600,
    });
    urls.push(signedUrl);
    imageKeys.push(key);
  }
  // return sendResponse(reqId, 200, { message: event});

  return sendResponse(reqId, 200, { message: 'Signed Url Success',id:reqId,urls :urls,keys:imageKeys});

} catch (error) {
  LOGGER.error(reqId, componentName, 'Exception raised :: ', error);
    return sendResponse(reqId, 500, {
      message: error.message || 'Internal Server Error',
      error
    });
}
  
};
