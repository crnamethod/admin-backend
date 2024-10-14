import { Request } from 'express';

export type TypedRequestBody<T> = Request<any, any, T>;
export type TypedRequestQuery<T> = Request<any, any, any, T>;
