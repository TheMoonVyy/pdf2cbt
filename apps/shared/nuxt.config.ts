export default defineNuxtConfig({
  $meta: {
    name: 'shared',
  },
  modules: [
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@nuxt/eslint',
    '@nuxt/fonts',
    'nuxt-echarts',
    'shadcn-nuxt',
    'nuxt-color-picker',
  ],
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: {
        class: 'dark',
        'data-theme-variant': 'blue',
      },
    },
  },
  routeRules: {
    '/cbt': { redirect: { to: '/cbt/interface', statusCode: 301 } },
  },
  compatibilityDate: '2025-03-17',
  future: {
    compatibilityVersion: 4
  },
  runtimeConfig: {
    public: {
      isBackupWebsite: '',
      isBuildForWebsite: '',
      projectVersion: '',
      mupdfVersion: '',
    },
  },
  vite: {
    esbuild: {
      legalComments: 'none',
    },
    build: {
      terserOptions: {
        format: { comments: false }
      },
      cssMinify: 'lightningcss'
    }
  },
  echarts: {
    charts: ['LineChart', 'PieChart'],
    components: [
      'LegendComponent',
      'TitleComponent',
      'GridComponent',
      'TooltipComponent',
      'DataZoomSliderComponent',
      'DataZoomInsideComponent'
    ]
  },
  eslint: {
    config: { stylistic: true }
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
  }
})
