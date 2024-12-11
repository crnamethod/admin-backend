import cors from "cors";
import express, { type Express } from "express";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import { pino } from "pino";

import { openAPIRouter } from "@/api-docs/openAPIRouter";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { userRouter } from "@/api/user/userRouter";
import { globalExceptionHandler } from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { clinicRouter } from "./api/clinic/clinic.router";
import { prerequisiteSchoolRouter } from "./api/prerequisite/prerequisite-school.router";
import { prerequisiteRouter } from "./api/prerequisite/prerequisite.router";
import { reviewRouter } from "./api/review/reviewRouter";
import { schoolRouter } from "./api/school/schoolRouter";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*", credentials: true }));
app.use(helmet());
app.use(rateLimiter);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 10 * 1024 * 1024 },
  }),
);

// Request logging
app.use(requestLogger);

// Routes
app.use("/api/health-check", healthCheckRouter);
app.use("/api/user", userRouter);
app.use("/api/school", schoolRouter);
app.use("/api/review", reviewRouter);
app.use("/api/clinic", clinicRouter);
app.use("/api/prerequisite", prerequisiteRouter);
app.use("/api/prerequisite-school", prerequisiteSchoolRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(globalExceptionHandler);

export { app, logger };
