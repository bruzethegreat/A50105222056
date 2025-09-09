import axios from 'axios';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogStack = 'backend' | 'frontend';

export type BackendPackage = 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler' | 'repository' | 'route' | 'service';
export type FrontendPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style';
export type SharedPackage = 'auth';
export type LogPackage = BackendPackage | FrontendPackage | SharedPackage;

export interface LogConfig {
  baseUrl?: string;
  accessToken?: string;
  timeout?: number;
}

export interface LogRequest {
  stack: LogStack;
  level: LogLevel;
  package: LogPackage;
  message: string;
}

export interface LogResponse {
  logID: string;
  message: string;
}

class Logger {
  private baseUrl: string;
  private accessToken: string;
  private timeout: number;

  constructor(config: LogConfig = {}) {
    this.baseUrl = config.baseUrl || 'http://20.244.56.144/evaluation-service';
    this.accessToken = config.accessToken || '';
    this.timeout = config.timeout || 5000;
  }

  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  public async log(
    stack: LogStack,
    level: LogLevel,
    packageName: LogPackage,
    message: string
  ): Promise<LogResponse> {
    try {
      if (!this.accessToken) {
        throw new Error('Access token not set. Please call setAccessToken() first.');
      }

      const logData: LogRequest = {
        stack,
        level,
        package: packageName,
        message
      };

      const response = await axios.post<LogResponse>(
        `${this.baseUrl}/logs`,
        logData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Logging failed: ${errorMessage}`);
      }
      throw new Error(`Logging failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

let globalLogger: Logger | null = null;

export const createLogger = (config?: LogConfig): Logger => {
  return new Logger(config);
};

export const setGlobalLogger = (logger: Logger): void => {
  globalLogger = logger;
};

export const Log = async (
  stack: LogStack,
  level: LogLevel,
  packageName: LogPackage,
  message: string
): Promise<LogResponse> => {
  if (!globalLogger) {
    throw new Error('Global logger not initialized. Please call setGlobalLogger() first.');
  }
  return globalLogger.log(stack, level, packageName, message);
};

export { Logger };
export default Logger;