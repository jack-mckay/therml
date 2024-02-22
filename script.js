const ALLOWED_GUESSES = 12;
const WORD_LENGTH = 5;
const boardElem = document.getElementById("board");
const definitionElem = document.getElementById("done");
let letters;
let done = false;
let loading = true;
let word = null;
let wordArr = null;
let currentGuess = "";
let currentRow = 0;

// takes an array of letters (like ['E', 'L', 'I', 'T', 'E']) and creates
// an object out of it (like {E: 2, L: 1, T: 1}) so we can use that to
// make sure we get the correct amount of letters marked almost instead
// of just wrong or correct
const makeMap = array => {
	const obj = {};
	for (let i = 0; i < array.length; i++) {
		if (obj[array[i]]) {
			obj[array[i]]++;
		} else {
			obj[array[i]] = 1;
		}
	}
	return obj;
}

const isLetter = letter => /^[a-zA-Z]$/.test(letter);

const drawGrid = () => {
	for (let i = 0; i < (WORD_LENGTH * ALLOWED_GUESSES); i++) {
		const tile = document.createElement("div");
		tile.classList.add("tile");
		boardElem.appendChild(tile);
	}
	letters = document.querySelectorAll(".tile")
};

const reset = () => {
	currentGuess = "";
	currentRow = "";
	letters.forEach(letter => {
		letter.className = "tile";
		letter.innerHTML = "";
	});
	score = 0;
	done = false;
	definitionElem.style.display = "none";
	definitionElem.querySelector(".word").innerText = "";
	definitionElem.querySelector(".phonetic").innerText = "";
	definitionElem.querySelector(".definition").innerText = "";
}

const addLetter = (letter) => {
	if (currentGuess.length < WORD_LENGTH) {
		currentGuess += letter;
		letters[currentRow * WORD_LENGTH + currentGuess.length - 1].innerText = letter;
	}
}

const deleteLetter = () => {
	resetInvalid();
	currentGuess = currentGuess.length <= 1 ? "" : currentGuess.slice(0, -1);
	letters[currentRow * WORD_LENGTH + currentGuess.length].innerText = "";
}

const resetInvalid = () => {
	letters.forEach(letter => {
		letter.classList.remove("invalid")
	})
}

const markInvalid = () => {
	for (let i = 0; i < WORD_LENGTH; i++) {
		letters[currentRow * WORD_LENGTH + i].classList.add("invalid")
	}
}

const handleWin = async (win) => {
	if (win) {
		for (let i = 0; i < WORD_LENGTH; i++) {
			letters[currentRow * WORD_LENGTH + i].classList.add("winner");
		}
	}
	definitionElem.style.display = "inline-block";
	score = 50;
	done = true;
}

const handleKeyPress = (e) => {
	if (done) {
		return;
	}
	const action = e.key;
	if (e.repeat) {
		return
	}
	if (isLetter(action)) {
		addLetter(action.toUpperCase());
	} else if (action === "Backspace") {
		deleteLetter();
	} else if (action === "Enter") {
		commit();
	}
}

handleScore = async (score) => {
	for (let i = 0; i < WORD_LENGTH; i++) {
		letters[currentRow * WORD_LENGTH + i].classList.add(`score-${score}`)
	}

	document.getElementById("score").innerText = score;
}

const commit = async () => {
	if (currentGuess.length === WORD_LENGTH) {
		//VALIDATE WORD
		const res = await fetch("https://words.dev-apis.com/validate-word", {
			method: "POST",
			body: JSON.stringify({word: currentGuess}),
		});
		const {validWord} = await res.json();
		if (!validWord) {

			// console.log(`Invalid word: ${currentGuess}`);
			markInvalid();

		} else if (!!currentGuess) {
			// console.log(`Valid word: ${currentGuess}`);

			const guess = currentGuess.split("");
			const wordMap = makeMap(wordArr);

			if (currentGuess === word) {
				handleWin(true);
				return;
			}

			let score = 0;
			for (let i = 0; i < WORD_LENGTH; i++) {
				if (guess[i] === wordArr[i]) {
					//CORRECT
					//remove instance of word from map
					wordMap[guess[i]]--;
					score = score + 10;

				} else if (wordMap[guess[i]] && wordMap[guess[i]] > 0) {
					//ALMOST
					//remove instance of word from map
					wordMap[guess[i]]--;
					score = score + 1;
				}
			}
			await handleScore(score);

			if (currentRow === ALLOWED_GUESSES - 1) {
				handleWin(false);
			} else {
				currentRow++;
				currentGuess = "";
			}
		}
	}
}

const init = async () => {
	await reset();

	const res = await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
	const {word: wordRes} = await res.json();
	word = wordRes.toUpperCase();
	wordArr = word.split("");

	const def = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
	const definition = await def.json();
	if (!!definition) {
		const firstDef = definition[0];
		// console.log(firstDef);
		definitionElem.querySelector(".word").innerText = firstDef.word.toUpperCase();
		definitionElem.querySelector(".phonetic").innerText = !!firstDef.phonetic ? firstDef.phonetic : "";
		definitionElem.querySelector(".definition").innerText = firstDef.meanings[0].definitions[0].definition;
	}

	if (!!word) {
		console.log(word)
		document.getElementById("game").classList.remove("loading");
		document.addEventListener("keydown", handleKeyPress)
	}
}

drawGrid();
init();