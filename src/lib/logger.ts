import pino, { Level } from "pino";
import "dotenv/config";

const logLevel: Level =
  process.env.NODE_END === "production" ? "info" : "debug";

const pinoConfig = pino({
  level: logLevel,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export type LogContext = {
  req_id: string;
  userId?: number;
};

export type RequestContext = {
  path: string;
  method: string;
  status: number | undefined;
  ip: string | undefined;
};

export function logger(
  level: Level,
  message: string,
  context?: LogContext,
  error?: any,
  reqContext?: RequestContext,
) {
  if (!context) {
    pinoConfig[level]({ message });
    return;
  }

  // for logging middleware
  if (reqContext) {
    pinoConfig["info"]({
      message,
      req_id: context.req_id,
      request: reqContext,
    });
    return;
  }

  pinoConfig[level]({ message, req_id: context.req_id, error });
  return;
}

export type Logger = (
  level: Level,
  message: string,
  context?: LogContext,
  error?: any,
  requestContext?: RequestContext,
) => void;
