<script lang="ts">
  import { CharManager } from "$lib/charManager";
  import { getArticleData } from "$lib/wiki";
  import { userConfig } from "$lib/store";
  import { Game } from "$lib/game.svelte";

  interface Props {
    charManager: CharManager;
    game: Game;
  }

  let { charManager, game }: Props = $props();

  let articleDiv = $state<HTMLDivElement>();
  let articleTitle = $state<string>();
  let articleLoaded = $state<boolean>(false);
  let articleTitleShuffled = $state<string>();

  let textNodes: { node: Node; origValue: string }[] = [];

  //fetch article contents and set article container div
  export async function loadData() {
    if (!articleDiv) return;
    const articleData = await getArticleData();
    articleTitle = "";
    articleTitle = articleData.title;
    if (articleTitle) {
      game.articleTitle = articleTitle;
    }
    articleTitleShuffled = charManager.getShuffled(articleData.title);
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

    articleDiv.querySelectorAll("img").forEach((element) => {
      element.classList.add("image-hidden");
      element.alt = "";
      element.draggable = false;
    });

    const walker = document.createTreeWalker(
      articleDiv,
      NodeFilter.SHOW_TEXT,
      null,
    );
    let current = walker.nextNode();
    while (current) {
      if (current.nodeValue) {
        textNodes.push({ node: current, origValue: current.nodeValue });
        current.nodeValue = charManager.getShuffled(current.nodeValue);
      }
      current = walker.nextNode();
    }
  }

  export function updateCharacters() {
    if (!articleTitle) return;
    textNodes.forEach((tn) => {
      tn.node.nodeValue = charManager.getShuffled(tn.origValue);
    });

    articleTitleShuffled = charManager.getShuffled(articleTitle);
  }
</script>

<div class={`article-preview ${articleLoaded ? "" : "hidden"}`}>
  <h1>{articleTitleShuffled}</h1>
  <hr />
  <div
    bind:this={articleDiv}
    id={`article`}
    class={`${userConfig.darkMode ? "dark" : ""}`}
  ></div>
</div>

<style>
  @import "./articleViewer.css";
</style>
