import { writable } from "svelte/store";

export const userConfig: UserConfig = { darkMode: true };

interface SaveData {
  scores: {
    classic: number;
    speedrun: number;
  };
}

let saveData: SaveData = JSON.parse(
  localStorage.getItem("jambledData") ?? "{}",
);

if (!saveData.scores) {
  saveData.scores = { classic: -999999, speedrun: 999999 };
}

export const scores = writable(saveData.scores);
export const articleLoaded = writable(false);

export function trySetHighscore(score: number, mode: GameMode) {
  if (mode == "classic") {
    if (
      saveData.scores.classic == undefined ||
      score > saveData.scores.classic
    ) {
      saveData.scores.classic = score;
      localStorage.setItem("jambledData", JSON.stringify(saveData));
      scores.update((old) => {
        old.classic = score;
        return old;
      });
      return true;
    }
  } else if (mode == "speedrun") {
    if (
      saveData.scores.speedrun == undefined ||
      score < saveData.scores.speedrun
    ) {
      saveData.scores.speedrun = score;
      localStorage.setItem("jambledData", JSON.stringify(saveData));
      scores.update((old) => {
        old.speedrun = score;
        return old;
      });
      return true;
    }
  }

  return false;
}
