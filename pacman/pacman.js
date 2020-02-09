const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const GRIDUNIT = 25;
const MAP_WIDTH = 21;
const MAP_HEIGHT = 23;
const MOUTH_OFFSET = 10;
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
		this.previousPosition = new Coord(x, y);
		this.direction = direction;
		this.isBlocked = false;
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

	get curX() {
		return this.previousPosition.pixelX + this.offsetX;
	}

	get curY() {
		return this.previousPosition.pixelY + this.offsetY;
	}

	gridMove() {
		const newPosition = new Coord(this.x, this.y);

		this.doByDirection(
			() => newPosition.y--,
			() => newPosition.y++,
			() => newPosition.x++,
			() => newPosition.x--);


		if(map.some(w => w.x === newPosition.x && w.y === newPosition.y)) {
			this.isBlocked = true;
			return;
		}

		this.offsetX = 0;
		this.offsetY = 0;

		this.previousPosition = this.position;
		this.position = newPosition;
		this.isBlocked = false;
	}

	frameMove() {
		if(this.isBlocked) return;

		const pixelsPerFrame = GRIDUNIT / (SPEED / (1000 / FPS));

		this.doByDirection(
			() => this.offsetY -= pixelsPerFrame,
			() => this.offsetY += pixelsPerFrame,
			() => this.offsetX += pixelsPerFrame,
			() => this.offsetX -= pixelsPerFrame);
	}

	doByDirection(north, south, east, west) {
		switch(this.direction) {
			case Direction.north:
				north(); break;
			case Direction.south:
				south(); break;
			case Direction.east:
				east(); break;
			case Direction.west:
				west(); break;
		}

	}
}

class Pacman extends Character {
	constructor(x, y, direction) {
		super(x, y, direction);
		this.mouthOffset = 0;
		this.mouthGrowing = true;
	}

	draw() {
		let initialAngle;
		let endAngle;

		this.doByDirection(
			() => {
				initialAngle = 1.5 * Math.PI + Math.PI / 4;
				endAngle = 1.5 * Math.PI - Math.PI / 4;
			}, () => {
				initialAngle = 0.5 * Math.PI + Math.PI / 4;
				endAngle = 0.5 * Math.PI - Math.PI / 4;
			}, () => {
				initialAngle = Math.PI / 4;
				endAngle = -Math.PI / 4;
			}, () => {
				initialAngle = 1 * Math.PI + Math.PI / 4;
				endAngle = 1 * Math.PI - Math.PI / 4;
			});

		initialAngle -= this.mouthOffset;
		endAngle += this.mouthOffset;

		ctx.beginPath();
		ctx.moveTo(this.curX + GRIDUNIT / 2, this.curY + GRIDUNIT / 2);
		ctx.arc(this.curX + GRIDUNIT / 2, this.curY + GRIDUNIT / 2, GRIDUNIT / 2 - 1, initialAngle, endAngle);
		ctx.lineTo(this.curX + GRIDUNIT / 2, this.curY + GRIDUNIT / 2);
		ctx.fillStyle = "yellow";
		ctx.fill();
	}
}

class Ghost extends Character {
	constructor(x, y, direction, color) {
		super(x, y, direction)
		this.color = color;
	}

	draw() {
		// Upper body
		ctx.beginPath();
		ctx.fillStyle = this.color;

		ctx.moveTo(this.curX + 1, this.curY + GRIDUNIT);
		ctx.lineTo(this.curX + 1, this.curY + GRIDUNIT / 2);
		ctx.arc(this.curX + GRIDUNIT / 2, this.curY + GRIDUNIT / 2, GRIDUNIT / 2 - 1, Math.PI, 0);
		ctx.lineTo(this.curX + GRIDUNIT - 1, this.curY + GRIDUNIT);
		
		// Legs
		for(let i = 5; i >= 0; i--) {
			const x = (this.curX + 1) + (GRIDUNIT - 2) * i/6;
			const y = i % 2 == 0 ? this.curY + GRIDUNIT : this.curY + GRIDUNIT * 3/4;
			ctx.lineTo(x, y);
		}

		ctx.fill();

		// Outer eyes
		ctx.beginPath();
		ctx.fillStyle = "white";

		const eyeX = this.curX + GRIDUNIT / 4 + 1;
		const eyeY = this.curY + GRIDUNIT / 2 - 2;
		ctx.ellipse(eyeX, eyeY, 4, 5, 0, 0, 2 * Math.PI);
		ctx.ellipse(this.curX + GRIDUNIT - (GRIDUNIT / 4 + 1), eyeY, 4, 5, 0, 0, 2 * Math.PI);

		ctx.fill();

		// Inner eyes
		ctx.beginPath();
		ctx.fillStyle = "black";

		let lookX = 0;
		let lookY = 0;

		this.doByDirection(
			() => lookY = -2.5,
			() => lookY = +2.5,
			() => lookX = +1.5,
			() => lookX = -1.5);

		const inEyeX = eyeX + lookX;
		const inEyeY = eyeY + lookY;
		ctx.arc(inEyeX, inEyeY, GRIDUNIT / 12, 0, 2 * Math.PI);
		ctx.arc(this.curX + GRIDUNIT + lookX - (GRIDUNIT / 4 + 1), inEyeY, GRIDUNIT / 12, 0, 2 * Math.PI);

		ctx.fill();
	}
}

document.addEventListener("keydown", (e) => {
	switch(e.key) {
		case "ArrowUp":
		case "w":
			key = Direction.north; break;
		case "ArrowRight":
		case "d":
			key = Direction.east; break;
		case "ArrowLeft":
		case "a":
			key = Direction.west; break;
		case "ArrowDown":
		case "s":
			key = Direction.south; break;
		case "Enter":
		case " ":
			break;
	}
});

let pacman;
let ghost;
let key;
let interval;
let frames;

function setup() {
	pacman = new Pacman(10, 12, Direction.north);
	key = Direction.west;
	frames = SPEED;

	ghost = new Ghost(1, 2, Direction.west, "red");

	draw();
	interval = setInterval(update, 1000 / FPS);
}

function update() {
	frames++;
	if(1000 / FPS * frames / SPEED >= 1) {
		frames = 0;
		pacman.direction = key;
		pacman.gridMove();
		if(!pacman.isBlocked) pacman.mouthGrowing = !pacman.mouthGrowing;
	} else {
		pacman.frameMove();
		if(!pacman.isBlocked) pacman.mouthOffset += (pacman.mouthGrowing ? -1 : 1) * (Math.PI / 4) / (SPEED / (1000 / FPS));
	}

	draw();
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawMap();
	pacman.draw();
	ghost.draw();
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
