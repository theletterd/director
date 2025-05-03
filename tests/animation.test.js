const SceneHandler = require('../static/js/sceneHandler.js');
const AudioHandler = require('../static/js/audioHandler.js');

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
        const scene = { content: "Test Scene" };
        const element = sceneHandler.createSceneElement(scene);
        expect(element).toBeTruthy();
        expect(mockSceneElement.css).toHaveBeenCalled();
        expect(mockSceneElement.text).toHaveBeenCalledWith("Test Scene");
    });

    test('should handle animation content in createSceneElement', () => {
        const scene = {
            content: {
                frames: ["frame1", "frame2"],
                frame_length_ms: 100
            }
        };
        
        // Mock handleAnimation
        const originalHandleAnimation = sceneHandler.handleAnimation;
        sceneHandler.handleAnimation = jest.fn();
        
        const element = sceneHandler.createSceneElement(scene);
        expect(element).toBeTruthy();
        expect(mockSceneElement.css).toHaveBeenCalled();
        // Should not call text() for animation content
        expect(mockSceneElement.text).not.toHaveBeenCalled();
        // Should call handleAnimation with the correct parameters
        expect(sceneHandler.handleAnimation).toHaveBeenCalledWith(element, scene.content);
        
        // Restore original handleAnimation
        sceneHandler.handleAnimation = originalHandleAnimation;
    });

    describe('Scene Transitions', () => {
        test('should handle fade transition and keep elements visible by default', async () => {
            const scene = {
                content: "Test Scene",
                arrive: { transition: "fade", duration: 100 },
                dwell: 100,
                depart: { transition: "fade", duration: 100 }
            };

            await sceneHandler.processScene(scene);
            expect(mockSceneElement.css).toHaveBeenCalledWith('opacity', 0);
        }, 10000); // Increase timeout to 10s

        test('should handle departure with looping audio', async () => {
            const scene = {
                content: "Test Scene",
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
                content: "Test Scene",
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
                content: "Test Scene",
                arrive: { transition: "fade", duration: 100 },
                dwell: 100,
                depart: { transition: "fade", duration: 100, remove: true }
            };

            await sceneHandler.processScene(scene);
            expect(mockSceneElement.remove).toHaveBeenCalled();
        }, 10000); // Increase timeout to 10s

        test('should wait for departure by default', async () => {
            const scene = {
                content: "Test Scene",
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

            // Create mock elements with jQuery-like methods
            const element1 = {
                css: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis(),
                off: jest.fn().mockReturnThis(),
                remove: jest.fn(),
                0: { offsetHeight: 100 }
            };
            const element2 = {
                css: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis(),
                off: jest.fn().mockReturnThis(),
                remove: jest.fn(),
                0: { offsetHeight: 100 }
            };

            // Create a jQuery-like collection
            const mockCollection = {
                css: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis(),
                off: jest.fn().mockReturnThis(),
                remove: jest.fn(),
                0: element1,
                1: element2,
                length: 2,
                get: () => [element1, element2]
            };

            // Mock screen.find to return our mock collection
            mockScreen.find.mockReturnValue(mockCollection);

            // Process the scene
            await sceneHandler.processScene(scene);

            // Verify CSS transitions were set up
            expect(mockCollection.css).toHaveBeenCalledWith({
                'transition': 'opacity 2000ms linear',
                'opacity': 1
            });

            // Verify opacity was set to 0 to start the fade
            expect(mockCollection.css).toHaveBeenCalledWith('opacity', 0);

            // Verify transitionend handlers were set up
            expect(mockCollection.on).toHaveBeenCalledWith('transitionend', expect.any(Function));
        });

        test('should properly handle hide transition with remove option', async () => {
            const scene = {
                content: "Test Scene",
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
                content: "Test Scene",
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
                content: 'Test scene',
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

            const element = $('<div>').text(scene.content);

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
                content: 'Test scene',
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

            const element = $('<div>').text(scene.content);
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
                content: 'Test scene',
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

            const element = $('<div>').text(scene.content);
            let audioComplete = false;
            let visualComplete = false;

            // Mock audio handler to simulate delayed completion
            sceneHandler.audioHandler.handleAudio = jest.fn(() => {
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

        it('should fade out specific audio track with fade_audio directive', async () => {
            const scene = {
                directive: 'fade_audio',
                trackId: 'test_track',
                duration: 1000,
                wait_for_fade: true
            };

            // Mock audio handler
            let fadeOutCalled = false;
            sceneHandler.audioHandler.handleAudio = jest.fn((audio) => {
                fadeOutCalled = true;
                expect(audio.trackId).toBe('test_track');
                expect(audio.fadeOut).toBe(1000);
                return Promise.resolve();
            });

            // Process the scene
            await sceneHandler.handleDirective(scene);

            // Verify fade was called
            expect(fadeOutCalled).toBe(true);
            expect(sceneHandler.audioHandler.handleAudio).toHaveBeenCalledWith(
                expect.objectContaining({
                    trackId: 'test_track',
                    fadeOut: 1000
                })
            );
        });

        it('should fade out all audio tracks with fade_all_audio directive', async () => {
            const scene = {
                directive: 'fade_all_audio',
                duration: 1000
            };

            // Mock audio handler
            const trackIds = ['track1', 'track2', 'track3'];
            sceneHandler.audioHandler.getAllTrackIds = jest.fn().mockReturnValue(trackIds);
            
            let fadeOutCalls = 0;
            sceneHandler.audioHandler.fadeOutTrack = jest.fn((trackId, duration) => {
                fadeOutCalls++;
                expect(trackIds).toContain(trackId);
                expect(duration).toBe(1000);
                return Promise.resolve();
            });

            // Process the scene
            await sceneHandler.handleDirective(scene);

            // Verify fade was called for each track
            expect(fadeOutCalls).toBe(trackIds.length);
            trackIds.forEach(trackId => {
                expect(sceneHandler.audioHandler.fadeOutTrack).toHaveBeenCalledWith(trackId, 1000);
            });
        });

        it('should handle fade_all_audio with no tracks', async () => {
            const scene = {
                directive: 'fade_all_audio',
                duration: 1000
            };

            // Mock audio handler with no tracks
            sceneHandler.audioHandler.getAllTrackIds = jest.fn().mockReturnValue([]);
            sceneHandler.audioHandler.fadeOutTrack = jest.fn();

            // Process the scene
            await sceneHandler.handleDirective(scene);

            // Verify no fade calls were made
            expect(sceneHandler.audioHandler.fadeOutTrack).not.toHaveBeenCalled();
        });

        it('should wait for fade completion when wait_for_fade is true', async () => {
            // Create a jQuery element with mocked methods
            const element = $('<div>');
            element.on = jest.fn((event, handler) => {
                element.transitionHandler = handler;
            });
            element.off = jest.fn();
            element.css = jest.fn();
            element.show = jest.fn(() => element);
            element[0] = { offsetHeight: 100 }; // Mock for force reflow

            // Mock screen.find to return our element
            mockScreen.find.mockReturnValue(element);

            const scene = {
                arrive: {
                    transition: "fade",
                    duration: 1000,
                    wait_for_fade: true
                }
            };

            // Start processing the scene
            const scenePromise = sceneHandler.processScene(scene);
            
            // Wait a tick for the transition setup
            await new Promise(resolve => setTimeout(resolve, 0));

            // Verify transition was set up
            expect(element.css).toHaveBeenCalledWith({
                'transition': 'opacity 1000ms linear',
                'opacity': 0
            });
            expect(element.css).toHaveBeenCalledWith('opacity', 1);

            // Trigger the transition end
            element.transitionHandler();

            // Wait for scene processing to complete
            await scenePromise;

            // Verify cleanup
            expect(element.off).toHaveBeenCalledWith('transitionend', element.transitionHandler);
        });

        it('should not wait for fade completion when wait_for_fade is false', async () => {
            const scene = {
                directive: 'fade_audio',
                trackId: 'test_track',
                duration: 1000,
                wait_for_fade: false
            };

            let fadeComplete = false;
            sceneHandler.audioHandler.handleAudio = jest.fn(() => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        fadeComplete = true;
                        resolve();
                    }, 100);
                });
            });

            const startTime = Date.now();
            await sceneHandler.handleDirective(scene);
            const endTime = Date.now();

            // Verify we didn't wait for the fade to complete
            expect(endTime - startTime).toBeLessThan(100);
            // Fade might not be complete yet
            expect(fadeComplete).toBe(false);
        });

        test('type transition with cursor', async () => {
            const scene = {
                content: "Test text",
                arrive: {
                    transition: "type",
                    ms_per_char: 50,
                    show_cursor: true
                }
            };

            await sceneHandler.processScene(scene);

            // Verify that cursor was added and removed
            expect(mockSceneElement.append).toHaveBeenCalledWith(expect.any(Object));
            expect(mockSceneElement.append).toHaveBeenCalledWith(expect.objectContaining({
                addClass: expect.any(Function),
                text: expect.any(Function)
            }));
        });

        test('type transition without cursor', async () => {
            const scene = {
                content: "Test text",
                arrive: {
                    transition: "type",
                    ms_per_char: 50,
                    show_cursor: false
                }
            };

            await sceneHandler.processScene(scene);

            // Verify that cursor was not added
            expect(mockSceneElement.append).not.toHaveBeenCalledWith(expect.objectContaining({
                addClass: expect.any(Function),
                text: expect.any(Function)
            }));
        });

        test('should handle fade_all directive with no elements', async () => {
            const scene = {
                directive: "fade_all"
            };

            // Mock screen.find to return empty jQuery object
            mockScreen.find.mockReturnValue($([]));

            // Process the scene - should not throw
            await sceneHandler.processScene(scene);

            // Verify no CSS transitions were set up
            expect(mockSceneElement.css).not.toHaveBeenCalled();
            expect(mockSceneElement.remove).not.toHaveBeenCalled();
        });

        test('should handle fade_all directive with elements', async () => {
            const scene = {
                directive: "fade_all"
            };

            // Create mock elements with jQuery-like methods
            const element1 = {
                css: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis(),
                off: jest.fn().mockReturnThis(),
                remove: jest.fn(),
                0: { offsetHeight: 100 }
            };
            const element2 = {
                css: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis(),
                off: jest.fn().mockReturnThis(),
                remove: jest.fn(),
                0: { offsetHeight: 100 }
            };

            // Create a jQuery-like collection
            const mockCollection = {
                css: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis(),
                off: jest.fn().mockReturnThis(),
                remove: jest.fn(),
                0: element1,
                1: element2,
                length: 2,
                get: () => [element1, element2]
            };

            // Mock screen.find to return our mock collection
            mockScreen.find.mockReturnValue(mockCollection);

            // Process the scene
            await sceneHandler.processScene(scene);

            // Verify CSS transitions were set up
            expect(mockCollection.css).toHaveBeenCalledWith({
                'transition': 'opacity 2000ms linear',
                'opacity': 1
            });

            // Verify opacity was set to 0 to start the fade
            expect(mockCollection.css).toHaveBeenCalledWith('opacity', 0);

            // Verify transitionend handlers were set up
            expect(mockCollection.on).toHaveBeenCalledWith('transitionend', expect.any(Function));
        });

        test('should handle fade_all directive with elements already faded out', async () => {
            // Create a mock jQuery collection with elements already at opacity 0
            const mockCollection = {
                length: 2,
                css: jest.fn().mockImplementation((prop, value) => {
                    if (prop === 'opacity' && !value) return '0';
                    return mockCollection;
                }),
                on: jest.fn().mockReturnThis(),
                off: jest.fn().mockReturnThis(),
                remove: jest.fn()
            };

            // Mock screen.find to return our mock jQuery collection
            mockScreen.find.mockReturnValue(mockCollection);

            // Call fadeAllElements directly
            await sceneHandler.fadeAllElements();

            // Verify that elements were removed immediately without transitions
            expect(mockCollection.remove).toHaveBeenCalled();
            expect(mockCollection.on).not.toHaveBeenCalled();
            expect(mockCollection.css).toHaveBeenCalledWith('opacity');
        });
    });

    describe('Scene Restart', () => {
        test('should restart scene sequence', async () => {
            const scenes = [
                { content: "Scene 1", dwell: 100 },
                { content: "Scene 2", dwell: 100 }
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
                content: 'Test scene',
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
        }, 10000); // Increased timeout to 10 seconds
    });

    describe('Scene Completion', () => {
        test('should complete scene with looping audio', async () => {
            const scene = {
                content: "Test Scene",
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
                content: "Playing test audio...",
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

    describe('Audio Button Visibility', () => {
        let screen;
        let audioHandler;
        let sceneHandler;
        let $;

        beforeEach(() => {
            // Mock document.body
            document.body.innerHTML = '<div id="screen"></div>';
            screen = document.getElementById('screen');

            // Mock jQuery
            $ = element => ({
                appendTo: () => {},
                css: () => {},
                show: () => {},
                empty: () => {},
                remove: () => {},
                on: () => {},
                off: () => {},
                fadeOut: (duration, callback) => callback && callback(),
                is: () => true,
                find: () => [],
                append: () => {},
                text: () => {},
                hide: () => {},
                get: () => [element],
                length: 1
            });

            // Initialize handlers
            audioHandler = new AudioHandler();
            sceneHandler = new SceneHandler($(screen), audioHandler);
        });

        afterEach(() => {
            // Clean up
            document.body.innerHTML = '';
            if (audioHandler) {
                audioHandler.stopAllTracks();
            }
        });

        it('should not show audio button when no audio content exists', () => {
            const scenes = [
                {
                    content: "Scene without audio",
                    arrive: {
                        transition: "fade",
                        duration: 1000
                    },
                    dwell: 2000
                }
            ];

            // Just check audio usage without playing scenes
            audioHandler.checkAudioUsage(scenes);
            
            // Check that audio button is not present
            const audioButtons = document.querySelectorAll('button[data-audio-enable]');
            expect(audioButtons.length).toBe(0);
        });

        it('should show audio button when audio content exists', () => {
            const scenes = [
                {
                    content: "Scene with audio",
                    arrive: {
                        transition: "fade",
                        duration: 1000,
                        audio: {
                            trackId: "test_track",
                            volume: 0.5
                        }
                    },
                    dwell: 2000
                }
            ];

            // Just check audio usage without playing scenes
            audioHandler.checkAudioUsage(scenes);
            
            // Check that audio button is present
            const audioButtons = document.querySelectorAll('button[data-audio-enable]');
            expect(audioButtons.length).toBe(1);
            expect(audioButtons[0].textContent).toContain('Click to Enable Audio');
        });

        it('should remove audio button when audio is enabled', async () => {
            const scenes = [
                {
                    content: "Scene with audio",
                    arrive: {
                        transition: "fade",
                        duration: 1000,
                        audio: {
                            trackId: "test_track",
                            volume: 0.5
                        }
                    },
                    dwell: 2000
                }
            ];

            // Check audio usage to show the button
            audioHandler.checkAudioUsage(scenes);
            
            // Get the button
            const button = document.querySelector('button[data-audio-enable]');
            expect(button).toBeTruthy();
            expect(button.textContent).toContain('Click to Enable Audio');

            // Simulate clicking the button
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            button.dispatchEvent(clickEvent);

            // Wait for the audio context to be resumed
            await new Promise(resolve => setTimeout(resolve, 0));

            // Check that the button is removed from the DOM
            const remainingButtons = document.querySelectorAll('button[data-audio-enable]');
            expect(remainingButtons.length).toBe(0);
        });

        it('should not create button when audio is already allowed', () => {
            const scenes = [
                {
                    content: "Scene with audio",
                    arrive: {
                        transition: "fade",
                        duration: 1000,
                        audio: {
                            trackId: "test_track",
                            volume: 0.5
                        }
                    },
                    dwell: 2000
                }
            ];

            // Set audio as already allowed
            audioHandler.isAudioAllowed = true;

            // Check audio usage
            audioHandler.checkAudioUsage(scenes);
            
            // Check that no button was created
            const audioButtons = document.querySelectorAll('button[data-audio-enable]');
            expect(audioButtons.length).toBe(0);
        });
    });
}); 