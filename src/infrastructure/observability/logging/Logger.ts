export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  traceId?: string;
  spanId?: string;
}

export interface ILogger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
  fatal(message: string, error?: Error, context?: Record<string, any>): void;

  child(context: Record<string, any>): ILogger;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
}

export class Logger implements ILogger {
  private level: LogLevel = LogLevel.INFO;
  private context: Record<string, any> = {};
  private handlers: LogHandler[] = [];

  constructor(
    private readonly name: string,
    config: LoggerConfig = {}
  ) {
    this.level = config.level || LogLevel.INFO;
    this.context = config.context || {};

    // Add default console handler if no handlers provided
    if (!config.handlers || config.handlers.length === 0) {
      this.handlers.push(new ConsoleLogHandler());
    } else {
      this.handlers = config.handlers;
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, { ...context, error });
  }

  fatal(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, { ...context, error });
  }

  child(additionalContext: Record<string, any>): ILogger {
    const childLogger = new Logger(this.name, {
      level: this.level,
      context: { ...this.context, ...additionalContext },
      handlers: this.handlers
    });
    return childLogger;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (level < this.level) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context, logger: this.name }
    };

    // Extract error if present in context
    if (context?.error instanceof Error) {
      entry.error = context.error;
      delete entry.context!.error;
    }

    // Emit to all handlers
    for (const handler of this.handlers) {
      try {
        handler.handle(entry);
      } catch (err) {
        // Prevent handler errors from breaking logging
        console.error('Log handler error:', err);
      }
    }
  }
}

export interface LoggerConfig {
  level?: LogLevel;
  context?: Record<string, any>;
  handlers?: LogHandler[];
}

export interface LogHandler {
  handle(entry: LogEntry): void;
}

export class ConsoleLogHandler implements LogHandler {
  private readonly colors = {
    [LogLevel.DEBUG]: '\x1b[36m',    // Cyan
    [LogLevel.INFO]: '\x1b[32m',     // Green
    [LogLevel.WARN]: '\x1b[33m',     // Yellow
    [LogLevel.ERROR]: '\x1b[31m',    // Red
    [LogLevel.FATAL]: '\x1b[35m'     // Magenta
  };
  private readonly reset = '\x1b[0m';

  handle(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const color = this.colors[entry.level];
    const prefix = `${color}[${entry.timestamp}] [${levelName}]${this.reset}`;

    let output = `${prefix} ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      output += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`;
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.message}`;
      if (entry.error.stack) {
        output += `\n  Stack: ${entry.error.stack}`;
      }
    }

    // Use appropriate console method
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(output);
        break;
      case LogLevel.INFO:
        console.info(output);
        break;
      case LogLevel.WARN:
        console.warn(output);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(output);
        break;
    }
  }
}

export class JsonLogHandler implements LogHandler {
  handle(entry: LogEntry): void {
    const logObject = {
      timestamp: entry.timestamp,
      level: LogLevel[entry.level],
      message: entry.message,
      ...entry.context
    };

    if (entry.error) {
      logObject.error = {
        message: entry.error.message,
        stack: entry.error.stack,
        name: entry.error.name
      };
    }

    if (entry.traceId) {
      logObject.traceId = entry.traceId;
    }

    if (entry.spanId) {
      logObject.spanId = entry.spanId;
    }

    console.log(JSON.stringify(logObject));
  }
}

export class FileLogHandler implements LogHandler {
  private buffer: string[] = [];
  private readonly maxBufferSize = 100;
  private flushInterval: any;

  constructor(private readonly filePath: string) {
    // Flush every 5 seconds
    this.flushInterval = setInterval(() => this.flush(), 5000);
  }

  handle(entry: LogEntry): void {
    const logLine = `${entry.timestamp} [${LogLevel[entry.level]}] ${entry.message}`;
    this.buffer.push(logLine);

    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  private flush(): void {
    if (this.buffer.length === 0) {
      return;
    }

    const content = this.buffer.join('\n') + '\n';
    this.buffer = [];

    // In a real implementation, write to file
    // For now, just simulate
    // fs.appendFileSync(this.filePath, content);
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// Singleton logger factory
class LoggerFactory {
  private loggers: Map<string, Logger> = new Map();
  private defaultConfig: LoggerConfig = {
    level: LogLevel.INFO
  };

  configure(config: LoggerConfig): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  getLogger(name: string, config?: LoggerConfig): Logger {
    if (!this.loggers.has(name)) {
      const loggerConfig = { ...this.defaultConfig, ...config };
      this.loggers.set(name, new Logger(name, loggerConfig));
    }
    return this.loggers.get(name)!;
  }

  setGlobalLevel(level: LogLevel): void {
    this.defaultConfig.level = level;
    for (const logger of this.loggers.values()) {
      logger.setLevel(level);
    }
  }
}

export const loggerFactory = new LoggerFactory();

// Convenience functions
export function getLogger(name: string, config?: LoggerConfig): Logger {
  return loggerFactory.getLogger(name, config);
}

export function configureLogging(config: LoggerConfig): void {
  loggerFactory.configure(config);
}

export function setGlobalLogLevel(level: LogLevel): void {
  loggerFactory.setGlobalLevel(level);
}
