<script lang="ts">
  import { Game } from "$lib/game.svelte";
  import { highscore } from "$lib/store";

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
      <div class="top-score">Score: {score}</div>
      <div class="best-score">
        {$highscore != undefined ? `Best: ${$highscore}` : "No personal best"}
      </div>
    </div>
  </div>
</div>

<style>
  @import "./topBar.css";
</style>
