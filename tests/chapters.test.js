const SceneHandler = require('../static/js/assets/sceneHandler.js');
const ChapterNavigator = require('../static/js/assets/chapters.js');

global.SceneHandler = SceneHandler;

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

const LONG = 60000;
const story = [
    { directive: 'color', target: 'both', background: 'rgb(10, 20, 30)', text: 'rgb(200, 200, 200)', duration: 10 },
    { directive: 'chapter', title: 'Dusk' },
    { content: 'one', arrive: { audio: { trackId: 'wind', loop: true, volume: 0.2 } } },
    { content: 'two' },
    { directive: 'chapter', title: "The Owl's Song", id: 'owl' },
    { content: 'three', arrive: { audio: { trackId: 'hoot' } } },
    { directive: 'color', target: 'screen', background: 'rgb(1, 2, 3)', duration: 10 },
    { directive: 'chapter', title: 'Dawn', card: true },
    { content: 'four', dwell: LONG },
];
// Same story, but every content scene holds, so playback stays where we put it
const holding = story.map(scene => (scene.content ? { ...scene, dwell: LONG } : scene));
const target = () => jest.spyOn(handler, 'jumpToChapter');
const targetTitle = spy => spy.mock.calls[spy.mock.calls.length - 1][0]?.title;

let handler;
let audio;
let screen;

beforeEach(() => {
    document.body.innerHTML = '<div id="backdrop"><div id="theatre"><div id="screen"></div></div></div>';
    screen = $('#screen');
    audio = fakeAudio();
    handler = new SceneHandler(screen, audio);
    handler.setSpeedMultiplier(20);
    jest.clearAllMocks();
});

afterEach(() => handler.stop());

describe('finding chapters', () => {
    test('numbers, indexes, titles and ids', () => {
        expect(SceneHandler.findChapters(story)).toEqual([
            { number: 1, index: 1, title: 'Dusk', id: 'dusk' },
            { number: 2, index: 4, title: "The Owl's Song", id: 'owl' },
            { number: 3, index: 7, title: 'Dawn', id: 'dawn' },
        ]);
    });

    test('untitled chapters get a default title', () => {
        expect(SceneHandler.findChapters([{ directive: 'chapter' }])[0]).toMatchObject({ title: 'Chapter 1', id: 'chapter-1' });
    });

    test('stories without chapters have none', () => {
        expect(SceneHandler.findChapters([{ content: 'x' }])).toEqual([]);
    });

    test('lookup by number or id', () => {
        const chapters = SceneHandler.findChapters(story);
        expect(SceneHandler.findChapter(chapters, '2').title).toBe("The Owl's Song");
        expect(SceneHandler.findChapter(chapters, 'owl').number).toBe(2);
        expect(SceneHandler.findChapter(chapters, 'DAWN').number).toBe(3);
        expect(SceneHandler.findChapter(chapters, '9')).toBeNull();
        expect(SceneHandler.findChapter(chapters, 'nope')).toBeNull();
    });
});

describe('stageStateAt', () => {
    test('collects final colours and looping tracks before an index', () => {
        const state = SceneHandler.stageStateAt(story, 7);
        expect(state.colors.theatre).toEqual({ 'background-color': 'rgb(10, 20, 30)', color: 'rgb(200, 200, 200)' });
        expect(state.colors.screen).toEqual({ color: 'rgb(200, 200, 200)', 'background-color': 'rgb(1, 2, 3)' });
        expect(state.transparentScreen).toBe(true);
        expect(state.tracks).toEqual([{ trackId: 'wind', loop: true, volume: 0.2 }]); // not the one-shot hoot
    });

    test('nothing before index 0', () => {
        const state = SceneHandler.stageStateAt(story, 0);
        expect(state.tracks).toEqual([]);
        expect(state.colors).toEqual({ theatre: {}, screen: {} });
    });

    test('fades and stops remove tracks', () => {
        const loop = id => ({ content: id, arrive: { audio: { trackId: id, loop: true } } });
        const scenes = [
            loop('a'), loop('b'), loop('c'), loop('d'),
            { content: 'x', depart: { audio: { trackId: 'a', fadeOut: 100 } } },
            { directive: 'fade_audio', trackId: 'b' },
            { directive: 'stop_audio', trackId: 'c' },
        ];
        expect(SceneHandler.stageStateAt(scenes, scenes.length).tracks.map(t => t.trackId)).toEqual(['d']);
        expect(SceneHandler.stageStateAt([...scenes, { directive: 'fade_all_audio' }], 8).tracks).toEqual([]);
    });
});

