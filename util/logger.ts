type LogLevel = 1 | 2

class Logger {
  logLevel: LogLevel = 1
  info(...data: any[]) {
    if (this.logLevel === 2) console.log('[ZOOCASSO] INFO:', ...data)
  }
  log(...data: any[]) {
    if (this.logLevel === 2) console.log('[ZOOCASSO] LOG:', ...data)
  }
  error(...data: any[]) {
    console.error('[ZOOCASSO] ERROR:', ...data)
  }
  debug(...data: any[]) {
    if (this.logLevel === 2) {
      console.debug('[ZOOCASSO] DEBUG:', ...data)
    }
  }
  setLogLevel(level: LogLevel) {
    this.logLevel = level
  }
}

const logger = new Logger()

export default logger
