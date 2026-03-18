import { writable } from "svelte/store";

export const userConfig: UserConfig = { darkMode: true };

interface SaveData {
  highscore: number;
}

let saveData: SaveData = JSON.parse(
  localStorage.getItem("jambledData") ?? "{}",
) ?? { highscore: -999999 };

export const highscore = writable(saveData.highscore);
export const articleLoaded = writable(false);

export function trySetHighscore(score: number) {
  if (saveData.highscore == undefined || score > saveData.highscore) {
    saveData.highscore = score;
    localStorage.setItem("jambledData", JSON.stringify(saveData));
    highscore.set(score);
    return true;
  }

  return false;
}