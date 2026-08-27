import { mount } from '../dom'
import { getLevel, buildLevelQuestions } from '../data/levels'
import { isAllCleared, getBestScore, nextLevel, totalScore } from '../storage'
import { getLastResult } from './level'

export function renderResult(levelId: number): void {
  const lv = getLevel(levelId)
  const last = getLastResult()

  let score: number
  let total: number
  let questions = last && last.levelId === levelId ? last.questions : null

  if (questions) {
    score = last!.score
    total = last!.total
  } else {
    score = getBestScore(levelId)
    questions = buildLevelQuestions(levelId)
    total = questions.length
  }

  const nxt = nextLevel(levelId)
  const finalDone = lv.id === 5
  const allDone = isAllCleared()
  const correctPct = total ? Math.round((score / total) * 100) : 0

  mount(`
    <div class="result fade-in">
      <div class="card result-card">
        <div class="result-medal">${lv.medalEmoji}</div>
        <div class="result-title">${lv.medal}</div>
        <div class="result-sub" style="color:var(--ink-soft);font-size:14px">${lv.name} · 通关成功！</div>
        <div class="result-score">本轮答对 <b>${score}</b> / ${total} 题 · 正确率 ${correctPct}%</div>

        <div class="score-bubbles">
          <div class="sbubble correct-sb">✅ 答对 ${score} 题</div>
          <div class="sbubble wrong-sb">💭 巩固 ${total - score} 题</div>
          <div class="sbubble">⭐ 总积分 ${totalScore()}</div>
        </div>
      </div>

      <div class="card tips">
        <div class="tips-title">📖 本关知识小结</div>
        ${questions.map((q) => `<div class="tip-item"><span class="tip-ok">🔵</span><span>${q.explain}</span></div>`).join('')}
      </div>

      <div class="btn-col">
        ${finalDone && allDone ? `<a href="#/cert" class="big-btn success">🎓 领取通关证书</a>` : ''}
        ${nxt ? `<a href="#/level/${nxt}" class="big-btn">🚀 挑战下一关</a>` : ''}
        <a href="#/level/${levelId}" class="big-btn ghost-btn">🔁 再玩一次</a>
        <a href="#/hall" class="big-btn secondary">🏠 返回大厅</a>
      </div>

      <div class="text-note">答错没烦恼，再看一遍小结就记住啦～</div>
    </div>
  `)
}