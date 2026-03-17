<script lang="ts">
  import { Game } from "$lib/game.svelte";

  export let game: Game; //legacy mode
</script>

<div class="finish-popup-container">
  <div class="you-got-it">You got it!</div>
  <div>Your score:</div>
  <div class="finish-score">{game.score}</div>
  <div>You're a <b>wikimaster</b>!</div>
  <div>Breakdown</div>
  <div class="score-breakdown">
    <div>
      <span class="score-negative"
        >{game.charGuesses * game.scoringRules.char}</span
      >
      from {game.charGuesses}
      character guess{game.charGuesses == 1 ? "" : "es"}
    </div>
    <div>
      <span class="score-negative"
        >{game.titleGuesses * game.scoringRules.title}</span
      >
      from {game.titleGuesses} incorrect title guess{game.titleGuesses == 1 ? "" : "es"}
    </div>
    <div>
      <span class="score-positive">+{game.scoringRules.win}</span> from 1 win
    </div>
  </div>
</div>

<style>
  @import "./finishPopup.css";
</style>
