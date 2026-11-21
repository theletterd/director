// Web Audio playback for Director. Tracks are named by trackId and looked up
// in window.audioLibrary (see audio_library.js). All durations are in ms.

class AudioHandler {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.tracks = new Map();   // trackId -> { source, gain, panner }
        this.buffers = new Map();  // url -> Promise<AudioBuffer|null>
        this.isAudioAllowed = false;
        this.onAudioEnabled = null;

        const Context = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
        if (!Context) {
            logger.warn('[Audio] Web Audio is not supported; audio disabled');
            return;
        }
        this.audioContext = new Context();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        // Some browsers allow audio without a click (e.g. after prior interaction)
        this.isAudioAllowed = this.audioContext.state === 'running';
    }

    setAudioEnabledCallback(callback) {
        this.onAudioEnabled = callback;
    }

    // Show the "enable audio" button if any scene uses audio and we can't play yet.
    checkAudioUsage(scenes) {
        const usesAudio = (scenes || []).some(scene => scene.arrive?.audio || scene.depart?.audio);
        if (usesAudio && this.audioContext && !this.isAudioAllowed) {
            this.showEnableButton();
        }
    }

    showEnableButton() {
        if (document.querySelector('button[data-audio-enable]')) return;

        const button = document.createElement('button');
        button.setAttribute('data-audio-enable', 'true');
        button.className = 'audio-enable';
        button.textContent = 'Click to Enable Audio';
        button.addEventListener('click', async () => {
            try {
                await this.audioContext.resume();
            } catch (error) {
                logger.error('[Audio] Could not resume audio context:', error);
                return;
            }
            this.isAudioAllowed = true;
            button.remove();
            if (this.onAudioEnabled) this.onAudioEnabled();
        });
        document.body.appendChild(button);
    }

    // Fetch and decode a library track. Buffers are cached by URL.
    loadTrack(trackId) {
        const entry = typeof window !== 'undefined' && window.audioLibrary && window.audioLibrary[trackId];
        if (!entry) {
            logger.warn(`[Audio] No track "${trackId}" in the audio library`);
            return Promise.resolve(null);
        }
        if (!this.buffers.has(entry.url)) {
            const loading = fetch(entry.url)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    return response.arrayBuffer();
                })
                .then(data => this.audioContext.decodeAudioData(data))
                .catch(error => {
                    logger.error(`[Audio] Failed to load ${entry.url}:`, error);
                    this.buffers.delete(entry.url); // allow a retry later
                    return null;
                });
            this.buffers.set(entry.url, loading);
        }
        return this.buffers.get(entry.url);
    }

    // Load and start a track. `isCancelled` is checked after loading so a
    // cue from a stopped scene doesn't start late.
    async play(trackId, options = {}, isCancelled = () => false) {
        if (!this.audioContext || !this.isAudioAllowed) return;
        const buffer = await this.loadTrack(trackId);
        if (!buffer || isCancelled() || !this.isAudioAllowed) return;
        this.startTrack(trackId, buffer, options);
    }

    // options: volume (0-1+, default 1), loop, fadeIn (ms), pan (-1 left .. 1 right), offset (ms)
    startTrack(trackId, buffer, { volume = 1, loop = false, fadeIn = 0, pan = 0, offset = 0 } = {}) {
        this.stopTrack(trackId);

        const ctx = this.audioContext;
        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        const panner = ctx.createStereoPanner();
        source.buffer = buffer;
        source.loop = loop;
        source.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);

        panner.pan.value = Math.max(-1, Math.min(1, pan));
        if (fadeIn > 0) {
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + fadeIn / 1000);
        } else {
            gain.gain.value = volume;
        }

        const track = { source, gain, panner };
        source.onended = () => {
            // Only forget the track if it hasn't been replaced since
            if (this.tracks.get(trackId) === track) this.tracks.delete(trackId);
        };
        source.start(0, (offset / 1000) % buffer.duration);
        this.tracks.set(trackId, track);
    }

    // Fade a track to silence over `ms`, then stop it. Resolves when done.
    async fadeOutTrack(trackId, ms) {
        const track = this.tracks.get(trackId);
        if (!track) return;

        const param = track.gain.gain;
        const now = this.audioContext.currentTime;
        param.cancelScheduledValues(now);
        param.setValueAtTime(Math.max(param.value, 0.0001), now);
        // Exponential sounds natural but can't reach 0, so aim just above it
        param.exponentialRampToValueAtTime(0.0001, now + ms / 1000);

        await new Promise(resolve => setTimeout(resolve, ms));
        if (this.tracks.get(trackId) === track) this.stopTrack(trackId);
    }

    fadeOutAllTracks(ms) {
        return Promise.all(this.getAllTrackIds().map(id => this.fadeOutTrack(id, ms)));
    }

    stopTrack(trackId) {
        const track = this.tracks.get(trackId);
        if (!track) return;
        this.tracks.delete(trackId);
        track.source.onended = null;
        try {
            track.source.stop();
        } catch (error) {
            // Already stopped
        }
        track.gain.disconnect();
    }

    stopAllTracks() {
        this.getAllTrackIds().forEach(id => this.stopTrack(id));
    }

    getAllTrackIds() {
        return Array.from(this.tracks.keys());
    }

    setTrackVolume(trackId, volume) {
        const track = this.tracks.get(trackId);
        if (track) track.gain.gain.value = volume;
    }

    setTrackPan(trackId, pan) {
        const track = this.tracks.get(trackId);
        if (track) track.panner.pan.value = Math.max(-1, Math.min(1, pan));
    }

    setMasterVolume(volume) {
        if (this.masterGain) this.masterGain.gain.value = volume;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioHandler;
}
