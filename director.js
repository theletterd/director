class Director {
	constructor() {
		this.screen = $('#screen');
		this.audioHandler = new AudioHandler();
		this.sceneHandler = new SceneHandler(this.screen, this.audioHandler);
	}

	async start() {
		logger.info('Director started');
		try {
			// Start scenes immediately, audio will be queued if not enabled
			await this.sceneHandler.playScenes(scenes);
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
	const director = new Director();
	director.start();
});
