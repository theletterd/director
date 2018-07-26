function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

console.log(scenes);

async function main(document) {
	screen = $('#screen');

	for (const scene of scenes) {
		scene_element = $(document.createElement('div'));
		scene_element.append(scene.text);
		scene_element.hide().appendTo(screen);


		arrival = scene.arrive;
		// arrival
		if scene.transition === "fadeIn") {
			scene_element.fadeIn(arrival.duration);
		}

		// dwell
		await sleep(scene.delay);

		//departure = scene.depart;
		// departure

	}

}


$(document).ready(function(){

	main(document);
});
