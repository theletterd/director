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

        test('should keep element visible with keep transition', async () => {
            const scene = {
                text: "Test Scene",
                arrive: {
                    transition: "fade",
                    duration: 100
                },
                dwell: 100,
                depart: {
                    transition: "keep"
                }
            };

            await sceneHandler.processScene(scene);
            
            // Element should be shown and at full opacity
            expect(mockSceneElement.show).toHaveBeenCalled();
            expect(mockSceneElement.css).toHaveBeenCalledWith('opacity', 1);
            
            // Element should not be hidden or removed
            expect(mockSceneElement.hide).not.toHaveBeenCalled();
            expect(mockSceneElement.remove).not.toHaveBeenCalled();
        }, 10000);

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

        test('should fade out all elements with fade_all directive', async () => {
            const scene = {
                directive: "fade_all"
            };

            // Create some test elements
            const element1 = $('<div>').text('Test 1');
            const element2 = $('<div>').text('Test 2');
            element1.remove = jest.fn();
            element2.remove = jest.fn();
            element1.on = jest.fn((event, handler) => {
                element1.transitionHandler = handler;
            });
            element2.on = jest.fn((event, handler) => {
                element2.transitionHandler = handler;
            });
            element1.off = jest.fn();
            element2.off = jest.fn();
            mockScreen.find.mockReturnValue($([element1[0], element2[0]]));

            // Process the scene
            const processPromise = sceneHandler.processScene(scene);

            // Verify CSS transitions were set up
            expect(element1.css).toHaveBeenCalledWith({
                'transition': 'opacity 2000ms linear',
                'opacity': 1
            });
            expect(element2.css).toHaveBeenCalledWith({
                'transition': 'opacity 2000ms linear',
                'opacity': 1
            });

            // Verify opacity was set to 0 to start the fade
            expect(element1.css).toHaveBeenCalledWith('opacity', 0);
            expect(element2.css).toHaveBeenCalledWith('opacity', 0);

            // Trigger the transition end handlers
            element1.transitionHandler();

            // Wait for the scene to complete
            await processPromise;

            // Verify elements were removed
            expect(element1.remove).toHaveBeenCalled();
            expect(element2.remove).toHaveBeenCalled();
        }, 10000);

        test('should properly handle hide transition with remove option', async () => {
            const scene = {
                text: "Test Scene",
                arrive: { transition: "show" },
                dwell: 100,
                depart: { transition: "hide", remove: true }
            };

            await sceneHandler.processScene(scene);
            
            // Verify element was removed from DOM
            expect(mockSceneElement.remove).toHaveBeenCalled();
            expect(mockSceneElement.hide).not.toHaveBeenCalled();
            expect(mockSceneElement.css).not.toHaveBeenCalledWith('opacity', 0);
        }, 10000);

        test('should properly handle hide transition without remove option', async () => {
            const scene = {
                text: "Test Scene",
                arrive: { transition: "show" },
                dwell: 100,
                depart: { transition: "hide", remove: false }
            };

            await sceneHandler.processScene(scene);
            
            // Verify element was hidden but not removed
            expect(mockSceneElement.hide).toHaveBeenCalled();
            expect(mockSceneElement.remove).not.toHaveBeenCalled();
            expect(mockSceneElement.css).not.toHaveBeenCalledWith('opacity', 0);
        }, 10000);

        it('should start audio fade and visual transition simultaneously during departure', async () => {
            const scene = {
                text: 'Test scene',
                depart: {
                    transition: 'fade',
                    duration: 1000,
                    audio: {
                        track: 'test_track',
                        fadeOut: 1000
                    },
                    wait_for_audio: true
                }
            };

            const element = $('<div>').text(scene.text);

            // Mock audio handler to track when fade starts
            let audioFadeStartTime;
            sceneHandler.audioHandler.handleAudio = jest.fn(() => {
                audioFadeStartTime = Date.now();
                return Promise.resolve();
            });

            // Mock transition to track when it starts
            let transitionStartTime;
            element.css = jest.fn((props, value) => {
                if ((typeof props === 'string' && props === 'opacity' && value === 0) ||
                    (typeof props === 'object' && props.opacity === 0)) {
                    transitionStartTime = Date.now();
                }
                return element;
            });

            // Mock transitionend event
            element.on = jest.fn((event, handler) => {
                if (event === 'transitionend') {
                    setTimeout(handler, 100);
                }
                return element;
            });

            await sceneHandler.handleDeparture(element, scene.depart);

            // Verify both transitions started within 10ms of each other
            expect(audioFadeStartTime).toBeDefined();
            expect(transitionStartTime).toBeDefined();
            expect(Math.abs(audioFadeStartTime - transitionStartTime)).toBeLessThan(10);
        });

        it('should wait for both audio and visual transitions when wait_for_audio is true', async () => {
            const scene = {
                text: 'Test scene',
                depart: {
                    transition: 'fade',
                    duration: 1000,
                    audio: {
                        track: 'test_track',
                        fadeOut: 1000
                    },
                    wait_for_audio: true
                }
            };

            const element = $('<div>').text(scene.text);
            let audioComplete = false;
            let visualComplete = false;

            // Mock audio handler to simulate delayed completion
            sceneHandler.audioHandler.handleAudio = jest.fn(() => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        audioComplete = true;
                        resolve();
                    }, 100);
                });
            });

            // Mock transition to simulate delayed completion
            element.css = jest.fn().mockReturnThis();
            element.on = jest.fn((event, handler) => {
                if (event === 'transitionend') {
                    setTimeout(() => {
                        visualComplete = true;
                        handler();
                    }, 100);
                }
                return element;
            });
            element.off = jest.fn().mockReturnThis();

            const startTime = Date.now();
            await sceneHandler.handleDeparture(element, scene.depart);
            const endTime = Date.now();

            // Verify both transitions completed
            expect(audioComplete).toBe(true);
            expect(visualComplete).toBe(true);
            // Verify we waited for both (should take at least 100ms)
            expect(endTime - startTime).toBeGreaterThanOrEqual(100);
        });

        it('should only wait for visual transition when wait_for_audio is false', async () => {
            const scene = {
                text: 'Test scene',
                depart: {
                    transition: 'fade',
                    duration: 1000,
                    audio: {
                        track: 'test_track',
                        fadeOut: 1000
                    },
                    wait_for_audio: false
                }
            };

            const element = $('<div>').text(scene.text);
            let audioComplete = false;
            let visualComplete = false;

            // Mock audio handler to simulate delayed completion
            sceneHandler.audioHandler.fadeOutTrack = jest.fn(() => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        audioComplete = true;
                        resolve();
                    }, 1000);
                });
            });

            // Mock transition to simulate faster completion
            element.css = jest.fn();
            element.on = jest.fn((event, handler) => {
                setTimeout(() => {
                    visualComplete = true;
                    handler();
                }, 500); // Visual transition completes faster
            });

            const startTime = Date.now();
            await sceneHandler.handleDeparture(element, scene.depart);
            const endTime = Date.now();

            // Verify visual transition completed
            expect(visualComplete).toBe(true);
            // Verify we didn't wait for audio (should take less than 1000ms)
            expect(endTime - startTime).toBeLessThan(1000);
            // Audio might not be complete yet
            expect(audioComplete).toBe(false);
        });
    });

    describe('Scene Restart', () => {
        test('should restart scene sequence', async () => {
            const scenes = [
                { text: "Scene 1", dwell: 100 },
                { text: "Scene 2", dwell: 100 }
            ];

            // Mock playScenes to resolve immediately
            const originalPlayScenes = sceneHandler.playScenes;
            sceneHandler.playScenes = jest.fn().mockResolvedValue();

            // Start playing scenes
            await sceneHandler.playScenes(scenes);

            // Clear previous calls
            mockScreen.empty.mockClear();
            mockAudioHandler.stopAllTracks.mockClear();
            sceneHandler.playScenes.mockClear();

            // Store the scenes in the handler
            sceneHandler.scenes = scenes;
            sceneHandler.currentSceneIndex = 1; // Set current index to simulate playback

            // Trigger restart
            await sceneHandler.restartScenes();

            // Verify screen was cleared and audio was stopped
            expect(mockScreen.empty).toHaveBeenCalled();
            expect(mockAudioHandler.stopAllTracks).toHaveBeenCalled();

            // Verify scenes were played again from the current index
            expect(sceneHandler.playScenes).toHaveBeenCalledWith(scenes, 1);

            // Restore original playScenes
            sceneHandler.playScenes = originalPlayScenes;
        }, 10000); // Increase timeout to 10 seconds
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