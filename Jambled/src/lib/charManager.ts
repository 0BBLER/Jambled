import { shuffleArr } from "./utils";

//prettier-ignore
const alphabet : string[] = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"] as const;
export class CharManager {
  map = new Map<string, string>();
  constructor() {}

  generateMap() {
    const shuffled = [...alphabet];
    shuffleArr(shuffled);
    this.map = new Map<string, string>();
    for (let i = 0; i < alphabet.length; i++) {
      this.map.set(alphabet[i], shuffled[i]);
    }
  }

  getShuffled(string: string) {
    return string
      .split("")
      .map((char) => {
        const lowercase = char.toLowerCase();
        if (lowercase == char) {
          const found = this.map.get(char);
          if (found) return found;
        } else {
          const found = this.map.get(lowercase);
          if (found) return found.toUpperCase();
        }
        return char;
      })
      .join("");
  }
}
