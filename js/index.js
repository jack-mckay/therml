import { Word } from "./Word.js";
import { Game } from "./Game.js";
import { markLetter, markKeyboardLetter } from "./utils.js";

const keyboard = document.getElementById("keyboard");
const boardElem = document.getElementById("board");
const definitionElem = document.getElementById("done");
const markingButtons = document.querySelectorAll('input[name="marking"]');
let marking = 'none';

boardElem.addEventListener("click", (e) => {
	const isLetterComplete = [...e.target.classList].some(className => className.startsWith("score"));
	if (isLetterComplete) {
		markLetter(e.target, marking);
		markKeyboardLetter(e.target.dataset.tile, marking);
	}
});

markingButtons.forEach((element) => {
	element.addEventListener("change", (e) => {
		marking = e.target.value;
	});
});

document.getElementById("reset").addEventListener("click", () => {
	document.getElementById("game").classList.add("loading");
	init();
});

const init = async () => {
	document.querySelectorAll(".keyboard-button").forEach(key => key.classList = ["keyboard-button"]);

	const urlParams = new URLSearchParams(window.location.search);
	const gameType = urlParams.has("free") ? 'free' : 'daily';

	const wordOfTheDay = new Word(gameType);
	await wordOfTheDay.fetchWord();
	if (wordOfTheDay?.word) {
		const game = new Game(wordOfTheDay, boardElem, definitionElem, gameType);
		game.drawGrid();		

		document.addEventListener("keydown", (event) => {
			if (event.repeat) {
				return;
			}
			game.handleKeyPress(event.key)
		});
		
		keyboard.addEventListener("click", (e) => {
			if (!!e.target.dataset.key) {
				game.handleKeyPress(e.target.dataset.key)
			} 
		});
	}
};

init();
