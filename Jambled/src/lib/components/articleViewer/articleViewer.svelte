<!-- article viewing pane -->
<!-- also handles cleaning the article for rendering and hiding contents -->
<script lang="ts">
  import { alphabet, CharManager, type Letter } from "$lib/charManager";
  import { Game } from "$lib/game.svelte";
  import { playClick2 } from "$lib/sounds";
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
    setLetterCallback: (from: Letter, to: Letter, external: boolean) => boolean;
    setTitleValueCallback: (submit: boolean) => void;
  }

  let {
    charManager,
    game,
    done,
    setLetterCallback,
    setTitleValueCallback,
  }: Props = $props();

  let articleDiv = $state<HTMLDivElement>();
  let articleTitle = $state<string>();
  let articleTitleShuffled = $state<string>();

  let isDaily = $state(false);

  let textElements: { element: HTMLElement; origValue: string }[] = [];
  let textNodes: Node[] = [];

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
    textElements = [];
    textNodes = [];
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

    //replace links
    articleDiv.querySelectorAll("a").forEach((anchor) => {
      const element = document.createElement("span");
      element.textContent = anchor.textContent;
      element.classList.add("a");
      anchor.after(element);
      anchor.remove();
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
        textNodes.push(current);
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
      }
      current = walker.nextNode();
    }

    for (const node of textNodes) {
      if (!node.nodeValue || !node.parentElement) return;
      const span = document.createElement("span");
      textElements.push({ element: span, origValue: node.nodeValue });

      span.textContent = charManager.getShuffled(node.nodeValue);
      node.parentElement.replaceChild(span, node);
    }

    charManager.setValueMap(freqMap, chars);
  }

  //update all the characters in the article
  export function updateCharacters() {
    if (!articleTitle) return;

    textElements.forEach((tn) => {
      tn.element.textContent = charManager.getShuffled(tn.origValue);
    });

    articleTitleShuffled = charManager.getShuffled(articleTitle);
  }

  //replace letters by selection
  function articleKeydown(event: KeyboardEvent) {
    const selection = document.getSelection();
    if (
      selection?.focusOffset == undefined ||
      selection?.anchorOffset == undefined
    )
      return;
    if (Math.abs(selection.focusOffset - selection.anchorOffset) != 1) return;
    const parent = selection.focusNode?.parentElement;
    if (!parent) return;
    const te = textElements.find((element) => element.element == parent);
    if (!te) return;
    const origLetter = (
      selection.direction == "forward"
        ? te.origValue[selection.anchorOffset]
        : te.origValue[selection.focusOffset]
    ).toLowerCase();
    if (!alphabet.includes(origLetter)) return;
    const enteredLetter = event.key.toLowerCase();
    if (!alphabet.includes(enteredLetter)) return;
    const jambledLetter = charManager.mapKey[origLetter];
    if (!jambledLetter) return;
    setLetterCallback(jambledLetter, enteredLetter, true);
    playClick2();
  }

  function titleKeydown(event: KeyboardEvent) {
    const selection = document.getSelection();
    if (
      selection?.focusOffset == undefined ||
      selection?.anchorOffset == undefined
    )
      return;
    if (Math.abs(selection.focusOffset - selection.anchorOffset) != 1) return;
    const parent = selection.focusNode?.parentElement;
    if (!parent) return;
    const origLetter = (
      selection.direction == "forward"
        ? game.articleTitle[selection.anchorOffset]
        : game.articleTitle[selection.focusOffset]
    ).toLowerCase();
    if (!alphabet.includes(origLetter)) return;
    const enteredLetter = event.key.toLowerCase();
    if (!alphabet.includes(enteredLetter)) return;
    const jambledLetter = charManager.mapKey[origLetter];
    if (!jambledLetter) return;
    setLetterCallback(jambledLetter, enteredLetter, true);
    playClick2();
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
    <button
      onclick={() => {
        setTitleValueCallback(true);
      }}
      class="copy-upwards-button"
      ><img
        src="images/upload.svg"
        alt="submit current title"
        width="30px"
        height="30px"
      />submit</button
    >
    <button
      onclick={() => {
        setTitleValueCallback(false);
      }}
      class="copy-upwards-button"
      ><img
        src="images/arrow_left_up.svg"
        alt="copy title upwards"
        width="30px"
        height="30px"
      />copy</button
    >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <span style="outline:none" tabindex="0" onkeydown={titleKeydown}>
      <!-- NOTHING ELSE SHOULD GO IN THIS SPAN, OR IT WILL BREAK TITLEKEYDOWN -->
      {articleTitleShuffled}
    </span>
    {#if isDaily}
      <div class="daily-splash">DAILY</div>
    {/if}
  </div>
  <div class={$articleLoaded ? "article-preview" : "hidden"}>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div
      tabindex="0"
      bind:this={articleDiv}
      onkeydown={articleKeydown}
      id={`article`}
      class={`${userConfig.darkMode ? "dark" : ""}`}
    ></div>
  </div>
</div>
<div class={$articleLoaded ? "hidden" : "article-loading"}>
  Loading your article...
</div>

<style>
  #article {
    outline: none;
    border: none;
  }
  .article-wrapper {
    min-height: 0;
    display: flex;
    flex-direction: column;
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
    display: flex;
    flex-direction: row;
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
  .copy-upwards-button {
    height: fit-content;
    align-self: center;
    margin-right: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
