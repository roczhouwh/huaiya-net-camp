// 存档：localStorage 单 key 存取，带 version 字段便于未来迁移。

import { LEVELS } from './data/levels'

export interface SaveData {
  version: 1
  /** 已通关关卡 id */
  clearedLevels: number[]
  /** 各关最高答对数（重玩只抬高不膨胀） */
  bestScores: Record<number, number>
  /** 音效开关，默认 true */
  soundOn: boolean
  /** 证书昵称 */
  nickname?: string
}

const KEY = 'huaiya-save'
const DEFAULT: SaveData = {
  version: 1,
  clearedLevels: [],
  bestScores: {},
  soundOn: true,
}

let cache: SaveData | null = null

export function loadSave(): SaveData {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SaveData>
      cache = {
        ...DEFAULT,
        ...parsed,
        clearedLevels: Array.isArray(parsed.clearedLevels) ? parsed.clearedLevels : [],
        bestScores: parsed.bestScores ?? {},
      }
      return cache
    }
  } catch {
    // 解析失败或隐私模式，回退默认
  }
  cache = { ...DEFAULT, clearedLevels: [], bestScores: {} }
  return cache
}

function save(): void {
  if (!cache) return
  try {
    localStorage.setItem(KEY, JSON.stringify(cache))
  } catch {
    // 存储失败静默处理（隐私模式 / 配额满）
  }
}

export function isLevelCleared(levelId: number): boolean {
  return loadSave().clearedLevels.includes(levelId)
}

/**
 * 关卡是否解锁：
 * - 第1关始终解锁
 * - 主题关 N 需 N-1 通过
 * - 终极关(5) 需第4关通过
 */
export function isLevelUnlocked(levelId: number): boolean {
  if (levelId === 1) return true
  if (levelId <= 4) return isLevelCleared(levelId - 1)
  return isLevelCleared(4)
}

export function getBestScore(levelId: number): number {
  return loadSave().bestScores[levelId] ?? 0
}

/** 答对数超过已记录最高分才更新；通关则记录 clearedLevels */
export function recordLevelResult(levelId: number, answeredCorrect: number): void {
  const sv = loadSave()
  const prev = sv.bestScores[levelId] ?? 0
  if (answeredCorrect > prev) sv.bestScores[levelId] = answeredCorrect
  if (!sv.clearedLevels.includes(levelId)) sv.clearedLevels.push(levelId)
  save()
}

/** 总积分 = Σ 各关最高答对数，不单独存储 */
export function totalScore(): number {
  const sv = loadSave()
  return LEVELS.reduce((sum, l) => sum + (sv.bestScores[l.id] ?? 0), 0)
}

/** 当前对第 N 关解锁的下一个可玩关卡（用于结算页「下一关」跳转），无则返回 null */
export function nextLevel(levelId: number): number | null {
  return levelId < 5 ? levelId + 1 : null
}

export function setSoundOn(on: boolean): void {
  loadSave().soundOn = on
  save()
}

export function isSoundOn(): boolean {
  return loadSave().soundOn
}

export function setNickname(name: string): void {
  loadSave().nickname = name
  save()
}

export function getNickname(): string | undefined {
  return loadSave().nickname
}

/** 是否具备证书资格：四主题关 + 终极关全通 */
export function isAllCleared(): boolean {
  const sv = loadSave()
  return LEVELS.every((l) => sv.clearedLevels.includes(l.id))
}

export function isFinalCleared(): boolean {
  return isLevelCleared(5)
}

/** 已通主题关数量（1-4），用于进度展示 */
export function clearedThemeCount(): number {
  return [1, 2, 3, 4].filter((id) => isLevelCleared(id)).length
}

/** 清空存档、全部重新开始（含勋章/积分/昵称/音效开关） */
export function resetSave(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // 隐私模式可能抛错，忽略
  }
  cache = { ...DEFAULT, clearedLevels: [], bestScores: {} }
}