import { defineNuxtConfig } from 'nuxt'
import NuxtSingleFileExporter from '../src/module'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({

  modules: [
    NuxtSingleFileExporter
  ],

  singleFileExporter: {
    failOnError: true,
    publicDir: './playground/.output/public',
    outputDir: './playground/.output/inlined',
    inlineFiles: [
      { glob: '*.html' }
    ]
  },

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: () => 'everything.js'
        }
      }
    }
  }

})
