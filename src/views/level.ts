import { mount, on } from '../dom'
import { getLevel, buildLevelQuestions } from '../data/levels'
import { imageSrc } from '../images'
import { isLevelUnlocked, recordLevelResult } from '../storage'
import { playCorrect, playWrong, playSelect, playVictory } from '../audio'
import type { Question } from '../data/questions'

/** 一枚作答记录，供结算页展示逐题对错与解析 */
export interface AnswerRecord {
  q: Question
  correct: boolean
  picked: number[]
}

// 答对鼓励语池（正向、无批评）
const PRAISE = [
  '太棒了！',
  '答对啦！',
  '真厉害！',
  '你就是网络小高手！',
  '这块知识被你拿下了！',
  '漂亮，继续加油！',
]

/** 答案字母：A/B/C/D/E */
const LETTERS = ['A', 'B', 'C', 'D', 'E']

interface LevelState {
  levelId: number
  questions: Question[]
  idx: number
  score: number
  answered: boolean // 当前题是否已作答（锁定选项）
  multiPick: number[] // 多选题已选区
  results: AnswerRecord[] // 本轮每题作答记录
}

const S: LevelState = {
  levelId: 1,
  questions: [],
  idx: 0,
  score: 0,
  answered: false,
  multiPick: [],
  results: [],
}

/** 最近一次通关结果，供结算页展示 */
let lastResult:
  | { levelId: number; score: number; total: number; questions: Question[]; results: AnswerRecord[] }
  | null = null

export function getLastResult():
  | { levelId: number; score: number; total: number; questions: Question[]; results: AnswerRecord[] }
  | null {
  return lastResult
}

/** 配图 alt：从题干取一句简短主题描述（避免整段题干与下方 <p> 重复朗读） */
function imgAlt(q: Question): string {
  const t = q.text.replace(/[\s。！？,，]+$/, '')
  return (t.length > 18 ? t.slice(0, 18) + '…' : t) + '的配图'
}

function exactMatch(pick: number[], answer: number[]): boolean {
  if (pick.length !== answer.length) return false
  const a = [...answer].sort((x, y) => x - y)
  const p = [...pick].sort((x, y) => x - y)
  return a.every((v, i) => v === p[i])
}

export function renderLevel(levelId: number): void {
  if (!isLevelUnlocked(levelId)) {
    window.location.hash = '#/hall'
    return
  }
  const lv = getLevel(levelId)
  S.levelId = levelId
  S.questions = buildLevelQuestions(levelId)
  S.idx = 0
  S.score = 0
  S.answered = false
  S.multiPick = []
  S.results = []
  drawQuestion(lv)
}

function drawQuestion(lv: ReturnType<typeof getLevel>): void {
  const q = S.questions[S.idx]
  const total = S.questions.length
  const root = mount(`
    <div class="level-page fade-in">
      <div class="level-top">
        <a href="#/hall" class="icon-btn" title="回大厅">←</a>
        <div class="lv-name">${lv.name} · 第 ${S.idx + 1} 题</div>
        <span class="progress-pill">${S.idx + 1}/${total}</span>
      </div>

      <div class="scene" data-scene>
        <img alt="${imgAlt(q)}" src="${imageSrc(q.id)}" />
      </div>

      <p class="question">${q.text}</p>
      ${q.type === 'multi' ? '<p class="hint">💡 多选：点选全部正确答案，然后点「确认作答」</p>' : '<p class="hint">💡 点击下面选项作答</p>'}

      <div class="options" data-options>
        ${q.options.map((opt, i) => optBtn(i, opt)).join('')}
        ${q.type === 'multi' ? '<button class="big-btn action-btn" data-confirm>✅ 确认作答</button>' : ''}
      </div>

      <div class="feedback-host"></div>
    </div>
  `)

  if (q.type === 'judge' || q.type === 'single') {
    on<HTMLButtonElement>(root, '.option-btn', (btn) => {
      if (S.answered) return
      const i = Number(btn.dataset.idx)
      judge(q, [i])
    })
  } else {
    on<HTMLButtonElement>(root, '.option-btn', (btn) => {
      if (S.answered) return
      const i = Number(btn.dataset.idx)
      toggleMulti(i)
    })
    on<HTMLButtonElement>(root, '[data-confirm]', () => {
      if (S.answered || S.multiPick.length === 0) return
      judge(q, [...S.multiPick])
    })
  }
}

