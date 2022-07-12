import passport from 'passport';

const loggedIn = passport.authenticate('jwt', { session: false });

export default loggedIn;
