// import jwt from 'jsonwebtoken';
// import LOGGER from './utils/logger.js';
// import sendResponse from './utils/sendResponse.js';
// import { dbExecuteQuery } from './utils/dbConnect.js';
const jwt = require('jsonwebtoken');
const LOGGER = require('./utils/logger.js');
const sendResponse = require('./utils/sendResponse.js');
const { dbExecuteQuery } = require('./utils/dbConnect.js');

const handler = async (event) => {
    let token = '';
    console.log('--> Event', event);
    const response = {
        'isAuthorized': false,
        'context': {}
    };
    if ((event.headers.authorization && event.headers.authorization.startsWith('Bearer'))) {
        token = event.headers.authorization.split(' ')[1];
    }
    else {
        return response;
    }

    try {

        const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`);
        const userId = decoded.id;

        const [user] = await dbExecuteQuery('SELECT * FROM user WHERE id = ?', [userId]);
        if (user.length > 0) {
            response.isAuthorized = true;
            response.context = { 'userId': user[0].id };
            return response;
        }
        else {
            return response;
        }

    } catch (error) {
        console.log('Error |--> ', error);
        return response;
    }
};


module.exports = {handler}