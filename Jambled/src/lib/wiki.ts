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

const timeEndpoint = "https://time.now/developer/api/timezone/America/Toronto";

//this is a workaround for setting system clocks
async function fetchTime() {
  /*   return {
    abbreviation: "EDT",
    client_ip: "2001:4958:36f9:1601:d1fb:721e:9bb4:89a8",
    datetime: "2026-03-20T10:53:29.033059-04:00",
    day_of_week: 5,
    day_of_year: 79,
    dst: true,
    dst_from: null,
    dst_offset: 3600,
    dst_until: null,
    raw_offset: -18000,
    timezone: "America/Toronto",
    unixtime: 1774018409,
    utc_datetime: "2026-03-20T14:53:29.033112Z",
    utc_offset: "-04:00",
    week_number: 12,
  }; */

  const data = await fetch(timeEndpoint);
  const json = await data.json();
  const date = new Date(Number(json.unixtime + "000"));
  return date;
}

async function getArticleNameById(id: number) {
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
}

async function getDailyArticle() {
  const buffer = await (await fetch("daily.bin")).arrayBuffer();
  const date = await fetchTime();
  //day of the year
  const yearDay =
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(date.getFullYear(), 0, 1)) /
    (1000 * 60 * 60 * 24);
  const yearIndex = date.getFullYear() - 2026;
  const pageIndex =
    yearIndex * 366 /* every year is a leap year now */ + yearDay;
  const pages = new Uint32Array(buffer);
  return await getArticleData(pages[pageIndex]);
}

async function getRandomWikiArticle() {
  getDailyArticle();
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
