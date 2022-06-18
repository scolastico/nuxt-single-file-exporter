export type FileConfiguration = {
  path?: string | null,
  glob?: string | null,
  inline?: {
    imports?: boolean,
    require?: boolean,
    js?: boolean,
    css?: boolean,
  }
}

export type ModuleOptions = {
  assetsInlineLimit: number | null
  forceEnable: boolean
  skipViteConfiguration: boolean
  failOnError: boolean
  publicDir: string
  outputDir: string
  inlineFiles: FileConfiguration[]
}
