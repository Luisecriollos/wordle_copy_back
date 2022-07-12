import { IUser } from '../../src/interfaces/auth';

declare global {
  declare namespace Express {
    export interface Request {
      user?: IUser;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface User extends IUser {}
  }
}
