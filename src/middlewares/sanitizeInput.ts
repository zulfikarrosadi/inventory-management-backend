import { NextFunction, Request, Response } from 'express';
import xssFilters from 'xss-filters';

function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  const sanitize = (input: any) => {
    if (typeof input === 'string') {
      return xssFilters.inHTMLData(input);
    } else if (typeof input === 'object' && input !== null) {
      for (let key in input) {
        if (input.hasOwnProperty(key)) {
          input[key] = sanitize(input[key]);
        }
      }
    }
    return input;
  };

  req.body = sanitize(req.body);
  return next();
}

export default sanitizeInput;
