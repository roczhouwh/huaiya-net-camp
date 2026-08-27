// 题库：唯一数据源，内容 100% 来自 docs 需求文档第十一章。
// 扩题 / 改解析只改本文件。

export type QuestionType = 'judge' | 'single' | 'multi'

export interface Question {
  /** 形如 q1-1（第1关第1题）；同时作为配图前缀，不存扩展名 */
  id: string
  /** 所属主题关 1-4；终极关复用同题 */
  levelId: 1 | 2 | 3 | 4
  type: QuestionType
  text: string
  /** 判断题为 ['正确', '错误'] */
  options: string[]
  /** 正确答案索引数组（多选多个；判断/单项各一个） */
  answer: number[]
  /** 答错时的通俗解析话术 */
  explain: string
}

export const QUESTIONS: Question[] = [
  // ================= 关卡一：网络宝藏甄别师 =================
  {
    id: 'q1-1',
    levelId: 1,
    type: 'judge',
    text: '观看正规的科普短视频，可以帮助我们开阔眼界、学习新知识，是优质的网络内容。',
    options: ['正确', '错误'],
    answer: [0],
    explain: '科普视频、知识动画能够补充课本外的知识，是帮助我们学习的优质网络资源。',
  },
  {
    id: 'q1-2',
    levelId: 1,
    type: 'judge',
    text: '合理、限时游玩《我的世界》这类益智创作游戏，可以锻炼空间思维和动手能力。',
    options: ['正确', '错误'],
    answer: [0],
    explain: '益智创作类游戏重在搭建、思考和创造，适度游玩是健康的课余放松方式。',
  },
  {
    id: 'q1-3',
    levelId: 1,
    type: 'single',
    text: '正规的网络学习课程、学科辅导动画属于什么类型的网络内容？',
    options: ['优质学习内容', '不良娱乐内容'],
    answer: [0],
    explain: '辅助我们预习、复习、学习新知识的网络内容，都是值得观看的优质内容。',
  },
  {
    id: 'q1-4',
    levelId: 1,
    type: 'multi',
    text: '请点击选出所有优质、值得我们观看和体验的网络内容？',
    options: ['自然科普视频', '历史文化动画', '限时游玩益智创作游戏', '恶搞短视频', '吵闹无营养游戏解说'],
    answer: [0, 1, 2],
    explain: '科普、文化、益智创作内容能帮助我们成长，恶搞、吵闹解说没有学习价值，不建议观看。',
  },

  // ================= 关卡二：网络垃圾清除官 =================
  {
    id: 'q2-1',
    levelId: 2,
    type: 'judge',
    text: '只有吵闹噱头、没有知识和思考的游戏解说视频，属于无营养的网络内容。',
    options: ['正确', '错误'],
    answer: [0],
    explain: '这类视频只会制造噪音、吸引眼球，无法学到知识，还会分散注意力，不适合小学生观看。',
  },
  {
    id: 'q2-2',
    levelId: 2,
    type: 'judge',
    text: '无底线恶搞、跟风耍闹的短视频，不利于我们的身心健康。',
    options: ['正确', '错误'],
    answer: [0],
    explain: '低俗恶搞内容会误导行为习惯，影响心理健康，我们要主动远离。',
  },
  {
    id: 'q2-3',
    levelId: 2,
    type: 'single',
    text: '当我们刷视频时，弹出低俗、猎奇、吵闹的不良内容，正确的做法是？',
    options: ['继续观看', '立即关闭、切换优质内容', '分享给同学'],
    answer: [1],
    explain: '遇到不良、无营养的网络内容，要第一时间划走关闭，选择积极健康的内容观看。',
  },
  {
    id: 'q2-4',
    levelId: 2,
    type: 'judge',
    text: '长期沉迷无营养的短视频，会浪费学习时间、影响专注力。',
    options: ['正确', '错误'],
    answer: [0],
    explain: '碎片化娱乐内容容易让人分心，长期观看会降低学习专注力，浪费课余时间。',
  },

  // ================= 关卡三：合理用机小达人 =================
  {
    id: 'q3-1',
    levelId: 3,
    type: 'judge',
    text: '写作业、学习的时候，玩手机刷视频是正确的行为。',
    options: ['正确', '错误'],
    answer: [1],
    explain: '学习需要专注，电子产品会分散注意力，学习期间不可以使用娱乐类电子产品。',
  },
  {
    id: 'q3-2',
    levelId: 3,
    type: 'judge',
    text: '睡前长时间玩手机、看视频，会影响睡眠和视力健康。',
    options: ['正确', '错误'],
    answer: [0],
    explain: '睡前用眼过度、大脑过度兴奋，会导致失眠、视力下降，损害身体健康。',
  },
  {
    id: 'q3-3',
    levelId: 3,
    type: 'judge',
    text: '完成学习任务后，限时、适度使用电子产品放松，是正确的用机方式。',
    options: ['正确', '错误'],
    answer: [0],
    explain: '先完成学习任务，再合理安排娱乐和学习拓展，做到劳逸结合、自律用机。',
  },
  {
    id: 'q3-4',
    levelId: 3,
    type: 'single',
    text: '以下哪一种是小学生正确的电子产品使用方式？',
    options: ['上课偷偷玩手机', '完成作业后限时适度使用', '熬夜刷视频娱乐'],
    answer: [1],
    explain: '电子产品服务于学习、适度用于放松，禁止上课使用、熬夜沉迷。',
  },

  // ================= 关卡四：网络安全小卫士 =================
  {
    id: 'q4-1',
    levelId: 4,
    type: 'single',
    text: '上网时弹出陌生链接、未知弹窗，我们应该怎么做？',
    options: ['点击打开查看', '直接忽略并关闭', '转发给好友'],
    answer: [1],
    explain: '陌生链接可能存在风险，小学生不要随意点击，直接关闭即可。',
  },
  {
    id: 'q4-2',
    levelId: 4,
    type: 'judge',
    text: '我们可以把自己的姓名、学校、家庭住址告诉网络陌生人。',
    options: ['正确', '错误'],
    answer: [1],
    explain: '个人隐私信息不能随意透露给网友，遇到询问隐私的陌生人，要拒绝并告知家长。',
  },
  {
    id: 'q4-3',
    levelId: 4,
    type: 'judge',
    text: '小学生不可以私自进行网络充值、游戏买皮肤、视频打赏等操作。',
    options: ['正确', '错误'],
    answer: [0],
    explain: '网络充值属于消费行为，小学生没有自主消费权限，严禁私自充值打赏。',
  },
  {
    id: 'q4-4',
    levelId: 4,
    type: 'single',
    text: '当你遇到看不懂、不舒服、不良的网络内容时，正确的做法是？',
    options: ['默默观看', '模仿学习', '及时关闭并告诉家长老师'],
    answer: [2],
    explain: '遇到不良网络问题，不要独自处理，及时求助家长和老师是最安全的方式。',
  },
]

/** 按题号查题 */
export function getQuestion(id: string): Question {
  const q = QUESTIONS.find((x) => x.id === id)
  if (!q) throw new Error(`题库中找不到题目: ${id}`)
  return q
}

/** 洗牌（Fisher–Yates），返回新数组，不修改原数组 */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  // 简单伪随机即可，无需加密强度
  let s = Date.now() & 0xffff
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) % 0xffff) / 0xffff
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}