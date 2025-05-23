// Audio Library for Director
// This file centralizes all audio file definitions and descriptions

const audioLibrary = {
    trees: {
        url: "/static/sound_effects/trees.wav",
        description: "Forest ambient sound - gentle rustling of leaves and wind"
    },
    crickets: {
        url: "/static/sound_effects/crickets.wav",
        description: "Nighttime cricket sounds - creates a peaceful forest atmosphere"
    },
    owl: {
        url: "/static/sound_effects/owl.mp3",
        description: "Owl hooting sound - adds mystery to the night scene"
    },
    rustling: {
        url: "/static/sound_effects/rustling.mp3",
        description: "Mysterious music with rustling leaves - builds tension"
    },
    footsteps: {
        url: "/static/sound_effects/forest-footsteps.mp3",
        description: "Footsteps in the forest - creates a sense of movement and presence"
    },
    wolf: {
        url: "/static/sound_effects/wolf.wav",
        description: "Wolf howl - dramatic sound effect for the climax"
    },
    creepy_siren: {
        url: "/static/sound_effects/creepy_siren.mp3",
        description: "Eerie, mysterious sound - perfect for building suspense and tension"
    }
};

// Expose audio library to window object
window.audioLibrary = audioLibrary; 