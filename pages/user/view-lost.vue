<template>
  <div
    class="flex items-center p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700"
    role="alert"
  >
    <svg
      class="w-6 h-6 mr-2"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M10.29 3.86l-6.6 11.45A2 2 0 005.21 18h13.58a2 2 0 001.72-2.69l-6.6-11.45a2 2 0 00-3.42 0zM12 9v4m0 4h.01"
      ></path>
    </svg>
    <p>System is updating. It will be available soon.</p>
  </div>
  <div
    class="flex justify-center items-center h-screen flex-col relative overflow-hidden"
  >
    <div v-if="!gameStarted" class="text-center">
      <h2 class="text-2xl font-bold">Click the Button Challenge!</h2>
      <p class="mt-2">Click as many times as you can in 10 seconds!</p>
      <button
        @click="startGame"
        class="bg-blue-500 text-white px-6 py-2 mt-4 rounded-lg"
      >
        Start Game
      </button>
    </div>

    <div v-else class="text-center">
      <h2 class="text-xl font-bold">Time Left: {{ timeLeft }}s</h2>
      <button
        @click="incrementScore"
        class="bg-red-500 text-white px-6 py-2 mt-4 rounded-lg text-3xl"
      >
        Click Me!
      </button>
      <p class="mt-2 text-lg font-bold">Score: {{ score }}</p>
    </div>

    <div v-if="gameOver" class="text-center mt-4">
      <h2 class="text-xl font-bold">Game Over!</h2>
      <p class="mt-2">Final Score: {{ score }}</p>
      <button
        @click="resetGame"
        class="bg-green-500 text-white px-6 py-2 mt-4 rounded-lg"
      >
        Play Again
      </button>
    </div>

    <div
      v-for="(particle, index) in particles"
      :key="index"
      class="absolute w-6 h-6 bg-yellow-500 rounded-full"
      :style="{ top: particle.y + 'px', left: particle.x + 'px' }"
    ></div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const score = ref(0);
const timeLeft = ref(10);
const gameStarted = ref(false);
const gameOver = ref(false);
const particles = ref([]);
let timer = null;

const startGame = () => {
  gameStarted.value = true;
  gameOver.value = false;
  score.value = 0;
  timeLeft.value = 10;
  particles.value = [];
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      endGame();
    }
  }, 1000);
};
definePageMeta({ layout: "user" });
const incrementScore = (event) => {
  if (gameStarted.value && timeLeft.value > 0) {
    score.value++;
    addParticle(event);
  }
};

const addParticle = (event) => {
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;
  particles.value.push({ x, y });
};

const endGame = () => {
  gameStarted.value = false;
  gameOver.value = true;
  clearInterval(timer);
};

const resetGame = () => {
  gameOver.value = false;
  startGame();
};
</script>

<style scoped>
button {
  transition: transform 0.1s ease;
}
button:active {
  transform: scale(0.95);
}
</style>
