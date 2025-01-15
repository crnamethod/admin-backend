import { S3Client } from "@aws-sdk/client-s3";

import { env } from "./envConfig";

export const s3 = new S3Client({
  region: env.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY,
  },
});
