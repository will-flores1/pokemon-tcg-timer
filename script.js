class PokemonTimer {
	#timerElement;
	#startButton;
	#stopButton;
	#resetButton;
	#switchButton;
	#tickingSound;
	#timeSound;

	#TIMER_DURATION = 30;
	#AUTOMATE = true;
	#seconds;
	#timer;

	constructor() {
		this.#timerElement = document.getElementById("timer");
		this.#startButton = document.getElementById("start");
		this.#stopButton = document.getElementById("stop");
		this.#resetButton = document.getElementById("reset");
		this.#switchButton = document.getElementById("switch");
		this.#tickingSound = new Audio("../assets/tick.mp3");
		this.#timeSound = new Audio("../assets/time.mp3");
		this.#tickingSound.volume = 0.4;

		this.#seconds = this.#TIMER_DURATION;
		this.#timer = null;

		this.#updateTimer();
		this.#addEventListeners();
		this.#initializeVoiceCommands();
	}

	#initializeVoiceCommands() {
		if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
			const SpeechRecognition =
				window.SpeechRecognition || window.webkitSpeechRecognition;
			const recognition = new SpeechRecognition();

			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.lang = "en-US";

			recognition.onresult = (event) => {
				const result = event.results[event.results.length - 1];
				if (result.isFinal) {
					const transcript = result[0].transcript.trim().toLowerCase();
					if (transcript === "jarvis start") {
						this.#startButton.click();
					} else if (transcript === "jarvis stop") {
						this.#stopButton.click();
					} else if (transcript === "jarvis reset") {
						this.#resetButton.click();
					} else if (transcript === "jarvis switch") {
						this.#switchButton.click();
					}
				}
			};

			recognition.start();
		} else {
			alert("Speech recognition is not supported in this browser.");
		}
	}

	#updateTimer() {
		const minutes = Math.floor(this.#seconds / 60)
			.toString()
			.padStart(2, "0");
		const remainingSeconds = (this.#seconds % 60).toString().padStart(2, "0");
		this.#timerElement.textContent = `${minutes}:${remainingSeconds}`;
	}

	start() {
		this.#clearActiveStyles();
		this.#startButton.classList.add("active-button");
		clearInterval(this.#timer);
		this.#timer = setInterval(() => {
			this.#seconds--;
			this.#updateTimer();

			if (this.#seconds === 0) {
				this.#timeSound.play();
				clearInterval(this.#timer);
				if (this.#AUTOMATE) {
					this.#switchButton.click();
				}
			}

			if (this.#seconds <= 15) {
				this.#tickingSound.play();
			}
		}, 1000);
		setTimeout(() => this.#startButton.classList.remove("active-button"), 200);
	}

	stop() {
		this.#clearActiveStyles();
		this.#stopButton.classList.add("active-button");
		clearInterval(this.#timer);
		setTimeout(() => this.#stopButton.classList.remove("active-button"), 200);
	}

	reset() {
		this.#clearActiveStyles();
		this.#resetButton.classList.add("active-button");
		clearInterval(this.#timer);
		this.#seconds = this.#TIMER_DURATION;
		this.#updateTimer();
		setTimeout(() => this.#startButton.classList.remove("active-button"), 200);
	}

	switch() {
		this.#clearActiveStyles();
		this.#switchButton.classList.add("active-button");
		this.#seconds = this.#TIMER_DURATION;
		setTimeout(() => this.#switchButton.classList.remove("active-button"), 200);
		this.#updateTimer();
		this.#startButton.click();
	}

	#addEventListeners() {
		this.#startButton.addEventListener("click", () => this.start());
		this.#stopButton.addEventListener("click", () => this.stop());
		this.#resetButton.addEventListener("click", () => this.reset());
		this.#switchButton.addEventListener("click", () => this.switch());
	}

	#clearActiveStyles() {
		this.#startButton.classList.remove("active-button");
		this.#stopButton.classList.remove("active-button");
		this.#resetButton.classList.remove("active-button");
		this.#switchButton.classList.remove("active-button");
	}
}

new PokemonTimer();
