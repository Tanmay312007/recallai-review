export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

const isDev = typeof process !== 'undefined'
  ? process.env.NODE_ENV !== 'production'
  : true;

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };
}

function formatConsole(entry: LogEntry): void {
  if (!isDev && entry.level === 'debug') return;

  const prefix = `[${entry.level.toUpperCase()}]`;
  const ts = entry.timestamp.slice(11, 23);

  switch (entry.level) {
    case 'error':
      console.error(prefix, ts, entry.message, entry.context ?? '');
      break;
    case 'warn':
      console.warn(prefix, ts, entry.message, entry.context ?? '');
      break;
    default:
      console.log(prefix, ts, entry.message, entry.context ?? '');
  }
}

export const logger: Logger = {
  debug: (message, context) => formatConsole(createLogEntry('debug', message, context)),
  info: (message, context) => formatConsole(createLogEntry('info', message, context)),
  warn: (message, context) => formatConsole(createLogEntry('warn', message, context)),
  error: (message, context) => formatConsole(createLogEntry('error', message, context)),
};