describe('playback with chapters', () => {
    test('chapter changes are announced as playback enters them', async () => {
        const seen = [];
        handler.onChapterChange = chapter => seen.push(chapter && chapter.title);
        handler.play(story);
        await wait(150);
        expect(seen).toEqual([null, 'Dusk', "The Owl's Song", 'Dawn']);
    });

    test('a chapter with card: true shows its title, then removes it', async () => {
        handler.play(story, 7);
        await wait(30);
        expect(screen.find('.chapter-card').text()).toBe('Dawn');
        await wait(200); // (800 + 1800 + 800) / 20 = 170ms
        expect(screen.find('.chapter-card').length).toBe(0);
        expect(screen.children('.scene').last().text()).toBe('four');
    });

    test('card can be custom text', async () => {
        handler.play([{ directive: 'chapter', title: 'x', card: 'Part One' }, { content: 'y', dwell: LONG }]);
        await wait(20);
        expect(screen.find('.chapter-card').text()).toBe('Part One');
    });

    test('starting mid-story restores colours and background audio', async () => {
        handler.start(story, 7);
        await wait(5);
        expect($('#theatre')[0].style.backgroundColor).toBe('rgb(10, 20, 30)');
        expect(screen[0].style.backgroundColor).toBe('rgb(1, 2, 3)');
        expect(audio.play).toHaveBeenCalledWith('wind', expect.objectContaining({ loop: true, volume: 0.2 }), expect.any(Function));
        expect(audio.play).not.toHaveBeenCalledWith('hoot', expect.anything(), expect.anything());
    });

    test('jumping fades out quickly, then plays the chapter with its state', async () => {
        handler.play(holding, 2);
        await wait(10);
        audio.stopAllTracks.mockClear();
        handler.jumpToChapter(handler.chapters[2]);
        expect(audio.stopAllTracks).not.toHaveBeenCalled(); // audio fades instead of cutting
        expect(audio.fadeOutAllTracks).toHaveBeenCalledWith(30); // jumpMs 600 / 20
        await wait(60);
        expect(handler.currentChapter().title).toBe('Dawn');
        expect(screen[0].style.backgroundColor).toBe('rgb(1, 2, 3)');
    });

    test('next and previous chapter', async () => {
        handler.play(holding, 8); // Dawn's first scene
        await wait(5);
        const jump = target();

        handler.previousChapter(); // still on Dawn's opening -> previous chapter
        expect(targetTitle(jump)).toBe("The Owl's Song");
        await wait(60);
        expect(handler.currentChapter().title).toBe("The Owl's Song");

        handler.nextChapter();
        expect(targetTitle(jump)).toBe('Dawn');

        jump.mockClear();
        handler.currentSceneIndex = 8;
        handler.nextChapter(); // already on the last chapter
        expect(targetTitle(jump)).toBeUndefined();
    });

    test('previous restarts the current chapter once you are into it', async () => {
        const scenes = [
            { directive: 'chapter', title: 'A' },
            { content: '1' }, { content: '2' },
            { directive: 'chapter', title: 'B' },
            { content: '3' }, { content: '4' }, { content: '5', dwell: LONG },
        ];
        handler.play(scenes, 6);
        await wait(5);
        const jump = target();
        handler.previousChapter();
        expect(targetTitle(jump)).toBe('B');
    });

    test('restart (audio enabled) replays the current chapter', async () => {
        handler.start(holding, 0);
        await wait(5);
        handler.play(holding, 5); // reader is in The Owl's Song
        await wait(5);
        const play = jest.spyOn(handler, 'play');
        handler.restart();
        expect(play).toHaveBeenCalledWith(holding, 4, expect.objectContaining({ reset: true, restore: true }));
    });
});

describe('ChapterNavigator', () => {
    const press = key => document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

    test('does nothing for stories without chapters', () => {
        handler.play([{ content: 'x', dwell: LONG }]);
        new ChapterNavigator(handler).attach();
        expect(document.querySelector('.chapter-menu')).toBeNull();
    });

    test('menu lists chapters and tracks the current one', async () => {
        handler.play(story, 4);
        const nav = new ChapterNavigator(handler).attach();
        const toggle = document.querySelector('.chapter-toggle');
        const items = [...document.querySelectorAll('.chapter-list button')].map(b => b.textContent);

        expect(items).toEqual(['1. Dusk', "2. The Owl's Song", '3. Dawn']);
        expect(toggle.textContent).toBe("2. The Owl's Song");
        expect(document.querySelector('[aria-current]').textContent).toBe("2. The Owl's Song");

        await wait(60);
        expect(toggle.textContent).toBe('3. Dawn');
        nav.detach();
        expect(document.querySelector('.chapter-menu')).toBeNull();
    });

    test('toggle opens the list; picking a chapter jumps and closes it', async () => {
        handler.play(holding, 8);
        new ChapterNavigator(handler).attach();
        const jump = target();
        const list = document.querySelector('.chapter-list');
        document.querySelector('.chapter-toggle').click();
        expect(list.hidden).toBe(false);

        list.querySelector('button').click(); // 1. Dusk
        expect(list.hidden).toBe(true);
        expect(targetTitle(jump)).toBe('Dusk');
        await wait(60);
        expect(handler.currentChapter().title).toBe('Dusk');
    });

    test('clicking elsewhere or Escape closes the list', () => {
        handler.play(story, 8);
        const nav = new ChapterNavigator(handler).attach();
        nav.setOpen(true);
        document.body.click();
        expect(nav.isOpen()).toBe(false);
        nav.setOpen(true);
        press('Escape');
        expect(nav.isOpen()).toBe(false);
    });

    test('arrow keys skip chapters; modified keys and text fields are ignored', () => {
        handler.play(story, 2);
        new ChapterNavigator(handler).attach();
        handler.nextChapter = jest.fn();
        handler.previousChapter = jest.fn();

        press('ArrowRight');
        press('ArrowLeft');
        expect(handler.nextChapter).toHaveBeenCalledTimes(1);
        expect(handler.previousChapter).toHaveBeenCalledTimes(1);

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', metaKey: true }));
        const input = document.createElement('input');
        document.body.appendChild(input);
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        expect(handler.nextChapter).toHaveBeenCalledTimes(1);
    });
});
