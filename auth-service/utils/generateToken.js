import jwt from 'jsonwebtoken';
import { env } from 'process';

const generateToken = (id, email) => {
    return jwt.sign({ id, email }, `${env.JWT_SECRET}`, {
        expiresIn: '7d'
    });
};

export default generateToken;