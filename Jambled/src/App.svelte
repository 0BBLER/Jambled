<script lang="ts">
  import { type Letter } from "$lib/charManager";
  import ArticleViewer from "$lib/components/articleViewer/ArticleViewer.svelte";
  import FinishPopup from "$lib/components/finishPopup/FinishPopup.svelte";
  import GiveUpPopup from "$lib/components/giveUpPopup/GiveUpPopup.svelte";
  import LetterPicker from "$lib/components/letterPicker/LetterPicker.svelte";
  import Title from "$lib/components/title/Title.svelte";
  import TopBar from "$lib/components/topBar/TopBar.svelte";
  import { Game } from "$lib/game.svelte";
  import { playClick, playClick2 } from "$lib/sounds";
  import {
    resetClassicScore,
    resetSpeedrunScore,
    scores,
    userConfig,
  } from "$lib/store.svelte";
  import { formatTime } from "$lib/utils";

  export const prerender = true;

  let articleViewer = $state<ArticleViewer>();

  let game = new Game();
  let reactiveUserMap = $state<Record<Letter, Letter>>({
    ...game.charManager.userMap,
  });
  let showTitleScreen = $state(true);
  let instructionsToggled = $state(false);
  let highscoresToggled = $state(false);
  let finishPopup = $state<FinishPopup>();
  let giveUpPopup = $state<GiveUpPopup>();
  let letterPicker = $state<LetterPicker>();
  type ModeButtonType = " timer " | " extension ";
  let selectedMode = $state<GameMode>("classic");

  let modeIcon = $derived<ModeButtonType>(
    selectedMode == "classic" ? " extension " : " timer ",
  );

  function start() {
    if (articleViewer) {
      if (letterPicker) {
        letterPicker.resetValues();
      }
      game.start(selectedMode);
      articleViewer.loadData();

      reactiveUserMap = {};
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

  function giveUpButtonPressed() {
    if (!giveUpPopup) return;
    giveUpPopup.getModal()?.open();
  }

  function giveUp() {
    game.giveUp();
  }

  function switchGameMode() {
    if (selectedMode == "classic") {
      selectedMode = "speedrun";
    } else {
      selectedMode = "classic";
    }
  }

  let classicBest = $state(-999999);
  let speedrunBest = $state(999999);

  scores.subscribe((data) => {
    classicBest = data.classic;
    speedrunBest = data.speedrun;
  });

  $effect(() => {
    if (finishPopup && game.done) {
      finishPopup.getModal()?.open();
    }
  });
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=extension,timer,workspace_premium"
  />
</svelte:head>

<!-- main game screen -->
<div
  class="{showTitleScreen ? 'hidden' : ''} {userConfig.darkMode ? 'dark' : ''}"
>
  <div id="game" class={userConfig.darkMode ? "dark" : ""}>
    <TopBar
      newGameCallback={start}
      gameDone={game.done}
      giveUpCallback={giveUpButtonPressed}
      {game}
      score={game.score}
    ></TopBar>
    <div class="midsection">
      <LetterPicker
        {game}
        userMap={reactiveUserMap}
        {setLetterCallback}
        charManager={game.charManager}
        bind:this={letterPicker}
      ></LetterPicker>
      <ArticleViewer
        done={game.done}
        {game}
        charManager={game.charManager}
        bind:this={articleViewer}
      ></ArticleViewer>
    </div>
    <!-- fixed popup -->
    <FinishPopup bind:this={finishPopup} {game}></FinishPopup>
    <GiveUpPopup giveUpCallback={giveUp} bind:this={giveUpPopup} {game}
    ></GiveUpPopup>
  </div>
</div>
<!-- title screen/main menu -->
<div class="title-screen {showTitleScreen ? '' : 'hidden'}">
  <Title></Title>
  <div style="height: 300px"></div>
  <div class="z-up play-buttons-container">
    <button
      class="big-button mode-button"
      onclick={() => {
        switchGameMode();
        playClick2();
      }}
      ><div class="material-symbols-outlined mode-icon">{modeIcon}</div>
      <div class="mode-hint">{selectedMode}</div></button
    >
    <button
      class="big-button play-button"
      onclick={() => {
        playButtonPressed();
        playClick();
      }}>Play</button
    >
    <button
      class="big-button mode-button"
      onclick={() => {
        highscoresToggled = !highscoresToggled;
        playClick2();
      }}
      ><div class="material-symbols-outlined mode-icon">workspace_premium</div>
      <div class="mode-hint">best scores</div></button
    >
    <div class="highscores-info {highscoresToggled ? 'expanded' : ''}">
      <div class="highscore-info">
        Classic: {classicBest == undefined || classicBest == -999999
          ? "no personal best"
          : classicBest}
      </div>
      <button
        class="reset-score-button"
        onclick={() => {
          resetClassicScore();
          playClick2();
        }}>reset classic</button
      >
      <div class="highscore-info">
        Speedrun: {speedrunBest == undefined || speedrunBest == 999999
          ? "no personal best"
          : formatTime(speedrunBest)}
      </div>
      <button
        class="reset-score-button"
        onclick={() => {
          resetSpeedrunScore();
          playClick2();
        }}>reset speedrun</button
      >
    </div>
  </div>
  <button
    class="z-up big-button how-button"
    onclick={() => {
      instructionsToggled = !instructionsToggled;
      playClick2();
    }}>How to play</button
  >
  <div class="z-up play-info {instructionsToggled ? 'expanded' : ''}">
    {#if selectedMode == "classic"}
      All the letters in a Wikipedia page have been <span class="important"
        >JAMBLED</span
      >, and you need to correctly guess the original title!<br /> You can
      <span class="important">UNJAMBLE</span> letters using the left panel, but it'll
      cost you, and frequently used letters are more expensive.
    {:else if selectedMode == "speedrun"}
      All the letters in a Wikipedia page have been <span class="important"
        >JAMBLED</span
      >, and you need to correctly guess the original title as
      <span class="important">fast as possible</span>!<br />
      <span class="important">UNJAMBLE</span> the letters at no cost by using the
      left panel.
    {/if}
  </div>
  <button
    class="github-button"
    onclick={() => {
      window.open("https://github.com/0BBLER/Jambled");
    }}
    title="open GitHub repository"
    ><img alt="GitHub logo" width="80px" height="80px" src="github.png" />
  </button>
</div>
