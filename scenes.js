var scenes = [
	{
		text: ".",
		arrive: {
			transition: "fade",
			duration: 1000
		},
		dwell: 2000,
		depart: {
			transition: "fade",
			duration: 600,
			remove: true,
		}
	},
	{
		text: "What am I?",
		arrive: {
			transition: "fade",
			duration: 1000
		},
		dwell: 2000,
		depart: {
			transition: "fade",
			duration: 1000,
			remove: true,
		}

	},
	{
		text: "Where did I come from?",
		arrive: {
			transition: "fade",
			duration: 1000
		},
		dwell: 2000,
		depart: {
			transition: "fade",
			duration: 1000,
			remove: true,
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
			remove: true,
		}

	}

];
