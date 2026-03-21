//this seems to be what the wikipedia api likes returning
interface PageInfo {
  pageid: number;
  ns: number;
  title: string;
  contentmodel: string;
  pagelanguage: string;
  pagelanguagehtmlcode: string;
  pagelanguagedir: "ltr" | "rtl";
  touched: string;
  lastrevid: number;
  length: number;
}

/* async function getArticleNameById(id: number) {
  const url = `https://en.wikipedia.org/w/api.php?format=json&action=query&pageids=${id}`;
  return (
    //not spaghetti code
    (
      (
        Object.values((await (await fetch(url)).json()).query.pages) as {
          title: string;
        }[]
      )[0] ?? {
        title: undefined,
      }
    ).title
  );
} */

export async function getDailyArticle(
  mode: GameMode,
  day: number,
  dailyBuffer: ArrayBuffer,
) {
  const pageIndex = day * 2 + (mode == "classic" ? 0 : 1);
  //day of the year
  const pages = new Uint32Array(dailyBuffer);
  return await getArticleData(pages[pageIndex]);
}

async function getRandomWikiArticle() {
  //40 random
  const data = await fetch(
    "https://en.wikipedia.org/w/api.php?action=query&format=json&generator=random&grnnamespace=0&grnlimit=80&prop=info&origin=*",
  );

  const articles: PageInfo[] = (await data.json()).query.pages;
  /**
   * remove disambiguation
   * take 10 longest
   */
  const filtered = Object.values(articles)
    .filter((article) => !article.title.includes("disambiguation"))
    .toSorted((a, b) => b.length - a.length)
    .slice(0, 10);

  return filtered[Math.floor(Math.random() * filtered.length)];
}

export async function getArticleData(id: number = -1) {
  //TODO fix if somehow an article was not found
  //no way that happens though right
  //maybe use preset
  let data;
  if (id == -1) {
    const randomTitle = (await getRandomWikiArticle()).title;
    //console.log(randomTitle);
    data = await fetch(
      `https://en.wikipedia.org/w/api.php?action=parse&page=${randomTitle}&prop=text&format=json&origin=*`,
    );
  } else {
    data = await fetch(
      `https://en.wikipedia.org/w/api.php?action=parse&pageid=${id}&prop=text&format=json&origin=*`,
    );
  }
  const json = await data.json();
  return json.parse;
}
