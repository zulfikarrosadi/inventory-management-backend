import type { NextFunction, Request, Response } from "express";
import { getContext } from "../lib/asyncLocalStorage";
import { logger } from "../lib/logger";
import type ApiResponse from "../schema";

export function catchAllError(
  err: unknown,
  _: Request,
  res: Response<ApiResponse<null>>,
  __: NextFunction,
) {
  // BUG: context no longer live here
  const context = getContext();

  if (err && typeof err !== "object") {
    return res.status(500).json({
      status: "fail",
      errors: {
        code: 500,
        message: "something went wrong, please try again later",
      },
    });
  }

  if (
    err &&
    typeof err === "object" &&
    "statusCode" in err &&
    typeof err.statusCode === "number" &&
    "message" in err &&
    typeof err.message === "string"
  ) {
    const logLevel = err.statusCode && err.statusCode < 500 ? "warn" : "error";
    logger(logLevel, "unhandle error", context, err, undefined);

    let errMessage = err.message;

    if (err instanceof SyntaxError) {
      errMessage = "please check your request data, then try again later";
    }

    return res.status(err.statusCode || 500).json({
      status: "fail",
      errors: {
        code: err.statusCode || 500,
        message: errMessage || "something went wrong, please try again later",
      },
    });
  }
}
