/**
 * Ghumo Application Structured Logger
 * Provides tagged, formatted console logs for tracking app lifecycle steps,
 * authentication events, API requests, state updates, and navigation.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private formatTimestamp(): string {
    const now = new Date();
    return now.toISOString().split('T')[1].replace('Z', '');
  }

  private log(level: LogLevel, tag: string, message: string, data?: any) {
    const time = this.formatTimestamp();
    const prefix = `[${time}] [${tag}]`;

    switch (level) {
      case 'info':
        if (data !== undefined) {
          console.log(`${prefix} ℹ️ ${message}`, data);
        } else {
          console.log(`${prefix} ℹ️ ${message}`);
        }
        break;
      case 'warn':
        if (data !== undefined) {
          console.warn(`${prefix} ⚠️ ${message}`, data);
        } else {
          console.warn(`${prefix} ⚠️ ${message}`);
        }
        break;
      case 'error':
        if (data !== undefined) {
          console.error(`${prefix} 🚨 ${message}`, data);
        } else {
          console.error(`${prefix} 🚨 ${message}`);
        }
        break;
      case 'debug':
        if (data !== undefined) {
          console.debug(`${prefix} 🔍 ${message}`, data);
        } else {
          console.debug(`${prefix} 🔍 ${message}`);
        }
        break;
    }
  }

  public auth(step: string, data?: any) {
    this.log('info', 'AUTH', step, data);
  }

  public api(method: string, url: string, status?: number, data?: any) {
    const statusText = status ? ` [Status: ${status}]` : '';
    this.log('info', 'API', `${method} ${url}${statusText}`, data);
  }

  public theme(mode: string) {
    this.log('info', 'THEME', `Switched theme mode to: ${mode}`);
  }

  public search(query: string, filters?: any) {
    this.log('info', 'SEARCH', `Search executed: "${query}"`, filters);
  }

  public app(event: string, details?: any) {
    this.log('info', 'APP', event, details);
  }

  public error(tag: string, message: string, error?: any) {
    this.log('error', tag, message, error);
  }

  public warn(tag: string, message: string, data?: any) {
    this.log('warn', tag, message, data);
  }
}

export const logger = new Logger();
