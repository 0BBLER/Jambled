export async function getArticleData() {
  const data = await fetch(
    "https://en.wikipedia.org/w/api.php?action=parse&page=Jupiter&prop=text&format=json&origin=*",
  );
  const json = await data.json();
  return json.parse;
}
