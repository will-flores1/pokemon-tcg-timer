"use strict";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const log = console.log.bind(console);
const timerAudio = new Audio(`./assets/time.mp3`);

function playSound(Audio) {
	Audio.play();
}

/* Model eg. config, state, logic, api, etc. */
const mdl = (() => {
	/* State */
	const env = "production"; // "development" || "production

	const LocalStorageSettings =
		JSON.parse(localStorage.getItem("settings")) || {};

	const config = {
		DURATION: LocalStorageSettings.DURATION || 90, // value is in seconds
		AUTOSWITCH_ON:
			typeof LocalStorageSettings.AUTOSWITCH_ON === "boolean"
				? LocalStorageSettings.AUTOSWITCH_ON
				: true, // auto next player's turn? T/F
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
	function updateLocalStorage(state) {
		localStorage.setItem("settings", JSON.stringify(state));
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
		getTimeFmt: () => state.timeLeftFmt,
		getDuration: () => config.DURATION,
		setDuration,
		getAutoSwitch: () => config.AUTOSWITCH_ON,
		setAutoSwitch,
		getEnv: () => env,
		updateLocalStorage,
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
	const optionsBtn = $("#optionsBtn");
	const optionsDrawer = $("#optionsDrawer");

	/* Options Drawer */
	optionsBtn.addEventListener("click", () => {
		optionsDrawer.classList.toggle("hidden");
	});

	/* Default values */
	durSelect.value = mdl.getDuration();
	autoSwitch.checked = mdl.getAutoSwitch();
	timerDisplay.textContent = mdl.getTimeFmt();
	currBtn.appendChild(startBtn);

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
			if (mdl.getTimeFmt() === "00:00") {
				playSound(timerAudio);
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
	function updateTimerDisplay() {
		view.timerDisplay.textContent = mdl.getTimeFmt();
	}
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

	/* Clock controls */
	function start() {
		mdl.play();
		_startInterval();
		updateCurrButton("start");
		updateInstructions("start");
		updateTimerDisplay();
	}

	function resume() {
		mdl.play();
		updateCurrButton("play");
		updateInstructions("play");
		updateTimerDisplay();
		intervalHandler = setInterval(() => {
			updateTimerDisplay();
		}, 1000);
	}

	function pause() {
		if (mdl.getTimeFmt() === "-1:-1") return;
		mdl.pause();
		_stopInterval();
		updateCurrButton("pause");
		updateInstructions("pause");
		updateTimerDisplay();
	}

	function _switch() {
		mdl.nextTurn();
		_stopInterval();
		_startInterval();
		updateCurrButton("play");
		updateInstructions("play");
		updateTimerDisplay();
	}

	/* Event listeners */
	// buttons events
	view.startBtn.addEventListener("click", () => {
		start();
		socketCtlr.socket.emit("start");
	});
	view.resumeBtn.addEventListener("click", () => {
		resume();
		socketCtlr.socket.emit("resume");
	});
	view.pauseBtn.addEventListener("click", () => {
		pause();
		socketCtlr.socket.emit("pause");
	});
	view.switchBtn.addEventListener("click", _switch);
	// change event
	view.durSelect.addEventListener("change", (ev) => {
		mdl.setDuration(ev.target.value); // resets server timer
		_stopInterval();
		updateTimerDisplay();
		updateCurrButton("reset");
		updateInstructions("reset");
		mdl.updateLocalStorage({
			AUTOSWITCH_ON: mdl.getAutoSwitch(),
			DURATION: Number(mdl.getDuration()),
		});
	});
	view.autoSwitch.addEventListener("change", (ev) => {
		mdl.setAutoSwitch(ev.target.checked);
		_stopInterval();
		updateTimerDisplay();
		updateCurrButton("reset");
		updateInstructions("reset");
		mdl.updateLocalStorage({
			AUTOSWITCH_ON: mdl.getAutoSwitch(),
			DURATION: Number(mdl.getDuration()),
		});
	});
	// keyboard events
	document.addEventListener("keydown", (ev) => {
		switch (ev.key) {
			case " ":
				// Next player
				view.switchBtn.click();
				break;
			case "b":
				// Start/Resume/Pause
				view.currBtn.firstChild.click();
				break;
			default:
				break;
		}
	});

	return {
		start,
		pause,
		resume,
	};
})();

const socketCtlr = (() => {
	const socket = io();

	socket.on("user joined", (data) => {
		logMessage(data.toString("utf-8"));
	});

	socket.on("start", (data) => {
		console.log("start");
		ctlr.start();
	});

	socket.on("pause", (data) => {
		console.log("pause");
		ctlr.pause();
	});

	socket.on("resume", (data) => {
		console.log("resume");
		ctlr.resume();
	});

	return {
		socket,
	};
})();

function logMessage(message) {
	const el = document.createElement("p");
	el.textContent = message;

	el.style.backgroundColor = "white"; // You might want to set a background color

	$("#messages").appendChild(el);

	// Start the animation
	setTimeout(() => {
		el.style.opacity = "1";
		el.style.bottom = "50px"; // Move the element up
	}, 0);

	$("#messages").scrollTop = $("#messages").scrollHeight;
}
