import { mount } from '../dom'
import { getLevel, THEME_LEVEL_QUESTION_COUNT, FINAL_LEVEL_DRAW_COUNT } from '../data/levels'
import { isAllCleared, getBestScore, nextLevel, totalScore } from '../storage'
import { getLastResult } from './level'
import type { AnswerRecord } from './level'

export function renderResult(levelId: number): void {
  const lv = getLevel(levelId)
  const last = getLastResult()

  // 仅当「刚通关本关」且留有逐题记录时才展示本轮明细；否则直接访问 #/result/N 时不生成随机题，
  // 只按历史最高分展示「关内最佳成绩」（避免终极关随机题与历史成绩错位）。
  const hasDetail = !!last && last.levelId === levelId && last.results.length > 0

  const score = hasDetail ? last!.score : getBestScore(levelId)
  const total = hasDetail ? last!.total : (levelId === 5 ? FINAL_LEVEL_DRAW_COUNT : THEME_LEVEL_QUESTION_COUNT)
  const results: AnswerRecord[] | null = hasDetail ? last!.results : null

  const nxt = nextLevel(levelId)
  const finalDone = lv.id === 5
  const allDone = isAllCleared()
  const correctPct = total ? Math.round((score / total) * 100) : 0

  const scoreLine = results
    ? `本轮答对 <b>${score}</b> / ${total} 题 · 正确率 ${correctPct}%`
    : `关内最佳成绩 <b>${score}</b> / ${total} 题`

  // 逐题明细：每行 序号 + 对/错 + 题目，答错行直接附解析巩固
  const detailList = results
    ? results
        .map(
          (r, i) => `
          <div class="detail-item ${r.correct ? 'ok' : 'wrong'}">
            <span class="detail-mark">${r.correct ? '✅' : '❌'}</span>
            <div class="detail-main">
              <div class="detail-q">${i + 1}. ${r.q.text}</div>
              ${r.correct ? '' : `<div class="detail-explain">💡 ${r.q.explain}</div>`}
            </div>
          </div>`,
        )
        .join('')
    : `<div class="text-note">直接进入结算页，暂无本轮逐题记录；展示的是本关历史最佳成绩。</div>`

  mount(`
    <div class="result fade-in">
      <div class="card result-card">
        <div class="result-medal">${lv.medalEmoji}</div>
        <div class="result-title">${lv.medal}</div>
        <div class="result-sub" style="color:var(--ink-soft);font-size:14px">${lv.name} · 通关成功！</div>
        <div class="result-score">${scoreLine}</div>

        <div class="score-bubbles">
          <div class="sbubble correct-sb">✅ 答对 ${score} 题</div>
          <div class="sbubble wrong-sb">💭 巩固 ${total - score} 题</div>
          <div class="sbubble">⭐ 总积分 ${totalScore()}</div>
        </div>
      </div>

      <div class="card tips">
        <div class="tips-title">${results ? '📖 本轮答题 · 知识巩固' : '📖 关内最佳成绩'}</div>
        ${detailList}
      </div>

      <div class="btn-col">
        ${finalDone && allDone ? `<a href="#/cert" class="big-btn success">🎓 领取通关证书</a>` : ''}
        ${nxt ? `<a href="#/level/${nxt}" class="big-btn">🚀 挑战下一关</a>` : ''}
        <a href="#/level/${levelId}" class="big-btn ghost-btn">🔁 再玩一次</a>
        <a href="#/hall" class="big-btn secondary">🏠 返回大厅</a>
      </div>

      <div class="text-note">答错没烦恼，再看一遍明细就记住啦～</div>
    </div>
  `)
}