import { Server as HttpServer } from 'http';
import { Types } from 'mongoose';
import { Server } from 'socket.io';

import authController from './components/auth/controller';
import roomsController from './components/rooms/controller';
import { IUser } from './interfaces/auth';
import { IRoom } from './interfaces/rooms';
import { boardDefault, getWord } from './utils/word';

export const createSocketServer = (server: HttpServer) => {
  const io = new Server(server);

  io.on('connection', (socket) => {
    socket.on('join-room', async (roomCode: string, userId: string) => {
      socket.join(roomCode);
      const user = await authController.getProfile(userId);
      const room = await roomsController.joinRoom(user.id, roomCode);
      const updated = await roomsController.update(roomCode, { board: boardDefault(room.users.length, room.wordLength) });
      io.to(roomCode).emit(`game-${roomCode}-update`, updated);
      io.to(roomCode).emit(`joined-${roomCode}-user`, user.name);
    });

    socket.on('leave-room', async (roomCode: string, userId: string) => {
      socket.leave(roomCode);
      const user = await authController.getProfile(userId);
      const room = await roomsController.leaveRoom(user.id, roomCode);
      const updated = await roomsController.update(roomCode, { board: boardDefault(room.users.length, room.wordLength) });
      io.to(roomCode).emit(`game-${roomCode}-update`, updated);
      io.to(roomCode).emit(`left-${roomCode}-user`, user.name);
    });

    socket.on('game-update', async (roomCode: string, board: string[][], state?: { attempt: number; letterPosition: number }) => {
      const options: Partial<IRoom> = {
        board,
      };
      state && (options.state = state);
      const updated = await roomsController.update(roomCode, options);
      console.log(`game-${roomCode}-update`, updated);
      io.to(roomCode).emit(`game-${roomCode}-update`, updated);
    });

    socket.on('cycle-player', async (roomCode: string) => {
      const room = await roomsController.getRoom(roomCode);
      const currentUserIndex = room.users.findIndex((user) => user._id.toString() === room.currentPlayer._id.toString());
      const nextIndex = currentUserIndex + 1 === room.users.length ? 0 : currentUserIndex + 1;
      const updated = await roomsController.update(roomCode, {
        currentPlayer: room.users[nextIndex] as IUser,
        state: { attempt: room.state.attempt, letterPosition: 0 },
      });
      io.to(roomCode).emit(`game-${roomCode}-update`, updated);
    });

    socket.on('next-round', async (roomCode: string) => {
      const room = await roomsController.getRoom(roomCode);
      const nextWord = await getWord(room.wordLength);
      const currentPlayerIndex = room.users.findIndex((user) => user._id === room.currentPlayer._id);
      const nextPlayerIndex = currentPlayerIndex + 1 === room.users.length ? 0 : currentPlayerIndex + 1;
      const updated = await roomsController.update(roomCode, {
        currentPlayer: new Types.ObjectId(room.users[nextPlayerIndex]._id),
        currentWord: nextWord,
        board: boardDefault(room.users.length, nextWord.length),
      });
      io.to(roomCode).emit(`game-${roomCode}-update`, updated);
    });
  });
};
