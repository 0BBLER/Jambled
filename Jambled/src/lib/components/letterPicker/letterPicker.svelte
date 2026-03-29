<script lang="ts">
  import { alphabet, CharManager, type Letter } from "$lib/charManager";
  import { Game } from "$lib/game.svelte";
  import { playClick2 } from "$lib/sounds";
  import { articleLoaded, sawTooltip, userData } from "$lib/store.svelte";

  interface Props {
    charManager: CharManager;
    setLetterCallback: (from: Letter, to: Letter, external: boolean) => boolean;
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
    const set = setLetterCallback(letter, value.toLowerCase(), false);
    if (set) {
      event.currentTarget.blur();
      event.currentTarget.value = value;
      lastValues[letter] = value;
      playClick2();
    } else {
      event.currentTarget.value = lastValues[letter];
    }
  }

  //updated letters from somewhere else
  export function externalUpdateLetter(from: Letter, to: Letter) {
    lastValues[from] = to.toUpperCase();
    letterValues[from] = to.toUpperCase();
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

<div style="position: relative; min-height: 0">
  <div class="letter-input-tooltip {$userData.seenTooltip ? 'hidden' : ''}">
    Enter a letter on the line here to swap all of them in the article for the
    new one
  </div>
  <div class="letters-full-container">
    <div class="letters-container-title">Letter swaps</div>

    <div class="letters-container">
      {#each alphabet as letter, i}
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
              : ''} {!alphabet.includes(userMap[letter])
              ? 'letter-invalid'
              : ''}">⇾</span
          >
          <input
            type="text"
            oninput={(e) => {
              sawTooltip();
              changeLetterInput(letter, e);
            }}
            onfocus={onFocus}
            class="letter-input {userMap[letter] == letter
              ? 'letter-unchanged'
              : ''} {!alphabet.includes(userMap[letter])
              ? 'letter-invalid'
              : ''}"
            bind:value={letterValues[letter]}
            name="letter-input-{letter}"
          />
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .letters-container {
    display: grid;
    grid-template-columns: 1;
    grid-template-rows: repeat(26, 30px);
    grid-template-columns: min-content max-content;
    font-size: 1.3em;
    justify-self: center;
    text-align: center;
  }

  .letters-full-container {
    border-left: 1px solid rgb(112, 112, 112);
    border-right: 1px solid rgb(112, 112, 112);
    overflow-y: auto;
    position: relative;
    height: 100%;
  }

  .letter-input {
    background-color: transparent;
    border: none;
    border-bottom: 1px solid rgb(112, 112, 112);
    width: 0.9em;
    outline: none;
    color: inherit;
    font-size: inherit;
    transform: translateY(0px);
    font-family: inherit;
    text-align: center;
    cursor: pointer;
  }

  .letter-unchanged {
    color: rgb(102, 102, 102);
    transition: color 200ms ease-in-out;
  }

  .letter-unchanged:hover {
    color: rgb(223, 223, 223);
  }

  .letters-container-title {
    text-align: center;
    text-decoration: underline;
  }

  .letter-invalid {
    color: rgb(146, 78, 78) !important;
  }

  .letter-input-tooltip {
    position: absolute;
    left: 100px;
    font-size: 1rem;
    z-index: 3;
    top: 70px;
    width: 300px;
    background-color: rgba(182, 182, 182, 0.9);
    border-radius: 4px;
    padding: 4px 8px;
    color: rgb(37, 37, 37);
  }

  .letter-input-tooltip::after {
    content: "";
    position: absolute;
    left: -10px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-right: 10px solid rgba(182, 182, 182, 0.9);
  }
</style>
