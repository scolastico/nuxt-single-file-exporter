import * as fs from 'fs'
import * as path from 'path'

export function getAllFilesRecursive (directory: string): string[] {
  let files = []
  const dir = fs.readdirSync(directory)
  dir.forEach(function (file) {
    const curPath = path.join(directory, file)
    if (fs.lstatSync(curPath).isDirectory()) {
      files = files.concat(getAllFilesRecursive(curPath))
    } else {
      files.push(curPath)
    }
  })
  return files
}
