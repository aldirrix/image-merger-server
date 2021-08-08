import { config } from "../config"

const { disableLogs, isDebugMode } = config

type LogLevel = 'error' | 'warn' | 'info' | 'debug'
type CustomLogger = {
  error: (message: string, ...args: any) => void;
  warn: (message: string, ...args: any) => void;
  info: (message: string, ...args: any) => void;
  debug: (message: string, ...args: any) => void;
}

const execute = (level: LogLevel, namespace: string, message: string, args: any): void => {
  if (!disableLogs) {
    if (level === 'debug' && isDebugMode) {
      console.log(`${level}: ${namespace}, ${message}`, ...args)
    } else if (level !== 'debug') {
      console.log(`${level}: ${namespace}, ${message}`, ...args)
    }
  }
}

export const logger = (namespace: string): CustomLogger => {
  return {
    error: (message: string, ...args: any) => execute('error', namespace, message, args),
    warn: (message: string, ...args: any) => execute('warn', namespace, message, args),
    info: (message: string, ...args: any) => execute('info', namespace, message, args),
    debug: (message: string, ...args: any) => execute('debug', namespace, message, args),
  }
}
