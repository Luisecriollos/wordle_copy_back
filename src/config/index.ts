export default {
  mongoDbUrl: process.env.DB_URL || '',
  api: {
    PORT: process.env.PORT || 3000,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
  },
  firebase: {
    apiKey: 'AIzaSyD8sf1-cqMxLWo7gDU0uIeQqiRn8_VNZEE',
    authDomain: 'social-network-fs.firebaseapp.com',
    projectId: 'social-network-fs',
    storageBucket: 'social-network-fs.appspot.com',
    messagingSenderId: '374203391919',
    appId: '1:374203391919:web:fa34d4a170b8fcf1b9595a',
    measurementId: 'G-GCCQSWB6RL',
  },
};
