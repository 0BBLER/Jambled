//some fisher-yates
export function shuffleArr(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    let k = Math.floor(Math.random() * (i + 1));
    [array[i], array[k]] = [array[k], array[i]];
  }
}

export function formatTime(time: number) {
  const minutes = Math.floor(time / 60000);
  return `${minutes}:${Math.floor(time % 60000) / 1000}`;
}
