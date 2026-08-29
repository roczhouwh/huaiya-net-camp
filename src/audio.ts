// WebAudio 代码合成音效：无音频资源文件。
// 受浏览器自动播放限制：AudioContext 在首次用户点击后 resume。

import { isSoundOn } from './storage'

// ===== 静音过渡期 =====
// 现 WebAudio 合成音效与背景乐效果不理想（且音效开关效果不明显）。
// 后续将接入正式音频文件（音效 + BGM）。届时把本开关置 false / 重构为文件播放即可启用。
const AUDIO_DISABLED = true

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (AUDIO_DISABLED) return null // 静音过渡期：不再创建/输出任何合成音
  if (!isSoundOn()) return null
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.18): void {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  const t0 = c.currentTime + start
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(gain).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

/** 极短点击 tick */
export function playClick(): void {
  tone(880, 0, 0.06, 'triangle', 0.1)
}

/** 答对：两音上行，短促明亮（C5→E5） */
export function playCorrect(): void {
  tone(523.25, 0, 0.12, 'triangle', 0.2)
  tone(659.25, 0.1, 0.16, 'triangle', 0.2)
}

/** 答错：单音低柔（A3），无刺耳感 */
export function playWrong(): void {
  tone(220, 0, 0.28, 'sine', 0.14)
}

/** 通关：五音上行小旋律 */
export function playVictory(): void {
  const notes = [523.25, 587.33, 659.25, 783.99, 1046.5]
  notes.forEach((f, i) => tone(f, i * 0.12, 0.2, 'triangle', 0.18))
}

/** 单选/判断作答：先点一个音，鼓励后再上行 */
export function playSelect(): void {
  tone(659.25, 0, 0.08, 'triangle', 0.12)
}

// ---- 背景音乐（BGM）：极简柔和循环琶音，音量极低，联动音效总开关 ----

/** C 大调温柔旋律：上行琶音后回落，营造轻松氛围 */
const BGM_MELODY = [261.63, 329.63, 392, 440, 523.25, 440, 392, 329.63]
/** 每步间隔(ms)与单音时长(ms)，让音略有微叠保持连贯又不黏着 */
const BGM_STEP = 500
const BGM_NOTE_DUR = 550
const BGM_VOL = 0.04

let bgmTimer: ReturnType<typeof setInterval> | null = null
let bgmStep = 0

/** 启动 BGM：仅音效开启且尚未播放时启动；复用 tone() 的淡入淡出防爆音 */
export function startBgm(): void {
  if (bgmTimer != null || !isSoundOn()) return
  if (!getCtx()) return // 创建并 resume 失败（音效关/不支持）则静默
  bgmStep = 0
  bgmTimer = setInterval(() => {
    const f = BGM_MELODY[bgmStep % BGM_MELODY.length]
    tone(f, 0, BGM_NOTE_DUR, 'sine', BGM_VOL) // 主旋律
    tone(f / 2, 0, 900, 'sine', BGM_VOL - 0.01) // 低八度柔和垫底
    bgmStep++
  }, BGM_STEP)
}

/** 停止 BGM */
export function stopBgm(): void {
  if (bgmTimer != null) {
    clearInterval(bgmTimer)
    bgmTimer = null
  }
}

/** 按音效总开关同步 BGM：开则启动、关则停 */
export function syncBgm(): void {
  if (isSoundOn()) startBgm()
  else stopBgm()
}