import dotenv from "dotenv";
import { cleanEnv, host, num, port, str, testOnly } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: testOnly("test"),
    choices: ["development", "production", "test"],
  }),
  HOST: host({ devDefault: testOnly("localhost") }),
  PORT: port({ devDefault: testOnly(3000) }),
  CORS_ORIGIN: str({ devDefault: testOnly("http://localhost:3000") }),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: testOnly(1000) }),
  COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: testOnly(1000) }),
  AWS_ACCESS_KEY_ID: str(),
  AWS_SECRET_ACCESS_KEY: str(),
  AWS_DEFAULT_REGION: str(),
  AWS_S3_BUCKET: str(),
  AWS_S3_ACCESS_KEY_ID: str(),
  AWS_S3_SECRET_ACCESS_KEY: str(),
  USER_POOL_ID: str(),
  COGNITO_CLIENT_ID: str(),
  DYNAMODB_TBL_SCHOOLS: str(),
  DYNAMODB_TBL_REVIEWS: str(),
  DYNAMODB_TBL_USERPROFILE: str(),
  DYNAMODB_TBL_USERFAVORITES: str(),
  DYNAMODB_TBL_CLINICS: str(),
  DYNAMODB_TBL_CLINIC_REVIEWS: str(),
  DYNAMODB_TBL_PREREQUISITES: str(),
  DYNAMODB_TBL_PREREQUISITE_SCHOOLS: str(),
});
