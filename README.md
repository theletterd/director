# Director

A small engine for timed, animated, audio-rich text stories in the browser. A story is a list of declarative scenes: text that types itself out, ASCII-art animations, fades, colour changes and layered sound. A Flask app lists the stories and serves them.

## Running it

```bash
make setup     # Python venv + npm install
make run       # http://localhost:5000
```

`PORT=5050 make run` picks another port (macOS often has AirPlay on 5000). For production, `make run-gunicorn` uses `gunicorn.conf.py` (binds 127.0.0.1:8000); set `FLASK_DEBUG=0` to turn debug mode off.

### URL options

Add these to any story URL while authoring:

| Option | Effect |
|---|---|
| `?chapter=C` | Start at a chapter, by number (`?chapter=2`) or id (`?chapter=the-owl`). |
| `?start=N` | Start at scene N (0-based). |
| `?speed=X` | Play X times faster, e.g. `?speed=4`. Applies to every duration, including audio fades. |
| `?debug=1`…`3` | Log level: 1 info, 2 warn, 3 debug. Errors always log. |

### Tests

```bash
make test      # pytest + jest
```

## Adding a story

1. Write `static/js/stories/my-story.js`:
   ```javascript
   const scenes = [
       { content: "Hello, world", arrive: { transition: "type" }, dwell: 2000 },
   ];

   window.scenes = scenes;
   ```
2. Register it in `configs/story_config.py`:
   ```python
   'my_story': {
       'title': 'My Story',
       'js': 'my-story.js',
       'description': 'Shown on the index page',
       'css': 'my-story.css',          # optional, from static/css/stories/
       'screen_class': 'my-story',     # optional, class added to #screen
   },
   ```

Stories loop forever: after the last scene the stage fades out, resets, and starts again.

## Chapters

Mark where chapters begin with a `chapter` directive anywhere in the scene list:

```javascript
{ directive: "chapter", title: "The owl" }
{ directive: "chapter", title: "Dawn", card: true }          // show the title on screen
{ directive: "chapter", title: "Dawn", card: "Part Three" }  // or custom card text
{ directive: "chapter", title: "The Owl's Song", id: "owl" } // id for ?chapter= (default: from the title)
```

A story with chapters gets:
- **A chapter menu** in the bottom-left corner. It shows the current chapter; click it to jump to another.
- **← / →** to skip to the previous or next chapter. ← restarts the current chapter if you're past its opening, like a music player.
- **`?chapter=`** links straight to a chapter.

Chapters are bookmarks: playback flows straight from one into the next.

When playback starts mid-story (a chapter jump, `?chapter=` or `?start=`), Director first sets up what the earlier scenes would have left behind: the latest colours from `color` directives, and any looping audio that would still be playing. On-screen text and one-shot sounds aren't replayed. Clicking "Enable Audio" restarts the current chapter with sound.

Title cards use the `.chapter-card` class, so a story's stylesheet can restyle them.

## Scenes

Each scene is either a **content scene** or a **directive**. All durations are in milliseconds.

### Content scenes

```javascript
{
    content: "Text to show",      // or { frames: [...], frame_length_ms: 100 } for animation
    arrive: { transition: "type", ms_per_char: 50 },
    dwell: 2000,                  // pause after arriving
    depart: { transition: "fade", duration: 1000, remove: true }
}
```

Each scene is its own line on the screen, with whitespace preserved, so ASCII art works. Scenes stay on screen after departing (just invisible after a fade) unless `remove: true` is set or a `clear` / `fade_all` directive runs.

#### `arrive` transitions

| Transition | Options | Effect |
|---|---|---|
| `show` (default) | | Appear immediately |
| `fade` | `duration` (1000) | Fade in |
| `type` | `ms_per_char` (50), `show_cursor` | Typewriter effect |
| `keep` | | Do nothing |
| `hide` | | Start hidden |

#### `depart` transitions

| Transition | Options | Effect |
|---|---|---|
| `keep` (default) | | Leave it showing |
| `fade` | `duration` (1000) | Fade out |
| `type` | `duration` (1000) | Same as `fade` |
| `hide` | | Disappear immediately |

`depart` also accepts:
- `remove: true`: take the element out of the page afterwards.
- `wait: true`: pause for another `duration` ms after the transition.
- `wait_for_audio: true`: don't finish until the departure's audio cue (usually a fade-out) has finished.

#### Animations

```javascript
{
    content: { frames: ["(•_•)", "( •_•)>⌐■-■", "(⌐■_■)"], frame_length_ms: 500 },
    arrive: { transition: "fade", duration: 500 },
    dwell: 3000,
    depart: { transition: "fade", duration: 500, remove: true }
}
```

Frames loop until the scene fades out, hides, is removed or is cleared. Shared frame sets live in `static/js/assets/animations.js`.

### Audio cues

`arrive` and `depart` can each carry an `audio` cue. Tracks are named in `static/js/assets/audio_library.js`:

```javascript
const audioLibrary = {
    owl: { url: "/static/sound_effects/owl.mp3", description: "Owl hooting" },
};
```

A cue **starts** a track:

```javascript
audio: {
    trackId: "owl",
    volume: 0.5,     // default 1
    loop: true,      // default false
    fadeIn: 1000,    // ms
    pan: -0.8,       // -1 left … 1 right
    offset: 3000     // start this many ms into the file
}
```

…or, if it has `fadeOut`, **fades out** a playing track:

```javascript
audio: { trackId: "owl", fadeOut: 2000 }
```

Starting a track that is already playing restarts it. Browsers block audio until the reader clicks something, so stories that use audio show an "Enable Audio" button. Clicking it restarts the story with sound.

### Directives

| Directive | Options | Effect |
|---|---|---|
| `clear` | | Empty the screen |
| `blankline` | | Add an empty line |
| `fade_all` | `duration` (2000) | Fade out and remove everything on screen |
| `color` | see below | Change background and/or text colour |
| `stop_audio` | `trackId` (optional) | Stop one track, or all |
| `fade_audio` | `trackId`, `duration` (2000), `wait_for_fade` | Fade out one track |
| `fade_all_audio` | `duration` (2000) | Fade out every track, then continue |
| `chapter` | `title`, `card`, `id` | Start a chapter (see [Chapters](#chapters)) |

Any directive can also have a `dwell`.

```javascript
{
    directive: "color",
    target: "screen",       // "screen" (default), "background" (behind the screen) or "both"
    background: "#000",     // any CSS colour
    text: "#0f0",           // optional
    duration: 2000,
    async: false            // true: carry on while the colour changes
}
```

## How it fits together

| File | Role |
|---|---|
| `app.py`, `configs/` | Flask app and story registry |
| `templates/story.html` | Loads jQuery, the engine, the story, then `director.js` |
| `static/js/assets/director.js` | Reads URL options, starts playback |
| `static/js/assets/sceneHandler.js` | Plays scenes: transitions, directives, looping, cancellation, chapters |
| `static/js/assets/chapters.js` | Chapter menu and ←/→ keys |
| `static/js/assets/audioHandler.js` | Web Audio playback, fades, the enable-audio button |
| `static/js/assets/logger.js` | Level-filtered console logging |
| `static/js/stories/` | The stories |

## License

MIT
