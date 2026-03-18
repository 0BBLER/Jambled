<script lang="ts">
  import { alphabet, CharManager } from "$lib/charManager";
  import { Game } from "$lib/game.svelte";
  import { articleLoaded, userConfig } from "$lib/store.svelte";
  import { getArticleData } from "$lib/wiki";

  interface Props {
    charManager: CharManager;
    game: Game;
    done: boolean;
  }

  let { charManager, game, done }: Props = $props();

  let articleDiv = $state<HTMLDivElement>();
  let articleTitle = $state<string>();
  let articleTitleShuffled = $state<string>();

  let textNodes: { node: Node; origValue: string }[] = [];

  //fetch article contents and set article container div
  export async function loadData() {
    if (!articleDiv) return;
    articleLoaded.set(false);
    const articleData = await getArticleData();
    articleTitle = "";
    articleTitle = articleData.title;
    if (articleTitle) {
      game.articleTitle = articleTitle;
    }
    articleTitleShuffled = charManager.getShuffled(articleData.title);
    articleDiv.innerHTML = articleData.text["*"];
    cleanArticle();
    articleLoaded.set(true);
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
    //bottom things
    removeBySelector(".reference");
    removeBySelector(".mw-editsection");
    removeBySelector(".navbox");
    removeBySelector(".references");
    //not bottom things
    removeBySelector(".metadata");
    removeBySelector(".hatnote"); //top information
    removeBySelector(".infobox-title");
    removeBySelector(".noprint"); //citation needed
    removeBySelector(".external"); //links

    removeBySelector("#Notes");
    removeBySelector("#References");
    removeBySelector("#Further_reading");
    removeBySelector("#External_links");

    articleDiv.querySelectorAll("a").forEach((element) => {
      element.href = "javascript:void(0)";
      element.title = "";
    });

    articleDiv.querySelectorAll("abbr").forEach((element) => {
      element.title = "";
    });

    articleDiv.querySelectorAll("audio").forEach((element) => {
      element.remove();
    });

    articleDiv.querySelectorAll("th").forEach((element) => {
      element.classList.add("override-table-content");
    });

    articleDiv.querySelectorAll("tr").forEach((element) => {
      element.classList.add("override-table-content");
    });

    articleDiv.querySelectorAll("video").forEach((element) => {
      element.remove();
    });

    articleDiv.querySelectorAll("img").forEach((element) => {
      element.classList.add("image-hidden");
      element.alt = "";
      element.draggable = false;
      element.oncontextmenu = (e) => {
        e.preventDefault();
      };
    });

    const walker = document.createTreeWalker(
      articleDiv,
      NodeFilter.SHOW_TEXT,
      null,
    );
    let current = walker.nextNode();
    const map: Record<string, number> = {};
    let chars = 0;
    while (current) {
      if (current.nodeValue) {
        textNodes.push({ node: current, origValue: current.nodeValue });
        for (let i = 0; i < current.nodeValue.length; i++) {
          const lower = current.nodeValue[i].toLowerCase();
          if (alphabet.includes(lower)) {
            chars++;
            if (map[lower] == undefined) {
              map[lower] = 0;
            }
            map[lower]++;
          }
        }
        current.nodeValue = charManager.getShuffled(current.nodeValue);
      }
      current = walker.nextNode();
    }

    charManager.setValueMap(map, chars);
  }

  export function updateCharacters() {
    if (!articleTitle) return;

    textNodes.forEach((tn) => {
      tn.node.nodeValue = charManager.getShuffled(tn.origValue);
    });

    articleTitleShuffled = charManager.getShuffled(articleTitle);
  }

  $effect(() => {
    if (done) {
      updateCharacters();
      if (articleDiv) {
        articleDiv.querySelectorAll("img").forEach((element) => {
          element.classList.remove("image-hidden");
          element.draggable = true;
          element.oncontextmenu = (e) => {};
        });
      }
    }
  });
</script>

<div class="article-title">
  {articleTitleShuffled}
</div>
<div class={$articleLoaded ? "article-preview" : "hidden"}>
  <div class="title-gap"></div>
  <div
    bind:this={articleDiv}
    id={`article`}
    class={`${userConfig.darkMode ? "dark" : ""}`}
  ></div>
</div>
<div class={$articleLoaded ? "hidden" : "article-loading"}>
  Loading your article...
</div>

<style>
  @import "./articleViewer.css";
</style>
