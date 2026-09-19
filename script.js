const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");
const gameArea = document.getElementById("gameArea");
const snakeLayer = document.getElementById("snake");
const fruitLayer = document.getElementById("fruits");
const particlesLayer = document.getElementById("particles");
const pauseOverlay = document.getElementById("pauseOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const plusOne = document.getElementById("plusOne");
const knob = document.getElementById("knob");

const classicBtn = document.getElementById("classicBtn");
const speedBtn = document.getElementById("speedBtn");
const playBtn = document.getElementById("playBtn");
const restartBtn = document.getElementById("restartBtn");
const exitBtn = document.getElementById("exitBtn");

const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");
const eatenElement = document.getElementById("eaten");
const modeDisplay = document.getElementById("modeDisplay");
const finalScoreElement = document.getElementById("finalScore");
const highScoreElement = document.getElementById("highScore");

const cellSize = 25;
const initialSnake = [{ x: 8, y: 7 }, { x: 7, y: 7 }, { x: 6, y: 7 }];
const directions = {
	up: { x: 0, y: -1 },
	down: { x: 0, y: 1 },
	left: { x: -1, y: 0 },
	right: { x: 1, y: 0 }
};

let selectedMode = "CLASSIC";
let snake = [];
let fruit = null;
let direction = directions.right;
let nextDirection = direction;
let score = 0;
let eaten = 0;
let level = 1;
let timer = null;
let paused = false;
let running = false;
let touchStart = null;
let highScore = Number(localStorage.getItem("anggisnake-highscore") || 0);

function setMode(mode) {
	selectedMode = mode;
	classicBtn.classList.toggle("active", mode === "CLASSIC");
	speedBtn.classList.toggle("active", mode === "SPEED");
}

function gridSize() {
	return {
		columns: Math.floor(gameArea.clientWidth / cellSize),
		rows: Math.floor(gameArea.clientHeight / cellSize)
	};
}

function startGame() {
	menuScreen.classList.add("hidden");
	gameScreen.classList.remove("hidden");
	gameOverOverlay.classList.add("hidden");
	pauseOverlay.classList.add("hidden");
	snake = initialSnake.map(part => ({ ...part }));
	fruit = null;
	direction = directions.right;
	nextDirection = direction;
	score = 0;
	eaten = 0;
	level = 1;
	paused = false;
	running = true;
	modeDisplay.textContent = selectedMode;
	updateHeader();
	spawnFruit();
	render();
	scheduleTick();
}

function scheduleTick() {
	clearTimeout(timer);
	if (running && !paused) {
		const delay = selectedMode === "SPEED" ? Math.max(65, 145 - level * 5) : Math.max(85, 210 - level * 8);
		timer = setTimeout(tick, delay);
	}
}

function tick() {
	if (!running || paused) return;
	direction = nextDirection;
	const head = snake[0];
	const nextHead = { x: head.x + direction.x, y: head.y + direction.y };
	const { columns, rows } = gridSize();
	const hitWall = nextHead.x < 0 || nextHead.y < 0 || nextHead.x >= columns || nextHead.y >= rows;
	const willEat = fruit && nextHead.x === fruit.x && nextHead.y === fruit.y;
	const bodyToCheck = willEat ? snake : snake.slice(0, -1);
	const hitSelf = bodyToCheck.some(part => part.x === nextHead.x && part.y === nextHead.y);

	if (hitWall || hitSelf) {
		endGame();
		return;
	}

	snake.unshift(nextHead);
	if (willEat) {
		score += 10;
		eaten += 1;
		level = Math.floor(eaten / 5) + 1;
		showPoint(nextHead);
		spawnParticles(nextHead);
		if (eaten >= 20) {
			endGame(true);
			return;
		}
		spawnFruit();
	} else {
		snake.pop();
	}
	updateHeader();
	render();
	scheduleTick();
}

function spawnFruit() {
	const { columns, rows } = gridSize();
	const freeCells = [];
	for (let y = 0; y < rows; y += 1) {
		for (let x = 0; x < columns; x += 1) {
			if (!snake.some(part => part.x === x && part.y === y)) freeCells.push({ x, y });
		}
	}
	fruit = freeCells[Math.floor(Math.random() * freeCells.length)] || { x: 1, y: 1 };
}

function render() {
	snakeLayer.replaceChildren();
	snake.forEach((part, index) => {
		const element = document.createElement("div");
		element.className = "snake-part";
		element.style.left = `${part.x * cellSize + 2}px`;
		element.style.top = `${part.y * cellSize + 2}px`;
		element.style.background = index === 0 ? "#eb468c" : "#ff78b6";
		if (index === 0) {
			const eye = document.createElement("span");
			eye.className = "snake-eye white";
			eye.style.left = direction.x < 0 ? "3px" : direction.x > 0 ? "13px" : "8px";
			eye.style.top = direction.y < 0 ? "3px" : direction.y > 0 ? "13px" : "7px";
			element.appendChild(eye);
		}
		snakeLayer.appendChild(element);
	});

	fruitLayer.replaceChildren();
	if (fruit) {
		const fruitElement = document.createElement("div");
		fruitElement.className = "fruit";
		fruitElement.style.left = `${fruit.x * cellSize}px`;
		fruitElement.style.top = `${fruit.y * cellSize}px`;
		fruitElement.innerHTML = '<div class="fruit-body"></div><div class="fruit-highlight"></div><div class="fruit-leaf"></div><div class="fruit-stem"></div>';
		fruitLayer.appendChild(fruitElement);
	}
}

function updateHeader() {
	scoreElement.textContent = score;
	eatenElement.textContent = eaten;
	levelElement.textContent = level;
}

function setDirection(name) {
	const requested = directions[name];
	if (!requested || (requested.x === -direction.x && requested.y === -direction.y)) return;
	nextDirection = requested;
}

function togglePause() {
	if (!running) return;
	paused = !paused;
	pauseOverlay.classList.toggle("hidden", !paused);
	if (paused) clearTimeout(timer);
	else scheduleTick();
}

function endGame(completed = false) {
	running = false;
	paused = false;
	clearTimeout(timer);
	finalScoreElement.textContent = completed ? `${score} - MENANG!` : score;
	highScore = Math.max(highScore, score);
	localStorage.setItem("anggisnake-highscore", String(highScore));
	highScoreElement.textContent = highScore;
	gameOverOverlay.classList.remove("hidden");
}

function showPoint(part) {
	plusOne.style.left = `${part.x * cellSize + 10}px`;
	plusOne.style.top = `${part.y * cellSize}px`;
	plusOne.classList.remove("show");
	void plusOne.offsetWidth;
	plusOne.classList.add("show");
}

function spawnParticles(part) {
	const colors = ["#eb468c", "#ff96c8", "#50be64", "#ffd34e"];
	for (let index = 0; index < 8; index += 1) {
		const particle = document.createElement("span");
		particle.className = "particle";
		particle.style.background = colors[index % colors.length];
		particle.style.left = `${part.x * cellSize + 10}px`;
		particle.style.top = `${part.y * cellSize + 10}px`;
		particle.style.setProperty("--x", `${Math.cos(index * Math.PI / 4) * 25}px`);
		particle.style.setProperty("--y", `${Math.sin(index * Math.PI / 4) * 25}px`);
		particle.addEventListener("animationend", () => particle.remove());
		particlesLayer.appendChild(particle);
	}
}

classicBtn.addEventListener("click", () => setMode("CLASSIC"));
speedBtn.addEventListener("click", () => setMode("SPEED"));
playBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
exitBtn.addEventListener("click", () => {
	running = false;
	clearTimeout(timer);
	gameScreen.classList.add("hidden");
	menuScreen.classList.remove("hidden");
});

document.addEventListener("keydown", event => {
	const keyDirections = { ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" };
	if (keyDirections[event.key]) {
		event.preventDefault();
		setDirection(keyDirections[event.key]);
	}
	if (event.key.toLowerCase() === "p") togglePause();
	if (event.key === "Escape" && !gameOverOverlay.classList.contains("hidden")) exitBtn.click();
});

gameArea.addEventListener("touchstart", event => {
	const touch = event.touches[0];
	touchStart = { x: touch.clientX, y: touch.clientY };
}, { passive: true });

gameArea.addEventListener("touchend", event => {
	if (!touchStart) return;
	const touch = event.changedTouches[0];
	const dx = touch.clientX - touchStart.x;
	const dy = touch.clientY - touchStart.y;
	if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) setDirection(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
	touchStart = null;
}, { passive: true });

document.getElementById("joystick").addEventListener("pointerdown", event => {
	event.currentTarget.setPointerCapture(event.pointerId);
});

document.getElementById("joystick").addEventListener("pointermove", event => {
	if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
	const rect = event.currentTarget.getBoundingClientRect();
	const x = event.clientX - (rect.left + rect.width / 2);
	const y = event.clientY - (rect.top + rect.height / 2);
	if (Math.max(Math.abs(x), Math.abs(y)) > 18) setDirection(Math.abs(x) > Math.abs(y) ? (x > 0 ? "right" : "left") : (y > 0 ? "down" : "up"));
});

highScoreElement.textContent = highScore;
