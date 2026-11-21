const SceneHandler = require('../static/js/assets/sceneHandler.js');

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function fakeAudio() {
    return {
        setAudioEnabledCallback: jest.fn(),
        checkAudioUsage: jest.fn(),
        play: jest.fn(async () => {}),
        fadeOutTrack: jest.fn(async () => {}),
        fadeOutAllTracks: jest.fn(async () => {}),
        stopTrack: jest.fn(),
        stopAllTracks: jest.fn(),
    };
}

let handler;
let audio;
let screen;

beforeEach(() => {
    document.body.innerHTML = '<div id="backdrop"><div id="theatre"><div id="screen"></div></div></div>';
    screen = $('#screen');
    audio = fakeAudio();
    handler = new SceneHandler(screen, audio);
    jest.clearAllMocks();
});

afterEach(() => handler.stop());

const scenes = () => screen.children('.scene');

describe('scene elements', () => {
    test('text content is added to the screen', async () => {
        await handler.processScene({ content: 'Hello' });
        expect(scenes().length).toBe(1);
        expect(scenes().text()).toBe('Hello');
    });

    test('dwell waits before departing', async () => {
        const start = Date.now();
        await handler.processScene({ content: 'x', dwell: 80 });
        expect(Date.now() - start).toBeGreaterThanOrEqual(75);
    });
});

describe('transitions', () => {
    test('type reveals text character by character and removes the cursor', async () => {
        const done = handler.processScene({
            content: 'abcdef',
            arrive: { transition: 'type', ms_per_char: 20, show_cursor: true },
        });
        await wait(50);
        const partial = scenes().text().replace('|', '');
        expect(partial.length).toBeGreaterThan(0);
        expect(partial.length).toBeLessThan(6);
        expect(screen.find('.typing-cursor').length).toBe(1);

        await done;
        expect(scenes().text()).toBe('abcdef');
        expect(screen.find('.typing-cursor').length).toBe(0);
    });

    test('type does not split emoji', async () => {
        const seen = new Set();
        const done = handler.processScene({ content: 'a😀b', arrive: { transition: 'type', ms_per_char: 15 } });
        const watcher = setInterval(() => seen.add(scenes().text()), 2);
        await done;
        clearInterval(watcher);
        for (const text of seen) expect(text).not.toMatch(/[\uD800-\uDBFF]$/); // no lone high surrogate
        expect(scenes().text()).toBe('a😀b');
    });

    test('speed multiplier is applied once to typing', async () => {
        handler.setSpeedMultiplier(10);
        const start = Date.now();
        await handler.processScene({ content: '0123456789', arrive: { transition: 'type', ms_per_char: 50 } });
        const elapsed = Date.now() - start;
        // 10 chars x 50ms / 10 = 50ms (applying it twice would give ~10ms)
        expect(elapsed).toBeGreaterThanOrEqual(45);
        expect(elapsed).toBeLessThan(200);
    });

    test('fade in ends fully opaque after the duration', async () => {
        const start = Date.now();
        await handler.processScene({ content: 'x', arrive: { transition: 'fade', duration: 60 } });
        expect(Date.now() - start).toBeGreaterThanOrEqual(55);
        expect(scenes().css('opacity')).toBe('1');
    });

    test('fade out keeps the element by default, and removes it with remove: true', async () => {
        await handler.processScene({ content: 'kept', depart: { transition: 'fade', duration: 10 } });
        await handler.processScene({ content: 'gone', depart: { transition: 'fade', duration: 10, remove: true } });
        expect(scenes().length).toBe(1);
        expect(scenes().text()).toBe('kept');
        expect(scenes().css('opacity')).toBe('0');
    });

    test('hide actually hides the element', async () => {
        await handler.processScene({ content: 'x', depart: { transition: 'hide' } });
        expect(scenes().css('display')).toBe('none');
    });

    test('keep leaves the element alone', async () => {
        await handler.processScene({ content: 'x', depart: { transition: 'keep' } });
        expect(scenes().css('opacity')).not.toBe('0');
        expect(scenes().css('display')).not.toBe('none');
    });
});

describe('animations', () => {
    const animated = depart => ({ content: { frames: ['A', 'B'], frame_length_ms: 10 }, depart });

    test('frames cycle', async () => {
        await handler.processScene(animated());
        const seen = new Set();
        for (let i = 0; i < 10; i++) {
            seen.add(scenes().text());
            await wait(6);
        }
        expect(seen).toEqual(new Set(['A', 'B']));
    });

    test('animation stops after fading out', async () => {
        await handler.processScene(animated({ transition: 'fade', duration: 10 }));
        expect(handler.animations.size).toBe(0);
    });

    test('animation stops when cleared', async () => {
        await handler.processScene(animated());
        expect(handler.animations.size).toBe(1);
        await handler.processScene({ directive: 'clear' });
        expect(handler.animations.size).toBe(0);
    });
});

