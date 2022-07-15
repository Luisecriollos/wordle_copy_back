import express, { Request, Response } from 'express';
import { IUser } from '../../interfaces/auth';
import loggedIn from '../../middlewares/loggedIn';
import response from '../../network/response';
import controller from './controller';

const router = express.Router();

const getProfile = async (req: Request, res: Response) => {
  response.success(req, res, {
    message: 'Profile fetched successfully!',
    body: req.user,
  });
};

const updateProfile = async (req: Request<any, any, IUser>, res: Response) => {
  const userId = req.user?._id;

  if (!userId)
    return response.error(req, res, {
      message: 'Invalid body.',
    });

  try {
    const user = await controller.updateProfile({ ...req.body, _id: userId });
    response.success(req, res, {
      body: user,
    });
  } catch (error: any) {
    response.error(req, res, {
      details: error.message,
    });
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const token = await controller.login(email, password);
    response.success(req, res, {
      message: 'Sesion iniciado con exito',
      body: token,
    });
  } catch (error: any) {
    response.error(req, res, {
      details: error,
      message: 'Usuario o contrasena invalida.',
    });
  }
};

const register = async (req: Request, res: Response) => {
  const user: IUser = req.body;

  if (!user.email || !user.password || !user.name || !user.country) {
    res.status(400).json({
      error: 'No ha ingresado los datos correctamente, por favor intente de nuevo.',
    });
    return;
  }
  try {
    const exists = await controller.listRegistries({ email: user.email }).then((res) => res[0]);
    if (exists) {
      return response.error(req, res, {
        message: 'Ya existe un usuario con el correo/identificacion ingresado.',
        status: 401,
        details: 'register user function [registerUser]',
      });
    }
    const resData = await controller.register(user);
    response.success(req, res, {
      message: 'User registered successfully!',
      status: 201,
      body: resData,
    });
  } catch (error: any) {
    return response.error(req, res, {
      message: error.message,
      status: 500,
      details: '[Register] Error when registering user',
    });
  }
};

const verifyPhone = async (req: Request<any, any, any, { otp: string }>, res: Response) => {
  const userId = req.user?._id;
  const phoneNumber = req.user?.phoneNumber;
  const code = req.body.otp;
  if (!phoneNumber || !userId) {
    return response.error(req, res, {
      message: 'Invalid user.',
      status: 400,
    });
  }
  try {
    const { valid, status } = await controller.verifyPhoneNumber(phoneNumber, code, userId);
    response.success(req, res, {
      body: {
        valid,
        status,
      },
    });
  } catch (error: any) {
    return response.error(req, res, {
      message: error.message,
      status: 500,
      details: '[Verify] Error when verifying phone number.',
    });
  }
};

const sendVerificationCode = async (req: Request, res: Response) => {
  const userPhone = req.user?.phoneNumber;

  if (!userPhone)
    return response.error(req, res, {
      message: 'Invalid user.',
      status: 400,
    });

  try {
    const verification = await controller.sendVerificationCode(userPhone);

    return response.success(req, res, {
      body: {
        status: verification.status,
      },
    });
  } catch (error: any) {
    return response.error(req, res, {
      message: error.message,
      status: 500,
      details: '[Verify] Error when sending verification code.',
    });
  }
};

router.route('/profile').get(loggedIn, getProfile).put(loggedIn, updateProfile);
router.post('/register', register);
router.post('/login', login);
router.post('/verify', loggedIn, verifyPhone);
router.post('/send-verify', loggedIn, sendVerificationCode);

export default router;
