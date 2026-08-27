import { mount, on } from '../dom'
import { isAllCleared, getNickname, setNickname } from '../storage'
import { drawCert, downloadCert } from '../cert'

export function renderCert(): void {
  if (!isAllCleared()) {
    mount(`
      <div class="cert fade-in">
        <div class="topbar">
          <a href="#/hall" class="icon-btn" title="回大厅">🗺️</a>
        </div>
        <div class="card cert-locked">
          <span class="lock-emoji">🔒</span>
          <div style="font-size:18px;font-weight:700;color:var(--ink);margin-bottom:6px">证书还未解锁</div>
          <div>通关全部 5 关（四大主题关 + 终极试炼），</div>
          <div>集齐全部勋章后，就能在这里领取你的专属电子证书啦！</div>
        </div>
        <div class="btn-col" style="margin-top:16px">
          <a href="#/hall" class="big-btn">🚀 去闯关</a>
        </div>
      </div>
    `)
    return
  }

  // 空串 / 未设置都回退默认昵称
  const nickname = getNickname() || '小槐芽'
  const root = mount(`
    <div class="cert fade-in">
      <div class="topbar">
        <a href="#/hall" class="icon-btn" title="回大厅">🗺️</a>
      </div>

      <h2 class="hall-title">领取通关证书</h2>
      <p class="cert-desc">恭喜集齐全部勋章！输入你的名字（可跳过），生成专属电子证书并下载保存。</p>

      <div class="card">
        <input class="nick-input" id="nick" maxlength="10" placeholder="写个名字（默认：小槐芽）" />
      </div>

      <div class="cert-preview">
        <canvas id="certCanvas"></canvas>
      </div>

      <div class="btn-col">
        <button class="big-btn success" data-download>💾 下载证书</button>
        <a href="#/medals" class="big-btn secondary">🎖️ 勋章中心</a>
      </div>
      <div class="text-note">证书仅保存在本地，可保存/打印分享给家人朋友～</div>
    </div>
  `)

  const canvas = root.querySelector<HTMLCanvasElement>('#certCanvas')
  const input = root.querySelector<HTMLInputElement>('#nick')
  // 昵称用 JS 属性赋值（不拼进 HTML），避免注入
  if (input) input.value = nickname
  let current = nickname

  const redraw = (): void => {
    if (canvas) drawCert(canvas, current)
  }

  redraw()

  input?.addEventListener('input', () => {
    const raw = input.value.trim()
    current = raw || '小槐芽'
    setNickname(raw) // 空则存空串，读取时经 || 回退默认
    redraw()
  })

  on<HTMLButtonElement>(root, '[data-download]', () => {
    downloadCert(current)
  })
}