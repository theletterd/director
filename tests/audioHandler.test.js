const AudioHandler = require('../static/js/assets/audioHandler.js');

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

class FakeParam {
    constructor(value) {
        this.value = value;
        this.events = [];
    }
    setValueAtTime(v, t) { this.events.push(['set', v, t]); this.value = v; }
    linearRampToValueAtTime(v, t) { this.events.push(['linear', v, t]); }
    exponentialRampToValueAtTime(v, t) { this.events.push(['exp', v, t]); }
    cancelScheduledValues() { this.events.push(['cancel']); }
}

const node = extra => ({ connect: jest.fn(), disconnect: jest.fn(), ...extra });

class FakeAudioContext {
    constructor() {
        this.state = 'suspended';
        this.currentTime = 0;
        this.destination = {};
        this.sources = [];
        FakeAudioContext.last = this;
    }
    resume() { this.state = 'running'; return Promise.resolve(); }
    createGain() { return node({ gain: new FakeParam(1) }); }
    createStereoPanner() { return node({ pan: new FakeParam(0) }); }
    createBufferSource() {
        const source = node({ start: jest.fn(), stop: jest.fn() });
        this.sources.push(source);
        return source;
    }
    decodeAudioData() { return Promise.resolve({ duration: 10 }); }
}

let audio;

beforeEach(() => {
    document.body.innerHTML = '';
    window.AudioContext = FakeAudioContext;
    window.audioLibrary = {
        owl: { url: '/owl.mp3' },
        hoot: { url: '/owl.mp3' }, // same file, different track
    };
    global.fetch = jest.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }));
    audio = new AudioHandler();
    jest.clearAllMocks();
});

const enable = () => { audio.isAudioAllowed = true; };
const ctx = () => FakeAudioContext.last;

describe('enabling audio', () => {
    test('button appears only when scenes use audio', () => {
        audio.checkAudioUsage([{ content: 'quiet' }]);
        expect(document.querySelector('[data-audio-enable]')).toBeNull();

        audio.checkAudioUsage([{ arrive: { audio: { trackId: 'owl' } } }]);
        audio.checkAudioUsage([{ arrive: { audio: { trackId: 'owl' } } }]);
        expect(document.querySelectorAll('[data-audio-enable]').length).toBe(1);
    });

    test('clicking resumes audio, removes the button and notifies', async () => {
        const onEnabled = jest.fn();
        audio.setAudioEnabledCallback(onEnabled);
        audio.checkAudioUsage([{ depart: { audio: { trackId: 'owl' } } }]);

        document.querySelector('[data-audio-enable]').click();
        await wait(0);

        expect(ctx().state).toBe('running');
        expect(audio.isAudioAllowed).toBe(true);
        expect(document.querySelector('[data-audio-enable]')).toBeNull();
        expect(onEnabled).toHaveBeenCalled();
    });

    test('no button when audio is already allowed', () => {
        enable();
        audio.checkAudioUsage([{ arrive: { audio: { trackId: 'owl' } } }]);
        expect(document.querySelector('[data-audio-enable]')).toBeNull();
    });

    test('nothing plays before audio is enabled', async () => {
        await audio.play('owl');
        expect(ctx().sources.length).toBe(0);
    });
});

describe('playing tracks', () => {
    beforeEach(enable);

    test('options are applied: volume, loop, pan, offset (ms), fadeIn (ms)', async () => {
        await audio.play('owl', { volume: 0.5, loop: true, pan: -2, offset: 3000, fadeIn: 1000 });
        const track = audio.tracks.get('owl');
        const [source] = ctx().sources;

        expect(source.loop).toBe(true);
        expect(source.start).toHaveBeenCalledWith(0, 3);
        expect(track.panner.pan.value).toBe(-1); // clamped
        expect(track.gain.gain.events).toEqual([['set', 0, 0], ['linear', 0.5, 1]]);
    });

    test('buffers are cached by URL', async () => {
        await audio.play('owl');
        await audio.play('hoot');
        await audio.play('owl');
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('a failed load is logged and can be retried', async () => {
        fetch.mockResolvedValueOnce({ ok: false, status: 404 });
        await audio.play('owl');
        expect(ctx().sources.length).toBe(0);
        expect(logger.error).toHaveBeenCalled();

        await audio.play('owl');
        expect(ctx().sources.length).toBe(1);
    });

    test('unknown tracks warn and do nothing', async () => {
        await audio.play('nope');
        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('nope'));
        expect(ctx().sources.length).toBe(0);
    });

    test('a cancelled cue does not start', async () => {
        await audio.play('owl', {}, () => true);
        expect(ctx().sources.length).toBe(0);
    });

    test('replaying a track stops the old one, and its end event cannot remove the new one', async () => {
        await audio.play('owl');
        const [oldSource] = ctx().sources;
        const oldOnEnded = oldSource.onended;
        await audio.play('owl');

        expect(oldSource.stop).toHaveBeenCalled();
        if (oldOnEnded) oldOnEnded();
        expect(audio.tracks.has('owl')).toBe(true);
    });

    test('a finished track is forgotten', async () => {
        await audio.play('owl');
        ctx().sources[0].onended();
        expect(audio.tracks.has('owl')).toBe(false);
    });
});

describe('stopping and fading', () => {
    beforeEach(enable);

    test('fadeOutTrack ramps down, resolves after the duration, then stops', async () => {
        await audio.play('owl');
        const track = audio.tracks.get('owl');
        const start = Date.now();
        await audio.fadeOutTrack('owl', 50);

        expect(Date.now() - start).toBeGreaterThanOrEqual(45);
        expect(track.gain.gain.events).toContainEqual(['exp', 0.0001, 0.05]);
        expect(ctx().sources[0].stop).toHaveBeenCalled();
        expect(audio.tracks.has('owl')).toBe(false);
    });

    test('a fade does not stop a replacement track started during it', async () => {
        await audio.play('owl');
        const fading = audio.fadeOutTrack('owl', 30);
        await audio.play('owl');
        await fading;
        expect(audio.tracks.has('owl')).toBe(true);
    });

    test('fadeOutTrack on a missing track resolves immediately', async () => {
        await expect(audio.fadeOutTrack('nope', 1000)).resolves.toBeUndefined();
    });

    test('fadeOutAllTracks and stopAllTracks cover every track', async () => {
        await audio.play('owl');
        await audio.play('hoot');
        await audio.fadeOutAllTracks(10);
        expect(audio.getAllTrackIds()).toEqual([]);

        await audio.play('owl');
        audio.stopAllTracks();
        expect(audio.getAllTrackIds()).toEqual([]);
    });
});

test('without Web Audio support everything is a harmless no-op', async () => {
    delete window.AudioContext;
    const silent = new AudioHandler();
    silent.isAudioAllowed = true;
    await silent.play('owl');
    silent.checkAudioUsage([{ arrive: { audio: { trackId: 'owl' } } }]);
    silent.stopAllTracks();
    await silent.fadeOutAllTracks(10);
    expect(document.querySelector('[data-audio-enable]')).toBeNull();
});
