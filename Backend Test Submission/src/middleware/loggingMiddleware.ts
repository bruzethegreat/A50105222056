import { Request, Response, NextFunction } from 'express';
import { createLogger, setGlobalLogger } from '../../logging-middleware';

export function initializeLogging(accessToken: string, baseUrl?: string): void {
  const logger = createLogger({
    baseUrl: baseUrl || 'http://20.244.56.144/evaluation-service',
    accessToken,
    timeout: 10000
  });
  
  setGlobalLogger(logger);
}

export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const originalSend = res.send;
  
  res.send = function(body: any) {
    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl;
    const duration = Date.now() - (req as any).startTime;
    
    const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info';
    
    return originalSend.call(this, body);
  };
  
  (req as any).startTime = Date.now();
  next();
}

export function errorLoggingMiddleware(error: Error, req: Request, res: Response, next: NextFunction): void {
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  });
}