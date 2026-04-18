<!-- this is the bar at the top of the game -->
<!-- contains title, title input, and score info -->
<script lang="ts">
  import { Game } from "$lib/game.svelte";
  import { playClick, playClick2 } from "$lib/sounds";
  import { CLASSIC_UNSET, scores, SPEEDRUN_UNSET } from "$lib/store.svelte";
  import { formatTime } from "$lib/utils";

  interface Props {
    score: number;
    game: Game;
    giveUpCallback: () => void;
    newGameCallback: () => void;
    titleClickedCallback: () => void;
    gameDone: boolean;
  }
  let {
    score,
    game,
    giveUpCallback,
    newGameCallback,
    gameDone,
    titleClickedCallback,
  }: Props = $props();

  let inputElement = $state<HTMLInputElement>();
  let guessInputShake = $state(false);

  function inputKeydown(event: KeyboardEvent) {
    if (!inputElement?.value || game.done) return;
    if (event.key == "Enter") {
      if (!game.guessTitle(inputElement.value)) {
        startGuessInputShake();
      }
      inputElement.value = "";
    }
  }

  export function setTitleInput(value: string) {
    if (!inputElement) return;
    inputElement.value = value;
  }

  export function startGuessInputShake() {
    guessInputShake = false;
    setTimeout(() => {
      guessInputShake = true;
    }, 0);
  }
</script>

<div class="top-bar">
  <div class="top"></div>
  <div class="bottom">
    <!-- title -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      onclick={() => {
        titleClickedCallback();
        playClick2();
      }}
      class="top-bar-title"
    >
      Jambled
    </div>
    <!-- title input -->
    <input
      type="text"
      bind:this={inputElement}
      autocapitalize="off"
      autocorrect="off"
      autocomplete="off"
      spellcheck="false"
      class="guess-input {guessInputShake ? 'title-shake-animation' : ''}"
      placeholder="Enter title guess here"
      onkeydown={inputKeydown}
    />
    <!-- give up/new game buttons -->
    {#if !gameDone}
      <button
        class="give-up"
        onclick={() => {
          giveUpCallback();
          playClick2();
        }}>Give up</button
      >
    {/if}
    {#if gameDone}
      <button
        class="new-game"
        onclick={() => {
          newGameCallback();
          playClick();
        }}>New game</button
      >
    {/if}
    <!-- score info -->
    <div class="score-info">
      {#if game.currentMode == "classic"}
        <div class="top-score">
          Score: {score}
        </div>
      {:else if game.currentMode == "speedrun"}
        <div class="elapsed-time-container">
          <div class="top-score">
            Time: {formatTime(game.elapsedTime)}
          </div>
        </div>
      {/if}

      <!-- highscore info -->
      <div class="best-score">
        {#if game.currentMode == "classic"}
          {$scores != undefined && $scores.classic != CLASSIC_UNSET
            ? `Best: ${$scores.classic}`
            : "No personal best"}
        {:else if game.currentMode == "speedrun"}
          {$scores != undefined && $scores.speedrun != SPEEDRUN_UNSET
            ? `Best: ${formatTime($scores.speedrun)}`
            : "No personal best"}
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .top-bar {
    height: 80px;
    border-bottom: 1px solid rgb(112, 112, 112);
    line-height: 1em;
  }

  .top-bar .bottom {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 2em;
  }

  .top-bar .top {
    display: flex;
    flex-direction: row;
  }

  .give-up {
    margin-left: auto;
    color: rgb(202, 31, 31);
    background-color: rgb(80, 59, 59);
  }

  .top-bar-title {
    margin-right: 8px;
    padding-right: 8px;
    border-right: 3px solid rgba(199, 199, 199, 0.575);
    cursor: pointer;
    transition: transform 200ms ease-in-out;
  }

  .top-bar-title:hover {
    transform: rotate(10deg);
  }

  .guess-input {
    background-color: transparent;
    outline: none;
    border: none;
    color: inherit;
    border-bottom: 3px solid rgba(228, 228, 228, 0.89);
    font-family: inherit;
    field-sizing: content;
    font-size: inherit;
    margin-right: auto;
    max-width: 800px;
  }

  .new-game {
    font-size: inherit;
    color: rgb(147, 216, 158);
  }

  .score-info {
    margin-left: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .top-score {
    font-size: inherit;
    font-weight: bold;
    margin-top: 10px;
  }

  .best-score {
    font-size: 0.5em;
  }

  .elapsed-time-container {
    min-width: 300px;
  }

  .title-shake-animation {
    animation: guess-shake 300ms ease;
  }

  @keyframes guess-shake {
    0% {
      border-bottom: 3px solid rgba(228, 228, 228, 0.89);
    }

    25% {
      border-bottom: 3px solid rgba(236, 6, 6, 0.89);
      transform: translateX(-4px);
    }

    50% {
      border-bottom: 3px solid rgba(236, 6, 6, 0.89);
      transform: translateX(4px);
    }

    75% {
      border-bottom: 3px solid rgba(236, 6, 6, 0.89);
      transform: translateX(-4px);
    }

    100% {
      border-bottom: 3px solid rgba(228, 228, 228, 0.89);
    }
  }
</style>