function optBtn(i: number, text: string): string {
  return `
    <button class="option-btn" data-idx="${i}">
      <span class="opt-key">${LETTERS[i] ?? i + 1}</span>
      <span>${text}</span>
    </button>
  `
}

function toggleMulti(i: number): void {
  const at = S.multiPick.indexOf(i)
  if (at >= 0) S.multiPick.splice(at, 1)
  else S.multiPick.push(i)
  playSelect()
  syncOptions()
}

/** 多选题未提交时刷新选中态 */
function syncOptions(): void {
  const root = document.getElementById('app')
  root?.querySelectorAll<HTMLButtonElement>('.option-btn').forEach((btn) => {
    const i = Number(btn.dataset.idx)
    btn.classList.toggle('selected', S.multiPick.includes(i))
  })
}

function judge(q: Question, pick: number[]): void {
  S.answered = true
  const correct = exactMatch(pick, q.answer)
  S.results.push({ q, correct, picked: pick })
  if (correct) {
    S.score++
    playCorrect()
  } else {
    playWrong()
  }
  paintResult(q, pick, correct)
}

/** 答对时迸发的星星/彩带粒子（复用 main.css 已定义的 confetti-fall 动画） */
function burst(): void {
  const host = document.querySelector('.feedback-host')
  if (!host) return
  const COLORS = ['#f6a6b8', '#ffd977', '#8fd69f', '#8fd0f0', '#c9a8e0', '#f0a878']
  const n = 8 + Math.floor(Math.random() * 7) // 8~14
  const pieces = Array.from({ length: n }, () => {
    const left = Math.random() * 100
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    const delay = Math.random() * 0.25
    const size = 7 + Math.random() * 7
    const round = Math.random() > 0.5 ? '50%' : '2px'
    return `<span class="confetti" style="left:${left}%;width:${size}px;height:${size}px;border-radius:${round};background:${color};animation-delay:${delay}s;--dx:${(Math.random() * 40 - 20).toFixed(0)}px"></span>`
  }).join('')
  host.insertAdjacentHTML('afterbegin', `<div class="particles">${pieces}</div>`)
}

function paintResult(q: Question, pick: number[], correct: boolean): void {
  const root = document.getElementById('app')
  if (!root) return

  // 锁定选项，标色
  root.querySelectorAll<HTMLButtonElement>('.option-btn').forEach((btn) => {
    const i = Number(btn.dataset.idx)
    btn.disabled = true
    btn.classList.remove('selected')
    if (q.answer.includes(i)) btn.classList.add('answer')
    else if (pick.includes(i) && !correct) btn.classList.add('wrong-pick')
  })
  // 禁用确认按钮
  root.querySelectorAll<HTMLButtonElement>('[data-confirm]').forEach((b) => (b.disabled = true))

  // 仅答错变暗场景，突出解析
  if (!correct) root.querySelector('.scene')?.classList.add('dimmed')

  const host = root.querySelector('.feedback-host')
  if (!host) return
  const title = correct ? (PRAISE[Math.floor(Math.random() * PRAISE.length)] + ' 🎉') : '再想想哦 💭'
  host.innerHTML = `
    <div class="feedback ${correct ? 'correct' : 'wrong'} fade-in">
      <div class="fb-title">${title}</div>
      ${
        correct
          ? `<div class="fb-text">回答正确，记 <b>+1</b> 分！</div><div class="fb-explain">📖 ${q.explain}</div>`
          : `<div class="fb-text">${q.explain}</div>`
      }
      <button class="big-btn ${correct ? 'success' : 'secondary'} action-btn" data-next>
        ${correct ? '➡️ 下一题' : '我记住了 ☀️'}
      </button>
    </div>
  `
  if (correct) burst() // 面板就位后再在顶部迸发星星粒子
  attachNext()
}

function attachNext(): void {
  const root = document.getElementById('app')
  if (!root) return
  const btn = root.querySelector<HTMLButtonElement>('[data-next]')
  if (!btn) return
  btn.addEventListener('click', () => {
    const isLast = S.idx >= S.questions.length - 1
    if (isLast) {
      finishLevel()
      return
    }
    S.idx++
    S.answered = false
    S.multiPick = []
    drawQuestion(getLevel(S.levelId))
  })
}

function finishLevel(): void {
  playVictory()
  recordLevelResult(S.levelId, S.score)
  lastResult = {
    levelId: S.levelId,
    score: S.score,
    total: S.questions.length,
    questions: S.questions,
    results: S.results,
  }
  window.location.hash = `#/result/${S.levelId}`
}