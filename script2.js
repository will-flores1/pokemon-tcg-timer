(() => {
	const $ = document.querySelector.bind(document);
	const $$ = document.querySelectorAll.bind(document);
	const log = console.log.bind(console);

	const timerDisplay = $("#timer");
	const stateBtn = $("#state");
	const switchBtn = $("#switch");

	const DURATION = 90;
	const AUTOSWITCH = true;

	// State
	let PLAYING = false;
	let PAUSED = true;
	let DURATION_STATE = DURATION;

	// Interval controller
	let timeInterval = null;

	// Audio
	const timerAudio = new Audio(`./assets/time.mp3`);

	/* Event listeners */
	document.addEventListener("keydown", (ev) => {
		switch (ev.key) {
			case " ":
				if (PLAYING) {
					toggleSwitchBtn();
					autoswitch();
				}
				break;
			case "b":
				toggleStateBtn();
				break;
			default:
				null;
				break;
		}

		ev.key === " " ? toggleStateBtn() : undefined;
	});
	stateBtn.addEventListener("click", toggleStateBtn);

	/* Toggle play/pause */
	function toggleStateBtn() {
		PLAYING ? pause() : play();
	}
	function toggleSwitchBtn() {
		if (PLAYING) {
			switchBtn.classList.remove("hidden");
			switchBtn.addEventListener("click", () => {
				toggleSwitchBtn();
				autoswitch();
			});
		} else {
			switchBtn.classList.add("hidden");
			switchBtn.removeEventListener("click", () => {});
		}
	}

	/* Start time */
	function play() {
		PLAYING = true;
		PAUSED = false;
		refreshStateBtn();
		toggleSwitchBtn();
		clearInterval(timeInterval);
		timeInterval = setInterval(() => {
			updateTimerDisplay();
			if (DURATION_STATE === 0) {
				timerAudio.play();
				AUTOSWITCH ? autoswitch() : reset();
			}
		}, 1000);
		log("playing");
	}

	/* Pause time */
	function pause() {
		PAUSED = true;
		PLAYING = false;
		refreshStateBtn();
		toggleSwitchBtn();
		clearInterval(timeInterval);
		updateTimerDisplay();
		log("paused");
	}

	/* Reset timer */
	function reset() {
		PAUSED = true;
		PLAYING = false;
		refreshStateBtn();
		clearInterval(timeInterval);
		DURATION_STATE = DURATION;
		updateTimerDisplay();
		log("reset");
	}

	/* Next player */
	function autoswitch() {
		DURATION_STATE = DURATION;
		play();
		log("next player's turn");
	}

	function updateTimerDisplay() {
		if (PLAYING) {
			--DURATION_STATE;
		}
		const minutes = Math.floor(DURATION_STATE / 60)
			.toString()
			.padStart(2, "0");
		const seconds = (DURATION_STATE % 60).toString().padStart(2, "0");
		timerDisplay.textContent = `${minutes}:${seconds}`;
		log(`${minutes}: ${seconds}`);
	}

	function refreshStateBtn() {
		if (PAUSED) {
			stateBtn.textContent = "Play";
		} else {
			stateBtn.textContent = "Pause";
		}
	}

	// Main
	refreshStateBtn();
	updateTimerDisplay();
})();
