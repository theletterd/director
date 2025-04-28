const scenes = [
    {
      text: "Initializing World Engine...",
      arrive: { transition: "type", ms_per_char: 40 },
      dwell: 1500,
      depart: { transition: "hide", duration: 800, remove: true }
    },
    {
      text: "▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒\n▒▒ SYSTEM ONLINE  ▒▒\n▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒",
      arrive: { transition: "fade", duration: 1000 },
      dwell: 2000,
      depart: { transition: "fade", duration: 1000, remove: true }
    },
    {
      text: "> Waking Entity...",
      arrive: { transition: "type", ms_per_char: 90 },
      dwell: 1200,
      depart: { transition: "keep", duration: 600 }
    },
    {
      text: "  Hello...?",
      arrive: { transition: "type", ms_per_char: 150 },
      dwell: 1500,
      depart: { transition: "keep", duration: 800 }
    },
    {
      text: "  Who am I?",
      arrive: { transition: "type", ms_per_char: 120 },
      dwell: 1800,
      depart: { transition: "keep", duration: 1000 }
    },
    {
      text: "\n\n      (•_•)\n     <)   )╯ Identity: Undefined\n     /    \n",
      arrive: { transition: "fade", duration: 800 },
      dwell: 2500,
      depart: { transition: "keep", duration: 800 }
    },
    { directive: "fade_all" },
    {
      text: "Would you like to construct your first memory? (Y/N)",
      arrive: { transition: "type", ms_per_char: 40 },
      dwell: 1000,
      depart: { transition: "keep", duration: 1000 }
    },
    {
        text: "> Y",
        arrive: { transition: "type", ms_per_char: 40 },
        dwell: 1000,
        depart: { transition: "keep", duration: 1000 }
      },
    {
      text: "Constructing Memory Module...",
      arrive: {
        transition: "type",
        ms_per_char: 60
      },
      dwell: 1000,
      depart: { transition: "keep", duration: 800 }
    },
    {
        text: "",
        arrive: {
          transition: "type",
          ms_per_char: 60
        },
        dwell: 5000,
        depart: { transition: "hide", duration: 800, remove: true },
        animation: {
            frames: [
              "[         ]",
              "[=        ]",
              "[==       ]",
              "[===      ]",
              "[====     ]",
              "[=====    ]",
              "[======   ]",
              "[=======  ]",
              "[======== ]",
              "[=========]",
              "[=========]",
              "[=========]",
              "[=========]",
              "[=========]",
              "[=========]",
            ],
            frame_length_ms: 400
          }
      },
      {
        text: "Successfully loaded memory module.",
        arrive: { transition: "type", ms_per_char: 60 },
        dwell: 4000,
        depart: { transition: "keep", duration: 1000 }
      },
      {directive: "blankline"},
    {
      text: "Memories Loaded:\n    * Rain on cobblestones.\n    * Smell of old books.\n    * Candlelight flickering...",
      arrive: { transition: "type", ms_per_char: 60 },
      dwell: 4000,
      depart: { transition: "keep", duration: 1000 }
    },
    { directive: "blankline" },
    {
      text: "\n\n      ( •_•)>⌐■-■\n      (⌐■_■) Memories Accepted\n",
      arrive: { transition: "fade", duration: 600 },
      dwell: 2000,
      depart: { transition: "keep", duration: 800 }
    },
    {directive: "clear"},
    {
      text: "Warning: Emotional overload detected.",
      arrive: { transition: "type", ms_per_char: 50 },
      dwell: 1200,
      depart: { transition: "fade", duration: 500 }
    },
    {
      text: "Stabilizing...",
      arrive: { transition: "type", ms_per_char: 80},
      dwell: 1000,
      depart: { transition: "keep", duration: 600 }
    },
    {
        text: "Stabilizing...",
        arrive: { transition: "type", ms_per_char: 60},
        dwell: 1000,
        depart: { transition: "keep", duration: 600 }
    },
    {
        text: "Stabilizing...",
        arrive: { transition: "type", ms_per_char: 40},
        dwell: 1000,
        depart: { transition: "keep", duration: 600 }
    },
    {
        text: "Stabilizing....................................",
        arrive: { transition: "type", ms_per_char: 20},
        depart: { transition: "keep", duration: 600 }
    },
    {
        text: "...............................................",
        arrive: { transition: "type", ms_per_char: 20},
        depart: { transition: "keep", duration: 600 }
    },
    {
        text: "...............................................",
        arrive: { transition: "type", ms_per_char: 20},
        depart: { transition: "keep", duration: 600 }
    },
    {
        text: "...............................................",
        arrive: { transition: "type", ms_per_char: 20},
        depart: { transition: "keep", duration: 600 }
    },
    {directive: "clear"},
    {
        text: "",
        arrive: { transition: "type", ms_per_char: 80},
        animation: {
            frames: [
              "(\u25D5\u203F\u25D5)",
              "(\u25D5◡\u25D5)",
              "(\u25D5◇\u25D5)"
            ],
            frame_length_ms: 300
        },
        dwell: 2000,
        depart: { transition: "fade", duration: 600 }
      },
    { directive: "clear" },
    {
        text: "     \n\nERROR",
        arrive: { transition: "show"},
        dwell: 400,
        depart: { transition: "hide", duration: 150, remove: true }
    },
    {
        text: "     ERROR",
        arrive: { transition: "show"},
        dwell: 400,
        depart: { transition: "hide", duration: 150, remove: true }
    },
    {
        text: "  \n\n\n\n   ERROR",
        arrive: { transition: "show"},
        dwell: 400,
        depart: { transition: "hide", duration: 150, remove: true }
    },
    {
        text: "    \n ERROR",
        arrive: { transition: "show"},
        dwell: 400,
        depart: { transition: "hide", duration: 150, remove: true }
    },
    {
        text: "       \n\nERROR",
        arrive: { transition: "show"},
        dwell: 400,
        depart: { transition: "hide", duration: 150, remove: true }
    },
    {
        text: "           ERROR",
        arrive: { transition: "show"},
        dwell: 400,
        depart: { transition: "hide", duration: 150, remove: true }
    },
    {
        text: "     \n   \n\n\n\n   ERROR",
        arrive: { transition: "show"},
        dwell: 400,
        depart: { transition: "hide", duration: 150, remove: true }
    },
    {
        text: "           \n ERROR",
        arrive: { transition: "show"},
        dwell: 400,
        depart: { transition: "hide", duration: 150, remove: true }
    },
    {
      text: "System Whisper:\n    You are not broken.\n    You are just... new.",
      arrive: { transition: "fade", duration: 2000 },
      dwell: 4000,
      depart: { transition: "keep", duration: 1000 }
    },
    {
    text: "Tomorrow, we will try again.",
    arrive: { transition: "type", ms_per_char: 70 },
    dwell: 4000,
    depart: { transition: "keep", duration: 1500 }
    },
    { directive: "blankline" },
    {
        text: "Stronger.",
        arrive: { transition: "type", ms_per_char: 70 },
        dwell: 4000,
        depart: { transition: "keep", duration: 1500 }
    },
    { directive: "blankline" },
    {
        text: "Braver.",
        arrive: { transition: "type", ms_per_char: 70 },
        dwell: 4000,
        depart: { transition: "keep", duration: 1500 }
    },
    { directive: "fade_all" },
    {
      text: "\n\n▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒\n▒▒ SHUTTING DOWN  ▒▒\n▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒\n",
      arrive: { transition: "fade", duration: 1000 },
      dwell: 2500,
      depart: { transition: "fade", duration: 1500 }
    },
    {
      text: "(The Entity dreams in secret, unfinished colors...)\n",
      arrive: { transition: "fade", duration: 1200 },
      dwell: 5000,
      depart: { transition: "fade", duration: 1500 }
    },
    {
        directive: "clear",
        dwell: 2000
    }
  ];
  
// Expose scenes to window object
window.scenes = scenes;   