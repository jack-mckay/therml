// takes an array of letters (like ['E', 'L', 'I', 'T', 'E']) and creates
// an object out of it (like {E: 2, L: 1, T: 1}) so we can use that to
// make sure we get the correct amount of letters marked almost instead
// of just wrong or correct
export const makeMap = (array) => {
	const obj = {};
	for (let i = 0; i < array.length; i++) {
		if (obj[array[i]]) {
			obj[array[i]]++;
		} else {
			obj[array[i]] = 1;
		}
	}
	return obj;
};

export const isLetter = (letter) => /^[a-zA-Z]$/.test(letter);

export const markLetter = (elem, marking) => {
	switch (marking) {
		case "absent":
			elem.classList.remove("present", "correct");
			elem.classList.toggle("absent");
			break;
		case "present":
			elem.classList.remove("absent", "correct");
			elem.classList.toggle("present");
			break;
		case "correct":
			elem.classList.remove("present", "absent");
			elem.classList.toggle("correct");
			break;
		default:
			elem.classList.remove("present", "correct", "absent");
	}
};

export const markKeyboardLetter = (letter, marking) => {
	const keyBoardLetter = document.querySelectorAll(`.keyboard-button[data-key=${letter}]`)[0];	
	//Do not mark if any letters are already marked
	//If any letters are correct, mark correct etc..
	if (document.querySelectorAll(`.correct[data-tile=${letter}]`).length > 0) {
		keyBoardLetter.classList.remove("present", "absent");
		keyBoardLetter.classList.add("correct");
	} 
	else if (document.querySelectorAll(`.present[data-tile=${letter}]`).length > 0) {
		keyBoardLetter.classList.remove("absent", "correct");
		keyBoardLetter.classList.add("present");
	}
	else if (document.querySelectorAll(`.absent[data-tile=${letter}]`).length > 0) {
		keyBoardLetter.classList.remove("present", "correct");
		keyBoardLetter.classList.add("absent");
	} 
	else if (!!keyBoardLetter) {
		markLetter(keyBoardLetter, marking)
	}
}
