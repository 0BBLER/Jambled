<script lang="ts">
  import { Game } from "$lib/game.svelte";

  interface Props {
    score: number;
    game: Game;
  }
  let { score, game }: Props = $props();

  let inputElement = $state<HTMLInputElement>();

  function inputKeydown(event: KeyboardEvent) {
    if (!inputElement?.value) return;
    if (event.key == "Enter") {
      game.guessTitle(inputElement.value);
      inputElement.value = "";
    }
  }
</script>

<div class="top-bar">
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
  <div class="top-score">Score: {score}</div>
</div>

<style>
  @import "./topBar.css";
</style>
