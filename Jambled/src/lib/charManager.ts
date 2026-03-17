import { shuffleArr } from "./utils";

//prettier-ignore
export const alphabet : string[] = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"] as const;
export type Letter = (typeof alphabet)[number];
export class CharManager {
  mapKey: Record<Letter, Letter>;
  userMap: Record<Letter, Letter>;
  masterMap: Record<Letter, Letter>;

  constructor() {
    this.mapKey = {};
    this.userMap = {};
    this.masterMap = {};
  }

  //get a shuffled map
  private generateMap() {
    const shuffled = [...alphabet];
    shuffleArr(shuffled);
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

  setUserMap(from: string, to: string) {
    if (!alphabet.includes(from) || !alphabet.includes(to)) {
      console.error("KEY DOES NOT EXIST");
      return false;
    }
    this.userMap[from] = to;
    return this.generateMasterMap();
  }

  //init
  generate() {
    this.generateMap();
    this.generateUserMap();

    this.generateMasterMap();
  }
}
