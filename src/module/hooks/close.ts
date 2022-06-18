import * as fs from 'fs'
import * as path from 'path'
import { WriteFileOptions } from 'fs'
import { inlineScriptTags, inlineRequires } from 'inline-scripts'
import inlineHtmlStyles from 'inline-scripts/src/inlineStylesheets'
import InlineImport from 'inline-import'
import { FileConfiguration, ModuleOptions } from '../types/config'
import { copyFolderRecursively } from '../helper/copy-recursive'
import { getAllFilesRecursive } from '../helper/ls-recursive'
import { HookResponder } from '../types/hook'

const writeOptions: WriteFileOptions = {
  encoding: 'utf8',
  flag: 'w'
}

async function inline (file: string, options: FileConfiguration, moduleOptions: ModuleOptions) {
  try {
    const targetDir = moduleOptions.outputDir + '/tmp/' + file + '/'
    const targetFile = targetDir + '/' + file

    fs.mkdirSync(targetDir, { recursive: true })
    copyFolderRecursively(moduleOptions.publicDir, targetDir)

    console.info(`Preparing inlining of '${file}'...`)
    const content = fs.readFileSync(targetFile, 'utf8')
    const newContent = content.replace(/\/_nuxt\//g, './_nuxt/')
    fs.writeFileSync(targetFile, newContent, writeOptions)

    const files = getAllFilesRecursive(targetDir + '_nuxt/')
    const jsFiles = files.filter(file => file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.min.js'))

    if (options.inline.imports) {
      let changed
      do {
        changed = false
        for (const file of jsFiles) {
          console.info(`Inlining imports of '${path.basename(file)}'...`)
          const response = await InlineImport.transform(file, {
            src: [
              targetDir + '/**/*.js',
              targetDir + '/**/*.mjs',
              targetDir + '/**/*.min.js',
              targetDir + '/**/*.css',
              targetDir + '/**/*.min.css'
            ],
            encoding: 'utf8',
            useVar: true,
            extensions: {
              '.js': 'utf8',
              '.mjs': 'utf8',
              '.min.js': 'utf8',
              '.css': 'utf8',
              '.min.css': 'utf8'
            }
          })
          console.log(response)
          if (response) { changed = true }
        }
      } while (changed)
    }

    if (options.inline.require) {
      for (const file of jsFiles) {
        console.info(`Inlining require() of '${path.basename(file)}'...`)
        const inlinedRequire = await inlineRequires(file)
        fs.writeFileSync(file, inlinedRequire, writeOptions)
      }
    }

    if (options.inline.js) {
      console.info(`Inlining js of '${file}'...`)
      const inlinedScripts = await inlineScriptTags(targetFile)
      fs.writeFileSync(targetFile, inlinedScripts, writeOptions)
    }

    if (options.inline.css) {
      console.info(`Inlining css of '${file}'...`)
      const inlinedCss = await inlineHtmlStyles(targetFile)
      fs.writeFileSync(targetFile, inlinedCss, writeOptions)
    }

    if (options.inline.imports) {
      console.info(`Inlining imports of '${file}'...`)
      const inlinedImports = await InlineImport.transform(targetFile, {
        src: [
          targetDir + '/**/*.js',
          targetDir + '/**/*.mjs',
          targetDir + '/**/*.min.js',
          targetDir + '/**/*.css',
          targetDir + '/**/*.min.css'
        ],
        encoding: 'utf8',
        useVar: true,
        extensions: {
          '.js': 'utf8',
          '.mjs': 'utf8',
          '.min.js': 'utf8',
          '.css': 'utf8',
          '.min.css': 'utf8'
        }
      })
      console.info(inlinedImports)
    }

    fs.copyFileSync(targetFile, moduleOptions.outputDir + '/' + file)

    console.info(`Inlined '${file}'`)
  } catch (err) {
    console.warn(`Error inlining '${file}':`, err)
    if (moduleOptions.failOnError) { throw new Error(`Error inlining '${file}'`) }
  }
}

export class CloseResponder implements HookResponder<undefined> {
  async run (functions, args) {
    let inlinedSomething = false
    const options = functions.getModuleOptions()
    if (!functions.isEnabled()) {
      return
    }
    if (!fs.existsSync(options.publicDir)) {
      console.warn('No output folder found. Skipping inlining.')
      console.log(JSON.stringify(options))
      if (options.failOnError) {
        throw new Error('No output folder found')
      }
      return
    }
    if (fs.existsSync(options.outputDir)) {
      fs.rmSync(options.outputDir, { recursive: true })
    }
    for (const fileOptions of options.inlineFiles) {
      if (fileOptions.path) {
        if (fs.existsSync(options.publicDir + '/' + fileOptions.path)) {
          inlinedSomething = true
          await inline(fileOptions.path, fileOptions, options)
        } else {
          console.warn(`File '${fileOptions.path}' not found. Skipping inlining.`)
          if (options.failOnError) {
            throw new Error(`File '${fileOptions.path}' not found`)
          }
        }
      } else {
        const files = getAllFilesRecursive(options.publicDir)
        const filesWithoutPublicDir = files.map(
          file => file.substring(options.publicDir.length - 1)
        )
        const micromatch = require('micromatch')
        for (const file of micromatch(filesWithoutPublicDir, fileOptions.glob)) {
          inlinedSomething = true
          await inline(file, fileOptions, options)
        }
      }
    }
    if (!inlinedSomething) {
      console.warn('Seems like no files were inlined. Skipping inlining.')
      if (options.failOnError) {
        throw new Error('No files were found to inline.')
      }
    }
    if (fs.existsSync(options.outputDir + '/tmp/')) {
      fs.rmSync(options.outputDir + '/tmp/', { recursive: true })
    }
    if (inlinedSomething) {
      console.info(`Done inlining! Your inlined files are in '${options.outputDir}'.`)
    }
  }
}
