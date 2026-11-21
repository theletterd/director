// Plays a list of scenes onto the screen: text, typewriter effects, frame
// animations, colour changes and audio cues. See README.md for the scene format.

const DEFAULTS = {
    fadeMs: 1000,          // fade transitions
    msPerChar: 50,         // typewriter speed
    frameMs: 100,          // animation frame length
    colorMs: 2000,         // colour directive
    fadeAllMs: 2000,       // fade_all directive
    audioFadeMs: 2000,     // fade_audio / fade_all_audio directives
    resetMs: 2000,         // fade-out between loops / on restart
    betweenScenesMs: 50,   // pause between consecutive scenes
};

class PlaybackCancelled extends Error {
    constructor() {
        super('Playback cancelled');
        this.name = 'PlaybackCancelled';
    }
}

// One token per playback run. Stopping or restarting cancels the token, and
// every wait checks it, so a superseded run unwinds instead of carrying on.
class PlaybackToken {
    constructor() {
        this.cancelled = false;
    }

    cancel() {
        this.cancelled = true;
    }

    check() {
        if (this.cancelled) throw new PlaybackCancelled();
    }
}

class SceneHandler {
    constructor(screen, audioHandler, { theatre = $('#theatre'), backdrop = $('#backdrop') } = {}) {
        this.screen = screen;
        this.theatre = theatre;
        this.backdrop = backdrop;
        this.audioHandler = audioHandler;

        this.scenes = [];
        this.startIndex = 0;
        this.currentSceneIndex = 0;
        this.speedMultiplier = 1;
        this.token = new PlaybackToken();
        this.animations = new Map(); // DOM element -> interval id

        // Scenes that ran before audio was enabled played silently, so replay.
        this.audioHandler.setAudioEnabledCallback(() => {
            logger.info('[Scene] Audio enabled, restarting');
            this.restart();
        });
    }

    get isPlaying() {
        return !this.token.cancelled && this.scenes.length > 0;
    }

    // ---- Timing -----------------------------------------------------------

    setSpeedMultiplier(multiplier) {
        if (multiplier > 0) {
            this.speedMultiplier = multiplier;
        } else {
            logger.warn(`[Scene] Invalid speed multiplier: ${multiplier}`);
        }
    }

    // Convert a story duration (ms at normal speed) to real ms.
    scale(ms) {
        return Math.max(1, Math.round(ms / this.speedMultiplier));
    }

    // Wait `ms` real milliseconds, then throw if the run was cancelled meanwhile.
    async delay(ms, token = this.token) {
        await new Promise(resolve => setTimeout(resolve, ms));
        token.check();
    }

    // Wait a story duration (scaled by the speed multiplier).
    sleep(ms, token = this.token) {
        return this.delay(this.scale(ms), token);
    }

    // ---- Playback control -------------------------------------------------

    // Play `scenes` from `startIndex`, looping forever until stopped.
    // Any run already in progress is cancelled first.
    async play(scenes, startIndex = 0, { reset = false } = {}) {
        this.stop();
        const token = this.token = new PlaybackToken();

        this.scenes = scenes || [];
        if (!this.scenes.length) {
            logger.warn('[Scene] No scenes to play');
            return;
        }
        this.currentSceneIndex = startIndex;
        this.audioHandler.checkAudioUsage(this.scenes);

        try {
            if (reset) await this.resetStage(token);

            for (;;) {
                if (this.currentSceneIndex >= this.scenes.length) {
                    logger.info('[Scene] Reached the end, looping');
                    await this.resetStage(token);
                    this.currentSceneIndex = 0;
                }
                await this.processScene(this.scenes[this.currentSceneIndex], token);
                await this.sleep(DEFAULTS.betweenScenesMs, token);
                this.currentSceneIndex++;
            }
        } catch (error) {
            if (!(error instanceof PlaybackCancelled)) throw error;
            logger.info('[Scene] Playback cancelled');
        }
    }

    // Remember where the story was launched from, so restarts go back there.
    start(scenes, startIndex = 0) {
        this.startIndex = startIndex;
        return this.play(scenes, startIndex);
    }

    restart() {
        return this.play(this.scenes, this.startIndex, { reset: true });
    }

    stop() {
        this.token.cancel();
        this.stopAnimations();
        this.audioHandler.stopAllTracks();
    }

    // Fade everything out and put the stage back to its stylesheet defaults.
    async resetStage(token = this.token) {
        const ms = this.scale(DEFAULTS.resetMs);
        const stage = [this.screen, this.theatre];

        this.audioHandler.fadeOutAllTracks(ms);
        stage.forEach(el => el.css({ transition: `opacity ${ms}ms linear`, opacity: 0 }));
        await this.delay(ms, token);

        this.stopAnimations();
        this.audioHandler.stopAllTracks();
        this.screen.empty();
        stage.forEach(el => el.css({
            background: '', // set by color target "both"
            'background-color': '',
            'background-image': '',
            color: '',
            opacity: '',
            transition: '',
        }));
    }

