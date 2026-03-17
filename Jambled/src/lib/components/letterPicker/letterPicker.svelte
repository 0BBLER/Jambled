<script lang="ts">
  import { alphabet, CharManager, type Letter } from "$lib/charManager";

  interface Props {
    charManager: CharManager;
    setLetterCallback: (from: Letter, to: Letter) => void;
    userMap: Record<Letter, Letter>;
  }

  let { charManager, setLetterCallback, userMap }: Props = $props();

  //input overrides
  function changeLetterInput(
    letter: Letter,
    event: Event & { currentTarget: HTMLInputElement },
  ) {
    if (!event.currentTarget) return;
    const value = event.currentTarget.value.toUpperCase().substring(0, 1);
    setLetterCallback(letter, value.toLowerCase());
    event.currentTarget.value = value;
    event.currentTarget.blur();
    event.preventDefault();
  }

  function onFocus(event: Event & { currentTarget: HTMLInputElement }) {
    event.currentTarget.select();
  }
</script>

<div class="letters-container">
  {#each alphabet as letter, i}
    <div class="">
      {letter.toUpperCase()}
    </div>
    <div>
      ⇾
      <input
        oninput={(e) => {
          changeLetterInput(letter, e);
        }}
        onfocus={onFocus}
        class="letter-input"
        value={userMap[letter]?.toUpperCase()}
      />
    </div>
  {/each}
</div>

<style>
  @import "./letterPicker.css";
</style>
