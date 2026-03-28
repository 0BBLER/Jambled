import confetti from "@hiseb/confetti";
import { CharManager, Letter } from "./charManager";
import { ToastManager } from "./toastManager";
import { articleLoaded, setDailyData, SPEEDRUN_UNSET, trySetHighscore } from "./store.svelte";
import { playConfetti, playNoisemaker } from "./sounds";

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
  newHighscore = $state(false);
  currentMode = $state<GameMode>("classic");
  startedTimestamp: number;
  waitingForStart: boolean;
  endedTimestamp: number;
  isDaily: boolean;

  elapsedTime = $state(0);

  scoringRules = {
    title: -1000,
    win: 10000,
    charAdditive: -10,
  } as const;

  constructor() {
    this.charManager = new CharManager(this);
    this.articleTitle = "";
    this.done = false;
    this.updateScore(false);
    this.currentMode = "classic";
    this.startedTimestamp = -1;
    this.endedTimestamp = -1;
    this.waitingForStart = false;
    this.isDaily = false;

    articleLoaded.subscribe((loaded) => {
      if (loaded && this.waitingForStart) {
        this.waitingForStart = false;
        this.startedTimestamp = Date.now();
      }
    });

    this.updateElapsedTime(true);
  }

  updateElapsedTime(loop: boolean) {
    if (this.startedTimestamp == -1) {
      this.elapsedTime = 0;
    } else if (this.endedTimestamp == -1) {
      this.elapsedTime = Date.now() - this.startedTimestamp;
    } else {
      this.elapsedTime = this.endedTimestamp - this.startedTimestamp;
    }

    if (loop)
      requestAnimationFrame(() => {
        this.updateElapsedTime(true);
      });
  }

  updateScore(toast: boolean) {
    if (this.currentMode == "classic") {
      this.score =
        (this.done && !this.wonGame ? 0 : this.scoringRules.win) +
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
    }
    this.previousScore = this.score;
  }

  start(mode: GameMode, daily: boolean) {
    this.currentMode = mode;
    this.articleTitle = "";
    this.done = false;
    this.charGuesses = 0;
    this.titleGuesses = 0;
    this.guessedChars.length = 0;
    this.startedTimestamp = -1;
    this.endedTimestamp = -1;
    this.wonGame = false;
    this.updateScore(false);
    this.waitingForStart = true;
    this.isDaily = daily;
    this.newHighscore = false;
  }

  private stopGame(win: boolean) {
    this.wonGame = win;
    this.done = true;
    this.updateScore(false);
    this.endedTimestamp = Date.now();

    if (this.currentMode == "classic") {
      this.newHighscore = trySetHighscore(this.score, this.currentMode);
      if (this.isDaily) setDailyData("classic", this.score);
    } else if (this.currentMode == "speedrun") {
      if (win) {
        this.newHighscore = trySetHighscore(this.elapsedTime, this.currentMode);
        if (this.isDaily) setDailyData("speedrun", this.elapsedTime);
      } else {
        if (this.isDaily) setDailyData("speedrun", SPEEDRUN_UNSET);
      }
    }
  }

  private win() {
    //SOUND CUTOFFS
    if (this.currentMode == "classic") {
      if (this.score < 1) {
        confetti({
          position: { x: window.innerWidth / 2, y: 50 },
          count: 5,
          fade: false,
        });
      } else {
        for (let i = 0; i < Math.ceil(this.score / 1000); i++) {
          setTimeout(() => {
            confetti({
              position: { x: window.innerWidth / 2, y: 50 },
              count: Math.max(5, 10 + (this.score - 2000) / 10),
              fade: false,
            });
          }, i * 50);
        }
      }
      if (this.score < 4500) {
        playNoisemaker();
      } else {
        playConfetti();
      }
    } else if (this.currentMode == "speedrun") {
      for (let i = 0; i < Math.max(1, 10 - this.elapsedTime / 20000); i++) {
        setTimeout(() => {
          confetti({
            position: { x: window.innerWidth / 2, y: 50 },
            count: Math.min(
              Math.max(5, 800 - (this.elapsedTime - 60000) / 250),
              1000,
            ),
            fade: false,
          });
        }, i * 50);
      }
      if (this.elapsedTime > 120000) {
        playNoisemaker();
      } else {
        playConfetti();
      }
    }
    this.stopGame(true);
  }

  giveUp() {
    this.stopGame(false);
  }

  guessTitle(guess: string) {
    const trimmed = guess.trim();
    const compare =
      trimmed.localeCompare(this.articleTitle, "en", {
        sensitivity: "base",
      }) == 0;
    if (compare) {
      this.win();
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
      this.guessedChars.push(origLetter);
      this.charGuesses = this.charGuesses + 1;
      this.updateScore(true);
    }
    return success;
  }

  get charsCost() {
    let charIdx = 0;
    const cost = this.guessedChars.reduce((acc, curr) => {
      let val = acc - this.charManager.valueMap[curr];
      val += this.scoringRules.charAdditive * charIdx;
      charIdx++;
      return val;
    }, 0);
    return Math.floor(cost);
  }
}
