import { mount, on } from '../dom'
import { LEVELS } from '../data/levels'
import { getBestScore, isAllCleared, isLevelCleared, isLevelUnlocked, isSoundOn, setSoundOn, totalScore } from '../storage'
import { playClick, syncBgm } from '../audio'

function soundBadge(): string {
  return isSoundOn() ? '🔊' : '🔇'
}

export function renderHall(): void {
  const congrats = isAllCleared()
  const root = mount(`
    <div class="hall fade-in">
      <div class="topbar">
        <a href="#/" class="icon-btn" title="返回首页">🏠</a>
        <a href="#/medals" class="icon-btn" title="勋章中心">🎖️</a>
        <button class="icon-btn" data-sound title="音效开关">${soundBadge()}</button>
      </div>

      <h2 class="hall-title">闯关大厅</h2>
      <div class="hall-score">当前总积分：<b>${totalScore()}</b> 分</div>

      ${LEVELS.map((lv) => {
        const unlocked = isLevelUnlocked(lv.id)
        const cleared = isLevelCleared(lv.id)
        const score = getBestScore(lv.id)
        return `
          <div class="level-card lv${lv.id} ${unlocked ? 'unlocked' : 'locked'} ${cleared ? 'cleared' : ''}"
            data-lv="${lv.id}"
            ${unlocked ? `tabindex="0" role="button" aria-label="进入关卡 ${lv.name}"` : 'aria-disabled="true" title="先通关上一关解锁"'}>
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

  on<HTMLButtonElement>(root, '[data-sound]', (btn) => {
    setSoundOn(!isSoundOn())
    playClick()
    syncBgm() // 总开关同步背景乐：静音即停、开启即恢复
    btn.textContent = soundBadge()
  })

  on<HTMLDivElement>(root, '.level-card', (card) => {
    const lvId = Number(card.dataset.lv)
    if (!isLevelUnlocked(lvId)) return
    playClick()
    window.location.hash = `#/level/${lvId}`
  })

  // 键盘可达(a11y)：unlocked 卡片已加 tabindex，Enter/Space 触发进入关卡
  root.querySelectorAll<HTMLDivElement>('.level-card[tabindex]').forEach((card) => {
    card.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return
      e.preventDefault()
      const lvId = Number(card.dataset.lv)
      if (!isLevelUnlocked(lvId)) return
      playClick()
      window.location.hash = `#/level/${lvId}`
    })
  })
}