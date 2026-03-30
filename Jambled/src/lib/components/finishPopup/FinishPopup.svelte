<!-- prompt appearing when you finish the game -->
<!-- triggers on win and give up -->
<!-- contains information about the game -->
<script lang="ts">
  import { Game, scoringRules } from "$lib/game.svelte";
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
    { minimumScore: -999999, maximumTime: 999999999, name: "wikifetus" },
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
  <!-- only include score breakdown for classic -->
  {#if game.currentMode == "classic"}
    <div class="score-breakdown-header">Breakdown</div>
    <div class="score-breakdown">
      <div>
        <span class="score-negative">{game.charsCost}</span>
        from {game.charGuesses}
        letter change{game.charGuesses == 1 ? "" : "s"}
      </div>
      <div>
        <span class="score-negative"
          >{game.titleGuesses * scoringRules.title}</span
        >
        from {game.titleGuesses} incorrect title guess{game.titleGuesses == 1
          ? ""
          : "es"}
      </div>
      <div>
        {#if game.wonGame}
          <span class="score-positive">+{scoringRules.win}</span> from 1 win
        {:else}
          <span class="score-negative">0</span> from 1 forfeit
        {/if}
      </div>
    </div>
  {/if}
</Modal>

<style>
  .you-got-it {
    font-size: 2em;
    color: rgb(146, 224, 131);
  }

  .you-gave-up {
    font-size: 2em;
    color: rgb(231, 99, 99);
  }

  .finish-score {
    font-size: 5em;
    line-height: 1em;
    font-weight: bold;
    text-shadow: 0 0 4px white;
  }

  .score-breakdown-header {
    border-top: 2px solid rgba(200, 200, 200, 0.521);
  }

  .score-breakdown {
    color: rgb(230, 230, 230);
  }

  .new-highscore {
    font-weight: bold;
    font-size: 1.3rem;
    color: rgb(250, 246, 17);
    text-shadow: 0 0 3px rgb(247, 246, 189);
  }

  .wiki-name {
    font-size: 1.9em;
  }
</style>
