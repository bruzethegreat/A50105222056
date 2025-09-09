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
declare class Logger {
    private baseUrl;
    private accessToken;
    private timeout;
    constructor(config?: LogConfig);
    setAccessToken(token: string): void;
    log(stack: LogStack, level: LogLevel, packageName: LogPackage, message: string): Promise<LogResponse>;
}
export declare const createLogger: (config?: LogConfig) => Logger;
export declare const setGlobalLogger: (logger: Logger) => void;
export declare const Log: (stack: LogStack, level: LogLevel, packageName: LogPackage, message: string) => Promise<LogResponse>;
export { Logger };
export default Logger;
//# sourceMappingURL=index.d.ts.map