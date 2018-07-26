function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function main(document) {
	screen = $('#screen');

	for (const scene of scenes) {
		console.log(scene.text);
		scene_element = $(document.createElement('div'));
		scene_element.append(scene.text);
		scene_element.hide().appendTo(screen);


		arrival = scene.arrive;
		// arrival
		if (arrival.transition == "fade") {
		    scene_element.fadeIn(arrival.duration);
	    } else if (arrival.transition == "show" ) {
			scene_element.show();
	    } else if (arrival.transition == "type" ) {
			scene_element.show();
			text = scene.text;
			scene_element.empty();
			for (const character of text) {
				scene_element.append(character);
				await sleep(arrival.ms_per_char);
			}

		} else {
			scene_element.show();
		}


		// dwell
		await sleep(scene.dwell);

		// departure
		departure = scene.depart;
		if (departure.transition === "fade") {
		    scene_element.fadeOut(departure.duration);
			await sleep(departure.duration);
	    } else if (departure.transition === "hide" ) {
			scene_element.remove();
		} else {
			scene_element.remove();
		}

	}

}


$(document).ready(function(){
	main(document);
});
