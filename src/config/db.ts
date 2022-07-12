import mongoose from 'mongoose';
import mongoDbUrl from './index';

mongoose
  .connect(mongoDbUrl.mongoDbUrl)
  .then((db) => console.log('Connected to DB'))
  .catch((err) => console.error(err));
