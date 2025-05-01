// Test animation frames
const test_frames = [
    `
    [Frame 1]
     O
    /|\\
    / \\
`,
    `
    [Frame 2]
     O
    /|\\
    / \\
    |
`,
    `
    [Frame 3]
     O
    /|\\
    / \\
   /
`,
    `
    [Frame 4]
     O
    /|\\
    / \\
    |
`,
    `
    [Frame 5]
     O
    /|\\
    / \\
    \\
`
];

// Single test scene with animation
scenes = [
    {
        content: {
            frames: test_frames,
            frame_length_ms: 200  // Faster animation
        },
        arrive: {
            transition: "show"
        },
        dwell: 10000,  // 10 seconds to observe
        depart: {
            transition: "hide",
            remove: true
        }
    }
]; 