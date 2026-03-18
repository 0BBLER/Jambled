<script lang="ts">
  import { Game } from "$lib/game.svelte";
  import Modal from "../modal/Modal.svelte";

  interface Props {
    game: Game;
  }
  let { game }: Props = $props();
  let modal = $state<Modal>();

  export function getModal() {
    return modal;
  }
</script>

<Modal bind:this={modal} classes="finish-popup-container">
  {#if game.wonGame}
    <div class="you-got-it">You got it!</div>
  {:else}
    <div class="you-gave-up">You gave up!</div>
  {/if}
  <div>Your score:</div>
  <div class="finish-score">{game.score}</div>
  {#if game.wonGame}
    <div>You're a <b>wikimaster</b>!</div>
  {/if}
  <div>Breakdown</div>
  <div class="score-breakdown">
    <div>
      <span class="score-negative">{game.charsCost}</span>
      from {game.charGuesses}
      character guess{game.charGuesses == 1 ? "" : "es"}
    </div>
    <div>
      <span class="score-negative"
        >{game.titleGuesses * game.scoringRules.title}</span
      >
      from {game.titleGuesses} incorrect title guess{game.titleGuesses == 1
        ? ""
        : "es"}
    </div>
    <div>
      {#if game.wonGame}
        <span class="score-positive">+{game.scoringRules.win}</span> from 1 win
      {:else}
        <span class="score-negative">0</span> from 1 forfeit
      {/if}
    </div>
  </div>
</Modal>

<style>
  @import "./finishPopup.css";
</style>
