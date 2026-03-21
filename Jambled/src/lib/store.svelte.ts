/* 
this handles the store, and also all localstorage
*/

import { writable, get } from "svelte/store";
import { getDailyArticle } from "./wiki";
import { fetchDay } from "./utils";

export const CLASSIC_UNSET = -99999999;
export const SPEEDRUN_UNSET = 99999999;

export const userConfig: UserConfig = { darkMode: true }; //dark mode is only half implemented so light mode will break things

//localstorage structure
interface SaveData {
  scores: {
    classic: number;
    speedrun: number;
  };
  daily: {
    classic: number;
    classicTimestamp: number;
    speedrun: number;
    speedrunTimestamp: number;
  };
}

let saveData: SaveData = JSON.parse(
  localStorage.getItem("jambledData") ?? "{}",
);

if (!saveData.scores) {
  saveData.scores = { classic: CLASSIC_UNSET, speedrun: SPEEDRUN_UNSET };
}

if (!saveData.daily) {
  saveData.daily = {
    classic: CLASSIC_UNSET,
    speedrun: SPEEDRUN_UNSET,
    speedrunTimestamp: -1,
    classicTimestamp: -1,
  };
}

export const scores = writable(saveData.scores);
export const daily = writable(saveData.daily);
export const articleLoaded = writable(false);
export const dailyArticlesLoaded = writable(false);

export let classicDailyArticle: { title: string; text: Record<string, string> };
export let speedrunDailyArticle: {
  title: string;
  text: Record<string, string>;
};

function uploadSaveData() {
  localStorage.setItem("jambledData", JSON.stringify(saveData));
}

export async function loadDailyArticles() {
  if (get(dailyArticlesLoaded)) return;
  console.log("Downloading daily articles...");
  dailyArticlesLoaded.set(false);
  const day = await fetchDay();
  const buffer = await (await fetch("daily.bin")).arrayBuffer();

  [classicDailyArticle, speedrunDailyArticle] = await Promise.all([
    getDailyArticle("classic", day, buffer),
    getDailyArticle("speedrun", day, buffer),
  ]);
  dailyArticlesLoaded.set(true);
  console.log({
    classicDaily: classicDailyArticle,
    speedrunDaily: speedrunDailyArticle,
  });
}

//sets vars and updates localstorage on highscore change
export function trySetHighscore(score: number, mode: GameMode) {
  if (mode == "classic") {
    if (
      saveData.scores.classic == undefined ||
      score > saveData.scores.classic
    ) {
      saveData.scores.classic = score;
      uploadSaveData();
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
      uploadSaveData();
      scores.update((old) => {
        old.speedrun = score;
        return old;
      });
      return true;
    }
  }

  return false;
}

export function resetClassicScore() {
  saveData.scores.classic = CLASSIC_UNSET;
  uploadSaveData();
  scores.update((old) => {
    old.classic = CLASSIC_UNSET;
    return old;
  });
}

export function resetSpeedrunScore() {
  saveData.scores.speedrun = SPEEDRUN_UNSET;
  uploadSaveData();
  scores.update((old) => {
    old.speedrun = SPEEDRUN_UNSET;
    return old;
  });
}

export function setDailyData(mode: GameMode, score: number) {
  const now = Date.now();
  if (mode == "classic") {
    saveData.daily.classic = score;
    saveData.daily.classicTimestamp = now;
    daily.update((old) => ({
      ...old,
      classic: score,
      classicTimestamp: now,
    }));
  } else if (mode == "speedrun") {
    saveData.daily.speedrun = score;
    saveData.daily.speedrunTimestamp = now;
    daily.update((old) => ({
      ...old,
      speedrun: score,
      speedrunTimestamp: now,
    }));
  }
  uploadSaveData();
}

export function playedDaily(mode: GameMode) {
  if (mode == "classic") {
    return (
      new Date(get(daily).classicTimestamp).toDateString() ==
      new Date().toDateString()
    );
  }
  if (mode == "speedrun") {
    return (
      new Date(get(daily).speedrunTimestamp).toDateString() ==
      new Date().toDateString()
    );
  }
  return true;
}
