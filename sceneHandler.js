class SceneHandler {
    constructor(screen, audioHandler) {
        this.screen = screen;
        this.audioHandler = audioHandler;
        this.audioCache = new Map();
        this.currentSceneIndex = 0;
        this.scenes = null;
        this.isPlaying = false;
        this.shouldLoop = true;
        this.sceneCompleteCallbacks = new Map();
        this.isPaused = false;
        this.performanceMode = false;

        // Set up logging
        this.logger = typeof logger !== 'undefined' ? logger : console;

        if (typeof logger !== 'undefined' && !this.performanceMode) {
            logger.info("SceneHandler initialized with screen:", screen);
        }

        // Set up audio enabled callback
        this.audioHandler.setAudioEnabledCallback(() => {
            if (typeof logger !== 'undefined' && !this.performanceMode) {
                logger.info("[Scene] Audio enabled, restarting scenes");
            }
            this.restartScenes();
        });
    }

    setPerformanceMode(enabled) {
        this.performanceMode = enabled;
    }

    log(message) {
        if (!this.performanceMode) {
            this.logger.info(message);
        }
    }

    error(message) {
        this.logger.error(message);
    }

    onSceneComplete(sceneIndex, callback) {
        this.sceneCompleteCallbacks.set(sceneIndex, callback);
    }

    async processScene(scene) {
        const sceneStartTime = performance.now();
        let phaseStartTime;

        try {
            if (!scene) {
                logger.error("[Scene] Scene is null or undefined");
                return;
            }

            if (!this.performanceMode) {
                logger.debug(`[Scene ${this.currentSceneIndex}] Processing scene:`, JSON.stringify(scene, null, 2));
            }

            // Handle directive if present
            if (scene.directive) {
                phaseStartTime = performance.now();
                await this.handleDirective(scene);
                logger.info(`[Scene ${this.currentSceneIndex}] Directive took ${(performance.now() - phaseStartTime).toFixed(2)}ms`);
                return;
            }

            // Create and add the scene element
            phaseStartTime = performance.now();
            const sceneElement = this.createSceneElement(scene);
            logger.info(`[Scene ${this.currentSceneIndex}] Element creation took ${(performance.now() - phaseStartTime).toFixed(2)}ms`);

            // Handle arrival phase
            if (scene.arrive) {
                phaseStartTime = performance.now();
                await this.handleArrival(sceneElement, scene.arrive);
                logger.info(`[Scene ${this.currentSceneIndex}] Arrival took ${(performance.now() - phaseStartTime).toFixed(2)}ms`);
            }

            // Handle animation if present
            if (scene.animation) {
                phaseStartTime = performance.now();
                if (!this.performanceMode) {
                    logger.debug("[Scene] Found animation config:", scene.animation);
                }
                await this.handleAnimation(sceneElement, scene.animation);
                logger.info(`[Scene ${this.currentSceneIndex}] Animation took ${(performance.now() - phaseStartTime).toFixed(2)}ms`);
            }

            // Wait for dwell time
            if (scene.dwell) {
                phaseStartTime = performance.now();
                await this.sleep(scene.dwell);
                logger.info(`[Scene ${this.currentSceneIndex}] Dwell took ${(performance.now() - phaseStartTime).toFixed(2)}ms`);
            }

            // Handle departure phase
            if (scene.depart) {
                phaseStartTime = performance.now();
                await this.handleDeparture(sceneElement, scene.depart);
                logger.info(`[Scene ${this.currentSceneIndex}] Departure took ${(performance.now() - phaseStartTime).toFixed(2)}ms`);
            }

            const totalDuration = performance.now() - sceneStartTime;
            logger.info(`[Scene ${this.currentSceneIndex}] Total scene duration: ${totalDuration.toFixed(2)}ms`);

            // Notify that this scene is complete
            const callback = this.sceneCompleteCallbacks.get(this.currentSceneIndex);
            if (callback) {
                callback();
                this.sceneCompleteCallbacks.delete(this.currentSceneIndex);
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
                            // Start the fade
                            this.audioHandler.fadeOutTrack(scene.trackId, scene.duration || 2000);
                            // Only wait if wait_for_fade is true
                            if (scene.wait_for_fade) {
                                logger.debug(`Waiting for ${scene.duration || 2000}ms for fade to complete`);
                                await this.sleep(scene.duration || 2000);
                                // After fade is complete, ensure the track is stopped
                                this.audioHandler.stopTrack(scene.trackId);
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
        const callback = this.sceneCompleteCallbacks.get(this.currentSceneIndex);
        if (callback) {
            directiveComplete.then(() => {
                callback();
                this.sceneCompleteCallbacks.delete(this.currentSceneIndex);
            });
        }

        return true;
    }

    async fadeAllElements() {
        logger.debug("Fading all elements");
        this.screen.find('div').fadeOut(2000, () => {
            this.screen.find('div:hidden').remove();
        });
        await this.sleep(2000);
    }

    createSceneElement(scene) {
        if (!scene) {
            logger.error("[Scene] Cannot create element for null scene");
            return null;
        }

        logger.debug("[Scene] Creating element with text:", scene);
        const element = $("<div>").addClass("scene");

        // Set text content
        const text = typeof scene === 'object' ? scene.text : scene;
        if (text !== undefined) {
            element.text(text);
        }

        // Add default styling
        element.css({
            'white-space': 'pre',
            'font-family': 'monospace',
            'line-height': '1.2',
            'display': 'block'
        });

        element.appendTo(this.screen);
        logger.debug("[Scene] Element created and added to screen");

        return element;
    }

    async handleAudio(audio, phase) {
        if (!audio || !this.audioHandler) return;

        const maxRetries = 2;
        let attempts = 0;
        let lastError = null;

        while (attempts <= maxRetries) {
            try {
                // Start audio but don't wait for it to complete
                this.audioHandler.handleAudio(audio).catch(error => {
                    this.logger.error(`[Audio] Error in background audio: ${error.message}`);
                });
                return;
            } catch (error) {
                attempts++;
                lastError = error;
                
                // Log with attempt count
                this.logger.error(`[Audio] Error handling audio (attempt ${attempts}/${maxRetries + 1}):`, error);

                // Different handling based on error type
                if (error instanceof TypeError || error.name === 'TypeError') {
                    // Configuration/setup errors - don't retry
                    this.logger.error('[Audio] Audio configuration error - skipping retries');
                    break;
                } else if (error.name === 'NotAllowedError') {
                    // User hasn't interacted with page yet
                    this.logger.warn('[Audio] Audio not allowed yet - user interaction may be needed');
                    break;
                } else if (error.name === 'NotSupportedError') {
                    // Audio format not supported
                    this.logger.error('[Audio] Audio format not supported');
                    break;
                }

                // For other errors, retry after a delay if we haven't hit max retries
                if (attempts <= maxRetries) {
                    this.logger.info(`[Audio] Retrying in ${attempts * 1000}ms...`);
                    await new Promise(resolve => setTimeout(resolve, attempts * 1000));
                }
            }
        }

        // If we get here, all retries failed or we broke early
        if (attempts > 0) {
            this.logger.warn(`[Audio] Failed to play audio after ${attempts} attempt(s)`);
        }

        // Always return, even if audio failed
        return;
    }

    async handleArrival(sceneElement, arrival) {
        if (!arrival) {
            return;
        }

        try {
            // Handle audio first and wait for it to complete if specified
            if (arrival.audio) {
                await this.handleAudio(arrival.audio, "arrival");
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
        this.log("[Animation] Starting animation handler");

        if (!animation.frames || !animation.frames.length) {
            this.error("[Animation] Animation frames are missing or empty");
            return;
        }

        this.log(`[Animation] Starting animation with frames: ${animation.frames.length}`);
        this.log(`[Animation] Frame length (ms): ${animation.frame_length_ms}`);

        let isAnimating = true;
        let currentFrame = 0;
        const totalFrames = animation.frames.length;

        const animate = async (frameIndex) => {
            try {
                if (!isAnimating || !element.is(':visible')) {
                    this.log("[Animation] Stopped - element not visible or animation cancelled");
                    return;
                }
                
                // Clear and update the element content
                element.empty();
                const frameContent = $('<div>').text(animation.frames[frameIndex]);
                element.append(frameContent);

                // Calculate next frame
                const nextFrame = (frameIndex + 1) % totalFrames;

                // Schedule next frame
                await new Promise(resolve => setTimeout(resolve, animation.frame_length_ms));
                animate(nextFrame);
            } catch (error) {
                this.error("[Animation] Error: " + error.toString());
                isAnimating = false;
            }
        };

        this.log("[Animation] Starting animation loop");
        animate(currentFrame);
    }

    async handleDeparture(sceneElement, departure) {
        if (!departure) return;

        // Create a promise that resolves when all departure actions are complete
        const departureComplete = new Promise(async (resolve) => {
            // Handle audio first if specified
            if (departure.audio) {
                // For looping audio, we don't wait for it to complete
                if (departure.audio.loop) {
                    this.handleAudio(departure.audio, "departure").catch(error => {
                        this.logger.error("[Depart] Error handling looping audio:", error);
                    });
                } else {
                    await this.handleAudio(departure.audio, "departure");
                }
            }

            // Handle visual transition
            if (departure.transition) {
                await this.handleTransition(sceneElement, {
                    ...departure,
                    type: "out"
                });
            }

            // Only wait if explicitly set to true (default is false now)
            if (departure.wait === true) {
                await this.sleep(departure.duration || 1000);
            }

            resolve();
        });

        // Wait for departure to complete
        await departureComplete;
    }

    async handleRemoval(sceneElement, departure) {
        switch (departure.transition) {
            case "hide":
                sceneElement.remove();
                break;
            case "fade":
                await this.fadeOutAndRemove(sceneElement, departure.duration);
                break;
        }
    }

    async handleTransition(sceneElement, config) {
        if (!sceneElement || !config) {
            logger.warn("[Transition] Called with invalid parameters:", { sceneElement, config });
            return;
        }

        if (!this.performanceMode) {
            logger.debug(`[Transition] Handling transition: ${config.transition}`);
        }
        
        switch (config.transition) {
            case "fade":
                if (!this.performanceMode) {
                    logger.debug(`[Transition] Fading over ${config.duration || 1000}ms`);
                }
                return new Promise(resolve => {
                    const startTime = performance.now();
                    const duration = config.duration || 1000;
                    const startOpacity = config.type === "in" ? 0 : 1;
                    const endOpacity = config.type === "in" ? 1 : 0;

                    // Set up the transition
                    sceneElement.css({
                        'transition': `opacity ${duration}ms linear`,
                        'opacity': startOpacity
                    });

                    if (config.type === "in") {
                        sceneElement.show();
                    }

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
                if (!this.performanceMode) {
                    logger.debug("[Transition] Showing immediately");
                }
                sceneElement.show().css('opacity', 1);
                return Promise.resolve();
            case "hide":
                if (!this.performanceMode) {
                    logger.debug("[Transition] Hiding immediately");
                }
                sceneElement.css('opacity', 0);
                return Promise.resolve();
            case "type":
                if (config.type !== "out") {
                    if (!this.performanceMode) {
                        logger.debug(`[Transition] Typing with ${config.ms_per_char || 50}ms per character`);
                    }
                    const text = sceneElement.text();
                    sceneElement.empty();
                    return this.typeText(sceneElement, text, config.ms_per_char || 50);
                } else {
                    sceneElement.css('opacity', 0);
                    return Promise.resolve();
                }
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

    async fadeOutAndClear(element, duration) {
        return new Promise(resolve => {
            element.fadeOut(duration, () => {
                element.show().empty();
                resolve();
            });
        });
    }

    sleep(ms) {
        return new Promise(resolve => {
            if (ms <= 0) {
                resolve();
                return;
            }
            setTimeout(resolve, ms);
        });
    }

    async playScenes(scenes) {
        if (!scenes || !Array.isArray(scenes)) {
            logger.error("[Scene] playScenes called with invalid scenes:", scenes);
            return;
        }

        this.scenes = scenes;
        this.isPlaying = true;

        while (this.isPlaying && this.currentSceneIndex < scenes.length) {
            logger.info(`[Scene] Processing scene ${this.currentSceneIndex} of ${scenes.length}`);
            const scene = scenes[this.currentSceneIndex];
            
            // Create a promise that resolves when this scene is complete
            const sceneComplete = new Promise(resolve => {
                this.onSceneComplete(this.currentSceneIndex, resolve);
            });

            try {
                // Process the scene
                await this.processScene(scene);
                
                // Wait for the scene to be marked as complete
                await sceneComplete;
                
                // Add a small delay between scenes
                await this.sleep(50);
                
                // Only after the scene is complete and delay is done, move to the next one
                this.currentSceneIndex++;
            } catch (error) {
                logger.error(`[Scene] Error processing scene ${this.currentSceneIndex}:`, error);
                this.currentSceneIndex++;
            }
        }

        // If we've reached the end and should loop
        if (this.isPlaying && this.shouldLoop) {
            logger.info("[Scene] Reached end of scenes, restarting");
            this.restartScenes();
        } else {
            logger.info("[Scene] Finished playing all scenes");
        }
    }

    restartScenes() {
        logger.info("[Scene] Restarting scenes");
        this.stop(); // Stop current playback and clear audio
        this.screen.empty(); // Clear the screen
        this.currentSceneIndex = 0; // Reset scene index
        if (this.scenes) {
            // If audio is allowed, play scenes immediately
            if (this.audioHandler.isAudioAllowed) {
                this.playScenes(this.scenes);
            } else {
                // If audio is not allowed, queue the first scene's audio
                const firstScene = this.scenes[0];
                if (firstScene && firstScene.arrive && firstScene.arrive.audio) {
                    this.audioHandler.handleAudio(firstScene.arrive.audio);
                }
                this.playScenes(this.scenes);
            }
        }
    }

    stop() {
        logger.info("[Scene] Stopping scene playback");
        this.isPlaying = false;
        this.audioHandler.stopAllTracks();
    }

    async typeText(element, text, msPerChar) {
        if (!element || !text) {
            logger.warn("typeText called with invalid parameters:", { element, text });
            return;
        }

        const startTime = Date.now();
        if (!this.performanceMode) {
            logger.debug(`Starting to type text: "${text}" with ${msPerChar}ms per character`);
        }
        element.show();
        
        // Convert text to string and split into characters
        const characters = String(text).split('');
        
        for (const character of characters) {
            element.append(character);
            if (!this.performanceMode) {
                logger.debug(`Typed character: ${character}`);
            }
            await this.sleep(msPerChar);
        }
        
        if (!this.performanceMode) {
            const endTime = Date.now();
            logger.debug(`Finished typing text in ${endTime - startTime}ms`);
        }
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

            // Ensure all animations and transitions are complete before moving to next scene
            await this.waitForAnimations();
        } catch (error) {
            logger.error(`Error in playScene: ${error.message}`);
            throw error;
        }
    }

    async waitForAnimations() {
        // Wait for any ongoing animations to complete
        const animations = this.screen.find('.animating');
        if (animations.length > 0) {
            await new Promise(resolve => {
                animations.on('animationend', resolve, { once: true });
            });
        }
    }
}

// Export the SceneHandler class in a way that works in both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SceneHandler;
} 