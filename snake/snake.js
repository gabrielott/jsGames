const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const partInitAmount = 3;
const partSize = 10;
const partGap = 2;
const partColor = "black";

function Coord(x, y) {
	this.x = x;
	this.y = y;
	this.drawPart = function() {
		ctx.beginPath();
		ctx.rect(this.x, this.y, partSize, partSize);
		ctx.fillStyle = partColor;
		ctx.fill();
		ctx.closePath();
	}

	this.drawFood = function() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, partSize / 2, 0, Math.PI * 2);
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
			nextDirection = Direction.north; break;
		case "ArrowRight":
			if(direction === Direction.west) break;
			nextDirection = Direction.east; break;
		case "ArrowLeft":
			if(direction === Direction.east) break;
			nextDirection = Direction.west; break;
		case "ArrowDown":
			if(direction === Direction.north) break;
			nextDirection = Direction.south; break;
	}
});

const snake = []
let direction = null
let nextDirection = Direction.north;
let food = null;

for(let i = 0; i < (partSize + partGap) * partInitAmount; i += partSize + partGap) {
	const x = Math.round(canvas.width / 2 / (partSize + partGap)) * (partSize + partGap);
	const y = Math.round(canvas.height / 2 / (partSize + partGap)) * (partSize + partGap);
	snake.push(new Coord(x, y + i));
}

setInterval(update, 200);

function update() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	direction = nextDirection;
	snake.forEach((p) => p.drawPart());

	// Create new head
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

	// Create new food if needed or remove tail otherwise
	if(food === null || (head.x === food.x && head.y === food.y)) {
		let foodX;
		let fooxY;

		do {
			foodX = Math.round(Math.floor(Math.random() * canvas.width) / (partSize + partGap)) * (partSize + partGap);
			foodY = Math.round(Math.floor(Math.random() * canvas.height) / (partSize + partGap)) * (partSize + partGap);
		} while(snake.some((p) => foodX === p.x && foodY === p.y));

		food = new Coord(foodX, foodY);
		console.log("food", food.x, food.y);
	} else {
		food.drawFood();
		snake.pop();
	}

	// Check whether snake is out of bounds
	if(head.x > canvas.width || head.x < 0 || head.y > canvas.height || head.y < 0) {
		console.log("out");
	}

	snake.unshift(head);
}
