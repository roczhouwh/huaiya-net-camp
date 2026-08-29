import { mount, on } from '../dom'
import { clearedMedalCount, clearedThemeCount, isFinalCleared, isSoundOn, resetSave, setSoundOn, totalScore } from '../storage'
import { playClick, syncBgm } from '../audio'

function soundBadge(): string {
  return isSoundOn() ? '🔊' : '🔇'
}

export function renderHome(): void {
  const root = mount(`
    <div class="home-page fade-in">
      <div class="topbar">
        <button class="icon-btn" data-sound title="音效开关">${soundBadge()}</button>
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
        <button class="home-chip clickable" data-medal title="勋章中心">
          <span class="chip-emoji">🎖️</span><span>勋章 ${clearedMedalCount()}/5</span>
        </button>
      </div>

      <button class="big-btn home-start" style="margin-top:18px">🚀 开始闯关</button>

      <div class="home-feat">📚 图文答题，边玩边学</div>
      <div class="home-feat">🎁 答对攒分，通关收勋章</div>
      <div class="home-feat">💾 进度自动保存，下次继续</div>
      <div class="text-note">不禁止用网 · 不抵制电子产品 —— 学会择优使用、理性把控</div>
      <button class="reset-link" data-reset>🔁 清空进度，重新开始</button>
    </div>

    <div class="modal-overlay" data-modal hidden>
      <div class="modal">
        <div class="modal-icon">🧹</div>
        <div class="modal-title">确定要重新开始吗？</div>
        <p class="modal-text">当前已获得的勋章、积分都会清零，关卡进度会重置回第 1 关。</p>
        <div class="modal-actions">
          <button class="big-btn secondary" data-modal-cancel>再想想</button>
          <button class="big-btn" data-modal-ok>清空并重新开始</button>
        </div>
      </div>
    </div>
  `)

  on<HTMLButtonElement>(root, '.home-start', () => {
    playClick()
    window.location.hash = '#/hall'
  })
  on<HTMLButtonElement>(root, '[data-medal]', () => {
    playClick()
    window.location.hash = '#/medals'
  })
  on<HTMLButtonElement>(root, '[data-sound]', (btn) => {
    setSoundOn(!isSoundOn())
    playClick()
    syncBgm() // 总开关同步背景乐：静音即停、开启即恢复
    btn.textContent = soundBadge()
  })

  // 清空进度（带确认弹窗）
  const modal = root.querySelector<HTMLElement>('[data-modal]')
  const showModal = (show: boolean): void => {
    if (modal) modal.hidden = !show
  }
  on<HTMLButtonElement>(root, '[data-reset]', () => {
    playClick()
    showModal(true)
  })
  on<HTMLButtonElement>(root, '[data-modal-cancel]', () => {
    playClick()
    showModal(false)
  })
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) showModal(false) // 点遮罩空白处取消
  })
  on<HTMLButtonElement>(root, '[data-modal-ok]', () => {
    resetSave()
    playClick()
    renderHome()
  })
}