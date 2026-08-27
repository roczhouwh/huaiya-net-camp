import { mount } from '../dom'
import { LEVELS } from '../data/levels'
import { isLevelCleared, totalScore } from '../storage'

export function renderMedals(): void {
  mount(`
    <div class="medals fade-in">
      <div class="topbar">
        <a href="#/" class="icon-btn" title="返回首页">🏠</a>
        <a href="#/hall" class="icon-btn" title="闯关大厅">🗺️</a>
      </div>

      <h2 class="hall-title">勋章中心</h2>
      <div class="score-total">总积分：<b>${totalScore()}</b> 分</div>

      <div class="medal-grid">
        ${LEVELS.map((lv) => {
          const cleared = isLevelCleared(lv.id)
          return `
            <div class="medal-cell ${cleared ? '' : 'locked'}">
              <span class="medal-icon">${cleared ? lv.medalEmoji : '🔒'}</span>
              <div class="medal-name">${cleared ? `${lv.medal}` : '???'}</div>
              <div class="medal-desc">${cleared ? lv.name : '尚未获得'}</div>
            </div>
          `
        }).join('')}
      </div>

      <div class="text-note">每通关一关，就能获得一枚专属勋章，全部集齐解锁电子证书！</div>
    </div>
  `)
}