<!-- prompt appearing when you finish the game -->
<!-- triggers on win and give up -->
<!-- contains information about the game -->
<script lang="ts">
  import { Game } from "$lib/game.svelte";
  import { formatTime } from "$lib/utils";
  import Modal from "../modal/Modal.svelte";

  interface Props {
    game: Game;
  }
  let { game }: Props = $props();
  let modal = $state<Modal>();

  export function getModal() {
    return modal;
  }

  interface WinName {
    minimumScore: number;
    maximumTime: number;
    name: string;
  }
  const winNames: WinName[] = [
    { minimumScore: -999999, maximumTime: 999999999999, name: "wikifetus" },
    { minimumScore: 2000, maximumTime: 300000, name: "wikikiddie" },
    { minimumScore: 6000, maximumTime: 150000, name: "wikimaster" },
    { minimumScore: 9000, maximumTime: 60000, name: "wikigod" },
  ];
</script>

<Modal bind:this={modal} classes="finish-popup-container">
  <!-- title -->
  {#if game.wonGame}
    <div class="you-got-it">You got it!</div>
  {:else}
    <div class="you-gave-up">You gave up!</div>
  {/if}
  <!-- score/time -->
  {#if game.currentMode == "classic"}
    <div>Your score:</div>
    <div class="finish-score">{game.score}</div>
  {:else if game.currentMode == "speedrun"}
    <div>Your time:</div>
    <div class="finish-score">{formatTime(game.elapsedTime)}</div>
  {/if}
  <!-- new highscore -->
  {#if game.newHighscore}
    <div class="new-highscore">That's a new highscore!</div>
  {/if}
  <!-- special message -->
  {#if game.wonGame}
    {#if game.currentMode == "classic"}
      <div class="wiki-name">
        You're a <b
          >{winNames.findLast((name) => name.minimumScore < game.score)?.name ??
            "wikimaster"}</b
        >!
      </div>
    {:else if game.currentMode == "speedrun"}
      <div class="wiki-name">
        You're a <b
          >{winNames.findLast((name) => name.maximumTime > game.elapsedTime)
            ?.name ?? "wikimaster"}</b
        >!
      </div>
    {/if}
  {/if}
  <!-- only include score breakdown for classic -->
  {#if game.currentMode == "classic"}
    <div class="score-breakdown-header">Breakdown</div>
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
  {/if}
</Modal>

<style>
  @import "./finishPopup.css";
</style>
