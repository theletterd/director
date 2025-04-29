# Director

A JavaScript-based scene director system for creating interactive, animated, and audio-rich presentations. Perfect for storytelling, tutorials, or any content that needs precise timing and transitions.

## Features

- **Scene Management**: Create and sequence scenes with precise timing
- **Rich Transitions**: Fade, typewriter, and custom animations
- **Audio Support**: Multi-track audio with looping, fading, and layering
- **Animation Support**: Frame-based animations with custom timing
- **Extensible**: Easy to add new transition types and effects

## Installation

1. Initialize the project:
```bash
npm init -y
```

2. Install dependencies:
```bash
npm install
```

This will create a `node_modules` directory and install:
- jQuery (runtime dependency)
- Jest (testing framework)
- JSDOM (browser environment simulation)

### Development Setup

1. Install development dependencies:
```bash
npm install --save-dev jest jest-environment-jsdom
```

2. Run tests:
```bash
npm test          # Run tests once
npm test -- --watch  # Run tests in watch mode
```

## Project Structure

```
director/
├── node_modules/     # Dependencies
├── package.json      # Dependencies and scripts
├── jest.setup.js     # Test environment configuration
├── tests/            # Test files
├── director.js       # Main director class
├── sceneHandler.js   # Scene management
├── audioHandler.js   # Audio management
└── logger.js         # Logging utility
```

## Basic Usage

1. Include the required files in your HTML:
```html
<script src="jquery-3.3.1.min.js"></script>
<script src="logger.js"></script>
<script src="audioHandler.js"></script>
<script src="sceneHandler.js"></script>
<script src="animations.js"></script>
<script src="your-scenes.js"></script>
<script src="director.js"></script>
```

2. Define your scenes in a JavaScript file:
```javascript
const scenes = [
    {
        text: "Hello, World!",
        arrive: {
            transition: "type",
            ms_per_char: 100
        },
        dwell: 2000,
        depart: {
            transition: "fade",
            duration: 1000
        }
    }
];
```

## Scene Configuration

### Basic Scene Properties

- `text`: The text content to display
- `arrive`: Configuration for how the scene appears
- `dwell`: How long to show the scene (in milliseconds)
- `depart`: Configuration for how the scene disappears
- `animation`: Optional frame-based animation configuration
- `directive`: Special scene commands (see below)

### Transitions

Available transitions in `arrive` and `depart`:

- `fade`: Smooth fade in/out
  ```javascript
  {
      transition: "fade",
      duration: 1000,  // milliseconds
      wait_for_fade: true  // optional, wait for fade to complete
  }
  ```
- `type`: Typewriter effect
  ```javascript
  {
      transition: "type",
      ms_per_char: 50,  // milliseconds per character
      show_cursor: true  // optional, show a blinking cursor while typing
  }
  ```
  Note: In departure phase, type transition simply fades out the text.
- `show`: Immediate appearance
  ```javascript
  {
      transition: "show"
  }
  ```
- `hide`: Immediate disappearance
  ```javascript
  {
      transition: "hide",
      remove: true  // optional, remove element from DOM
  }
  ```
- `keep`: Keep element visible
  ```javascript
  {
      transition: "keep"
  }
  ```

### Directives

Special scene commands that control the presentation:

- `clear`: Clear the screen
  ```javascript
  {
      directive: "clear"
  }
  ```
- `blankline`: Add a blank line
  ```javascript
  {
      directive: "blankline"
  }
  ```
- `fade_all`: Fade out all elements on screen
  ```javascript
  {
      directive: "fade_all"
  }
  ```
- `stop_audio`: Stop all audio tracks
  ```javascript
  {
      directive: "stop_audio"
  }
  ```
- `fade_audio`: Fade out a specific audio track
  ```javascript
  {
      directive: "fade_audio",
      trackId: "background",
      duration: 2000,  // milliseconds
      wait_for_fade: true  // optional, wait for fade to complete
  }
  ```
- `fade_all_audio`: Fade out all audio tracks
  ```javascript
  {
      directive: "fade_all_audio",
      duration: 2000  // milliseconds
  }
  ```

### Audio Configuration

Audio can be configured in both `arrive` and `depart`:

```javascript
{
    audio: {
        url: "path/to/audio.mp3",
        volume: 0.8,
        loop: true,
        fadeIn: 1000,  // milliseconds
        fadeOut: 1000,  // milliseconds
        wait_for_audio: true  // optional, wait for audio to complete
    }
}
```

### Animation Configuration

Frame-based animations can be added to any scene:

```javascript
{
    animation: {
        frames: ["frame1", "frame2", "frame3"],
        frame_length_ms: 100  // milliseconds per frame
    }
}
```

## Example

Here's a complete example showing various features:

```javascript
const scenes = [
    {
        text: "Welcome to the presentation",
        arrive: {
            transition: "type",
            ms_per_char: 50,
            audio: {
                url: "welcome.mp3",
                volume: 0.8
            }
        },
        dwell: 3000,
        depart: {
            transition: "fade",
            duration: 1000
        }
    },
    {
        directive: "blankline"
    },
    {
        text: "Let's begin...",
        arrive: {
            transition: "fade",
            duration: 500
        },
        animation: {
            frames: ["(•_•)", "( •_•)>⌐■-■", "(⌐■_■)"],
            frame_length_ms: 500
        },
        dwell: 2000,
        depart: {
            transition: "fade",
            duration: 500
        }
    }
];
```

## Testing

The project includes a comprehensive test suite using Jest. Run tests with:

```bash
npm test
```

Tests cover:
- Scene element creation
- Animation handling
- Audio management
- Scene transitions
- Directives
- Error handling

## Browser Support

- Modern browsers with Web Audio API support
- jQuery 3.3.1 or later

## License

MIT License
