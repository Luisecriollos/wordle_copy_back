import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

const storage = getStorage();

const uploadFile = async (file: Express.Multer.File) => {
  const storageRef = ref(storage, file.originalname);
  await uploadBytes(storageRef, file.buffer);
  const url = await getDownloadURL(storageRef);
  return url;
};

const uploadMultipleFiles = async (files: Express.Multer.File[], tweetId?: string) => {
  const prefix = tweetId ? `tweets/${tweetId}/` : '';
  const storageRefs = files.map((file) => ref(storage, prefix + file.originalname));
  await Promise.all(storageRefs.map((ref, index) => uploadBytes(ref, files[index].buffer)));
  const urls = await Promise.all(storageRefs.map((ref) => getDownloadURL(ref)));
  return urls;
};

export { uploadFile, uploadMultipleFiles };
