<script lang="ts">
  import { alphabet, CharManager, type Letter } from "$lib/charManager";
  import { Game } from "$lib/game.svelte";
  import { playClick2 } from "$lib/sounds";
  import { articleLoaded } from "$lib/store.svelte";

  interface Props {
    charManager: CharManager;
    setLetterCallback: (from: Letter, to: Letter) => boolean;
    userMap: Record<Letter, Letter>;
    game: Game;
  }

  let { setLetterCallback, userMap, game }: Props = $props();

  let letterValues = $state<Record<Letter, Letter>>({});
  let lastValues: Record<Letter, Letter> = {};

  //input overrides
  function changeLetterInput(
    letter: Letter,
    event: Event & { currentTarget: HTMLInputElement },
  ) {
    if (!event.currentTarget) return;
    if (!$articleLoaded || game.done) {
      event.currentTarget.value = lastValues[letter];
    }
    const value = event.currentTarget.value.toUpperCase().substring(0, 1);
    const set = setLetterCallback(letter, value.toLowerCase());
    if (set) {
      event.currentTarget.blur();
      event.currentTarget.value = value;
      lastValues[letter] = value;
      playClick2();
    } else {
      event.currentTarget.value = lastValues[letter];
    }
  }

  export function resetValues() {
    alphabet.forEach((letter) => {
      letterValues[letter] = letter.toUpperCase();
      lastValues[letter] = letter.toUpperCase();
    });
  }

  function onFocus(event: Event & { currentTarget: HTMLInputElement }) {
    event.currentTarget.select();
  }
</script>

<div class="letters-full-container">
  <div class="letters-container-title">Letter swaps</div>
  <div class="letters-container">
    {#each alphabet as letter}
      <div
        style="margin-right: 2px"
        class="{userMap[letter] == letter
          ? 'letter-unchanged'
          : ''} {!alphabet.includes(userMap[letter]) ? 'letter-invalid' : ''}"
      >
        {letter.toUpperCase()}
      </div>
      <div>
        <span
          class="{userMap[letter] == letter
            ? 'letter-unchanged'
            : ''} {!alphabet.includes(userMap[letter]) ? 'letter-invalid' : ''}"
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
            : ''} {!alphabet.includes(userMap[letter]) ? 'letter-invalid' : ''}"
          bind:value={letterValues[letter]}
          name="letter-input-{letter}"
        />
      </div>
    {/each}
  </div>
</div>

<style>
  @import "./letterPicker.css";
</style>
