<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: {
    type: Object as () => NuxtError,
    required: true,
  },
})

console.error(props.error)

useSeoMeta({
  title: () => `${props.error.statusCode} - ${props.error.statusMessage} | PDF2CBT`,
})
</script>

<template>
  <div>
    <NuxtLayout>
      <div
        class="not-found-container"
        role="main"
      >
        <div
          class="not-found-visual"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 200 100"
            width="200"
            height="100"
          >
            <text
              x="50%"
              y="50%"
              dy=".35em"
              text-anchor="middle"
              class="glitch"
            >
              {{ error.statusCode }}
            </text>
          </svg>
        </div>
        <h1 class="text-xl font-bold sm:text-2xl my-4 text-center">
          Oops!<br>
          {{ error.statusMessage }}
        </h1>
        <p v-if="error.statusCode === 404">
          The page you're looking for does not exist.
        </p>
        <p v-else>
          {{ error.message }}
        </p>
        <div class="flex justify-center">
          <NuxtLink
            to="/"
            @click.prevent="clearError({ redirect: '/' })"
          >
            <BaseButton label="Go to Homepage" />
          </NuxtLink>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<style scoped>
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5vh 2rem;
  min-height: 70vh;
  transition: background-color 0.25s;
}
.not-found-visual svg {
  max-width: 100%;
  height: auto;
}
.glitch {
  font-family: 'Fira Code', 'monospace';
  font-size: 5rem;
  fill: none;
  stroke: #ff6f61;
  stroke-width: 2;
  animation: glitch 1.5s infinite linear alternate;
}
@keyframes glitch {
  from { stroke: #00FFFF; }
  to { stroke: #32CD32; filter: blur(1px); }
}
p {
  margin-bottom: 2rem;
  text-align: center;
  max-width: 30rem;
}
</style>
