import { Types } from 'mongoose';
import { IUser } from './auth';

export interface IPlayer {
  user: Types.ObjectId | IUser;
  score?: number;
}
export interface IRoom {
  _id: string;
  code: string;
  owner: Types.ObjectId | IUser;
  players: IPlayer[];
  currentWord: string;
  started: boolean;
  state: {
    attempt: number;
    letterPosition: number;
  };
  board: string[][];
  currentPlayer: Types.ObjectId | IUser;
  wordLength: number;
  timePerRound: number;
  numberOfHits: number;
  currentRound: number;
  rounds: number;
}
