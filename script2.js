"use strict";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const ctlr = (() => {
	const log = console.log.bind(console);
	const timerAudio = new Audio(`./assets/time.mp3`);

	const config = {
		DEFAULT_DURATION: 3, // value is in seconds
		AUTOSWITCH: true, // auto next players turn? T/F
	};

	// State
	/*
	 * State of timer
	 * Play/Pause
	 */
	const defaultState = {
		PLAYING: false,
		PAUSED: true,
		timeLeft: config.DEFAULT_DURATION,
	};

	const state = { ...defaultState };

	// Internal helpers (logic)
	let timerInterval = null;

	// Logging
	function _prntInfo(msg) {
		log({ message: msg, ...state });
	}
	function _printState() {
		let minutes = Math.floor(state.timeLeft / 60)
			.toString()
			.padStart(2, "0");
		let seconds = (state.timeLeft % 60).toString().padStart(2, "0");
		log({ ...state, timeLeft: `${minutes}: ${seconds}` });
	}
	function _printTimeLeft() {
		let minutes = Math.floor(state.timeLeft / 60)
			.toString()
			.padStart(2, "0");
		let seconds = (state.timeLeft % 60).toString().padStart(2, "0");
		log(`${minutes}: ${seconds}`);
	}

	/* Logic helpers */
	function _startCountdown() {
		if (state.timeLeft <= 0) return;

		_printTimeLeft();
		// start countdown
		timerInterval = setInterval(function () {
			state.timeLeft--;
			_printTimeLeft(state.timeLeft);

			// If clock hits 0, stop it
			if (state.timeLeft === 0) {
				if (!config.AUTOSWITCH) _stopCountdown();
				if (config.AUTOSWITCH) _autoswitch();
			}
		}, 1000);
	}
	function _stopCountdown() {
		clearInterval(timerInterval);
		timerInterval = null;
		_printTimeLeft();
	}
	function _resetCountdown() {
		clearInterval(timerInterval);
		timerInterval = null;
	}

	function _autoswitch() {
		_resetCountdown();
		// 1 seconds sleep
		new Promise((resolve, reject) => {
			setTimeout(() => {
				log("Next turn");
				state.timeLeft = defaultState.timeLeft;
				_startCountdown();
				resolve();
			}, 1000);
		});
	}
	function _strtState() {
		state.PLAYING = true;
		state.PAUSED = false;
	}
	function _stpState() {
		state.PLAYING = false;
		state.PAUSED = true;
	}

	/* Logic functions */
	function _togglePlayState() {
		// flip state depending on current state playing/paused
		if (state.PLAYING && !state.PAUSED) {
			_stpState();
			// _prntInfo("Timer paused!");
			return;
		} else if (!state.PLAYING && state.PAUSED) {
			_strtState();
			// _prntInfo("Timer started!");
			return;
		} else {
			console.error("Invalid state detected. Resetting to a default state.");
			state.PLAYING = false; // set default state
			state.PAUSED = true; // set default state
			return;
		}
	}
	function _toggleCountdown() {
		// start/stop countdown according to state
		if (state.PLAYING && !state.paused) {
			_startCountdown();
		} else if (!state.PLAYING && state.PAUSED) {
			_stopCountdown();
		} else {
			console.error("Invalid state detected. Resetting to a default state.");
			timerInterval = null;
			return;
		}
	}

	/* Controller Service Functions */
	function _strt() {
		if (state.PLAYING) return;
		log("start");

		_togglePlayState();
		_toggleCountdown();
	}
	function _stp() {
		if (state.PAUSED) return;
		log("stop");

		_togglePlayState();
		_toggleCountdown();
	}

	/* Controllers */
	function play() {
		_strt();
	}
	function pause() {
		_stp();
	}

	return {
		play,
		pause,
	};
})();

$("#strtBtn").addEventListener("click", () => ctlr.play());
$("#stpBtn").addEventListener("click", () => ctlr.pause());
ctlr.play();
ctlr.pause();

/* Event listeners */
// document.addEventListener("keydown", (ev) => {
// 	switch (ev.key) {
// 		case " ":
// 			if (PLAYING) {
// 				toggleSwitchBtn();
// 				autoswitch();
// 			}
// 			break;
// 		case "b":
// 			toggleStateBtn();
// 			break;
// 		default:
// 			null;
// 			break;
// 	}

// 	ev.key === " " ? toggleStateBtn() : undefined;
// });
// stateBtn.addEventListener("click", toggleStateBtn);

// 	/* Toggle play/pause */
// 	function toggleStateBtn() {
// 		PLAYING ? pause() : play();
// 	}
// 	function toggleSwitchBtn() {
// 		if (PLAYING) {
// 			switchBtn.classList.remove("hidden");
// 			switchBtn.addEventListener("click", () => {
// 				toggleSwitchBtn();
// 				autoswitch();
// 			});
// 		} else {
// 			switchBtn.classList.add("hidden");
// 			switchBtn.removeEventListener("click", () => {});
// 		}
// 	}

// 	/* Start time */
// 	function play() {
// 		PLAYING = true;
// 		PAUSED = false;
// 		refreshStateBtn();
// 		toggleSwitchBtn();
// 		clearInterval(timerInterval);
// 		timerInterval = setInterval(() => {
// 			updateTimerDisplay();
// 			if (timeLeft === 0) {
// 				timerAudio.play();
// 				AUTOSWITCH ? autoswitch() : reset();
// 			}
// 		}, 1000);
// 		log("playing");
// 	}

// 	/* Pause time */
// 	function pause() {
// 		PAUSED = true;
// 		PLAYING = false;
// 		refreshStateBtn();
// 		toggleSwitchBtn();
// 		clearInterval(timerInterval);
// 		updateTimerDisplay();
// 		log("paused");
// 	}

// 	/* Reset timer */
// 	function reset() {
// 		PAUSED = true;
// 		PLAYING = false;
// 		refreshStateBtn();
// 		clearInterval(timerInterval);
// 		timeLeft = DURATION;
// 		updateTimerDisplay();
// 		log("reset");
// 	}

// 	/* Next player */
// 	function autoswitch() {
// 		timeLeft = DURATION;
// 		play();
// 		log("next player's turn");
// 	}

// 	function updateTimerDisplay() {
// 		if (PLAYING) {
// 			--timeLeft;
// 		}
// 		const minutes = Math.floor(timeLeft / 60)
// 			.toString()
// 			.padStart(2, "0");
// 		const seconds = (timeLeft % 60).toString().padStart(2, "0");
// 		timerDisplay.textContent = `${minutes}:${seconds}`;
// 		log(`${minutes}: ${seconds}`);
// 	}

// 	function refreshStateBtn() {
// 		if (PAUSED) {
// 			stateBtn.textContent = "Play";
// 		} else {
// 			stateBtn.textContent = "Pause";
// 		}
// 	}
/* DOM Elements */
// const timerDisplay = $("#timer");
// const stateBtn = $("#btn");
// const switchBtn = $("#switch");

// 	// Main
// 	refreshStateBtn();
// 	updateTimerDisplay();
