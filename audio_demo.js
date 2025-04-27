// A demo showcasing the audio capabilities of Director
// This tells a simple story with layered audio tracks

const scenes = [
    // Scene 1: Introduction with ambient background
    {
        text: "The Forest at Night",
        arrive: {
            transition: "type", 
            //ms_per_char: 50,
            audio: {
                trackId: "ambient",
                url: window.audioLibrary.trees.url,
                volume: 0.1,
                fadeIn: 1,
                loop: true
            }
        },
        dwell: 3000,
        depart: {
            transition: "fade",
            duration: 1000
        }
    },

    // Scene 2: Add crickets to the background
    {
        text: "Crickets chirp in the distance...",
        arrive: {
            transition: "type",
            ms_per_char: 50,
            audio: {
                trackId: "crickets",
                url: window.audioLibrary.crickets.url,
                volume: 0.2,
                fadeIn: 2,
                loop: true
            }
        },
        dwell: 3000,
        depart: {
            transition: "fade",
            duration: 2000
        }
    },

    // Scene 3: Add owl sound effect
    {
        text: "An owl hoots in the night...",
        arrive: {
            transition: "type",
            ms_per_char: 50,
            audio: {
                trackId: "owl",
                url: window.audioLibrary.owl.url,
                volume: 0.4,
                fadeIn: 1
            }
        },
        dwell: 3000,
        depart: {
            transition: "fade",
            duration: 2000
        }
    },

    // Scene 4: Add rustling leaves
    {
        text: "Something stirs in the darkness...",
        arrive: {
            transition: "type",
            ms_per_char: 50,
            audio: {
                trackId: "music",
                url: window.audioLibrary.music.url,
                volume: 0.3,
                fadeIn: 3,
                loop: true
            }
        },
        dwell: 4000,
        depart: {
            transition: "fade",
            duration: 2000
        }
    },

    // Scene 5: Add footsteps
    {
        text: "Footsteps approach...",
        arrive: {
            transition: "type",
            ms_per_char: 50,
            audio: {
                trackId: "footsteps",
                url: window.audioLibrary.footsteps.url,
                volume: 0.5,
                fadeIn: 0,
                loop: false
            }
        },
        dwell: 4000,  
        depart: {
            transition: "fade",
            duration: 1000
        }
    },

    // Scene 6: Stop footsteps immediately
    {
        directive: "fade_audio",
        trackId: "footsteps",
        duration: 1000,
    },

    // Scene 7: Fade out footsteps and add surprise sound
    {
        text: "Suddenly...",
        arrive: {
            transition: "type",
            ms_per_char: 30
        },
        dwell: 500,
        depart: {
            transition: "fade",
            duration: 1000,
            wait: true  // Explicitly ensure we wait for fade out
        }
    },

    // Scene 8: Wolf howl
    {
        text: "A lone wolf howls in the distance...",
        arrive: {
            transition: "type",
            ms_per_char: 50,
            audio: {
                trackId: "wolf",
                url: window.audioLibrary.wolf.url,
                volume: 0.5,
                fadeIn: 1
            }
        },
        dwell: 3000,
        depart: {
            transition: "fade",
            duration: 2000
        }
    },

    // Scene 9: Final scene with all remaining sounds
    {
        text: "The forest returns to its peaceful state...",
        arrive: {
            transition: "type",
            ms_per_char: 50
        },
        dwell: 1000,
        depart: {
            transition: "fade",
            duration: 5000,
            wait: false
        }
    },

    // Scene 10: Fade out all remaining sounds (duration in milliseconds)
    {
        directive: "fade_all_audio",
        duration: 5000,  
        //wait_for_fade: true  // Wait for the full fade duration
    },

    // Scene 11: Goodbye message
    {
        text: "Goodbye!",
        arrive: {
            transition: "fade",
            duration: 500,
            audio: {
                trackId: "goodbye",
                url: window.audioLibrary.owl.url,
                volume: 0.3,
                fadeIn: 0.5
            }
        },
        dwell: 2000,
        depart: {
            transition: "fade",
            duration: 3000
        }
    },

    // Scene 12: Clear everything
    {
        directive: "clear",
        dwell: 2000  // Short dwell since the fade is already complete
    }
]; 

// Expose scenes to window object
window.scenes = scenes; 