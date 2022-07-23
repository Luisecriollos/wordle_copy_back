import { model, Schema } from 'mongoose';
import { IRoom } from '../interfaces/rooms';

const roomSchema = new Schema<IRoom>({
  code: {
    type: String,
    maxlength: 6,
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      default: [],
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
  },
  numberOfHits: Number,
  rounds: Number,
  timePerRound: Number,
  wordLength: {
    type: Number,
    maxLength: 7,
  },
});

export const Room = model<IRoom>('Rooms', roomSchema);
