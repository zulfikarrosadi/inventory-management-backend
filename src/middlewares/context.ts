import { NextFunction, Request, Response } from "express";
import { asyncLocalStorage } from '../lib/asyncLocalStorage'

export async function setContext(
  _: Request,
  res: Response,
  next: NextFunction
) {
  asyncLocalStorage.run({
    req_id: res.locals.req_id
  }, () => {
    next()
  })
}

