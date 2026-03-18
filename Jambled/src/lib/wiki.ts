//this seems to be what it likes returning
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

async function getRandomWikiArticle() {
  //40 random
  const data = await fetch(
    "https://en.wikipedia.org/w/api.php?action=query&format=json&generator=random&grnnamespace=0&grnlimit=40&prop=info&inprop=length&origin=*",
  );

  const articles: PageInfo[] = (await data.json()).query.pages;
  /**
   * remove disambiguation
   * take 5 longest
   */
  const filtered = Object.values(articles)
    .filter((article) => !article.title.includes("disambiguation"))
    .toSorted((a, b) => b.length - a.length)
    .slice(0, 5);

  return filtered[Math.floor(Math.random() * filtered.length)];
}

export async function getArticleData() {
  //TODO fix if somehow an article was not found
  //maybe use preset
  const randomTitle = (await getRandomWikiArticle()).title;
  console.log(randomTitle);
  const data = await fetch(
    `https://en.wikipedia.org/w/api.php?action=parse&page=${randomTitle}&prop=text&format=json&origin=*`,
  );
  const json = await data.json();
  return json.parse;
}
