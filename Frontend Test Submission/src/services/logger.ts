import { createLogger, Log, LogLevel, FrontendPackage } from '../logging-middleware';

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhbmtpdC52ZXJtYTJAcy5hbWl0eS5lZHUiLCJleHAiOjE3NTczOTg0MTgsImlhdCI6MTc1NzM5NzUxOCwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjI5YWIzOGY5LWU5NDQtNDJmNi04MGFkLTBhZTEyMDczYTMyNyIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImFua2l0IGt1bWFyIHZlcm1hIiwic3ViIjoiNTljYjExYmQtZWU2OC00OWU3LTlmODgtNmMxMTBmN2JhYzkwIn0sImVtYWlsIjoiYW5raXQudmVybWEyQHMuYW1pdHkuZWR1IiwibmFtZSI6ImFua2l0IGt1bWFyIHZlcm1hIiwicm9sbE5vIjoiYTUwMTA1MjIyMDU2IiwiYWNjZXNzQ29kZSI6IlRxRm5qSCIsImNsaWVudElEIjoiNTljYjExYmQtZWU2OC00OWU3LTlmODgtNmMxMTBmN2JhYzkwIiwiY2xpZW50U2VjcmV0IjoiemJEV0NBZXlEZ2J0Z3VDayJ9.tHf3ttpy41D5ec96HNgHxA9y5rFBvICqxcqHW7RM4O8';

const logger = createLogger({
  accessToken: ACCESS_TOKEN,
  timeout: 5000,
});

export class LoggingService {
  static async logInfo(packageName: FrontendPackage, message: string): Promise<void> {
    try {
      await Log('frontend', 'info', packageName, message);
      console.log(`[${packageName}] INFO: ${message}`);
    } catch (error) {
      console.warn('Failed to send log:', error);
    }
  }

  static async logError(packageName: FrontendPackage, message: string): Promise<void> {
    try {
      await Log('frontend', 'error', packageName, message);
      console.error(`[${packageName}] ERROR: ${message}`);
    } catch (error) {
      console.warn('Failed to send error log:', error);
    }
  }

  static async logWarning(packageName: FrontendPackage, message: string): Promise<void> {
    try {
      await Log('frontend', 'warn', packageName, message);
      console.warn(`[${packageName}] WARN: ${message}`);
    } catch (error) {
      console.warn('Failed to send warning log:', error);
    }
  }

  static async logDebug(packageName: FrontendPackage, message: string): Promise<void> {
    try {
      await Log('frontend', 'debug', packageName, message);
      console.debug(`[${packageName}] DEBUG: ${message}`);
    } catch (error) {
      console.warn('Failed to send debug log:', error);
    }
  }

  static async logUserAction(action: string, details?: any): Promise<void> {
    const message = details ? `${action}: ${JSON.stringify(details)}` : action;
    await this.logInfo('component', `User action - ${message}`);
  }

  static async logApiCall(method: string, endpoint: string, success: boolean): Promise<void> {
    const message = `API ${method} ${endpoint} - ${success ? 'SUCCESS' : 'FAILED'}`;
    if (success) {
      await this.logInfo('api', message);
    } else {
      await this.logError('api', message);
    }
  }

  static async logPageView(pageName: string): Promise<void> {
    await this.logInfo('page', `Page viewed: ${pageName}`);
  }

  static async logComponentMount(componentName: string): Promise<void> {
    await this.logDebug('component', `Component mounted: ${componentName}`);
  }

  static async logComponentUnmount(componentName: string): Promise<void> {
    await this.logDebug('component', `Component unmounted: ${componentName}`);
  }
}

export default LoggingService;