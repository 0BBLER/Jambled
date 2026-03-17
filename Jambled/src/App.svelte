<script lang="ts">
  import { type Letter } from "$lib/charManager";
  import ArticleViewer from "$lib/components/articleViewer/ArticleViewer.svelte";
  import FinishPopup from "$lib/components/finishPopup/FinishPopup.svelte";
  import GuessInput from "$lib/components/guessInput/GuessInput.svelte";
  import LetterPicker from "$lib/components/letterPicker/LetterPicker.svelte";
  import TopBar from "$lib/components/topBar/TopBar.svelte";
  import { Game } from "$lib/game.svelte";
  import { userConfig } from "$lib/store";

  let articleViewer = $state<ArticleViewer>();

  let game = new Game();
  let reactiveUserMap = $state<Record<Letter, Letter>>({
    ...game.charManager.userMap,
  });

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
</script>

<div class="main-container">
  <div id="game" class={userConfig.darkMode ? "dark" : ""}>
    <button onclick={start}>Start</button>
    <TopBar></TopBar>
    <div class="midsection">
      <LetterPicker
        userMap={reactiveUserMap}
        {setLetterCallback}
        charManager={game.charManager}
      ></LetterPicker>
      <ArticleViewer
        {game}
        charManager={game.charManager}
        bind:this={articleViewer}
      ></ArticleViewer>
    </div>
    <!-- fixed guess input -->
    <GuessInput {game}></GuessInput>
    <!-- fixed popup -->
    {#if game.done}
      <FinishPopup {game}></FinishPopup>
    {/if}
  </div>
</div>