describe('directives', () => {
    test('clear empties the screen', async () => {
        await handler.processScene({ content: 'x' });
        await handler.processScene({ directive: 'clear' });
        expect(screen.children().length).toBe(0);
    });

    test('blankline adds a spacer', async () => {
        await handler.processScene({ directive: 'blankline' });
        expect(screen.children('.blankline').length).toBe(1);
    });

    test('fade_all fades then removes everything', async () => {
        await handler.processScene({ content: 'a' });
        await handler.processScene({ content: 'b' });
        const start = Date.now();
        await handler.processScene({ directive: 'fade_all', duration: 40 });
        expect(Date.now() - start).toBeGreaterThanOrEqual(35);
        expect(screen.children().length).toBe(0);
    });

    test('directive dwell is honoured', async () => {
        const start = Date.now();
        await handler.processScene({ directive: 'blankline', dwell: 60 });
        expect(Date.now() - start).toBeGreaterThanOrEqual(55);
    });

    test('unknown directives warn and carry on', async () => {
        await handler.processScene({ directive: 'nope' });
        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('nope'));
    });

    describe('color', () => {
        const color = extra => ({ directive: 'color', background: 'rgb(0, 0, 0)', duration: 60, ...extra });

        test('waits for the transition by default', async () => {
            const start = Date.now();
            await handler.processScene(color());
            expect(Date.now() - start).toBeGreaterThanOrEqual(55);
            expect(screen.css('background-color')).toBe('rgb(0, 0, 0)');
        });

        test('async: true does not wait', async () => {
            const start = Date.now();
            await handler.processScene(color({ async: true }));
            expect(Date.now() - start).toBeLessThan(40);
        });

        test('background and text transition together on the same element', async () => {
            await handler.processScene(color({ text: 'rgb(255, 255, 255)', async: true }));
            const transition = screen[0].style.transition;
            expect(transition).toContain('background-color 60ms');
            expect(transition).toContain('color 60ms');
        });

        test('targets', async () => {
            const theatre = $('#theatre');
            await handler.processScene(color({ target: 'background', async: true }));
            expect(theatre.css('background-color')).toBe('rgb(0, 0, 0)');

            await handler.processScene(color({ target: 'both', text: 'rgb(255, 255, 255)', async: true }));
            expect(screen.css('color')).toBe('rgb(255, 255, 255)');
            expect(theatre.css('color')).toBe('rgb(255, 255, 255)');
        });
    });

    describe('audio', () => {
        test('stop_audio stops one track or all of them', async () => {
            await handler.processScene({ directive: 'stop_audio', trackId: 'owl' });
            expect(audio.stopTrack).toHaveBeenCalledWith('owl');
            await handler.processScene({ directive: 'stop_audio' });
            expect(audio.stopAllTracks).toHaveBeenCalled();
        });

        test('fade_audio waits only when wait_for_fade is set', async () => {
            audio.fadeOutTrack.mockImplementation(() => wait(60));

            let start = Date.now();
            await handler.processScene({ directive: 'fade_audio', trackId: 'owl', duration: 60 });
            expect(Date.now() - start).toBeLessThan(40);

            start = Date.now();
            await handler.processScene({ directive: 'fade_audio', trackId: 'owl', duration: 60, wait_for_fade: true });
            expect(Date.now() - start).toBeGreaterThanOrEqual(55);
            expect(audio.fadeOutTrack).toHaveBeenCalledWith('owl', 60);
        });

        test('fade_all_audio fades every track', async () => {
            await handler.processScene({ directive: 'fade_all_audio', duration: 30 });
            expect(audio.fadeOutAllTracks).toHaveBeenCalledWith(30);
        });
    });
});

