import {makeMap, isLetter, markLetter} from './utils.js';

export class Game {
    constructor(wordObj, boardElem, definitionElem, gameType) {
        this.gameType = gameType;
        this.allowedGuesses = 10;
        this.word = wordObj.word;
        this.definition = wordObj.definition;
        this.phonetic = wordObj.phonetic;
        this.wordArr = wordObj.wordArr;
        this.wordLength = wordObj?.word?.length;
        this.boardElem = boardElem;
        this.definitionElem = definitionElem;
        this.letters = [];
        this.rows = [];
        this.done = false;
        this.currentGuess = "";
        this.currentRow = 0;
    }

    drawGrid () {
        this.boardElem.innerHTML = "";
        if (this.gameType == "daily") {
            this.definitionElem.querySelector("#freeActions").style.display = "none";
        } else {
            this.definitionElem.querySelector("#dailyActions").style.display = "none";
        }
        
        for (let i = 0; i < this.allowedGuesses; i++) {
            const row = document.createElement("div");
            row.classList.add("row");
            this.boardElem.appendChild(row);
    
            for (let i = 0; i < this.wordLength; i++) {
                const tile = document.createElement("div");
                tile.classList.add("tile");
                row.appendChild(tile);
            }
    
            const hint = document.createElement("div");
            hint.classList.add("hint");
            row.appendChild(hint);
        }
        this.letters = document.querySelectorAll(".tile");
        this.rows = document.querySelectorAll(".row");
        
        this.definitionElem.style.display = "none";
        document.getElementById("game").classList.remove("loading");
    };
    
    addLetter(letter) {
        if (this.currentGuess.length < this.wordLength) {
            this.currentGuess += letter;
            this.letters[this.currentRow * this.wordLength + this.currentGuess.length - 1].innerText =
                letter;
            this.letters[this.currentRow * this.wordLength + this.currentGuess.length - 1].dataset.tile = letter.toLowerCase();
        }
    };
    
    deleteLetter() {
        this.currentGuess = this.currentGuess.length <= 1 ? "" : this.currentGuess.slice(0, -1);
        this.letters[this.currentRow * this.wordLength + this.currentGuess.length].innerText = "";
        this.letters[this.currentRow * this.wordLength + this.currentGuess.length].classList = ["tile"];
        delete this.letters[this.currentRow * this.wordLength + this.currentGuess.length].dataset.tile;
    };
    
    resetInvalid() {
        this.letters.forEach((letter) => {
            letter.classList.remove("invalid");
        });
    };
    
    markInvalid() {
        for (let i = 0; i < this.wordLength; i++) {
            this.letters[this.currentRow * this.wordLength + i].classList.add("invalid");
        }
    };
    
    handleWin(win) {
        if (win) {
            for (let i = 0; i < this.wordLength; i++) {
                this.letters[this.currentRow * this.wordLength + i].classList.add("winner");
            }
            this.rows[this.currentRow].querySelector(".hint").innerText = "🔥";
        } else {
            this.rows[this.currentRow].querySelector(".hint").innerText = "😞";
        }
        this.showDefinition();
    };

    showDefinition() {
        this.done = true;
        this.definitionElem.style.display = "inline-block";
        this.definitionElem.querySelector(".word").innerText = this.word;
		this.definitionElem.querySelector(".phonetic").innerText = this.phonetic;
		this.definitionElem.querySelector(".definition").innerText = this.definition;
    }
    
    handleKeyPress(action) {
        if (this.done) {
            return;
        }
        if (isLetter(action)) {
            this.addLetter(action.toUpperCase());
        } else if (["Backspace", "backspace", "Delete", 8, 46].includes(action)) {
            this.resetInvalid();
            this.deleteLetter();
        } else if (action === "Enter" || action === "enter") {
            this.commit();
        }
    };
    
    async handleScore (score) {
        for (let i = 0; i < this.wordLength; i++) {
            this.letters[this.currentRow * this.wordLength + i].classList.add(`score-${score}`);
        }
        this.rows[this.currentRow].querySelector(".hint").innerText = score + " points";
    };
    
    async commit() {
        if (this.currentGuess.length === this.wordLength) {
            //VALIDATE WORD
            const res = await fetch("https://words.dev-apis.com/validate-word", {
                method: "POST",
                body: JSON.stringify({ word: this.currentGuess }),
            });
            const { validWord } = await res.json();
            if (!validWord) {
                this.markInvalid();
            } else if (!!this.currentGuess) {
                const guess = this.currentGuess.split("");
                const wordMap = makeMap(this.wordArr);

                if (this.currentGuess === this.word) {
                    this.handleWin(true);
                    return;
                }
    
                let score = 0;
                for (let i = 0; i < this.wordLength; i++) {
                    if (guess[i] === this.wordArr[i]) {
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
                await this.handleScore(score);
    
                if (this.currentRow === this.allowedGuesses - 1) {
                    this.handleWin(false);
                } else {
                    this.currentRow++;
                    this.currentGuess = "";
                }
            }
        }
    };
}