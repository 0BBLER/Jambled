# Jambled

A game about decoding Wikipedia articles

## How it works

You get a random article from Wikipedia, except all the letters have been <b>swapped with eachother!</b> Your goal is to figure out what the original title of the article was. There's a helpful box on the side that allows you to swap the letters back.
</br></br>
There are <b>two modes:</b>

- <b>Classic:</b> Try to get as high of a score as possible. All letter swaps cost score, scaling with their frequency in the article. Furthermore, all additional letter swaps increase the score lost by a little bit. All incorrect title guesses also cost score.
- <b>Speedrun:</b> Try to find the title in the shortest amount of time. A timer starts as soon as the article loads, and you can guess freely as much as you want, you just need to submit the correct title has fast as possible.

## Made using:

- TypeScript
- Vite with Svelte
- MediaWiki API

## Build and run for yourself with npm:

After downloading this repository:

```bash
cd Jambled
npm run build
npm run preview
```

## npm dependencies used

- @hiseb/confetti
  </br></br>

### Jambled is not affiliated with Wikipedia
