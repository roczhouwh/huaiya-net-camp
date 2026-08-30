// 真实音频文件播放：音效 + 背景乐。
// 素材放在 assets/audio/ 下（.mp3/.ogg/.webm，mp3 优先），命名见 assets/audio/README.md。
// 受浏览器自动播放限制：audio.play() 需在首次用户点击手势后，由 main.ts 首次 pointerdown 时调用 syncBgm() 解锁。

import { isSoundOn } from './storage'

// 收集 assets/audio/ 下所有音频，按文件名去扩展名做 key（mp3 → ogg → webm 依次优先）。
// 复用 images.ts 对 glob 结果的归一化：build 下直接给 URL 字符串；dev 下给模块对象(其 .default 才是 URL)。
const audioGlob = import.meta.glob('../assets/audio/*.{mp3,ogg,webm}', {
  eager: true,
  query: '?url',
}) as Record<string, unknown>

const byName = new Map<string, string>() // 名称(去扩展名) -> url
// 按格式优先级逐轮写入：mp3 先写，ogg/webm 仅在未命中更高优先级时才写
for (const ext of ['mp3', 'ogg', 'webm']) {
  for (const [key, val] of Object.entries(audioGlob)) {
    const file = key.split('/').pop()?.toLowerCase() ?? ''
    const dot = file.lastIndexOf('.')
    const name = file.slice(0, dot)
    if (file.slice(dot + 1) !== ext) continue
    if (byName.has(name)) continue // 已命中更高优先级
    const url = typeof val === 'string' ? val : ((val as { default?: string })?.default ?? '')
    if (url) byName.set(name, url)
  }
}

/** 找出某音效的 url，缺失则返回空串（素材缺失不报错、不打断交互） */
function getUrl(name: string): string {
  return byName.get(name) ?? ''
}

// ---- 短音效 ----
// 每次克隆播放，保证连点按钮时能重叠、都从头播（共用同一元素会因未播完而失败）。

function sfx(name: string): void {
  if (!isSoundOn()) return // 音效总开关关闭时静默
  const url = getUrl(name)
  if (!url) return
  void new Audio(url).play().catch(() => {
    /* 自动播放限制/加载失败静默 */
  })
}

/** 通用点击：与选项选中同款音（点击音复用选中音） */
export function playClick(): void {
  sfx('select')
}

/** 单选/判断作答：选中一个选项 */
export function playSelect(): void {
  sfx('select')
}

/** 答对 */
export function playCorrect(): void {
  sfx('correct')
}

/** 答错（现复用 click 音充当，未来有更合适的答错音替换 wrong.mp3 即可） */
export function playWrong(): void {
  sfx('wrong')
}

/** 单关通关 */
export function playVictory(): void {
  sfx('victory')
}

// ---- 背景音乐（BGM）：长循环 <audio>，联动音效总开关 ----

const bgm = new Audio()
bgm.loop = true
bgm.preload = 'auto'

/** 启动 BGM：仅音效开启且已找到素材时启动 */
export function startBgm(): void {
  if (isSoundOn() && bgm.paused) {
    const url = getUrl('bgm')
    if (!url) return
    if (bgm.src !== url) bgm.src = url
    void bgm.play().catch(() => {
      /* 自动播放限制/加载失败静默 */
    })
  }
}

/** 停止 BGM */
export function stopBgm(): void {
  if (!bgm.paused) bgm.pause()
}

/** 按音效总开关同步 BGM：开则启动、关则停 */
export function syncBgm(): void {
  if (isSoundOn()) startBgm()
  else stopBgm()
}