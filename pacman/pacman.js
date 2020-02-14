const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const GRIDUNIT = 25;
const MAP_WIDTH = 21;
const MAP_HEIGHT = 23;
const MOUTH_OFFSET = 10;
const FPS = 60;
const SPEED = 200;
const NO_UP_TILES = [{x: 9, y: 8}, {x: 11, y: 8}, {x: 9, y: 16}, {x: 11, y: 16}];
const HOUSE_CENTER = {x: 10, y: 10};
const GHOST_DOT_AMOUNTS = [
	{kimagure: 30, otoboke: 60}, // First level
	{kimagure: 0,  otoboke: 50}, // Second level
	{kimagure: 0,  otoboke: 0}   // Third level and beyond
];
const map = [
	1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
	1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
	1, 2, 4, 4, 4, 4, 4, 4, 4, 4, 2, 4, 4, 4, 4, 4, 4, 4, 4, 2, 1,
	1, 2, 4, 2, 2, 4, 2, 2, 2, 4, 2, 4, 2, 2, 2, 4, 2, 2, 4, 2, 1,
	1, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 1,
	1, 2, 4, 2, 2, 4, 2, 4, 2, 2, 2, 2, 2, 4, 2, 4, 2, 2, 4, 2, 1,
	1, 2, 4, 4, 4, 4, 2, 4, 4, 4, 2, 4, 4, 4, 2, 4, 4, 4, 4, 2, 1,
	1, 2, 2, 2, 2, 4, 2, 2, 2, 4, 2, 4, 2, 2, 2, 4, 2, 2, 2, 2, 1,
	1, 1, 1, 1, 2, 4, 2, 4, 4, 4, 4, 4, 4, 4, 2, 4, 2, 1, 1, 1, 1,
	2, 2, 2, 2, 2, 4, 2, 4, 2, 2, 2, 2, 2, 4, 2, 4, 2, 2, 2, 2, 2,
	4, 4, 4, 4, 4, 4, 4, 4, 2, 3, 3, 3, 2, 4, 4, 4, 4, 4, 4, 4, 4,
	2, 2, 2, 2, 2, 4, 2, 4, 2, 2, 2, 2, 2, 4, 2, 4, 2, 2, 2, 2, 2,
	1, 1, 1, 1, 2, 4, 2, 4, 4, 4, 4, 4, 4, 4, 2, 4, 2, 1, 1, 1, 1,
	1, 2, 2, 2, 2, 4, 2, 4, 2, 2, 2, 2, 2, 4, 2, 4, 2, 2, 2, 2, 1,
	1, 2, 4, 4, 4, 4, 4, 4, 4, 4, 2, 4, 4, 4, 4, 4, 4, 4, 4, 2, 1,
	1, 2, 4, 2, 2, 4, 2, 2, 2, 4, 2, 4, 2, 2, 2, 4, 2, 2, 4, 2, 1,
	1, 2, 4, 4, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 4, 4, 2, 1,
	1, 2, 2, 4, 2, 4, 2, 4, 2, 2, 2, 2, 2, 4, 2, 4, 2, 4, 2, 2, 1,
	1, 2, 4, 4, 4, 4, 2, 4, 4, 4, 2, 4, 4, 4, 2, 4, 4, 4, 4, 2, 1,
	1, 2, 4, 2, 2, 2, 2, 2, 2, 4, 2, 4, 2, 2, 2, 2, 2, 2, 4, 2, 1,
	1, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 1,
	1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
	1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
];

