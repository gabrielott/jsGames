const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const partInitAmount = 3;
const partSize = 10;
const partGap = 2;
const partColor = "black";

function Coord(x, y) {
	this.x = x;
	this.y = y;
	this.draw = function() {
		ctx.beginPath();
		ctx.rect(this.x, this.y, partSize, partSize);
		ctx.fillStyle = partColor;
		ctx.fill();
		ctx.closePath();
	}
}

const Direction = Object.freeze({
	"north": 1,
	"south": 2,
	"east" : 3,
	"west" : 4
});

document.addEventListener("keydown", (e) => {
	switch(e.key) {
		case "ArrowUp":
			if(direction === Direction.south) break;
			direction = Direction.north; break;
		case "ArrowRight":
			if(direction === Direction.west) break;
			direction = Direction.east; break;
		case "ArrowLeft":
			if(direction === Direction.east) break;
			direction = Direction.west; break;
		case "ArrowDown":
			if(direction === Direction.north) break;
			direction = Direction.south; break;
	}
});

const snake = []
let direction = Direction.north;

for(let i = 0; i < (partSize + partGap) * partInitAmount; i += partSize + partGap) {
	snake.push(new Coord(canvas.width / 2, canvas.height / 2 + i));
}

setInterval(update, 200);

function update() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	snake.forEach((p) => p.draw());

	const head = (() => {
		switch(direction) {
			case Direction.north:
				return new Coord(snake[0].x, snake[0].y - partSize - partGap);
			case Direction.south:
				return new Coord(snake[0].x, snake[0].y + partSize + partGap);
			case Direction.east:
				return new Coord(snake[0].x + partSize + partGap, snake[0].y);
			case Direction.west:
				return new Coord(snake[0].x - partSize - partGap, snake[0].y);
		}
	})();

	snake.pop();
	snake.unshift(head);
}
