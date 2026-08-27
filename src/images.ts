// 题目配图解析：数据层只存 q{关}-{题} 前缀，不存扩展名。
// import.meta.glob 收集 assets/images/ 下所有 svg/png，按前缀匹配，png 优先。
// AI 精绘 PNG 同名前缀放入后即可自动替换，无需改代码。

// 注意：dev / build 下 glob 值形态不同——
// build 直接给 URL 字符串；dev 给模块命名空间对象(其 .default 才是 URL)。
// 统一归一为字符串，避免 dev 下把对象拼进模板报 "Cannot convert object to primitive value"。
const imageGlob = import.meta.glob('../assets/images/*.{svg,png}', {
  eager: true,
  query: '?url',
}) as Record<string, unknown>

// key 形如 "../assets/images/q1-1.svg"，取文件名(含扩展名)
const byFile = new Map<string, string>()
for (const [key, val] of Object.entries(imageGlob)) {
  const name = key.split('/').pop()?.toLowerCase() ?? ''
  const url = typeof val === 'string' ? val : ((val as { default?: string })?.default ?? '')
  byFile.set(name, url)
}

/**
 * 按题目前缀解析配图 url。
 * @param prefix 形如 'q1-1'，不含扩展名
 */
export function imageSrc(prefix: string): string {
  const svg = byFile.get(`${prefix}.svg`)
  const png = byFile.get(`${prefix}.png`)
  // png 优先（AI 精绘图），否则回退 svg
  return png ?? svg ?? ''
}