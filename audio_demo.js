// A demo showcasing the audio capabilities of Director
// This tells a simple story with layered audio tracks

const scenes = [
    // Scene 1: Introduction with ambient background
    {
        text: "The Forest at Night",
        arrive: {
            transition: "type", 
            audio: {
                trackId: "trees",
                volume: 0.05,
                fadeIn: 1000,
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
                volume: 0.2,
                fadeIn: 2000,
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
                volume: 0.4,
                fadeIn: 1000,
                pan: -0.9
            }
        },
        dwell: 3000,
        depart: {
            transition: "fade",
            duration: 2000
        }
    },

    // Scene 3.5: Creepy siren with fade in/out
    {
        text: "A mysterious sound grows louder...",
        arrive: {
            transition: "type",
            ms_per_char: 50,
            audio: {
                trackId: "creepy_siren",
                volume: 0.5,
                fadeIn: 2500
            }
        },
        dwell: 2000,
        depart: {
            transition: "fade",
            duration: 1000,
            audio: {
                trackId: "creepy_siren",
                fadeOut: 7000
            },
            wait_for_audio: false
        }
    },

    // Scene 4: Add rustling leaves
    {
        text: "Something stirs in the darkness...",
        arrive: {
            transition: "type",
            ms_per_char: 50,
            audio: {
                trackId: "rustling",
                volume: 1.5,
                offset: 3000,
                fadeIn: 500,
                pan: 1.0 // happening on the right
            }
        },
        dwell: 4000,
        depart: {
            transition: "fade",
            duration: 500,
            audio: {
                trackId: "rustling",
                fadeOut: 5000
            },
            wait_for_audio: false
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
                volume: 0.5,
                fadeIn: 500,
                pan: -0.4,
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
            wait: true
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
                volume: 0.5,
                fadeIn: 1000
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

    // Scene 10: Fade out all remaining sounds
    {
        directive: "fade_all_audio",
        duration: 5000
    },

    // Scene 11: Goodbye message
    {
        text: "Goodbye!",
        arrive: {
            transition: "fade",
            duration: 500,
            audio: {
                trackId: "owl",
                volume: 0.3,
                fadeIn: 500
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
        dwell: 2000
    }
]; 

// Expose scenes to window object
window.scenes = scenes; 