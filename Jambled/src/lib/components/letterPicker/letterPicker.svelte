<script lang="ts">
  import { alphabet, CharManager, type Letter } from "$lib/charManager";
  import { Game } from "$lib/game.svelte";
  import { articleLoaded } from "$lib/store";

  interface Props {
    charManager: CharManager;
    setLetterCallback: (from: Letter, to: Letter) => boolean;
    userMap: Record<Letter, Letter>;
    game: Game;
  }

  let { setLetterCallback, userMap, game }: Props = $props();

  //input overrides
  function changeLetterInput(
    letter: Letter,
    event: Event & { currentTarget: HTMLInputElement },
  ) {
    if (!event.currentTarget) return;
    if (!$articleLoaded || game.done) {
      return;
    }
    const value = event.currentTarget.value.toUpperCase().substring(0, 1);
    setLetterCallback(letter, value.toLowerCase());
    event.currentTarget.blur();
    event.currentTarget.value = value;
    event.preventDefault();
  }

  function onFocus(event: Event & { currentTarget: HTMLInputElement }) {
    event.currentTarget.select();
  }
</script>

<!-- TODO make red when invalid -->
<div class="letters-full-container">
  <div class="letters-container-title">Letter swaps</div>
  <div class="letters-container">
    {#each alphabet as letter}
      <div class={userMap[letter] == letter ? "letter-unchanged" : ""}>
        {letter.toUpperCase()}
      </div>
      <div>
        <span class={userMap[letter] == letter ? "letter-unchanged" : ""}
          >⇾</span
        >
        <input
          type="text"
          oninput={(e) => {
            changeLetterInput(letter, e);
          }}
          onfocus={onFocus}
          class="letter-input {userMap[letter] == letter
            ? 'letter-unchanged'
            : ''}"
          value={userMap[letter]?.toUpperCase()}
          name="letter-input-{letter}"
        />
      </div>
    {/each}
  </div>
</div>

<style>
  @import "./letterPicker.css";
</style>
