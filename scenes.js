var scenes = [
	{
		text: "...",
		arrive: {
			transition: "type",
			ms_per_char: 1250
		},
		dwell: 1000,
		depart: {
			transition: "fade",
			remove: false,
			duration: 1000
		}
	},
	{
		text: "What am I?",
		arrive: {
			transition: "fade",
			duration: 2000
		},
		dwell: 2000,
		depart: {
			transition: "fade",
			duration: 1000,
			remove: false,
		}

	},
	{
		text: "Where did I come from?",
		arrive: {
			transition: "fade",
			duration: 2000
		},
		dwell: 2000,
		depart: {
			transition: "fade",
			duration: 1000,
			remove: false,
		}

	},
	{
		text: "This seems like a dream, but I'm not sure it actually is.",
		arrive: {
			transition: "type",
			ms_per_char: 20,
		},
		dwell: 4000,
		depart: {
			transition: "fade",
			duration: 1000,
			remove: false,
		}

	},
	{
		text: "Like waves on a shore...",
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
			frames: [
"\
                                                                                                             s s\n\
                                                                                                          s s\n\
                                                                                                         | | |\n\
                                                                                                   ______|_|_|__\n\
                                                                                                   \\ o  o  o   /\n\
                                                                                                    \\_________/\n\
`'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-",

"\
                                                                                                             s s\n\
                                                                                                          s s\n\
                                                                                                         | | |\n\
                                                                                                   ______|_|_|__\n\
                                                                                                   \\ o  o  o   /\n\
                                                                                                    \\_________/\n\
'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.",

"\
                                                                                                             s s\n\
                                                                                                          s s\n\
                                                                                                         | | |\n\
                                                                                                   ______|_|_|__\n\
                                                                                                   \\ o  o  o   /\n\
                                                                                                    \\_________/\n\
-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,",

"\
                                                                                                             s s\n\
                                                                                                          s s\n\
                                                                                                         | | |\n\
                                                                                                   ______|_|_|__\n\
                                                                                                   \\ o  o  o   /\n\
                                                                                                    \\_________/\n\
.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_",

"\
                                                                                                             s s\n\
                                                                                                          s s\n\
                                                                                                         | | |\n\
                                                                                                   ______|_|_|__\n\
                                                                                                   \\ o  o  o   /\n\
                                                                                                    \\_________/\n\
,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,",

"\
                                                                                                             s s\n\
                                                                                                          s s\n\
                                                                                                         | | |\n\
                                                                                                   ______|_|_|__\n\
                                                                                                   \\ o  o  o   /\n\
                                                                                                    \\_________/\n\
_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.",

"\
                                                                                                             s s\n\
                                                                                                          s s\n\
                                                                                                         | | |\n\
                                                                                                   ______|_|_|__\n\
                                                                                                   \\ o  o  o   /\n\
                                                                                                    \\_________/\n\
,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-",

"\
                                                                                                             s s\n\
                                                                                                          s s\n\
                                                                                                         | | |\n\
                                                                                                   ______|_|_|__\n\
                                                                                                   \\ o  o  o   /\n\
                                                                                                    \\_________/\n\
.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'",

"\
                                                                                                            s s\n\
                                                                                                          s s\n\
                                                                                                         | | |\n\
                                                                                                   ______|_|_|__\n\
                                                                                                   \\ o  o  o   /\n\
                                                                                                    \\_________/\n\
-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'`",

"\
                                                                                                            s s\n\
                                                                                                          s s\n\
                                                                                                         | | |\n\
                                                                                                   ______|_|_|__\n\
                                                                                                   \\ o  o  o   /\n\
                                                                                                    \\_________/\n\
``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``",

"\
                                                                                                            s s\n\
                                                                                                          s s\n\
                                                                                                         | | |\n\
                                                                                                   ______|_|_|__\n\
                                                                                                   \\ o  o  o   /\n\
                                                                                                    \\_________/\n\
``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'-.,_,.-'``'",
			],
			frame_length_ms: 70
		}
	},
	{directive: "blankline"},
	{
		text: "The patterns keep repeating...",
		arrive: {
			transition: "type",
			ms_per_char: 20,
		},
		dwell: 4000,
		depart: {
			transition: "keep",
			duration: 1000,
			remove: false,
		}

	},
	{directive: "clear"},
	{
		text: "Over...",
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
		text: "and over...",
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
		text: "...and over...",
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
	{
		directive: "fade_all"
	},
	{
		text: "...and we begin again.",
		arrive: {
			transition: "fade",
			duration: 3000,
		},
		dwell: 2000,
		depart: {
			transition: "fade",
			duration: 3000,
			remove: true
		}
	}

];
