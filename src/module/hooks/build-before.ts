import { HookResponder } from '../types/hook'

export class BuildBeforeResponder implements HookResponder<[any, any]> {
  run (functions, args) {
    if (args[1].loaders.vue.productionMode || functions.getModuleOptions().forceEnable) {
      functions.setEnabled(true)
      console.info('Enabled single file export module')
    } else {
      console.info("Skipping inlining because of development mode. Set 'forceEnable' to true to force inlining.")
    }
  }
}
