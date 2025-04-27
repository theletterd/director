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

	async start() {
		logger.info('Director started');
		try {
			const startIndex = this.getStartSceneIndex();
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
