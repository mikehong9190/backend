import jwt from 'jsonwebtoken';
import { env } from 'process';


const generateToken = (id) => {
    return jwt.sign({ id }, `${env.JWT_SECRET}`, {
        expiresIn: '1d'
    });
};

export default generateToken;