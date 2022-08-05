import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

import authController from './components/auth/controller';
import roomsController from './components/rooms/controller';
import { IUser } from './interfaces/auth';
import { IRoom } from './interfaces/rooms';
import { boardDefault, getWord } from './utils/word';

const intervals: { [roomCode: string]: NodeJS.Timer } = {};

let io: Server;

export const createSocketServer = (server: HttpServer) => {
  io = new Server(server);

  io.on('connection', (socket) => {
    socket.on('join-room', async (roomCode: string, userId: string) => {
      socket.join(roomCode);
      const user = await authController.getProfile(userId);
      const room = await roomsController.joinRoom(user.id, roomCode);
      const updated = (
        await roomsController.update(roomCode, {
          board: boardDefault(room.players.length, room.wordLength),
          started: room.players.length >= 3,
        })
      ).toObject();
      io.to(roomCode).emit(`game-${roomCode}-update`, updated);
      io.to(roomCode).emit(`joined-${roomCode}-user`, user.name);
      room.players.length === 2 && !room.started && startTimer(updated, 0);
    });

    socket.on('leave-room', async (roomCode: string, userId: string) => {
      socket.leave(roomCode);
      const user = await authController.getProfile(userId);
      const room = await roomsController.leaveRoom(user.id, roomCode);
      const updated = (
        await roomsController.update(roomCode, { board: boardDefault(room.players.length, room.wordLength) })
      ).toObject();
      io.to(roomCode).emit(`game-${roomCode}-update`, updated);
      io.to(roomCode).emit(`left-${roomCode}-user`, user.name);
    });

    socket.on('game-update', async (roomCode: string, board: string[][], state?: { attempt: number; letterPosition: number }) => {
      const options: Partial<IRoom> = {
        board,
      };
      state && (options.state = state);
      const updated = (await roomsController.update(roomCode, options)).toObject();
      io.to(roomCode).emit(`game-${roomCode}-update`, updated);
    });

    socket.on('cycle-player', cyclePlayer);

    socket.on('next-round', nextRound);
  });
};

const startTimer = (room: IRoom, nextIndex: number) => {
  let timer = room.timePerRound;
  intervals[room.code] && clearInterval(intervals[room.code]);
  intervals[room.code] = setInterval(() => {
    --timer;
    io.to(room.code).emit(`timer-${room.code}-update`, timer);
    if (timer === 0) {
      setTimeout(async () => {
        if (nextIndex !== 0) await cyclePlayer(room.code, 0);
        else await nextRound(room.code, 0);
      }, 2000);

      clearInterval(intervals[room.code]);
    }
  }, 1000);
};

const cyclePlayer = async (roomCode: string, score: number) => {
  intervals[roomCode] && clearInterval(intervals[roomCode]);
  const room = (await roomsController.getRoom(roomCode)).toObject();
  const currentPlayerIndex = room.players.findIndex(({ user }) => user._id.toString() === room.currentPlayer._id.toString());
  const nextIndex = currentPlayerIndex + 1 === room.players.length ? 0 : currentPlayerIndex + 1;
  room.players[currentPlayerIndex].score = score;
  room.currentPlayer = room.players[nextIndex].user;
  room.state.attempt = nextIndex !== 0 ? room.state.attempt + 1 : 0;
  room.state.letterPosition = 0;
  roomsController.update(roomCode, room);
  io.to(roomCode).emit(`game-${roomCode}-update`, room);
  startTimer(room, nextIndex);
};

const nextRound = async (roomCode: string, score: number) => {
  intervals[roomCode] && clearInterval(intervals[roomCode]);
  const room = (await roomsController.getRoom(roomCode)).toObject();
  const nextWord = await getWord(room.wordLength);
  const currentPlayerIndex = room.players.findIndex(({ user }) => user._id.toString() === room.currentPlayer._id.toString());
  const nextPlayerIndex = currentPlayerIndex + 1 === room.players.length ? 0 : currentPlayerIndex + 1;

  room.players[currentPlayerIndex].score = score;
  room.currentPlayer = room.players[nextPlayerIndex].user;
  room.currentWord = nextWord;
  room.state = {
    attempt: 0,
    letterPosition: 0,
  };
  room.board = boardDefault(room.players.length, nextWord.length);
  roomsController.update(roomCode, room);
  io.to(roomCode).emit(`game-${roomCode}-update`, room);
  startTimer(room, nextPlayerIndex);
};
