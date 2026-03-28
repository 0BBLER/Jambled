<script lang="ts">
  import { type Letter } from "$lib/charManager";
  import ArticleViewer from "$lib/components/articleViewer/ArticleViewer.svelte";
  import FinishPopup from "$lib/components/finishPopup/FinishPopup.svelte";
  import GiveUpPopup from "$lib/components/giveUpPopup/GiveUpPopup.svelte";
  import LetterPicker from "$lib/components/letterPicker/LetterPicker.svelte";
  import Modal from "$lib/components/modal/Modal.svelte";
  import Title from "$lib/components/title/Title.svelte";
  import TopBar from "$lib/components/topBar/TopBar.svelte";
  import { Game } from "$lib/game.svelte";
  import { playClick, playClick2 } from "$lib/sounds";
  import {
  CLASSIC_UNSET,
    daily,
    loadDailyArticles,
    playedDaily,
    resetClassicScore,
    resetSpeedrunScore,
    scores,
    SPEEDRUN_UNSET,
    userConfig,
  } from "$lib/store.svelte";
  import { formatTime } from "$lib/utils";
  import { onMount } from "svelte";

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
  let mainMenuPopup = $state<Modal>();
  type ModeButtonType = " timer " | " extension ";
  let selectedMode = $state<GameMode>("classic");

  let playedClassic = $derived.by<boolean>(() => {
    return (
      new Date($daily.classicTimestamp).toISOString().substring(0, 10) ==
      new Date().toISOString().substring(0, 10)
    );
  });

  let playedSpeedrun = $derived.by<boolean>(() => {
    return (
      new Date($daily.speedrunTimestamp).toISOString().substring(0, 10) ==
      new Date().toISOString().substring(0, 10)
    );
  });

  let modeIcon = $derived<ModeButtonType>(
    selectedMode == "classic" ? " extension " : " timer ",
  );

  onMount(() => {
    if (!playedDaily("classic") || !playedDaily("speedrun"))
      loadDailyArticles();
  });

  async function start() {
    if (articleViewer) {
      if (letterPicker) {
        letterPicker.resetValues();
      }
      const isDaily = !playedDaily(selectedMode);
      game.start(selectedMode, isDaily);
      await articleViewer.loadData(selectedMode, isDaily);

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

  function titleClickedCallback() {
    if (game.done) {
      showTitleScreen = true;
      articleViewer?.clear();
    } else {
      if (mainMenuPopup) {
        mainMenuPopup.open();
      }
    }
  }

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
      {titleClickedCallback}
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
    <Modal bind:this={mainMenuPopup} classes="">
      <div>You can only leave when not ingame.</div>
    </Modal>
  </div>
</div>
<!-- title screen/main menu -->
<div class="title-screen {showTitleScreen ? '' : 'hidden'}">
  <Title></Title>
  <div style="height: 300px"></div>
  <div class="z-up play-buttons-container">
    <!-- gamemode button -->
    <button
      class="big-button mode-button"
      onclick={() => {
        switchGameMode();
        playClick2();
      }}
      ><div class="material-symbols-outlined mode-icon">{modeIcon}</div>
      <div class="mode-hint">{selectedMode}</div></button
    >
    <!-- play button -->
    <button
      class="big-button play-button"
      onclick={() => {
        playButtonPressed();
        playClick();
      }}
      >{(selectedMode == "classic" && !playedClassic) ||
      (selectedMode == "speedrun" && !playedSpeedrun)
        ? "Play daily"
        : "Play random"}</button
    >
    <!-- highscores button -->
    <button
      class="big-button mode-button"
      onclick={() => {
        highscoresToggled = !highscoresToggled;
        playClick2();
      }}
      ><div class="material-symbols-outlined mode-icon">workspace_premium</div>
      <div class="mode-hint">best scores</div></button
    >
    <!-- highscores info popout -->
    <div class="highscores-info {highscoresToggled ? 'expanded' : ''}">
      <div class="highscore-info">
        Classic: {$scores.classic == undefined || $scores.classic == CLASSIC_UNSET
          ? "no personal best"
          : $scores.classic}
      </div>
      <button
        class="reset-score-button"
        onclick={() => {
          resetClassicScore();
          playClick2();
        }}>reset classic</button
      >
      <div class="highscore-info">
        Speedrun: {$scores.speedrun == undefined || $scores.speedrun == SPEEDRUN_UNSET
          ? "no personal best"
          : formatTime($scores.speedrun)}
      </div>
      <button
        class="reset-score-button"
        onclick={() => {
          resetSpeedrunScore();
          playClick2();
        }}>reset speedrun</button
      >
    </div>
    <!-- daily personal score -->
    <div class="daily-scores-info">
      <div class="daily-scores-title">Your daily scores</div>
      <div>
        Classic: {playedClassic ? $daily.classic : "unplayed"}
      </div>
      <div>
        Speedrun: {playedSpeedrun
          ? $daily.speedrun == SPEEDRUN_UNSET
            ? "forfeited"
            : formatTime($daily.speedrun)
          : "unplayed"}
      </div>
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

<style>
  .title-screen {
    font-family: "Sansation", sans-serif;
    color: rgb(204, 204, 204);
    background-color: rgb(36, 36, 36);
    display: flex;
    place-items: center;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 12px;
  }

  .how-button {
    font-size: 2rem !important;
    box-shadow: 0 0 12px rgb(121, 121, 121);
  }

  .play-button {
    box-shadow: 0 0 12px rgb(121, 121, 121);
  }

  .play-buttons-container {
    display: flex;
    flex-direction: row;
    gap: 20px;
  }

  .mode-button {
    width: 100px;
    height: 100px;
    box-shadow: 0 0 12px rgb(121, 121, 121);
    display: flex;
    flex-direction: column;
    place-items: center;
    justify-content: center;
  }

  .mode-icon {
    font-size: 3rem !important;
  }

  .mode-hint {
    font-size: 1rem;
  }

  .play-info {
    font-size: 2rem;
    max-width: 640px;
    overflow: hidden;
    height: 0;
    transition: height 500ms ease-in-out;
    text-align: center;
    color: rgb(175, 175, 175);
  }

  .play-info.expanded {
    height: 300px;
  }

  .play-info .important {
    font-weight: bold;
    font-size: 2.1rem;
    color: rgb(204, 204, 204);
    text-shadow: 0 0 3px white;
  }

  #game {
    font-family: "Sansation", sans-serif;
    line-height: 1.6;
    padding: 16px 16px 8px 16px;
    display: flex;
    flex-direction: column;
    height: 100vh;
    box-sizing: border-box;
  }

  #game.dark {
    color: rgb(204, 204, 204);
    background-color: rgb(36, 36, 36);
  }

  .midsection {
    display: grid;
    grid-template-columns: 110px 1fr;
    flex: 1 1 auto;
    height: 100%;
    min-height: 0;
  }

  .github-button {
    position: absolute;
    right: 5px;
    bottom: 5px;
    background-color: transparent !important;
    outline: none !important;
    transition: transform 700ms ease-in-out;
    z-index: 2;
  }

  .github-button:hover {
    transform: rotate(360deg);
  }

  .highscores-info {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    max-width: 0px;
    transition: max-width 500ms ease-out;
    gap: 7px;
    box-sizing: border-box;
  }

  .highscores-info.expanded {
    max-width: 200px;
  }

  .highscore-info {
    white-space: nowrap;
  }

  .reset-score-button {
    white-space: nowrap;
    width: min-content;
    box-sizing: border-box;
    margin-left: 5px;
  }

  .daily-scores-title {
    font-size: 1.5em;
  }

  .daily-scores-info {
    position: absolute;
    bottom: 8px;
    left: 8px;
    text-align: left;
  }
</style>
