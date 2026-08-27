import { mount, on } from '../dom'
import { clearedThemeCount, isFinalCleared, isSoundOn, setSoundOn, totalScore } from '../storage'
import { playClick } from '../audio'

function soundBadge(): string {
  return isSoundOn() ? '🔊' : '🔇'
}

export function renderHome(): void {
  const root = mount(`
    <div class="home-page fade-in">
      <div class="topbar">
        <button class="icon-btn" data-sound title="音效开关">${soundBadge()}</button>
        <a href="#/medals" class="icon-btn" title="勋章中心">🎖️</a>
      </div>

      <div class="home-hero">
        <div class="home-logo">🌱</div>
        <h1 class="home-title">槐芽网络训练营</h1>
        <p class="home-tagline">学会择优用网 · 理性用机 · 主动避害</p>
      </div>

      <div class="home-cards">
        <div class="home-chip"><span class="chip-emoji">${clearedThemeCount()}/4</span>主题关</div>
        <div class="home-chip"><span class="chip-emoji">${isFinalCleared() ? '🏆' : '🔒'}</span>终极关</div>
        <div class="home-chip"><span class="chip-emoji">${totalScore()}</span>总积分</div>
        <div class="home-chip"><span class="chip-emoji">🌟</span>勋章</div>
      </div>

      <button class="big-btn home-start" style="margin-top:18px">🚀 开始闯关</button>

      <div class="home-feat">📚 图文答题，边玩边学</div>
      <div class="home-feat">🎁 答对攒分，通关收勋章</div>
      <div class="home-feat">💾 进度自动保存，下次继续</div>
      <div class="text-note">不禁止用网 · 不抵制电子产品 —— 学会择优使用、理性把控</div>
    </div>
  `)

  on<HTMLButtonElement>(root, '.home-start', () => {
    playClick()
    window.location.hash = '#/hall'
  })
  on<HTMLButtonElement>(root, '[data-sound]', (btn) => {
    setSoundOn(!isSoundOn())
    playClick()
    btn.textContent = soundBadge()
  })
}