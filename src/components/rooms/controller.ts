import { Types } from 'mongoose';
import { IRoom } from '../../interfaces/rooms';
import { E_TABLES } from '../../interfaces/store';
import store from '../../store/mongo';
import { boardDefault, getWord } from '../../utils/word';

const TABLE = E_TABLES.ROOMS;
const userFields = '_id email name username profileImg';

export default {
  async getRoom(roomCode: string) {
    return (
      await store.list<IRoom>(TABLE, {
        filter: { code: roomCode },
        populate: [
          { field: 'currentPlayer', select: userFields },
          { field: 'users', select: userFields },
          { field: 'owner', select: userFields },
        ],
      })
    )[0];
  },

  async update(roomCode: string, roomUpdate: Partial<IRoom>) {
    const room = await this.getRoom(roomCode);
    return store
      .upsert<IRoom>(TABLE, Object.assign(room, roomUpdate))
      .populate('currentPlayer', userFields)
      .populate('users', userFields)
      .populate('owner', userFields);
  },
  async createRoom(ownerId: string, room: IRoom) {
    const roomCode = [...Array(6).keys()].map((x) => Math.floor(Math.random() * 10));
    const word = await getWord(room.wordLength);
    return store
      .upsert<IRoom>(TABLE, {
        ...room,
        currentWord: word,
        board: boardDefault(1, word.length),
        code: roomCode.join(''),
        users: [new Types.ObjectId(ownerId)],
        currentPlayer: new Types.ObjectId(ownerId),
        owner: new Types.ObjectId(ownerId),
      })
      .populate('currentPlayer', userFields)
      .populate('owner', userFields)
      .populate('users', userFields);
  },

  async joinRoom(userId: string, roomCode: string) {
    const room = (
      await store.list<IRoom>(TABLE, {
        filter: { code: roomCode },
        populate: [
          { field: 'currentPlayer', select: userFields },
          { field: 'owner', select: userFields },
          { field: 'users', select: userFields },
        ],
      })
    )[0];
    if (!room) throw new Error(`Room doesn't exist.`);
    if (room.users.map((usr) => usr._id.toString()).includes(userId)) return room;
    const updatedRoom = await store
      .upsert<IRoom>(TABLE, {
        _id: room._id,
        users: [...(room.users as Types.ObjectId[]), new Types.ObjectId(userId)],
      })
      .populate('currentPlayer', userFields)
      .populate('owner', userFields)
      .populate('users', userFields);
    return updatedRoom;
  },

  async leaveRoom(userId: string, roomCode: string) {
    const room = (
      await store.list<IRoom>(TABLE, {
        filter: { code: roomCode },
        populate: [
          { field: 'currentPlayer', select: userFields },
          { field: 'owner', select: userFields },
          { field: 'users', select: userFields },
        ],
      })
    )[0];
    if (!room) throw new Error(`Room doesn't exist.`);
    if (!room.users.map((usr) => usr._id.toString()).includes(userId)) return room;
    const updatedRoom = await store
      .upsert<IRoom>(TABLE, {
        ...room,
        _id: room.id,
        users: (room.users as Types.ObjectId[]).filter((user: Types.ObjectId) => user !== new Types.ObjectId(userId)),
      })
      .populate('currentPlayer', userFields)
      .populate('owner', userFields)
      .populate('users', userFields);
    return updatedRoom;
  },
};
