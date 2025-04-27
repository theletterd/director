// Mock logger
global.logger = {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
};

// Mock jQuery
global.$ = jest.fn((selector) => ({
    append: jest.fn(),
    empty: jest.fn(),
    fadeIn: jest.fn(),
    fadeOut: jest.fn(),
    hide: jest.fn(),
    show: jest.fn(),
    is: jest.fn(),
    remove: jest.fn(),
    text: jest.fn(),
    css: jest.fn(),
    addClass: jest.fn(),
    removeClass: jest.fn(),
    appendTo: jest.fn()
}));

// Mock AudioContext
global.AudioContext = jest.fn(() => ({
    createBufferSource: jest.fn(() => ({
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn()
    })),
    createGain: jest.fn(() => ({
        connect: jest.fn(),
        gain: {
            setValueAtTime: jest.fn(),
            linearRampToValueAtTime: jest.fn()
        }
    })),
    decodeAudioData: jest.fn((buffer, success) => success(new ArrayBuffer(8)))
}));

// Mock fetch for audio loading
global.fetch = jest.fn(() => 
    Promise.resolve({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
    })
); 