import confetti from "@hiseb/confetti";
import { CharManager, Letter } from "./charManager";
import { ToastManager } from "./toastManager";

export class Game {
  toastManager: ToastManager = new ToastManager();
  charManager: CharManager;
  articleTitle: string;

  charGuesses = $state(0);
  titleGuesses = $state(0);
  done = $state(false);
  wonGame = $state(false);
  score = $state(0);
  previousScore = 0;
  guessedChars = $state<Letter[]>([]);

  scoringRules = {
    title: -1000,
    win: 10000,
  } as const;

  constructor() {
    this.charManager = new CharManager(this);
    this.articleTitle = "";
    this.done = false;
    this.updateScore(false);
  }

  updateScore(toast: boolean) {
    this.score =
      ((this.done && !this.wonGame) ? 0 : this.scoringRules.win) +
      this.charsCost +
      this.titleGuesses * this.scoringRules.title;
    if (toast && this.score != this.previousScore) {
      const difference = this.score - this.previousScore;
      const negative = difference < 0;
      let prefix = negative ? "-" : "+";
      const message = `${prefix}${Math.abs(difference)}`;
      this.toastManager.addToast(
        message,
        `score-${negative ? "negative" : "positive"}`,
      );
    }
    this.previousScore = this.score;
  }

  start() {
    this.charManager.generate();
    this.articleTitle = "";
    this.done = false;
    this.charGuesses = 0;
    this.titleGuesses = 0;
    this.updateScore(false);
    this.guessedChars.length = 0;
    this.wonGame = false;
  }

  guessTitle(guess: string) {
    const compare =
      guess.localeCompare(this.articleTitle, "en", {
        sensitivity: "base",
      }) == 0;
    if (compare) {
      confetti({
        position: { x: window.innerWidth / 2, y: 50 },
        count: 400,
        fade: false,
      });
      this.wonGame = true;
      this.done = true;
    } else {
      this.titleGuesses = this.titleGuesses + 1;
      this.updateScore(true);
    }
  }

  modUserMap(from: Letter, to: Letter) {
    const success = this.charManager.modUserMap(from, to);
    if (success) {
      const find = Object.entries(this.charManager.mapKey).find(
        (entry) => entry[1] == from,
      );
      if (!find) {
        console.error("COULDNT BACKTRACE!!");
        debugger;
        return false;
      }
      const origLetter = find[0];
      console.log(origLetter);
      this.guessedChars.push(origLetter);
      this.charGuesses = this.charGuesses + 1;
      this.updateScore(true);
    }
    return success;
  }

  giveUp() {
    this.wonGame = false;
    this.done = true;
    this.updateScore(true);
  }

  get charsCost() {
    const cost = this.guessedChars.reduce(
      (acc, curr) => acc - this.charManager.valueMap[curr],
      0,
    );
    return Math.floor(cost);
  }
}
