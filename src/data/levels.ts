// 关卡定义：4 主题关 + 1 终极关（综合试炼）。

import { QUESTIONS, getQuestion, shuffle, type Question } from './questions'

export interface Level {
  id: number // 1-4 主题关，5 终极关
  name: string
  subtitle: string
  emoji: string
  medal: string // 勋章名
  medalEmoji: string
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: '网络宝藏甄别师',
    subtitle: '火眼金睛，找出网络宝藏！',
    emoji: '🗺️',
    medal: '甄别师',
    medalEmoji: '🔍',
  },
  {
    id: 2,
    name: '网络垃圾清除官',
    subtitle: '扫除视听垃圾，还我清净！',
    emoji: '🧹',
    medal: '清除官',
    medalEmoji: '🧼',
  },
  {
    id: 3,
    name: '合理用机小达人',
    subtitle: '把握节奏，用机更自律！',
    emoji: '⏰',
    medal: '小达人',
    medalEmoji: '⏳',
  },
  {
    id: 4,
    name: '网络安全小卫士',
    subtitle: '竖起盾牌，守护我自己！',
    emoji: '🛡️',
    medal: '安全卫士',
    medalEmoji: '🛡️',
  },
  {
    id: 5,
    name: '全网素养大试炼',
    subtitle: '终极考核，一站到底！',
    emoji: '🏆',
    medal: '全能小网民',
    medalEmoji: '🏆',
  },
]

export function getLevel(id: number): Level {
  const l = LEVELS.find((x) => x.id === id)
  if (!l) throw new Error(`不存在的关卡: ${id}`)
  return l
}

/** 主题关每题固定 10 题 */
export const THEME_LEVEL_QUESTION_COUNT = 10
/** 终极关从全部 40 题池随机抽 10 题 */
export const FINAL_LEVEL_DRAW_COUNT = 10

/**
 * 构建某关的答题队列。
 * - 主题关(1-4)：固定取本关 10 题
 * - 终极关(5)：从全部 40 题池洗牌随机抽 10 题，复用原题与配图
 */
export function buildLevelQuestions(levelId: number): Question[] {
  if (levelId >= 1 && levelId <= 4) {
    return QUESTIONS.filter((q) => q.levelId === levelId)
  }
  if (levelId === 5) {
    return shuffle(QUESTIONS).slice(0, FINAL_LEVEL_DRAW_COUNT)
  }
  throw new Error(`无法构建关卡 ${levelId} 的题目队列`)
}

export { getQuestion }