const SceneHandler = require('../sceneHandler.js');
const AudioHandler = require('../audioHandler');

describe('SceneHandler', () => {
    let sceneHandler;
    let mockScreen;
    let mockAudioHandler;
    let mockSceneElement;
    let logger;

    beforeEach(() => {
        // Reset mocks before each test
        mockSceneElement = {
            addClass: jest.fn().mockReturnThis(),
            append: jest.fn().mockReturnThis(),
            appendTo: jest.fn(function(parent) {
                if (parent === mockScreen) {
                    mockScreen.append(this);
                }
                return this;
            }),
            css: jest.fn().mockReturnThis(),
            empty: jest.fn().mockReturnThis(),
            find: jest.fn().mockReturnThis(),
            hide: jest.fn().mockReturnThis(),
            is: jest.fn().mockReturnValue(true),
            remove: jest.fn().mockReturnThis(),
            show: jest.fn().mockReturnThis(),
            text: jest.fn().mockImplementation(function(text) {
                if (text === undefined) return "test text";
                return this;
            }),
            animate: jest.fn((props, duration, callback) => setTimeout(callback, duration)),
            on: jest.fn((event, handler) => {
                // Simulate transition end after duration
                setTimeout(() => {
                    handler();
                }, 100);
                return mockSceneElement;
            }),
            off: jest.fn().mockReturnThis(),
            // Add DOM-like properties
            0: {
                offsetHeight: 100,
                style: {
                    transition: '',
                    opacity: 1
                }
            }
        };

        mockScreen = {
            append: jest.fn().mockReturnThis(),
            empty: jest.fn().mockReturnThis(),
            find: jest.fn().mockReturnValue(mockSceneElement)
        };

        mockAudioHandler = {
            handleAudio: jest.fn().mockImplementation(() => {
                throw new Error('Audio error');
            }),
            stopAllTracks: jest.fn(),
            stopTrack: jest.fn(),
            fadeOutTrack: jest.fn(),
            getAllTrackIds: jest.fn().mockReturnValue([]),
            setAudioEnabledCallback: jest.fn(),
            isAudioAllowed: true
        };

        logger = {
            info: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn()
        };

        // Mock jQuery
        global.$ = jest.fn((selector) => {
            if (selector === '<div>') {
                return mockSceneElement;
            }
            return mockSceneElement;
        });

        global.logger = logger;
        sceneHandler = new SceneHandler(mockScreen, mockAudioHandler);
        // Clear initialization logs
        logger.info.mockClear();
    });

    afterEach(() => {
        // Clean up after each test
        jest.clearAllMocks();
        delete global.$;
    });

    test('should create scene element with correct properties', () => {
        const scene = { text: "Test Scene" };
        const element = sceneHandler.createSceneElement(scene);
        expect(element).toBeTruthy();
        expect(mockSceneElement.css).toHaveBeenCalled();
        expect(mockSceneElement.text).toHaveBeenCalledWith("Test Scene");
    });

    describe('Scene Transitions', () => {
        test('should handle fade transition and keep elements visible by default', async () => {
            const scene = {
                text: "Test Scene",
                arrive: { transition: "fade", duration: 100 },
                dwell: 100,
                depart: { transition: "fade", duration: 100 }
            };

            await sceneHandler.processScene(scene);
            expect(mockSceneElement.css).toHaveBeenCalledWith('opacity', 0);
        }, 10000); // Increase timeout to 10s

        test('should handle departure with looping audio', async () => {
            const scene = {
                text: "Test Scene",
                arrive: {
                    audio: {
                        trackId: "test",
                        url: "test.mp3",
                        loop: true
                    }
                },
                dwell: 100,
                depart: {
                    transition: "fade",
                    duration: 100,
                    audio: {
                        trackId: "test2",
                        url: "test2.mp3",
                        loop: true
                    }
                }
            };

            // Mock audio handler to simulate looping audio
            mockAudioHandler.handleAudio.mockImplementation(async (audio) => {
                if (audio.loop) {
                    // Simulate audio playing but don't wait for it to complete
                    return;
                }
            });

            const startTime = Date.now();
            await sceneHandler.processScene(scene);
            const endTime = Date.now();

            // Scene should complete within dwell + transition time + buffer
            const maxExpectedTime = scene.dwell + scene.depart.duration + 200; // Increased buffer to 200ms
            expect(endTime - startTime).toBeLessThanOrEqual(maxExpectedTime);
            
            // Verify transition was handled
            expect(mockSceneElement.css).toHaveBeenCalledWith('opacity', 0);
            
            // Verify audio was handled for both arrival and departure
            expect(mockAudioHandler.handleAudio).toHaveBeenCalledTimes(2);
        }, 10000); // Increase timeout to 10s

        test('should remove elements when explicitly requested', async () => {
            const scene = {
                text: "Test Scene",
                arrive: { transition: "fade", duration: 100 },
                dwell: 100,
                depart: { transition: "fade", duration: 100, remove: true }
            };

            await sceneHandler.processScene(scene);
            expect(mockSceneElement.remove).toHaveBeenCalled();
        }, 10000); // Increase timeout to 10s

        test('should wait for departure by default', async () => {
            const scene = {
                text: "Test Scene",
                arrive: { transition: "fade", duration: 100 },
                dwell: 100,
                depart: { transition: "fade", duration: 100 }
            };

            const startTime = Date.now();
            await sceneHandler.processScene(scene);
            const endTime = Date.now();
            
            const minExpectedTime = scene.arrive.duration + scene.dwell + scene.depart.duration;
            expect(endTime - startTime).toBeGreaterThanOrEqual(minExpectedTime);
        }, 10000); // Increase timeout to 10s
    });

    describe('Scene Restart', () => {
        test('should restart scene sequence', async () => {
            const scenes = [
                { text: "Scene 1", dwell: 100 },
                { text: "Scene 2", dwell: 100 }
            ];

            await sceneHandler.playScenes(scenes);
            await sceneHandler.restartScenes();
            expect(mockScreen.empty).toHaveBeenCalled();
            expect(mockAudioHandler.stopAllTracks).toHaveBeenCalled();
        });
    });

    describe('Error Recovery', () => {
        test('should handle audio errors gracefully', async () => {
            // Mock audio handler to throw an error
            mockAudioHandler.handleAudio.mockImplementation(() => {
                throw new Error('Audio error');
            });

            // Create a scene with audio that will fail
            const scene = {
                text: 'Test scene',
                arrive: {
                    audio: {
                        src: 'test.mp3'
                    }
                }
            };

            // Process the scene - this should not throw
            await sceneHandler.processScene(scene);

            // Verify the scene element was still created despite audio error
            expect(mockScreen.append).toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalledWith(
                '[Audio] Error handling audio (attempt 1/3):',
                expect.any(Error)
            );
        });
    });

    describe('Performance Mode', () => {
        test('should disable logging in performance mode', async () => {
            sceneHandler.setPerformanceMode(true);
            sceneHandler.log('test message');
            expect(logger.info).not.toHaveBeenCalled();
        });

        test('should still handle audio in performance mode', async () => {
            const scene = {
                text: "Test Scene",
                arrive: {
                    audio: { url: "test.mp3", volume: 0.5 }
                }
            };

            sceneHandler.setPerformanceMode(true);
            await sceneHandler.processScene(scene);
            expect(mockAudioHandler.handleAudio).toHaveBeenCalled();
        });
    });

    describe('Scene Completion', () => {
        test('should complete scene with looping audio', async () => {
            const scene = {
                text: "Test Scene",
                arrive: {
                    audio: {
                        trackId: "test",
                        url: "test.mp3",
                        loop: true
                    }
                },
                dwell: 100,
                depart: {
                    transition: "fade",
                    duration: 100
                }
            };

            // Mock audio handler to simulate looping audio
            mockAudioHandler.handleAudio.mockImplementation(async (audio) => {
                if (audio.loop) {
                    // Simulate audio playing but don't wait for it to complete
                    return;
                }
            });

            const startTime = Date.now();
            await sceneHandler.processScene(scene);
            const endTime = Date.now();

            // Scene should complete within dwell + transition time + buffer
            const maxExpectedTime = scene.dwell + scene.depart.duration + 200;
            expect(endTime - startTime).toBeLessThanOrEqual(maxExpectedTime);
        }, 10000); // Increase timeout to 10s
    });

    test('stop_audio directive stops audio track', async () => {
        const screen = $('#screen');
        const audioHandler = new AudioHandler();
        const sceneHandler = new SceneHandler(screen, audioHandler);

        // Create a test scene that plays audio and then stops it
        const testScenes = [
            {
                text: "Playing test audio...",
                arrive: {
                    transition: "type",
                    ms_per_char: 50,
                    audio: {
                        trackId: "test_audio",
                        url: "./sound_effects/forest-footsteps.wav",
                        volume: 0.5,
                        fadeIn: 0,
                        loop: false
                    }
                },
                dwell: 1000
            },
            {
                directive: "stop_audio",
                trackId: "test_audio",
                dwell: 100
            }
        ];

        // Start playing the scenes
        sceneHandler.playScenes(testScenes);

        // Wait for the first scene to complete
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check that the audio track is not in the tracks map
        const trackIds = audioHandler.getAllTrackIds();
        expect(trackIds).not.toContain("test_audio");

        // Clean up
        sceneHandler.stop();
    });
}); 