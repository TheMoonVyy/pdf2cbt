export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@nuxt/eslint',
    '@nuxt/fonts',
    'nuxt-echarts',
    'shadcn-nuxt',
    'nuxt-color-picker',
    'vue-sonner/nuxt',
  ],
  $meta: {
    name: 'shared',
  },
  devtools: { enabled: false },
  app: {
    head: {
      htmlAttrs: {
        'class': 'dark overflow-hidden',
        'data-theme-variant': 'blue',
        'lang': 'en',
      },
      title: 'PDF2CBT - Turn PDF of Questions into CBT (Computer Based Test)',
      meta: [
        {
          name: 'description',
          content: 'Turn PDF of Questions into CBT (Computer Based Test).',
        },
      ],
    },
  },
  css: ['vue-sonner/style.css'],
  runtimeConfig: {
    public: {
      isBackupWebsite: '',
      isBuildForWebsite: '',
      projectVersion: '',
    },
  },
  build: {
    transpile: ['reka-ui'],
  },
  routeRules: {
    '/cbt': { redirect: { to: '/cbt/interface', statusCode: 301 } },
  },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-03-17',
  vite: {
    esbuild: {
      legalComments: 'none',
    },
    build: {
      terserOptions: {
        format: { comments: false },
      },
      cssMinify: 'lightningcss',
    },
  },
  echarts: {
    charts: ['LineChart', 'PieChart'],
    components: [
      'LegendComponent',
      'TitleComponent',
      'GridComponent',
      'TooltipComponent',
      'DataZoomSliderComponent',
      'DataZoomInsideComponent',
    ],
  },
  eslint: {
    config: { stylistic: true },
  },
  icon: {
    customCollections: [
      {
        prefix: 'my-icon',
        dir: '../shared/app/assets/icons/IconBundle',
        normalizeIconName: false,
      },
    ],
    provider: 'none',
  },
  shadcn: {
    componentDir: '../shared/app/components/ui',
  },
})
