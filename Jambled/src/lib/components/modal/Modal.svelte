<!-- general modal component -->

<script lang="ts">
  import { onMount, type Snippet } from "svelte";

  interface Props {
    children: Snippet;
    classes: string;
  }

  const { children, classes }: Props = $props();
  let dialog = $state<HTMLDialogElement>();
  export function close() {
    if (dialog) {
      dialog.close();
    }
  }

  export function open() {
    if (dialog) {
      dialog.showModal();
    }
  }

  /* only clicks outside the modal will trigger it */
  function clicked(event: MouseEvent) {
    if (event.target === dialog) {
      close();
    }
  }
</script>

<dialog onclick={clicked} bind:this={dialog} class="modal {classes}">
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-contents" onclick={(e) => e.stopPropagation()}>
    <!-- this is used to prevent clicks inside from closing it -->
    {@render children?.()}
  </div>
</dialog>

<style>
  
</style>
