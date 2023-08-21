class PokemonTimer {
	#timerElement;
	#startButton;
	#stopButton;
	#resetButton;
	#switchButton;
	#tickingSound;
	#timeSound;
	#timeSound2;
	#timeSound3;
	#timeSound4;
	#timeSound5;
	#timeSound6;
	#timeSound7;
	#timeSound8;
	#deploySite;

	#TIMER_DURATION = 92;
	#AUTOMATE = true;
	#seconds;
	#timer;

	constructor() {
		this.#startButton = document.getElementById("start");
		this.#stopButton = document.getElementById("stop");

		this.#timerElement = document.getElementById("timer");
		this.#resetButton = document.getElementById("reset");
		this.#switchButton = document.getElementById("switch");
		this.#deploySite = "https://will-flores1.github.io/pokemon-turn-timer";
		this.#tickingSound = new Audio(`${this.#deploySite}/assets/tick.mp3`);
		this.#timeSound = new Audio(`${this.#deploySite}/assets/time.mp3`);
		this.#timeSound2 = new Audio(`${this.#deploySite}/assets/time2.mp3`);
		this.#timeSound3 = new Audio(`${this.#deploySite}/assets/time3.mp3`);
		this.#timeSound4 = new Audio(`${this.#deploySite}/assets/time4.mp3`);
		this.#timeSound5 = new Audio(`${this.#deploySite}/assets/time5.mp3`);
		this.#timeSound6 = new Audio(`${this.#deploySite}/assets/time6.mp3`);
		this.#timeSound7 = new Audio(`${this.#deploySite}/assets/time7.mp3`);
		this.#timeSound8 = new Audio(`${this.#deploySite}/assets/pentakill.mp3`);

		this.#seconds = this.#TIMER_DURATION;
		this.#timer = null;

		this.#updateTimer();
		this.#addEventListeners();
		this.#initializeVoiceCommands();
	}

	#initializeVoiceCommands() {
		if (
			"SpeechRecognition" in window ||
			"webkitSpeechRecognition" in window
		) {
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
					console.log(transcript);
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

	getRandomInt() {
		return Math.floor(Math.random() * 7) + 1;
	}

	playTimeSound() {
		const randomInt = this.getRandomInt();

		switch (randomInt) {
			case 1:
				this.#timeSound.play();
				break;
			case 2:
				this.#timeSound2.play();
				break;
			case 3:
				this.#timeSound3.play();
				break;
			case 4:
				this.#timeSound4.play();
				break;
			case 5:
				this.#timeSound5.play();
				break;
			case 6:
				this.#timeSound6.play();
				break;
			case 7:
				this.#timeSound7.play();
				break;
			case 8:
				this.#timeSound8.play();
			default:
				break;
		}
	}

	start() {
		this.#clearActiveStyles();
		this.#startButton.classList.add("active-button");
		clearInterval(this.#timer);
		this.#timer = setInterval(() => {
			this.#seconds--;
			this.#updateTimer();

			if (this.#seconds === 0) {
				this.playTimeSound();
				// new Audio(`${this.#deploySite}/assets/time.mp3`).play();
				clearInterval(this.#timer);
				if (this.#AUTOMATE) {
					this.#switchButton.click();
				}
			}

			if (this.#seconds <= 15) {
				this.#tickingSound.play();
			}
		}, 1000);
		setTimeout(
			() => this.#startButton.classList.remove("active-button"),
			200
		);
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
		setTimeout(
			() => this.#startButton.classList.remove("active-button"),
			200
		);
	}

	switch() {
		this.#clearActiveStyles();
		this.#switchButton.classList.add("active-button");
		this.#seconds = this.#TIMER_DURATION;
		setTimeout(
			() => this.#switchButton.classList.remove("active-button"),
			200
		);
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
