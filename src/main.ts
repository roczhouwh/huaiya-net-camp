// 入口 + hash 路由。关键字在 # 之后解析，形如：
//   #/          首页
//   #/hall      闯关大厅
//   #/level/3   答题页
//   #/result/3  单关结算
//   #/medals    勋章中心
//   #/cert      通关证书

import './styles/main.css'
import { renderHome } from './views/home'
import { renderHall } from './views/hall'
import { renderLevel } from './views/level'
import { renderResult } from './views/result'
import { renderMedals } from './views/medals'
import { renderCert } from './views/cert'

type Route =
  | { name: 'home' }
  | { name: 'hall' }
  | { name: 'medals' }
  | { name: 'cert' }
  | { name: 'level' | 'result'; id: number }

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '') // 去掉 #/ 前缀
  const [seg, ...rest] = hash.split('/')
  switch (seg) {
    case 'hall':
      return { name: 'hall' }
    case 'medals':
      return { name: 'medals' }
    case 'cert':
      return { name: 'cert' }
    case 'level': {
      const id = Number(rest[0])
      return Number.isInteger(id) && id >= 1 && id <= 5 ? { name: 'level', id } : { name: 'home' }
    }
    case 'result': {
      const id = Number(rest[0])
      return Number.isInteger(id) && id >= 1 && id <= 5 ? { name: 'result', id } : { name: 'home' }
    }
    default:
      return { name: 'home' }
  }
}

function route(): void {
  const r = parseHash()
  // 滚动回顶部
  window.scrollTo(0, 0)
  switch (r.name) {
    case 'home':
      renderHome()
      break
    case 'hall':
      renderHall()
      break
    case 'medals':
      renderMedals()
      break
    case 'cert':
      renderCert()
      break
    case 'level':
      renderLevel(r.id)
      break
    case 'result':
      renderResult(r.id)
      break
  }
}

window.addEventListener('hashchange', route)
route()