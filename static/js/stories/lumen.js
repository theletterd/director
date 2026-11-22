// Lumen: a firefly looks for someone to blink back.
//
// The meadow animations are generated rather than hand-drawn: each frame is
// a small grid of sky above a strip of grass, with lights placed on it.

const W = 48; // meadow width in characters
const H = 6;  // rows, including the grass
const GRASS = ',\\|/,.,\\|/,,.\\|/,.;\\|/,,\\|/.,,\\|/,.\\|/,,.\\|/,.,\\|/,';

// Deterministic "random" so the meadow looks the same every time
function seeded(seed) {
    return () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };
}

// Render one frame. `lights` is a list of [x, y, char].
function meadow(lights) {
    const rows = Array.from({ length: H - 1 }, () => Array(W).fill(' '));
    lights.forEach(([x, y, c]) => {
        if (y >= 0 && y < H - 1 && x >= 0 && x < W) rows[y][x] = c;
    });
    return rows.map(r => r.join('')).concat(GRASS.slice(0, W)).join('\n');
}

const LIT = '*';
const DIM = '.';

// Lumen drifts left to right over the grass, glowing two beats in three.
const driftFrames = Array.from({ length: 15 }, (_, i) => {
    const x = 3 + i * 3;
    const y = 3 - Math.round(Math.sin(i / 2) * 1.5);
    return meadow([[x, y, i % 3 === 2 ? DIM : LIT]]);
});

// Lumen blinks alone in the middle of the meadow.
const aloneFrames = [LIT, LIT, DIM, LIT, DIM, DIM, DIM, DIM].map(c => meadow([[24, 2, c]]));

// Lumen rises towards the stars, which twinkle but never answer.
const starRandom = seeded(7);
const stars = Array.from({ length: 14 }, () => [Math.floor(starRandom() * W), Math.floor(starRandom() * 2)]);
const riseFrames = Array.from({ length: 12 }, (_, i) => {
    const twinkle = stars.map(([x, y], s) => [x, y, (s + i) % 4 === 0 ? '+' : '.']);
    const y = Math.max(0, 3 - Math.floor(i / 3));
    return meadow([...twinkle, [24, y, i % 2 ? DIM : LIT]]);
});

// The meadow answers: one far light, then another, then dozens.
const answerRandom = seeded(42);
const others = Array.from({ length: 40 }, () => [
    Math.floor(answerRandom() * W),
    Math.floor(answerRandom() * (H - 1)),
]).filter(([x, y]) => !(x === 24 && y === 2));
const lumen = blink => [24, 2, blink ? LIT : DIM];
const answerFrames = [
    meadow([lumen(true)]),
    meadow([lumen(false)]),
    meadow([lumen(true)]),
    meadow([lumen(true), [44, 1, DIM]]),           // ...was that something?
    meadow([lumen(true), [44, 1, LIT]]),           // it was
    meadow([lumen(false), [44, 1, LIT]]),
    meadow([lumen(true), [44, 1, LIT], [6, 3, LIT]]),
    ...Array.from({ length: 8 }, (_, i) => {
        const count = Math.min(others.length, 3 + i * 5);
        return meadow([
            lumen(i % 2 === 0),
            ...others.slice(0, count).map(([x, y], n) => [x, y, (n + i) % 3 ? LIT : DIM]),
        ]);
    }),
];

// Afterwards the whole meadow glows, softly out of step.
const glowFrames = Array.from({ length: 4 }, (_, i) =>
    meadow([lumen(true), ...others.map(([x, y], n) => [x, y, (n + i) % 4 === 0 ? DIM : LIT])])
);

// Small helpers to keep the script readable
const say = (text, { ms = 45, dwell = 1800, cursor = false } = {}) => ({
    content: text,
    arrive: { transition: 'type', ms_per_char: ms, show_cursor: cursor },
    dwell,
});
const pause = ms => ({ directive: 'blankline', dwell: ms });
const animate = (frames, frameMs, { loops = 1, fadeMs = 600 } = {}) => ({
    content: { frames, frame_length_ms: frameMs },
    arrive: { transition: 'fade', duration: 400 },
    dwell: frames.length * frameMs * loops,
    depart: { transition: 'fade', duration: fadeMs, remove: true },
});
const chapter = title => ({ directive: 'chapter', title, card: true });
const sky = (background, text, duration, extra = {}) => ({
    directive: 'color', target: 'both', background, text, duration, async: true, ...extra,
});

const scenes = [
    // Dusk
    chapter('Dusk'),
    { directive: 'blankline', dwell: 800 },
    sky('#e9b384', '#3b2a20', 5000),
    {
        content: 'At the edge of the wood, the sun went down.',
        arrive: {
            transition: 'type', ms_per_char: 55,
            audio: { trackId: 'trees', volume: 0.08, loop: true, fadeIn: 4000 },
        },
        dwell: 1500,
    },
    sky('#4a3657', '#efe2d0', 6000),
    pause(1200),
    say('And one small light woke up.', { dwell: 1200 }),
    pause(400),
    animate(driftFrames, 220),

    // Night
    chapter('Night'),
    sky('#0e1726', '#c8d3de', 6000),
    {
        directive: 'blankline',
        dwell: 1500,
    },
    {
        content: 'Her name was Lumen.',
        arrive: {
            transition: 'type', ms_per_char: 60,
            audio: { trackId: 'crickets', volume: 0.12, loop: true, fadeIn: 5000 },
        },
        dwell: 1500,
    },
    say('She blinked once.', { dwell: 700 }),
    say('Twice.', { ms: 90, dwell: 1200 }),
    pause(300),
    animate(aloneFrames, 300, { loops: 2 }),
    say('Nobody blinked back.', { ms: 70, dwell: 2500 }),
    { directive: 'fade_all', duration: 1500 },

    // The owl
    chapter('The owl'),
    {
        content: '"Who?" said the owl.',
        arrive: {
            transition: 'type', ms_per_char: 50,
            audio: { trackId: 'owl', volume: 0.35, pan: -0.7 },
        },
        dwell: 1600,
    },
    say('"Me," said Lumen. "Have you seen anyone like me?"', { dwell: 1800 }),
    say('"Only the stars," said the owl. "Up there."', { dwell: 1500 }),
    pause(300),
    animate(riseFrames, 350),
    say('But the stars did not blink back either.', { dwell: 1400 }),
    say('They were much too far away to see her.', { dwell: 2500 }),
    { directive: 'fade_all', duration: 1500 },

    // Keep blinking
    chapter('Keep blinking'),
    say('So Lumen did the only thing a firefly can do.', { dwell: 1500 }),
    pause(300),
    say('She kept blinking.', { ms: 80, dwell: 1000, cursor: true }),
    pause(300),
    animate(answerFrames, 450, { fadeMs: 10 }),
    {
        content: { frames: glowFrames, frame_length_ms: 500 },
        dwell: 4000,
        depart: { transition: 'keep' },
    },
    pause(300),
    say('And the dark was not so dark anymore.', { ms: 55, dwell: 5000 }),
    { directive: 'fade_all', duration: 2500 },

    // Dawn
    chapter('Dawn'),
    { directive: 'fade_audio', trackId: 'crickets', duration: 6000 },
    sky('#f3d9b1', '#3a2e26', 7000, { async: false }),
    say('In the morning, nobody could say who had blinked first.', { dwell: 2000 }),
    pause(500),
    say('Lumen could.', { ms: 90, dwell: 4000 }),
    { directive: 'fade_all_audio', duration: 3000 },
    { directive: 'fade_all', duration: 2000 },
];

window.scenes = scenes;
