import { Types } from 'mongoose';
import { IRoom } from '../../interfaces/rooms';
import { E_TABLES } from '../../interfaces/store';
import store from '../../store/mongo';

const TABLE = E_TABLES.ROOMS;
const userFields = '_id email name username profileImg';

export default {
  createRoom(ownerId: string, room: IRoom) {
    const roomCode = [...Array(6).keys()].map((x) => Math.floor(Math.random() * 10));
    return store
      .upsert<IRoom>(TABLE, {
        ...room,
        code: roomCode.join(''),
        owner: new Types.ObjectId(ownerId),
      })
      .populate('owner', userFields)
      .populate('users', userFields);
  },

  async joinRoom(userId: string, roomId: string) {
    const room = await store.get<IRoom>(TABLE, roomId);
    const updatedRoom = await store
      .upsert<IRoom>(TABLE, {
        ...room,
        users: [...(room.users as Types.ObjectId[]), new Types.ObjectId(userId)],
      })
      .populate('owner', userFields)
      .populate('users', userFields);
    return updatedRoom;
  },

  async leaveRoom(userId: string, roomId: string) {
    const room = await store.get<IRoom>(TABLE, roomId);
    const updatedRoom = await store
      .upsert<IRoom>(TABLE, {
        ...room,
        users: (room.users as Types.ObjectId[]).filter((user: Types.ObjectId) => user !== new Types.ObjectId(userId)),
      })
      .populate('owner', userFields)
      .populate('users', userFields);
    return updatedRoom;
  },
};
