import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";

const unexpectedRequest: RequestHandler = (_req, res) => {
  res.sendStatus(StatusCodes.NOT_FOUND);
};

const addErrorToRequestLog: ErrorRequestHandler = (err, _req, res, next) => {
  res.locals.err = err;
  next(err);
};

export default () => [unexpectedRequest, addErrorToRequestLog];

export interface IHTTPError extends Error {
  statusCode: number;
}

export const globalExceptionHandler = (err: IHTTPError, req: Request, res: Response, next: NextFunction) => {
  let message = err.message ?? "Internal Server Error";
  const status = err.statusCode || 500;

  const stack = err.stack?.replace(/\n/g, "") ?? null;
  const cause = err.cause;

  message = typeof message === "object" ? message : message?.replace(/\n/g, "");

  res.status(status).send({ status, message, cause, stack });

  next();
};
