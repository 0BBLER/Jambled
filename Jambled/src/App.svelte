<script lang="ts">
  import { CharManager } from "./lib/charManager";
  import { getArticleData } from "./lib/wiki";

  let articleDiv = $state<HTMLDivElement>();
  let articleTitle = $state<string>();
  let articleLoaded = $state<boolean>(false);

  let darkMode = $state<boolean>(true);

  const charManager: CharManager = new CharManager();
  charManager.generateMap();

  //fetch article contents and set article container div
  async function loadData() {
    if (!articleDiv) return;
    const articleData = await getArticleData();
    articleTitle = articleData.title;
    articleDiv.innerHTML = articleData.text["*"];
    cleanArticle();
    articleLoaded = true;
  }

  //remove elements from articleDiv by selector
  function removeBySelector(selector: string) {
    if (!articleDiv) return;
    articleDiv
      .querySelectorAll(selector)
      .forEach((element) => element.remove());
  }

  //clean the article by removing a bunch of things
  function cleanArticle() {
    if (!articleDiv) return;
    removeBySelector(".reference");
    removeBySelector(".mw-editsection");
    removeBySelector(".navbox");
    removeBySelector(".metadata");
    removeBySelector(".references");
    removeBySelector(".hatnote");
    removeBySelector(".infobox-title");

    removeBySelector("#Notes");
    removeBySelector("#References");
    removeBySelector("#Further_reading");
    removeBySelector("#External_links");

    articleDiv.querySelectorAll("a").forEach((element) => {
      element.href = "javascript:void(0)";
    });

    articleDiv.querySelectorAll("audio").forEach((element) => {
      element.remove();
    });

    const walker = document.createTreeWalker(
      articleDiv,
      NodeFilter.SHOW_TEXT,
      null,
    );
    let current = walker.nextNode();
    while (current) {
      if (current.nodeValue) {
        current.nodeValue = charManager.getShuffled(current.nodeValue);
      }
      current = walker.nextNode();
    }
  }
</script>

<button onclick={loadData}>Load data</button>

<div id="game" class={darkMode ? "dark" : ""}>
  <div class={`article-preview ${articleLoaded ? "" : "hidden"}`}>
    <h1>{articleTitle ? charManager.getShuffled(articleTitle) : ""}</h1>
    <hr />
    <div
      bind:this={articleDiv}
      id={`article`}
      class={`${darkMode ? "dark" : ""}`}
    ></div>
  </div>
</div>
