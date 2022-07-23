import express, { Request, Response } from 'express';
import { IRoom } from '../../interfaces/rooms';
import response from '../../network/response';
import controller from './controller';

const router = express.Router();

const createRoom = async (req: Request<any, any, IRoom>, res: Response) => {
  const userId = req.user?._id?.toString();
  if (!userId) {
    return response.error(req, res, {
      status: 400,
      message: 'Invalid user.',
    });
  }
  try {
    const room = await controller.createRoom(userId, req.body);
    response.success(req, res, {
      message: 'Room created successfully.',
      body: room,
    });
  } catch (error: any) {
    return response.error(req, res, { details: error.message });
  }
};

const joinRoom = async (req: Request<{ code: string }>, res: Response) => {
  const roomCode = req.params.code;
  const userId = req.user?._id.toString();
  if (!userId) {
    return response.error(req, res, {
      status: 400,
      message: 'Invalid user.',
    });
  }
  try {
    const room = await controller.joinRoom(userId, roomCode);
    return room;
  } catch (error: any) {
    response.error(req, res, {
      details: error.message,
    });
  }
};

router.post('/', createRoom);
router.post('/join/:code', joinRoom);
router.post('/leave/:code', joinRoom);

export default router;
