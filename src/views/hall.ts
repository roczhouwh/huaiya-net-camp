import { mount, on } from '../dom'
import { LEVELS } from '../data/levels'
import { getBestScore, isAllCleared, isLevelCleared, isLevelUnlocked, totalScore } from '../storage'
import { playClick } from '../audio'

export function renderHall(): void {
  const congrats = isAllCleared()
  const root = mount(`
    <div class="hall fade-in">
      <div class="topbar">
        <a href="#/" class="icon-btn" title="返回首页">🏠</a>
        <a href="#/medals" class="icon-btn" title="勋章中心">🎖️</a>
      </div>

      <h2 class="hall-title">闯关大厅</h2>
      <div class="hall-score">当前总积分：<b>${totalScore()}</b> 分</div>

      ${LEVELS.map((lv) => {
        const unlocked = isLevelUnlocked(lv.id)
        const cleared = isLevelCleared(lv.id)
        const score = getBestScore(lv.id)
        return `
          <div class="level-card lv${lv.id} ${unlocked ? 'unlocked' : 'locked'} ${cleared ? 'cleared' : ''}"
            data-lv="${lv.id}" ${unlocked ? '' : 'title="先通关上一关解锁"'}>
            <div class="level-emoji">${lv.emoji}</div>
            <div class="level-info">
              <div class="lv-name">${lv.id === 5 ? '🏆 ' : ''}${lv.name}</div>
              <div class="lv-sub">${lv.subtitle}</div>
            </div>
            <div class="level-meta">
              ${cleared ? `<div class="level-medal">${lv.medalEmoji}</div><div class="level-status">已通 · ${score}分</div>` : ''}
              ${!cleared && unlocked ? '<div class="level-status">未通关</div>' : ''}
              ${!unlocked ? '<div class="level-tag">🔒 未解锁</div>' : ''}
            </div>
          </div>
        `
      }).join('')}

      ${congrats ? '<div class="home-feat" style="justify-content:center">🎉 已集齐全部勋章，快去领取证书吧！<a href="#/cert" style="color:#c0883c;font-weight:700"> 领取证书 →</a></div>' : ''}

      <div class="text-note">顺序解锁：通关上一关，才能挑战下一关</div>
    </div>
  `)

  on<HTMLDivElement>(root, '.level-card', (card) => {
    const lvId = Number(card.dataset.lv)
    if (!isLevelUnlocked(lvId)) return
    playClick()
    window.location.hash = `#/level/${lvId}`
  })
}