const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const partInitAmount = 4;
const partSize = 10;
const partGap = 0;
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
		const visualX = this.x + (partSize + partGap) / 2;
		const visualY = this.y + (partSize + partGap) / 2;
		ctx.beginPath();
		ctx.arc(visualX, visualY, partSize / 2, 0, Math.PI * 2);
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
		case "w":
			if(direction === Direction.south) break;
			nextDirection = Direction.north; break;
		case "ArrowRight":
		case "d":
			if(direction === Direction.west) break;
			nextDirection = Direction.east; break;
		case "ArrowLeft":
		case "a":
			if(direction === Direction.east) break;
			nextDirection = Direction.west; break;
		case "ArrowDown":
		case "s":
			if(direction === Direction.north) break;
			nextDirection = Direction.south; break;
		case "Enter":
		case " ":
			if(!over) break;
			setup(); break;
	}
});

ctx.textAlign = "center";
ctx.font = "30px Arial";
ctx.fillText("Press enter to start", canvas.width / 2, canvas.height / 2);

const snake = [];
let direction;
let nextDirection;
let food;
let over = true;
let interval;

function setup() {
	snake.length = 0;
	direction = null;
	nextDirection = Direction.north;
	food = null;
	over = false;

	// Fills the array with the snake's inital parts
	for(let i = 0; i < (partSize + partGap) * partInitAmount; i += partSize + partGap) {
		const x = Math.round(canvas.width / 2 / (partSize + partGap)) * (partSize + partGap);
		const y = Math.round(canvas.height / 2 / (partSize + partGap)) * (partSize + partGap);
		snake.push(new Coord(x, y + i));
	}

	interval = setInterval(update, 200);
}

function update() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	direction = nextDirection;

	// Creates new food when needed, making sure it doesn't spawn on the snake
	// In this case, the snake's tail doesn't get removed, which makes the snake grow
	if(food === null || (snake[0].x === food.x && snake[0].y === food.y)) {
		let foodX;
		let foodY;

		do {
			foodX = Math.round(Math.floor(Math.random() * canvas.width) / (partSize + partGap)) * (partSize + partGap);
			foodY = Math.round(Math.floor(Math.random() * canvas.height) / (partSize + partGap)) * (partSize + partGap);
		} while(snake.some((p) => foodX === p.x && foodY === p.y));

		food = new Coord(foodX, foodY);
	} else {
		snake.pop();
	}

	food.drawFood();

	// Creates the snake's new head
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

	// Checks whether the snake is out of bounds
	if(head.x > canvas.width || head.x < 0 || head.y > canvas.height || head.y < 0) {
		gameover();
	}

	// Checks whether the snake hit itself
	if(snake.some((p) => head.x === p.x && head.y === p.y)) {
		gameover();
	}

	snake.forEach((p) => p.drawPart());

	snake.unshift(head);
}

function gameover() {
	clearInterval(interval);
	over = true;

	ctx.font = "30px Arial";
	ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);

	ctx.font = "20px Arial";
	ctx.fillText("Press enter to retry", canvas.width / 2, canvas.height * 0.6);
}
