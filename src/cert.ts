// 通关证书：Canvas 2D 绘制，马卡龙卡通边框 + 勋章 + 称号 + 昵称 + 日期。

/** 内边距与外框留白 */
const PAD = 30
const W = 900
const H = 600

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function drawCert(canvas: HTMLCanvasElement, nickname: string): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = W * dpr
  canvas.height = H * dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)

  // 背景：马卡龙渐变
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#ffeef2')
  bg.addColorStop(0.5, '#fff4ec')
  bg.addColorStop(1, '#eaf9ee')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // 外框圆角卡片
  rr(ctx, PAD - 8, PAD - 8, W - PAD * 2 + 16, H - PAD * 2 + 16, 30)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  rr(ctx, PAD, PAD, W - PAD * 2, H - PAD * 2, 24)
  ctx.strokeStyle = '#f6a6b8'
  ctx.lineWidth = 4
  ctx.stroke()
  // 内层装饰虚线
  rr(ctx, PAD + 14, PAD + 14, W - PAD * 2 - 28, H - PAD * 2 - 28, 18)
  ctx.setLineDash([6, 6])
  ctx.strokeStyle = '#ffd977'
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.setLineDash([])

  // 顶部小标记
  ctx.fillStyle = '#8fd69f'
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('🌱', W / 2, PAD + 58)

  // 称号
  ctx.fillStyle = '#5b4a3f'
  ctx.font = '700 46px "PingFang SC","Microsoft YaHei",sans-serif'
  ctx.fillText('青少年健康上网小能手', W / 2, PAD + 116)

  // 副标题
  ctx.fillStyle = '#8a7664'
  ctx.font = '20px "PingFang SC","Microsoft YaHei",sans-serif'
  ctx.fillText('—— 槐芽网络训练营 · 全网素养结业表彰 ——', W / 2, PAD + 148)

  // 昵称行
  ctx.fillStyle = '#c96f56'
  ctx.font = '700 30px sans-serif'
  ctx.fillText(`「${nickname || '小槐芽'}」同学`, W / 2, PAD + 205)

  // 表彰正文
  ctx.fillStyle = '#5b4a3f'
  ctx.font = '20px sans-serif'
  ctx.fillText('你在槐芽网络训练营中认真闯关、积极学习，', W / 2, PAD + 245)
  ctx.fillText('掌握了择优用网、理性用机、主动避害的本领，', W / 2, PAD + 273)
  ctx.fillText('并集齐全部 5 枚勋章，特此表彰，以资鼓励！', W / 2, PAD + 301)

  // 勋章排列
  const medals = ['🔍', '🧼', '⏳', '🛡️', '🏆']
  const mw = 86
  const total = medals.length * mw
  let x = (W - total) / 2 + mw / 2
  const y = PAD + 360
  const colors = ['#ffd977', '#f6a6b8', '#8fd69f', '#8fd0f0', '#c9a8e0']
  medals.forEach((emoji, i) => {
    ctx.beginPath()
    ctx.arc(x, y, 34, 0, Math.PI * 2)
    ctx.fillStyle = colors[i]
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x, y, 40, 0, Math.PI * 2)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 4
    ctx.stroke()
    ctx.fillStyle = '#5b4a3f'
    ctx.font = '38px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(emoji, x, y + 2)
    ctx.textBaseline = 'alphabetic'
    x += mw
  })

  // 日期
  const today = new Date()
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
  ctx.fillStyle = '#8a7664'
  ctx.font = '18px sans-serif'
  ctx.fillText(`致  ${dateStr}`, W / 2, H - PAD - 34)

  // 落款
  ctx.fillStyle = '#c0ab94'
  ctx.font = '16px sans-serif'
  ctx.fillText('槐芽网络训练营', W / 2, H - PAD - 8)
}

/** 生成并触发下载 PNG */
export function downloadCert(nickname: string): void {
  const canvas = document.createElement('canvas')
  drawCert(canvas, nickname)
  const a = document.createElement('a')
  a.download = `槐芽网络训练营证书-${nickname || '小槐芽'}.png`
  a.href = canvas.toDataURL('image/png')
  a.click()
}