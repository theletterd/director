// Entry point: reads URL options and plays window.scenes (set by the story file).
//
//   ?start=N   start from scene N (0-based)
//   ?speed=X   play X times faster (e.g. 4 while authoring)
//   ?debug=1-3 log level: 1 info, 2 warn, 3 debug (errors are always logged)

class Director {
	constructor(scenes) {
		this.scenes = scenes || [];
		this.params = new URLSearchParams(window.location.search);
		this.audioHandler = new AudioHandler();
		this.sceneHandler = new SceneHandler($('#screen'), this.audioHandler);
	}

	getStartSceneIndex() {
		const start = this.params.get('start');
		if (start === null) return 0;
		const index = parseInt(start, 10);
		if (!isNaN(index) && index >= 0 && index < this.scenes.length) return index;
		logger.warn(`Invalid start scene index: ${start}`);
		return 0;
	}

	getSpeedMultiplier() {
		const speed = this.params.get('speed');
		if (speed === null) return 1;
		const multiplier = parseFloat(speed);
		if (!isNaN(multiplier) && multiplier > 0) return multiplier;
		logger.warn(`Invalid speed multiplier: ${speed}`);
		return 1;
	}

	getLogLevel() {
		return { '1': 'info', '2': 'warn', '3': 'debug' }[this.params.get('debug')] || 'error';
	}

	start() {
		logger.setLevel(this.getLogLevel());
		this.sceneHandler.setSpeedMultiplier(this.getSpeedMultiplier());
		logger.info('Director started');
		return this.sceneHandler.start(this.scenes, this.getStartSceneIndex())
			.catch(error => logger.error('Fatal error in director:', error));
	}

	stop() {
		this.sceneHandler.stop();
	}
}

$(() => {
	window.director = new Director(window.scenes);
	window.director.start();
});
