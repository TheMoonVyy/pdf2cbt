import tailwindVitePlugin from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@nuxt/eslint',
    '@nuxt/fonts',
    'nuxt-echarts',
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
  runtimeConfig: {
    public: {
      isBackupWebsite: process.env.IS_NETLIFY_BUILD === 'true',
    },
  },
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
      cssMinify: 'lightningcss',
    },
  },
  echarts: {
    charts: ['LineChart', 'PieChart'],
    components: ['LegendComponent', 'TitleComponent', 'GridComponent', 'TooltipComponent', 'GraphicComponent'],
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
})
