import { Request } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { IUser } from '../interfaces/auth';
import error from '../utils/error';

const getToken = (auth: string) => {
  if (!auth || auth.indexOf('Bearer ') === -1) {
    throw new Error('Invalid token');
  }

  const token = auth.replace('Bearer ', '');

  return token;
};

const verify = (token: string): IUser => {
  return jwt.verify(token, config.jwt.secret) as IUser;
};

const decodeHeader = (req: Request): IUser => {
  const authorization = req.headers.authorization || '';
  const token = getToken(authorization);
  const decoded = verify(token);

  req.user = decoded;

  return decoded;
};

export default {
  sign(data: any) {
    return jwt.sign(data, config.jwt.secret);
  },

  check: {
    own(req: Request, owner: string) {
      const decoded = decodeHeader(req);
      if (decoded._id.toString() !== owner) {
        throw error('Prohibido', 403);
      }
    },
    logged(req: Request) {
      const decoded = decodeHeader(req);
    },
  },
};
