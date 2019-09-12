const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const Direction = Object.freeze({
	"north": 1,
	"south": 2,
	"east" : 3,
	"west" : 4
});

drawWall(100, 300, Direction.south, 100, 20);

ctx.beginPath();
ctx.arc(200, 200, 20, 0, Math.PI / 2);
ctx.stroke();

function drawWall(x1, y1, direction, length, thickness) {
	let x2 = x1;
	let y2 = y1;
	switch(direction) {
		case Direction.north:
			y2 -= length; break;
		case Direction.south:
			y2 += length; break;
		case Direction.west:
			x2 -= length; break;
		case Direction.east:
			x2 += length; break;
	}

	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);

	if(direction === Direction.north || direction === Direction.south) {
		ctx.moveTo(x1 + thickness, y1);
		ctx.lineTo(x2 + thickness, y2);
	} else {
		ctx.moveTo(x1, y1 + thickness);
		ctx.lineTo(x2, y2 + thickness);
	}

	ctx.stroke();
}

function drawCorner(x, y, d1, d2) {
}

function setup() {
}

function update() {
}
