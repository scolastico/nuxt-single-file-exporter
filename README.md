# nuxt-single-file-exporter
[![badge](https://img.shields.io/badge/license-MPL--2.0-orange)](https://github.com/scolastico/nuxt-single-file-exporter/blob/main/LICENSE)
[![badge](https://img.shields.io/github/languages/code-size/scolastico/nuxt-single-file-exporter)](https://github.com/scolastico/nuxt-single-file-exporter/graphs/contributors)
[![badge](https://img.shields.io/github/issues/scolastico/nuxt-single-file-exporter)](https://github.com/scolastico/nuxt-single-file-exporter/issues)
[![badge](https://img.shields.io/github/v/tag/scolastico/nuxt-single-file-exporter?label=version)](https://github.com/scolastico/nuxt-single-file-exporter/releases)
[![badge](https://github.com/scolastico/nuxt-single-file-exporter/actions/workflows/main.yml/badge.svg)](https://github.com/scolastico/nuxt-single-file-exporter/actions)

## About
Yes, it is actually not a good idea to export nuxt projects to a single file, but in
rare cases this is actually used. For example, javascript files cannot be loaded locally
by the most browsers due to cors. Also, it is more convenient for e.g. documentation to be able
to send it as a single file instead of a whole archive.

### Functions:
- All js, css are packed into a single html file.
- Images can theoretically also be packed in base64.
- Easy to implement in nuxt.

### Disadvantages:
- Generally it can lead to bugs.

### Limitations:
- As there seems to be (if im wrong created an issue) no hook from nuxt 3 currently which is
triggered when something is generated only for an export, this module uses the vue production
value. Since nuxt automatically activates this setting during build, this should not interfere.
You can also force the module to try to export a new html file at the end of each build process.
- Not tested but im sure there could be issues with complex and large apps.
- Because the module depends on vite as builder, it is not possible to use this module with webpack *aka* nuxt 2.
- The nuxt router can't resolve the path for the exported file. Because of this the nuxt router can't
be used, and you should instead a single `app.vue` file instead of the `pages` folder.

## Usage

### Install
1. Install the package `nuxt-single-file-exporter`
2. Add the module to your `nuxt.config.ts` file:
```ts
import { defineNuxtConfig } from 'nuxt'
import NuxtSingleFileExporter from 'nuxt-single-file-exporter'

export default defineNuxtConfig({
  modules: [
    NuxtSingleFileExporter
  ],

  // THIS IS ALSO REQUIRED!
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
```
3. If you now run `pnpm generate` you will find the generate file under `.output/inline/index.html`.

### Config Options

| Key                            | Type            | Default             | Description                                                                                                                              |
|--------------------------------|-----------------|---------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| `assetsInlineLimit`            | `number` `null` | `10000`             | The maximum size in kb of images to be inlined. Set to `null` to disable.                                                                |
| `forceEnable`                  | `boolean`       | `false`             | Force the module to be enabled even in development mode.                                                                                 |
| `skipViteConfiguration`        | `boolean`       | `false`             | Skip vite configurations. Not recommended because this can lead to chunk splitting which causes sometimes errors.                        |
| `failOnError`                  | `boolean`       | `false`             | Fail on error instead of displaying a warning.                                                                                           |
| `publicDir`                    | `string`        | `./.output/public`  | The output directory of nuxt.                                                                                                            |
| `outputDir`                    | `string`        | `./.output/inlined` | The directory where the generated files are stored.                                                                                      |
| `inlineFiles[].path`           | `string` `null` |                     | The path of the file to be inlined. Cant be set with `inlineFiles[].glob` at the same time.                                              |
| `inlineFiles[].glob`           | `string` `null` |                     | The glob pattern of the files to be inlined. The path of the file to be inlined. Cant be set with `inlineFiles[].path` at the same time. |
| `inlineFiles[].inline.imports` | `boolean`       | `false`             | The extensions of the files to be inlined. Experimental feature.                                                                         |
| `inlineFiles[].inline.require` | `boolean`       | `false`             | Whether to inline `require()` of the js files. Experimental feature.                                                                     |
| `inlineFiles[].inline.js`      | `boolean`       | `true`              | Whether to inline the js.                                                                                                                |
| `inlineFiles[].inline.css`     | `boolean`       | `true`              | Whether to inline the css.                                                                                                               |

### Example Config

A full nuxt config could look like this:
```ts
import { defineNuxtConfig } from 'nuxt'
import NuxtSingleFileExporter from 'nuxt-single-file-exporter'

export default defineNuxtConfig({
  
  modules: [
    NuxtSingleFileExporter
  ],

  singleFileExporter: {
    assetsInlineLimit: 10000,
    forceEnable: false,
    skipViteConfiguration: false,
    failOnError: false,
    publicDir: './.output/public',
    outputDir: './.output/inlined',
    inlineFiles: [
      {
        path: 'index.html',
        inline: {
          require: false,
        }
      },
      {
        glob: 'docs/**/*.html'
        // If inline (or its suboptions) is undefined the missing options
        // will be set to their default values.
      }
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
```

**Small notice if you specify a file multiple times, the last one will override the previous ones.**

If you want to inline all html files the short config could look like this:
```ts
import { defineNuxtConfig } from 'nuxt'
import NuxtSingleFileExporter from 'nuxt-single-file-exporter'

export default defineNuxtConfig({
  
  modules: [
    NuxtSingleFileExporter
  ],

  singleFileExporter: {
    inlineFiles: [{ glob: '**/*.html' }]
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
```

## Development
Any help is welcome. This project is unfortunately not one of my main projects, so I
probably won't do regular updates. However, I will gladly accept push requests. (And
yes I even reply to pr's not like about 50% of GitHub).

### Requirements
- [node.js 16.x](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.js.org/en/guides/installation/)

### Installation
- Run `pnpm i && cd playground && pnpm i --shamefully-hoist && cd..` to install all dependencies of the module.

### Usage
- Use `pnpm dev:generate` to export an inline html file of the [playground](./playground).

## License
This project is licensed under the **Apache License 2.0**.

### About
Apache-2.0

A permissive license whose main conditions require preservation of copyright and license notices.
Contributors provide an express grant of patent rights. Licensed works, modifications, and larger
works may be distributed under different terms and without source code.

### What you can do
| Permissions                                                                                                                       | Conditions                                                                                                                                                   | Limitations                                                                                                                                                                                                                      |
|-----------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <details><summary>🟢 Commercial use</summary>The licensed material and derivatives may be used for commercial purposes.</details> | <details><summary>🔵 License and copyright notice</summary>A copy of the license and copyright notice must be included with the licensed material.</details> | <details><summary>🔴 Liability</summary>This license includes a limitation of liability.</details>                                                                                                                               |
| <details><summary>🟢 Distribution</summary>The licensed material may be distributed.</details>                                    | <details><summary>🔵 State changes</summary>Changes made to the licensed material must be documented.</details>                                              | <details><summary>🔴 Trademark use</summary>This license explicitly states that it does NOT grant trademark rights, even though licenses without such a statement probably do not grant any implicit trademark rights.</details> |
| <details><summary>🟢 Modification</summary>The licensed material may be modified.</details>                                       |                                                                                                                                                              | <details><summary>🔴 Warranty</summary>This license explicitly states that it does NOT provide any warranty.</details>                                                                                                           |
| <details><summary>🟢 Patent use</summary>This license provides an express grant of patent rights from contributors.</details>     |                                                                                                                                                              |                                                                                                                                                                                                                                  |
| <details><summary>🟢 Private use</summary>The licensed material may be used and modified in private.</details>                    |                                                                                                                                                              |                                                                                                                                                                                                                                  |

*Information provided by https://choosealicense.com/licenses/apache-2.0/*

