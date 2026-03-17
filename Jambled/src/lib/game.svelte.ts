import { CharManager, Letter } from "./charManager";
import confetti from "@hiseb/confetti";

export class Game {
  charManager: CharManager;
  articleTitle: string;

  charGuesses = $state(0);
  titleGuesses = $state(0);
  done = $state(false);

  scoringRules = {
    char: -100,
    title: -1000,
    win: 10000,
  } as const;

  score = $state(0);

  constructor() {
    this.charManager = new CharManager();
    this.articleTitle = "";
    this.done = false;
    this.updateScore();
  }

  updateScore() {
    this.score =
      this.scoringRules.win +
      this.charGuesses * this.scoringRules.char +
      this.titleGuesses * this.scoringRules.title;
  }

  start() {
    this.charManager.generate();
    this.articleTitle = "";
    this.done = false;
    this.charGuesses = 0;
    this.titleGuesses = 0;
    this.updateScore();
  }

  guessTitle(guess: string) {
    this.titleGuesses = this.titleGuesses + 1;
    const compare =
      guess.localeCompare(this.articleTitle, "en", {
        sensitivity: "base",
      }) == 0;
    if (compare) {
      confetti({
        position: { x: window.innerWidth / 2, y: window.innerHeight - 30 },
        count: 400,
        fade: true,
      });
      this.done = true;
    }
    this.updateScore();
  }

  modUserMap(from: Letter, to: Letter) {
    const success = this.charManager.modUserMap(from, to);
    if (success) {
      this.charGuesses = this.charGuesses + 1;
      this.updateScore();
    }
    return success;
  }
}
