import express, { Request, Response } from 'express';
import loggedIn from '../../middlewares/loggedIn';
import response from '../../network/response';
import controller from './controller';

const router = express.Router();

const inviteUser = async (req: Request<any, any, any, { phone: string }>, res: Response) => {
  const inviterUsername = req.user?.username;

  if (!inviterUsername || !req.body.phone) {
    return response.error(req, res, {
      body: 'Invalid body',
      status: 400,
    });
  }
  try {
    const resBody = await controller.inviteUser(inviterUsername, req.body.phone);
    response.success(req, res, {
      body: resBody,
    });
  } catch (error: any) {
    return response.error(req, res, { details: error.message });
  }
};

router.post('/invite', inviteUser);

export default router;
