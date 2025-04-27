class AudioHandler {
    constructor() {
        if (typeof logger !== 'undefined') {
            logger.info("[Audio] Initializing AudioHandler");
        }
        this.audioContext = null;
        this.gainNode = null;
        this.tracks = new Map();
        this.pendingTracks = new Map(); // Store tracks waiting for user interaction
        this.isAudioAllowed = false;
        this.onAudioEnabled = null; // Callback for when audio is enabled

        try {
            this.initializeAudioContext();
            this.setupUserInteraction();
        } catch (error) {
            if (typeof logger !== 'undefined') {
                logger.error("[Audio] Error during initialization:", error);
            }
        }
    }

    initializeAudioContext() {
        try {
            logger.info("[Audio] Creating AudioContext");
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            logger.info("[Audio] AudioContext created successfully");
            
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            logger.info("[Audio] Gain node created and connected");
        } catch (error) {
            logger.error("[Audio] Error creating AudioContext:", error);
            throw error;
        }
    }

    setupUserInteraction() {
        logger.info("[Audio] Setting up user interaction handler");
        const button = document.createElement('button');
        button.textContent = 'Click to Enable Audio';
        button.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            z-index: 1000;
        `;
        document.body.appendChild(button);

        button.addEventListener('click', async () => {
            try {
                logger.info("[Audio] User clicked to enable audio");
                if (this.audioContext.state === 'suspended') {
                    logger.info("[Audio] Resuming AudioContext");
                    await this.audioContext.resume();
                }
                this.isAudioAllowed = true;
                button.style.display = 'none';
                logger.info("[Audio] Audio enabled by user interaction");
                
                // Clear any existing tracks
                this.stopAllTracks();
                this.pendingTracks.clear();
                
                // Notify that audio is enabled
                if (this.onAudioEnabled) {
                    logger.info("[Audio] Calling audio enabled callback");
                    this.onAudioEnabled();
                }
            } catch (error) {
                logger.error("[Audio] Error enabling audio:", error);
            }
        });
    }

    setAudioEnabledCallback(callback) {
        this.onAudioEnabled = callback;
    }

    async loadAudio(url) {
        try {
            logger.info(`[Audio] Loading audio from ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            logger.info(`[Audio] Audio downloaded, decoding...`);
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            logger.info(`[Audio] Audio decoded successfully`);
            return audioBuffer;
        } catch (error) {
            logger.error(`[Audio] Error loading audio from ${url}:`, error);
            return null;
        }
    }

    async playTrack(trackId, audioBuffer, options = {}) {
        if (!audioBuffer) {
            logger.warn(`[Audio] Cannot play track ${trackId}: no audio buffer`);
            return;
        }

        // Check audio context state
        if (this.audioContext.state === 'suspended') {
            logger.info(`[Audio] AudioContext is suspended, attempting to resume`);
            try {
                await this.audioContext.resume();
                logger.info(`[Audio] AudioContext resumed successfully`);
            } catch (error) {
                logger.error(`[Audio] Error resuming AudioContext:`, error);
                return;
            }
        }

        // If audio isn't allowed yet, store the track for later
        if (!this.isAudioAllowed) {
            logger.debug(`[Audio] Queueing track ${trackId} for later playback`);
            this.pendingTracks.set(trackId, { audioBuffer, options });
            return;
        }

        try {
            // Stop existing track if it exists
            if (this.tracks.has(trackId)) {
                logger.debug(`[Audio] Stopping existing track ${trackId}`);
                this.stopTrack(trackId);
            }

            logger.info(`[Audio] Creating audio nodes for track ${trackId}`);
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const pannerNode = this.audioContext.createStereoPanner();
            
            source.buffer = audioBuffer;
            source.loop = options.loop || false;
            
            // Connect nodes
            logger.debug(`[Audio] Connecting audio nodes for track ${trackId}`);
            source.connect(gainNode);
            gainNode.connect(pannerNode);
            pannerNode.connect(this.gainNode);

            // Set initial volume
            const volume = options.volume !== undefined ? options.volume : 1;
            logger.debug(`[Audio] Setting initial volume for track ${trackId} to ${volume}`);
            gainNode.gain.value = volume;

            // Set pan if specified (-1 = full left, 0 = center, 1 = full right)
            if (options.pan !== undefined) {
                const pan = Math.max(-1, Math.min(1, options.pan)); // Clamp between -1 and 1
                logger.debug(`[Audio] Setting pan for track ${trackId} to ${pan}`);
                pannerNode.pan.value = pan;
            }

            // Handle fade in
            if (options.fadeIn) {
                logger.debug(`[Audio] Setting up fade in for track ${trackId} over ${options.fadeIn}ms`);
                gainNode.gain.value = 0;
                gainNode.gain.linearRampToValueAtTime(
                    volume,
                    this.audioContext.currentTime + (options.fadeIn / 1000)
                );
            }

            // Start playback from offset if specified
            const offset = options.offset || 0; // offset in seconds
            logger.debug(`[Audio] Starting playback of track ${trackId} from offset ${offset}s`);
            source.start(0, offset);
            
            // Store track info
            this.tracks.set(trackId, {
                source,
                gainNode,
                pannerNode,
                buffer: audioBuffer,
                options
            });

            // Set up fade out if specified
            if (options.fadeOut) {
                const fadeOutTime = (audioBuffer.duration * 1000) - options.fadeOut;
                logger.debug(`[Audio] Setting up fade out for track ${trackId} over ${options.fadeOut}ms at ${fadeOutTime}ms`);
                setTimeout(() => {
                    this.fadeOutTrack(trackId, options.fadeOut);
                }, fadeOutTime);
            }

            // Create a promise that resolves when the track ends
            return new Promise((resolve, reject) => {
                try {
                    // Calculate expected duration
                    const expectedDuration = options.loop ? Infinity : (audioBuffer.duration - offset) * 1000;
                    const timeoutDuration = options.loop ? 60000 : expectedDuration + 1000; // 1 minute for loops, duration + 1s for one-shots

                    // Set up timeout
                    const timeout = setTimeout(() => {
                        if (this.tracks.has(trackId)) {
                            if (options.loop) {
                                logger.debug(`[Audio] Loop track ${trackId} reached maximum play time`);
                            } else {
                                logger.warn(`[Audio] Track ${trackId} timeout - forcing stop`);
                            }
                            this.stopTrack(trackId);
                            resolve();
                        }
                    }, timeoutDuration);

                    // Set up ended handler
                    source.onended = () => {
                        clearTimeout(timeout);
                        logger.debug(`[Audio] Track ${trackId} ended naturally`);
                        if (!options.loop) {
                            this.tracks.delete(trackId);
                        }
                        resolve();
                    };
                } catch (error) {
                    logger.error(`[Audio] Error setting up track ${trackId} end handler:`, error);
                    reject(error);
                }
            });
        } catch (error) {
            logger.error(`[Audio] Error playing track ${trackId}:`, error);
            throw error;
        }
    }

    async playPendingTracks() {
        logger.info(`[Audio] Playing ${this.pendingTracks.size} pending tracks`);
        const tracks = Array.from(this.pendingTracks.entries());
        this.pendingTracks.clear(); // Clear before playing to avoid race conditions
        
        for (const [trackId, { audioBuffer, options }] of tracks) {
            try {
                logger.info(`[Audio] Playing pending track ${trackId}`);
                await this.playTrack(trackId, audioBuffer, options);
            } catch (error) {
                logger.error(`[Audio] Error playing pending track ${trackId}:`, error);
            }
        }
    }

    async fadeOutTrack(trackId, duration = 1000) {
        const track = this.tracks.get(trackId);
        if (!track) {
            logger.warn(`[Audio] Cannot fade out track ${trackId}: track not found`);
            return;
        }

        logger.info(`[Audio] Starting fade out for track ${trackId} over ${duration}ms`);
        const { gainNode } = track;
        
        // Set up fade out
        gainNode.gain.linearRampToValueAtTime(
            gainNode.gain.value,
            this.audioContext.currentTime
        );
        gainNode.gain.linearRampToValueAtTime(
            0,
            this.audioContext.currentTime + (duration / 1000)
        );

        // Return a promise that resolves when the fade out completes
        return new Promise(resolve => {
            logger.info(`[Audio] Waiting for fade out to complete for track ${trackId}`);
            
            // Add a small buffer to ensure the fade is complete
            const buffer = 50; // 50ms buffer
            setTimeout(() => {
                logger.info(`[Audio] Fade out complete for track ${trackId}, stopping track`);
                this.stopTrack(trackId);
                resolve();
            }, duration + buffer);
        });
    }

    fadeInTrack(trackId, duration_ms, targetVolume = 1) {
        const track = this.tracks.get(trackId);
        if (!track) return;

        // Convert milliseconds to seconds for Web Audio API
        const duration_seconds = duration_ms / 1000;
        logger.debug(`[Audio] Fading in track ${trackId} over ${duration_seconds}s (${duration_ms}ms)`);

        track.gainNode.gain.linearRampToValueAtTime(
            targetVolume,
            this.audioContext.currentTime + duration_seconds
        );
    }

    stopTrack(trackId) {
        const track = this.tracks.get(trackId);
        if (!track) {
            logger.debug(`[Audio] Track ${trackId} not found to stop`);
            return;
        }

        try {
            logger.info(`[Audio] Stopping track ${trackId} (duration: ${track.buffer.duration}s, loop: ${track.options.loop || false})`);
            
            // First set gain to 0 to cut off sound immediately
            track.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
            track.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            logger.debug(`[Audio] Set gain to 0 for track ${trackId}`);
            
            // Disconnect all nodes
            track.gainNode.disconnect();
            track.source.disconnect();
            logger.debug(`[Audio] Disconnected nodes for track ${trackId}`);
            
            // Stop the source immediately
            try {
                track.source.stop(0);  // Force stop at current time
                logger.debug(`[Audio] Stopped source for track ${trackId}`);
            } catch (error) {
                logger.warn(`[Audio] Error stopping source for track ${trackId}:`, error);
            }
            
            // Clear the buffer to free memory
            track.source.buffer = null;
            
            // Remove from tracks map
            this.tracks.delete(trackId);
            logger.debug(`[Audio] Removed track ${trackId} from tracks map`);
            
            // Force garbage collection by nulling references
            track.source = null;
            track.gainNode = null;
            track.buffer = null;
            
            logger.info(`[Audio] Successfully stopped track ${trackId}`);
        } catch (error) {
            logger.error(`[Audio] Error stopping track ${trackId}:`, error);
            // Even if there's an error, make sure the track is removed
            this.tracks.delete(trackId);
        }
    }

    stopAllTracks() {
        logger.info(`[Audio] Stopping all ${this.tracks.size} tracks`);
        // Create a copy of the track IDs to avoid modification during iteration
        const trackIds = Array.from(this.tracks.keys());
        
        // First disconnect all gain nodes to cut off sound immediately
        for (const trackId of trackIds) {
            const track = this.tracks.get(trackId);
            if (track) {
                try {
                    track.gainNode.disconnect();
                } catch (error) {
                    logger.warn(`[Audio] Error disconnecting gain node for track ${trackId}:`, error);
                }
            }
        }
        
        // Then stop all sources
        for (const trackId of trackIds) {
            const track = this.tracks.get(trackId);
            if (track) {
                try {
                    track.source.stop();
                } catch (error) {
                    logger.warn(`[Audio] Error stopping source for track ${trackId}:`, error);
                }
            }
        }
        
        // Finally clear the tracks map and create new source nodes
        for (const trackId of trackIds) {
            const track = this.tracks.get(trackId);
            if (track) {
                try {
                    const newSource = this.audioContext.createBufferSource();
                    newSource.buffer = track.buffer;
                } catch (error) {
                    logger.warn(`[Audio] Error creating new source for track ${trackId}:`, error);
                }
            }
        }
        
        // Clear the tracks map
        this.tracks.clear();
        logger.info(`[Audio] Successfully stopped all tracks`);
    }

    setTrackVolume(trackId, volume) {
        const track = this.tracks.get(trackId);
        if (!track) return;

        track.gainNode.gain.value = volume;
    }

    setMasterVolume(volume) {
        if (this.gainNode) {
            this.gainNode.gain.value = volume;
        }
    }

    getTrackInfo(trackId) {
        const track = this.tracks.get(trackId);
        if (!track) return null;

        return {
            isPlaying: track.source.playbackState === track.source.PLAYING_STATE,
            volume: track.gainNode.gain.value,
            duration: track.buffer.duration,
            currentTime: track.source.context.currentTime,
            isLooping: track.source.loop
        };
    }

    getAllTrackIds() {
        return Array.from(this.tracks.keys());
    }

    async handleAudio(audioConfig) {
        if (!audioConfig) {
            logger.warn("[Audio] No audio config provided");
            return;
        }

        try {
            logger.info(`[Audio] Handling audio config:`, audioConfig);
            const { trackId, volume, loop, fadeIn, fadeOut } = audioConfig;

            // If it's just a fade out, handle it directly
            if (trackId && fadeOut) {
                logger.info(`[Audio] Handling fade out for track ${trackId} over ${fadeOut}ms`);
                await this.fadeOutTrack(trackId, fadeOut);
                logger.info(`[Audio] Fade out handled for track ${trackId}`);
                return;
            }

            // Look up URL from audio library
            if (!trackId || !window.audioLibrary || !window.audioLibrary[trackId]) {
                logger.warn(`[Audio] No audio track found for trackId: ${trackId}`);
                return;
            }

            const url = window.audioLibrary[trackId].url;
            logger.info(`[Audio] Loading audio from ${url}`);
            const audioBuffer = await this.loadAudio(url);
            if (!audioBuffer) {
                logger.error("[Audio] Failed to load audio buffer");
                return;
            }

            logger.info(`[Audio] Playing track ${trackId} with options:`, { volume, loop, fadeIn, fadeOut });
            await this.playTrack(trackId, audioBuffer, {
                volume,
                loop,
                fadeIn,
                fadeOut
            });
            logger.info(`[Audio] Track ${trackId} playback started`);
        } catch (error) {
            logger.error("[Audio] Error handling audio:", error);
            throw error;
        }
    }

    // Add method to change pan during playback
    setTrackPan(trackId, pan) {
        const track = this.tracks.get(trackId);
        if (!track) {
            logger.warn(`[Audio] Cannot set pan for track ${trackId}: track not found`);
            return;
        }

        const clampedPan = Math.max(-1, Math.min(1, pan)); // Clamp between -1 and 1
        logger.debug(`[Audio] Setting pan for track ${trackId} to ${clampedPan}`);
        track.pannerNode.pan.value = clampedPan;
    }
}

// Export the AudioHandler class in a way that works in both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioHandler;
} 