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

  async joinRoom(userId: string, roomCode: string) {
    const room = (await store.list<IRoom>(TABLE, { filter: { code: roomCode } }))[0];
    if (!room) throw new Error(`Room doesn't exist.`);
    if ((room.users as Types.ObjectId[]).includes(new Types.ObjectId(userId))) return room;
    const updatedRoom = await store.upsert<IRoom>(TABLE, {
      _id: room._id,
      users: [...(room.users as Types.ObjectId[]), new Types.ObjectId(userId)],
    });
    return updatedRoom;
  },

  async leaveRoom(userId: string, roomCode: string) {
    const room = (await store.list<IRoom>(TABLE, { filter: { code: roomCode } }))[0];
    if (!room) throw new Error(`Room doesn't exist.`);
    const updatedRoom = await store
      .upsert<IRoom>(TABLE, {
        ...room,
        _id: room.id,
        users: (room.users as Types.ObjectId[]).filter((user: Types.ObjectId) => user !== new Types.ObjectId(userId)),
      })
      .populate('owner', userFields)
      .populate('users', userFields);
    return updatedRoom;
  },
};
