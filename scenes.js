var scenes = [
	{
		text: ".",
		arrive: {
			transition: "fade",
			duration: 600
		},
		dwell: 1000,
		depart: {
			transition: "fade",
			duration: 600,
			remove: true,
		}
	},
	{
		text: "What am I?",
		dwell: 1000,
		arrive: {
			transition: "fade",
			duration: 600
		},
		dwell: 1000,
		depart: {
			transition: "fade",
			duration: 600,
			remove: true,
		}

	},
	{
		text: "Where did I come from?",
		arrive: {
			transition: "show",
			duration: 600
		},
		dwell: 1000,
		depart: {
			transition: "fade",
			duration: 600,
			remove: true,
		}

	}
];
