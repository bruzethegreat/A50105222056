"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.Log = exports.setGlobalLogger = exports.createLogger = void 0;
const axios_1 = __importDefault(require("axios"));
class Logger {
    constructor(config = {}) {
        this.baseUrl = config.baseUrl || 'http://20.244.56.144/evaluation-service';
        this.accessToken = config.accessToken || '';
        this.timeout = config.timeout || 5000;
    }
    setAccessToken(token) {
        this.accessToken = token;
    }
    async log(stack, level, packageName, message) {
        try {
            if (!this.accessToken) {
                throw new Error('Access token not set. Please call setAccessToken() first.');
            }
            const logData = {
                stack,
                level,
                package: packageName,
                message
            };
            const response = await axios_1.default.post(`${this.baseUrl}/logs`, logData, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: this.timeout
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || error.message;
                throw new Error(`Logging failed: ${errorMessage}`);
            }
            throw new Error(`Logging failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.Logger = Logger;
let globalLogger = null;
const createLogger = (config) => {
    return new Logger(config);
};
exports.createLogger = createLogger;
const setGlobalLogger = (logger) => {
    globalLogger = logger;
};
exports.setGlobalLogger = setGlobalLogger;
const Log = async (stack, level, packageName, message) => {
    if (!globalLogger) {
        throw new Error('Global logger not initialized. Please call setGlobalLogger() first.');
    }
    return globalLogger.log(stack, level, packageName, message);
};
exports.Log = Log;
exports.default = Logger;
//# sourceMappingURL=index.js.map