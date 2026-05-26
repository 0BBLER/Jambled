import seedrandom from "seedrandom";
import { alphabet } from "./charManager";
import { shuffleArr } from "./utils";
import { getRandomWikiArticle } from "./wiki";

type CustomGameWithAlpha = {
  id: number;
  shuffledAlphabet: string[];
  seed?: never;
};
type CustomGameWithSeed = {
  id: number;
  seed: string;
  shuffledAlphabet?: never;
};
export type CustomGameData = CustomGameWithAlpha | CustomGameWithSeed;

type EncodedDataFormat = [number, string];

function encodeGameData(data: CustomGameData) {
  const format: EncodedDataFormat = [
    data.id,
    data.seed ? data.seed : (data.shuffledAlphabet ?? []).join(),
  ];
  const encoded = btoa(format.join("|"));
  return encoded;
}

export async function createRandomCustomGame() {
  const article = await getRandomWikiArticle();
  const id = article.pageid;
  const seed = seedrandom()();
  return encodeGameData({ id, seed: String(seed) });
}

export function decodeCustomGame(data: string): CustomGameData | null {
  try {
    const decoded = atob(data).split("|");
    if (decoded.length < 2) return null;
    const isAlphabet = decoded[1].length === 26;
    if (isAlphabet) {
      const shuffledAlphabet = decoded[1].split("");
      return {
        id: Number(decoded[0]),
        shuffledAlphabet,
      };
    } else {
      return {
        id: Number(decoded[0]),
        seed: decoded[1],
      };
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}
