import tailwindVitePlugin from '@tailwindcss/vite'
import packageJson from './package.json'

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@nuxt/eslint',
    '@nuxt/fonts',
    'nuxt-echarts',
    'shadcn-nuxt',
    'nuxt-color-picker',
  ],
  devtools: { enabled: false },
  app: {
    head: {
      htmlAttrs: {
        'class': 'dark',
        'data-theme-variant': 'blue',
      },
    },
  },
  css: ['./app/assets/css/main.css'],
  runtimeConfig: {
    public: {
      isBackupWebsite: '',
      isBuildForWebsite: '',
      projectVersion: packageJson.version,
      mupdfVersion: packageJson.dependencies.mupdf,
    },
  },
  routeRules: {
    '/cbt': { redirect: { to: '/cbt/interface', statusCode: 301 } },
  },
  future: {
    compatibilityVersion: 4,
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
    config: {
      stylistic: true,
    },
  },
  icon: {
    customCollections: [
      {
        prefix: 'my-icon',
        dir: './app/assets/icons/IconBundle',
        normalizeIconName: false,
      },
    ],
    provider: 'none',
    clientBundle: {
      scan: true,
    },
  },
  shadcn: {
    componentDir: './app/components/ui',
  },
})
