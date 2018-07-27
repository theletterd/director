scenes = [
	{
		text: "Hey buddy, you ok?",
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
		text: "...",
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
		text: "Hey buddy...?",
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
		text: "",
		arrive: {
			transition: "show"
		},
		dwell: 5000,
		depart: {
			transition: "hide",
			remove: true
		},
		animation: {
			frames: hey_frames,
			frame_length_ms: 50
		}
	},

];
