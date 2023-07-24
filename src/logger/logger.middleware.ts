import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export default class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  use(request: Request, response: Response, next: NextFunction) {
    response.on('finish', () => {
      const { method, originalUrl } = request;
      const { statusCode, statusMessage } = response;
      const message = `${method} ${originalUrl} ${statusCode} ${statusMessage}`;
      if (statusCode >= 400) {
        this.logger.error(message);
        return response.status(statusCode).json({
          code: statusCode,
          timestamp: new Date().toDateString(),
          message: message,
        });
      }
    });
    next();
  }
}
