class Director {
	constructor(scenes) {
		this.screen = $('#screen');
		this.audioHandler = new AudioHandler();
		this.sceneHandler = new SceneHandler(this.screen, this.audioHandler);
		this.scenes = scenes;
	}

	getStartSceneIndex() {
		const urlParams = new URLSearchParams(window.location.search);
		const startScene = urlParams.get('start');
		if (startScene) {
			const index = parseInt(startScene);
			if (!isNaN(index) && index >= 0 && index < this.scenes.length) {
				logger.info(`Starting from scene ${index}`);
				return index;
			} else {
				logger.warn(`Invalid start scene index: ${startScene}`);
			}
		}
		return 0;
	}

	getSpeedMultiplier() {
		const urlParams = new URLSearchParams(window.location.search);
		const speed = urlParams.get('speed');
		if (speed) {
			const multiplier = parseFloat(speed);
			if (!isNaN(multiplier) && multiplier > 0) {
				logger.info(`Using speed multiplier: ${multiplier}`);
				return multiplier;
			} else {
				logger.warn(`Invalid speed multiplier: ${speed}`);
			}
		}
		return 1.0;
	}

	getDebugMode() {
		const urlParams = new URLSearchParams(window.location.search);
		const debug = urlParams.get('debug');
		if (debug === '3') return 'debug';
		if (debug === '2') return 'warn';
		if (debug === '1') return 'info';
		return 'error'; // Only show errors by default
	}

	async start() {
		logger.info('Director started');
		try {
			const startIndex = this.getStartSceneIndex();
			const speedMultiplier = this.getSpeedMultiplier();
			const debugLevel = this.getDebugMode();
			// Set the speed multiplier and debug level
			this.sceneHandler.setSpeedMultiplier(speedMultiplier);
			logger.setLevel(debugLevel);
			// Start scenes from the specified index, audio will be queued if not enabled
			await this.sceneHandler.playScenes(this.scenes, startIndex);
		} catch (error) {
			logger.error(`Fatal error in director: ${error.message}`);
		}
	}

	stop() {
		this.sceneHandler.stop();
	}
}

// Initialize and start the director when the document is ready
$(document).ready(() => {
	const director = new Director(window.scenes);
	director.start();
});
