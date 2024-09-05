const ALLOWED_GUESSES = 10;
const WORD_LENGTH = 5;
const boardElem = document.getElementById("board");
const definitionElem = document.getElementById("done");
const keys = document.querySelectorAll(".keyboard-button");
let letters, rows, word, wordArr;
let done = false;
let loading = true;
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
	boardElem.innerHTML = "";

	for (let i = 0; i < (ALLOWED_GUESSES); i++) {
		const row = document.createElement("div");
		row.classList.add("row");
		boardElem.appendChild(row);

		for (let i = 0; i < WORD_LENGTH; i++) {
			const tile = document.createElement("div");
			tile.classList.add("tile");
			row.appendChild(tile);
		}

		const hint = document.createElement("div");
		hint.classList.add("hint");
		row.appendChild(hint);
	}
	letters = document.querySelectorAll(".tile");
	rows = document.querySelectorAll(".row");
};

const reset = () => {
	currentGuess = "";
	currentRow = 0;
	letters.forEach(letter => {
		letter.className = "tile";
		letter.innerHTML = "";
	});
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
		letter.classList.remove("invalid");
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
		rows[currentRow].querySelector(".hint").innerText = "🔥";
	} else {
		rows[currentRow].querySelector(".hint").innerText = "😞";
	}
	definitionElem.style.display = "inline-block";
	done = true;
}

const handleKeyPress = (e) => {
	if (done) {
		return;
	}
	const action = e.key;
	if (e.repeat) {
		return;
	}
	if (isLetter(action)) {
		addLetter(action.toUpperCase());
	} else if (["Backspace","Delete",8,46].includes(action)) {
		deleteLetter();
	} else if (action === "Enter") {
		commit();
	}
}

const handleKeyboardClick = (key) => {
	if (done) {
		return;
	}
	if (isLetter(key)) {
		addLetter(key.toUpperCase());
	} else if (key === "backspace") {
		deleteLetter();
	} else if (key === "enter") {
		commit();
	}
}

const handleScore = async (score) => {
	for (let i = 0; i < WORD_LENGTH; i++) {
		letters[currentRow * WORD_LENGTH + i].classList.add(`score-${score}`)
	}
	rows[currentRow].querySelector(".hint").innerText = score + " points";
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
			markInvalid();

		} else if (!!currentGuess) {
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
	drawGrid();
	reset();

	const res = await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
	const {word: wordRes} = await res.json();
	word = wordRes.toUpperCase();
	wordArr = word.split("");

	const def = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
	const definition = await def.json();
	if (!!definition) {
		const firstDef = definition[0];
		definitionElem.querySelector(".word").innerText = firstDef.word.toUpperCase();
		definitionElem.querySelector(".phonetic").innerText = !!firstDef.phonetic ? firstDef.phonetic : "";
		definitionElem.querySelector(".definition").innerText = firstDef.meanings[0].definitions[0].definition;
	}

	if (!!word) {
		document.getElementById("game").classList.remove("loading");
		document.addEventListener("keydown", handleKeyPress);
	}
}

keys.forEach(element => {
	element.addEventListener("click", (e) => {
		handleKeyboardClick(e.target.dataset.key);
    });
});

document.getElementById('reset').onclick = () => {init()};

init();