    // ---- Scenes -----------------------------------------------------------

    // Run one scene to completion. Errors are logged and swallowed so a bad
    // scene never stalls the story; only cancellation propagates.
    async processScene(scene, token = this.token) {
        if (!scene) {
            logger.error('[Scene] Scene is null or undefined');
            return;
        }
        token.check();
        const label = `[Scene ${this.currentSceneIndex}]`;
        const startedAt = performance.now();

        try {
            if (scene.directive) {
                await this.runDirective(scene, token);
            } else {
                const element = this.createSceneElement(scene);
                await this.arrive(element, scene.arrive, token);
                if (scene.dwell) await this.sleep(scene.dwell, token);
                await this.depart(element, scene.depart, token);
            }
            if (scene.directive && scene.dwell) await this.sleep(scene.dwell, token);
        } catch (error) {
            if (error instanceof PlaybackCancelled) throw error;
            logger.error(`${label} Error:`, error);
        }
        logger.debug(`${label} took ${(performance.now() - startedAt).toFixed(0)}ms`);
    }

    createSceneElement(scene) {
        const element = $('<div>').addClass('scene');
        const content = scene.content;

        if (content && typeof content === 'object' && content.frames) {
            this.startAnimation(element, content);
        } else if (content !== undefined && content !== null) {
            element.text(content);
        }
        return element.appendTo(this.screen);
    }

    async arrive(element, config, token) {
        if (!config) return;
        if (config.audio) this.playAudio(config.audio, token);

        switch (config.transition) {
            case 'fade':
                await this.fade(element, 1, config.duration, token, 0);
                break;
            case 'type':
                await this.typeText(element, element.text(), config.ms_per_char, config.show_cursor, token);
                break;
            case 'keep':
                break;
            case 'hide':
                element.hide();
                break;
            case undefined:
            case 'show':
                element.show();
                break;
            default:
                logger.warn(`[Scene] Unknown arrive transition: ${config.transition}`);
                element.show();
        }
    }

    async depart(element, config, token) {
        if (!config) return;
        const audio = config.audio ? this.playAudio(config.audio, token) : Promise.resolve();

        let visual;
        switch (config.transition) {
            case 'fade':
            case 'type': // there's no "untyping"; departing a typed scene fades it
                visual = this.fade(element, 0, config.duration, token).then(() => this.stopAnimation(element));
                break;
            case 'hide':
                this.stopAnimation(element);
                element.hide();
                visual = Promise.resolve();
                break;
            case 'show':
            case 'keep':
            case undefined:
                visual = Promise.resolve();
                break;
            default:
                logger.warn(`[Scene] Unknown depart transition: ${config.transition}`);
                visual = Promise.resolve();
        }

        await (config.wait_for_audio ? Promise.all([audio, visual]) : visual);
        if (config.remove) this.removeElement(element);
        if (config.wait) await this.sleep(config.duration ?? DEFAULTS.fadeMs, token);
    }

    // Fade opacity to `to`, optionally starting from `from`.
    async fade(element, to, duration = DEFAULTS.fadeMs, token = this.token, from = undefined) {
        const ms = this.scale(duration);
        element.show();
        if (from !== undefined) {
            element.css({ transition: 'none', opacity: from });
            void element[0].offsetHeight; // force a reflow so the start value applies
        }
        element.css({ transition: `opacity ${ms}ms linear`, opacity: to });
        await this.delay(ms, token);
    }

    async typeText(element, text, msPerChar = DEFAULTS.msPerChar, showCursor = false, token = this.token) {
        if (!text) return;
        const typed = document.createTextNode('');
        element.empty().show().append(typed);
        const cursor = showCursor ? $('<span>').addClass('typing-cursor').text('|').appendTo(element) : null;

        // Array.from splits by code point, so emoji aren't torn in half
        for (const character of Array.from(String(text))) {
            typed.data += character;
            await this.sleep(msPerChar, token);
        }
        if (cursor) cursor.remove();
    }

    // ---- Animations -------------------------------------------------------

    startAnimation(element, { frames, frame_length_ms = DEFAULTS.frameMs }) {
        if (!frames || !frames.length) {
            logger.warn('[Animation] No frames to animate');
            return;
        }
        let frame = 0;
        element.text(frames[frame]);
        if (frames.length === 1) return;

        const id = setInterval(() => {
            if (!element[0].isConnected) {
                this.stopAnimation(element);
                return;
            }
            frame = (frame + 1) % frames.length;
            element.text(frames[frame]);
        }, this.scale(frame_length_ms));
        this.animations.set(element[0], id);
    }

