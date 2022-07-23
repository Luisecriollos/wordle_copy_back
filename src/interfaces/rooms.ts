import { Types } from 'mongoose';
import { IUser } from './auth';

export interface IRoom {
  _id: string;
  code: string;
  owner: Types.ObjectId | IUser;
  users: Types.ObjectId[] | IUser[];
  wordLength: number;
  timePerRound: number;
  numberOfHits: number;
  rounds: number;
}
