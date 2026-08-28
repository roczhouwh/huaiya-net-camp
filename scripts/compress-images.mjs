// 一次性：40 张 AI PNG(2304×1728, 源自 images-raw/) → WebP(1152×864, q82) 写入 images/ 同名 .webp
// 用法：node scripts/compress-images.mjs
// 原 PNG 保留在 images-raw/ 作源头。线上 images.ts 优先引用同名 webp。
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC_DIR = path.join(ROOT, 'assets', 'images-raw')
const OUT_DIR = path.join(ROOT, 'assets', 'images')

async function main() {
  const files = (await readdir(SRC_DIR)).filter((f) => /^q\d+-\d+\.png$/.test(f)).sort()
  if (files.length === 0) throw new Error('未找到 png')
  const W = 1152, H = 864, QUALITY = 82

  const sizes = {}
  for (const file of files) {
    const webp = file.replace(/\.png$/, '.webp')
    const meta = await sharp(path.join(SRC_DIR, file))
      .resize(W, H) // 原图 2304×1728 恰为 4:3，整除无损
      .webp({ quality: QUALITY })
      .toFile(path.join(OUT_DIR, webp))
    sizes[webp] = meta.size
    console.log(`${file} -> ${webp} ${(meta.size / 1024).toFixed(0)} KB`)
  }
  const totalKB = Object.values(sizes).reduce((a, b) => a + b, 0) / 1024
  console.log(`\n共 ${files.length} 张，WebP 合计 ${totalKB.toFixed(0)} KB (${(totalKB / 1024).toFixed(1)} MB)`)
}

main().catch((e) => { console.error(e); process.exit(1) })