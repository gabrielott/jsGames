const fields = [];
const endObjects = document.getElementsByClassName("end");

let current = true;
let over = false;
let round = 0;

document.getElementById("end-button").addEventListener("click", handleEndClick);

for(let i = 0; i < 7; i += 3) {
	let line = [];
	for(let ii = 0; ii < 3; ii++) {
		const object = document.getElementById(i + ii);
		line.push(object);
		object.addEventListener("click", handleClick);
	}
	fields.push(line);
}

function handleClick(event) {
	if(over) return;

	const clicked = event.target;

	if(clicked.innerHTML !== "") return;
	clicked.innerHTML = current ? "X" : "O";
	clicked.setAttribute("data-clicked", "true");

	const id = clicked.id;
	const line = Math.floor(id / 3);
	const row = id % 3;

	// Horizontal
	for(let i = 0; i < 3; i++) {
		if(fields[line][i].innerHTML !== clicked.innerHTML) break;
		if(i === 2) {
			end(current);
			return;
		}
	}

	// Vertical
	for(let i = 0; i < 3; i++) {
		if(fields[i][row].innerHTML !== clicked.innerHTML) break;
		if(i === 2) {
			end(current);
			return;
		}
	}

	// Diagonais
	for(let i = 0; i < 3; i++) {
		if(fields[i][i].innerHTML !== clicked.innerHTML) break;
		if(i === 2) {
			end(current);
			return;
		}
	}

	for(let i = 0; i < 3; i++) {
		if(fields[i][2 - i].innerHTML !== clicked.innerHTML) break;
		if(i === 2) {
			end(current);
			return;
		}
	}

	current = !current;

	if(++round === 9) end(null);
}

function handleEndClick(event) {
	for(let line of fields) {
		for(let field of line) {
			field.innerHTML = "";
			field.setAttribute("data-clicked", "false");
		}
	}

	for(let object of endObjects) {
		object.style.visibility = "hidden";
	}

	current = true;
	over = false;
	round = 0;
}

function end(winner) {
	if(winner === null) {
		document.getElementById("end-message").innerHTML = "Empate!";
	} else {
		document.getElementById("end-message").innerHTML = (winner ? "X" : "O") + " ganhou!";
	}

	over = true;

	for(let object of endObjects) {
		object.style.visibility = "visible";
	}
}
