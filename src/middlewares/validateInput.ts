import type { NextFunction, Request, Response } from "express";
import { type AnyZodObject, ZodError } from "zod";
import { getContext } from "../lib/asyncLocalStorage";
import { logger } from "../lib/logger";
import type ApiResponse from "../schema";

export function validateInput(schema: AnyZodObject) {
  return async (
    req: Request,
    res: Response<ApiResponse<null>>,
    next: NextFunction,
  ) => {
    try {
      schema.parse(req.body);
      return next();
    } catch (error: unknown) {
      const context = getContext();
      logger("warn", "invalid request input", context, error);
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: "fail",
          errors: {
            message: "validation errors",
            code: 400,
            details: error.errors
              .map((e: { path: string[]; message: string }) => {
                return {
                  [e.path[0]]: e.message,
                };
              })
              .reduce(
                (
                  acc: Record<string, unknown>,
                  curr: Record<string, unknown>,
                ) => {
                  // biome-ignore lint/performance/noAccumulatingSpread: <follow zod error signature and to make the output following my ApiResponse schema>
                  Object.assign(acc, curr);
                  return acc;
                },
                {},
              ),
          },
        });
      }
      return res.status(400).json({
        status: "fail",
        errors: {
          message: "Bad request",
          code: 400,
        },
      });
    }
  };
}
