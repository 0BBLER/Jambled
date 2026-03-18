<script lang="ts">
  import { Game } from "$lib/game.svelte";
  import { scores } from "$lib/store.svelte";
  import { formatTime } from "$lib/utils";

  interface Props {
    score: number;
    game: Game;
    giveUpCallback: () => void;
    newGameCallback: () => void;
    gameDone: boolean;
  }
  let { score, game, giveUpCallback, newGameCallback, gameDone }: Props =
    $props();

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
    <div class="top-bar-title">Jambled</div>
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
    {#if !gameDone}
      <button class="give-up" onclick={giveUpCallback}>Give up</button>
    {/if}
    {#if gameDone}
      <button class="new-game" onclick={newGameCallback}>New game</button>
    {/if}
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

      <div class="best-score">
        {#if game.currentMode == "classic"}
          {$scores != undefined && $scores.classic != -999999
            ? `Best: ${$scores.classic}`
            : "No personal best"}
        {:else if game.currentMode == "speedrun"}
          {$scores != undefined && $scores.speedrun != 999999
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
