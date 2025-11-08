import { NextFunction, Request, Response } from "express";
import { nanoid } from "nanoid";

export function requestId(_: Request, res: Response, next: NextFunction) {
  const id = nanoid()
  res.locals.requestId = id
  next()
}

