import { model, Schema } from 'mongoose';
import { IRoom } from '../interfaces/rooms';

const roomSchema = new Schema<IRoom>({
  code: {
    type: String,
    maxlength: 6,
  },
  players: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'Users' },
      score: { type: Number, default: 0 },
    },
  ],
  currentPlayer: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
  },
  currentWord: {
    type: String,
    default: '',
  },
  started: {
    type: Boolean,
    default: false,
  },
  state: {
    attempt: {
      type: Number,
      default: 0,
    },
    letterPosition: {
      type: Number,
      default: 0,
    },
  },
  board: [[String]],
  numberOfHits: Number,
  currentRound: Number,
  rounds: Number,
  timePerRound: Number,
  wordLength: {
    type: Number,
    maxLength: 7,
  },
});

export const Room = model<IRoom>('Rooms', roomSchema);
