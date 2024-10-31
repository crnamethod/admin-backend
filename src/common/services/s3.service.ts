import { env } from "@/common/utils/envConfig";
import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";

// Initialize the S3 client
const s3 = new S3Client({
  region: env.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

// Define a file filter to accept only JPEG and PNG images
const imageFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(null, false); // Reject the file without throwing an error
    req.fileValidationError = "Only JPEG and PNG image files are allowed"; // Custom error message
  }
};

// Extend Express.Request to include a custom property for error handling
declare global {
  namespace Express {
    interface Request {
      fileValidationError?: string;
    }
  }
}

// Configure multer-s3 for uploading to S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: env.AWS_S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueFileName = `school-images/${Date.now()}_${file.originalname}`;
      cb(null, uniqueFileName);
    },
    // acl: "public-read", // Optional: makes file publicly accessible
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional: set file size limit
  fileFilter: imageFileFilter,
});

export { upload };