    stopAnimation(element) {
        const id = this.animations.get(element[0]);
        if (id !== undefined) {
            clearInterval(id);
            this.animations.delete(element[0]);
        }
    }

    stopAnimations() {
        this.animations.forEach(id => clearInterval(id));
        this.animations.clear();
    }

    removeElement(element) {
        this.stopAnimation(element);
        element.remove();
    }

    // ---- Directives -------------------------------------------------------

    async runDirective(scene, token) {
        logger.debug(`[Scene] Directive: ${scene.directive}`);
        switch (scene.directive) {
            case 'clear':
                this.stopAnimations();
                this.screen.empty();
                break;
            case 'blankline':
                $('<div>').addClass('blankline').appendTo(this.screen);
                break;
            case 'fade_all':
                await this.fadeAll(scene.duration, token);
                break;
            case 'color':
                await this.changeColor(scene, token);
                break;
            case 'stop_audio':
                if (scene.trackId) this.audioHandler.stopTrack(scene.trackId);
                else this.audioHandler.stopAllTracks();
                break;
            case 'fade_audio': {
                if (!scene.trackId) {
                    logger.warn('[Scene] fade_audio needs a trackId');
                    break;
                }
                const fading = this.audioHandler.fadeOutTrack(scene.trackId, this.scale(scene.duration ?? DEFAULTS.audioFadeMs));
                if (scene.wait_for_fade) await fading;
                break;
            }
            case 'fade_all_audio':
                await this.audioHandler.fadeOutAllTracks(this.scale(scene.duration ?? DEFAULTS.audioFadeMs));
                break;
            default:
                logger.warn(`[Scene] Unknown directive: ${scene.directive}`);
        }
    }

    async fadeAll(duration = DEFAULTS.fadeAllMs, token) {
        const elements = this.screen.children();
        if (!elements.length) return;
        const ms = this.scale(duration);
        elements.css({ transition: `opacity ${ms}ms linear`, opacity: 0 });
        await this.delay(ms, token);
        elements.each((_, el) => this.removeElement($(el)));
    }

    // target: "screen" (default) | "background" | "both"
    async changeColor(scene, token) {
        const ms = this.scale(scene.duration ?? DEFAULTS.colorMs);
        let backgroundTargets = [this.screen];
        let textTargets = [this.screen];
        if (scene.target === 'background') {
            backgroundTargets = textTargets = [this.theatre];
        } else if (scene.target === 'both') {
            // Colour the theatre and let it show through the screen
            this.screen.css('background', 'transparent');
            backgroundTargets = [this.theatre];
            textTargets = [this.theatre, this.screen];
        }

        // Group changes per element: each element has a single `transition`
        // property, so setting it once per CSS property would cancel the others.
        const changes = new Map(); // DOM element -> { $el, props }
        const add = (targets, property, value) => targets.forEach(target => {
            if (!changes.has(target[0])) changes.set(target[0], { target, props: {} });
            changes.get(target[0]).props[property] = value;
        });
        if (scene.background) add(backgroundTargets, 'background-color', scene.background);
        if (scene.text) add(textTargets, 'color', scene.text);
        changes.forEach(({ target, props }) => this.transitionProperties(target, props, ms));

        // async: true lets the story carry on while colours change
        if (!scene.async) await this.delay(ms, token);
    }

    transitionProperties(target, props, ms) {
        const names = Object.keys(props);
        // Pin current computed values so the transition has a start point
        const current = { transition: 'none' };
        names.forEach(name => { current[name] = target.css(name); });
        target.css(current);
        void target[0].offsetHeight;
        target.css({ transition: names.map(name => `${name} ${ms}ms linear`).join(', '), ...props });
    }

    // ---- Audio ------------------------------------------------------------

    // An audio cue either starts a track or, if it has `fadeOut`, fades one out.
    // Resolves when the track has started (or the fade has finished). Never throws.
    async playAudio(audio, token = this.token) {
        const { trackId, fadeOut, fadeIn, ...options } = audio;
        try {
            if (fadeOut) {
                await this.audioHandler.fadeOutTrack(trackId, this.scale(fadeOut));
            } else {
                await this.audioHandler.play(trackId, {
                    ...options,
                    fadeIn: fadeIn ? this.scale(fadeIn) : 0,
                }, () => token.cancelled);
            }
        } catch (error) {
            logger.error(`[Audio] Error with track ${trackId}:`, error);
        }
    }
}

SceneHandler.DEFAULTS = DEFAULTS;
SceneHandler.PlaybackCancelled = PlaybackCancelled;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SceneHandler;
}
