<script lang="ts">
  import { alphabet } from "$lib/charManager";

  const letters = alphabet.map((letter) => letter.toUpperCase());
  const word = "JAMBLED".split("");
  const finalLetterOffsets = word.map((letter) =>
    letters.findIndex((find) => find == letter),
  );
</script>

<div class="title-container">
  {#each finalLetterOffsets as offset, i}
    <div class="letter-col-wrapper" style="--offset:{offset + 24}">
      <div class="letter-col-container">
        {#each letters.concat(letters).concat(letters) as subletter}
          <span class="title-letter {subletter == word[i] ? 'special' : ''}"
            >{subletter}</span
          >
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  @import "./title.css";
</style>
