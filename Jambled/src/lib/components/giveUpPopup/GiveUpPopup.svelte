<!-- prompt appearing when you press give up -->
<script lang="ts">
  import { Game } from "$lib/game.svelte";
  import { playClick2, playTrumpet } from "$lib/sounds";
  import Modal from "../modal/Modal.svelte";

  interface Props {
    game: Game;
    giveUpCallback: () => void;
  }
  let { game, giveUpCallback }: Props = $props();
  let modal = $state<Modal>();

  export function getModal() {
    return modal;
  }
</script>

<Modal bind:this={modal} classes="give-up-popup-container">
  <div class="confirm-give-up">Are you sure you want to give up?</div>
  <div class="give-up-buttons-container">
    <button
      class="big-button"
      onclick={() => {
        modal?.close();
        giveUpCallback();
        playTrumpet();
      }}>Yes</button
    >
    <button
      class="big-button"
      onclick={() => {
        if (modal) modal.close();
        playClick2();
      }}>No</button
    >
  </div>
</Modal>

<style>
  @import "./giveUpPopup.css";
</style>
