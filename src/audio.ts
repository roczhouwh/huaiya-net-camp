// WebAudio 代码合成音效：无音频资源文件。
// 受浏览器自动播放限制：AudioContext 在首次用户点击后 resume。

import { isSoundOn } from './storage'

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
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