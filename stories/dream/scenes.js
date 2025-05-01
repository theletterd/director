var scenes = [
	{
		content: {
			frames: mountain_frames,
			frame_length_ms: 500
		},
		arrive: {
			transition: "fade",
			duration: 2000,
		},
		dwell: 5000,
		depart: {
			transition: "fade",
			duration: 4000,
			remove: false,
		}
	},
	{directive: "clear"},
	{
		content: "...",
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
		content: "What am I?",
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
		content: "   Where did I come from?",
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
		content: "Is this a dream?",
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
	{directive: "fade_all"},
	{
		content: "This seems like a dream, but I'm not sure it actually is.",
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
		content: "Like waves on a shore...",
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
	{directive: "blankline"},
	{
		content: "The patterns keep repeating...",
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
		content: "Over...",
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
		content: "and over...",
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
		content: "...and over...",
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
	{directive: "fade_all"},
	{
		content: "What am I?",
		arrive: {
			transition: "fade",
			duration: 2000
		},
		dwell: 2000,
		depart: {
			transition: "fade",
			duration: 1000,
			remove: true,
		}
	},
	{directive: "fade_all"},
	{
		content: "I AM A DINOSAUR!",
		arrive: {
			transition: "show",
		},
		dwell: 0,
		depart: {
			transition: "keep",
		}
	},
	{
		content: {
			frames: dinosaur_frames,
			frame_length_ms: 50
		},
		arrive: {
			transition: "show",
		},
		dwell: 5000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "fade_all"},
	{
		content: "...and we begin again.",
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
	},
	{directive: "fade_all"},
];
