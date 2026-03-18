//some fisher-yates
export function shuffleArr(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    let k = Math.floor(Math.random() * (i + 1));
    [array[i], array[k]] = [array[k], array[i]];
  }
}

//formats time as m:ss.ms
export function formatTime(time: number) {
  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor(time / 1000) - minutes * 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${Math.floor(time % 1000)}`;
}
