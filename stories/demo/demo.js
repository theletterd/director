var scenes = [
	{
		content: story_director,
		arrive: {
			transition: "fade",
			duration: 1000
		},
		dwell: 3000,
		depart: {
			transition: "keep"
		}
	},
	{directive: "blankline"},
	{
		content: "Hi there!",
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
		content: "Let me tell you a story...",
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
		content: "I'm Duncan! :D",
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
		content: duncan_2,
		arrive: {
			transition: "show",
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{
		content: "       (That's me!)",
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
		content: "I was looking for a way to tell stories in a simple, but compelling way...",
		arrive: {
			transition: "fade",
			duration: 1000
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{
		content: "So I built this!",
		arrive: {
			transition: "fade",
			duration: 1000
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "blankline"},
	{
		content: "StoryDirector - A limited toolkit for telling stories which gives you fine-grained control over things like...",
		arrive: {
			transition: "type",
			ms_per_char: 25,
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{
		content: "    * fading in text",
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
		content: "    * typing animations",
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
		content: "    * spacing things out in peculiar\n\
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
		content: "...and ascii animations",
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
		content: "Like this:",
		arrive: {
			transition: "show"
		},
		dwell: 1000,
		depart: {
			transition: "keep"
		}
	},
	{
		content: {
			frames: boat_frames,
			frame_length_ms: 70
		},
		arrive: {
			transition: "fade",
			duration: 2000,
		},
		dwell: 5000,
		depart: {
			transition: "keep",
			duration: 2000,
			remove: false,
		}
	},
	{
		directive: "fade_all"
	},
	{
		content: how,
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
		content: "Each individual animation/element is a scene. This is a scene.",
		arrive: {
			transition: "show"
		},
		dwell: 3000,
		depart: {
			transition: "keep"
		}
	},
	{
		content: "And so is this.",
		arrive: {
			transition: "show"
		},
		dwell: 1500,
		depart: {
			transition: "keep"
		}
	},
	{
		content: "This is too.",
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
		content: "Scenes are defined by a number of things:",
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
		content: "    * content - the content of the scene",
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
		content: "    * arrive - the manner in which the text appears",
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
		content: "    * dwell - the time which the content is on the screen for before moving on",
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
		content: "    * depart - the manner in which the content disappears, if at all",
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
		content: "Here's an example:\n\n\
{\n\
	content: \"This will fade in for half a second, dwell for 2 seconds, and the content will fade out over half a second.\",\n\
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
		content: "This will fade in for half a second, dwell for 2 seconds, and the content will fade out over half a second.",
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
		content: "Easy, right?",
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
		content: "Let's try another one:\n\n\
{\n\
	content: \"This will use the typing animation, hang out for 3 seconds, and then disappear.\"\n\
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
		content: "This will use the typing animation, hang out for 3 seconds, and then disappear.",
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
		content: "Simple!",
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
		content: "But hey... what's that \"remove: true\" statement for?" ,
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
	{
		content: "GOOD QUESTION!" ,
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
		content: "When we get rid of an element by fading or hiding it, we want the option to play with positioning." ,
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
		content: "For example, maybe we want this to disappear and have text appear in the same place",
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
		content: "Like this!",
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
		content: "This gives us some flexibility.",
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
		content: "If we don't remove the div, we get to preserve the layout.",
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
		content: "This can be useful to give a sense of progression...",
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
		content: "Moving the story along...",
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
		content: "Combine that with some spacing...",
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
		content: "    ...and things can get...",
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
	{
		content: "         ...slightly more interesting.",
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
	{
		content: {
			frames: animation_frames,
			frame_length_ms: 150
		},
		arrive: {
			transition: "fade",
			duration: 1000,
		},
		dwell: 3000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "blankline"},
	{directive: "blankline"},
	{directive: "blankline"},
	{
		content: "Animations are defined pretty simply too - you just need an 'animation' element\n\
which defines the frames, and the number of milliseconds per frame.\n\ne.g.:",
		arrive: {
			transition: "type",
			ms_per_char: 25,
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "blankline"},
	{
		content: "\
{\n\
	content: {\n\
		frames: [\"\\\\o\\\\\", \"|o|\", \"/o/\", \"|o|\"],\n\
		frame_length_ms: 75\n\
	},\n\
	arrive: {\n\
		transition: \"show\",\n\
	},\n\
	dwell: 3000,\n\
	depart: {\n\
		transition: \"keep\",\n\
	}\n\
}\n\
",
		arrive: {
			transition: "fade",
			duration: 2000
		},
		dwell: 4000,
		depart: {
			transition: "keep",
		},
	},
	{directive: "blankline"},
	{directive: "blankline"},
	{
		content: {
			frames: ["\\o\\", "|o|", "/o/", "|o|"],
			frame_length_ms: 75
		},
		arrive: {
			transition: "show",
		},
		dwell: 3000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "blankline"},
	{
		content: "EASY!",
		arrive: {
			transition: "show",
		},
		dwell: 3000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "fade_all"},
	{
		content: "And lastly, for ease of use, there are some directives:",
		arrive: {
			transition: "type",
			ms_per_char: 25
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "blankline"},
	{directive: "blankline"},
	{
		content: "{directive: \"blankline\"}",
		arrive: {
			transition: "type",
			ms_per_char: 25
		},
		dwell: 1000,
		depart: {
			transition: "keep",
		}
	},
	{
		content: "* shorthand for inserting a blank line",
		arrive: {
			transition: "fade",
			duration: 500
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "blankline"},
	{directive: "blankline"},
	{
		content: "{directive: \"clear\"}",
		arrive: {
			transition: "type",
			ms_per_char: 25
		},
		dwell: 1000,
		depart: {
			transition: "keep",
		}
	},
	{
		content: "* removes everything from the screen immediately",
		arrive: {
			transition: "fade",
			duration: 500
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "blankline"},
	{directive: "blankline"},
	{
		content: "{directive: \"fade_all\"}",
		arrive: {
			transition: "type",
			ms_per_char: 25
		},
		dwell: 1000,
		depart: {
			transition: "keep",
		}
	},
	{
		content: "* also removes everything from the screen, but using a fade",
		arrive: {
			transition: "fade",
			duration: 500
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "fade_all"},
	{
		content: "That's all!!!",
		arrive: {
			transition: "fade",
			duration: 500
		},
		dwell: 500,
		depart: {
			transition: "keep",
		}
	},
	{
		content: "Thanks for reading :)",
		arrive: {
			transition: "fade",
			duration: 500
		},
		dwell: 4000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "clear"}
];
