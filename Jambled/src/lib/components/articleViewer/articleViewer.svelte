<!-- article viewing pane -->
<!-- also handles cleaning the article for rendering and hiding contents -->
<script lang="ts">
  import { alphabet, CharManager } from "$lib/charManager";
  import { Game } from "$lib/game.svelte";
  import {
    articleLoaded,
    classicDailyArticle,
    speedrunDailyArticle,
    userConfig,
  } from "$lib/store.svelte";
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

  let isDaily = $state(false);

  let textNodes: { node: Node; origValue: string }[] = [];

  //clear the contents of the preview pane
  export function clear() {
    articleLoaded.set(false);
    if (articleDiv) {
      articleDiv.innerHTML = "";
    }
  }

  //fetch article contents and set article container div
  export async function loadData(mode: GameMode, daily: boolean) {
    if (!articleDiv) return;
    articleLoaded.set(false);
    let articleData: { title: string; text: Record<string, string> };
    if (daily) {
      if (mode == "speedrun") {
        articleData = speedrunDailyArticle;
      } else {
        articleData = classicDailyArticle;
      }
      if (!articleData || !articleData.title) {
        articleData = await getArticleData();
        console.error(
          "DAILY ARTICLE COULD NOT BE FOUND! A random article was given",
        );
      }
    } else {
      articleData = await getArticleData();
    }
    articleTitle = "";
    articleTitle = articleData.title;
    if (articleTitle) {
      game.articleTitle = articleTitle;
    }
    game.charManager.generate(daily ? (articleTitle ?? "") : ""); //generate map here

    articleTitleShuffled = charManager.getShuffled(articleData.title);
    articleDiv.innerHTML = articleData.text["*"];
    cleanArticle();
    isDaily = daily;
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

    //very bottom things
    removeBySelector("#Notes");
    removeBySelector("#References");
    removeBySelector("#Further_reading");
    removeBySelector("#External_links");

    articleDiv.querySelectorAll("a").forEach((element) => {
      element.href = "javascript:void(0)";
      element.title = "";
    });

    //abbreviations contain a title for the actual meaning
    articleDiv.querySelectorAll("abbr").forEach((element) => {
      element.title = "";
    });

    //this is mostly for the phonetic spellings
    articleDiv.querySelectorAll("span").forEach((element) => {
      element.title = "";
    });

    //remove audios
    articleDiv.querySelectorAll("audio").forEach((element) => {
      element.remove();
    });

    //remove videos
    articleDiv.querySelectorAll("video").forEach((element) => {
      element.remove();
    });

    //sometimes the tables are prestyled
    articleDiv.querySelectorAll("th").forEach((element) => {
      element.classList.add("override-table-content");
    });

    articleDiv.querySelectorAll("tr").forEach((element) => {
      element.classList.add("override-table-content");
    });

    //black out images
    articleDiv.querySelectorAll("img").forEach((element) => {
      element.classList.add("image-hidden");
      element.alt = "";
      element.draggable = false;
      element.oncontextmenu = (e) => {
        e.preventDefault();
      };
      //put image in wrapper
      const wrapper = document.createElement("div");
      wrapper.classList.add("image-hidden-wrapper");
      element.after(wrapper);
      wrapper.appendChild(element);
    });

    const walker = document.createTreeWalker(
      articleDiv,
      NodeFilter.SHOW_TEXT,
      null,
    );
    let current = walker.nextNode();
    const freqMap: Record<string, number> = {};
    let chars = 0;
    while (current) {
      if (current.nodeValue) {
        //add all nodes to arr so they can be easily changed later
        textNodes.push({ node: current, origValue: current.nodeValue });
        for (let i = 0; i < current.nodeValue.length; i++) {
          const lower = current.nodeValue[i].toLowerCase();
          if (alphabet.includes(lower)) {
            chars++;
            if (freqMap[lower] == undefined) {
              freqMap[lower] = 0;
            }
            freqMap[lower]++;
          }
        }
        current.nodeValue = charManager.getShuffled(current.nodeValue);
      }
      current = walker.nextNode();
    }

    charManager.setValueMap(freqMap, chars);
  }

  //update all the characters in the article
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

<div class="article-wrapper {$articleLoaded ? '' : 'hidden'}">
  <div class="article-title">
    {articleTitleShuffled}
    {#if isDaily}
      <div class="daily-splash">DAILY</div>
    {/if}
  </div>
  <div class={$articleLoaded ? "article-preview" : "hidden"}>
    <div
      bind:this={articleDiv}
      id={`article`}
      class={`${userConfig.darkMode ? "dark" : ""}`}
    ></div>
  </div>
</div>
<div class={$articleLoaded ? "hidden" : "article-loading"}>
  Loading your article...
</div>

<style>
  .article-wrapper {
    min-height: 0;
  }

  .article-preview {
    padding: 16px;
    box-sizing: border-box;
    overflow-y: auto;
    height: 100%;
  }

  .article-loading {
    font-size: 2rem;
    padding-left: 10px;
  }

  .title-gap {
    height: 4em;
  }

  .article-title {
    width: calc(100% - 40px);
    border-bottom: 2px solid rgb(211, 211, 211);
    font-size: 3em;
    background-color: rgb(36, 36, 36);
    margin-left: 16px;
    position: relative;
  }

  .daily-splash {
    position: absolute;
    right: -20px;
    top: 0px;
    transform: rotate(30deg);
    font-size: 1em;
    color: rgb(194, 137, 15);
    text-shadow: 0 0 5px rgb(194, 137, 15);
    cursor: default;
    pointer-events: none;
    user-select: none;
  }
</style>
