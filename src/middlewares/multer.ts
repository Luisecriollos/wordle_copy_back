import { initializeApp } from 'firebase/app';
import Multer from 'multer';
import config from '../config';

const app = initializeApp(config.firebase);

export const multer = Multer({
  storage: Multer.memoryStorage(),
});
