const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const GRIDUNIT = 25;
const MAP_WIDTH = 21;
const MAP_HEIGHT = 23;
const MOUTH_OFFSET = 10;
const FPS = 60;
const SPEED = 200;
const NO_UP_TILES = [{x: 9, y: 8}, {x: 11, y: 8}, {x: 9, y: 16}, {x: 11, y: 16}];
const Direction = Object.freeze({
	"north": 1,
	"south": 2,
	"east" : 3,
	"west" : 4
});
const Mode = Object.freeze({
	"scatter"   : 1,
	"chase"     : 2,
	"frightened": 3
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

	get isWall() {
		return map.some(w => this.equals(w));
	}

	toPixels() {
		return new Coord(this.x * GRIDUNIT, this.y * GRIDUNIT);
	}

	adjacentCoord(direction) {
		return this.coordByOffset(direction, 1);
	}

	coordByOffset(direction, offset) {
		return Coord.doByDirection(
			direction,
			() => new Coord(this.x, this.y - offset),
			() => new Coord(this.x, this.y + offset),
			() => new Coord(this.x + offset, this.y),
			() => new Coord(this.x - offset, this.y)
		);
	}

	equals(coord) {
		return this.x === coord.x && this.y === coord.y;
	}

	static doByDirection(direction, north, south, east, west) {
		switch(direction) {
			case Direction.north:
				return north();
			case Direction.south:
				return south();
			case Direction.east:
				return east();
			case Direction.west:
				return west();
		}

	}

	static opposite(direction) {
		return Coord.doByDirection(
			direction,
			() => Direction.south,
			() => Direction.north,
			() => Direction.west,
			() => Direction.east
		);
	}

	static distance(coord1, coord2) {
		return Math.sqrt(Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2));
		
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

	get nextPosition() {
		return this.position.adjacentCoord(this.direction);
	}

	gridMove() {
		if(this.nextPosition.isWall) {
			this.isBlocked = true;
			return;
		}

		this.offsetX = 0;
		this.offsetY = 0;

		this.previousPosition = this.position;
		this.position = this.nextPosition;
		this.isBlocked = false;
	}

	frameMove() {
		if(this.isBlocked) return;

		const pixelsPerFrame = GRIDUNIT / (SPEED / (1000 / FPS));

		Coord.doByDirection(
			this.direction,
			() => this.offsetY -= pixelsPerFrame,
			() => this.offsetY += pixelsPerFrame,
			() => this.offsetX += pixelsPerFrame,
			() => this.offsetX -= pixelsPerFrame
		);
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

		Coord.doByDirection(
			this.direction,
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
			}
		);

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

class Behavior {
	constructor(scatterTarget, chaseTargetFunction, speed) {
		this.scatterTarget = scatterTarget;
		this.chaseTargetFunction = chaseTargetFunction;
		this.speed = speed;
	}
}


class Ghost extends Character {
	constructor(x, y, direction, color, behavior) {
		super(x, y, direction)
		this.color = color;
		this.mode = Mode.scatter;
		this.behavior = behavior;
	}

	get target() {
		switch(this.mode) {
			case Mode.scatter:
				return this.behavior.scatterTarget;
			case Mode.frightened:
				return null;
			case Mode.chase:
				return this.behavior.chaseTargetFunction();
		}
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

		Coord.doByDirection(
			this.direction,
			() => lookY = -2.5,
			() => lookY = +2.5,
			() => lookX = +1.5,
			() => lookX = -1.5
		);

		const inEyeX = eyeX + lookX;
		const inEyeY = eyeY + lookY;
		ctx.arc(inEyeX, inEyeY, GRIDUNIT / 12, 0, 2 * Math.PI);
		ctx.arc(this.curX + GRIDUNIT + lookX - (GRIDUNIT / 4 + 1), inEyeY, GRIDUNIT / 12, 0, 2 * Math.PI);

		ctx.fill();
	}

	determineDirection() {
		if(this.mode === Mode.frightened) {
			let newDirection;
			do {
				newDirection = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
			} while(newDirection === Coord.opposite(this.direction) || this.position.adjacentCoord(newDirection).isWall);

			this.direction = newDirection;
			return;
		}

		const paths = {
			1: this.position.adjacentCoord(Direction.north),
			2: this.position.adjacentCoord(Direction.south),
			3: this.position.adjacentCoord(Direction.east),
			4: this.position.adjacentCoord(Direction.west)
		};

		const back = this.position.adjacentCoord(Coord.opposite(this.direction));
		const validDirections = Object.keys(paths).filter(k => !paths[k].isWall && !paths[k].equals(back));

		if(NO_UP_TILES.some(t => this.position.equals(t))) {
			const index = validDirections.indexOf("1");
			if(index != -1) {
				validDirections.splice(index, 1);
			}
		}

		if(validDirections.length === 0) return;

		let best = null;
		let direction = null;
		validDirections.forEach(k => {
			const distance = Coord.distance(this.target, paths[k]);

			if(best > distance || best === null) {
				best = distance;
				direction = k;
			}
		});

		this.direction = parseInt(direction);
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
let ghosts;
let key;
let interval;
let frames;

function setup() {
	pacman = new Pacman(10, 12, Direction.north);
	key = Direction.north;
	frames = SPEED;

	const oikakeChaseFunc = () => pacman.position;
	const oikakeBehavior = new Behavior(new Coord(MAP_WIDTH - 3, 0), oikakeChaseFunc);
	const oikake = new Ghost(10, 8, Direction.west, "red", oikakeBehavior);

	const machibuseChaseFunc = () => pacman.position.coordByOffset(pacman.direction, 4);
	const machibuseBehavior = new Behavior(new Coord(2, 0), machibuseChaseFunc);
	const machibuse = new Ghost(10, 8, Direction.west, "pink", machibuseBehavior);

	const kimagureChaseFunc = () => {
		const pacOffset = pacman.position.coordByOffset(pacman.direction, 2);
		const diffX = pacOffset.x - oikake.x;
		const diffY = pacOffset.y - oikake.y;
		return new Coord(oikake.x + 2 * diffX, oikake.y + 2 * diffY);
	};
	const kimagureBehavior = new Behavior(new Coord(MAP_WIDTH - 1, MAP_HEIGHT - 1), kimagureChaseFunc);
	const kimagure = new Ghost(10, 8, Direction.west, "cyan", kimagureBehavior);

	const otobokeChaseFunc = () => Coord.distance(otoboke.position, pacman.position) > 8 ? oikakeChaseFunc() : new Coord(0, MAP_HEIGHT - 1);
	const otobokeBehavior = new Behavior(new Coord(0, MAP_HEIGHT - 1), otobokeChaseFunc);
	const otoboke = new Ghost(10, 8, Direction.west, "orange", otobokeBehavior);

	ghosts = [oikake, machibuse, kimagure, otoboke];
	ghosts.forEach(g => g.mode = Mode.chase);

	draw();
	interval = setInterval(update, 1000 / FPS);
}

function update() {
	frames++;
	if(1000 / FPS * frames / SPEED >= 1) {
		frames = 0;

		// Pacman
		pacman.direction = key;
		pacman.gridMove();
		if(!pacman.isBlocked) pacman.mouthGrowing = !pacman.mouthGrowing;

		// Ghosts
		ghosts.forEach(g => {
			g.determineDirection();
			g.gridMove();
		});
	} else {
		// Pacman
		pacman.frameMove();
		if(!pacman.isBlocked) pacman.mouthOffset += (pacman.mouthGrowing ? -1 : 1) * (Math.PI / 4) / (SPEED / (1000 / FPS));

		// Ghosts
		ghosts.forEach(g => g.frameMove());
	}

	draw();
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawMap();
	pacman.draw();
	ghosts.forEach(g => g.draw());

	// Draw targets
	// ghosts.forEach(g => {
	// 	if(g.mode === Mode.frightened) return;
	// 	ctx.beginPath();
	// 	ctx.arc(g.target.pixelX + GRIDUNIT / 2, g.target.pixelY + GRIDUNIT / 2, GRIDUNIT / 4, 0, 2 * Math.PI)
	// 	ctx.fillStyle = g.color;
	// 	ctx.fill()
	// });
}

function drawMap() {
	ctx.fillStyle = "black";

	map.forEach(w => {
		ctx.beginPath();
		ctx.rect(w.x * GRIDUNIT, w.y * GRIDUNIT, GRIDUNIT, GRIDUNIT);
		ctx.fill();
	});
}


setup();