const Direction = Object.freeze({
	"north": 1,
	"south": 2,
	"east" : 3,
	"west" : 4
});
const PartType = Object.freeze({
	"outOfBounds" : 1,
	"wall"        : 2,
	"empty"       : 3,
	"dot"         : 4
});
const Mode = Object.freeze({
	"scatter"   : 1,
	"chase"     : 2,
	"frightened": 3,
	"inHouse"   : 4
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
		return typeOnMap(this) === PartType.wall;
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
		this.offsetX = 0;
		this.offsetY = 0;

		this.previousPosition = this.position;
		this.position = this.nextPosition;
		this.isBlocked = false;
	}

	frameMove() {
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
		this.isBlocked = false;
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
		super(x, y, direction);
		this.name = name;
		this.color = color;
		this.mode = Mode.inHouse;
		this.behavior = behavior;
		this.housePosition = new Coord(x, y);
		this.bouncingDirection = Direction.north;
		this.dots = 0;
	}

	get target() {
		switch(this.mode) {
			case Mode.scatter:
				return this.behavior.scatterTarget;
			case Mode.chase:
				return this.behavior.chaseTargetFunction();
			case Mode.frightened:
			case Mode.inHouse:
				return null;
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
let level;
let frames;

function setup() {
	pacman = new Pacman(10, 12, Direction.north);
	key = Direction.north;
	level = 1;
	frames = SPEED;

	// Chase functions
	const oikakeChaseFunc =    () => pacman.position;
	const machibuseChaseFunc = () => pacman.position.coordByOffset(pacman.direction, 4);
	const kimagureChaseFunc =  () => {
		const pacOffset = pacman.position.coordByOffset(pacman.direction, 2);
		const diffX = pacOffset.x - oikake.x;
		const diffY = pacOffset.y - oikake.y;
		return new Coord(oikake.x + 2 * diffX, oikake.y + 2 * diffY);
	};
	const otobokeChaseFunc =   () => Coord.distance(otoboke.position, pacman.position) >= 8 ? oikakeChaseFunc() : new Coord(0, MAP_HEIGHT - 1);

	// Behaviors
	const oikakeBehavior    = new Behavior(new Coord(MAP_WIDTH - 3, 0), oikakeChaseFunc);
	const machibuseBehavior = new Behavior(new Coord(2, 0), machibuseChaseFunc);
	const kimagureBehavior  = new Behavior(new Coord(MAP_WIDTH - 1, MAP_HEIGHT - 1), kimagureChaseFunc);
	const otobokeBehavior   = new Behavior(new Coord(0, MAP_HEIGHT - 1), otobokeChaseFunc);

	// Ghosts
	const oikake    = new Ghost(10, 8, Direction.west, "red", oikakeBehavior);
	const machibuse = new Ghost(10, 10, Direction.north, "pink", machibuseBehavior);
	const kimagure  = new Ghost(9, 10, Direction.north, "cyan", kimagureBehavior);
	const otoboke   = new Ghost(11, 10, Direction.north, "orange", otobokeBehavior);

	// Fixed dot amounts
	oikake.dots = 0;
	machibuse.dots = 0;

	// Dynamic dot amounts
	const dotObject = level < 3 ? GHOST_DOT_AMOUNTS[level - 1] : GHOST_DOT_AMOUNTS[2];
	kimagure.dots = dotObject["kimagure"];
	otoboke.dots  = dotObject["otoboke"];

	// Fixed mode
	oikake.mode = Mode.chase;

	ghosts = [oikake, machibuse, kimagure, otoboke];

	draw();
	interval = setInterval(update, 1000 / FPS);
}

function update() {
	frames++;

	if(1000 / FPS * frames / SPEED >= 1) {
		frames = 0;

		// Pacman
		pacman.direction = key;
		pacman.isBlocked = pacman.nextPosition.isWall;

		if(!pacman.isBlocked) {
			pacman.gridMove();
			pacman.mouthGrowing = !pacman.mouthGrowing;
		}

		// Ghosts
		ghosts.forEach(g => {
			// inHouse mode
			if(g.mode === Mode.inHouse) {
				if(g.dots > 0) return;

				g.offsetX = 0;
				g.offsetY = 0;

				switch(g.x) {
					case HOUSE_CENTER.x - 1:
						g.direction = Direction.east; break;
					case HOUSE_CENTER.x + 1:
						g.direction = Direction.west; break;
					case HOUSE_CENTER.x:
						if(g.y === HOUSE_CENTER.y - 2) {
							g.direction = Direction.west;
							g.mode = Mode.chase;
							break;
						}

						g.direction = Direction.north; break;
				}

				g.gridMove();
				return;
			}

			// frightened mode
			if(g.mode === Mode.frightened) {
				let newDirection;
				do {
					newDirection = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
				} while(newDirection === Coord.opposite(g.direction) || g.position.adjacentCoord(newDirection).isWall);

				g.direction = newDirection;
				g.gridMove();
				return;
			}

			// chase mode
			const paths = {
				1: g.position.adjacentCoord(Direction.north),
				2: g.position.adjacentCoord(Direction.south),
				3: g.position.adjacentCoord(Direction.east),
				4: g.position.adjacentCoord(Direction.west)
			};

			const back = g.position.adjacentCoord(Coord.opposite(g.direction));
			const validDirections = Object.keys(paths).filter(k => !paths[k].isWall && !paths[k].equals(back));

			if(NO_UP_TILES.some(t => g.position.equals(t))) {
				const index = validDirections.indexOf("1");
				if(index != -1) {
					validDirections.splice(index, 1);
				}
			}

			if(validDirections.length === 0) return;

			let best = null;
			let direction = null;
			validDirections.forEach(k => {
				const distance = Coord.distance(g.target, paths[k]);

				if(best > distance || best === null) {
					best = distance;
					direction = k;
				}
			});

			g.direction = parseInt(direction);
			g.gridMove();
		});
	} else {
		// Pacman
		if(!pacman.isBlocked) {
			pacman.frameMove();
			pacman.mouthOffset += (pacman.mouthGrowing ? -1 : 1) * (Math.PI / 4) / (SPEED / (1000 / FPS));
		}

		// Ghosts
		ghosts.forEach(g => {
			if(g.dots > 0) {
				if(g.bouncingDirection === Direction.north) {
					if(--g.offsetY === -3) g.bouncingDirection = Direction.south;
				} else {
					if(++g.offsetY === +3) g.bouncingDirection = Direction.north;
				}
				return;
			}

			g.frameMove();
		});
	}

	draw();
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);


	for(let i = 0; i < MAP_WIDTH * MAP_HEIGHT; i++) {
		if(map[i] === PartType.empty || map[i] === PartType.outOfBounds) continue;

		ctx.beginPath();

		const y = Math.floor(i / MAP_WIDTH);
		const x = i - y * MAP_WIDTH;
		const coord = new Coord(x, y);

		if(map[i] === PartType.wall) {
			ctx.fillStyle = "black";
			ctx.rect(coord.pixelX, coord.pixelY, GRIDUNIT, GRIDUNIT);
			ctx.fill();
			continue;
		}

		if(map[i] === PartType.dot) {
			ctx.fillStyle = "white";
			ctx.arc(coord.pixelX + GRIDUNIT / 2, coord.pixelY + GRIDUNIT / 2, GRIDUNIT / 8, 0, 2 * Math.PI);
			ctx.fill();
			continue;
		}
	}


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

function typeOnMap(coord) {
	const index = coord.y * MAP_WIDTH + coord.x;
	return map[index];
}

setup();
