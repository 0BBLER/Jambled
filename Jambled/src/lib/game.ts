import { CharManager } from "./charManager";

export class Game {
  charManager: CharManager;

  constructor() {
    this.charManager = new CharManager();
  }

  start() {
    this.charManager.generate();
  }
}
