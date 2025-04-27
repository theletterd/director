class Logger {
    constructor(level = 'debug') {
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        this.currentLevel = this.levels[level];
    }

    setLevel(level) {
        if (this.levels[level] !== undefined) {
            this.currentLevel = this.levels[level];
            console.log(`[Logger] Set level to ${level}`);
        }
    }

    debug(message, ...args) {
        if (this.currentLevel <= this.levels.debug) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }

    info(message, ...args) {
        if (this.currentLevel <= this.levels.info) {
            console.info(`[INFO] ${message}`, ...args);
        }
    }

    warn(message, ...args) {
        if (this.currentLevel <= this.levels.warn) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    }

    error(message, ...args) {
        if (this.currentLevel <= this.levels.error) {
            console.error(`[ERROR] ${message}`, ...args);
        }
    }
}

// Create a global logger instance with debug level
window.logger = new Logger('debug'); 