import { NextFunction, Request, Response } from "express";
import { RequestContext, logger } from "../lib/logger";
import { getContext } from "../lib/asyncLocalStorage";

export async function logRequest(req: Request, res: Response, next: NextFunction) {
  const reqContext: RequestContext = {
    method: req.method,
    path: req.path,
    ip: req.ip,
    status: undefined,
  }
  const context = getContext()

  res.on('finish', () => {
    reqContext.status = res.statusCode
    logger('info', 'REQUEST_INFO', context, undefined, reqContext)
  })

  next()
}

