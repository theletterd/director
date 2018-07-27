var scenes = [
	/*
	{
		text: story_director,
		arrive: {
			transition: "fade",
			duration: 1000
		},
		dwell: 3000,
		depart: {
			transition: "keep",
			remove: false,
		}
	},
	{directive: "blankline"},
	{
		text: "Hi there!",
		arrive: {
			transition: "fade",
			duration: 2000,
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "blankline"},
	{
		text: "Let me tell you a story...",
		arrive: {
			transition: "fade",
			duration: 1000,
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "fade_all"},
	{
		text: "I'm Duncan! :D",
		arrive: {
			transition: "fade",
			duration: 1000,
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{
		text: duncan_2,
		arrive: {
			transition: "show",

		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{
		text: "       (That's me!)",
		arrive: {
			transition: "fade",
			duration: 500
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "clear"},
	{
		text: "I was looking for a way to tell stories in a simple, but compelling way...",
		arrive: {
			transition: "fade",
			duration: 2000
		},
		dwell: 3000,
		depart: {
			transition: "keep",
		}

	},
	{
		text: "So I built this!",
		arrive: {
			transition: "fade",
			duration: 2000
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}

	},
	{directive: "blankline"},
	{
		text: "StoryDirector - A limited toolkit for telling stories which gives you fine-grained control over things like...",
		arrive: {
			transition: "type",
			ms_per_char: 50,
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{
		text: "    * fading in text",
		arrive: {
			transition: "fade",
			duration: 500,
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}

	},
	{
		text: "    * typing animations",
		arrive: {
			transition: "type",
			ms_per_char: 100,
		},
		dwell: 2000,
		depart: {
			transition: "keep",
			duration: 500,
			remove: false,
		}
	},
	{
		text: "    * spacing things out in peculiar\n\
         ways\n\
            to allow you\n\
                  to\n\
                         get\n\
                                      your\n\
                                                   point\n\
                                                                across...\n\
",
		arrive: {
			transition: "show",
		},
		dwell: 4000,
		depart: {
			transition: "keep",
			remove: false,
		}
	},


	{
		text: "...and ascii animations",
		arrive: {
			transition: "type",
			ms_per_char: 20,
		},
		dwell: 2000,
		depart: {
			transition: "keep",
			duration: 1000,
			remove: false,
		}

	},
	{directive: "blankline"},
	{
		text: "Like this:",
		arrive: {
			transition: "show"
		},
		dwell: 1000,
		depart: {
			transition: "keep"
		}
	},
	{
		text: "",
		arrive: {
			transition: "fade",
			duration: 2000,
		},
		dwell: 5000,
		depart: {
			transition: "keep",
			duration: 2000,
			remove: false,
		},
		animation: {
			frames: boat_frames,
			frame_length_ms: 70
		}
	},
	{directive: "clear"},
	{
		text: "...or this:",
		arrive: {
			transition: "show"
		},
		dwell: 1000,
		depart: {
			transition: "keep"
		}
	},
	{
		text: "",
		arrive: {
			transition: "fade",
			duration: 2000,
		},
		dwell: 5000,
		depart: {
			transition: "keep",
			duration: 2000,
			remove: false,
		},
		animation: {
			frames: mountain_frames,
			frame_length_ms: 150
		}
	},
	{
		directive: "fade_all"
	},
	{
		text: how,
		arrive: {
			transition: "show"
		},
		dwell: 1500,
		depart: {
			transition: "keep"
		}

	},
	{directive: "blankline"},
	{directive: "blankline"},
	{
		text: "Each individual animation/element is a scene. This is a scene.",
		arrive: {
			transition: "show"
		},
		dwell: 3000,
		depart: {
			transition: "keep"
		}
	},
	{
		text: "And so is this.",
		arrive: {
			transition: "show"
		},
		dwell: 1500,
		depart: {
			transition: "keep"
		}
	},
	{
		text: "This is too.",
		arrive: {
			transition: "show"
		},
		dwell: 1500,
		depart: {
			transition: "keep"
		}
	},
	{directive: "blankline"},
	{directive: "blankline"},
	{
		text: "Scenes are defined by a number of things:",
		arrive: {
			transition: "fade",
			duration: 500
		},
		dwell: 1500,
		depart: {
			transition: "keep"
		}
	},
	{
		text: "    * text - the content of the scene",
		arrive: {
			transition: "fade",
			duration: 500
		},
		dwell: 3000,
		depart: {
			transition: "keep"
		}
	},
	{
		text: "    * arrive - the manner in which the text appears",
		arrive: {
			transition: "fade",
			duration: 500
		},
		dwell: 3000,
		depart: {
			transition: "keep"
		}
	},
	{
		text: "    * dwell - the time which the content is on the screen for before moving on",
		arrive: {
			transition: "fade",
			duration: 500
		},
		dwell: 3000,
		depart: {
			transition: "keep"
		}
	},
	{
		text: "    * depart - the manner in which the content disappears, if at all",
		arrive: {
			transition: "fade",
			duration: 500
		},
		dwell: 3000,
		depart: {
			transition: "keep"
		}
	},

	{directive: "fade_all"},
	{
		text: "Here's an example:\n\n\
{\n\
	text: \"This will fade in for half a second, dwell for 2 seconds, and the content will fade out over half a second.\",\n\
	arrive: {\n\
		transition: \"fade\",\n\
		duration: 500\n\
	},\n\
	dwell: 2000,\n\
	depart: {\n\
		transition: \"fade\",\n\
		duration: 500,\n\
	}\n\
},\n",
		arrive: {
			transition: "show",
		},
		dwell: 7000,
		depart: {
			transition: "keep"
		}
	},
	{directive: "blankline"},
	{directive: "blankline"},
	{
		text: "This will fade in for half a second, dwell for 2 seconds, and the content will fade out over half a second.",
		arrive: {
			transition: "fade",
			duration: 500
		},
		dwell: 2000,
		depart: {
			transition: "fade",
			duration: 500,
		}
	},
	{directive: "blankline"},
	{directive: "blankline"},
	{
		text: "Easy, right?",
		arrive: {
			transition: "fade",
			duration: 1000,
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "fade_all"},
	{
		text: "Let's try another one:\n\n\
{\n\
	text: \"This will use the typing animation, hang out for 3 seconds, and then disappear.\"\n\
	arrive: {\n\
		transition: \"type\",\n\
		ms_per_char: 20\n\
	},\n\
	dwell: 3000,\n\
	depart: {\n\
		transition: \"hide\",\n\
		remove: true\n\
	}\n\
},\n",
		arrive: {
			transition: "show",
		},
		dwell: 7000,
		depart: {
			transition: "keep"
		}
	},
	{directive: "blankline"},
	{directive: "blankline"},
	{
		text: "This will use the typing animation, hang out for 3 seconds, and then disappear.",
		arrive: {
			transition: "type",
			ms_per_char: 20
		},
		dwell: 3000,
		depart: {
			transition: "hide",
			remove: true
		}
	},
	{
		text: "Simple!",
		arrive: {
			transition: "fade",
			duration: 1000,
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "blankline"},
	{
		text: "But hey... what's that \"remove: true\" statement for?" ,
		arrive: {
			transition: "fade",
			duration: 1000,
		},
		dwell: 5000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "clear"},
	*/
	{
		text: "GOOD QUESTION!" ,
		arrive: {
			transition: "fade",
			duration: 1000,
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{
		text: "When we get rid of an element by fading or hiding it, we want the option to play with positioning." ,
		arrive: {
			transition: "type",
			ms_per_char: 50,
		},
		dwell: 3000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "blankline"},
	{
		text: "For example, maybe we want this to disappear and have text appear in the same place",
		arrive: {
			transition: "type",
			ms_per_char: 50,
		},
		dwell: 3000,
		depart: {
			transition: "hide",
			remove: true,
		}
	},
	{
		text: "Like this!",
		arrive: {
			transition: "type",
			ms_per_char: 50,
		},
		dwell: 2000,
		depart: {
			transition: "hide",
			remove: true,
		}
	},
	{
		text: "This gives us some flexibility.",
		arrive: {
			transition: "type",
			ms_per_char: 50,
		},
		dwell: 3000,
		depart: {
			transition: "hide",
			remove: true,
		}
	},
	{directive: "blankline"},
	{
		text: "If we don't remove the div, we get to preserve the layout.",
		arrive: {
			transition: "fade",
			duration: 1000,
		},
		dwell: 2000,
		depart: {
			transition: "fade",
			duration: 500,
			remove: false,
		}
	},
	{
		text: "This can be useful to give a sense of progression...",
		arrive: {
			transition: "fade",
			duration: 1000,
		},
		dwell: 2000,
		depart: {
			transition: "fade",
			duration: 500,
			remove: false,
		}
	},
	{
		text: "Moving the story along...",
		arrive: {
			transition: "fade",
			duration: 1000,
		},
		dwell: 2000,
		depart: {
			transition: "fade",
			duration: 500,
			remove: false,
		}
	},
	{
		text: "Combine that with some spacing...",
		arrive: {
			transition: "fade",
			duration: 1000,
		},
		dwell: 2000,
		depart: {
			transition: "fade",
			duration: 2000,
			remove: false,
		}
	},
	{
		text: "    ...and things can get...",
		arrive: {
			transition: "fade",
			duration: 1000,
		},
		dwell: 2000,
		depart: {
			transition: "fade",
			duration: 2000,
			remove: false,
		}
	},
	{
		text: "         ...slightly more interesting.",
		arrive: {
			transition: "fade",
			duration: 1000,
		},
		dwell: 2000,
		depart: {
			transition: "fade",
			duration: 2000,
			remove: false,
		}
	},
	{directive: "clear"},
	// talk about animation

	// talk about directives
];
