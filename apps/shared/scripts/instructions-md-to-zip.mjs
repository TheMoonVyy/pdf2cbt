import { zipSync } from 'fflate'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sourceDir = path.resolve(__dirname, '../md')
const outputZipName = 'instructions-md.zip'
const outputZipPath = path.join(sourceDir, outputZipName)

function readDirRecursive(dir, baseDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = {}

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.relative(baseDir, fullPath)

    // Skip the generated zip file
    if (relativePath === outputZipName) {
      continue
    }

    if (entry.isDirectory()) {
      Object.assign(files, readDirRecursive(fullPath, baseDir))
    } else if (entry.isFile()) {
      const content = fs.readFileSync(fullPath)
      files[relativePath] = new Uint8Array(content)
    }
  }

  return files
}

const files = readDirRecursive(sourceDir, sourceDir)

const zipped = zipSync(files, {
  level: 9
})

fs.writeFileSync(outputZipPath, zipped)

console.log('Zip created at:', outputZipPath)
