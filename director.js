function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function main(document) {
	screen = $('#screen');

	for (const scene of scenes) {
		if ("directive" in scene) {
			if (scene.directive === "clear") {
				$("#screen").empty();
			} else if (scene.directive === "blankline"){
				scene_element = $(document.createElement('div'));
				scene_element.appendTo(screen);
			}
			continue;
		}

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

		// animate
		if ("animation" in scene) {
			numFrames = scene.animation.frames.length;
			that = scene_element;
			animation_func = async function(frames, frame_num, that) {
				that.empty();
				that.append(frames[frame_num]);
				await sleep(scene.animation.frame_length_ms);
				next_frame = (frame_num + 1) % frames.length;
				if (that.is(":visible")) {
					setTimeout(animation_func, scene.animation.frame_length_ms, frames, next_frame, that);
				}
			};

			animation_func(scene.animation.frames, 0, that);
		}


		// dwell
		await sleep(scene.dwell);

		// departure
		departure = scene.depart;
		if (departure.remove === true) {
			if (departure.transition === "hide") {
				scene_element.remove();
			}
			if (departure.transition === "fade") {
				that = scene_element;
				scene_element.fadeOut(departure.duration, function() {
					that.remove();
				});
			}
		} else {
			if (departure.transition === "hide") {
				scene_element.empty();
				scene_element.append(" ");
			} else if (departure.transition === "fade") {
				that = scene_element
				scene_element.fadeOut(departure.duration, function() {
					that.show();
					that.empty();
				});
			} else if (departure.transition === "keep") {
				continue;
			}

		}
	}

}


$(document).ready(function(){
	main(document);
});
