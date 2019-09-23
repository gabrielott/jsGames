const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const GRIDUNIT = 25;
const MAP_WIDTH = 21;
const MAP_HEIGHT = 23;
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
		return this.position.pixelX;
	}

	set pixelX(x) {
		this.position.pixelX = x;
	}

	get pixelY() {
		return this.position.pixelY;
	}

	set pixelY(y) {
		this.position.pixelY = y;
	}

	move() {
		switch(this.direction) {
			case Direction.north:
				this.y--; break;
			case Direction.south:
				this.y++; break;
			case Direction.east:
				this.x++; break;
			case Direction.west:
				this.x--; break;
		}
	}
}

function drawWall(coord, length, direction) {
	let xSize = GRIDUNIT;
	let ySize = GRIDUNIT;

	switch(direction) {
		case Direction.north:
			ySize = -length * GRIDUNIT; break;
		case Direction.south:
			ySize = length * GRIDUNIT; break;
		case Direction.east:
			xSize = length * GRIDUNIT; break;
		case Direction.west:
			xSize = -length * GRIDUNIT; break;
	}

	const x = direction === Direction.west ? coord.pixelX + GRIDUNIT : coord.pixelX;
	const y = direction === Direction.north ? coord.pixelY + GRIDUNIT : coord.pixelY;

	for(let i = 0; i < xSize / GRIDUNIT; i++) {
		for(let j = 0; j < ySize / GRIDUNIT; j++) {
			walls.push(new Coord(coord.x + i, coord.y + j));
		}
	}

	ctx.beginPath();
	ctx.rect(x, y, xSize, ySize);
	ctx.fill();
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

const walls = [];
const pacman = new Character();
let interval;

function setup() {
	pacman.direction = Direction.north;
	pacman.x = 10;
	pacman.y = 12;

	draw();
	interval = setInterval(update, 500);
}

function update() {
	// pacman.move();
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
	drawWall(new Coord(1,  1),   19, Direction.east);
	drawWall(new Coord(1,  2),   6,  Direction.south);
	drawWall(new Coord(3,  3),   2,  Direction.east);
	drawWall(new Coord(3,  5),   2,  Direction.east);
	drawWall(new Coord(2,  7),   3,  Direction.east);
	drawWall(new Coord(4,  8),   2,  Direction.south);
	drawWall(new Coord(3,  9),   4,  Direction.west);
	drawWall(new Coord(6,  3),   3,  Direction.east);
	drawWall(new Coord(10, 2),   2,  Direction.south);
	drawWall(new Coord(6,  5),   5,  Direction.south);
	drawWall(new Coord(7,  7),   2,  Direction.east);
	drawWall(new Coord(6,  11),  3,  Direction.south);
	drawWall(new Coord(0,  11),  5,  Direction.east);
	drawWall(new Coord(4,  12),  2,  Direction.south);
	drawWall(new Coord(3,  13),  3,  Direction.west);
	drawWall(new Coord(1,  14),  8,  Direction.south);
	drawWall(new Coord(2,  21),  18, Direction.east);
	drawWall(new Coord(2,  17),  1,  Direction.east);
	drawWall(new Coord(3,  15),  2,  Direction.east);
	drawWall(new Coord(4,  16),  2,  Direction.south);
	drawWall(new Coord(3,  19),  6,  Direction.east);
	drawWall(new Coord(6,  18),  2,  Direction.north);
	drawWall(new Coord(6,  15),  3,  Direction.east);
	drawWall(new Coord(8,  17),  5,  Direction.east);
	drawWall(new Coord(10, 18),  2,  Direction.south);
	drawWall(new Coord(8,  13),  5,  Direction.east);
	drawWall(new Coord(10, 14),  2,  Direction.south);
	drawWall(new Coord(8,  11),  5,  Direction.east);
	drawWall(new Coord(8,  9),   5,  Direction.east);
	drawWall(new Coord(8,  10),  1,  Direction.east);
	drawWall(new Coord(12, 10),  1,  Direction.east);
	drawWall(new Coord(8,  5),   5,  Direction.east);
	drawWall(new Coord(10, 6),   2,  Direction.south);
	drawWall(new Coord(12, 3),   3,  Direction.east);
	drawWall(new Coord(16, 3),   2,  Direction.east);
	drawWall(new Coord(16, 5),   2,  Direction.east);
	drawWall(new Coord(14, 5),   5,  Direction.south);
	drawWall(new Coord(13, 7),   2,  Direction.west);
	drawWall(new Coord(14, 11),  3,  Direction.south);
	drawWall(new Coord(12, 15),  3,  Direction.east);
	drawWall(new Coord(12, 19),  6,  Direction.east);
	drawWall(new Coord(14, 18),  2,  Direction.north);
	drawWall(new Coord(16, 17),  2,  Direction.north);
	drawWall(new Coord(16, 15),  2,  Direction.east);
	drawWall(new Coord(18, 17),  1,  Direction.east);
	drawWall(new Coord(19, 20),  8,  Direction.north);
	drawWall(new Coord(18, 13),  3,  Direction.west);
	drawWall(new Coord(16, 12),  2,  Direction.north);
	drawWall(new Coord(17, 11),  4,  Direction.east);
	drawWall(new Coord(17, 9),   4,  Direction.east);
	drawWall(new Coord(16, 9),   3,  Direction.north);
	drawWall(new Coord(17, 7),   3,  Direction.east);
	drawWall(new Coord(19, 6),   5,  Direction.north);
}

setup();
