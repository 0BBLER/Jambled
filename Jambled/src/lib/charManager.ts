import { Game } from "./game.svelte";
import { shuffleArr } from "./utils";

const charWeighting = 4000;

//prettier-ignore
export const alphabet : string[] = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"] as const;
export type Letter = (typeof alphabet)[number];
export class CharManager {
  mapKey: Record<Letter, Letter>;
  userMap: Record<Letter, Letter>;
  masterMap: Record<Letter, Letter>;
  valueMap: Record<Letter, number>;
  game: Game;

  constructor(game: Game) {
    this.mapKey = {};
    this.userMap = {};
    this.masterMap = {};
    this.valueMap = {};
    this.game = game;
  }

  //get a shuffled map
  private generateMap(seed: string = "") {
    const shuffled = [...alphabet];
    shuffleArr(shuffled, seed);
    this.mapKey = {};
    for (let i = 0; i < alphabet.length; i++) {
      this.mapKey[alphabet[i]] = shuffled[i];
    }
  }

  //map with letters to themselves
  private generateUserMap() {
    this.userMap = {};
    for (let i = 0; i < alphabet.length; i++) {
      this.userMap[alphabet[i]] = alphabet[i];
    }
  }

  //get a word shuffled to the current mix
  getShuffled(string: string) {
    if (this.game.done) return string;
    if (Object.values(this.masterMap).length < 1) return string;
    return string
      .split("")
      .map((char) => {
        const lowercase = char.toLowerCase();
        if (lowercase == char) {
          const found = this.masterMap[char];
          if (found) return found;
        } else {
          const found = this.masterMap[lowercase];
          if (found) return found.toUpperCase();
        }
        return char;
      })
      .join("");
  }

  //apply both shuffles
  private generateMasterMap() {
    this.masterMap = {};
    for (let i = 0; i < alphabet.length; i++) {
      const key1 = this.mapKey[alphabet[i]];
      //TODO fix something here
      if (!key1) {
        throw "MAPKEY NOT SET";
      }
      const key2 = this.userMap[key1];
      if (!key2) {
        throw "USER MAPKEY NOT SET";
      }
      this.masterMap[alphabet[i]] = key2;
    }
    return true;
  }

  //change the user's inputted swaps
  modUserMap(from: string, to: string) {
    if (!alphabet.includes(from) || !alphabet.includes(to)) {
      return false;
    }
    if (this.userMap[from] == to) return false;
    this.userMap[from] = to;
    return this.generateMasterMap();
  }

  //weight the different letters based on their frequency in the article
  setValueMap(map: Record<string, number>, charCount: number) {
    for (const [key, value] of Object.entries(map)) {
      this.valueMap[key] = (value / charCount) * charWeighting;
    }
  }

  //init
  generate(seed: string = "") {
    this.generateMap(seed);
    this.generateUserMap();

    this.generateMasterMap();
  }
}
