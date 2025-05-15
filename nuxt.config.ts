import { readFileSync } from 'fs'
import { join } from 'path'
import tailwindVitePlugin from '@tailwindcss/vite'

const projectVersion = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8')).version as string

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
      projectVersion,
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
        dir: './src/assets/icons',
        normalizeIconName: false,
      },
    ],
  },
})
