<!-- this is the super cool scrolling main menu title -->

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
        <!-- 3 repeats of the alphabet so that you can scroll up and down -->
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
  .title-container {
    display: flex;
    flex-direction: row;
    position: absolute;
    top: calc(-440px + 10vh * 5); /* this positions the word correctly */
    height: calc(100vh + 440px + 10vh * 5);
    overflow: hidden;
    mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 0.466) 220px,
      black 260px,
      black 370px,
      rgba(0, 0, 0, 0.466) 410px,
      rgba(0, 0, 0, 0.103) 600px,
      transparent calc(100% - (440px + 10vh * 5)) /* bottom */
    );

    --letter-spacing: 8rem;
    --letter-size: calc(var(--letter-spacing) + 2rem);
  }

  .title-container::before {
    height: 100%;
    width: 100%;
    position: absolute;
    z-index: 2;
    display: block;
    content: "";
  }

  .letter-col-wrapper {
    transform: translateY(calc(var(--offset) * -1 * var(--letter-spacing)));
    font-size: var(--letter-size);
  }

  .letter-col-container {
    display: flex;
    flex-direction: column;
    line-height: var(--letter-spacing);
  }

  .letter-col-wrapper:nth-child(odd) .letter-col-container {
    animation-name: spin;
    animation-timing-function: ease;
  }

  .letter-col-wrapper:nth-child(even) .letter-col-container {
    animation-name: spinReverse;
    animation-timing-function: ease;
  }

  .letter-col-wrapper:nth-child(1) .letter-col-container {
    animation-duration: 2.1s;
  }
  .letter-col-wrapper:nth-child(2) .letter-col-container {
    animation-duration: 3.6s;
  }
  .letter-col-wrapper:nth-child(3) .letter-col-container {
    animation-duration: 5.1s;
  }
  .letter-col-wrapper:nth-child(4) .letter-col-container {
    animation-duration: 4.2s;
  }
  .letter-col-wrapper:nth-child(5) .letter-col-container {
    animation-duration: 3.8s;
  }
  .letter-col-wrapper:nth-child(6) .letter-col-container {
    animation-duration: 2.4s;
  }
  .letter-col-wrapper:nth-child(7) .letter-col-container {
    animation-duration: 4.1s;
  }

  .title-letter {
    display: inline-block;
    transform: translateY(0);
    height: var(--letter-spacing);
    text-align: center;
  }

  .title-letter.special {
    font-weight: bold;
    color: rgb(241, 241, 241);
    text-shadow: 0 0 7px white;
  }

  @keyframes letter {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateY(calc(var(--offset) * -1 * var(--letter-spacing)));
      opacity: 1;
    }
  }

  @keyframes spin {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateY(calc(26 * -1 * var(--letter-spacing)));
      opacity: 1;
    }
  }

  @keyframes spinReverse {
    0% {
      transform: translateY(calc(26 * -1 * var(--letter-spacing)));
      opacity: 1;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
