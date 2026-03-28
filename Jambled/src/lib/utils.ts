import seedrandom from "seedrandom";

//some fisher-yates
export function shuffleArr(array: any[], seed: string = "") {
  let rng = seed == "" ? undefined : seedrandom(seed);
  for (let i = array.length - 1; i > 0; i--) {
    const random = rng ? rng() : Math.random();
    let k = Math.floor(random * (i + 1));
    [array[i], array[k]] = [array[k], array[i]];
  }
}

//formats time as m:ss.ms
export function formatTime(time: number) {
  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor(time / 1000) - minutes * 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${Math.floor(time % 1000)}`;
}

const timeEndpoint = "https://time.now/developer/api/timezone/America/Toronto";

//this is a workaround for people setting system clocks
export async function fetchDay() {
  const data = await fetch(timeEndpoint);
  const json = await data.json();
  const date = new Date(json.unixtime * 1000);

  const yearDay =
    (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
      Date.UTC(date.getUTCFullYear(), 0, 1)) /
    (1000 * 60 * 60 * 24);
  const yearIndex = date.getUTCFullYear() - 2026;
  const dayIndex =
    yearIndex * 366 /* every year is a leap year now */ + yearDay;
  return dayIndex;
}
