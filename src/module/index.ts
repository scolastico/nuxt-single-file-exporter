import { defineNuxtModule } from '@nuxt/kit'
import { ModuleOptions } from './types/config'
import { ViteExtendConfigResponder } from './hooks/vite-extend-config'
import { CloseResponder } from './hooks/close'
import { BuildBeforeResponder } from './hooks/build-before'

export default defineNuxtModule({
  meta: {
    name: 'nuxt-vite-single-file-export',
    key: 'singleFileExporter',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  defaults: {
    assetsInlineLimit: 10000,
    forceEnable: false,
    skipViteConfiguration: false,
    failOnError: false,
    publicDir: './.output/public',
    outputDir: './.output/inlined',
    inlineFiles: [{
      path: 'index.html'
    }]
  },
  setup (moduleOptions: ModuleOptions, nuxt: any) {
    if (nuxt.options.singleFileExporter) {
      moduleOptions = { ...moduleOptions, ...nuxt.options.singleFileExporter }
    }
    for (const inlineFile of moduleOptions.inlineFiles) {
      if (inlineFile.path === null && inlineFile.glob === null) {
        throw new Error('Either path or glob must be set')
      } else if (inlineFile.path && inlineFile.glob) {
        throw new Error('Only one of path or glob can be set')
      }
      if (inlineFile.inline === undefined) {
        inlineFile.inline = {}
      }
      if (inlineFile.inline.imports === undefined) {
        inlineFile.inline.imports = false
      }
      if (inlineFile.inline.require === undefined) {
        inlineFile.inline.require = false
      }
      if (inlineFile.inline.js === undefined) {
        inlineFile.inline.js = true
      }
      if (inlineFile.inline.css === undefined) {
        inlineFile.inline.css = true
      }
    }

    let enabled = false

    function getModuleOptions (): ModuleOptions {
      return moduleOptions
    }

    function isEnabled (): boolean {
      return enabled
    }

    function setEnabled (enable: boolean): void {
      enabled = enable
    }

    const internalDataFunctions = {
      getModuleOptions,
      isEnabled,
      setEnabled
    }

    nuxt.hook('vite:extendConfig', async (...args: any[]) => {
      await new ViteExtendConfigResponder().run(internalDataFunctions, args)
    })
    nuxt.hook('build:before', async (...args: any[]) => {
      await new BuildBeforeResponder().run(internalDataFunctions, args)
    })
    nuxt.hook('close', async (...args: any[]) => {
      await new CloseResponder().run(internalDataFunctions, args)
    })
  }
})
