const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const GRIDUNIT = 25;
const MAP_WIDTH = 21;
const MAP_HEIGHT = 23;
const FPS = 60;
const SPEED = 200;
const Direction = Object.freeze({
	"north": 1,
	"south": 2,
	"east" : 3,
	"west" : 4
});

class Coord {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	get pixelX() {
		return this.x * GRIDUNIT;
	}

	get pixelY() {
		return this.y * GRIDUNIT;
	}

	toPixels() {
		return new Coord(this.x * GRIDUNIT, this.y * GRIDUNIT);
	}

	static fromPixels(x, y) {
		return new Coord(Math.round(x / GRIDUNIT) * GRIDUNIT, Math.round(y / GRIDUNIT) * GRIDUNIT);
	}
}

class Character {
	constructor(x, y, direction) {
		this.position = new Coord(x, y);
		this.direction = direction;
		this.isMoving = false;
		this.offsetX = 0;
		this.offsetY = 0;
	}

	get x() {
		return this.position.x;
	}

	set x(x) {
		this.position.x = x;
	}

	get y() {
		return this.position.y;
	}

	set y(y) {
		this.position.y = y;
	}

	get pixelX() {
		return this.position.pixelX + this.offsetX;
	}

	get pixelY() {
		return this.position.pixelY + this.offsetY;
	}

	gridMove() {
		let newY = this.y;
		let newX = this.x;

		switch(this.direction) {
			case Direction.north:
				newY--; break;
			case Direction.south:
				newY++; break;
			case Direction.east:
				newX++; break;
			case Direction.west:
				newX--; break;
		}

		this.offsetX = 0;
		this.offsetY = 0;

		if(map.some(w => w.x === newX && w.y === newY)) {
			this.isMoving = false;
			return;
		}

		this.x = newX;
		this.y = newY;
		this.isMoving = true;
	}

	frameMove() {
		if(!this.isMoving) return;
		const pixelsPerFrame = GRIDUNIT / (SPEED / (1000 / FPS));
		switch(this.direction) {
			case Direction.north:
				this.offsetY -= pixelsPerFrame; break;
			case Direction.south:
				this.offsetY += pixelsPerFrame; break;
			case Direction.east:
				this.offsetX += pixelsPerFrame; break;
			case Direction.west:
				this.offsetX -= pixelsPerFrame; break;
		}
	}
}

document.addEventListener("keydown", (e) => {
	switch(e.key) {
		case "ArrowUp":
		case "w":
			pacman.direction = Direction.north; break;
		case "ArrowRight":
		case "d":
			pacman.direction = Direction.east; break;
		case "ArrowLeft":
		case "a":
			pacman.direction = Direction.west; break;
		case "ArrowDown":
		case "s":
			pacman.direction = Direction.south; break;
		case "Enter":
		case " ":
			break;
	}
});

const pacman = new Character();
let mouthOffset;
let interval;
let frames;

function setup() {
	pacman.direction = Direction.north;
	pacman.x = 10;
	pacman.y = 12;
	pacman.mouthOffset = 0;
	frames = SPEED;

	draw();
	interval = setInterval(update, 1000 / FPS);
}

function update() {
	frames++;
	if(1000 / FPS * frames / SPEED >= 1) {
		frames = 0;
		pacman.gridMove();
	} else {
		pacman.frameMove();
	}

	draw();
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawMap();

	// Pacman
	let initialAngle;
	let endAngle;

	switch(pacman.direction) {
		case Direction.north:
			initialAngle = -1 * Math.PI / 4;
			endAngle = 5 * Math.PI / 4;
			break;
		case Direction.south:
			initialAngle = -5 * Math.PI / 4;
			endAngle = 1 * Math.PI / 4;
			break;
		case Direction.east:
			initialAngle = 1 * Math.PI / 4;
			endAngle = 7 * Math.PI / 4;
			break;
		case Direction.west:
			initialAngle = -3 * Math.PI / 4;
			endAngle = 3 * Math.PI / 4;
			break;
	}

	ctx.beginPath();
	ctx.moveTo(pacman.pixelX + GRIDUNIT / 2, pacman.pixelY + GRIDUNIT / 2);
	ctx.arc(pacman.pixelX + GRIDUNIT / 2, pacman.pixelY + GRIDUNIT / 2, GRIDUNIT / 2 - 1, initialAngle, endAngle);
	ctx.lineTo(pacman.pixelX + GRIDUNIT / 2, pacman.pixelY + GRIDUNIT / 2);
	ctx.fillStyle = "yellow";
	ctx.fill();
}

function drawMap() {
	ctx.fillStyle = "black";
	for(wall of map) {
		ctx.beginPath();
		ctx.rect(wall.x * GRIDUNIT, wall.y * GRIDUNIT, GRIDUNIT, GRIDUNIT);
		ctx.fill();
	}
}

setup();
