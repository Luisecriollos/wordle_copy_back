import { HydratedDocument } from 'mongoose';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import config from '../config';
import { IUser } from '../interfaces/auth';
import { User } from '../models/User';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt.secret,
};

export default new JwtStrategy(opts, function (jwtPayload, done) {
  User.findById(
    jwtPayload._id,
    '_id name email username phoneNumber profileImg',
    function (err: any, user: HydratedDocument<IUser>) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, user.toJSON());
      } else {
        return done(null, false);
      }
    }
  );
});

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, '_id name email username phoneNumber profileImg', (err: any, user: IUser) => {
    done(err, user);
  });
});
