<script setup lang="ts">
const title = 'PDF2CBT'
const description = 'Turn PDF of questions into CBT (Computer Based Test).'
</script>

<template>
  <div class="w-full h-full flex justify-between relative p-[60px] bg-gray-900 text-white">
    <div
      class="flex absolute top-0 right-[-100%]"
      :style="{
        width: '200%',
        height: '200%',
        backgroundImage: 'radial-gradient(circle, rgba(0, 220, 130, 0.5) 0%,  rgba(5, 5, 5,0.3) 50%, rgba(5, 5, 5,0) 70%)',
      }"
    />
    <div class="h-full w-full justify-between relative">
      <div class="flex flex-row justify-between items-start">
        <div class="flex flex-col w-full max-w-[65%]">
          <h1
            class="m-0 font-bold mb-[30px] text-[75px]"
            style="display: block; text-overflow: ellipsis;"
            :style="{ lineClamp: description ? 2 : 3 }"
          >
            {{ title }}
          </h1>
          <p
            v-if="description"
            class="text-[40px] leading-12 text-gray-100"
            style="display: block; line-clamp: 3; text-overflow: ellipsis;"
          >
            {{ description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
