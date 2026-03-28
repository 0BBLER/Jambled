interface UserConfig {
  darkMode: boolean;
}

type GameMode = "classic" | "speedrun";

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
  data: {
    seenTooltip: boolean;
  };
}