describe('audio cues', () => {
    test('a cue starts a track with its options, durations scaled by speed', async () => {
        handler.setSpeedMultiplier(2);
        await handler.processScene({
            content: 'x',
            arrive: { audio: { trackId: 'owl', volume: 0.5, fadeIn: 1000, pan: -1, offset: 3000, loop: true } },
        });
        expect(audio.play).toHaveBeenCalledWith(
            'owl',
            { volume: 0.5, fadeIn: 500, pan: -1, offset: 3000, loop: true },
            expect.any(Function),
        );
    });

    test('a cue with fadeOut fades the track instead', async () => {
        await handler.processScene({ content: 'x', depart: { audio: { trackId: 'owl', fadeOut: 40 } } });
        expect(audio.fadeOutTrack).toHaveBeenCalledWith('owl', 40);
        expect(audio.play).not.toHaveBeenCalled();
    });

    test('wait_for_audio waits for the departure fade', async () => {
        audio.fadeOutTrack.mockImplementation(() => wait(80));
        const start = Date.now();
        await handler.processScene({
            content: 'x',
            depart: { transition: 'fade', duration: 10, audio: { trackId: 'owl', fadeOut: 80 }, wait_for_audio: true },
        });
        expect(Date.now() - start).toBeGreaterThanOrEqual(75);
    });

    test('audio errors never break the scene', async () => {
        audio.play.mockRejectedValue(new Error('boom'));
        await handler.processScene({ content: 'x', arrive: { audio: { trackId: 'owl' } } });
        await wait(0);
        expect(scenes().length).toBe(1);
        expect(logger.error).toHaveBeenCalled();
    });
});

describe('playback', () => {
    beforeEach(() => handler.setSpeedMultiplier(20));

    test('a scene that throws is skipped, not fatal', async () => {
        const original = handler.createSceneElement.bind(handler);
        handler.createSceneElement = jest.fn(scene => {
            if (scene.content === 'bad') throw new Error('boom');
            return original(scene);
        });
        handler.play([{ content: 'bad' }, { content: 'good', dwell: 10000 }]);
        await wait(30);
        expect(scenes().text()).toBe('good');
        expect(logger.error).toHaveBeenCalled();
    });

    test('loops back to the start after resetting the stage', async () => {
        screen.css('background-color', 'rgb(1, 2, 3)');
        // At 20x: scene 0-100ms, reset 100-200ms, replay from 200ms
        handler.play([{ content: 'only', dwell: 2000 }]);
        await wait(150); // mid-reset: audio fading, content still there
        expect(audio.fadeOutAllTracks).toHaveBeenCalled();
        expect(scenes().length).toBe(1);

        await wait(100); // replaying
        expect(handler.currentSceneIndex).toBe(0);
        expect(screen[0].style.backgroundColor).toBe(''); // inline styles cleared
        expect(scenes().length).toBe(1);
        expect(scenes().text()).toBe('only');
    });

    test('starting again cancels the previous run instead of running two', async () => {
        const story = [
            { content: 'one', arrive: { transition: 'type', ms_per_char: 100 }, dwell: 2000 },
            { content: 'two', dwell: 20000 },
        ];
        const first = handler.play(story);
        await wait(20);
        const second = handler.play(story, 1);

        await expect(first).resolves.toBeUndefined(); // the old run unwinds
        await wait(30);
        expect(handler.currentSceneIndex).toBe(1);
        expect(scenes().last().text()).toBe('two');
        expect(handler.isPlaying).toBe(true);
        handler.stop();
        await second;
    });

    test('restart replays from where the story was started, after a reset', async () => {
        const story = [{ content: 'a', dwell: 20000 }, { content: 'b', dwell: 20000 }];
        handler.start(story, 1);
        await wait(10);
        handler.restart();
        await wait(10);
        expect(screen.children().length).toBe(1); // reset still fading the old content
        await wait(120);
        expect(scenes().text()).toBe('b');
        expect(handler.currentSceneIndex).toBe(1);
    });

    test('audio cues from a cancelled run are dropped', async () => {
        handler.play([{ content: 'x', arrive: { audio: { trackId: 'owl' } }, dwell: 20000 }]);
        await wait(5);
        const isCancelled = audio.play.mock.calls[0][2];
        expect(isCancelled()).toBe(false);
        handler.stop();
        expect(isCancelled()).toBe(true);
    });

    test('stop halts animations and audio', async () => {
        handler.play([{ content: { frames: ['A', 'B'], frame_length_ms: 100 }, dwell: 20000 }]);
        await wait(5);
        expect(handler.animations.size).toBe(1);
        handler.stop();
        expect(handler.animations.size).toBe(0);
        expect(audio.stopAllTracks).toHaveBeenCalled();
        expect(handler.isPlaying).toBe(false);
    });

    test('audio being enabled triggers a restart', () => {
        const fresh = fakeAudio();
        const h = new SceneHandler(screen, fresh);
        h.restart = jest.fn();
        fresh.setAudioEnabledCallback.mock.calls[0][0]();
        expect(h.restart).toHaveBeenCalled();
    });
});
