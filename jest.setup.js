// Tests run in jsdom with real jQuery; the logger is silenced but inspectable.
global.$ = global.jQuery = require('jquery');

global.logger = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    setLevel: jest.fn(),
};
