class Director {
	constructor(scenes) {
		this.screen = $('#screen');
		this.audioHandler = new AudioHandler();
		this.sceneHandler = new SceneHandler(this.screen, this.audioHandler);
		this.scenes = scenes;
	}

	async start() {
		logger.info('Director started');
		try {
			// Start scenes immediately, audio will be queued if not enabled
			await this.sceneHandler.playScenes(this.scenes);
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
