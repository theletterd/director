class SceneHandler {
    constructor(screen, audioHandler) {
        this.screen = screen;
        this.audioHandler = audioHandler;
        this.currentSceneIndex = 0;
        this.scenes = null;
        this.isPlaying = false;
        this.shouldLoop = true;
        this.onSceneCompleteCallbacks = new Map();
        this.isRestarting = false;
        this.speedMultiplier = 1.0;

        // Set up logging
        this.logger = typeof logger !== 'undefined' ? logger : console;

        logger.info("SceneHandler initialized with screen:", screen);

        // Set up audio enabled callback
        this.audioHandler.setAudioEnabledCallback(() => {
            logger.info("[Scene] Audio enabled, restarting scenes");
            this.restartScenes();
        });
    }

    setSpeedMultiplier(multiplier) {
        if (multiplier > 0) {
            this.speedMultiplier = multiplier;
            logger.info(`[Scene] Speed multiplier set to: ${multiplier}`);
        } else {
            logger.warn(`[Scene] Invalid speed multiplier: ${multiplier}`);
        }
    }

    getAdjustedDuration(duration) {
        return Math.max(1, Math.floor(duration / this.speedMultiplier));
    }

    onSceneComplete(sceneIndex, callback) {
        this.onSceneCompleteCallbacks.set(sceneIndex, callback);
    }

    async processScene(scene) {
        const sceneStartTime = performance.now();

        try {
            if (!scene) {
                logger.error("[Scene] Scene is null or undefined");
                return;
            }

            logger.debug(`[Scene ${this.currentSceneIndex}] Processing scene:`, JSON.stringify(scene, null, 2));

            // Handle directive if present
            if (scene.directive) {
                await this.handleDirective(scene);
                logger.info(`[Scene ${this.currentSceneIndex}] Directive took ${(performance.now() - sceneStartTime).toFixed(2)}ms`);
                return;
            }

            // Create and add the scene element
            const sceneElement = this.createSceneElement(scene);
            logger.info(`[Scene ${this.currentSceneIndex}] Element creation took ${(performance.now() - sceneStartTime).toFixed(2)}ms`);

            // Handle arrival phase
            if (scene.arrive) {
                await this.handleArrival(sceneElement, scene.arrive);
                logger.info(`[Scene ${this.currentSceneIndex}] Arrival took ${(performance.now() - sceneStartTime).toFixed(2)}ms`);
            }

            // Wait for dwell time
            if (scene.dwell) {
                await this.sleep(scene.dwell);
                logger.info(`[Scene ${this.currentSceneIndex}] Dwell took ${(performance.now() - sceneStartTime).toFixed(2)}ms`);
            }

            // Handle departure phase
            if (scene.depart) {
                await this.handleDeparture(sceneElement, scene.depart);
                logger.info(`[Scene ${this.currentSceneIndex}] Departure took ${(performance.now() - sceneStartTime).toFixed(2)}ms`);
            }

            const totalDuration = performance.now() - sceneStartTime;
            logger.info(`[Scene ${this.currentSceneIndex}] Total scene duration: ${totalDuration.toFixed(2)}ms`);

            // Notify that this scene is complete
            const callback = this.onSceneCompleteCallbacks.get(this.currentSceneIndex);
            if (callback) {
                callback();
                this.onSceneCompleteCallbacks.delete(this.currentSceneIndex);
            }

            return totalDuration;
        } catch (error) {
            logger.error("[Scene] Error processing scene:", error);
            throw error;
        }
    }

    async handleDirective(scene) {
        if (!scene.directive) {
            logger.debug("No directive found in scene");
            return false;
        }

        logger.info(`[Scene] Handling directive: ${scene.directive}`);
        const directiveComplete = new Promise(async (resolve) => {
            switch (scene.directive) {
                case "clear":
                    logger.debug("Clearing screen");
                    this.screen.empty();
                    break;
                case "blankline":
                    logger.debug("Adding blank line");
                    const blankLine = $('<div>');
                    blankLine.css({
                        'height': '1.2em',
                        'display': 'block'
                    });
                    this.screen.append(blankLine);
                    break;
                case "fade_all":
                    logger.debug("Fading all elements");
                    await this.fadeAllElements();
                    break;
                case "stop_audio":
                    logger.info(`[Scene] Stopping audio track: ${scene.trackId || 'all'}`);
                    try {
                        if (scene.trackId) {
                            await this.audioHandler.stopTrack(scene.trackId);
                            logger.info(`[Scene] Successfully stopped track: ${scene.trackId}`);
                        } else {
                            await this.audioHandler.stopAllTracks();
                            logger.info("[Scene] Successfully stopped all tracks");
                        }
                        // Add a small delay to ensure the stop operation is complete
                        await new Promise(resolve => setTimeout(resolve, 100));
                    } catch (error) {
                        logger.error("[Scene] Error stopping audio:", error);
                    }
                    break;
                case "fade_audio":
                    logger.debug(`Fading audio track: ${scene.trackId} over ${scene.duration || 2000}ms`);
                    try {
                        if (scene.trackId) {
                            // Create audio config for fade out
                            const audio = {
                                trackId: scene.trackId,
                                fadeOut: scene.duration || 2000
                            };

                            // Start the fade and wait if requested
                            if (scene.wait_for_fade) {
                                logger.debug(`Waiting for fade to complete`);
                                await this.handleAudio(audio);
                                // After fade is complete, ensure the track is stopped
                                this.audioHandler.stopTrack(scene.trackId);
                            } else {
                                // Start fade but don't wait
                                this.handleAudio(audio).catch(error => {
                                    logger.error("Error during fade_audio:", error);
                                });
                            }
                        }
                    } catch (error) {
                        logger.error("Error during fade_audio:", error);
                    }
                    break;
                case "fade_all_audio":
                    logger.debug(`Fading all audio tracks over ${scene.duration || 2000}ms`);
                    try {
                        const trackIds = this.audioHandler.getAllTrackIds();
                        if (trackIds.length === 0) {
                            logger.debug("No audio tracks to fade out");
                            resolve();
                            break;
                        }

                        // Start fading all tracks
                        for (const trackId of trackIds) {
                            this.audioHandler.fadeOutTrack(trackId, scene.duration || 2000);
                        }

                        // Always wait for the fade to complete
                        const fadeDuration = scene.duration || 2000;
                        logger.debug(`Waiting for ${fadeDuration}ms for fade to complete`);
                        
                        // Add a small buffer to ensure the fade is complete
                        await new Promise(resolve => setTimeout(resolve, fadeDuration + 100));
                        
                        // Ensure all tracks are stopped
                        for (const trackId of trackIds) {
                            this.audioHandler.stopTrack(trackId);
                        }
                    } catch (error) {
                        logger.error("Error during fade_all_audio:", error);
                    }
                    resolve();
                    break;
            }

            // If there's a dwell time, wait for it
            if (scene.dwell) {
                await this.sleep(scene.dwell);
            }

            resolve();
        });

        // Notify that this scene is complete
        const callback = this.onSceneCompleteCallbacks.get(this.currentSceneIndex);
        if (callback) {
            directiveComplete.then(() => {
                callback();
                this.onSceneCompleteCallbacks.delete(this.currentSceneIndex);
            });
        }

        return true;
    }

    async fadeAllElements() {
        logger.debug("Fading all elements");
        const elements = this.screen.find('div');
        
        // If no elements, resolve immediately
        if (!elements.length) {
            logger.debug("No elements to fade");
            return;
        }

        // Check if all elements are already at opacity 0
        const allAlreadyFaded = elements.css('opacity') === '0';

        if (allAlreadyFaded) {
            logger.debug("All elements already faded out");
            elements.remove();
            return;
        }

        const duration = this.getAdjustedDuration(2000);

        return new Promise(resolve => {
            // Set up transitions for all elements
            elements.css({
                'transition': `opacity ${duration}ms linear`,
                'opacity': 1
            });

            // Force a reflow on the first element
            if (elements[0] && elements[0].offsetHeight !== undefined) {
                elements[0].offsetHeight;
            }

            // Start the fade
            elements.css('opacity', 0);

            // Set up transitionend listener
            const onTransitionEnd = () => {
                elements.off('transitionend', onTransitionEnd);
                elements.remove();
                resolve();
            };

            elements.on('transitionend', onTransitionEnd);
        });
    }

    createSceneElement(scene) {
        if (!scene) {
            logger.error("[Scene] Cannot create element for null scene");
            return null;
        }

        logger.debug("[Scene] Creating element");
        const element = $("<div>").addClass("scene");

        // Add default styling
        element.css({
            'white-space': 'pre',
            'font-family': 'monospace',
            'line-height': '1.2',
            'display': 'block'
        });

        // Set content if it exists
        if (scene.content) {
            if (typeof scene.content === 'object' && scene.content.frames) {
                // Handle animation content
                logger.debug("[Scene] Starting animation");
                this.handleAnimation(element, scene.content);
            } else {
                // Regular text content
                element.text(scene.content);
            }
        }

        element.appendTo(this.screen);
        logger.debug("[Scene] Element created and added to screen");

        return element;
    }

    async handleAudio(audio) {
        if (!audio || !this.audioHandler) return;
        
        const maxRetries = 3;
        let attempts = 0;
        
        while (attempts < maxRetries) {
            try {
                logger.debug(`[Audio] Attempting to handle audio (attempt ${attempts + 1}/${maxRetries})`);
                await this.audioHandler.handleAudio(audio);
                return;
            } catch (error) {
                attempts++;
                
                // Log with attempt count
                logger.error(`[Audio] Error handling audio (attempt ${attempts}/${maxRetries}):`, error);

                // Different handling based on error type
                if (error instanceof TypeError || error.name === 'TypeError') {
                    // Configuration/setup errors - don't retry
                    logger.error('[Audio] Audio configuration error - skipping retries');
                    break;
                } else if (error.name === 'NotAllowedError') {
                    // User hasn't interacted with page yet
                    logger.warn('[Audio] Audio not allowed yet - user interaction may be needed');
                    break;
                } else if (error.name === 'NotSupportedError') {
                    // Audio format not supported
                    logger.error('[Audio] Audio format not supported');
                    break;
                }

                // For other errors, retry after a delay if we haven't hit max retries
                if (attempts < maxRetries) {
                    logger.debug(`[Audio] Retrying in ${attempts * 1000}ms...`);
                    await new Promise(resolve => setTimeout(resolve, attempts * 1000));
                }
            }
        }

        // If we get here, all retries failed or we broke early
        if (attempts > 0) {
            logger.warn(`[Audio] Failed to play audio after ${attempts} attempt(s)`);
        }

        // Always return, even if audio failed
        return;
    }

    async handleArrival(sceneElement, arrival) {
        if (!arrival) {
            return;
        }

        try {
            // Start audio asynchronously without awaiting
            if (arrival.audio) {
                this.handleAudio(arrival.audio, "arrival").catch(error => {
                    logger.error("[Arrive] Error during audio handling:", error);
                });
            }
            // Start animation first if present
            if (arrival.animation) {
                await this.handleAnimation(sceneElement, arrival.animation);
            }

            // Handle transition
            if (arrival.transition) {
                await this.handleTransition(sceneElement, { ...arrival, type: "in" });
            } else {
                // If no transition specified, just show the element
                sceneElement.show().css('opacity', 1);
            }
            

        } catch (error) {
            logger.error("[Arrive] Error during arrival:", error);
        }
    }

    async handleAnimation(element, animation) {
        logger.info("[Animation] Starting animation handler");

        if (!animation.frames || !animation.frames.length) {
            logger.error("[Animation] Animation frames are missing or empty");
            return;
        }

        logger.info(`[Animation] Starting animation with frames: ${animation.frames.length}`);
        logger.info(`[Animation] Frame length (ms): ${animation.frame_length_ms}`);

        let currentFrame = 0;
        const totalFrames = animation.frames.length;
        const frameLength = this.getAdjustedDuration(animation.frame_length_ms);

        // Wait for any ongoing transition to complete
        await new Promise(resolve => {
            if (element.css('transition') && element.css('opacity') !== '1') {
                element.on('transitionend', resolve, { once: true });
            } else {
                resolve();
            }
        });

        const animate = async (frameIndex) => {
            try {
                if (!element.is(':visible')) {
                    logger.info("[Animation] Stopped - element not visible");
                    return;
                }
                
                // Clear and update the element content
                element.empty();
                const frameContent = $('<div>').text(animation.frames[frameIndex]);
                element.append(frameContent);

                // Calculate next frame
                const nextFrame = (frameIndex + 1) % totalFrames;

                // Schedule next frame
                await new Promise(resolve => setTimeout(resolve, frameLength));
                animate(nextFrame);
            } catch (error) {
                logger.error("[Animation] Error: " + error.toString());
            }
        };

        logger.info("[Animation] Starting animation loop");
        animate(currentFrame);
    }

    async handleDeparture(sceneElement, departure) {
        if (!departure) return;

        logger.info(`[Depart] Starting departure with wait_for_audio=${departure.wait_for_audio}`);

        // Create a promise that resolves when all departure actions are complete
        const departureComplete = new Promise(async (resolve) => {
            // Start both audio and visual transitions simultaneously
            const audioPromise = departure.audio ? 
                this.handleAudio(departure.audio) : 
                Promise.resolve();

            const visualPromise = departure.transition ? 
                this.handleTransition(sceneElement, {
                    ...departure,
                    type: "out"
                }) : 
                Promise.resolve();

            // If wait_for_audio is true, wait for both to complete
            if (departure.wait_for_audio === true) {
                logger.info(`[Depart] Waiting for both audio and visual transitions to complete`);
                await Promise.all([audioPromise, visualPromise]);
            } else {
                // Otherwise, just wait for visual transition
                logger.info(`[Depart] Only waiting for visual transition to complete`);
                await visualPromise;
            }

            // Only wait if explicitly set to true (default is false now)
            if (departure.wait === true) {
                logger.info(`[Depart] Waiting for additional duration: ${departure.duration || 1000}ms`);
                await this.sleep(departure.duration || 1000);
            }

            logger.info(`[Depart] All departure actions complete`);
            resolve();
        });

        // Wait for departure to complete
        await departureComplete;
        logger.info(`[Depart] Departure complete`);
    }

    async handleTransition(sceneElement, config) {
        if (!sceneElement || !config) {
            logger.warn("[Transition] Called with invalid parameters:", { sceneElement, config });
            return;
        }

        logger.debug(`[Transition] Handling transition: ${config.transition}`);
        
        switch (config.transition) {
            case "fade":
                logger.debug(`[Transition] Fading over ${config.duration || 1000}ms`);
                return new Promise(resolve => {
                    const startTime = performance.now();
                    const duration = this.getAdjustedDuration(config.duration || 1000);
                    const startOpacity = config.type === "in" ? 0 : 1;
                    const endOpacity = config.type === "in" ? 1 : 0;

                    // Ensure element is visible and at start opacity
                    sceneElement.show().css('opacity', startOpacity);

                    // Set up the transition
                    sceneElement.css({
                        'transition': `opacity ${duration}ms linear`,
                        'opacity': startOpacity
                    });

                    // Force a reflow
                    sceneElement[0].offsetHeight;

                    // Start the transition
                    sceneElement.css('opacity', endOpacity);

                    // Set up the transitionend listener
                    const onTransitionEnd = () => {
                        sceneElement.off('transitionend', onTransitionEnd);
                        if (config.type === "out" && config.remove === true) {
                            sceneElement.remove();
                        }
                        const transitionDuration = performance.now() - startTime;
                        logger.info(`[Transition] ${config.type === "in" ? "Fade in" : "Fade out"} took ${transitionDuration.toFixed(2)}ms`);
                        resolve();
                    };

                    sceneElement.on('transitionend', onTransitionEnd);
                });
            case "show":
                logger.debug("[Transition] Showing immediately");
                sceneElement.show().css('opacity', 1);
                return Promise.resolve();
            case "hide":
                logger.debug("[Transition] Hiding immediately");
                if (config.type === "out" && config.remove === true) {
                    sceneElement.remove();
                } else {
                    sceneElement.hide();
                }
                return Promise.resolve();
            case "type":
                if (config.type !== "out") {
                    logger.debug(`[Transition] Typing with ${config.ms_per_char || 50}ms per character`);
                    // Get the text from the scene element
                    const text = sceneElement.text();
                    if (!text) {
                        logger.warn("[Transition] No text content to type");
                        return Promise.resolve();
                    }
                    return this.typeText(sceneElement, text, this.getAdjustedDuration(config.ms_per_char || 50), config.show_cursor);
                } else {
                    sceneElement.css('opacity', 0);
                    return Promise.resolve();
                }
            case "keep":
                logger.debug("[Transition] Keeping element as is");
                return Promise.resolve();
            default:
                logger.warn(`[Transition] Unknown transition: ${config.transition}`);
                if (config.type === "in") {
                    sceneElement.show().css('opacity', 1);
                } else {
                    sceneElement.css('opacity', 0);
                }
                return Promise.resolve();
        }
    }

    async fadeOutAndRemove(element, duration) {
        return new Promise(resolve => {
            element.fadeOut(duration, () => {
                element.remove();
                resolve();
            });
        });
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, this.getAdjustedDuration(ms)));
    }

    async playScenes(scenes, startIndex = 0) {
        if (!scenes || scenes.length === 0) {
            logger.warn("[Scene] No scenes to play");
            return;
        }

        // Check for audio usage before starting
        this.audioHandler.checkAudioUsage(scenes);

        this.scenes = scenes;
        this.currentSceneIndex = startIndex;
        this.isPlaying = true;

        while (this.isPlaying) {
            // If we've reached the end of the scenes
            if (this.currentSceneIndex >= scenes.length) {
                if (this.shouldLoop && !this.isRestarting) {
                    logger.info("[Scene] Reached end of scenes, restarting");
                    this.currentSceneIndex = 0; // Reset to start
                    continue; // Continue the loop with the first scene
                } else {
                    logger.info("[Scene] Finished playing all scenes");
                    break; // Exit the loop if we shouldn't loop
                }
            }

            const scene = scenes[this.currentSceneIndex];
            const sceneComplete = new Promise(resolve => {
                this.onSceneCompleteCallbacks.set(this.currentSceneIndex, resolve);
            });

            try {
                // Process the scene
                await this.processScene(scene);
                
                // Wait for the scene to be marked as complete
                await sceneComplete;
                
                // Add a small delay between scenes
                await this.sleep(50);
                
                // Move to the next scene
                this.currentSceneIndex++;
            } catch (error) {
                logger.error(`[Scene] Error processing scene ${this.currentSceneIndex}:`, error);
                this.currentSceneIndex++;
            }
        }
    }

    restartScenes() {
        if (this.isRestarting) {
            logger.warn("[Scene] Already restarting scenes, ignoring duplicate restart");
            return;
        }

        try {
            this.isRestarting = true;
            logger.info("[Scene] Restarting scenes");
            const currentIndex = this.currentSceneIndex; // Store current index
            this.stop(); // Stop current playback and clear audio
            this.screen.empty(); // Clear the screen
            if (this.scenes) {
                // If audio is allowed, play scenes from current index
                if (this.audioHandler.isAudioAllowed) {
                    // Clear any pending audio operations
                    this.audioHandler.stopAllTracks();
                    this.playScenes(this.scenes, currentIndex);
                } else {
                    // If audio is not allowed, queue the first scene's audio
                    const firstScene = this.scenes[0];
                    if (firstScene && firstScene.arrive && firstScene.arrive.audio) {
                        this.audioHandler.handleAudio(firstScene.arrive.audio);
                    }
                    this.playScenes(this.scenes, currentIndex);
                }
            }
        } finally {
            this.isRestarting = false;
        }
    }

    stop() {
        logger.info("[Scene] Stopping scene playback");
        this.isPlaying = false;
        this.audioHandler.stopAllTracks();
    }

    async typeText(element, text, msPerChar, showCursor = false) {
        if (!element || !text) {
            logger.warn("typeText called with invalid parameters:", { element, text });
            return;
        }

        const startTime = Date.now();
        logger.debug(`Starting to type text: "${text}" with ${msPerChar}ms per character`);
        element.show();
        
        // Convert text to string and split into characters
        const characters = String(text).split('');
        
        // Create cursor element if cursor option is enabled
        let cursor;
        if (showCursor) {
            cursor = $('<span>').addClass('typing-cursor').text('|');
            element.append(cursor);
        }
        
        // Clear any existing content
        element.empty();
        
        for (const character of characters) {
            // Remove cursor before adding character if it exists
            if (cursor) {
                cursor.remove();
            }
            element.append(character);
            // Add cursor back after character if it exists
            if (cursor) {
                element.append(cursor);
            }
            
            logger.debug(`Typed character: ${character}`);
            await this.sleep(msPerChar);
        }
        
        // Remove cursor when done typing if it exists
        if (cursor) {
            cursor.remove();
        }
        
        const endTime = Date.now();
        logger.debug(`Finished typing text in ${endTime - startTime}ms`);
    }

    async playScene(scene) {
        try {
            // Create the scene element first
            const sceneElement = this.createSceneElement(scene);

            // Handle arrival
            if (scene.arrive) {
                await this.handleArrival(sceneElement, scene.arrive);
            }

            // Handle dwell
            if (scene.dwell) {
                await this.sleep(scene.dwell);
            }

            // Handle departure
            if (scene.depart) {
                await this.handleDeparture(sceneElement, scene.depart);
            }

            // Handle directives
            if (scene.directive) {
                await this.handleDirective(scene);
            }
        } catch (error) {
            logger.error(`Error in playScene: ${error.message}`);
            throw error;
        }
    }
}

// Export the SceneHandler class in a way that works in both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SceneHandler;
} 