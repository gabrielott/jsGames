const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const partInitAmount = 4;
const partSize = 25;
const partColor = "#0E2A40";
const fps = 60;
const speed = 150;

function Coord(x, y, direction) {
	this.x = x;
	this.y = y;
	this.direction = direction;

	this.drawPart = function() {
		ctx.beginPath();
		ctx.rect(this.x, this.y, partSize, partSize);
		ctx.fillStyle = partColor;
		ctx.fill();
		ctx.closePath();
	}

	this.drawFood = function() {
		const visualX = this.x + partSize / 2;
		const visualY = this.y + partSize / 2;
		ctx.beginPath();
		ctx.arc(visualX, visualY, partSize / 2, 0, Math.PI * 2);
		ctx.fillStyle = partColor;
		ctx.fill();
		ctx.closePath();
	}

	this.move = function(direction, offset) {
		let newX = this.x;
		let newY = this.y;
		switch(direction) {
			case Direction.north:
				newY = this.y - offset; break;
			case Direction.south:
				newY = this.y + offset; break;
			case Direction.east:
				newX = this.x + offset; break;
			case Direction.west:
				newX = this.x - offset; break;
		}

		return new Coord(newX, newY, direction);
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
			if(isOver) setup();
	}
});

ctx.textAlign = "center";
ctx.font = "30px Arial";
ctx.fillText("Press enter to start", canvas.width / 2, canvas.height / 2);

const snake = [];
let direction;
let nextDirection;
let food;
let isOver = true;
let isGrowing;
let score;
let frames;
let visualHead;
let visualTail;
let interval;

function setup() {
	snake.length = 0;
	direction = null;
	nextDirection = Direction.north;
	food = null;
	isOver = false;
	isGrowing = false;
	score = 0;
	frames = speed;

	// Fills the array with the snake's inital parts
	for(let i = 0; i < partSize * partInitAmount; i += partSize) {
		const x = Math.round(canvas.width / 2 / partSize) * partSize;
		const y = Math.round(canvas.height / 2 / partSize) * partSize;
		snake.push(new Coord(x, y + i, Direction.north));
	}

	interval = setInterval(update, 1000 / fps);
}

function update() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	frames++;

	// Runs every speed milliseconds
	if(1000 / fps * frames / speed >= 1) {
		frames = 0;

		// Fixes the movement of the last part of the snake when changing direction
		if(direction !== nextDirection) {
			snake[0].direction = nextDirection;
			direction = nextDirection;
		}

		// Creates new food when needed, making sure it doesn't spawn on the snake
		// In this case, the snake's tail doesn't get removed, which makes the snake grow
		if(food === null || (snake[0].x === food.x && snake[0].y === food.y)) {
			let foodX;
			let foodY;

			do {
				foodX = Math.floor(Math.random() * canvas.width / partSize) * partSize;
				foodY = Math.floor(Math.random() * canvas.height / partSize) * partSize;
			} while(snake.some((p) => foodX === p.x && foodY === p.y));

			if(food !== null) isGrowing = true;
			food = new Coord(foodX, foodY);

			document.getElementById("score").innerHTML = `Score: ${score++}`;
		} else {
			snake.pop();
			isGrowing = false;
		}

		// Creates the snake's new head
		const head = snake[0].move(direction, partSize);

		// Sets the starting point of the parts used to animate the snake
		visualHead = snake[0];
		visualTail = snake[snake.length - 1];

		// Checks whether the snake is out of bounds
		if(head.x > canvas.width || head.x < 0 || head.y > canvas.height || head.y < 0) {
			gameover();
		}

		// Checks whether the snake hit itself
		if(snake.slice(0, snake.length - 1).some((p) => head.x === p.x && head.y === p.y)) {
			gameover();
		}

		snake.unshift(head);
	} else {
		// Animates the snake
		visualHead = visualHead.move(visualHead.direction, partSize / (speed / (1000 / fps)));
		visualTail = visualTail.move(visualTail.direction, partSize / (speed / (1000 / fps)));
	}

	// Draws everything
	snake.slice(1, snake.length - 1).forEach((p) => p.drawPart());
	visualHead.drawPart();
	if(!isGrowing) visualTail.drawPart();
	food.drawFood();
}

function gameover() {
	clearInterval(interval);
	isOver = true;

	ctx.font = "30px Arial";
	ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);

	ctx.font = "20px Arial";
	ctx.fillText("Press enter to retry", canvas.width / 2, canvas.height * 0.6);
}
