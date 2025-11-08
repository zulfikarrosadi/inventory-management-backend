import pino, { Level } from "pino";
import 'dotenv/config'

const logLevel: Level = process.env.NODE_END === 'production' ? 'info' : 'debug'

const pinoConfig = pino({
  level: logLevel,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() }
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})


type LogContext = {
  requestId?: string;
  userId?: number;
}

export type RequestContext = {
  path: string;
  method: string;
  status: number | undefined;
  id: string;
  ip: string | undefined;
}

export function logger(level: Level, message: string, context?: LogContext, reqContext?: RequestContext) {

  // for logging middleware
  if (reqContext) {
    pinoConfig['info']({ message, request: reqContext })
    return
  }

  if (!context) {
    pinoConfig[level]({ message })
    return
  }

  pinoConfig[level]({ message, context })
  return
}

export type Logger = (level: Level, message: string, context: LogContext) => void

