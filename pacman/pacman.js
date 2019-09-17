const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const GRIDUNIT = 30;
const MAX_X = 50;
const MAX_Y = 50;

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

const Direction = Object.freeze({
	"north": 1,
	"south": 2,
	"east" : 3,
	"west" : 4
});

function drawWall(coord, length, direction) {
	let xSize;
	let ySize;

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

	if(direction === Direction.north || direction === Direction.south) {
		xSize = GRIDUNIT;
	} else {
		ySize = GRIDUNIT;
	}

	ctx.beginPath();
	ctx.rect(coord.pixelX, coord.pixelY, xSize, ySize);
	ctx.fill();
}

function setup() {
	drawWall(new Coord(1, 1), 19, Direction.east);
}

function update() {
}

setup();
