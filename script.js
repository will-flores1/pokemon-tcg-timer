"use strict";
(() => {
	const $ = document.querySelector.bind(document);
	const $$ = document.querySelectorAll.bind(document);
	const log = console.log.bind(console);
	const timerAudio = new Audio(`./assets/time.mp3`);

	/* Custom Event */
	// const startE = new Event("start", { bubbles: false });
	// const stopE = new Event("stop", { bubbles: false });
	// const switchE = new Event("switch", { bubbles: false });
	// const resetE = new Event("reset", { bubbles: false });
	// /* Event Dispatchers func */
	// function _dispatchStartEvent() {
	// 	document.dispatchEvent(startE);
	// }
	// function _dispatchStopEvent() {
	// 	document.dispatchEvent(stopE);
	// }
	// function _dispatchSwitchEvent() {
	// 	document.dispatchEvent(switchE);
	// }
	// function _dispatchResetEvent() {
	// 	document.dispatchEvent(resetE);
	// }

	/* Model eg. config, state, logic, api, etc. */
	const mdl = (() => {
		/* State */
		const config = {
			env: "development", // "development" || "production
			DURATION: 90, // value is in seconds
			AUTOSWITCH_ON: false, // auto next players turn? T/F
		};
		const state = {
			timeLeft: config.DURATION,
			timerInterval: null,
		};
		state["timeLeftFmt"] = _fmtTimeLeft();

		// const stats = {
		// 	turns: 0,
		// 	totalTime: 0,
		// };

		/* util helpers */
		function _fmtTimeLeft() {
			let minutes = Math.floor(state.timeLeft / 60)
				.toString()
				.padStart(2, "0");
			let seconds = (state.timeLeft % 60).toString().padStart(2, "0");
			return `${minutes}:${seconds}`;
		}
		function _decrementTime() {
			// handles decrement timeLeft & timeLeftFmt
			// if (state.timeLeft <= -1) return;
			--state.timeLeft;
			state.timeLeftFmt = _fmtTimeLeft();
		}
		function sleep(ms) {
			return new Promise((resolve) => setTimeout(resolve, ms));
		}
		function _resetTime() {
			state.timeLeft = Number(config.DURATION);
			state.timeLeftFmt = _fmtTimeLeft();
		}
		/* Loggers  */
		// function _prntInfo(msg) {
		// 	log({ message: msg, ...mdl.state });
		// }
		// function _printState() {
		// 	let minutes = Math.floor(mdl.state.timeLeft / 60)
		// 		.toString()
		// 		.padStart(2, "0");
		// 	let seconds = (mdl.state.timeLeft % 60).toString().padStart(2, "0");
		// 	log({ ...mdl.state, timeLeft: `${minutes}: ${seconds}` });
		// }
		// function _printTimeLeft() {
		// 	log(_fmtTimeLeft());
		// }

		/* Interval helper */
		function _startInterval() {
			if (state.timerInterval) return;

			state.timerInterval = setInterval(async () => {
				_decrementTime();
				if (state.timeLeft <= -1) {
					if (config.AUTOSWITCH_ON) {
						nextTurn();
					} else {
						_stopInterval();
						_resetTime();
					}
				}
				log(state);
			}, 1000);
		}
		function _stopInterval() {
			if (!state.timerInterval) return;
			clearInterval(state.timerInterval);
			state.timerInterval = null;
		}

		/* Countdown helpers */
		function _startCountdown() {
			if (state.timeLeft <= -1) return;
			if (state.timerInterval) return;

			_startInterval();
		}
		function _stopCountdown() {
			if (state.timeLeft <= -1) return;
			if (!state.timerInterval) return;

			_stopInterval();
		}

		/* API */
		function play() {
			_startCountdown();
		}
		function pause() {
			_stopCountdown();
		}
		function nextTurn() {
			_stopInterval();
			_resetTime();
			_startInterval();
		}

		function setDuration(dur) {
			_stopInterval();
			config.DURATION = dur;
			_resetTime();
		}
		function setAutoSwitch(bool) {
			_stopInterval();
			config.AUTOSWITCH_ON = bool;
			_resetTime();
		}

		return {
			play,
			pause,
			nextTurn,
			getDuration: () => config.DURATION,
			setDuration,
			getAutoSwitch: () => config.AUTOSWITCH_ON,
			setAutoSwitch,
			getTimeFmt: () => state.timeLeftFmt,
			getEnv: () => config.env,
		};
	})();

	/* View eg. DOM, UI, etc. */
	const view = (() => {
		// DOM Elements
		const timerDisplay = $("#timer");
		const startBtn = createButton("Start");
		const resumeBtn = createButton("Resume");
		const pauseBtn = createButton("Pause");
		const currBtn = $("#currBtn");
		const currInstructions = $("#currInstructions");
		const switchBtn = $("#switchBtn");
		const durSelect = $("#durationSelect");
		const autoSwitch = $("#automatedSwitch");

		/* Default values */
		durSelect.value = mdl.getDuration();
		timerDisplay.textContent = mdl.getTimeFmt();
		currBtn.appendChild(startBtn);
		autoSwitch.checked = mdl.getAutoSwitch();

		/* Development Mode */
		mdl.getEnv() === "development" &&
			(function devMode() {
				// Add some dev elements
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
			})();

		// Create Elements
		function createButton(txt) {
			const button = document.createElement("button");
			button.id = txt.toLowerCase() + "Btn";
			button.textContent = txt;
			return button;
		}

		return {
			timerDisplay,
			startBtn,
			resumeBtn,
			pauseBtn,
			currBtn,
			currInstructions,
			switchBtn,
			durSelect,
			autoSwitch,
		};
	})();

	/* Controller eg. event listeners, event dispatchers, etc. */
	const ctlr = (() => {
		let intervalHandler = null;
		function _startInterval() {
			if (intervalHandler) return;

			intervalHandler = setInterval(() => {
				updateTimerDisplay();
				log("front interval");
				if (mdl.getTimeFmt() === "00:00") {
					log(mdl.getTimeFmt());
					if (mdl.getAutoSwitch()) {
						_stopInterval();
						_startInterval();
					} else {
						_stopInterval();
						updateCurrButton("reset");
						updateInstructions("reset");
					}
				}
			}, 1000);
		}
		function _stopInterval() {
			if (!intervalHandler) return;
			clearInterval(intervalHandler);
			intervalHandler = null;
		}

		/* Refresh display helpers */
		function updateCurrButton(state) {
			view.currBtn.textContent = "";
			switch (state) {
				case "play":
					view.currBtn.appendChild(view.pauseBtn);
					break;
				case "pause":
					view.currBtn.appendChild(view.resumeBtn);
					break;
				case "start":
					view.currBtn.appendChild(view.pauseBtn);
					break;
				case "reset":
					view.currBtn.appendChild(view.startBtn);
					break;
				default:
					break;
			}
		}
		function updateInstructions(state) {
			view.currInstructions.textContent = "";
			switch (state) {
				case "play":
					view.currInstructions.textContent = "pause";
					break;
				case "pause":
					view.currInstructions.textContent = "resume";
					break;
				case "start":
					view.currInstructions.textContent = "pause";
					break;
				case "reset":
					view.currInstructions.textContent = "start";
					break;
				default:
					break;
			}
		}
		function updateTimerDisplay() {
			view.timerDisplay.textContent = mdl.getTimeFmt();
		}

		/* Event listeners */
		// buttons events
		view.startBtn.addEventListener("click", function start() {
			mdl.play();
			_startInterval();
			updateCurrButton("start");
			updateInstructions("start");
			updateTimerDisplay();
		});
		view.resumeBtn.addEventListener("click", function resume() {
			mdl.play();
			updateCurrButton("play");
			updateInstructions("play");
			updateTimerDisplay();
			intervalHandler = setInterval(() => {
				updateTimerDisplay();
			}, 1000);
		});
		view.pauseBtn.addEventListener("click", function pause() {
			if (mdl.getTimeFmt() === "-1:-1") return;
			mdl.pause();
			_stopInterval();
			updateCurrButton("pause");
			updateInstructions("pause");
			updateTimerDisplay();
		});
		view.switchBtn.addEventListener("click", function _switch() {
			mdl.nextTurn();
			_stopInterval();
			_startInterval();
			updateCurrButton("play");
			updateInstructions("play");
			updateTimerDisplay();
		});
		// change event
		view.durSelect.addEventListener("change", (ev) => {
			mdl.setDuration(ev.target.value); // resets server timer
			_stopInterval();
			updateTimerDisplay();
			updateCurrButton("reset");
			updateInstructions("reset");
		});
		view.autoSwitch.addEventListener("change", (ev) => {
			mdl.setAutoSwitch(ev.target.checked);
			_stopInterval();
			updateTimerDisplay();
			updateCurrButton("reset");
			updateInstructions("reset");
		});
		// keyboard events
		document.addEventListener("keydown", (ev) => {
			switch (ev.key) {
				case " ":
					// Next player
					break;
				case "b":
					// Start/Resume/Pause
					break;
				default:
					break;
			}
		});
		// custom events
		document.addEventListener("start", (ev) => {});
		document.addEventListener("stop", (ev) => {});
		document.addEventListener("switch", (ev) => {});
		document.addEventListener("reset", (ev) => {});
	})();
})();
