import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  email?: string;
  name?: string;
  phoneNumber?: string;
  isVerified?: boolean;
  username?: string;
  password?: string;
  profileImg?: string;
}
