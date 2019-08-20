var fields = document.getElementsByClassName("play");

for(var field of fields) {
	field.addEventListener("click", handleClick);
}

var current = true;
function handleClick(event) {
	const clicked = event.target;
	if(clicked.innerHTML !== "_") return;

	clicked.innerHTML = current ? "X" : "O";
	current = current ? false : true;
}
