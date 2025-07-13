import tailwindVitePlugin from '@tailwindcss/vite'
import packageJson from './package.json'

export default defineNuxtConfig({
  extends: ['../shared'],
  $meta: {
    name: 'web',
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
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-03-17',
  vite: {
    define: {
      'import.meta.env.PROJECT_VERSION': `"${packageJson.version}"`,
    },
    plugins: [tailwindVitePlugin()],
  },
  icon: {
    clientBundle: {
      scan: {
        globInclude: ['../shared/**/*.vue', '../web/**/*.vue'],
        globExclude: ['../*/node_modules/**', '../*/dist*/**'],
      },
    },
  },
})
