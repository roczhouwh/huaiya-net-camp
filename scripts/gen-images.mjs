// 批量生图脚本：解析 docs/配图清单.md，调火山方舟 Seedream 生成 PNG 到 assets/images/
// 用法：
//   ARK_API_KEY=xxx node scripts/gen-images.mjs            # 全量生成（跳过已存在的 png）
//   ARK_API_KEY=xxx node scripts/gen-images.mjs --only=q1-1,q1-2
//   ARK_API_KEY=xxx node scripts/gen-images.mjs --force    # 已存在也重新生成
// Key 只从环境变量读取，不写入任何文件。

import { readFile, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LIST_MD = path.join(ROOT, 'docs', '配图清单.md')
// PNG 仅本地源头，输出到 images-raw/（不入库不进包）；上线图需再跑 compress-images.mjs 转 webp 到 images/
const OUT_DIR = path.join(ROOT, 'assets', 'images-raw')

const API_KEY = process.env.ARK_API_KEY
if (!API_KEY) {
  console.error('缺少环境变量 ARK_API_KEY')
  process.exit(1)
}

const MODEL = 'doubao-seedream-4-5-251128'
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/images/generations'
const SIZE = '2304x1728' // 4:3 横图；seedream-4-5 要求总像素 ≥ 3686400

// 配图清单「统一规范」的画风关键词，叠加到每条场景关键词前
const STYLE =
  '扁平化Q版卡通，小学生可爱画风，明亮柔和马卡龙配色，极简场景，无真实人脸，' +
  '无阴影复杂质感，干净纯色背景，儿童安全教育插画，高清简洁，适配网页UI，' +
  '无低俗、暴力、恐怖元素。画面内容：'

// ---- 解析配图清单 ----
async function parseList() {
  const md = await readFile(LIST_MD, 'utf8')
  const items = []
  for (const line of md.split('\n')) {
    const m = line.match(/^\|\s*`(q\d-\d+\.png)`\s*\|[^|]*\|[^|]*\|\s*([^|]+?)\s*\|\s*$/)
    if (m) items.push({ file: m[1], scene: m[2].trim() })
  }
  return items
}

// ---- 调方舟生图接口 ----
async function genOne(prompt) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      size: SIZE,
      response_format: 'url',
      watermark: false,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`)
  }
  const json = await res.json()
  const url = json?.data?.[0]?.url
  if (!url) throw new Error(`响应无图片 url: ${JSON.stringify(json).slice(0, 300)}`)
  const img = await fetch(url)
  if (!img.ok) throw new Error(`下载图片失败 HTTP ${img.status}`)
  return Buffer.from(await img.arrayBuffer())
}

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const args = process.argv.slice(2)
  const force = args.includes('--force')
  const onlyArg = args.find((a) => a.startsWith('--only='))
  const only = onlyArg ? onlyArg.slice('--only='.length).split(',') : null

  let items = await parseList()
  if (only) items = items.filter((it) => only.includes(it.file.replace('.png', '')))
  if (items.length === 0) {
    console.error('配图清单中未解析到任何条目')
    process.exit(1)
  }
  console.log(`共解析到 ${items.length} 条，开始生成（模型 ${MODEL}，尺寸 ${SIZE}）`)

  const failed = []
  for (const [i, it] of items.entries()) {
    const out = path.join(OUT_DIR, it.file)
    if (!force && (await exists(out))) {
      console.log(`[${i + 1}/${items.length}] ${it.file} 已存在，跳过`)
      continue
    }
    const prompt = STYLE + it.scene
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const buf = await genOne(prompt)
        await writeFile(out, buf)
        console.log(`[${i + 1}/${items.length}] ${it.file} ✅ (${(buf.length / 1024).toFixed(0)} KB)`)
        break
      } catch (e) {
        if (attempt === 2) {
          failed.push(it.file)
          console.error(`[${i + 1}/${items.length}] ${it.file} ❌ ${e.message}`)
        } else {
          console.warn(`[${i + 1}/${items.length}] ${it.file} 重试：${e.message}`)
          await sleep(3000)
        }
      }
    }
    await sleep(800) // 串行限速，避免触发限流
  }

  if (failed.length) {
    console.error(`\n失败 ${failed.length} 张：${failed.join(', ')}`)
    process.exit(2)
  }
  console.log('\n全部完成 🎉')
}

main()
