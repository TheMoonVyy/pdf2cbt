import tailwindVitePlugin from '@tailwindcss/vite'
import packageJson from './package.json'

const filterVersion = (version: string) => {
  const match = version.match(/\d+(\.\d+){0,2}/)
  return match ? match[0] : 'latest'
}

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
      isBackupWebsite: import.meta.env.IS_NETLIFY_BUILD === 'true',
      projectVersion: packageJson.version,
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
    define: {
      'import.meta.env.MUPDF_PACKAGE_VERSION': JSON.stringify(
        filterVersion(packageJson?.dependencies?.mupdf || ''),
      ),
    },
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
