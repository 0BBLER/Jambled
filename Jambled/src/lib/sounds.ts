const confettiAudio = new Audio("confetti.mp3");
const clickAudio = new Audio("click.mp3");
const click2Audio = new Audio("click2.mp3");
const trumpetAudio = new Audio("trumpet.mp3");
const noisemakerAudio = new Audio("noisemaker.mp3");

function playSound(sound: HTMLAudioElement) {
  sound.pause();
  sound.currentTime = 0;
  sound.play();
}

export function playConfetti() {
  playSound(confettiAudio);
}

export function playClick() {
  playSound(clickAudio);
}

export function playClick2() {
  playSound(click2Audio);
}

export function playTrumpet() {
  playSound(trumpetAudio);
}

export function playNoisemaker() {
  playSound(noisemakerAudio);
}
