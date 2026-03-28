import fs from "fs";

//wikipedia api endpoint for 500 random articles
const endpoint =
  "https://en.wikipedia.org/w/api.php?action=query&format=json&generator=random&grnnamespace=0&grnlimit=500&prop=info&origin=*";

async function getArticles(): Promise<number[]> {
  const data = await fetch(endpoint);
  const json = await data.json();

  const pages = (
    Object.values(json.query.pages) as {
      pageid: string;
      title: string;
      length: number;
    }[]
  )
    .filter((page) => page.length > 7000) //length must be more than 7k
    .filter((page) => !page.title.includes("disambiguation")) //cant be a disambiguation
    .map((x) => Number(x.pageid));
  return pages;
}

function shuffleArr(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    let k = Math.floor(Math.random() * (i + 1));
    [array[i], array[k]] = [array[k], array[i]];
  }
}

async function main() {
  let pages: number[] = [];
  let fetchNumber = 1;
  const set = new Set();
  while (pages.length < 10000) {
    //10000 articles takes about 60 requests
    pages = pages.concat(await getArticles());
    console.log("fetch number", fetchNumber);
    fetchNumber++;
  }
  for (const number of pages) {
    set.add(number);
  }
  console.log(
    pages.length == set.size ? "no duplicates found" : "duplicates found",
  );

  shuffleArr(pages);
  const u32 = new Uint32Array(pages);
  const buffer = Buffer.from(u32.buffer, u32.byteOffset, u32.byteLength);
  fs.writeFileSync("out/json.json", JSON.stringify(pages), "utf-8");
  fs.writeFileSync("out/daily.bin", buffer);
}

main();
