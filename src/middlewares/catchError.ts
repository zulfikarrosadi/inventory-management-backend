import { NextFunction, Request, Response } from "express";
import ApiResponse from '../schema'
import { logger } from "../lib/logger";
import { getContext } from "../lib/asyncLocalStorage";

export function catchAllError(err: any, req: Request, res: Response<ApiResponse>, next: NextFunction) {
  // BUG: context no longer live here
  const context = getContext()
  const logLevel = err.statusCode && err.statusCode < 500 ? 'warn' : 'error'
  logger(logLevel, 'unhandle error', context, err, undefined)

  let errMessage = err.message;

  if (err instanceof SyntaxError) {
    errMessage = 'please check your request data, then try again later'
  }

  return res.status(err.statusCode || 500).json({
    status: 'fail',
    errors: {
      code: err.statusCode || 500,
      message: errMessage || 'something went wrong, please try again later'
    }
  })
}
