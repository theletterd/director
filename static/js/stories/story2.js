scenes = [
	{
		content: "Hey buddy, you ok?",
		arrive: {
			transition: "type",
			ms_per_char: 50,
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "blankline"},
	{
		content: "...",
		arrive: {
			transition: "type",
			ms_per_char: 200,
		},
		dwell: 2000,
		depart: {
			transition: "keep",
		}
	},
	{directive: "blankline"},
	{
		content: "Hey buddy...?",
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
		content: {
			frames: hey_frames,
			frame_length_ms: 50
		},
		arrive: {
			transition: "show"
		},
		dwell: 5000,
		depart: {
			transition: "hide",
			remove: true
		}
	}
];
