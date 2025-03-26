import tailwindVitePlugin from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: [
    '@primevue/nuxt-module',
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@nuxt/eslint',
    '@nuxt/fonts',
  ],
  devtools: { enabled: false },
  app: {
    head: {
      htmlAttrs: {
        class: 'dark',
      },
    },
  },
  css: ['./src/assets/css/main.css'],
  routeRules: {
    '/cbt': { redirect: { to: '/cbt/interface', statusCode: 301 } },
  },
  compatibilityDate: '2025-03-17',
  vite: {
    plugins: [tailwindVitePlugin()],
    esbuild: {
      legalComments: 'none',
    },
    build: {
      terserOptions: {
        format: {
          comments: false,
        },
      },
    },
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
  icon: {
    customCollections: [
      {
        prefix: 'my-icon',
        dir: './src/assets/icons',
        normalizeIconName: false,
      },
    ],
  },
  primevue: {
    options: {
      theme: 'none',
      pt: {
        select: {
          option: 'justify-center',
        },
      },
    },
    components: {
      exclude: ['Chart', 'Editor', 'Form', 'FormField'],
    },
  },
})
