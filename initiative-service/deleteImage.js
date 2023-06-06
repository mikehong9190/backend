import LOGGER from "./utils/logger.js";
import sendResponse from "./utils/sendResponse.js";
// import AWS from 'aws-sdk';
import AWS from "/var/runtime/node_modules/aws-sdk/lib/aws.js";
import { nanoid } from "nanoid";
import { dbExecuteQuery } from "./utils/dbConnect.js";
import { deleteImageSchema } from "./utils/schema.js";

const componentName = "initiative-service/deleteImage.js";
const SWIIRL_INITIATIVE_BUCKET = process.env.SWIIRL_INITIATIVE_BUCKET;
const s3 = new AWS.S3();

// const REGION = process.env.REGION;

export const handler = async (event) => {
  const reqId = nanoid();

  try {
    LOGGER.info(reqId, componentName, "Event received", event);
    const body = JSON.parse(event.body);

    // validate request body,
    const { error, value } = await deleteImageSchema.validate(body, {
      abortEarly: false,
    });
    if (error) {
      LOGGER.error(reqId, componentName, `Invalid request body`, error);
      const err = {
        message: `Invalid request body`,
        body: error,
      };
      return sendResponse(reqId, 400, err);
    }

    const message = body["imageKeys"].length > 0 ? "Images Deleted" : "Image Delete";

    for (let key of body['imageKeys']) {
      const deleteParams = {
        Bucket: SWIIRL_INITIATIVE_BUCKET,
        Key: key,
      };
      const s3Response = await s3.deleteObject(deleteParams).promise();
      LOGGER.error(reqId, componentName, `S3 Response`, {
        message: "S3 Response",
        data: s3Response,
      });

      // Delete image from the database
      const result = await dbExecuteQuery(
        "DELETE from image WHERE imageKey = ?",
        [key]
      );
    }

    return sendResponse(reqId, 200, { message: message });
  } catch (error) {
    LOGGER.error(reqId, componentName, "Exception raised :: ", error);
    return sendResponse(reqId, 500, {
      message: error.message || "Internal Server Error",
      error,
    });
  }
};
