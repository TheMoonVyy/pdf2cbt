<template>
  <div class="text-left leading-8">
    <p>
      You can generate and download the test in various formats based on your requirements.
    </p>
    <ul class="list-disc ml-6 [&>li]:mt-3">
      <li>
        <strong>Multiple Downloads:</strong><br>
        After downloading once, you can always change the options above to generate &amp; download again with those options.
      </li>
      <li>
        <h3 class="text-lg font-semibold mt-3 mb-2">
          Important NOTE
        </h3>
        <p class="text-wrap text-gray-500 dark:text-gray-300">
          If you want to later on use the zip file via <strong>"zip from url"</strong> feature
          and you are keeping the <strong>zip files</strong> in a <strong>github public repository</strong>
          then the <strong>zip file size should not exceed 20MB</strong> for "zip from url" to work.<br>
          (This is a limitation imposed by jsDelivr,
          which is the provider from where the zip file will be loaded after the website internally
          converts github url to jsDelivr url).
        </p>
      </li>
    </ul>
  </div>
</template>
