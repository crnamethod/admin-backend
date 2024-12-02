import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError, type ZodSchema } from "zod";

import { ServiceResponse } from "@/common/models/serviceResponse";

export const handleServiceResponse = (serviceResponse: ServiceResponse<any>, response: Response) => {
  return response.status(serviceResponse.statusCode).send(serviceResponse);
};

interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
  files?: {
    schema: ZodSchema;
    fileName: string;
  };
}

export const validateRequest = (schemas: ValidationSchemas) => (req: Request, res: Response, next: NextFunction) => {
  try {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    if (schemas.params) {
      req.params = schemas.params.parse(req.params);
    }
    if (schemas.query) {
      req.query = schemas.query.parse(req.query);
    }
    if (schemas.files) {
      schemas.files.schema.parse(req.files?.[`${schemas.files.fileName}`]);
    }
    next();
  } catch (err) {
    const errorMessage = `Invalid input: ${(err as ZodError).errors.map((e) => e.message).join(", ")}`;
    const statusCode = StatusCodes.BAD_REQUEST;

    if (err instanceof ZodError) {
      const errors = err.errors.map((issue: any) => ({
        message: `${issue.path.join(".")} ${issue.message}`,
      }));
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid data", details: errors });
      const serviceResponse = ServiceResponse.failure(errorMessage, errors, statusCode);
      return handleServiceResponse(serviceResponse, res);
    } else {
      const serviceResponse = ServiceResponse.failure(errorMessage, null, statusCode);
      return handleServiceResponse(serviceResponse, res);
    }
  }
};
