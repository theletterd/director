var scenes = [
    // Simple screen color transition
    {
        directive: "color",
        target: "screen",
        background: "#000000",
        duration: 4000
    },
    {
        content: "Screen Color Transition",
        arrive: {
            transition: "type",
            ms_per_char: 50
        },
        dwell: 2000
    },
    {
        directive: "color",
        target: "screen",
        background: "#ffffff",
        text: "#000000",
        duration: 1000
    },
    {
        directive: "clear"
    },

    // Both screen and body gradient (seamless)
    {
        directive: "color",
        target: "both",
        background: {
            gradient: {
                type: "linear",
                direction: "to right",
                stops: [
                    { color: "#ff0000", position: "0%" },
                    { color: "#00ff00", position: "50%" },
                    { color: "#0000ff", position: "100%" }
                ]
            }
        },
        text: "#ffffff",
        duration: 2000
    },
    {
        content: "Seamless Gradient on Both Screen and Body",
        arrive: {
            transition: "type",
            ms_per_char: 50
        },
        dwell: 2000
    },
    {
        directive: "clear"
    },

    // Async gradient on both (seamless)
    {
        directive: "color",
        target: "both",
        background: {
            gradient: {
                type: "linear",
                direction: "to bottom",
                async: true,
                stops: [
                    { color: "#ff0000", position: "0%", duration: 1000 },
                    { color: "#00ff00", position: "50%", duration: 2000 },
                    { color: "#0000ff", position: "100%", duration: 3000 }
                ]
            }
        },
        text: "#ffffff"
    },
    {
        content: "Seamless Async Gradient on Both",
        arrive: {
            transition: "type",
            ms_per_char: 50
        },
        dwell: 4000
    },
    {
        directive: "clear"
    },

    // Radial gradient on both (seamless)
    {
        directive: "color",
        target: "both",
        background: {
            gradient: {
                type: "radial",
                direction: "circle at center",
                stops: [
                    { color: "#ff0000", position: "0%" },
                    { color: "#000000", position: "100%" }
                ]
            }
        },
        text: "#ffffff",
        duration: 2000
    },
    {
        content: "Seamless Radial Gradient on Both",
        arrive: {
            transition: "type",
            ms_per_char: 50
        },
        dwell: 2000
    },
    {
        directive: "clear"
    },

    // Text color transition on both
    {
        directive: "color",
        target: "both",
        background: "#000000",
        text: "#ff0000",
        duration: 2000
    },
    {
        content: "Text Color Transition on Both",
        arrive: {
            transition: "type",
            ms_per_char: 50
        },
        dwell: 2000
    },
    {
        directive: "color",
        target: "both",
        text: "#00ff00",
        duration: 2000
    },
    {
        dwell: 2000
    },
    {
        directive: "clear"
    },

    // Final transition back to black
    {
        directive: "color",
        target: "both",
        background: "#000000",
        text: "#ffffff",
        duration: 2000
    }
];
