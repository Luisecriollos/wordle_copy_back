declare module 'multer-firebase-storage' {
  export default function (
    config: {
      bucketName?: string;
      credentials?: string | { projectId: string; privateKey: string; clientEmail: string };
      directoryPath?: string;
      mimeMap?: {
        [fileName: string]: string;
      };
      appName?: string;
      namePrefix?: string;
      nameSuffix?: string;
      unique?: boolean;
      public?: boolean;
      hooks: {
        [hookName: string]: function;
      };
    },
    firebaseInstance: any
  );
}
