import { nanoid } from 'nanoid';

import LOGGER from './utils/logger.js';
import sendResponse from './utils/sendResponse.js';
import { dbExecuteQuery } from './utils/dbConnect.js';

const componentName = 'school-service/getDetails';
const SWIIRL_INITIATIVE_BUCKET = process.env.SWIIRL_INITIATIVE_BUCKET;
const SWIIRL_SCHOOL_BUCKET = process.env.SWIIRL_SCHOOL_BUCKET;


// Lambda Handler
export const handler = async (event) => {
  const reqId = nanoid();
  try {
    LOGGER.info(reqId, componentName, 'Event received', event);
    const queryParams = event.queryStringParameters;

    // Validate if school with this schoolId exists
    const validateQuery = 'SELECT * FROM school WHERE id = ?';
    const [school] = await dbExecuteQuery(validateQuery, [queryParams.schoolId]);
    if (!school?.name) {
      return sendResponse(reqId, 400, { message: 'School does not exist' });
    }

    // Query to fetch user details and their initiative images
    const searchQuery = `
      SELECT u.firstName AS user_first_name, u.lastName AS user_last_name, img.imageKey AS image
      FROM user AS u
      JOIN initiative AS i ON u.id = i.userId
      LEFT JOIN image AS img ON i.id = img.initiativeId
      WHERE u.schoolId = ?
      ORDER BY u.id, i.id;`;

    LOGGER.info(reqId, componentName, 'Search query to be executed', searchQuery);
    const dbResp = await dbExecuteQuery(searchQuery, [queryParams.schoolId]);

    // Process the response to group images by user
    const userImagesMap = new Map();

    for (const row of dbResp) {
      const { user_first_name, user_last_name, image } = row;

      const userFullName = `${user_first_name} ${user_last_name}`;
      const userImages = userImagesMap.get(userFullName) || [];

      if (image) {
        const imageUrl = `https://${SWIIRL_INITIATIVE_BUCKET}.s3.amazonaws.com/${image}`;
        userImages.push(imageUrl);
      }

      userImagesMap.set(userFullName, userImages);
    }

    // Format the response data
    let data = {}
    data['school'] = {
      name:school.name,
      district:school.district,
      description:school.description,
      image:`https://${SWIIRL_SCHOOL_BUCKET}.s3.amazonaws.com/${school.imageKey}`
    }
    const responseData = [];
    for (const [userFullName, userImages] of userImagesMap) {
      responseData.push({
        user_first_name: userFullName.split(' ')[0],
        user_last_name: userFullName.split(' ')[1],
        images: userImages,
      });
    }
    data['data'] = responseData
    console.log('data------',data)

    // Return the response
    return sendResponse(reqId, 200, { message: 'success', data: data });
  } catch (error) {
    LOGGER.error(reqId, componentName, 'Exception raised', error);
    return sendResponse(reqId, 500, {
      message: error.message || 'Internal Server Error',
      error,
    });
  }
};
