import { mount } from '../dom'
import { LEVELS, THEME_LEVEL_QUESTION_COUNT, FINAL_LEVEL_DRAW_COUNT } from '../data/levels'
import { clearedMedalCount, getBestScore, isLevelCleared, totalScore } from '../storage'

export function renderMedals(): void {
  const all = LEVELS.length
  const got = clearedMedalCount()
  const pct = all ? Math.round((got / all) * 100) : 0

  const grid = LEVELS.map((lv) => {
    const cleared = isLevelCleared(lv.id)
    const best = getBestScore(lv.id)
    const total = lv.id === 5 ? FINAL_LEVEL_DRAW_COUNT : THEME_LEVEL_QUESTION_COUNT
    return `
      <div class="medal-cell ${cleared ? '' : 'locked'}">
        <span class="medal-icon">${cleared ? lv.medalEmoji : '🔒'}</span>
        <div class="medal-name">${cleared ? `${lv.medal}` : '???'}</div>
        <div class="medal-desc">${cleared ? lv.name : '尚未获得'}</div>
        <div class="medal-best">${cleared ? `最佳答对 ${best}/${total} 题` : '——'}</div>
      </div>
    `
  }).join('')

  mount(`
    <div class="medals fade-in">
      <div class="topbar">
        <a href="#/" class="icon-btn" title="返回首页">🏠</a>
        <a href="#/hall" class="icon-btn" title="闯关大厅">🗺️</a>
      </div>

      <h2 class="hall-title">勋章中心</h2>
      <div class="score-total">总积分：<b>${totalScore()}</b> 分</div>

      <div class="medal-progress">
        <div class="progress-line">已集齐 <b>${got}</b> / ${all} 枚勋章</div>
        <div class="progress-track"><div class="progress-bar" style="width:${pct}%"></div></div>
      </div>

      <div class="medal-grid">
        ${grid}
      </div>

      <div class="text-note">每通关一关，就能获得一枚专属勋章，全部集齐解锁电子证书！</div>
    </div>
  `)
}