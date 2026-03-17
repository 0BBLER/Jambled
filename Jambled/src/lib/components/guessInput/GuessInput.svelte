<script lang="ts">
  import { Game } from "$lib/game.svelte";

  let inputElement = $state<HTMLInputElement>();

  interface Props {
    game: Game;
  }
  let { game }: Props = $props();

  function inputKeydown(event: KeyboardEvent) {
    if (!inputElement?.value) return;
    if (event.key == "Enter") {
      game.guessTitle(inputElement.value);
    }
  }
</script>

<div class="guess-input-container">
  <input
  type="text"
    bind:this={inputElement}
    autocapitalize="off"
    autocorrect="off"
    autocomplete="off"
    spellcheck="false"
    class="guess-input"
    placeholder="Enter a guess"
    onkeydown={inputKeydown}
  />
</div>

<style>
  @import "./guessInput.css";
</style>
