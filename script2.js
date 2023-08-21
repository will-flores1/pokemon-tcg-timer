"use strict";
(() => {
	const $ = document.querySelector.bind(document);
	const $$ = document.querySelectorAll.bind(document);
	const log = console.log.bind(console);
	const timerAudio = new Audio(`./assets/time.mp3`);

	const mdl = (() => {
		/* State */
		const config = {
			DEFAULT_DURATION: 3, // value is in seconds
			AUTOSWITCH: true, // auto next players turn? T/F
		};
		const defaultState = {
			PLAYING: false,
			PAUSED: true,
			timeLeft: config.DEFAULT_DURATION,
		};
		const state = {
			PLAYING: false,
			PAUSED: true,
			timeLeft: config.DEFAULT_DURATION,
			firstVisit: true,
			timerInterval: null,
		};

		return {
			config,
			state,
		};
	})();

	/* View eg. DOM, UI, etc. */
	const view = (() => {
		// General Elements
		function createButton(txt) {
			const button = document.createElement("button");
			button.id = txt.toLowerCase() + "Btn";
			button.textContent = txt;
			return button;
		}

		// Elements
		const _timerDisp = $("#timer");
		const _toggleBtnDiv = $("#toggleBtnDiv");
		const strtBtn = createButton("Start");
		const resumeBtn = createButton("Resume");
		const stpBtn = createButton("Pause");
		const switchBtn = $("#switchBtn");

		function updateTimerDisplay() {
			const minutes = Math.floor(mdl.state.timeLeft / 60)
				.toString()
				.padStart(2, "0");
			const seconds = (mdl.state.timeLeft % 60).toString().padStart(2, "0");
			_timerDisp.textContent = `${minutes}:${seconds}`;
		}
		function updateToggleButton() {
			_toggleBtnDiv.textContent = "";
			if (mdl.state.firstVisit) {
				_toggleBtnDiv.appendChild(strtBtn);
			} else if (mdl.state.PLAYING) {
				_toggleBtnDiv.appendChild(stpBtn);
			} else {
				_toggleBtnDiv.appendChild(resumeBtn);
			}
		}
		updateTimerDisplay();
		updateToggleButton();

		return {
			updateTimerDisplay,
			updateToggleButton,
			strtBtn,
			resumeBtn,
			stpBtn,
			switchBtn,
		};
	})();

	/* Model eg. state, config, logic, etc. */
	const ctlr = (function () {
		// Logging
		function _prntInfo(msg) {
			log({ message: msg, ...mdl.state });
		}
		function _printState() {
			let minutes = Math.floor(mdl.state.timeLeft / 60)
				.toString()
				.padStart(2, "0");
			let seconds = (mdl.state.timeLeft % 60).toString().padStart(2, "0");
			log({ ...mdl.state, timeLeft: `${minutes}: ${seconds}` });
		}
		function _printTimeLeft() {
			let minutes = Math.floor(mdl.state.timeLeft / 60)
				.toString()
				.padStart(2, "0");
			let seconds = (mdl.state.timeLeft % 60).toString().padStart(2, "0");
			log(`${minutes}:${seconds}`);
		}

		/* Logic helpers */
		function _startCountdown() {
			if (mdl.state.timeLeft <= 0) return;

			_printTimeLeft();
			view.updateTimerDisplay();
			// start countdown
			mdl.state.timerInterval = setInterval(function () {
				mdl.state.timeLeft--;
				_printTimeLeft();
				view.updateTimerDisplay();

				// If clock hits 0, stop it
				if (mdl.state.timeLeft === 0) {
					if (!mdl.config.AUTOSWITCH) _stopCountdown();
					if (mdl.config.AUTOSWITCH) _autoswitch();
				}
			}, 1000);
		}
		function _stopCountdown() {
			clearInterval(mdl.state.timerInterval);
			_printTimeLeft();
			view.updateTimerDisplay();
		}
		function _resetCountdown() {
			clearInterval(mdl.state.timerInterval);
			mdl.state.timeLeft = mdl.config.DEFAULT_DURATION;
		}

		function _autoswitch() {
			_resetCountdown();
			// 1 seconds sleep
			new Promise((resolve, reject) => {
				mdl.state.timerInterval = setTimeout(() => {
					log("Next turn");
					_startCountdown();
					resolve();
				}, 1000);
			});
		}
		function _manualswitch() {
			if (mdl.state.firstVisit) return;
			_resetCountdown();
			log("Next turn");
			_strtState();
			_startCountdown();
		}
		function _strtState() {
			mdl.state.PLAYING = true;
			mdl.state.PAUSED = false;
		}
		function _stpState() {
			mdl.state.PLAYING = false;
			mdl.state.PAUSED = true;
		}

		/* Logic functions */
		function _togglePlayState() {
			// flip state depending on current state playing/paused
			if (mdl.state.PLAYING && !mdl.state.PAUSED) {
				_stpState();
				// _prntInfo("Timer paused!");
				return;
			} else if (!mdl.state.PLAYING && mdl.state.PAUSED) {
				_strtState();
				// _prntInfo("Timer started!");
				return;
			} else {
				console.error(
					"Invalid state detected. Resetting to a default state."
				);
				mdl.state.PLAYING = false; // set default state
				mdl.state.PAUSED = true; // set default state
				return;
			}
		}
		function _toggleCountdown() {
			// start/stop countdown according to state
			if (mdl.state.PLAYING && !mdl.state.paused) {
				_startCountdown();
			} else if (!mdl.state.PLAYING && mdl.state.PAUSED) {
				_stopCountdown();
			} else {
				console.error(
					"Invalid state detected. Resetting to a default state."
				);
				mdl.state.timerInterval = null;
				return;
			}
		}

		/* Controller Service Functions */
		function _strt() {
			if (mdl.state.PLAYING) return;
			if (mdl.state.firstVisit) delete mdl.state.firstVisit;

			log("start");

			_togglePlayState();
			_toggleCountdown();
		}
		function _stp() {
			if (mdl.state.PAUSED) return;
			log("stop");

			_togglePlayState();
			_toggleCountdown();
		}
		function _nxtTurn() {
			_manualswitch();
		}

		/* Controllers API */
		function play() {
			_strt();
			view.updateToggleButton();
		}
		function pause() {
			_stp();
			view.updateToggleButton();
		}
		function switchPlayer() {
			_nxtTurn();
			view.updateToggleButton();
		}

		// Event listeners
		view.strtBtn.addEventListener("click", play);
		view.resumeBtn.addEventListener("click", play);
		view.stpBtn.addEventListener("click", pause);
		view.switchBtn.addEventListener("click", switchPlayer);
	})();
})();

// $("#strtBtn").addEventListener("click", () => ctlr.play());
// $("#stpBtn").addEventListener("click", () => ctlr.pause());
// $("#toggleBtn").addEventListener("click", function () {
// 	if (mdl.state.PLAYING) {
// 		ctlr.pause();
// 	} else {
// 		ctlr.play();
// 	}
// 	view.updateToggleButton();
// });

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
// 		clearInterval(mdl.state.timerInterval);
// 		mdl.state.timerInterval = setInterval(() => {
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
// 		clearInterval(mdl.state.timerInterval);
// 		updateTimerDisplay();
// 		log("paused");
// 	}

// 	/* Reset timer */
// 	function reset() {
// 		PAUSED = true;
// 		PLAYING = false;
// 		refreshStateBtn();
// 		clearInterval(mdl.state.timerInterval);
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
