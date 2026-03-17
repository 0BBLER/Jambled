<script lang="ts">
  import { CharManager, type Letter } from "$lib/charManager";
  import { getArticleData } from "$lib/wiki";
  import { userConfig } from "$lib/store";
  import ArticleViewer from "$lib/components/articleViewer/articleViewer.svelte";
  import LetterPicker from "$lib/components/letterPicker/letterPicker.svelte";
  import { Game } from "$lib/game";

  let articleViewer = $state<ArticleViewer>();

  let game = $state<Game>(new Game());
  let reactiveUserMap = $state<Record<Letter, Letter>>({
    ...game.charManager.userMap,
  });

  function start() {
    if (articleViewer) {
      game.start();
      articleViewer.loadData();

      reactiveUserMap = {
        ...game.charManager.userMap,
      };
    }
  }

  function setLetterCallback(from: string, to: string) {
    if (game.charManager.setUserMap(from, to)) {
      reactiveUserMap[from] = to;
      articleViewer?.updateCharacters();
    }
  }
</script>

<div class="main-container">
  <button onclick={start}>Start</button>
  <div id="game" class={userConfig.darkMode ? "dark" : ""}>
    <LetterPicker
      userMap={reactiveUserMap}
      {setLetterCallback}
      charManager={game.charManager}
    ></LetterPicker>
    <ArticleViewer charManager={game.charManager} bind:this={articleViewer}
    ></ArticleViewer>
  </div>
</div>
