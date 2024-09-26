export class Word {
	constructor(gameType) {
		this.wordApiUrl =
			gameType == "daily"
				? "https://words.dev-apis.com/word-of-the-day"
				: "https://words.dev-apis.com/word-of-the-day?random=1";
		this.word = "";
		this.wordArr = [];
		this.definition = "";
		this.phonetic = "";
		this.gameType = gameType;
	}

	async fetchWord() {
		const res = await fetch(this.wordApiUrl);
		const { word: wordRes } = await res?.json(); //This renames the word property from the JSON object to wordRes locally in the code.

		const def = await fetch(
			`https://api.dictionaryapi.dev/api/v2/entries/en/${wordRes}`
		);
		const definition = await def?.json();

		this.word = wordRes.toUpperCase();
		this.wordArr = this.word.split("");
		if (!!definition[0]) {
			const firstDef = definition[0];
			this.definition = !!firstDef?.meanings[0]?.definitions[0]?.definition ? firstDef?.meanings[0]?.definitions[0]?.definition : "";
			this.phonetic = !!firstDef?.phonetic ? firstDef?.phonetic : "";
		}
	}
}
