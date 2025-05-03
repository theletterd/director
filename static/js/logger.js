class Logger {
    constructor(level = 'error') {
        this.level = level;
        this.levels = {
            'error': 0,
            'warn': 1,
            'info': 2,
            'debug': 3
        };
    }

    setLevel(level) {
        if (this.levels[level] !== undefined) {
            this.level = level;
        }
    }

    shouldLog(level) {
        return this.levels[level] <= this.levels[this.level];
    }

    error(message, ...args) {
        console.error(`[ERROR] ${message}`, ...args);
    }

    warn(message, ...args) {
        if (this.shouldLog('warn')) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    }

    info(message, ...args) {
        if (this.shouldLog('info')) {
            console.info(`[INFO] ${message}`, ...args);
        }
    }

    debug(message, ...args) {
        if (this.shouldLog('debug')) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }
}

// Create a global logger instance with default error level
const logger = new Logger('error');

// Export the logger
if (typeof module !== 'undefined' && module.exports) {
    module.exports = logger;
} 
window.logger = new Logger('debug'); 