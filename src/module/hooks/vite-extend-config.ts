import type { InlineConfig as ViteInlineConfig } from 'vite'
import { HookResponder } from '../types/hook'

export class ViteExtendConfigResponder implements HookResponder<[ViteInlineConfig, {isClient: boolean, isServer: boolean}]> {
  run (functions, args): void {
    if (!args[1].isServer || !functions.isEnabled()) { return }
    const options = functions.getModuleOptions()
    if (options.skipViteConfiguration) { return }
    args[0].build.cssCodeSplit = false
    args[0].build.rollupOptions.output.manualChunks = () => 'everything.js'
    args[0].build.rollupOptions.output.inlineDynamicImports = false
    if (options.assetsInlineLimit !== null) {
      args[0].build.assetsInlineLimit = 1024 * options.assetsInlineLimit
    }
    console.info('Updated vite config for single file export')
  }
}
