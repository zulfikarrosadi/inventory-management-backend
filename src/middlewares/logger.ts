import { NextFunction, Request, Response } from "express";
import { logger, RequestContext } from '../lib/logger'

export async function logRequest(req: Request, res: Response, next: NextFunction) {
  const ctx: RequestContext = {
    method: req.method,
    path: req.path,
    id: res.locals.requestId,
    ip: req.ip,
    status: undefined,
  }

  res.on('finish', () => {
    ctx.status = res.statusCode
    logger('info', 'REQUEST_INFO', undefined, ctx)
  })

  next()
}

