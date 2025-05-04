var scenes = [
    {
        content: "Now let's play with colours!",
        arrive: {
            transition: "type",
            ms_per_char: 50
        },
        dwell: 2000,
        depart: {
            transition: "fade",
            duration: 1000,
            remove: true
        }
    },
    {
        content: "First we'll fade the background colour to black, synchronously.",
        arrive: {
            transition: "type",
            ms_per_char: 50
        },
        dwell: 2000
    },
    {
        directive: "color",
        target: "background",
        background: "#000000",
        duration: 2000,
        async: false
    },
    {
        directive: "clear"
    },
    {
        content: "Now we'll fade the background asynchronously.",
        arrive: {
            transition: "type",
            ms_per_char: 50
        },
        dwell: 2000
    },
    {
        directive: "color",
        target: "background",
        background: "#87CEEB",
        duration: 5000,
        async: true
    },
    {
        content: "Typing...",
        arrive: {
            transition: "type",
            ms_per_char: 50
        },
        dwell: 1000
    },
    {
        content: "Typing...",
        arrive: {
            transition: "type",
            ms_per_char: 50
        },
        dwell: 1000
    },
    {
        content: "Typing...!",
        arrive: {
            transition: "type",
            ms_per_char: 50
        },
        dwell: 2000
    },
    {
        directive: "fade_out"
    },
    {
        directive: "color",
        target: "both",
        background: "radial-gradient(circle at center, #FFFFFF 0%, #000000 100%)",
        duration: 3000,
        async: false
    },
    {
        content: "TYPINGGGGGGG",
        arrive: {
            transition: "type",
            ms_per_char: 50
        },
        dwell: 20000
    },
];