"use strict";
(() => {
	const $ = document.querySelector.bind(document);
	const $$ = document.querySelectorAll.bind(document);
	const log = console.log.bind(console);
	const timerAudio = new Audio(`./assets/time.mp3`);

	/* Model eg. state, config, logic, etc. */
	const mdl = (() => {
		const env = "production"; // "development" || "production
		/* State */
		const config = {
			DEFAULT_DURATION: 90, // value is in seconds
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
			resetStartBtn: true,
			timerInterval: null,
		};
		const stats = {
			turns: 0,
			totalTime: 0,
		};

		return {
			config,
			state,
			env,
		};
	})();

	/* View eg. DOM, UI, etc. */
	const view = (() => {
		// DOM Elements
		const _timerDisp = $("#timer");
		const _toggleBtnDiv = $("#toggleBtnDiv");
		const strtBtn = createButton("Start");
		const resumeBtn = createButton("Resume");
		const stpBtn = createButton("Pause");
		const switchBtn = $("#switchBtn");
		const durSelect = $("#durationSelect");
		const automatedSwitch = $("#automatedSwitch");

		const _keyStateDisp = $("#keyStateDisp");

		/* Development Mode */
		(function devMode() {
			if (mdl.env === "development") {
				// create 4s dur option
				const option = document.createElement("option");
				option.setAttribute("value", "4");
				option.textContent = "4s";
				durSelect.appendChild(option);
				// create developer title
				const devTitle = document.createElement("h1");
				devTitle.textContent = "Developer Mode";
				devTitle.style.color = "red";
				devTitle.style.textAlign = "center";
				devTitle.style.paddingTop = "10px";
				document.body.prepend(devTitle);
			} else if (mdl.env === "production") return;
			else throw new Error("Invalid environment detected.");
		})();

		// General Elements
		function createButton(txt) {
			const button = document.createElement("button");
			button.id = txt.toLowerCase() + "Btn";
			button.textContent = txt;
			return button;
		}

		function updateTimerDisplay() {
			const minutes = Math.floor(mdl.state.timeLeft / 60)
				.toString()
				.padStart(2, "0");
			const seconds = (mdl.state.timeLeft % 60).toString().padStart(2, "0");
			_timerDisp.textContent = `${minutes}:${seconds}`;
			document.title = `Pokémon Turn Timer - ${minutes}:${seconds}`;
		}
		function updateToggleButton() {
			_toggleBtnDiv.textContent = "";
			if (mdl.state.resetStartBtn) {
				_toggleBtnDiv.appendChild(strtBtn);
			} else if (mdl.state.PLAYING) {
				_toggleBtnDiv.appendChild(stpBtn);
			} else {
				_toggleBtnDiv.appendChild(resumeBtn);
			}
		}
		function updateKeyDisplay(eventType) {
			_keyStateDisp.textContent = eventType;
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
			durSelect,
			automatedSwitch,
			updateKeyDisplay,
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
			if (mdl.state.resetStartBtn) return;
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

		/* Event Dispatchers func */
		function _dispatchStartEvent() {
			document.dispatchEvent(startEvent);
		}
		function _dispatchStopEvent() {
			document.dispatchEvent(stopEvent);
		}
		function _dispatchSwitchEvent() {
			document.dispatchEvent(switchEvent);
		}
		function _dispatchResetEvent() {
			document.dispatchEvent(resetEvent);
		}

		/* Controller Service Functions */
		function _strt() {
			if (mdl.state.PLAYING) return;
			mdl.state.resetStartBtn = false;

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
		function strt() {
			_strt();
			view.updateToggleButton();
			_dispatchStartEvent();
		}
		function play() {
			_strt();
			view.updateToggleButton();
			_dispatchStartEvent();
		}
		function pause() {
			_stp();
			view.updateToggleButton();
			_dispatchStopEvent();
		}
		function switchPlayer() {
			_nxtTurn();
			view.updateToggleButton();
			if (!mdl.state.resetStartBtn) _dispatchSwitchEvent();
		}

		/* Event Dispatchers */
		const startEvent = new Event("start", { bubbles: false });
		const stopEvent = new Event("stop", { bubbles: false });
		const switchEvent = new Event("switch", { bubbles: false });
		const resetEvent = new Event("reset", { bubbles: false });

		/* Event listeners */
		// buttons
		view.strtBtn.addEventListener("click", strt);
		view.resumeBtn.addEventListener("click", play);
		view.stpBtn.addEventListener("click", pause);
		view.switchBtn.addEventListener("click", switchPlayer);
		// events
		view.durSelect.addEventListener("change", (ev) => {
			mdl.config.DEFAULT_DURATION = Number(ev.target.value);
			_dispatchResetEvent();
		});
		view.automatedSwitch.addEventListener("change", (ev) => {
			mdl.config.AUTOSWITCH = ev.target.checked;
			log(mdl.config.AUTOSWITCH);
		});
		document.addEventListener("keydown", (ev) => {
			switch (ev.key) {
				case " ":
					switchPlayer();
					break;
				case "b":
					if (mdl.state.PLAYING) {
						pause();
					} else {
						play();
					}
					break;
				default:
					break;
			}
		});
		// custom events
		document.addEventListener("start", (ev) => {
			view.updateKeyDisplay("stop");
		});
		document.addEventListener("stop", (ev) => {
			view.updateKeyDisplay("resume");
		});
		document.addEventListener("switch", (ev) => {
			if (mdl.state.resetStartBtn) view.updateKeyDisplay("start");
			view.updateKeyDisplay("stop");
		});
		document.addEventListener("reset", (ev) => {
			view.updateKeyDisplay("start");
			mdl.state.resetStartBtn = true;
			mdl.state.timeLeft = mdl.config.DEFAULT_DURATION;
			_resetCountdown();
			_stpState();
			view.updateToggleButton();
			view.updateTimerDisplay();
		});
	})();
})();
