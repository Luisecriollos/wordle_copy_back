import { IError } from '../interfaces/general';

const error = (message: string, code: number) => {
  const err: IError = new Error(message);

  if (code) {
    err.statusCode = code;
  }

  return err;
};

export default error;
