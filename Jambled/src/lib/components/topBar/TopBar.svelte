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

  function inputKeydown(event: KeyboardEvent) {
    if (!inputElement?.value || game.done) return;
    if (event.key == "Enter") {
      game.guessTitle(inputElement.value);
      inputElement.value = "";
    }
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
      class="guess-input"
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
  @import "./topBar.css";
</style>
