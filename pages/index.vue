<template>
  <div
    class="flex flex-col grow min-h-0 py-8 overflow-auto
      dark:bg-surface-900 dark:text-surface-0 border-t-2 border-surface-700"
  >
    <h1 class="text-2xl text-center text-green-500">
      Turn PDF of questions into CBT (Computer Based Test)
    </h1>
    <div class="flex flex-col w-full items-center gap-3 mt-10">
      <NuxtLink to="/pdf-cropper">
        <h2 class="text-xl underline text-green-500">
          PDF Cropper
        </h2>
      </NuxtLink>
      <div
        class="video-container pb-[calc(56.25%*0.8)] w-[80%]
      sm:pb-[calc(56.25%*0.7)] sm:w-[70%] md:pb-[calc(56.25%*0.6)] md:w-[60%]
      "
      >
        <iframe
          src="https://www.youtube.com/embed/JlzG9X_Z1NU?si=ZeyqeT6ORFR_hJz_"
          title="pdf2cbt cropper demo"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
          loading="lazy"
        />
      </div>
    </div>
    <div class="flex flex-col w-full items-center gap-3 mt-10">
      <NuxtLink to="/cbt/interface">
        <h2 class="text-xl underline text-green-500">
          CBT Interface
        </h2>
      </NuxtLink>
      <div
        class="video-container pb-[calc(56.25%*0.8)] w-[80%]
      sm:pb-[calc(56.25%*0.7)] sm:w-[70%] md:pb-[calc(56.25%*0.6)] md:w-[60%]
      "
      >
        <iframe
          src="https://www.youtube.com/embed/_pLhi6fh6bA?si=29sxbWAkFx-mg8R8"
          title="pdf2cbt cbt interface demo"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
          loading="lazy"
        />
      </div>
    </div>
    <div class="flex flex-col w-full items-center gap-3 mt-10">
      <NuxtLink to="/cbt/interface">
        <h2 class="text-xl underline text-green-500">
          Customize CBT Interface
        </h2>
      </NuxtLink>
      <div
        class="video-container pb-[calc(56.25%*0.8)] w-[80%]
      sm:pb-[calc(56.25%*0.7)] sm:w-[70%] md:pb-[calc(56.25%*0.6)] md:w-[60%]
      "
      >
        <iframe
          src="https://www.youtube.com/embed/k9is0TJBkgQ?si=SZOHzfqrSJ_Ds9RJ"
          title="pdf2cbt customize cbt interface demo"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
          loading="lazy"
        />
      </div>
    </div>
  </div>
</template>

<style>
.video-container {
    position: relative;
    overflow: hidden;
    max-width: 100%;
    margin: 0 auto;
}

.video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
}
</style>
