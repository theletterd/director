# Writing a Director story (reference for LLMs)

A story is a JavaScript file in `static/js/stories/` that ends with `window.scenes = scenes;`. Scenes play in order, one after another, and the story loops forever. All durations are milliseconds. README.md has the full reference.

## Content scene

```javascript
{
    content: "Text",                       // string, or { frames: [...], frame_length_ms: 100 }
    arrive: { transition: "type", ms_per_char: 50, show_cursor: true },
    dwell: 2000,
    depart: { transition: "fade", duration: 1000, remove: true }
}
```

- `arrive.transition`: `show` (default) | `fade` (`duration`) | `type` (`ms_per_char`, `show_cursor`) | `keep` | `hide`
- `depart.transition`: `keep` (default) | `fade` (`duration`) | `type` (same as fade) | `hide`
- `depart` extras: `remove: true` (delete the element afterwards), `wait: true` (pause `duration` ms more), `wait_for_audio: true`
- Each scene is a new line with whitespace preserved. Faded-out scenes still take up space unless removed.

## Audio cue (inside `arrive` or `depart`)

```javascript
audio: { trackId: "owl", volume: 0.5, loop: false, fadeIn: 1000, pan: -1, offset: 0 }   // start
audio: { trackId: "owl", fadeOut: 2000 }                                                 // fade out
```

`trackId` must exist in `static/js/assets/audio_library.js`. `pan` runs from -1 (left) to 1 (right); `offset` is in ms.

## Directives

```javascript
{ directive: "clear" }
{ directive: "blankline" }
{ directive: "fade_all", duration: 2000 }
{ directive: "color", target: "screen" | "background" | "both", background: "#000", text: "#fff", duration: 2000, async: false }
{ directive: "stop_audio", trackId: "owl" }          // omit trackId to stop everything
{ directive: "fade_audio", trackId: "owl", duration: 2000, wait_for_fade: true }
{ directive: "fade_all_audio", duration: 2000 }
```

Any directive may also have `dwell`.

## Example

```javascript
const scenes = [
    {
        content: "The forest at night",
        arrive: { transition: "type", ms_per_char: 60, audio: { trackId: "crickets", volume: 0.2, loop: true, fadeIn: 2000 } },
        dwell: 2000,
        depart: { transition: "fade", duration: 1000 }
    },
    { directive: "blankline" },
    {
        content: { frames: ["(•_•)", "( •_•)>⌐■-■", "(⌐■_■)"], frame_length_ms: 500 },
        arrive: { transition: "fade", duration: 500 },
        dwell: 3000,
        depart: { transition: "fade", duration: 500, remove: true }
    },
    { directive: "fade_all_audio", duration: 2000 },
    { directive: "clear", dwell: 1000 }
];

window.scenes = scenes;
```
