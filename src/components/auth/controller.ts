import store from '../../store/mongo';
import bcrypt from 'bcrypt';
import { IUser } from '../../interfaces/auth.js';
import auth from '../../auth';
import { E_TABLES } from '../../interfaces/store';
import twilioClient from '../../config/twilio';
import response from '../../network/response';
import { Types } from 'mongoose';
const TABLE = E_TABLES.USER;

export default {
  async login(email: string, password: string) {
    const data = (await store.list<IUser>(TABLE, { filter: { email } }))[0];

    if (!data) {
      throw Error('Contrasena/usuario invalido.');
    }

    return bcrypt.compare(password, data.password as string).then((isEqual: boolean) => {
      if (isEqual) {
        data.password = undefined;
        return { user: data, token: auth.sign(data.toJSON()) };
      } else {
        throw Error('Contrasena/usuario invalido.');
      }
    });
  },

  async register(user: IUser) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password as string, salt);
    user.password = hash;

    const responseData = await store.upsert<IUser>(TABLE, user);
    responseData.password = undefined;

    if (!responseData.phoneNumber) throw new Error('Invalid phone number.');
    const verification = await this.sendVerificationCode(responseData.phoneNumber);

    return { user: responseData, token: auth.sign(responseData.toJSON()), verificationStatus: verification.status };
  },

  async sendVerificationCode(phoneNumber: string) {
    const verification = await twilioClient.verify
      .services(process.env.TWILIO_VERIFY_SERVICE_SID ?? '')
      .verifications.create({ to: phoneNumber, channel: 'sms' });
    return verification;
  },

  async verifyPhoneNumber(phoneNumber: string, otp: string, userId: Types.ObjectId) {
    const check = await twilioClient.verify.services(process.env.TWILIO_VERIFY_SERVICE_SID ?? '').verificationChecks.create({
      to: phoneNumber,
      code: otp,
    });
    if (check.valid && check.status === 'approved') {
      await store.upsert<IUser>(TABLE, { _id: userId, isVerified: true });
    }
    return check;
  },

  async updateProfile(user: IUser) {
    try {
      const updatedUser = await store.upsert<IUser>(TABLE, user).select('_id email name username profileImg');
      return updatedUser;
    } catch (error) {
      throw error;
    }
  },

  listRegistries(filter?: any) {
    return store.list(TABLE, { filter });
  },

  getRegistry(id: string) {
    return store.get(TABLE, id);
  },

  async upsertRegistry(data: IUser) {
    const authData: IUser = {
      _id: data._id,
    };

    if (data.username) {
      authData.username = data.username;
    }

    if (data.password) {
      authData.password = await bcrypt.hash(data.password, 10);
    }

    return store.upsert(TABLE, authData);
  },
};
