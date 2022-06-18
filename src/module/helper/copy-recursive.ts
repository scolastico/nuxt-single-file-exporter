import * as fs from 'fs'
import * as path from 'path'

export function copyFolderRecursively (source: string, target: string) {
  const files = fs.readdirSync(source)
  files.forEach(function (file) {
    const curSource = path.join(source, file)
    const curTarget = path.join(target, file)
    if (fs.lstatSync(curSource).isDirectory()) {
      copyFolderRecursively(curSource, curTarget)
    } else {
      fs.mkdirSync(path.dirname(curTarget), { recursive: true })
      fs.copyFileSync(curSource, curTarget)
    }
  })
}
