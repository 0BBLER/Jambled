<script lang="ts">
  import { type Letter } from "$lib/charManager";
  import ArticleViewer from "$lib/components/articleViewer/ArticleViewer.svelte";
  import FinishPopup from "$lib/components/finishPopup/FinishPopup.svelte";
  import LetterPicker from "$lib/components/letterPicker/LetterPicker.svelte";
  import TopBar from "$lib/components/topBar/TopBar.svelte";
  import { Game } from "$lib/game.svelte";
  import { userConfig } from "$lib/store";

  let articleViewer = $state<ArticleViewer>();

  let game = new Game();
  let reactiveUserMap = $state<Record<Letter, Letter>>({
    ...game.charManager.userMap,
  });
  let showTitleScreen = $state(true);
  let instructionsToggled = $state(false);

  function start() {
    if (articleViewer) {
      game.start();
      articleViewer.loadData();

      reactiveUserMap = {
        ...game.charManager.userMap,
      };
    }
  }

  //callback for when a letter is set
  function setLetterCallback(from: Letter, to: Letter): boolean {
    const success = game.modUserMap(from, to);
    if (success) {
      reactiveUserMap[from] = to;
      articleViewer?.updateCharacters();
    }

    return success;
  }

  function playButtonPressed() {
    if (!showTitleScreen) return;
    showTitleScreen = false;
    start();
  }
</script>

<!-- main game screen -->
<div
  class="{showTitleScreen ? 'hidden' : ''} {userConfig.darkMode ? 'dark' : ''}"
>
  <div id="game" class={userConfig.darkMode ? "dark" : ""}>
    <button onclick={start}>Start</button>
    <TopBar {game} score={game.score}></TopBar>
    <div class="midsection">
      <LetterPicker
        userMap={reactiveUserMap}
        {setLetterCallback}
        charManager={game.charManager}
      ></LetterPicker>
      <ArticleViewer
        done={game.done}
        {game}
        charManager={game.charManager}
        bind:this={articleViewer}
      ></ArticleViewer>
    </div>
    <!-- fixed popup -->
    {#if game.done}
      <FinishPopup {game}></FinishPopup>
    {/if}
  </div>
</div>
<!-- title screen/main menu -->
<div class="title-screen {showTitleScreen ? '' : 'hidden'}">
  <div class="main-title">JAMBLED</div>
  <button class="big-button" onclick={playButtonPressed}>Play</button>
  <button
    class="big-button how-button"
    onclick={() => {
      instructionsToggled = !instructionsToggled;
    }}>How to play</button
  >
  <div class="play-info {instructionsToggled ? 'expanded' : ''}">
    All the letters in a Wikipedia page have been swapped around! Unswap the
    letters and try to correctly guess the original title. Do it in as few swaps
    as possible
  </div>
</div>
