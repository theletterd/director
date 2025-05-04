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
    }
];